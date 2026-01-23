import os
import gc
import torch
import transformers
import folder_paths
import comfy.model_management as mm
from PIL import Image

from unittest.mock import patch
from transformers import AutoModelForCausalLM, AutoProcessor, set_seed
from transformers.dynamic_module_utils import get_imports
from .common import hash_seed, zhiai_log, image_to_pil_image
try:
    from . import florence2_api
except ImportError:
    pass


model_directory = os.path.join(folder_paths.models_dir, "LLM")
os.makedirs(model_directory, exist_ok=True)

folder_paths.add_model_folder_path("LLM", model_directory)

def fixed_get_imports(filename: str | os.PathLike) -> list[str]:
    try:
        if not str(filename).endswith("modeling_florence2.py"):
            return get_imports(filename)
        imports = get_imports(filename)
        imports.remove("flash_attn")
    except:
        print(f"No flash_attn import to remove")
        pass
    return imports

prompts_map = {
    'caption': '<CAPTION>',
    'detailed_caption': '<DETAILED_CAPTION>',
    'more_detailed_caption': '<MORE_DETAILED_CAPTION>',
    'tags': '<GENERATE_TAGS>',
    'mixed': '<MIX_CAPTION>',
    'extra_mixed': '<MIX_CAPTION_PLUS>',
    'analyze': '<ANALYZE>',
}

def describe_single_image(image, model, processor, prompt, device, dtype, num_beams=3, max_new_tokens=1024,
                          do_sample=True):
    pil_image = image_to_pil_image(image)

    inputs = processor(text=prompt, images=pil_image, return_tensors="pt", do_rescale=False).to(dtype).to(
        device)

    try:
        generated_ids = model.generate(
            input_ids=inputs["input_ids"],
            pixel_values=inputs["pixel_values"],
            max_new_tokens=max_new_tokens,
            do_sample=do_sample,
            num_beams=num_beams,
        )
    except AttributeError as e:
        if "NoneType object has no attribute 'shape'" in str(e) or "NoneType' object has no attribute 'shape'" in str(e):
            generated_ids = model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=max_new_tokens,
                do_sample=do_sample,
                num_beams=num_beams,
                use_cache=False,
            )
        else:
            raise

    results = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]

    clean_results = str(results).replace('</s>', '').replace('<s>', '')

    return clean_results

def describe_single_pil_image(pil_image, model, processor, prompt, device, dtype, num_beams=3, max_new_tokens=1024,
                              do_sample=True):
    inputs = processor(text=prompt, images=pil_image, return_tensors="pt", do_rescale=False).to(dtype).to(
        device)

    try:
        generated_ids = model.generate(
            input_ids=inputs["input_ids"],
            pixel_values=inputs["pixel_values"],
            max_new_tokens=max_new_tokens,
            do_sample=do_sample,
            num_beams=num_beams,
        )
    except AttributeError as e:
        if "NoneType object has no attribute 'shape'" in str(e) or "NoneType' object has no attribute 'shape'" in str(e):
            generated_ids = model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=max_new_tokens,
                do_sample=do_sample,
                num_beams=num_beams,
                use_cache=False,
            )
        else:
            raise

    results = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    clean_results = str(results).replace('</s>', '').replace('<s>', '')
    return clean_results

class Florence2Plus:
    def __init__(self):
        self.model = None
        self.processor = None
        self.current_model_path = None
        self.current_attention = None
        self.current_dtype = None

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model_name": (
                    [
                        'microsoft/Florence-2-base',
                        'microsoft/Florence-2-large',
                        'MiaoshouAI/Florence-2-base-PromptGen-v2.0',
                        'MiaoshouAI/Florence-2-large-PromptGen-v2.0'
                    ],
                    {
                        "default": 'MiaoshouAI/Florence-2-base-PromptGen-v2.0'
                    }),
                "precision": (['fp16', 'bf16', 'fp32'],
                              {
                                  "default": 'fp16'
                              }),
                "attention": (
                    ['flash_attention_2', 'sdpa', 'eager'],
                    {
                        "default": 'sdpa'
                    }),
                "image": ("IMAGE",),
                "unload_mode": (["unload_to_cpu", "full_unload", "keep_loaded"], {"default": "unload_to_cpu"}),
                "task": (list(prompts_map.keys()), {"default": "more_detailed_caption"}),
                "seed": ("INT", {"default": 42, "min": 1, "max": 0xffffffffffffffff}),
                "max_new_tokens": ("INT", {"default": 1024, "min": 1, "max": 4096}),
                "num_beams": ("INT", {"default": 3, "min": 1, "max": 64}),
                "do_sample": ("BOOLEAN", {"default": True}),
                "batch_mode": ("BOOLEAN", {"default": False}),
                "batch_directory": ("STRING", {"default": ""}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "describe_image"
    CATEGORY = "Zhi.AI/Florence2"

    def _clear_model(self):
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
        self.current_model_path = None
        self.current_attention = None
        self.current_dtype = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            try:
                torch.cuda.ipc_collect()
            except Exception:
                pass
        gc.collect()

    def _ensure_model(self, model_path, attention, dtype):
        reload_needed = (
            self.model is None
            or self.processor is None
            or self.current_model_path != model_path
            or self.current_attention != attention
            or self.current_dtype != dtype
        )
        if reload_needed:
            self._clear_model()
            if transformers.__version__ < '4.51.0':
                with patch("transformers.dynamic_module_utils.get_imports", fixed_get_imports):
                    self.model = AutoModelForCausalLM.from_pretrained(model_path, attn_implementation=attention, torch_dtype=dtype, trust_remote_code=True)
            else:
                from .modeling_florence2 import Florence2ForConditionalGeneration
                self.model = Florence2ForConditionalGeneration.from_pretrained(model_path, attn_implementation=attention, torch_dtype=dtype)
            self.processor = AutoProcessor.from_pretrained(model_path, trust_remote_code=True)
            self.current_model_path = model_path
            self.current_attention = attention
            self.current_dtype = dtype
        return self.model, self.processor

    def _apply_unload_mode(self, unload_mode):
        mode = str(unload_mode)
        if mode == "keep_loaded":
            return
        if mode == "unload_to_cpu":
            try:
                if self.model is not None:
                    self.model.to("cpu")
            except Exception:
                pass
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                try:
                    torch.cuda.ipc_collect()
                except Exception:
                    pass
            return
        self._clear_model()

    def describe_image(self, model_name, precision, attention, image, unload_mode, task, batch_mode, batch_directory,
                       num_beams, max_new_tokens, do_sample, seed):
        device = mm.get_torch_device()
        dtype = {"bf16": torch.bfloat16, "fp16": torch.float16, "fp32": torch.float32}[precision]

        model_path = os.path.join(model_directory, model_name.rsplit('/', 1)[-1])

        if not os.path.exists(model_path):
            zhiai_log(f"Downloading Florence2 model to: {model_path}")
            from huggingface_hub import snapshot_download
            snapshot_download(repo_id=model_name,
                              local_dir=model_path,
                              local_dir_use_symlinks=False)

        zhiai_log(f"Florence2 using {attention} for attention")

        model, processor = self._ensure_model(model_path, attention, dtype)

        model.to(device)
        set_seed(hash_seed(seed))

        is_promptgen_model = "PromptGen" in model_name or "MiaoshouAI" in model_name
        prompt = prompts_map.get(task, '<CAPTION>')
        
        if not is_promptgen_model and task in ['tags', 'mixed', 'extra_mixed', 'analyze']:
            supported_tasks = "caption, detailed_caption, more_detailed_caption"
            raise ValueError(
                f"模型 {model_name} 不支持 '{task}' 任务。\n"
                f"该任务仅支持 MiaoshouAI 的 PromptGen 系列模型。\n"
                f"当前模型仅支持以下任务: {supported_tasks}\n\n"
                f"Model {model_name} does not support task '{task}'.\n"
                f"This task is only supported by MiaoshouAI's PromptGen series models.\n"
                f"Supported tasks for this model: {supported_tasks}"
            )
            
        if batch_mode:
            batch_directory = str(batch_directory or "").strip()
            if not batch_directory or not os.path.isdir(batch_directory):
                raise ValueError("批量模式需要有效的文件夹路径")
            supported_ext = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff"}
            files = [
                os.path.join(batch_directory, f)
                for f in os.listdir(batch_directory)
                if os.path.splitext(f)[1].lower() in supported_ext
            ]
            files.sort()
            if not files:
                raise ValueError("批量模式文件夹中未找到图片")
            saved_count = 0
            for index, file_path in enumerate(files):
                pil_image = Image.open(file_path).convert("RGB")
                result = describe_single_pil_image(pil_image, model, processor, prompt, device, dtype, num_beams, max_new_tokens, do_sample)
                filename = os.path.basename(file_path)
                base_name = os.path.splitext(filename)[0]
                txt_path = os.path.join(batch_directory, f"{base_name}.txt")
                with open(txt_path, "w", encoding="utf-8") as file_handle:
                    file_handle.write(result)
                saved_count += 1
            out_result = "\n".join([
                "批量模式已完成",
                f"文件夹: {batch_directory}",
                f"任务: {task}",
                f"图片数量: {len(files)}",
                f"文本已保存: {saved_count}",
            ])
        elif len(image.shape) == 4 and image.shape[0] > 1:
            results = []
            for index in range(image.shape[0]):
                single_image = image[index:index + 1]
                result = describe_single_image(single_image, model, processor, prompt, device, dtype, num_beams, max_new_tokens, do_sample)
                results.append(f"第{index + 1}张:\n{result}")
            out_result = "\n\n".join(results)
        else:
            out_result = describe_single_image(image, model, processor, prompt, device, dtype, num_beams, max_new_tokens, do_sample)

        self._apply_unload_mode(unload_mode)

        zhiai_log(f"Described single image: {out_result}")
        return out_result,
