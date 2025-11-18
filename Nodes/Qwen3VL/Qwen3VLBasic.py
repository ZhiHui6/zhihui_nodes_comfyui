import os
import asyncio
import time
import torch
import folder_paths
from torchvision.transforms import ToPILImage
from transformers import (
    Qwen3VLForConditionalGeneration,
    AutoProcessor,
    BitsAndBytesConfig,
)
import model_management
from qwen_vl_utils import process_vision_info
from pathlib import Path
import re
try:
    from server import PromptServer
    from aiohttp import web
    _PS_OK = True
except Exception:
    PromptServer = None
    web = None
    _PS_OK = False
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_QWEN_CONFIG_PATH = os.path.join(_THIS_DIR, "qwen3vl_config.json")
_QWEN_MODEL_MAP = {
    "Qwen3-VL-4B-Instruct": "Qwen/Qwen3-VL-4B-Instruct",
    "Qwen3-VL-4B-Thinking": "Qwen/Qwen3-VL-4B-Thinking",
    "Qwen3-VL-8B-Instruct": "Qwen/Qwen3-VL-8B-Instruct",
    "Qwen3-VL-8B-Thinking": "Qwen/Qwen3-VL-8B-Thinking",
    "Huihui-Qwen3-VL-8B-Instruct-abliterated": "ayumix5/Huihui-Qwen3-VL-8B-Instruct-abliterated",
    "Qwen3-VL-4B-Instruct-FP8": "Qwen/Qwen3-VL-4B-Instruct-FP8",
    "Qwen3-VL-4B-Thinking-FP8": "Qwen/Qwen3-VL-4B-Thinking-FP8",
    "Qwen3-VL-8B-Instruct-FP8": "Qwen/Qwen3-VL-8B-Instruct-FP8",
    "Qwen3-VL-8B-Thinking-FP8": "Qwen/Qwen3-VL-8B-Thinking-FP8",
    "Qwen3-VL-32B-Instruct": "Qwen/Qwen3-VL-32B-Instruct",
    "Qwen3-VL-32B-Thinking": "Qwen/Qwen3-VL-32B-Thinking",
    "Qwen3-VL-32B-Instruct-FP8": "Qwen/Qwen3-VL-32B-Instruct-FP8",
    "Qwen3-VL-32B-Thinking-FP8": "Qwen/Qwen3-VL-32B-Thinking-FP8",
}
def _qwen_default_config():
    return {
        "cache_dir": "",
        "provider": "huggingface",
        "hf_mirror_url": "https://hf-mirror.com",
        "use_default_cache": True,
    }
def _qwen_load_config():
    try:
        if os.path.exists(_QWEN_CONFIG_PATH):
            import json
            with open(_QWEN_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            base = _qwen_default_config()
            base.update(data if isinstance(data, dict) else {})
            return base
    except Exception:
        pass
    return _qwen_default_config()
def _qwen_save_config(cfg):
    try:
        import json
        with open(_QWEN_CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False
def _qwen_default_cache_dir():
    try:
        ckpt_dirs = folder_paths.get_folder_paths("checkpoints")
        if ckpt_dirs:
            models_dir = os.path.dirname(ckpt_dirs[0])
            pg_dir = os.path.join(models_dir, "prompt_generator")
            try:
                os.makedirs(pg_dir, exist_ok=True)
            except Exception:
                pass
            return pg_dir
    except Exception:
        pass
    return os.path.join(os.path.expanduser("~"), "ComfyUI", "models", "prompt_generator")
def _qwen_cleanup_model_dir(path):
    try:
        import shutil
        if not os.path.isdir(path):
            return
        for name in os.listdir(path):
            p = os.path.join(path, name)
            if os.path.isdir(p):
                if name.startswith("models--") or name.startswith("datasets--") or name in ("snapshots", "refs", ".cache", ".huggingface", "__pycache__"):
                    try:
                        shutil.rmtree(p, ignore_errors=True)
                    except Exception:
                        pass
    except Exception:
        pass
_QWEN_PROGRESS = {
    "status": "idle",
    "downloaded_bytes": 0,
    "total_bytes": 0,
    "percent": 0.0,
    "speed_bps": 0.0,
    "started_at": 0.0,
}
_QWEN_CANCELLED = False
_QWEN_PAUSED = False

class Qwen3VLBasic:
    def __init__(self):
        self.model_checkpoint = None
        self.processor = None
        self.model = None
        self.device = model_management.get_torch_device()
        self.bf16_support = (
            torch.cuda.is_available()
            and torch.cuda.get_device_capability(self.device)[0] >= 8
        )

    def check_model_exists(self, model):
        model_id = f"qwen/{model}"
        model_path = os.path.join(
            folder_paths.models_dir, "prompt_generator", os.path.basename(model_id)
        )
        
        if not os.path.exists(model_path):
            error_msg = f"模型 '{model}' 未找到！请使用管理界面下载Qwen3-VL模型。"
            return False, model_path, error_msg
        
        config_file = os.path.join(model_path, "config.json")
        if not os.path.exists(config_file):
            error_msg = f"模型 '{model}' 文件不完整！请使用管理界面重新下载Qwen3-VL模型。"
            return False, model_path, error_msg
        
        return True, model_path, None

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "user_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "Custom user prompt to guide the model in generating specific content"
                }),
                "system_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "System-level prompt to define the model's behavior pattern and role positioning"
                }),
                "remove_think_tags": ("BOOLEAN", {
                    "default": False, 
                    "tooltip": "When enabled, removes </think> tags and all content before them from output text, keeping only clean description text"
                }),
                "model": (
                    [
                        "Qwen3-VL-4B-Instruct",
                        "Qwen3-VL-4B-Thinking",
                        "Qwen3-VL-4B-Instruct-FP8",
                        "Qwen3-VL-4B-Thinking-FP8",
                        "Qwen3-VL-8B-Instruct",
                        "Qwen3-VL-8B-Thinking",
                        "Qwen3-VL-8B-Instruct-FP8",
                        "Qwen3-VL-8B-Thinking-FP8",
                        "Qwen3-VL-32B-Instruct",
                        "Qwen3-VL-32B-Thinking",
                        "Qwen3-VL-32B-Instruct-FP8",
                        "Qwen3-VL-32B-Thinking-FP8",
                        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
                    ],
                    {
                        "default": "Qwen3-VL-8B-Instruct",
                        "tooltip": "Select Qwen3-VL model version, including 4B/8B parameter sizes and Instruct/Thinking types"
                    },
                ),
                "quantization": (
                    ["none", "4bit", "8bit"],
                    {
                        "default": "none",
                        "tooltip": "Model quantization settings to reduce VRAM usage. 8bit balances performance and resources, 4bit saves more VRAM but may affect quality"
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.7, 
                        "min": 0, 
                        "max": 1, 
                        "step": 0.1,
                        "tooltip": "Controls randomness of generated text. Higher values are more creative, lower values are more conservative and stable"
                    },
                ),
                "max_new_tokens": (
                    "INT",
                    {
                        "default": 2048, 
                        "min": 128, 
                        "max": 8192, 
                        "step": 1,
                        "tooltip": "Maximum length of generated text. Higher values allow longer content but consume more resources"
                    },
                ),
                "min_resolution": (
                    "INT",
                    {"default": 256, "min": 112, "max": 2048, "step": 1, "tooltip": "Minimum resolution for image processing, affects detail level and processing speed"},
                ),
                "max_resolution": (
                    "INT", 
                    {"default": 768, "min": 256, "max": 4096, "step": 1, "tooltip": "Maximum resolution for image processing, higher resolution provides more detail but consumes more resources"},
                ),
                "seed": ("INT", {
                    "default": -1,
                    "tooltip": "Random seed to control generation randomness. Same seed produces same results, -1 for random seed"
                }),
                "attention": (
                    [
                        "eager",
                        "sdpa",
                        "flash_attention_2",
                    ],
                    {
                        "default": "sdpa",
                        "tooltip": "Attention mechanism implementation, affects performance and compatibility. SDPA is the recommended option"
                    },
                ),
                "device": (
                    ["auto", "gpu", "cpu"],
                    {
                        "default": "auto",
                        "tooltip": "Computing device selection. Auto automatically selects the best device, GPU uses GPU, CPU uses CPU"
                    },
                ),
                "keep_model_loaded": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Keep model loaded in memory to improve subsequent processing speed but uses more memory"
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Batch processing mode, when enabled can process multiple image files in specified directory"
                }),
                "batch_directory": ("STRING", {
                    "default": "",
                    "tooltip": "Batch processing directory path, specify the folder path containing images to be processed"
                }),
            },
            "optional": {
                "source_path": ("PATH", {
                    "tooltip": "Source path: Specify the path to the image or video file to be processed. Can be a local file path or network URL. When both source_path and image are provided, source_path takes priority. Supports common image and video formats."
                }), 
                "image": ("IMAGE", {
                    "tooltip": "Image input: Direct input of image data for processing. Usually comes from image output of other ComfyUI nodes. When both source_path and image are provided, source_path has higher priority."
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "inference"
    CATEGORY = "Zhi.AI/Qwen3VL"

    def _resolution_to_pixels(self, resolution):
        return resolution * resolution

    def _remove_think_content(self, text):
        if not isinstance(text, str):
            return text

        think_end_pos = text.find('</think>')
        if think_end_pos != -1:
            return text[think_end_pos + len('</think>'):].strip()      
        return text

    def inference(
        self,
        model,
        system_prompt,
        user_prompt,
        keep_model_loaded,
        temperature,
        max_new_tokens,
        min_resolution,
        max_resolution,
        seed,
        quantization,
        device,
        image=None,
        source_path=None,
        attention="eager",
        batch_mode=False,
        batch_directory="",
        remove_think_tags=False,
    ):

        if source_path is not None and image is not None:
            error_message = (
                "检测到输入端口冲突：source_path 和 image 不能同时连接。\n\n"
                "解决方式(A或B)：\n"
                "A. 断开 source_path 端口的连接，使用 image 端口输入图像\n"
                "B. 断开 image 端口的连接，使用 source_path 端口输入图像路径\n\n"
                "注意：这两个输入端口是互斥的，只能选择其中一个作为图像输入源。"
            )
            raise ValueError(error_message)
        
        if batch_mode:
            conflicts = []
            if source_path is not None:
                conflicts.append("source_path")
            if image is not None:
                conflicts.append("image")
            
            if conflicts:
                conflict_list = "、".join(conflicts)
                error_message = (
                    f"检测到批量模式与以下输入端口冲突：{conflict_list}。\n\n"
                    f"解决方式(A或B)：\n"
                    f"A.断开 {conflict_list} 端口的连接，批量模式将从指定目录读取图片\n"
                    f"B.关闭批量模式，使用单张图片处理模式\n\n"
                    f"注意：批量模式设计用于处理目录中的多张图片，与单张图片输入端口互斥。"
                )
                raise ValueError(error_message)
            
            min_pixels = self._resolution_to_pixels(min_resolution)
            max_pixels = self._resolution_to_pixels(max_resolution)
            
            return self.batch_inference(
                user_prompt, batch_directory, model, quantization, keep_model_loaded,
                temperature, max_new_tokens, min_pixels, max_pixels,
                seed, attention, device, system_prompt, remove_think_tags
            )
        
        if seed != -1:
            torch.manual_seed(seed)
        
        model_exists, model_path, error_message = self.check_model_exists(model)
        if not model_exists:
            raise ValueError(error_message)
        
        self.model_checkpoint = model_path

        if min_resolution > max_resolution:
            raise ValueError(f"最小分辨率 ({min_resolution}) 不能大于最大分辨率 ({max_resolution})")
        
        min_pixels = self._resolution_to_pixels(min_resolution)
        max_pixels = self._resolution_to_pixels(max_resolution)

        if self.processor is None:
            self.processor = AutoProcessor.from_pretrained(
                self.model_checkpoint, min_pixels=min_pixels, max_pixels=max_pixels
            )

        if self.model is None:
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                )
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(
                    load_in_8bit=True,
                )
            else:
                quantization_config = None

            if device == "cpu":
                device_map = {"": "cpu"}
            elif device == "gpu":
                device_map = {"": 0}
            else:
                device_map = "auto"

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map=device_map,
                attn_implementation=attention,
                quantization_config=quantization_config,
            )

        with torch.no_grad():
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            if source_path:
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": source_path
                        + [
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ]             
            elif image is not None:
                to_pil = ToPILImage()
                pil_image = to_pil(image[0].permute(2, 0, 1))
                
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "image": pil_image},
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ]
            else:
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                        ],
                    }
                ]

            text = self.processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            image_inputs, video_inputs = process_vision_info(messages)
            inputs = self.processor(
                text=[text],
                images=image_inputs,
                videos=video_inputs,
                padding=True,
                return_tensors="pt",
            )
            inputs = inputs.to(self.device)
            
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            input_ids = inputs.input_ids.clone()
                
            generated_ids = self.model.generate(
                **inputs, 
                max_new_tokens=max_new_tokens, 
                temperature=temperature, 
                do_sample=temperature > 0,
                pad_token_id=self.processor.tokenizer.eos_token_id,
            )
            
            del inputs
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            generated_ids_trimmed = [
                out_ids[len(in_ids) :] for in_ids, out_ids in zip(input_ids, generated_ids)
            ]
            
            result = self.processor.batch_decode(
                generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
            )
            
            del generated_ids, generated_ids_trimmed, input_ids
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        if not keep_model_loaded:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        final_result = result[0]
        if remove_think_tags:
            final_result = self._remove_think_content(final_result)

        return (final_result,)

    def get_image_files(self, batch_directory):
        image_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp', '.gif')
        image_files = []
        
        for root, dirs, files in os.walk(batch_directory):
            for file in files:
                if file.lower().endswith(image_extensions):
                    image_files.append(os.path.join(root, file))
        
        return sorted(image_files)

    def save_description(self, image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(description)

    def batch_inference(
        self,
        user_prompt,
        batch_directory,
        model,
        quantization,
        keep_model_loaded,
        temperature,
        max_new_tokens,
        min_pixels,
        max_pixels,
        seed,
        attention,
        device,
        system_prompt,
        remove_think_tags=False,
    ):
        if seed != -1:
            torch.manual_seed(seed)
            
        if not os.path.exists(batch_directory):
            return (f"错误: 目录 '{batch_directory}' 不存在。",)
        
        image_files = self.get_image_files(batch_directory)
        if not image_files:
            return (f"在目录 '{batch_directory}' 中未找到图片文件。",)
        
        model_exists, model_path, error_message = self.check_model_exists(model)
        if not model_exists:
            return (error_message,)
        
        self.model_checkpoint = model_path

        if self.processor is None:
            self.processor = AutoProcessor.from_pretrained(
                self.model_checkpoint, min_pixels=min_pixels, max_pixels=max_pixels
            )

        if self.model is None:
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(load_in_4bit=True)
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            else:
                quantization_config = None

            if device == "cpu":
                device_map = {"":"cpu"}
            elif device == "gpu":
                device_map = {"":0}
            else:
                device_map = "auto"

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map=device_map,
                attn_implementation=attention,
                quantization_config=quantization_config,
            )

        processed_count = 0
        failed_count = 0
        
        for image_file in image_files:
            try:
                if system_prompt:
                    messages = [
                        {
                            "role": "system",
                            "content": [{"type": "text", "text": system_prompt}],
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": image_file},
                                {"type": "text", "text": user_prompt},
                            ],
                        },
                    ]
                else:
                    messages = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": image_file},
                                {"type": "text", "text": user_prompt},
                            ],
                        },
                    ]

                text_input = self.processor.apply_chat_template(
                    messages, tokenize=False, add_generation_prompt=True
                )
                image_inputs, video_inputs = process_vision_info(messages)
                inputs = self.processor(
                    text=[text_input],
                    images=image_inputs,
                    videos=video_inputs,
                    padding=True,
                    return_tensors="pt",
                )
                inputs = inputs.to(self.device)
                
                input_ids = inputs.input_ids.clone()
                
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                generated_ids = self.model.generate(
                    **inputs, 
                    max_new_tokens=max_new_tokens, 
                    temperature=temperature, 
                    do_sample=temperature > 0,
                    pad_token_id=self.processor.tokenizer.eos_token_id,
                )
                
                del inputs
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                generated_ids_trimmed = [
                    out_ids[len(in_ids) :]
                    for in_ids, out_ids in zip(input_ids, generated_ids)
                ]
                result = self.processor.batch_decode(
                    generated_ids_trimmed,
                    skip_special_tokens=True,
                    clean_up_tokenization_spaces=False,
                )
                
                del generated_ids, generated_ids_trimmed, input_ids
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                description = result[0] if result else "No description generated"
                
                if remove_think_tags:
                    description = self._remove_think_content(description)
                
                self.save_description(image_file, description)
                
                processed_count += 1
                print(f"Processed: {os.path.basename(image_file)} - {description[:100]}...")
                
            except Exception as e:
                failed_count += 1
                print(f"处理失败 {image_file}: {str(e)}")
                continue

        if not keep_model_loaded:
            del self.processor
            del self.model
            self.processor = None
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
            import gc
            gc.collect()

        log_message = f"批量处理完成。已处理: {processed_count} 张图片，失败: {failed_count} 张图片，目录: '{batch_directory}'。"
        
        return (log_message,)

if _PS_OK:
    @PromptServer.instance.routes.get("/zhihui_nodes/qwen3vl/config")
    async def qwen_get_config(request):
        try:
            cfg = _qwen_load_config()
            cfg["default_cache_dir"] = _qwen_default_cache_dir()
            return web.json_response(cfg)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/qwen3vl/config")
    async def qwen_set_config(request):
        try:
            data = await request.json()
            cfg = _qwen_load_config()
            if isinstance(data, dict):
                for k in ["provider", "hf_mirror_url", "cache_dir", "use_default_cache"]:
                    if k in data:
                        cfg[k] = data[k]
            ok = _qwen_save_config(cfg)
            if ok:
                return web.json_response({"success": True})
            return web.json_response({"success": False}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/qwen3vl/progress")
    async def qwen_get_progress(request):
        try:
            st = dict(_QWEN_PROGRESS)
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
                    started_at = _QWEN_PROGRESS.get("started_at")
                    if started_at:
                        dt = max(1e-6, time.time() - float(started_at))
                        st["speed_bps"] = downloaded / dt
            return web.json_response(st)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/qwen3vl/check_model")
    async def qwen_check_model(request):
        try:
            q = request.rel_url.query
            name = str(q.get("model", "") or "").split("/")[-1]
            base_dir = _qwen_default_cache_dir()
            candidate = os.path.join(base_dir, name)
            exists = os.path.isdir(candidate) and os.path.isfile(os.path.join(candidate, "config.json"))
            return web.json_response({"exists": exists, "path": candidate})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/qwen3vl/download")
    async def qwen_download(request):
        try:
            data = await request.json()
            model_name = str(data.get("model_name") or "").strip()
            provider = str(data.get("provider") or "").strip()
            cfg = _qwen_load_config()
            if provider:
                cfg["provider"] = provider
            _qwen_save_config(cfg)
            import shutil, time
            repo_id = _QWEN_MODEL_MAP.get(model_name) or f"qwen/{model_name}"
            if model_name == "Huihui-Qwen3-VL-8B-Instruct-abliterated":
                if cfg.get("provider") == "modelscope":
                    repo_id = "ayumix5/Huihui-Qwen3-VL-8B-Instruct-abliterated"
                else:
                    repo_id = "huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated"
            display_name = repo_id.split("/")[-1] if isinstance(repo_id, str) else "QwenModel"
            base_dir = _qwen_default_cache_dir()
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
                global _QWEN_CANCELLED, _QWEN_PAUSED
                _QWEN_CANCELLED = False
                _QWEN_PAUSED = False
                local_dir = None
                try:
                    from huggingface_hub import snapshot_download, HfApi
                    from huggingface_hub.utils import tqdm as hub_tqdm
                    _QWEN_PROGRESS.update({
                        "status": "downloading",
                        "downloaded_bytes": 0,
                        "total_bytes": 0,
                        "percent": 0.0,
                        "speed_bps": 0.0,
                        "started_at": time.time(),
                    })
                    try:
                        api = HfApi()
                        info = api.repo_info(repo_id, repo_type="model", files_metadata=True)
                        sizes = []
                        for s in getattr(info, "siblings", []):
                            sz = getattr(s, "size", None)
                            if sz is None:
                                lfs = getattr(s, "lfs", None)
                                sz = getattr(lfs, "size", None) if lfs is not None else None
                            if isinstance(sz, int) and sz > 0:
                                sizes.append(sz)
                        _QWEN_PROGRESS["total_bytes"] = sum(sizes)
                    except Exception:
                        pass
                    class ProgressTqdm(hub_tqdm):
                        def update(self, n=1):
                            if _QWEN_CANCELLED:
                                raise KeyboardInterrupt("cancelled")
                            try:
                                dt = max(1e-6, time.time() - float(_QWEN_PROGRESS.get("started_at", time.time())))
                                total = int(_QWEN_PROGRESS.get("total_bytes", 0) or 0)
                                mon = _QWEN_PROGRESS.get("monitor_dir")
                                if mon and os.path.isdir(mon):
                                    done = 0
                                    for root, _dirs, files in os.walk(mon):
                                        for f in files:
                                            fp = os.path.join(root, f)
                                            try:
                                                done += os.path.getsize(fp)
                                            except Exception:
                                                pass
                                    _QWEN_PROGRESS["downloaded_bytes"] = done
                                    if total > 0:
                                        _QWEN_PROGRESS["percent"] = min(100.0, (done * 100.0) / total)
                                    _QWEN_PROGRESS["speed_bps"] = done / dt
                            except Exception:
                                pass
                            return super().update(n)
                    download_dir = target_dir
                    _QWEN_PROGRESS["monitor_dir"] = download_dir
                    try:
                        if cfg.get("provider") == "modelscope":
                            from modelscope.hub.snapshot_download import snapshot_download as ms_snapshot_download
                            dl_dir = ms_snapshot_download(repo_id, cache_dir=download_dir)
                            try:
                                if _QWEN_PROGRESS.get("total_bytes", 0) <= 0:
                                    total = 0
                                    for root, _dirs, files in os.walk(download_dir):
                                        for f in files:
                                            fp = os.path.join(root, f)
                                            try:
                                                total += os.path.getsize(fp)
                                            except Exception:
                                                pass
                                    _QWEN_PROGRESS["total_bytes"] = total
                                if os.path.isdir(dl_dir):
                                    if os.path.abspath(dl_dir) != os.path.abspath(target_dir):
                                        shutil.copytree(dl_dir, target_dir, dirs_exist_ok=True)
                                    local_dir = target_dir
                                try:
                                    if dl_dir and os.path.isdir(dl_dir) and os.path.abspath(dl_dir) != os.path.abspath(target_dir):
                                        shutil.rmtree(dl_dir, ignore_errors=True)
                                except Exception:
                                    pass
                            except Exception:
                                pass
                        else:
                            hf_kwargs = {"repo_id": repo_id, "local_dir": download_dir, "cache_dir": download_dir, "local_dir_use_symlinks": False, "tqdm_class": ProgressTqdm}
                            if cfg.get("hf_mirror_url"):
                                hf_kwargs["hf_endpoint"] = str(cfg.get("hf_mirror_url"))
                            dl_dir = snapshot_download(**hf_kwargs)
                            try:
                                if _QWEN_PROGRESS.get("total_bytes", 0) <= 0:
                                    total = 0
                                    for root, _dirs, files in os.walk(download_dir):
                                        for f in files:
                                            fp = os.path.join(root, f)
                                            try:
                                                total += os.path.getsize(fp)
                                            except Exception:
                                                pass
                                    _QWEN_PROGRESS["total_bytes"] = total
                                if os.path.isdir(dl_dir):
                                    if os.path.abspath(dl_dir) != os.path.abspath(target_dir):
                                        shutil.copytree(dl_dir, target_dir, dirs_exist_ok=True)
                                    local_dir = target_dir
                                try:
                                    _qwen_cleanup_model_dir(target_dir)
                                except Exception:
                                    pass
                            except Exception:
                                pass
                    except Exception:
                        pass
                    valid = os.path.isdir(target_dir) and os.path.isfile(os.path.join(target_dir, "config.json"))
                    if valid:
                        try:
                            _QWEN_PROGRESS.update({"status": "done", "percent": 100.0})
                            _QWEN_PROGRESS.pop("monitor_dir", None)
                        except Exception:
                            pass
                        return {"success": True, "local_dir": target_dir}
                    else:
                        try:
                            _QWEN_PROGRESS.update({"status": "error"})
                        except Exception:
                            pass
                        try:
                            import shutil
                            if os.path.isdir(target_dir):
                                empty = True
                                for _r, _d, files in os.walk(target_dir):
                                    if files:
                                        empty = False
                                        break
                                if empty:
                                    shutil.rmtree(target_dir, ignore_errors=True)
                        except Exception:
                            pass
                        return {"error": "下载失败：目标目录为空或缺少必需文件"}
                except KeyboardInterrupt:
                    try:
                        if _QWEN_PAUSED:
                            _QWEN_PROGRESS.update({"status": "paused"})
                            return {"paused": True}
                        else:
                            _QWEN_PROGRESS.update({"status": "stopped"})
                            return {"stopped": True}
                    except Exception:
                        return {"stopped": True}
                except Exception as e:
                    try:
                        _QWEN_PROGRESS.update({"status": "error"})
                    except Exception:
                        pass
                    return {"error": str(e)}
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, do_download)
            if isinstance(result, dict) and result.get("error"):
                return web.json_response(result, status=400)
            return web.json_response(result)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/qwen3vl/control")
    async def qwen_control(request):
        try:
            global _QWEN_CANCELLED, _QWEN_PAUSED
            data = await request.json()
            action = str(data.get("action") or "").strip().lower()
            if action == "pause":
                _QWEN_PAUSED = True
                _QWEN_CANCELLED = True
                return web.json_response({"success": True, "status": "paused"})
            elif action == "stop":
                _QWEN_PAUSED = False
                _QWEN_CANCELLED = True
                return web.json_response({"success": True, "status": "stopped"})
            elif action == "resume":
                _QWEN_PAUSED = False
                _QWEN_CANCELLED = False
                return web.json_response({"success": True, "status": "resumed"})
            return web.json_response({"error": "invalid action"}, status=400)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhihui_nodes/qwen3vl/list_models")
    async def qwen_list_models(request):
        try:
            base_dir = _qwen_default_cache_dir()
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
                            valid = os.path.isfile(os.path.join(p, "config.json"))
                            models.append({"name": name, "path": p, "size_bytes": int(size), "valid": bool(valid)})
                except Exception:
                    pass
            return web.json_response({"success": True, "base_dir": base_dir, "models": models})
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/qwen3vl/delete_model")
    async def qwen_delete_model(request):
        try:
            data = await request.json()
            name = str(data.get("name") or "").strip()
            if not name:
                return web.json_response({"error": "缺少模型名称"}, status=400)
            base_dir = _qwen_default_cache_dir()
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