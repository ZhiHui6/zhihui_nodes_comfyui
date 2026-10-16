import os
import torch
import numpy as np
import json
import uuid
import time
import asyncio
import base64
from io import BytesIO
from PIL import Image

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    print("警告: 未安装openai库，自定义API调用功能将不可用")
    OPENAI_AVAILABLE = False
    OpenAI = None

try:
    from server import PromptServer
    import aiohttp
    from aiohttp import web
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    print("警告: 无法导入PromptServer，API配置功能将不可用")
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None
    aiohttp = None
    web = None

current_dir = os.path.dirname(os.path.abspath(__file__))

TEMPLATE_CATEGORY_MAX_LEN = 24
CUSTOM_CONFIG_KEYS = ["custom_1", "custom_2", "custom_3", "custom_4", "custom_5", "custom_6"]

BATCH_CONFIG_FILE = os.path.join(current_dir, "batch_config.json")
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
DEFAULT_BATCH_PROGRESS = {
    "current_folder": "",
    "processed_folders": [],
    "total_folders": 0,
    "current_folder_index": 0,
}


def load_batch_config():
    if os.path.exists(BATCH_CONFIG_FILE):
        try:
            with open(BATCH_CONFIG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data if isinstance(data, dict) else {}
        except Exception as e:
            print(f"[ZhiAI] 读取批处理配置失败: {e}")
    return {}


def save_batch_config(config):
    try:
        tmp_path = BATCH_CONFIG_FILE + ".tmp"
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, BATCH_CONFIG_FILE)
        return True
    except Exception as e:
        print(f"[ZhiAI] 保存批处理配置失败: {e}")
        return False


def get_folder_read_mode():
    mode = str(load_batch_config().get("folder_read_mode") or "recursive").strip().lower()
    return "sequential" if mode == "sequential" else "recursive"


def save_batch_progress(progress):
    config = load_batch_config()
    config["batch_progress"] = progress
    save_batch_config(config)


def get_batch_progress():
    progress = load_batch_config().get("batch_progress")
    if not isinstance(progress, dict):
        return dict(DEFAULT_BATCH_PROGRESS)
    merged = dict(DEFAULT_BATCH_PROGRESS)
    merged.update(progress)
    if not isinstance(merged.get("processed_folders"), list):
        merged["processed_folders"] = []
    return merged


def _collect_images_in_folder(folder_path):
    """单层读取（不递归），按文件名排序。"""
    image_files = []
    try:
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if not os.path.isfile(file_path):
                continue
            if os.path.splitext(file.lower())[1] in VALID_IMAGE_EXTENSIONS and os.access(file_path, os.R_OK):
                image_files.append(file_path)
    except PermissionError:
        raise PermissionError(f"无权限访问文件夹: {folder_path}")
    image_files.sort(key=lambda x: os.path.basename(x).lower())
    return image_files


def _collect_images_recursive(folder_path):
    """递归遍历全部子文件夹，按文件名排序。"""
    image_files = []
    for root, _dirs, files in os.walk(folder_path):
        for file in files:
            if os.path.splitext(file.lower())[1] not in VALID_IMAGE_EXTENSIONS:
                continue
            full_path = os.path.join(root, file)
            if os.access(full_path, os.R_OK):
                image_files.append(full_path)
    image_files.sort(key=lambda x: os.path.basename(x).lower())
    return image_files

def _platform_option_value(entry, key):
    if isinstance(entry, dict):
        name = entry.get("name")
        if isinstance(name, str) and name.strip():
            return name.strip()
    return key

def platform_options():
    config = {}
    try:
        path = os.path.join(current_dir, "api_config.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                config = json.load(f) or {}
    except Exception as e:
        print(f"读取平台列表失败: {e}")
        config = {}
    custom_configs = config.get("custom_configs") or {}
    options = [_platform_option_value(custom_configs.get(key), key) for key in CUSTOM_CONFIG_KEYS]
    active = config.get("active_target")
    default = _platform_option_value(custom_configs.get(active), active) if active in CUSTOM_CONFIG_KEYS else options[0]
    return options, default


def _entry_models(entry):
    """读取配置条目的模型列表：models 优先（字符串去重），缺失/为空时用 model_name 兜底。"""
    if not isinstance(entry, dict):
        return []
    models = entry.get("models")
    result = []
    if isinstance(models, list):
        for item in models:
            if isinstance(item, str) and item.strip() and item.strip() not in result:
                result.append(item.strip())
    if not result:
        fallback = entry.get("model_name")
        if isinstance(fallback, str) and fallback.strip():
            result.append(fallback.strip())
    return result


def model_options():
    """节点「模型」下拉的选项 = 当前活动自定义配置的模型列表（随 INPUT_TYPES 实时读取）。"""
    config = {}
    try:
        path = os.path.join(current_dir, "api_config.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                config = json.load(f) or {}
    except Exception as e:
        print(f"读取模型列表失败: {e}")
        config = {}
    custom_configs = config.get("custom_configs") or {}
    active = config.get("active_target")
    if active not in CUSTOM_CONFIG_KEYS:
        active = CUSTOM_CONFIG_KEYS[0]
    models = _entry_models(custom_configs.get(active))
    return models, (models[0] if models else "")

def _load_iuo_prompt_presets():
    path = os.path.join(current_dir, "image_understanding_prompt_presets.json")
    if not os.path.exists(path):
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception as e:
        print(f"读取预设模式失败: {e}")
        return {}

IUO_PROMPT_PRESETS = _load_iuo_prompt_presets()

def preset_prompt_options():
    presets = IUO_PROMPT_PRESETS.get("default")
    if not isinstance(presets, dict) or not presets:
        return ["Ignore"]
    keys = [key for key in presets.keys() if key != "Ignore"] or ["Ignore"]
    return keys or ["Ignore"]

def get_preset_prompt(name):
    presets = IUO_PROMPT_PRESETS.get("default")
    if not isinstance(presets, dict):
        return ""
    text = presets.get(name)
    return text if isinstance(text, str) else ""

class ImageUnderstandingOnline:
    DESCRIPTION = "Understands images through any OpenAI-compatible multimodal endpoint and outputs text, with platform switching on the node."

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    OUTPUT_NODE = True
    INPUT_IS_LIST = True
    FUNCTION = "analyze_image"
    CATEGORY = "Zhi.AI/Image Understanding"
    
    def __init__(self):
        self.api_config_path = os.path.join(current_dir, "api_config.json")
        self.api_config = self.load_api_config()

    def load_api_config(self):
        try:
            if os.path.exists(self.api_config_path):
                with open(self.api_config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)

                if "active_target" not in config:
                    config["active_target"] = config.get("active_custom") or CUSTOM_CONFIG_KEYS[0]
                legacy_keys = ("api_keys", "active_platform")
                needs_save = any(key in config for key in legacy_keys)
                if config.get("active_target") not in CUSTOM_CONFIG_KEYS:
                    config["active_target"] = CUSTOM_CONFIG_KEYS[0]
                    needs_save = True
                if needs_save:
                    for key in legacy_keys:
                        config.pop(key, None)
                    self.save_api_config(config)
                return config
            else:
                default_config = {
                    "custom_configs": {
                        key: {
                            "name": "",
                            "api_base": "",
                            "model_name": "",
                            "api_key": "",
                            "active": False
                        } for key in CUSTOM_CONFIG_KEYS
                    },
                    "active_target": "custom_1",
                    "notes": "此文件用于存储图像理解在线版节点的通讯配置。请妥善保管您的API密钥，不要将其分享给他人。"
                }
                self.save_api_config(default_config)
                return default_config
        except Exception as e:
            print(f"加载API配置文件失败: {e}")
            return {"custom_configs": {}, "active_target": "custom_1"}
    
    def save_api_config(self, config):
        try:
            with open(self.api_config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=4)
            return True
        except Exception as e:
            print(f"保存API配置文件失败: {e}")
            return False

    def tensor_to_base64(self, tensor, size_limitation=None):
        if tensor.max() <= 1.0:
            tensor = tensor * 255.0
        
        if len(tensor.shape) == 4:
            tensor = tensor.squeeze(0)
        
        if tensor.shape[0] == 3:
            tensor = tensor.permute(1, 2, 0)
        
        image_array = tensor.cpu().numpy().astype(np.uint8)
        image = Image.fromarray(image_array)

        try:
            if size_limitation is not None:
                target = int(size_limitation)
                if target > 0:
                    target = min(target, 2500)
                    w, h = image.size
                    long_edge = max(w, h)
                    
                    if long_edge > target:
                        scale = target / float(long_edge)
                        new_w = max(1, int(round(w * scale)))
                        new_h = max(1, int(round(h * scale)))
                        image = image.resize((new_w, new_h), Image.LANCZOS)
        except Exception:
            pass
        
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def collect_image_tensors(self, images):
        def flatten(value):
            if value is None:
                return []
            if isinstance(value, (list, tuple)):
                collected = []
                for item in value:
                    collected.extend(flatten(item))
                return collected
            return [value]

        def is_image(value):
            return hasattr(value, "shape") and hasattr(value, "ndim") and value.ndim >= 2

        tensors = []
        for value in flatten(images):
            if not is_image(value):
                continue
            if value.ndim == 4:
                for index in range(value.shape[0]):
                    tensors.append(value[index:index + 1])
            elif value.ndim == 3:
                tensors.append(value.unsqueeze(0))
            else:
                tensors.append(value)
        return tensors


    @staticmethod
    def _load_image_array(image_path):
        """读盘为 (H,W,3) float32 [0,1]，与节点内部张量约定一致。"""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片文件未找到: {image_path}")
        ext = os.path.splitext(image_path.lower())[1]
        if ext not in VALID_IMAGE_EXTENSIONS:
            raise ValueError(f"不支持的图片格式: {ext}")
        image = Image.open(image_path)
        if image.mode != "RGB":
            image = image.convert("RGB")
        return np.array(image).astype(np.float32) / 255.0

    @staticmethod
    def _save_description(image_file, description):
        """结果写入图片同目录同名的 .txt。"""
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write(description or "")

    @staticmethod
    def _get_subfolders_sorted(folder_path):
        if not folder_path or not folder_path.strip():
            return []
        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")
        subfolders = []
        try:
            for item in os.listdir(folder_path):
                item_path = os.path.join(folder_path, item)
                if os.path.isdir(item_path) and os.access(item_path, os.R_OK):
                    subfolders.append(item_path)
        except PermissionError:
            raise PermissionError(f"无权限访问文件夹: {folder_path}")
        subfolders.sort(key=lambda x: os.path.basename(x).lower())
        return subfolders

    def _batch_process_image(self, ctx, image_path):
        """单张图片：读盘 → (1,3,H,W) 张量 → 调接口 → 结果写入同名 .txt。"""
        image_array = self._load_image_array(image_path)
        tensor = torch.from_numpy(np.ascontiguousarray(image_array)).permute(2, 0, 1).unsqueeze(0)
        result = self.call_custom_api(
            ctx["api_base"], ctx["api_key"], tensor, ctx["prompt"], ctx["model"],
            ctx["max_tokens"], ctx["temperature"], ctx["timeout"],
            ctx["sampling_params"], ctx["size_limitation"],
        )
        self._save_description(image_path, result)
        return result

    def _batch_try_process(self, ctx, image_path, skip_exists):
        """返回 (状态, 错误详情)；状态 ∈ processed / skipped / failed。"""
        if skip_exists:
            txt_file = os.path.splitext(image_path)[0] + ".txt"
            if os.path.exists(txt_file):
                return "skipped", ""
        try:
            self._batch_process_image(ctx, image_path)
            return "processed", ""
        except Exception as e:
            return "failed", str(e)

    @staticmethod
    def _batch_summary(header, processed, failed, skipped, duration, error_details):
        lines = [header]
        lines.append(f"成功: {processed}")
        lines.append(f"失败: {failed}")
        if skipped:
            lines.append(f"跳过（已存在 txt）: {skipped}")
        lines.append(f"耗时: {duration:.2f} 秒")
        if error_details:
            lines.append("")
            lines.append("失败详情:")
            lines.extend(error_details[:20])
            if len(error_details) > 20:
                lines.append(f"... 还有 {len(error_details) - 20} 个错误")
        return "\n".join(lines)

    def _run_batch_recursive(self, ctx, folder_path, skip_exists, status_messages, started):
        import time as _time
        image_paths = _collect_images_recursive(folder_path)
        if not image_paths:
            status_messages.append(f"❌ 错误: 文件夹内未找到图片: {folder_path}")
            return self._make_result("", status_messages)

        total = len(image_paths)
        processed = failed = skipped = 0
        error_details = []
        for image_path in image_paths:
            status, detail = self._batch_try_process(ctx, image_path, skip_exists)
            if status == "processed":
                processed += 1
            elif status == "skipped":
                skipped += 1
            else:
                failed += 1
                error_details.append(f"[{os.path.basename(image_path)}] {detail}")

        duration = _time.time() - started
        status_messages.append(f"✅ 递归遍历完成：成功 {processed} / 失败 {failed} / 跳过 {skipped}（共 {total} 张）")
        summary = self._batch_summary(
            f"递归遍历模式处理完成!\n总图片数: {total}", processed, failed, skipped, duration, error_details
        )
        return self._make_result(summary, status_messages)

    def _run_batch_sequential(self, ctx, folder_path, skip_exists, status_messages, started):
        import time as _time
        subfolders = self._get_subfolders_sorted(folder_path)
        if not subfolders:
            status_messages.append(f"❌ 错误: 未找到子文件夹: {folder_path}")
            return self._make_result("", status_messages)

        total_folders = len(subfolders)
        total_processed = total_failed = total_skipped = 0
        all_error_details = []
        folder_results = []

        progress = get_batch_progress()
        processed_folders = set(progress.get("processed_folders", []))
        start_index = 0
        for index, subfolder in enumerate(subfolders):
            if subfolder not in processed_folders:
                start_index = index
                break
        else:
            start_index = total_folders

        for folder_index in range(start_index, total_folders):
            subfolder = subfolders[folder_index]
            folder_name = os.path.basename(subfolder)
            save_batch_progress({
                "current_folder": subfolder,
                "processed_folders": list(processed_folders),
                "total_folders": total_folders,
                "current_folder_index": folder_index,
            })

            image_paths = _collect_images_in_folder(subfolder)
            if not image_paths:
                processed_folders.add(subfolder)
                continue

            folder_processed = folder_failed = folder_skipped = 0
            for image_path in image_paths:
                status, detail = self._batch_try_process(ctx, image_path, skip_exists)
                if status == "processed":
                    folder_processed += 1
                    total_processed += 1
                elif status == "skipped":
                    folder_skipped += 1
                    total_skipped += 1
                else:
                    folder_failed += 1
                    total_failed += 1
                    all_error_details.append(f"[{folder_name}/{os.path.basename(image_path)}] {detail}")

            processed_folders.add(subfolder)
            folder_results.append(
                f"📁 {folder_name}: {folder_processed} 成功, {folder_failed} 失败, {folder_skipped} 跳过"
            )

        save_batch_progress(dict(DEFAULT_BATCH_PROGRESS))

        duration = _time.time() - started
        status_messages.append(
            f"✅ 顺序轮次完成：{total_folders} 个文件夹，成功 {total_processed} / 失败 {total_failed} / 跳过 {total_skipped}"
        )
        summary = self._batch_summary(
            f"顺序轮次模式处理完成!\n总文件夹数: {total_folders}", total_processed, total_failed,
            total_skipped, duration, all_error_details,
        )
        summary += "\n\n各文件夹详情:\n" + "\n".join(folder_results)
        return self._make_result(summary, status_messages)

    def _run_batch(self, ctx, folder_path, skip_exists, status_messages):
        import time as _time
        started = _time.time()
        folder_path = (folder_path or "").strip()

        if not folder_path:
            status_messages.append("❌ 错误: 批处理模式需要设置「批处理路径」；批处理只从文件夹读取，不使用图像端口")
            return self._make_result("", status_messages)
        if not os.path.exists(folder_path):
            status_messages.append(f"❌ 错误: 文件夹未找到: {folder_path}")
            return self._make_result("", status_messages)
        if not os.path.isdir(folder_path):
            status_messages.append(f"❌ 错误: 路径不是文件夹: {folder_path}")
            return self._make_result("", status_messages)

        folder_read_mode = get_folder_read_mode()
        status_messages.append(
            f"📦 批处理模式: 启用（{'顺序轮次' if folder_read_mode == 'sequential' else '递归遍历'}）"
        )
        status_messages.append(f"📁 批处理路径: {folder_path}")

        try:
            if folder_read_mode == "sequential":
                return self._run_batch_sequential(ctx, folder_path, skip_exists, status_messages, started)
            return self._run_batch_recursive(ctx, folder_path, skip_exists, status_messages, started)
        except Exception as e:
            status_messages.append(f"❌ 批处理失败: {e}")
            return self._make_result("", status_messages)

    @staticmethod
    def _unwrap(value):
        if isinstance(value, (list, tuple)):
            if not value:
                return None
            if len(value) == 1:
                return ImageUnderstandingOnline._unwrap(value[0])
            if all(isinstance(item, str) for item in value):
                return "\n".join(item for item in value if item)
            return value[0]
        return value

    @classmethod
    def _scalar(cls, value, caster, fallback):
        unwrapped = cls._unwrap(value)
        if unwrapped is None or unwrapped == "":
            return fallback
        try:
            return caster(unwrapped)
        except (TypeError, ValueError):
            return fallback

    @staticmethod
    def _apply_output_language(prompt: str, output_language: str) -> str:
        if output_language == "Chinese":
            return prompt + " Please respond in Chinese."
        if output_language == "English":
            return prompt + " Please respond in English."
        if output_language == "Chinese&English":
            return prompt + " Please respond in both Chinese and English, first describe in Chinese, then describe in English."
        return prompt

    @staticmethod
    def _apply_prompt_length(prompt: str, prompt_length: str) -> str:
        if not isinstance(prompt, str) or not prompt.strip():
            return prompt
        guidance = {
            "Short": " Keep the answer to one or two sentences without expanding.",
            "Medium": " Answer in a single concise paragraph of moderate length.",
            "Long": " Provide a thorough multi-paragraph answer covering as much visible detail as possible.",
        }.get(prompt_length or "", "")
        return prompt + guidance if guidance else prompt

    @staticmethod
    def _apply_prompt_format(prompt: str, prompt_format: str) -> str:
        if not isinstance(prompt, str) or not prompt.strip():
            return prompt
        guidance = {
            "Tag": " Output only comma-separated tags, without sentences or explanations.",
            "Structured JSON": " Output only a valid JSON object, without any explanation or code fence.",
        }.get(prompt_format or "", "")
        return prompt + guidance if guidance else prompt

    def _normalize_openai_base_url(self, api_base: str) -> str:
        try:
            if not api_base:
                return api_base
            url = api_base.strip()
            if url.endswith('/chat/completions'):
                url = url.rsplit('/chat/completions', 1)[0]
            return url.rstrip('/')
        except Exception:
            return api_base

    def call_custom_api(self, api_base, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60, sampling_params=None, size_limitation=None):
        try:
            if not OPENAI_AVAILABLE:
                raise Exception("完全自定义模式需要安装 OpenAI Python SDK。请执行: pip install openai")
            client = OpenAI(
                base_url=self._normalize_openai_base_url(api_base),
                api_key=api_key
            )

            content_items = [{
                'type': 'text',
                'text': prompt,
            }]
            if image_tensor is not None:
                image_base64 = self.tensor_to_base64(image_tensor, size_limitation)
                if image_base64.startswith('data:image/'):
                    image_base64 = image_base64.split(',', 1)[1]
                content_items.append({
                    'type': 'image_url',
                    'image_url': {
                        'url': f"data:image/png;base64,{image_base64}",
                    },
                })

            messages = [{
                'role': 'user',
                'content': content_items,
            }]

            extra_kwargs = {}
            extra_body = {}
            if sampling_params:
                for k in ("top_p", "presence_penalty", "frequency_penalty", "seed"):
                    v = sampling_params.get(k)
                    if v is not None:
                        extra_kwargs[k] = v
                for k in ("top_k", "repetition_penalty"):
                    v = sampling_params.get(k)
                    if v is not None:
                        extra_body[k] = v
            if extra_body:
                extra_kwargs["extra_body"] = extra_body
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False,
                **extra_kwargs
            )

            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI兼容调用失败: {str(e)}")

    def call_custom_api_with_content(self, api_base, api_key, content_items, model, max_tokens, temperature, timeout=60, sampling_params=None):
        try:
            if not OPENAI_AVAILABLE:
                raise Exception("完全自定义模式需要安装 OpenAI Python SDK。请执行: pip install openai")
            client = OpenAI(
                base_url=self._normalize_openai_base_url(api_base),
                api_key=api_key
            )

            messages = [{
                'role': 'user',
                'content': content_items,
            }]

            extra_kwargs = {}
            extra_body = {}
            if sampling_params:
                for k in ("top_p", "presence_penalty", "frequency_penalty", "seed"):
                    v = sampling_params.get(k)
                    if v is not None:
                        extra_kwargs[k] = v
                for k in ("top_k", "repetition_penalty"):
                    v = sampling_params.get(k)
                    if v is not None:
                        extra_body[k] = v
            if extra_body:
                extra_kwargs["extra_body"] = extra_body
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False,
                **extra_kwargs
            )

            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI兼容调用失败: {str(e)}")
    
    @classmethod
    def INPUT_TYPES(cls):
        platforms, default_platform = platform_options()
        models, default_model = model_options()
        preset_keys = preset_prompt_options()
        return {
            "required": {
                "user_prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "user prompt",
                    "tooltip": "用于图像分析的用户提示词。描述你想了解的图像内容。"
                }),
                "system_prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "system prompt",
                    "tooltip": "用于引导模型行为与回复风格的系统提示词。"
                }),
                "platform": (platforms, {
                    "default": default_platform,
                    "tooltip": "选择要使用的自定义配置（平台）。"
                }),
                "model": (models or [""], {
                    "default": default_model,
                    "tooltip": "选择当前平台下要使用的模型（在通讯配置界面中为每个自定义配置维护模型列表，可添加多组）。"
                }),
                "use_preset": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "使用预设提示词组。开启时：模式/篇幅/格式/语言生效，用户提示词与系统提示词被忽略；关闭时：预设组被忽略，改用用户提示词与系统提示词。"
                }),
                "preset_prompt": (preset_keys, {
                    "default": preset_keys[0],
                    "tooltip": "预设模式：选择内置的图像理解提示词模板，选中后其内容将作为用户提示词使用。"
                }),
                "prompt_length": (["Standard", "Short", "Medium", "Long"], {
                    "default": "Standard",
                    "tooltip": "输出篇幅预设。Standard 保持预设自身的篇幅；Short/Medium/Long 会向提示词追加长度约束（面板显示为 标准/短/中/长）。"
                }),
                "prompt_format": (["Structured JSON", "Tag", "Natural"], {
                    "default": "Natural",
                    "tooltip": "输出格式预设。Natural 不追加任何内容（模型默认）；Tag 输出逗号分隔标签；Structured JSON 输出 JSON 对象（面板显示为 结构化Json/Tag标签/自然语言）。"
                }),
                "output_language": (["Chinese", "English", "Chinese&English"], {
                    "default": "Chinese",
                    "tooltip": "输出语言：中文、英文或中英双语。"
                }),
                "size_limitation": ("INT", {
                    "default": 1280,
                    "min": 0,
                    "max": 2500,
                    "step": 1,
                    "tooltip": "以长边为准的缩放尺寸（像素）。0 表示不缩放，上限 2500 像素。"
                }),
                "max_tokens": ("INT", {
                    "default": 4096,
                    "min": 256,
                    "max": 8192,
                    "step": 1,
                    "tooltip": "生成回复的最大词元（token）数量。"
                }),
                "temperature": ("FLOAT", {
                    "default": 0.3,
                    "min": 0.1,
                    "max": 2.0,
                    "step": 0.1,
                    "tooltip": "温度参数控制生成随机性。值越低越稳定集中，值越高越有创意。"
                }),
                "repetition_penalty": ("FLOAT", {
                    "default": 1.05,
                    "min": 0.1,
                    "max": 2.0,
                    "step": 0.05,
                    "tooltip": "重复惩罚系数，防止生成重复内容。较大的值使输出更保守，避免重复。"
                }),
                "top_k": ("INT", {
                    "default": 40,
                    "min": 1,
                    "max": 100,
                    "step": 1,
                    "tooltip": "Top K采样参数，控制从概率最高的K个词中采样。较小的值使输出更集中，较大的值增加多样性。"
                }),
                "top_p": ("FLOAT", {
                    "default": 0.9,
                    "min": 0.0,
                    "max": 1.0,
                    "step": 0.05,
                    "tooltip": "Top P采样参数（核采样），控制累积概率阈值。较小的值使输出更集中，较大的值增加多样性。"
                }),
                "seed": ("INT", {
                    "default": -1,
                    "min": -1,
                    "max": 0xffffffffffffffff,
                    "tooltip": "随机种子用于复现结果。使用 -1 表示随机种子。"
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "启用批处理模式：只从「批处理路径」的文件夹读取图片，逐张请求并把结果写入图片同名的 .txt。开启后图像端口不参与。"
                }),
                "batch_folder_path": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "tooltip": "批处理读取的文件夹路径。可拖入文件夹、点「设定」选择目录，或直接输入。"
                }),
                "skip_exists": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "跳过已存在同名 .txt 的图片（断点续跑时很有用）。"
                }),
            },
            "optional": {
                "images": ("IMAGE", {
                    "tooltip": "图像输入。接单张图像或图像列表均可；多张时全部图片合并进同一次请求（与 LM Studio 节点一致）。请配合多媒体加载器的「仅图片」模式使用。"
                }),
                "text_prompt": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "forceInput": True,
                    "tooltip": "文本提示词输入。接入任意字符串输出后，连入的文本将替换整个提示词区：预设、用户提示词与系统提示词全部忽略。"
                }),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            }
        }
    
    def get_final_prompt(self, system_prompt, user_prompt, preset_text="", use_preset=True, prompt_length="Standard", prompt_format="Natural", output_language="Chinese"):
        preset_active = bool(use_preset) and bool((preset_text or "").strip())
        if preset_active:
            body = user_prompt.strip() if user_prompt.strip() else preset_text.strip()
            body = self._apply_output_language(body, output_language)
            body = self._apply_prompt_length(body, prompt_length)
            body = self._apply_prompt_format(body, prompt_format)
            return body
        body = user_prompt.strip()
        if system_prompt.strip():
            return f"System: {system_prompt.strip()}\n\nUser: {body}"
        return body

    def _make_result(self, result, status_messages):
        return {"ui": {"status": status_messages}, "result": (result,)}

    def resolve_platform_key(self, custom_configs, requested):
        requested = (requested or "").strip()
        if not requested:
            return ""
        if requested in custom_configs:
            return requested
        for key in CUSTOM_CONFIG_KEYS:
            entry = custom_configs.get(key)
            if isinstance(entry, dict) and (entry.get("name") or "").strip() == requested:
                return key
        return ""

    def analyze_image(self, user_prompt, system_prompt, preset_prompt, size_limitation, max_tokens, temperature, top_k, repetition_penalty, top_p, seed, platform="", model="", batch_mode=False, batch_folder_path="", skip_exists=False, use_preset=True, prompt_length="Standard", prompt_format="Natural", output_language="Chinese", text_prompt=None, images=None, unique_id=None, extra_pnginfo=None):
        import random
        import time

        user_prompt = self._unwrap(user_prompt) or ""
        system_prompt = self._unwrap(system_prompt) or ""
        preset_prompt = self._unwrap(preset_prompt) or ""
        platform = self._unwrap(platform) or ""
        model = self._unwrap(model) or ""
        prompt_length = self._unwrap(prompt_length) or "Standard"
        prompt_format = self._unwrap(prompt_format) or "Natural"
        output_language = self._unwrap(output_language) or "Chinese"
        use_preset = self._unwrap(use_preset)
        if not isinstance(use_preset, bool):
            use_preset = str(use_preset).strip().lower() in ("1", "true", "yes", "on")
        batch_mode = self._unwrap(batch_mode)
        if not isinstance(batch_mode, bool):
            batch_mode = str(batch_mode).strip().lower() in ("1", "true", "yes", "on")
        skip_exists = self._unwrap(skip_exists)
        if not isinstance(skip_exists, bool):
            skip_exists = str(skip_exists).strip().lower() in ("1", "true", "yes", "on")
        batch_folder_path = str(self._unwrap(batch_folder_path) or "").strip()
        external_prompt = self._unwrap(text_prompt)
        external_prompt = external_prompt.strip() if isinstance(external_prompt, str) else ""
        size_limitation = self._scalar(size_limitation, int, 0)
        max_tokens = self._scalar(max_tokens, int, 2048)
        temperature = self._scalar(temperature, float, 0.7)
        top_k = self._scalar(top_k, int, 50)
        repetition_penalty = self._scalar(repetition_penalty, float, 1.0)
        top_p = self._scalar(top_p, float, 0.9)
        seed = self._scalar(seed, int, -1)

        status_messages = []
        
        if seed != -1:
            random.seed(seed)
            torch.manual_seed(seed)
            if torch.cuda.is_available():
                torch.cuda.manual_seed(seed)
        
        timeout = 60
        
        try:
            config = self.load_api_config()
            custom_configs = config.get("custom_configs", {})
            node_target = self.resolve_platform_key(custom_configs, platform)
            active_target = node_target or config.get("active_target", CUSTOM_CONFIG_KEYS[0])
            if active_target not in CUSTOM_CONFIG_KEYS:
                active_target = CUSTOM_CONFIG_KEYS[0]
            custom_config = custom_configs.get(active_target, {})
            if not node_target:
                if not custom_config or not custom_config.get("api_key"):
                    for key in CUSTOM_CONFIG_KEYS:
                        candidate = custom_configs.get(key) or {}
                        if candidate.get("api_key"):
                            custom_config = candidate
                            active_target = key
                            break
            if not custom_config:
                custom_config = custom_configs.get(CUSTOM_CONFIG_KEYS[0], {})
                active_target = CUSTOM_CONFIG_KEYS[0]

            api_key = custom_config.get("api_key", "").strip()
            api_base = custom_config.get("api_base", "").strip()
            config_models = _entry_models(custom_config)
            api_model_name = (model or "").strip()
            if api_model_name and api_model_name not in config_models:
                status_messages.append(f"⚠️ 节点所选模型不在当前配置的模型列表中，已回落默认模型")
                api_model_name = ""
            if not api_model_name:
                api_model_name = (custom_config.get("model_name") or "").strip()
                if api_model_name not in config_models and config_models:
                    api_model_name = config_models[0]
            custom_name = custom_config.get("name") or "自定义配置"

            if node_target:
                status_messages.append(f"✅ 节点指定平台: {platform}")
            if not api_key:
                error_msg = f"自定义配置 {custom_name} 尚未设置API密钥，请在通讯配置界面中配置"
                status_messages.append(f"❌ 错误: {error_msg}")
                return self._make_result("", status_messages)
            if not api_base:
                error_msg = "自定义配置下必须在通讯配置界面中设置API基础地址"
                status_messages.append(f"❌ 错误: {error_msg}")
                return self._make_result("", status_messages)
            if not api_model_name:
                error_msg = "自定义配置下必须在通讯配置界面中设置模型名称"
                status_messages.append(f"❌ 错误: {error_msg}")
                return self._make_result("", status_messages)

            status_messages.append(f"✅ 使用自定义配置: {custom_name}")
            status_messages.append(f"✅ API地址: {api_base}")
            status_messages.append(f"✅ 模型: {api_model_name}")
            
            preset_text = get_preset_prompt(preset_prompt)
            preset_active = bool(use_preset) and (preset_prompt or "").strip() != "Ignore"

            if external_prompt:
                final_prompt = external_prompt
                status_messages.append("✅ 提示词由文本端口提供")
            else:
                if preset_active:
                    status_messages.append(f"✅ 预设模式: {preset_prompt}")
                final_prompt = self.get_final_prompt(
                    system_prompt,
                    user_prompt,
                    preset_text if preset_active else "",
                    preset_active,
                    prompt_length,
                    prompt_format,
                    output_language,
                )

            if batch_mode:
                if self.collect_image_tensors(images):
                    status_messages.append(
                        "❌ 错误: 批处理模式只从文件夹读取，不会使用图像端口数据；请断开上游连线，或关闭批处理模式"
                    )
                    return self._make_result("", status_messages)
                batch_ctx = {
                    "api_key": api_key,
                    "api_base": api_base,
                    "model": api_model_name,
                    "prompt": final_prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "timeout": timeout,
                    "size_limitation": size_limitation,
                    "sampling_params": self._prepare_sampling(temperature, top_k, repetition_penalty, top_p, seed),
                }
                return self._run_batch(batch_ctx, batch_folder_path, skip_exists, status_messages)

            image_list = self.collect_image_tensors(images)

            if not image_list:
                status_messages.append("ℹ️ 未提供图片输入，改为纯文本对话模式")
                try:
                    sampling_params = self._prepare_sampling(temperature, top_k, repetition_penalty, top_p, seed)
                    result = self._process_single_image(
                        api_key, None, final_prompt,
                        api_model_name, max_tokens, temperature, timeout, api_base, sampling_params, size_limitation
                    )
                    status_messages.append("✅ 文本对话完成")
                    return self._make_result(result, status_messages)
                except Exception as e:
                    error_msg = f"文本对话失败: {str(e)}"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return self._make_result("", status_messages)

            try:
                if len(image_list) > 1:
                    status_messages.append(f"🔄 正在处理 {len(image_list)} 张图片...")
                    content_items = [{"type": "text", "text": final_prompt}]
                    for tensor in image_list:
                        image_base64 = self.tensor_to_base64(tensor, size_limitation)
                        if image_base64.startswith("data:image/"):
                            image_base64 = image_base64.split(",", 1)[1]
                        content_items.append({
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{image_base64}"},
                        })
                    if not api_base:
                        raise ValueError("自定义配置下必须提供API基础地址")
                    sampling_params = self._prepare_sampling(temperature, top_k, repetition_penalty, top_p, seed)
                    result = self.call_custom_api_with_content(
                        api_base, api_key, content_items, api_model_name, max_tokens, temperature, timeout, sampling_params
                    )
                    status_messages.append("✅ 多图处理完成")
                else:
                    status_messages.append("🔄 正在处理图片...")
                    sampling_params = self._prepare_sampling(temperature, top_k, repetition_penalty, top_p, seed)
                    result = self._process_single_image(
                        api_key, image_list[0], final_prompt,
                        api_model_name, max_tokens, temperature, timeout, api_base, sampling_params, size_limitation
                    )
                    status_messages.append("✅ 图片分析完成")
                return self._make_result(result, status_messages)
            except Exception as e:
                error_msg = f"图片分析失败: {str(e)}"
                status_messages.append(f"❌ 错误: {error_msg}")
                return self._make_result("", status_messages)

        except Exception as e:
            error_msg = f"图片分析失败: {str(e)}"
            status_messages.append(f"❌ 严重错误: {error_msg}")
            return self._make_result("", status_messages)

    def _process_single_image(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout, api_base=None, sampling_params=None, size_limitation=None):
        try:
            if not api_base:
                raise ValueError("自定义模式下必须提供API基础地址")
            return self.call_custom_api(api_base, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout, sampling_params, size_limitation)
        except Exception as e:
            raise Exception(f"API调用失败: {str(e)}")

    def _prepare_sampling(self, temperature, top_k, repetition_penalty, top_p, seed):
        params = {
            "top_k": top_k,
            "repetition_penalty": repetition_penalty,
            "top_p": top_p,
        }
        if seed is not None and seed > 0:
            params["seed"] = seed
        return params
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

if PROMPT_SERVER_AVAILABLE:
    _api_instance = None
    
    def get_api_instance():
        global _api_instance
        if _api_instance is None:
            _api_instance = ImageUnderstandingOnline()
        return _api_instance
    
    @PromptServer.instance.routes.get("/zhiai_nodes/communication_config")
    async def get_communication_config(request):
        try:
            instance = get_api_instance()
            config = instance.load_api_config()
            return web.json_response(config)
        except Exception as e:
            print(f"获取通讯配置失败: {e}")
            return web.json_response(
                {"error": f"获取通讯配置失败: {str(e)}"}, 
                status=500
            )
    
    @PromptServer.instance.routes.post("/zhiai_nodes/communication_config")
    async def save_communication_config(request):
        try:
            instance = get_api_instance()
            data = await request.json()
            
            if not isinstance(data, dict):
                return web.json_response(
                    {"error": "无效的配置数据格式"}, 
                    status=400
                )
            
            success = instance.save_api_config(data)
            if success:
                instance.api_config = instance.load_api_config()
                return web.json_response({"success": True, "message": "通讯配置保存成功"})
            else:
                return web.json_response(
                    {"error": "通讯配置保存失败"}, 
                    status=500
                )
        except Exception as e:
            print(f"保存通讯配置失败: {e}")
            return web.json_response(
                {"error": f"保存通讯配置失败: {str(e)}"}, 
                status=500
            )

    _PLUGIN_ROOT = os.path.dirname(os.path.dirname(current_dir))
    _TEMPLATES_DIR = os.path.join(_PLUGIN_ROOT, "templates")
    IUO_TEMPLATES_FILE = os.path.join(_TEMPLATES_DIR, "system_prompt_templates.json")
    IUO_CATEGORIES_FILE = os.path.join(_TEMPLATES_DIR, "template_categories.json")

    def _clean_category(value):
        text = "".join(ch for ch in str(value or "").strip() if ch >= " " and ch != "\x7f")
        return text[:TEMPLATE_CATEGORY_MAX_LEN].strip()

    def _derive_categories(templates):
        names = []
        for template in templates:
            name = _clean_category(template.get("category"))
            if name and name not in names:
                names.append(name)
        return names

    def _load_iuo_templates():
        if os.path.exists(IUO_TEMPLATES_FILE):
            try:
                with open(IUO_TEMPLATES_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get("templates", [])
            except Exception:
                pass
        return []

    def _save_iuo_templates(templates):
        try:
            os.makedirs(_TEMPLATES_DIR, exist_ok=True)
            tmp_path = IUO_TEMPLATES_FILE + ".tmp"
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump({"templates": templates}, f, indent=2, ensure_ascii=False)
            os.replace(tmp_path, IUO_TEMPLATES_FILE)
            return True
        except Exception as e:
            print(f"[ZhiAI] 模板文件保存失败: {e}")
            return False

    def _load_iuo_categories():
        if os.path.exists(IUO_CATEGORIES_FILE):
            try:
                with open(IUO_CATEGORIES_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                items = data.get("categories", []) if isinstance(data, dict) else data
                names = []
                for item in items if isinstance(items, list) else []:
                    name = _clean_category(item)
                    if name and name not in names:
                        names.append(name)
                return names
            except Exception:
                pass
        return []

    def _save_iuo_categories(categories):
        try:
            os.makedirs(_TEMPLATES_DIR, exist_ok=True)
            tmp_path = IUO_CATEGORIES_FILE + ".tmp"
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump({"categories": categories}, f, indent=2, ensure_ascii=False)
            os.replace(tmp_path, IUO_CATEGORIES_FILE)
            return True
        except Exception as e:
            print(f"[ZhiAI] 分类文件保存失败: {e}")
            return False

    def _all_categories(templates):
        names = _derive_categories(templates)
        for name in _load_iuo_categories():
            if name not in names:
                names.append(name)
        return names

    def _gc_categories(templates):
        """模板增删改后回写分类列表：
        回收"曾被模板使用但因未持久化而丢失"的分类，删除"已无模板且从未被显式创建"的僵尸分类。"""
        used = _derive_categories(templates)
        stored = _load_iuo_categories()
        merged = list(stored)
        for name in used:
            if name not in merged:
                merged.append(name)
        if merged != stored:
            _save_iuo_categories(merged)
        return merged

    @PromptServer.instance.routes.get("/zhiai_nodes/image_understanding/templates")
    async def get_iuo_templates(request):
        templates = _load_iuo_templates()
        return web.json_response({
            "templates": templates,
            "categories": _all_categories(templates),
        })

    @PromptServer.instance.routes.post("/zhiai_nodes/template_categories/create")
    async def create_template_category(request):
        try:
            data = await request.json()
            name = _clean_category(data.get("name"))
            if not name:
                return web.json_response({"status": "error", "message": "Category name is required"}, status=400)
            categories = _load_iuo_categories()
            if name not in categories:
                categories.append(name)
                if not _save_iuo_categories(categories):
                    return web.json_response({"status": "error", "message": "Failed to save category"}, status=500)
            return web.json_response({
                "status": "success",
                "categories": _all_categories(_load_iuo_templates()),
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhiai_nodes/image_understanding/templates")
    async def create_iuo_template(request):
        try:
            data = await request.json()
            name = data.get("name", "").strip()
            content = data.get("content", "").strip()
            if not name:
                return web.json_response({"status": "error", "message": "Template name is required"}, status=400)
            templates = _load_iuo_templates()
            new_template = {
                "id": str(uuid.uuid4()),
                "name": name,
                "content": content,
                "category": _clean_category(data.get("category")),
                "created_at": int(time.time()),
                "updated_at": int(time.time())
            }
            templates.append(new_template)
            if _save_iuo_templates(templates):
                _gc_categories(templates)
                return web.json_response({"status": "success", "template": new_template})
            else:
                return web.json_response({"status": "error", "message": "Failed to save template"}, status=500)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.put("/zhiai_nodes/image_understanding/templates/{template_id}")
    async def update_iuo_template(request):
        try:
            template_id = request.match_info.get("template_id")
            data = await request.json()
            name = data.get("name", "").strip()
            content = data.get("content", "").strip()
            if not name:
                return web.json_response({"status": "error", "message": "Template name is required"}, status=400)
            templates = _load_iuo_templates()
            for i, template in enumerate(templates):
                if template["id"] == template_id:
                    templates[i]["name"] = name
                    templates[i]["content"] = content
                    if "category" in data:
                        templates[i]["category"] = _clean_category(data.get("category"))
                    templates[i]["updated_at"] = int(time.time())
                    if _save_iuo_templates(templates):
                        _gc_categories(templates)
                        return web.json_response({"status": "success", "template": templates[i]})
                    else:
                        return web.json_response({"status": "error", "message": "Failed to save template"}, status=500)
            return web.json_response({"status": "error", "message": "Template not found"}, status=404)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.delete("/zhiai_nodes/image_understanding/templates/{template_id}")
    async def delete_iuo_template(request):
        try:
            template_id = request.match_info.get("template_id")
            templates = _load_iuo_templates()
            new_templates = [t for t in templates if t["id"] != template_id]
            if len(new_templates) == len(templates):
                return web.json_response({"status": "error", "message": "Template not found"}, status=404)
            if _save_iuo_templates(new_templates):
                _gc_categories(new_templates)
                return web.json_response({"status": "success"})
            else:
                return web.json_response({"status": "error", "message": "Failed to save templates"}, status=500)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhiai_nodes/template_categories/rename")
    async def rename_template_category(request):
        try:
            data = await request.json()
            source = _clean_category(data.get("from"))
            target = _clean_category(data.get("to"))
            if not source:
                return web.json_response({"status": "error", "message": "Source category is required"}, status=400)
            templates = _load_iuo_templates()
            categories = _load_iuo_categories()
            stored = source in categories
            matched = 0
            for template in templates:
                if _clean_category(template.get("category")) == source:
                    template["category"] = target
                    matched += 1
            if not matched and not stored:
                return web.json_response({"status": "error", "message": "Category not found"}, status=404)
            if stored:
                merged = []
                for name in categories:
                    renamed = target if name == source else name
                    if renamed not in merged:
                        merged.append(renamed)
                if not _save_iuo_categories(merged):
                    return web.json_response({"status": "error", "message": "Failed to save categories"}, status=500)
            if matched and not _save_iuo_templates(templates):
                return web.json_response({"status": "error", "message": "Failed to save templates"}, status=500)
            return web.json_response({
                "status": "success",
                "updated": matched,
                "categories": _all_categories(templates),
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhiai_nodes/template_categories/remove")
    async def remove_template_category(request):
        try:
            data = await request.json()
            source = _clean_category(data.get("name"))
            if not source:
                return web.json_response({"status": "error", "message": "Category name is required"}, status=400)
            templates = _load_iuo_templates()
            categories = _load_iuo_categories()
            stored = source in categories
            matched = 0
            for template in templates:
                if _clean_category(template.get("category")) == source:
                    template["category"] = ""
                    matched += 1
            if not matched and not stored:
                return web.json_response({"status": "error", "message": "Category not found"}, status=404)
            if stored:
                categories.remove(source)
                if not _save_iuo_categories(categories):
                    return web.json_response({"status": "error", "message": "Failed to save categories"}, status=500)
            if matched and not _save_iuo_templates(templates):
                return web.json_response({"status": "error", "message": "Failed to save templates"}, status=500)
            return web.json_response({
                "status": "success",
                "updated": matched,
                "categories": _all_categories(templates),
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)


    _BATCH_FOLDER_SKIP = {
        "windows", "program files", "program files (x86)", "programdata", "appdata",
        "system volume information", "$recycle.bin", "recovery", "perflogs",
        "node_modules", "__pycache__", ".git",
    }

    def _batch_search_roots():
        """按名称定位文件夹时的候选根目录（与 LM Studio 节点同策略）。"""
        roots = []

        def push(path):
            if not path:
                return
            try:
                real = os.path.abspath(os.path.expanduser(str(path).strip()))
            except Exception:
                return
            if os.path.isdir(real) and real not in roots:
                roots.append(real)

        last = load_batch_config().get("last_batch_folder")
        if isinstance(last, str) and last.strip():
            push(os.path.dirname(os.path.abspath(last.strip())))
        try:
            import folder_paths  # type: ignore
            push(getattr(folder_paths, "base_path", ""))
        except Exception:
            pass
        home = os.path.expanduser("~")
        push(home)
        for sub in ("Desktop", "Documents", "Downloads", "Pictures", "datasets", "dataset"):
            push(os.path.join(home, sub))
        if os.name == "nt":
            for letter in "CDEFGHIJKLMNOPQRSTUVWXYZ":
                push(f"{letter}:\\")
        return roots

    def _batch_search_folder_by_name(name, limit=50, max_depth=3, max_visited=20000, budget_seconds=4.0):
        target = str(name or "").strip().lower()
        if not target:
            return [], 0
        started = time.time()
        scanned = 0
        matches = []

        for root in _batch_search_roots():
            queue = [root]
            depth = 0
            while queue and depth <= max_depth:
                next_level = []
                for current in queue:
                    scanned += 1
                    if scanned > max_visited or (time.time() - started) > budget_seconds:
                        return matches, scanned
                    try:
                        entries = [e for e in os.scandir(current) if e.is_dir(follow_symlinks=False)]
                    except Exception:
                        continue
                    for entry in entries:
                        if entry.name.startswith(".") or entry.name.lower() in _BATCH_FOLDER_SKIP:
                            continue
                        if entry.name.lower() == target:
                            matches.append(entry.path)
                            if len(matches) >= limit:
                                return matches, scanned
                        if depth < max_depth:
                            next_level.append(entry.path)
                queue = next_level
                depth += 1

        return matches, scanned

    def _batch_select_directory_sync():
        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()
            try:
                root.attributes("-topmost", True)
            except Exception:
                pass
            path = filedialog.askdirectory(title="Select folder")
            root.destroy()
            return path or ""
        except Exception as e:
            print(f"[ZhiAI] 文件夹选择器失败: {e}")
            return ""

    @PromptServer.instance.routes.get("/zhiai_nodes/image_understanding/batch_config")
    async def get_iuo_batch_config(request):
        try:
            config = load_batch_config()
            return web.json_response({
                "folder_read_mode": get_folder_read_mode(),
                "last_batch_folder": config.get("last_batch_folder", ""),
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.post("/zhiai_nodes/image_understanding/batch_config")
    async def save_iuo_batch_config(request):
        try:
            data = await request.json()
            if not isinstance(data, dict):
                return web.json_response({"status": "error", "message": "Invalid payload"}, status=400)
            config = load_batch_config()
            if "folder_read_mode" in data:
                mode = str(data.get("folder_read_mode") or "").strip().lower()
                config["folder_read_mode"] = "sequential" if mode == "sequential" else "recursive"
            if "last_batch_folder" in data:
                config["last_batch_folder"] = str(data.get("last_batch_folder") or "").strip()
            if save_batch_config(config):
                return web.json_response({"status": "success"})
            return web.json_response({"status": "error", "message": "Failed to save config"}, status=500)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhiai_nodes/image_understanding/select_directory")
    async def iuo_select_directory(request):
        try:
            loop = asyncio.get_running_loop()
            path = await loop.run_in_executor(None, _batch_select_directory_sync)
            if not path:
                return web.json_response({"path": "", "cancelled": True})
            if not os.path.isdir(path):
                return web.json_response({"path": "", "message": "Invalid directory selected"}, status=400)
            return web.json_response({"path": path})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @PromptServer.instance.routes.get("/zhiai_nodes/image_understanding/locate_folder")
    async def iuo_locate_folder(request):
        try:
            name = (request.rel_url.query.get("name") or "").strip()
            if not name:
                return web.json_response({"matches": [], "query": "", "scanned": 0})
            matches, scanned = await asyncio.to_thread(_batch_search_folder_by_name, name)
            return web.json_response({"matches": matches, "query": name, "scanned": scanned})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    _PROBE_TIMEOUT_SECONDS = 15
    _PROBE_MAX_MODELS = 2000

    def _probe_normalize_base(api_base):
        """与 ImageUnderstandingOnline._normalize_openai_base_url 同口径，
        并额外剥掉末尾的 /models（用户可能直接把完整接口地址粘进来）。"""
        text = str(api_base or "").strip()
        if not text:
            return ""
        for suffix in ("/chat/completions", "/models"):
            if text.endswith(suffix):
                text = text[: -len(suffix)]
        return text.rstrip("/")

    def _probe_extract_model_ids(payload):
        items = None
        if isinstance(payload, dict):
            for key in ("data", "models", "result", "list", "items"):
                value = payload.get(key)
                if isinstance(value, list):
                    items = value
                    break
        elif isinstance(payload, list):
            items = payload

        ids = []
        for item in items or []:
            if isinstance(item, str):
                value = item
            elif isinstance(item, dict):
                value = item.get("id") or item.get("model") or item.get("name") or ""
            else:
                continue
            value = str(value).strip()
            if value and value not in ids:
                ids.append(value)
                if len(ids) >= _PROBE_MAX_MODELS:
                    break
        return ids

    async def _probe_fetch_models(url, api_key):
        headers = {"Accept": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        timeout = aiohttp.ClientTimeout(total=_PROBE_TIMEOUT_SECONDS)
        async with aiohttp.ClientSession(timeout=timeout, trust_env=True) as session:
            async with session.get(url, headers=headers) as response:
                return response.status, await response.text()

    @PromptServer.instance.routes.post("/zhiai_nodes/image_understanding/probe_models")
    async def iuo_probe_models(request):
        try:
            data = await request.json()
        except Exception:
            data = {}
        if not isinstance(data, dict):
            data = {}

        api_base = _probe_normalize_base(data.get("api_base"))
        api_key = str(data.get("api_key") or "").strip()

        if not api_base:
            return web.json_response(
                {"status": "error", "models": [], "message": "请先填写 API 地址"},
                status=400,
            )
        if not api_base.startswith(("http://", "https://")):
            return web.json_response(
                {"status": "error", "models": [],
                 "message": "API 地址需要以 http:// 或 https:// 开头"},
                status=400,
            )

        candidates = [f"{api_base}/models"]
        if not api_base.endswith("/v1"):
            candidates.append(f"{api_base}/v1/models")

        last_error = ""
        for url in candidates:
            try:
                status, body = await _probe_fetch_models(url, api_key)
            except asyncio.TimeoutError:
                return web.json_response(
                    {"status": "error", "models": [], "url": url,
                     "message": f"请求 {url} 超时（{_PROBE_TIMEOUT_SECONDS} 秒）"},
                    status=502,
                )
            except Exception as exc:
                return web.json_response(
                    {"status": "error", "models": [], "url": url,
                     "message": f"无法连接 {url}：{exc}"},
                    status=502,
                )

            if status == 404:
                last_error = f"{url} 返回 404，接口路径可能不对"
                continue
            if status in (401, 403):
                return web.json_response(
                    {"status": "error", "models": [], "url": url,
                     "message": f"鉴权失败（HTTP {status}），请检查 API 密钥"},
                    status=502,
                )
            if status >= 400:
                return web.json_response(
                    {"status": "error", "models": [], "url": url,
                     "message": f"{url} 返回 HTTP {status}"},
                    status=502,
                )

            try:
                payload = json.loads(body)
            except Exception:
                return web.json_response(
                    {"status": "error", "models": [], "url": url,
                     "message": f"{url} 返回的不是 JSON，可能不是 OpenAI 兼容接口"},
                    status=502,
                )

            models = _probe_extract_model_ids(payload)
            return web.json_response(
                {"status": "success", "models": models, "url": url, "count": len(models)},
            )

        return web.json_response(
            {"status": "error", "models": [], "message": last_error or "探测失败"},
            status=502,
        )
