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
 
from PIL import Image
try:
    import modelscope as _ms
    _MS_OK = True
except Exception:
    _MS_OK = False
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
def _qwen_default_config():
    return {
        "cache_dir": "",
        "provider": "huggingface",
        "hf_mirror_url": "https://hf-mirror.com",
        "use_default_cache": True,
        "active_model_name": "",
        "active_model_path": "",
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
        self.current_model_id = None  # Track the current model id
        self.current_quantization = None  # Track the current quantization

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
                    "tooltip": "用户自定义提示词，用于引导模型生成特定内容。"
                }),
                "system_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "系统级提示词，用于设定模型的行为模式和角色定位。"
                }),
                "remove_think_tags": ("BOOLEAN", {
                    "default": False, 
                    "tooltip": "启用后将删除输出文本中</think>标签及其之前的所有内容，保留纯净的描述文本。"
                }),
                
                "quantization": (
                    ["none", "4bit", "8bit"],
                    {
                        "default": "none",
                        "tooltip": "模型量化设置，用于降低显存占用。8bit 兼顾性能与资源，4bit 更省显存但可能影响质量。"
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.7, 
                        "min": 0, 
                        "max": 1, 
                        "step": 0.1,
                        "tooltip": "控制生成文本的随机性。值越高越有创意，值越低越保守稳定。"
                    },
                ),
                "max_new_tokens": (
                    "INT",
                    {
                        "default": 2048, 
                        "min": 128, 
                        "max": 8192, 
                        "step": 1,
                        "tooltip": "生成文本最大长度。值越大可生成更长内容，但消耗更多资源。"
                    },
                ),
                "image_size_limitation": ("INT", {
                    "default": 1080,
                    "min": 0,
                    "max": 2500,
                    "step": 1,
                    "tooltip": "图像长边限制（像素）。0 表示不限制，值过大可能导致内存溢出。"
                }),
                "seed": ("INT", {
                    "default": -1,
                    "tooltip": "随机种子用于控制生成随机性。相同种子可复现结果，-1 为随机种子。"
                }),
                "attention": (
                    [
                        "eager",
                        "sdpa",
                        "flash_attention_2",
                    ],
                    {
                        "default": "sdpa",
                        "tooltip": "注意力机制实现，影响性能与兼容性。推荐使用 SDPA。"
                    },
                ),
                "device": (
                    ["auto", "gpu", "cpu"],
                    {
                        "default": "auto",
                        "tooltip": "计算设备选择。auto 自动选择最佳设备，gpu 使用显卡，cpu 使用处理器。"
                    },
                ),
                "unload_mode": (["Full Unload", "Unload to CPU", "Keep Loaded"], {
                    "default": "Full Unload",
                    "tooltip": "模型卸载策略。完全卸载释放显存与内存；卸载到 CPU 释放显存；保持加载可加速下一次。"
                }),
                "skip_exists": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "启用后将跳过已存在同名txt文件的图片的打标处理，防止重复打标"
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "批量处理模式，启用后可处理指定目录中的多张图片。"
                }),
                "batch_directory": ("STRING", {
                    "default": "",
                    "tooltip": "批量处理目录路径，指定待处理图片所在文件夹。"
                }),
            },
            "optional": {
                "source_path": ("PATH", {
                    "tooltip": "源路径：指定待处理图片或视频文件路径，可为本地路径或网络 URL。当 source_path 与 image 同时提供时，以 source_path 为准。支持常见图片与视频格式。"
                }), 
                "image": ("IMAGE", {
                    "tooltip": "图像输入：直接输入图像数据，通常来自其他节点。当 source_path 与 image 同时提供时，以 source_path 为准。"
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "inference"
    CATEGORY = "Zhi.AI/Qwen3VL"

    def _resize_image_long_edge(self, pil_image, target):
        try:
            t = int(target)
        except Exception:
            t = 0
        if t <= 0:
            return pil_image
        w, h = pil_image.size
        m = max(w, h)
        if m <= 0 or m <= t:
            return pil_image
        scale = float(t) / float(m)
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))
        return pil_image.resize((new_w, new_h), resample=Image.LANCZOS)

    def _apply_size_limitation_to_content(self, content, target):
        if not isinstance(content, list):
            return content
        out = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "image":
                img = item.get("image")
                if isinstance(img, str):
                    p = img
                    if p.startswith("file://"):
                        p = p[7:]
                    try:
                        im = Image.open(p)
                        if im.mode != "RGB":
                            im = im.convert("RGB")
                        im = self._resize_image_long_edge(im, target)
                        out.append({"type": "image", "image": im})
                    except Exception:
                        out.append(item)
                elif hasattr(img, "size"):
                    try:
                        out.append({"type": "image", "image": self._resize_image_long_edge(img, target)})
                    except Exception:
                        out.append(item)
                else:
                    out.append(item)
            else:
                out.append(item)
        return out

    def _remove_think_content(self, text):
        if not isinstance(text, str):
            return text

        think_end_pos = text.find('</think>')
        if think_end_pos != -1:
            return text[think_end_pos + len('</think>'):].strip()      
        return text

    def inference(
        self,
        system_prompt,
        user_prompt,
        unload_mode,
        temperature,
        max_new_tokens,
        image_size_limitation,
        seed,
        quantization,
        device,
        image=None,
        source_path=None,
        attention="eager",
        batch_mode=False,
        batch_directory="",
        remove_think_tags=False,
        skip_exists=False,
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
            return self.batch_inference(
                user_prompt, batch_directory, quantization, unload_mode,
                temperature, max_new_tokens, image_size_limitation,
                seed, attention, device, system_prompt, remove_think_tags,
                skip_exists
            )
        
        if seed != -1:
            torch.manual_seed(seed)
        
        cfg = _qwen_load_config()
        active_name = str(cfg.get("active_model_name") or "").strip()
        active_path = str(cfg.get("active_model_path") or "").strip()
        if not active_path:
            base_dir = _qwen_default_cache_dir()
            if active_name:
                active_path = os.path.join(base_dir, active_name)
        if not (active_path and os.path.isdir(active_path)):
            raise ValueError("未激活模型：请在管理界面选择已下载模型并点击‘激活’")
        self.model_checkpoint = active_path
        model_id = active_path  # Use active_path as model identifier

        # If model_id or quantization changed, reload processor and model
        if (
            self.current_model_id != model_id
            or self.current_quantization != quantization
            or self.processor is None
            or self.model is None
        ):
            self.current_model_id = model_id
            self.current_quantization = quantization
            if self.processor is not None:
                del self.processor
                self.processor = None
            if self.model is not None:
                del self.model
                self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
            self.processor = AutoProcessor.from_pretrained(self.model_checkpoint)
            if device == "cpu":
                device_map = {"": "cpu"}
            elif device == "gpu":
                device_map = {"": 0}
            else:
                device_map = "auto"
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(load_in_4bit=True)
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            else:
                quantization_config = None
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
                        "content": self._apply_size_limitation_to_content(source_path, image_size_limitation)
                        + [
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ]             
            elif image is not None:
                to_pil = ToPILImage()
                pil_image = to_pil(image[0].permute(2, 0, 1))
                pil_image = self._resize_image_long_edge(pil_image, image_size_limitation)
                
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

        try:
            mode = str(unload_mode)
        except Exception:
            mode = "Full Unload"
        if mode == "Unload to CPU":
            try:
                if self.model is not None:
                    try:
                        self.model.to("cpu")
                    except Exception:
                        pass
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    try:
                        torch.cuda.ipc_collect()
                    except Exception:
                        pass
            except Exception:
                pass
        elif mode == "Full Unload":
            try:
                del self.processor
            except Exception:
                pass
            try:
                del self.model
            except Exception:
                pass
            self.processor = None
            self.model = None
            self.current_model_id = None
            self.current_quantization = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                try:
                    torch.cuda.ipc_collect()
                except Exception:
                    pass

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
        quantization,
        unload_mode,
        temperature,
        max_new_tokens,
        image_size_limitation,
        seed,
        attention,
        device,
        system_prompt,
        remove_think_tags=False,
        skip_exists=False,
    ):
        if seed != -1:
            torch.manual_seed(seed)
            
        if not os.path.exists(batch_directory):
            return (f"错误: 目录 '{batch_directory}' 不存在。",)
        
        image_files = self.get_image_files(batch_directory)
        if not image_files:
            return (f"在目录 '{batch_directory}' 中未找到图片文件。",)
        
        cfg = _qwen_load_config()
        active_name = str(cfg.get("active_model_name") or "").strip()
        active_path = str(cfg.get("active_model_path") or "").strip()
        if not active_path:
            base_dir = _qwen_default_cache_dir()
            if active_name:
                active_path = os.path.join(base_dir, active_name)
        if not (active_path and os.path.isdir(active_path)):
            return ("未激活模型：请在管理界面选择已下载模型并点击‘激活’",)
        self.model_checkpoint = active_path
        model_id = active_path  # Use active_path as model identifier

        # If model_id or quantization changed, reload processor and model
        if (
            self.current_model_id != model_id
            or self.current_quantization != quantization
            or self.processor is None
            or self.model is None
        ):
            self.current_model_id = model_id
            self.current_quantization = quantization
            if self.processor is not None:
                del self.processor
                self.processor = None
            if self.model is not None:
                del self.model
                self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
            self.processor = AutoProcessor.from_pretrained(self.model_checkpoint)
            if device == "cpu":
                device_map = {"":"cpu"}
            elif device == "gpu":
                device_map = {"":0}
            else:
                device_map = "auto"
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(load_in_4bit=True)
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            else:
                quantization_config = None
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
            if skip_exists:
                txt_file = os.path.splitext(image_file)[0] + ".txt"
                if os.path.exists(txt_file):
                    print(f"Skipping {image_file} as {txt_file} already exists.")
                    continue
            try:
                if system_prompt:
                    try:
                        pil_image = Image.open(image_file)
                        if pil_image.mode != "RGB":
                            pil_image = pil_image.convert("RGB")
                        pil_image = self._resize_image_long_edge(pil_image, image_size_limitation)
                    except Exception:
                        pil_image = image_file
                    messages = [
                        {
                            "role": "system",
                            "content": [{"type": "text", "text": system_prompt}],
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
                    try:
                        pil_image = Image.open(image_file)
                        if pil_image.mode != "RGB":
                            pil_image = pil_image.convert("RGB")
                        pil_image = self._resize_image_long_edge(pil_image, image_size_limitation)
                    except Exception:
                        pil_image = image_file
                    messages = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": pil_image},
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

        try:
            mode = str(unload_mode)
        except Exception:
            mode = "Full Unload"
        if mode == "Unload to CPU":
            try:
                if self.model is not None:
                    try:
                        self.model.to("cpu")
                    except Exception:
                        pass
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    try:
                        torch.cuda.ipc_collect()
                    except Exception:
                        pass
            except Exception:
                pass
        elif mode == "Full Unload":
            try:
                del self.processor
            except Exception:
                pass
            try:
                del self.model
            except Exception:
                pass
            self.processor = None
            self.model = None
            self.current_model_id = None
            self.current_quantization = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                try:
                    torch.cuda.ipc_collect()
                except Exception:
                    pass
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
                for k in ["provider", "hf_mirror_url", "cache_dir", "use_default_cache", "active_model_name", "active_model_path"]:
                    if k in data:
                        cfg[k] = data[k]
            ok = _qwen_save_config(cfg)
            if ok:
                return web.json_response({"success": True})
            return web.json_response({"success": False}, status=500)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhihui_nodes/qwen3vl/activate_model")
    async def qwen_activate_model(request):
        try:
            data = await request.json()
            name = str(data.get("name") or "").strip()
            if not name:
                return web.json_response({"error": "缺少模型名称"}, status=400)
            base_dir = _qwen_default_cache_dir()
            target = os.path.join(base_dir, name)
            if not os.path.isdir(target):
                return web.json_response({"error": "模型目录不存在"}, status=404)
            cfg = _qwen_load_config()
            cfg["active_model_name"] = name
            cfg["active_model_path"] = target
            ok = _qwen_save_config(cfg)
            if ok:
                return web.json_response({"success": True, "active_model_name": name, "active_model_path": target})
            return web.json_response({"error": "激活失败"}, status=500)
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
            exists = False
            try:
                if os.path.isdir(candidate):
                    has_cfg = os.path.isfile(os.path.join(candidate, "config.json"))
                    exists = has_cfg
            except Exception:
                exists = False
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
            repo_id = model_name if ("/" in model_name) else f"Qwen/{model_name}"
            if model_name == "Huihui-Qwen3-VL-8B-Instruct-abliterated":
                if cfg.get("provider") == "modelscope":
                    repo_id = "ayumix5/Huihui-Qwen3-VL-8B-Instruct-abliterated"
                else:
                    repo_id = "huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated"
            if model_name == "Huihui-Qwen3-VL-8B-Thinking-abliterated":
                if cfg.get("provider") == "modelscope":
                    repo_id = "ayumix5/Huihui-Qwen3-VL-8B-Thinking-abliterated"
                else:
                    repo_id = "huihui-ai/Huihui-Qwen3-VL-8B-Thinking-abliterated"
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
                            ms_kwargs = {"cache_dir": download_dir}
                            dl_dir = ms_snapshot_download(repo_id, **ms_kwargs)
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
                    valid = False
                    if os.path.isdir(target_dir):
                        cfg_ok = os.path.isfile(os.path.join(target_dir, "config.json"))
                        valid = cfg_ok
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
            cfg = _qwen_load_config()
            active_name = str(cfg.get("active_model_name") or "").strip()
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
                            if not valid:
                                try:
                                    for _r, _d, files in os.walk(p):
                                        for f in files:
                                            pass
                                        if valid:
                                            break
                                except Exception:
                                    pass
                            models.append({"name": name, "path": p, "size_bytes": int(size), "valid": bool(valid), "active": bool(name == active_name)})
                except Exception:
                    pass
            return web.json_response({"success": True, "base_dir": base_dir, "models": models, "active_model_name": active_name})
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
