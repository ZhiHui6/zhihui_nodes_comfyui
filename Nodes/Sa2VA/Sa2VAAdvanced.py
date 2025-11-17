import torch
import numpy as np
import os
import gc
import threading
import time
import asyncio
from contextlib import nullcontext
from PIL import Image
try:
    from server import PromptServer
    from aiohttp import web
    _PS_OK = True
except Exception:
    PromptServer = None
    web = None
    _PS_OK = False
be_quiet = False

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SA2VA_CONFIG_PATH = os.path.join(_THIS_DIR, "sa2va_config.json")
_MODEL_MAP = {
    "Sa2VA-InternVL3-2B": "ByteDance/Sa2VA-InternVL3-2B",
    "Sa2VA-InternVL3-8B": "ByteDance/Sa2VA-InternVL3-8B",
    "Sa2VA-InternVL3-14B": "ByteDance/Sa2VA-InternVL3-14B",
    "Sa2VA-Qwen2_5-VL-3B": "ByteDance/Sa2VA-Qwen2_5-VL-3B",
    "Sa2VA-Qwen2_5-VL-7B": "ByteDance/Sa2VA-Qwen2_5-VL-7B",
    "Sa2VA-Qwen3-VL-4B": "ByteDance/Sa2VA-Qwen3-VL-4B",
}

def _normalize_model_name(name):
    try:
        s = str(name)
    except Exception:
        s = name
    if isinstance(s, str) and "/" in s:
        return s
    if isinstance(s, str):
        return _MODEL_MAP.get(s, s)
    return s

def _sa2va_default_config():
    return {
        "cache_dir": "",
        "provider": "huggingface",
        "hf_mirror_url": "https://hf-mirror.com",
        "use_default_cache": True,
    }

_SA2VA_PROGRESS = {
    "status": "idle",
    "downloaded_bytes": 0,
    "total_bytes": 0,
    "percent": 0.0,
    "speed_bps": 0.0,
    "started_at": 0.0,
}

_SA2VA_CANCELLED = False
_SA2VA_PAUSED = False

def _sa2va_load_config():
    try:
        if os.path.exists(_SA2VA_CONFIG_PATH):
            import json
            with open(_SA2VA_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            base = _sa2va_default_config()
            base.update(data if isinstance(data, dict) else {})
            return base
    except Exception:
        pass
    return _sa2va_default_config()

def _sa2va_save_config(cfg):
    return True

def _sa2va_default_cache_dir():
    try:
        import folder_paths
        ckpt_dirs = folder_paths.get_folder_paths("checkpoints")
        if ckpt_dirs:
            models_dir = os.path.dirname(ckpt_dirs[0])
            bd_dir = os.path.join(models_dir, "ByteDance")
            try:
                os.makedirs(bd_dir, exist_ok=True)
            except Exception:
                pass
            return bd_dir
    except Exception:
        pass
    root = _THIS_DIR
    try:
        for _ in range(5):
            root = os.path.dirname(root)
    except Exception:
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(_THIS_DIR)))))
    p = os.path.join(root, "models", "ByteDance")
    try:
        os.makedirs(p, exist_ok=True)
    except Exception:
        pass
    return p

def _sa2va_model_exists(model_name, cache_dir=""):
    try:
        mn = _normalize_model_name(model_name)
    except Exception:
        mn = model_name
    base_dir = _sa2va_default_cache_dir()
    try:
        dn = str(mn).split("/")[-1]
    except Exception:
        dn = str(mn)
    candidate = os.path.join(base_dir, dn)
    exists = os.path.isdir(candidate)
    if exists:
        try:
            model_files = []
            for root, dirs, files in os.walk(candidate):
                for file in files:
                    if file.endswith(('.bin', '.safetensors', '.ckpt', '.pt', '.onnx')):
                        model_files.append(file)
            if not model_files:
                exists = False
        except Exception:
            exists = False
    return exists, candidate

class Sa2VAAdvanced:
    def __init__(self):
        self.model = None
        self.processor = None
        self.current_model_name = None
        self._download_cancelled = False

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model_name": (
                    [
                        "Sa2VA-InternVL3-2B",
                        "Sa2VA-InternVL3-8B",
                        "Sa2VA-InternVL3-14B",
                        "Sa2VA-Qwen2_5-VL-3B",
                        "Sa2VA-Qwen2_5-VL-7B",
                        "Sa2VA-Qwen3-VL-4B",
                    ],
                    {"default": "Sa2VA-Qwen3-VL-4B"},
                ),
                "image": ("IMAGE",),
                "mask_threshold": (
                    "FLOAT",
                    {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.1},
                ),
                "quantization": (
                    ["not used", "4bit", "8bit"],
                    {"default": "not used"},
                ),
                "image_scaling": (
                    "FLOAT",
                    {"default": 0, "min": 0, "max": 2048, "step": 512},
                ),
                "use_flash_attn": (
                    "BOOLEAN",
                    {"default": False},
                ),
                "keep_model_loaded": (
                    "BOOLEAN",
                    {"default": False},
                ),
                "segmentation_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                    },
                ),
            },
            "optional": {
                "segmentation_preset": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": False,
                        "forceInput": True,
                    },
                ),
            },
        }

    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("image", "mask")
    FUNCTION = "process_with_sa2va"
    DESCRIPTION = "Image segmentation and visual analysis, supporting 4-bit / 8-bit quantization"
    CATEGORY = "Zhi.AI/Sa2VA"

    def check_transformers_version(self):
        """Check if transformers version supports Sa2VA models."""
        try:
            from transformers import __version__ as transformers_version

            version_parts = transformers_version.split(".")
            major, minor = int(version_parts[0]), int(version_parts[1])

            if major < 4 or (major == 4 and minor < 57):
                return (
                    False,
                    f"Sa2VA requires transformers >= 4.57.0, found {transformers_version}",
                )
            return True, transformers_version
        except Exception as e:
            return False, f"Error checking transformers version: {e}"

    def _setup_model_device_and_dtype(self, target_device, resolved_dtype, quantization, using_quant):
        if not using_quant:
            try:
                self.model = self.model.to(device=target_device)
                if (
                    hasattr(self.model, "dtype")
                    and self.model.dtype != resolved_dtype
                ):
                    try:
                        self.model = self.model.to(dtype=resolved_dtype)
                    except Exception as e:
                        if not be_quiet:
                            print(
                                f"   Note: Could not convert to {resolved_dtype}, keeping original dtype: {e}"
                            )
            except Exception as e:
                if not be_quiet:
                    print(f"   Warning: Model placement failed: {e}")

        if not be_quiet:
            if using_quant:
                print(
                    f"   Model loaded with {quantization} quantization on {target_device}"
                )
            else:
                actual_dtype = (
                    getattr(self.model, "dtype", "unknown")
                    if hasattr(self.model, "dtype")
                    else "unknown"
                )
                print(
                    f"   Model moved to {target_device} with dtype {actual_dtype}"
                )

    def install_transformers_upgrade(self):
        try:
            import subprocess
            import sys

            print("🔄 Attempting to upgrade transformers...")

            result = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "pip",
                    "install",
                    "transformers>=4.57.0",
                    "--upgrade",
                ],
                capture_output=True,
                text=True,
            )

            if result.returncode == 0:
                print("✅ Transformers upgraded successfully")
                print("🔄 Please restart ComfyUI to use the upgraded version")
                return True
            else:
                print(f"❌ Failed to upgrade transformers: {result.stderr}")
                return False

        except Exception as e:
            print(f"❌ Error upgrading transformers: {e}")
            return False

    def load_model(
        self,
        model_name,
        use_flash_attn=True,
        dtype="auto",
        cache_dir="",
        quantization="8bit",
    ):
        model_name = _normalize_model_name(model_name)
        if (
            self.model is None
            or self.processor is None
            or self.current_model_name != model_name
        ):

            if self.model is not None:
                try:
                    del self.model
                    self.model = None
                except:
                    pass
            if self.processor is not None:
                try:
                    del self.processor
                    self.processor = None
                except:
                    pass
            self.current_model_name = None


            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                if hasattr(torch.cuda, "ipc_collect"):
                    torch.cuda.ipc_collect()
            if not be_quiet:
                print(f"🔄 Loading Sa2VA Model: {model_name}")


            version_ok, version_info = self.check_transformers_version()
            if not version_ok:
                print(f"❌ {version_info}")
                print("💡 Attempting automatic upgrade...")

                if self.install_transformers_upgrade():
                    print("⚠️  Restart ComfyUI required for the upgrade to take effect")
                    return False
                else:
                    print(
                        "💡 Manual upgrade required: pip install transformers>=4.57.0 --upgrade"
                    )
                    return False

            effective_cache_dir = _sa2va_default_cache_dir()
            if not be_quiet:
                print(f"   Using default cache directory: {effective_cache_dir}")

            auto_selected = False
            if dtype == "auto":
                auto_selected = True
                if torch.cuda.is_available():
                    if (
                        hasattr(torch.cuda, "is_bf16_supported")
                        and torch.cuda.is_bf16_supported()
                    ):
                        resolved_dtype = torch.bfloat16
                    else:
                        resolved_dtype = torch.float16
                else:
                    resolved_dtype = torch.float32
                if not be_quiet:
                    print(
                        f"   Auto-selected dtype: {resolved_dtype} (based on device capabilities)"
                    )
            else:
                dtype_map = {
                    "float32": torch.float32,
                    "float16": torch.float16,
                    "bfloat16": torch.bfloat16,
                }
                resolved_dtype = dtype_map.get(str(dtype), torch.float32)
                if not be_quiet:
                    print(f"   Target dtype for model: {resolved_dtype}")

            try:
                from transformers import AutoProcessor, AutoModel

                model_kwargs = {
                    "low_cpu_mem_usage": True,
                    "trust_remote_code": True,
                }

                if effective_cache_dir:
                    model_kwargs["cache_dir"] = effective_cache_dir

                using_quant = quantization in {"4bit", "8bit"}
                if using_quant:
                    try:
                        import bitsandbytes as bnb
                        from transformers import BitsAndBytesConfig

                        if quantization == "8bit":
                            quantization_config = BitsAndBytesConfig(
                                load_in_8bit=True,
                                llm_int8_enable_fp32_cpu_offload=True,
                            )
                        else:
                            quantization_config = BitsAndBytesConfig(
                                load_in_4bit=True,
                                bnb_4bit_use_double_quant=True,
                                bnb_4bit_quant_type="nf4",
                            )
                        model_kwargs["quantization_config"] = quantization_config
                        if not be_quiet:
                            print(f"   Using {quantization} quantization with bitsandbytes")
                    except ImportError:
                        if not be_quiet:
                            print("   Warning: bitsandbytes not available, skipping quantization")
                            print("   Install with: pip install bitsandbytes")

                if use_flash_attn:
                    try:
                        import flash_attn

                        model_kwargs["use_flash_attn"] = True
                        if not be_quiet:
                            print("   Using Flash Attention")
                    except ImportError:
                        if not be_quiet:
                            print(
                                "   Flash Attention not available, continuing without it"
                            )
                            print("   Install with: pip install flash-attn")
                else:
                    if not be_quiet:
                        print("   Flash Attention disabled by user")

                if resolved_dtype is not None and not using_quant:
                    model_kwargs["torch_dtype"] = resolved_dtype

                print("🔄 Starting model download/load...")
                print("   Note: Large models may take several minutes to download")

                def is_cancelled():
                    try:
                        import execution

                        return (
                            execution.current_task is not None
                            and execution.current_task.cancelled
                        )
                    except:
                        try:
                            import model_management

                            return model_management.processing_interrupted()
                        except:
                            return False

                local_dir = None
                try_dir_base = effective_cache_dir if effective_cache_dir else _sa2va_default_cache_dir()
                try:
                    dn = str(model_name).split("/")[-1]
                except Exception:
                    dn = str(model_name)
                candidate_dir = os.path.join(try_dir_base, dn)
                if os.path.isdir(candidate_dir):
                    local_dir = candidate_dir
                
                try:
                    from huggingface_hub import HfApi, snapshot_download
                    from huggingface_hub.utils import tqdm as hub_tqdm

                    try:
                        api = HfApi()
                        info = api.repo_info(
                            model_name, repo_type="model", files_metadata=True
                        )
                        sizes = []
                        file_entries = []
                        for s in getattr(info, "siblings", []):
                            sz = getattr(s, "size", None)
                            if sz is None:
                                lfs = getattr(s, "lfs", None)
                                sz = (
                                    getattr(lfs, "size", None)
                                    if lfs is not None
                                    else None
                                )
                            if isinstance(sz, int) and sz > 0:
                                sizes.append(sz)
                                file_entries.append(
                                    (
                                        getattr(
                                            s, "rfilename", getattr(s, "path", "file")
                                        ),
                                        sz,
                                    )
                                )
                        total_bytes = sum(sizes)
                        if total_bytes > 0:
                            gb = total_bytes / (1024**3)
                            print(
                                f"   Estimated total download size: {gb:.2f} GB across {len(sizes)} files"
                            )
                            largest = sorted(
                                file_entries, key=lambda x: x[1], reverse=True
                            )[:5]
                            if largest:
                                print("   Largest files:")
                                for name, sz in largest:
                                    print(f"     • {name}: {sz / (1024**2):.1f} MB")
                    except Exception as e:
                        if not be_quiet:
                            print(f"   Could not determine repo size: {e}")

                    class CancellableTqdm(hub_tqdm):
                        def update(self, n=1):
                            if is_cancelled():
                                raise KeyboardInterrupt("Download cancelled by user")
                            return super().update(n)

                    cfg = _sa2va_load_config()
                    provider = cfg.get("provider", "huggingface")
                    if local_dir is None and provider == "modelscope":
                        try:
                            from modelscope.hub.snapshot_download import snapshot_download as ms_snapshot_download
                            local_dir = ms_snapshot_download(
                                model_name,
                                cache_dir=effective_cache_dir if effective_cache_dir else None,
                            )
                        except Exception as _e:
                            if not be_quiet:
                                print(f"   ModelScope download failed: {_e}")
                            local_dir = snapshot_download(
                                repo_id=model_name,
                                cache_dir=effective_cache_dir if effective_cache_dir else None,
                                resume_download=True,
                                local_files_only=False,
                                tqdm_class=CancellableTqdm,
                            )
                    elif local_dir is None:
                        if provider == "hf-mirror":
                            mirror = cfg.get("hf_mirror_url", "https://hf-mirror.com")
                            os.environ["HF_ENDPOINT"] = mirror
                        else:
                            if "HF_ENDPOINT" in os.environ:
                                os.environ.pop("HF_ENDPOINT", None)
                        local_dir = snapshot_download(
                            repo_id=model_name,
                            cache_dir=effective_cache_dir if effective_cache_dir else None,
                            resume_download=True,
                            local_files_only=False,
                            tqdm_class=CancellableTqdm,
                        )

                    model_kwargs_local = dict(model_kwargs)
                    model_kwargs_local["local_files_only"] = True
                    model_kwargs_local.pop("cache_dir", None)
                    self.model = AutoModel.from_pretrained(
                        local_dir, **model_kwargs_local
                    ).eval()
                    print("✅ Model files downloaded and loaded from cache")

                except KeyboardInterrupt:
                    print("\n⚠️ Model download was cancelled")
                    return False
                except Exception as e:
                    if not be_quiet:
                        print(f"   Enhanced download failed: {e}")
                        print("   Trying to load from local cache...")
                    
                    try:
                        model_kwargs_local = dict(model_kwargs)
                        model_kwargs_local["local_files_only"] = True
                        self.model = AutoModel.from_pretrained(
                            model_name, **model_kwargs_local
                        ).eval()
                        if not be_quiet:
                            print("✅ Model loaded successfully from local cache")
                    except Exception as local_e:
                        if not be_quiet:
                            print(f"   Local cache loading failed: {local_e}")
                            print("   Attempting standard download...")
                        self.model = AutoModel.from_pretrained(
                            model_name, **model_kwargs
                        ).eval()

                target_device = (
                    torch.device("cuda")
                    if torch.cuda.is_available()
                    else torch.device("cpu")
                )

                if not using_quant:
                    try:
                        self.model = self.model.to(device=target_device)
                        if (
                            hasattr(self.model, "dtype")
                            and self.model.dtype != resolved_dtype
                        ):
                            try:
                                self.model = self.model.to(dtype=resolved_dtype)
                            except Exception as e:
                                if not be_quiet:
                                    print(
                                        f"   Note: Could not convert to {resolved_dtype}, keeping original dtype: {e}"
                                    )
                    except Exception as e:
                        if not be_quiet:
                            print(f"   Warning: Model placement failed: {e}")

                if not be_quiet:
                    if using_quant:
                        print(
                            f"   Model loaded with {quantization} quantization on {target_device}"
                        )
                    else:
                        actual_dtype = (
                            getattr(self.model, "dtype", "unknown")
                            if hasattr(self.model, "dtype")
                            else "unknown"
                        )
                        print(
                            f"   Model moved to {target_device} with dtype {actual_dtype}"
                        )

                processor_kwargs = {"trust_remote_code": True, "use_fast": False}
                if effective_cache_dir:
                    processor_kwargs["cache_dir"] = effective_cache_dir

                processor_source = local_dir if "local_dir" in locals() else model_name
                self.processor = AutoProcessor.from_pretrained(
                    processor_source, **processor_kwargs
                )

                self.current_model_name = model_name

                self._setup_model_device_and_dtype(target_device, resolved_dtype, quantization, using_quant)
                
                if not be_quiet:
                    print(f"✅ Sa2VA Model Successfully Loaded: {model_name}")

            except ImportError as e:
                error_str = str(e)
                if "flash_attn" in error_str:
                    print(f"❌ Flash Attention dependency missing: {e}")
                    print("💡 Retrying model load without Flash Attention...")
                    model_kwargs.pop("use_flash_attn", None)
                    try:
                        self.model = AutoModel.from_pretrained(
                            model_name, **model_kwargs
                        ).eval()
                        print("✅ Model loaded successfully without Flash Attention")
                    except Exception as retry_e:
                        print(
                            f"❌ Model loading failed even without Flash Attention: {retry_e}"
                        )
                        return False
                else:
                    print(f"❌ Missing dependencies for Sa2VA model: {e}")
                    print("💡 Try installing: pip install transformers>=4.57.0")
                    return False
            except Exception as e:
                return self._handle_model_load_error(e, model_name)

        return True

    def _handle_model_load_error(self, error, model_name, context=None):
        print(f"❌ Error loading Sa2VA model {model_name}: {error}")
        
        error_str = str(error).lower()
        
        if "qwen_vl_utils" in error_str:
            print("💡 Missing qwen_vl_utils dependency")
            print("   Install it with: pip install qwen_vl_utils")
        elif "qwen3_vl" in error_str:
            print("💡 This error suggests your transformers version doesn't support Qwen3-VL")
            print("   Try upgrading: pip install transformers>=4.57.0")
        elif "trust_remote_code" in error_str:
            print("💡 This model requires trust_remote_code=True (enabled by default)")
        
        return False

    def _prepare_prompt(self, text_prompt, segmentation_mode=False, segmentation_prompt=""):
        return (
            segmentation_prompt
            if segmentation_mode and segmentation_prompt
            else text_prompt
        )

    def _handle_processing_error(self, error, context=""):
        error_msg = f"Error {context}: {error}" if context else f"Error: {error}"
        print(f"❌ {error_msg}")
        return error_msg, []

    def process_single_image(
        self, image, text_prompt, segmentation_mode=False, segmentation_prompt=""
    ):
        try:
            prompt = self._prepare_prompt(text_prompt, segmentation_mode, segmentation_prompt)

            if isinstance(image, str) and os.path.exists(image):
                image = Image.open(image).convert("RGB")
            elif not isinstance(image, Image.Image):
                if hasattr(image, "numpy"):
                    image_np = image.numpy()
                elif isinstance(image, np.ndarray):
                    image_np = image
                else:
                    print(f"⚠️ Unsupported image type: {type(image)}")
                    return "Error: Unsupported image format", []

                if image_np.dtype != np.uint8:
                    image_np = (image_np * 255).astype(np.uint8)
                if len(image_np.shape) == 3 and image_np.shape[0] in [1, 3]:
                    image_np = np.transpose(image_np, (1, 2, 0))
                image = Image.fromarray(image_np)

            input_dict = {
                "image": image,
                "text": f"<image>{prompt}",
                "past_text": "",
                "mask_prompts": None,
                "processor": self.processor,
            }

            with torch.no_grad():
                return_dict = self.model.predict_forward(**input_dict)

            masks = return_dict.get("prediction_masks", [])

            return masks

        except Exception as e:
            return self._handle_processing_error(e, "processing image")

    def process_video_frames(
        self,
        frame_paths,
        text_prompt,
        segmentation_mode=False,
        segmentation_prompt="",
        max_frames=5,
    ):

        try:
            if len(frame_paths) > max_frames:
                step = max(1, (len(frame_paths) - 1) // (max_frames - 1))
                sampled_paths = (
                    [frame_paths[0]] + frame_paths[1:-1][::step] + [frame_paths[-1]]
                )
                frame_paths = sampled_paths[:max_frames]

            prompt = self._prepare_prompt(text_prompt, segmentation_mode, segmentation_prompt)

            input_dict = {
                "video": frame_paths,
                "text": f"<image>{prompt}",
                "past_text": "",
                "mask_prompts": None,
                "processor": self.processor,
            }

            with torch.no_grad():
                return_dict = self.model.predict_forward(**input_dict)

            masks = return_dict.get("prediction_masks", [])

            return masks

        except Exception as e:
            return self._handle_processing_error(e, "processing video frames")

    def convert_masks_to_comfyui(
        self,
        masks,
        input_height,
        input_width,
        output_format="both",
        normalize=True,
        threshold=0.5,
        apply_threshold=False,
        batchify_mask=True,
    ):

        try:
            if masks is None or len(masks) == 0:
                if not be_quiet:
                    print("⚠️ No masks to convert, creating blank mask")
                empty_mask = (
                    torch.zeros((1, input_height, input_width), dtype=torch.float32)
                    if batchify_mask
                    else torch.zeros((input_height, input_width), dtype=torch.float32)
                )
                empty_image = torch.zeros(
                    (1, input_height, input_width, 3), dtype=torch.float32
                )
                return empty_mask, empty_image

            comfyui_masks = []
            image_tensors = []

            for i, mask in enumerate(masks):
                if mask is None:
                    continue

                try:
                    if isinstance(mask, torch.Tensor):
                        mask_np = mask.detach().cpu().numpy()
                    elif isinstance(mask, np.ndarray):
                        mask_np = mask.copy()
                    elif isinstance(mask, (list, tuple)):
                        mask_np = np.array(mask)
                    else:
                        continue

                    if len(mask_np.shape) == 4:
                        mask_np = mask_np[0, 0]
                    elif len(mask_np.shape) == 3:
                        if mask_np.shape[0] == 1:
                            mask_np = mask_np[0]
                        elif mask_np.shape[2] == 1:
                            mask_np = mask_np[:, :, 0]
                        elif (
                            mask_np.shape[0] < mask_np.shape[1]
                            and mask_np.shape[0] < mask_np.shape[2]
                        ):
                            mask_np = mask_np[0]
                        else:
                            mask_np = mask_np[:, :, 0]

                    if len(mask_np.shape) != 2:
                        continue

                    if mask_np.size == 0:
                        continue

                    if mask_np.dtype == bool:
                        mask_np = mask_np.astype(np.float32)
                    elif not np.issubdtype(mask_np.dtype, np.floating):
                        mask_np = mask_np.astype(np.float32)

                    if np.any(np.isnan(mask_np)) or np.any(np.isinf(mask_np)):
                        mask_np = np.nan_to_num(
                            mask_np, nan=0.0, posinf=1.0, neginf=0.0
                        )

                    if normalize:
                        mask_min, mask_max = mask_np.min(), mask_np.max()
                        if mask_max > mask_min:
                            mask_np = (mask_np - mask_min) / (mask_max - mask_min)
                        else:
                            mask_np = (
                                np.ones_like(mask_np)
                                if mask_min > 0
                                else np.zeros_like(mask_np)
                            )

                    if apply_threshold:
                        mask_np = (mask_np > threshold).astype(np.float32)

                    if output_format in ["comfyui_mask", "both"]:
                        comfyui_mask = torch.from_numpy(mask_np).float()
                        while comfyui_mask.ndim > 2:
                            comfyui_mask = comfyui_mask.squeeze(0)
                        if comfyui_mask.ndim == 2:
                            comfyui_masks.append(comfyui_mask)

                    rgb_np = np.stack([mask_np, mask_np, mask_np], axis=-1)
                    rgb_np = np.clip(rgb_np, 0.0, 1.0).astype(np.float32)
                    image_tensors.append(torch.from_numpy(rgb_np))

                except Exception as e:
                    if not be_quiet:
                        print(f"❌ Error processing mask {i}: {e}")
                    continue

            if not comfyui_masks:
                empty_mask = (
                    torch.zeros((1, input_height, input_width), dtype=torch.float32)
                    if batchify_mask
                    else torch.zeros((input_height, input_width), dtype=torch.float32)
                )
                empty_image = torch.zeros(
                    (1, input_height, input_width, 3), dtype=torch.float32
                )
                return empty_mask, empty_image

            final_comfyui_masks = None
            if comfyui_masks:
                try:
                    masks_2d = []
                    for m in comfyui_masks:
                        while m.ndim > 2:
                            m = m.squeeze(0)
                        if m.ndim == 2:
                            masks_2d.append(m.float())

                    if not masks_2d:
                        final_comfyui_masks = (
                            torch.zeros(
                                (1, input_height, input_width), dtype=torch.float32
                            )
                            if batchify_mask
                            else torch.zeros(
                                (input_height, input_width), dtype=torch.float32
                            )
                        )
                    else:
                        if batchify_mask:
                            first_hw = masks_2d[0].shape
                            aligned = [t for t in masks_2d if t.shape == first_hw]
                            final_comfyui_masks = (
                                torch.stack(aligned, dim=0).float()
                                if aligned
                                else torch.zeros(
                                    (1, input_height, input_width), dtype=torch.float32
                                )
                            )
                        else:
                            final_comfyui_masks = masks_2d[0]
                except Exception as e:
                    if not be_quiet:
                        print(f"⚠️ Error processing ComfyUI masks: {e}")
                    final_comfyui_masks = (
                        torch.zeros((1, input_height, input_width), dtype=torch.float32)
                        if batchify_mask
                        else torch.zeros(
                            (input_height, input_width), dtype=torch.float32
                        )
                    )
            else:
                final_comfyui_masks = (
                    torch.zeros((1, input_height, input_width), dtype=torch.float32)
                    if batchify_mask
                    else torch.zeros((input_height, input_width), dtype=torch.float32)
                )

            if image_tensors:
                try:
                    first_hw = image_tensors[0].shape[:2]
                    aligned = [t for t in image_tensors if t.shape[:2] == first_hw]
                    if not aligned:
                        final_image_tensor = torch.zeros(
                            (1, input_height, input_width, 3), dtype=torch.float32
                        )
                    else:
                        final_image_tensor = torch.stack(aligned, dim=0).float()
                except Exception as e:
                    if not be_quiet:
                        print(f"⚠️ Error stacking IMAGE tensors: {e}")
                    final_image_tensor = torch.zeros(
                        (1, input_height, input_width, 3), dtype=torch.float32
                    )
            else:
                final_image_tensor = torch.zeros(
                    (1, input_height, input_width, 3), dtype=torch.float32
                )

            return final_comfyui_masks, final_image_tensor

        except Exception as e:
            if not be_quiet:
                print(f"❌ Error converting masks: {e}")
            empty_mask = (
                torch.zeros((1, input_height, input_width), dtype=torch.float32)
                if batchify_mask
                else torch.zeros((input_height, input_width), dtype=torch.float32)
            )
            return empty_mask, torch.zeros((1, input_height, input_width, 3), dtype=torch.float32)

    def process_with_sa2va(
        self,
        model_name,
        image,
        mask_threshold,
        segmentation_prompt,
        quantization,
        use_flash_attn,
        keep_model_loaded,
        segmentation_preset=None,
        image_scaling="",
    ):

        text_prompt = "Please describe the image."
        segmentation_mode = True
        video_mode = False
        max_frames = 5
        dtype = "auto"
        use_inference_mode = True
        use_autocast = True
        autocast_dtype = "bfloat16"
        free_gpu_after = True
        unload_model_after = not keep_model_loaded
        offload_to_cpu = False
        offload_input_to_cpu = True
        cache_dir = ""
        output_mask_format = "both"
        normalize_masks = True
        apply_mask_threshold = False
        batchify_mask = True

        try:

            exists, expected_path = _sa2va_model_exists(model_name, cache_dir)
            if not exists:
                msg = f"Sa2VA模型未下载：{_normalize_model_name(model_name)}。请在设置中下载或确认路径。目标目录：{expected_path}"
                print(f"❌ {msg}")
                raise RuntimeError(msg)

            model_loaded = self.load_model(
                model_name, use_flash_attn, dtype, cache_dir, quantization
            )
            if not model_loaded:
                error_msg = f"Failed to load Sa2VA model: {model_name}. Check console for details."
                print(f"❌ {error_msg}")
                return (torch.zeros((1, 64, 64, 3), dtype=torch.float32), torch.zeros((1, 64, 64), dtype=torch.float32))

            if image is None:
                error_msg = "No image provided"
                print(f"⚠️ {error_msg}")
                return (torch.zeros((1, 64, 64, 3), dtype=torch.float32), torch.zeros((1, 64, 64), dtype=torch.float32))

            if not be_quiet:
                print(f"🔄 Processing image | Segmentation: {segmentation_mode}")

            if hasattr(image, "shape") and len(image.shape) == 4:
                img_t = image[0]
            elif hasattr(image, "shape") and len(image.shape) == 3:
                img_t = image
            else:
                error_msg = f"Unsupported image format: {type(image)}"
                print(f"❌ {error_msg}")
                return (torch.zeros((1, 64, 64, 3), dtype=torch.float32), torch.zeros((1, 64, 64), dtype=torch.float32))

            if isinstance(img_t, torch.Tensor):
                try:
                    if offload_input_to_cpu and img_t.is_cuda:
                        img_cpu = img_t.detach().to("cpu")
                        del img_t
                        if torch.cuda.is_available():
                            torch.cuda.empty_cache()
                            if hasattr(torch.cuda, "ipc_collect"):
                                torch.cuda.ipc_collect()
                        img_t = img_cpu
                    else:
                        img_t = img_t.detach().cpu()
                except Exception:
                    img_t = img_t.cpu()
                image_np = img_t.numpy()
                del img_t
            else:
                error_msg = f"Unsupported image tensor type: {type(image)}"
                print(f"❌ {error_msg}")
                return (torch.zeros((1, 64, 64, 3), dtype=torch.float32), torch.zeros((1, 64, 64), dtype=torch.float32))

            if image_np.dtype != "uint8":
                image_np = (image_np * 255).astype("uint8")

            try:
                _tmp_val = int(image_scaling or 0)
            except Exception:
                _tmp_val = 0
            target_le = _tmp_val if (512 <= _tmp_val <= 2048) else 0

            if target_le and target_le > 0:
                _h, _w = int(image_np.shape[0]), int(image_np.shape[1])
                cur_le = max(_h, _w)
                if target_le < cur_le:
                    scale = float(target_le) / float(cur_le)
                    new_w = max(1, int(round(_w * scale)))
                    new_h = max(1, int(round(_h * scale)))
                    pil_image = Image.fromarray(image_np).resize((new_w, new_h), Image.Resampling.LANCZOS)
                    image_np = np.array(pil_image)
                else:
                    pil_image = Image.fromarray(image_np)
            else:
                pil_image = Image.fromarray(image_np)

            device = "cuda" if torch.cuda.is_available() else "cpu"
            if use_autocast and device == "cuda":
                if autocast_dtype == "float16":
                    _amp_dtype = torch.float16
                elif autocast_dtype == "bfloat16" or autocast_dtype == "auto":
                    _amp_dtype = torch.bfloat16
                else:
                    _amp_dtype = torch.bfloat16
                autocast_ctx = torch.cuda.amp.autocast(dtype=_amp_dtype)
            else:
                autocast_ctx = nullcontext()

            inference_ctx = (
                torch.inference_mode() if use_inference_mode else nullcontext()
            )

            with inference_ctx:
                with autocast_ctx:
                    effective_segmentation_prompt = (
                        segmentation_preset if (segmentation_preset and str(segmentation_preset).strip()) else segmentation_prompt
                    )
                    masks = self.process_single_image(
                        pil_image, text_prompt, segmentation_mode, effective_segmentation_prompt
                    )

            all_masks = masks if masks else []

            h, w = int(image_np.shape[0]), int(image_np.shape[1])

            if segmentation_mode and len(all_masks) == 0:
                blank_mask = np.zeros((h, w), dtype=np.float32)
                all_masks = [blank_mask]

            comfyui_masks, _ = self.convert_masks_to_comfyui(
                all_masks,
                h,
                w,
                output_mask_format,
                normalize_masks,
                mask_threshold,
                apply_mask_threshold,
                batchify_mask,
            )

            if not be_quiet:
                print(
                    f"✅ Sa2VA Processing Complete: {len(all_masks)} masks"
                )
                if dtype != "auto":
                    print(f"   Note: Model converted from native precision to {dtype}")
                if comfyui_masks is not None:
                    print(f"   ComfyUI mask shape: {comfyui_masks.shape}")

            try:
                if torch.cuda.is_available():
                    if free_gpu_after:
                        torch.cuda.empty_cache()
                        if hasattr(torch.cuda, "ipc_collect"):
                            torch.cuda.ipc_collect()
                    if unload_model_after:
                        if offload_to_cpu and self.model is not None:
                            try:
                                self.model = self.model.cpu()
                                for param in self.model.parameters():
                                    param.data = param.data.cpu()
                                for buffer in self.model.buffers():
                                    buffer.data = buffer.data.cpu()
                                if not be_quiet:
                                    print("   Model offloaded to CPU")
                            except Exception as _e:
                                if not be_quiet:
                                    print(f"   Offload to CPU failed: {_e}")
                                try:
                                    del self.model
                                except:
                                    pass
                                self.model = None
                                self.processor = None
                                self.current_model_name = None
                        else:
                            try:
                                del self.model
                            except:
                                pass
                            try:
                                del self.processor
                            except:
                                pass
                            self.model = None
                            self.processor = None
                            self.current_model_name = None
                            if not be_quiet:
                                print("   Model unloaded")
                        torch.cuda.empty_cache()
                        if hasattr(torch.cuda, "ipc_collect"):
                            torch.cuda.ipc_collect()
                gc.collect()
            except Exception as _e:
                if not be_quiet:
                    print(f"⚠️ Memory management step encountered an issue: {_e}")

            try:
                if len(image_np.shape) == 2:
                    rgb_np = np.stack([image_np, image_np, image_np], axis=-1)
                elif image_np.shape[-1] == 1:
                    rgb_np = np.concatenate([image_np, image_np, image_np], axis=-1)
                else:
                    rgb_np = image_np
                img_float = torch.from_numpy((rgb_np.astype("float32") / 255.0))
                image_batch = img_float.unsqueeze(0)
            except Exception:
                image_batch = torch.zeros((1, h, w, 3), dtype=torch.float32)

            return (image_batch, comfyui_masks)

        except RuntimeError as e:
            raise
        except Exception as e:
            error_msg = f"Sa2VA processing failed: {e}"
            print(f"❌ {error_msg}")
            import traceback

            traceback.print_exc()

            try:
                if hasattr(image, "shape") and len(image.shape) >= 2:
                    if len(image.shape) == 4:
                        fb_h, fb_w = image.shape[1], image.shape[2]
                    elif len(image.shape) == 3:
                        fb_h, fb_w = image.shape[0], image.shape[1]
                    else:
                        fb_h, fb_w = 64, 64
                else:
                    fb_h, fb_w = 64, 64
            except:
                fb_h, fb_w = 64, 64

            empty_mask = (
                torch.zeros((1, fb_h, fb_w), dtype=torch.float32)
                if batchify_mask
                else torch.zeros((fb_h, fb_w), dtype=torch.float32)
            )
            empty_image = torch.zeros((1, fb_h, fb_w, 3), dtype=torch.float32)
            return (empty_image, empty_mask)

if _PS_OK:
    @PromptServer.instance.routes.get("/zhihui_nodes/sa2va/config")
    async def sa2va_get_config(request):
        try:
            cfg = _sa2va_load_config()
            cfg["default_cache_dir"] = _sa2va_default_cache_dir()
            return web.json_response(cfg)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/sa2va/progress")
    async def sa2va_get_progress(request):
        try:
            st = dict(_SA2VA_PROGRESS)
            if st.get("status") == "downloading":
                mon = st.get("monitor_dir")
                if mon and os.path.isdir(mon):
                    downloaded = 0
                    for root, _dirs, files in os.walk(mon):
                        for f in files:
                            fp = os.path.join(root, f)
                            try:
                                downloaded += os.path.getsize(fp)
                            except Exception:
                                pass
                    st["downloaded_bytes"] = downloaded
                    total = int(st.get("total_bytes", 0) or 0)
                    if total > 0:
                        st["percent"] = min(100.0, (downloaded * 100.0) / total)
                    started_at = _SA2VA_PROGRESS.get("started_at")
                    if started_at:
                        dt = max(1e-6, time.time() - float(started_at))
                        st["speed_bps"] = downloaded / dt
            return web.json_response(st)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/sa2va/check_model")
    async def sa2va_check_model(request):
        try:
            q = request.rel_url.query
            model_name = _normalize_model_name(q.get("model", ""))
            base_dir = _sa2va_default_cache_dir()
            try:
                dn = str(model_name).split("/")[-1]
            except Exception:
                dn = str(model_name)
            candidate = os.path.join(base_dir, dn)
            exists = os.path.isdir(candidate)
            return web.json_response({"exists": exists, "path": candidate})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/sa2va/config")
    async def sa2va_set_config(request):
        try:
            data = await request.json()
            cfg = _sa2va_load_config()
            if isinstance(data, dict):
                for k in ["provider", "hf_mirror_url"]:
                    if k in data:
                        cfg[k] = data[k]
            ok = _sa2va_save_config(cfg)
            if ok:
                return web.json_response({"success": True})
            return web.json_response({"success": False}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/sa2va/download")
    async def sa2va_download(request):
        try:
            data = await request.json()
            model_name = _normalize_model_name(data.get("model_name"))
            provider = data.get("provider")
            cfg = _sa2va_load_config()
            if provider:
                cfg["provider"] = provider
            _sa2va_save_config(cfg)
            import tempfile, shutil
            repo_id = model_name
            display_name = repo_id.split("/")[-1] if isinstance(repo_id, str) else "Sa2VAModel"
            base_dir = _sa2va_default_cache_dir()
            target_dir = os.path.join(base_dir, display_name)
            if os.path.isdir(target_dir):
                try:
                    exists_nonempty = False
                    for _r, _d, files in os.walk(target_dir):
                        if files:
                            exists_nonempty = True
                            break
                    if exists_nonempty:
                        return web.json_response({"error": "模型已存在，请先删除后再下载"}, status=400)
                except Exception:
                    return web.json_response({"error": "模型已存在，请先删除后再下载"}, status=400)
            try:
                os.makedirs(target_dir, exist_ok=True)
            except Exception:
                pass

            def do_download():
                global _SA2VA_CANCELLED, _SA2VA_PAUSED
                _SA2VA_CANCELLED = False
                _SA2VA_PAUSED = False
                local_dir = None
                try:
                    from huggingface_hub import snapshot_download, HfApi
                    from huggingface_hub.utils import tqdm as hub_tqdm
                    _SA2VA_PROGRESS.update({
                        "status": "downloading",
                        "downloaded_bytes": 0,
                        "total_bytes": 0,
                        "percent": 0.0,
                        "speed_bps": 0.0,
                        "started_at": time.time(),
                    })
                    try:
                        api = HfApi()
                        info = api.repo_info(model_name, repo_type="model", files_metadata=True)
                        sizes = []
                        for s in getattr(info, "siblings", []):
                            sz = getattr(s, "size", None)
                            if sz is None:
                                lfs = getattr(s, "lfs", None)
                                sz = getattr(lfs, "size", None) if lfs is not None else None
                            if isinstance(sz, int) and sz > 0:
                                sizes.append(sz)
                        _SA2VA_PROGRESS["total_bytes"] = sum(sizes)
                    except Exception:
                        pass

                    class ProgressTqdm(hub_tqdm):
                        def update(self, n=1):
                            if _SA2VA_CANCELLED:
                                raise KeyboardInterrupt("cancelled")
                            try:
                                dt = max(1e-6, time.time() - float(_SA2VA_PROGRESS.get("started_at", time.time())))
                                total = int(_SA2VA_PROGRESS.get("total_bytes", 0) or 0)
                                mon = _SA2VA_PROGRESS.get("monitor_dir")
                                if mon and os.path.isdir(mon):
                                    done = 0
                                    for root, _dirs, files in os.walk(mon):
                                        for f in files:
                                            fp = os.path.join(root, f)
                                            try:
                                                done += os.path.getsize(fp)
                                            except Exception:
                                                pass
                                    _SA2VA_PROGRESS["downloaded_bytes"] = done
                                    if total > 0:
                                        _SA2VA_PROGRESS["percent"] = min(100.0, (done * 100.0) / total)
                                    _SA2VA_PROGRESS["speed_bps"] = done / dt
                            except Exception:
                                pass
                            return super().update(n)

                    temp_cache = tempfile.mkdtemp(prefix="sa2va_cache_")
                    _SA2VA_PROGRESS["monitor_dir"] = temp_cache
                    try:
                        if cfg.get("provider") == "modelscope":
                            from modelscope.hub.snapshot_download import snapshot_download as ms_snapshot_download
                            dl_dir = ms_snapshot_download(repo_id, cache_dir=temp_cache)
                            try:
                                if _SA2VA_PROGRESS.get("total_bytes", 0) <= 0:
                                    total = 0
                                    for root, _dirs, files in os.walk(dl_dir):
                                        for f in files:
                                            fp = os.path.join(root, f)
                                            try:
                                                total += os.path.getsize(fp)
                                            except Exception:
                                                pass
                                    _SA2VA_PROGRESS["total_bytes"] = total
                                if os.path.isdir(dl_dir):
                                    if os.path.abspath(dl_dir) != os.path.abspath(target_dir):
                                        shutil.copytree(dl_dir, target_dir, dirs_exist_ok=True)
                                    local_dir = target_dir
                            except Exception as _e:
                                raise _e
                        else:
                            if cfg.get("provider") == "hf-mirror":
                                mirror = cfg.get("hf_mirror_url", "https://hf-mirror.com")
                                os.environ["HF_ENDPOINT"] = mirror
                            else:
                                if "HF_ENDPOINT" in os.environ:
                                    os.environ.pop("HF_ENDPOINT", None)
                            try:
                                snapshot_download(
                                    repo_id=repo_id,
                                    cache_dir=temp_cache,
                                    resume_download=True,
                                    local_dir=target_dir,
                                    local_dir_use_symlinks=False,
                                    tqdm_class=ProgressTqdm,
                                )
                                local_dir = target_dir
                            except TypeError:
                                dl_dir = snapshot_download(repo_id=repo_id, cache_dir=temp_cache, resume_download=True)
                                if os.path.isdir(dl_dir):
                                    if os.path.abspath(dl_dir) != os.path.abspath(target_dir):
                                        shutil.copytree(dl_dir, target_dir, dirs_exist_ok=True)
                                    local_dir = target_dir
                    finally:
                        try:
                            shutil.rmtree(temp_cache, ignore_errors=True)
                        except Exception:
                            pass

                    try:
                        _SA2VA_PROGRESS.update({"status": "done", "percent": 100.0})
                        _SA2VA_PROGRESS.pop("monitor_dir", None)
                    except Exception:
                        pass
                    return {"success": True, "local_dir": local_dir or target_dir}
                except KeyboardInterrupt:
                    try:
                        if _SA2VA_PAUSED:
                            _SA2VA_PROGRESS.update({"status": "paused"})
                            return {"paused": True}
                        else:
                            _SA2VA_PROGRESS.update({"status": "stopped"})
                            return {"stopped": True}
                    except Exception:
                        return {"stopped": True}
                except Exception as e:
                    try:
                        _SA2VA_PROGRESS.update({"status": "error"})
                    except Exception:
                        pass
                    return {"error": str(e)}

            result = await asyncio.to_thread(do_download)
            if result.get("error"):
                return web.json_response({"error": result["error"]}, status=500)
            return web.json_response(result)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/sa2va/control")
    async def sa2va_control(request):
        try:
            global _SA2VA_CANCELLED, _SA2VA_PAUSED
            data = await request.json()
            action = str(data.get("action") or "").strip().lower()
            if action == "pause":
                _SA2VA_PAUSED = True
                _SA2VA_CANCELLED = True
                return web.json_response({"success": True, "status": "paused"})
            elif action == "stop":
                _SA2VA_PAUSED = False
                _SA2VA_CANCELLED = True
                return web.json_response({"success": True, "status": "stopped"})
            elif action == "resume":
                _SA2VA_PAUSED = False
                _SA2VA_CANCELLED = False
                return web.json_response({"success": True, "status": "resumed"})
            return web.json_response({"error": "invalid action"}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/sa2va/list_models")
    async def sa2va_list_models(request):
        try:
            base_dir = _sa2va_default_cache_dir()
            models = []
            if os.path.isdir(base_dir):
                try:
                    for name in os.listdir(base_dir):
                        p = os.path.join(base_dir, name)
                        if os.path.isdir(p):
                            size = 0
                            try:
                                for root, _dirs, files in os.walk(p):
                                    for f in files:
                                        fp = os.path.join(root, f)
                                        try:
                                            size += os.path.getsize(fp)
                                        except Exception:
                                            pass
                            except Exception:
                                pass
                            models.append({"name": name, "path": p, "size_bytes": int(size)})
                except Exception:
                    pass
            return web.json_response({"success": True, "base_dir": base_dir, "models": models})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/sa2va/delete_model")
    async def sa2va_delete_model(request):
        try:
            data = await request.json()
            name = str(data.get("name") or "").strip()
            if not name:
                return web.json_response({"error": "缺少模型名称"}, status=400)
            base_dir = _sa2va_default_cache_dir()
            target = os.path.join(base_dir, name)
            try:
                bd_abs = os.path.abspath(base_dir)
                tg_abs = os.path.abspath(target)
            except Exception:
                bd_abs = base_dir
                tg_abs = target
            if not tg_abs.startswith(bd_abs):
                return web.json_response({"error": "非法路径"}, status=400)
            if not os.path.isdir(target):
                return web.json_response({"error": "目录不存在"}, status=404)
            try:
                import shutil
                shutil.rmtree(target)
            except Exception as e:
                return web.json_response({"error": f"删除失败: {e}"}, status=500)
            return web.json_response({"success": True})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)