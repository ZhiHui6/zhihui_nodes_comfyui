import base64
import json
import urllib.request
import urllib.error
import os
import re
import time
from io import BytesIO

import numpy as np
from PIL import Image
import requests

CONFIG_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.path.join(CONFIG_DIR, "lmstudio_config.json")
PROMPT_PRESETS_FILE = os.path.join(CONFIG_DIR, "lmstudio_prompt_presets.json")


def _load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_config(config):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False


def _get_timeout(key, default):
    config = _load_config()
    return config.get("timeouts", {}).get(key, default)


def _get_folder_read_mode():
    config = _load_config()
    return config.get("folder_read_mode", "recursive")


def _save_batch_progress(progress_data):
    config = _load_config()
    config["batch_progress"] = progress_data
    _save_config(config)


def _get_batch_progress():
    config = _load_config()
    return config.get("batch_progress", {
        "current_folder": "",
        "processed_folders": [],
        "total_folders": 0,
        "current_folder_index": 0
    })


def _load_prompt_presets():
    if os.path.exists(PROMPT_PRESETS_FILE):
        try:
            with open(PROMPT_PRESETS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


LMSTUDIO_PROMPT_PRESETS = _load_prompt_presets()

LMSTUDIO_PARAM_PRESETS = {
    "Ignore": {},
    "Image Analysis": {
        "max_tokens": 4096,
        "temperature": 0.4,
        "top_p": 0.9,
        "top_k": 40,
        "repetition_penalty": 1.1,
    },
    "Text Generation": {
        "max_tokens": 2048,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 50,
        "repetition_penalty": 1.0,
    },
    "Creative Writing": {
        "max_tokens": 4096,
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 60,
        "repetition_penalty": 1.05,
    },
}


def _normalise_base(endpoint: str) -> str:
    base = endpoint.rstrip("/")
    if base.endswith("/v1"):
        base = base[:-3]
    return base


def _fetch_models(endpoint: str) -> list:
    base = _normalise_base(endpoint)
    timeout = _get_timeout("fetch_models", 5)

    try:
        req = urllib.request.Request(
            f"{base}/v1/models", headers={"Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            if "data" in data:
                ids = [m.get("id", "") for m in data.get("data", []) if m.get("id")]
                if ids:
                    return ids
    except urllib.error.URLError as e:
        print(f"[LMStudio] OpenAI endpoint /v1/models connection failed: {e.reason}")
    except Exception as e:
        print(f"[LMStudio] OpenAI endpoint /v1/models error: {e}")

    try:
        req = urllib.request.Request(
            f"{base}/api/v1/models", headers={"Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            if "models" in data:
                keys = [
                    m.get("key", "") for m in data.get("models", []) if m.get("key")
                ]
                if keys:
                    return keys
    except urllib.error.URLError as e:
        print(f"[LMStudio] Native API /api/v1/models connection failed: {e.reason}")
    except Exception as e:
        print(f"[LMStudio] Native API /api/v1/models error: {e}")

    print(f"[LMStudio] Could not fetch models from {base}. Make sure LM Studio server is running.")
    return ["(no models found)"]


_cached_endpoint: str = ""
_cached_models: list = ["(no models found)"]
_last_refresh_time: float = 0
_refresh_interval: float = 5.0


def _maybe_refresh(endpoint: str, force: bool = False) -> list:
    global _cached_endpoint, _cached_models, _last_refresh_time
    current_time = time.time()
    should_refresh = (
        force
        or endpoint != _cached_endpoint
        or _cached_models == ["(no models found)"]
        or (current_time - _last_refresh_time) > _refresh_interval
    )
    if should_refresh:
        _cached_endpoint = endpoint
        _cached_models = _fetch_models(endpoint)
        _last_refresh_time = current_time
    return _cached_models


class LMStudioNode:
    CATEGORY = "Zhi.AI/LM Studio"
    FUNCTION = "run"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    OUTPUT_NODE = True
    DESCRIPTION = "Connect to local LM Studio server for image analysis and text generation. Supports multiple preset templates, output language control, and auto model discovery. Requires LM Studio software running with a vision-capable model loaded."

    @classmethod
    def INPUT_TYPES(cls):
        config = _load_config()
        endpoint = config.get("endpoint", "http://localhost:1234")
        models = list(_maybe_refresh(endpoint))
        prompt_version = config.get("prompt_version", "new")
        presets = LMSTUDIO_PROMPT_PRESETS.get(prompt_version, LMSTUDIO_PROMPT_PRESETS.get("new", {}))
        preset_keys = list(presets.keys())
        return {
            "required": {
                "preset_prompt": (
                    preset_keys,
                    {
                        "default": "Ignore",
                        "tooltip": "Select preset prompt template including tag generation, detailed description, creative analysis and more",
                    },
                ),
                "output_language": (
                    ["Ignore", "Chinese", "English", "Chinese&English"],
                    {
                        "default": "Ignore",
                        "tooltip": "Set output language: Chinese, English, or bilingual",
                    },
                ),
                "user_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                        "tooltip": "User message sent to the model. Any wired text_input is appended here.",
                    },
                ),
                "system_prompt": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": True,
                    },
                ),
                "endpoint": (
                    "STRING",
                    {
                        "default": "http://localhost:1234",
                        "multiline": False,
                        "tooltip": "LM Studio server base URL. Change this then queue once to refresh the model list.",
                    },
                ),
                "model": (
                    models,
                    {
                        "default": models[0],
                        "tooltip": "Available models. Queue once after changing the endpoint to refresh.",
                    },
                ),
                "size_limitation": (
                    "INT",
                    {
                        "default": 1024,
                        "min": 0,
                        "max": 2500,
                        "step": 64,
                        "tooltip": "Image size limitation (long edge), 0 means no limit",
                    },
                ),
                "max_tokens": (
                    "INT",
                    {
                        "default": 4096,
                        "min": 1,
                        "max": 32768,
                        "step": 64,
                        "tooltip": "Maximum tokens to generate. 4096 recommended for detailed image descriptions",
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.4,
                        "min": 0.0,
                        "max": 2.0,
                        "step": 0.05,
                        "tooltip": "Sampling temperature. 0.4 balances accuracy and natural expression for vision tasks",
                    },
                ),
                "top_p": (
                    "FLOAT",
                    {
                        "default": 0.9,
                        "min": 0.0,
                        "max": 1.0,
                        "step": 0.05,
                        "tooltip": "Nucleus sampling. 0.9 is optimal for filtering low-quality tokens while preserving diversity",
                    },
                ),
                "top_k": (
                    "INT",
                    {
                        "default": 40,
                        "min": 0,
                        "max": 1000,
                        "step": 1,
                        "tooltip": "Top-k sampling. 40 is the classic value for optimal quality-diversity balance",
                    },
                ),
                "repetition_penalty": (
                    "FLOAT",
                    {
                        "default": 1.1,
                        "min": 0.1,
                        "max": 2.0,
                        "step": 0.05,
                        "tooltip": "Repetition penalty. 1.1 effectively reduces redundancy without over-penalizing",
                    },
                ),
                "seed": (
                    "INT",
                    {
                        "default": 0,
                        "min": 0,
                        "max": 0xFFFFFFFFFFFFFFFF,
                        "tooltip": "Random seed for reproducible outputs. 0 means random seed",
                    },
                ),
                "remove_think_tags": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "When enabled, removes the </think> tag and all content before it from the output text, keeping only the clean description.",
                    },
                ),
                "unload_model": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Unload model after inference to free VRAM",
                    },
                ),
                "batch_mode": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Enable batch processing mode",
                    },
                ),
                "batch_folder_path": (
                    "STRING",
                    {
                        "default": "",
                        "multiline": False,
                        "tooltip": "Folder path for batch processing images",
                    },
                ),
                "skip_exists": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Skip images that already have a txt file with the same name",
                    },
                ),
            },
            "optional": {
                "image": (
                    "IMAGE",
                    {
                        "tooltip": "Optional image (B,H,W,C float32). Requires a vision-capable model.",
                    },
                ),
                "image_2": (
                    "IMAGE",
                    {
                        "tooltip": "Optional second image for multi-image inference.",
                    },
                ),
                "image_3": (
                    "IMAGE",
                    {
                        "tooltip": "Optional third image for multi-image inference.",
                    },
                ),
                "image_4": (
                    "IMAGE",
                    {
                        "tooltip": "Optional fourth image for multi-image inference.",
                    },
                ),
            },
        }

    @classmethod
    def IS_CHANGED(cls, endpoint: str, **kwargs):
        _maybe_refresh(endpoint, force=True)
        return str(time.time())

    @staticmethod
    def _apply_output_language(prompt: str, output_language: str) -> str:
        if output_language == "Chinese":
            return prompt + " Please respond in Chinese."
        elif output_language == "English":
            return prompt + " Please respond in English."
        elif output_language == "Chinese&English":
            return (
                prompt
                + " Please respond in both Chinese and English, first describe in Chinese, then describe in English."
            )
        return prompt

    @staticmethod
    def _remove_think_content(text: str) -> str:
        if not isinstance(text, str):
            return text
        think_end_pos = text.find("</think>")
        if think_end_pos != -1:
            return text[think_end_pos + len("</think>") :].strip()
        return text

    @staticmethod
    def _tensor_to_base64(image_tensor, size_limitation=None) -> str:
        img_np = (image_tensor[0].cpu().numpy() * 255).clip(0, 255).astype(np.uint8)
        pil_img = Image.fromarray(img_np, mode="RGB")

        if size_limitation is not None and size_limitation > 0:
            target = min(size_limitation, 2500)
            w, h = pil_img.size
            long_edge = max(w, h)
            if long_edge > target:
                scale = target / float(long_edge)
                new_w = max(1, int(round(w * scale)))
                new_h = max(1, int(round(h * scale)))
                pil_img = pil_img.resize((new_w, new_h), Image.LANCZOS)

        buf = BytesIO()
        pil_img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    @staticmethod
    def _load_image_from_path(image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片文件未找到: {image_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        file_ext = os.path.splitext(image_path.lower())[1]
        if file_ext not in valid_extensions:
            raise ValueError(f"不支持的图片格式: {file_ext}")

        image = Image.open(image_path)
        if image.mode != "RGB":
            image = image.convert("RGB")

        image_array = np.array(image).astype(np.float32) / 255.0
        return image_array

    @staticmethod
    def _resize_image_array(image_array, size_limitation):
        if size_limitation is None or size_limitation <= 0:
            return image_array

        h, w = image_array.shape[:2]
        long_edge = max(w, h)
        if long_edge <= size_limitation:
            return image_array

        scale = size_limitation / float(long_edge)
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))

        pil_img = Image.fromarray((image_array * 255).astype(np.uint8))
        pil_img = pil_img.resize((new_w, new_h), Image.LANCZOS)
        return np.array(pil_img).astype(np.float32) / 255.0

    @staticmethod
    def _traverse_folder_for_images(folder_path, recursive=True):
        if not folder_path or not folder_path.strip():
            return []

        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        image_files = []

        if recursive:
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        full_path = os.path.join(root, file)
                        if os.access(full_path, os.R_OK):
                            image_files.append(full_path)
        else:
            for file in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file)
                if os.path.isfile(file_path):
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        if os.access(file_path, os.R_OK):
                            image_files.append(file_path)

        image_files.sort(key=lambda x: os.path.basename(x).lower())
        return image_files

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

    @staticmethod
    def _get_images_in_single_folder(folder_path):
        if not folder_path or not folder_path.strip():
            return []

        folder_path = folder_path.strip()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")

        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        image_files = []

        try:
            for file in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file)
                if os.path.isfile(file_path):
                    file_ext = os.path.splitext(file.lower())[1]
                    if file_ext in valid_extensions:
                        if os.access(file_path, os.R_OK):
                            image_files.append(file_path)
        except PermissionError:
            raise PermissionError(f"无权限访问文件夹: {folder_path}")

        image_files.sort(key=lambda x: os.path.basename(x).lower())
        return image_files

    @staticmethod
    def _save_description(image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write(description)

    def _call_api(
        self,
        endpoint,
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
        top_k,
        repetition_penalty,
        seed=None,
    ):
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False,
            "top_p": top_p,
            "top_k": top_k,
            "repetition_penalty": repetition_penalty,
        }
        if model.strip() and not model.startswith("("):
            payload["model"] = model.strip()
        if seed is not None and seed > 0:
            payload["seed"] = seed

        url = _normalise_base(endpoint) + "/v1/chat/completions"
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )

        timeout = _get_timeout("api_call", 450)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                result = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"LM Studio HTTP {e.code}: {error_body}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(
                f"Could not connect to LM Studio at {url}. "
                "Make sure the server is running.\nDetail: {e.reason}"
            ) from e

        try:
            return result["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            raise RuntimeError(f"Unexpected response format: {result}") from e

    def _unload_model(self, endpoint: str) -> str:
        base_url = _normalise_base(endpoint)
        timeout_list = _get_timeout("unload_model_list", 10)
        timeout_unload = _get_timeout("unload_model", 30)
        try:
            response = requests.get(
                f"{base_url}/api/v1/models",
                headers={"Content-Type": "application/json"},
                timeout=timeout_list,
            )
            response.raise_for_status()
            models_data = response.json()

            all_models = models_data.get("models", models_data.get("data", []))

            loaded_instances = []
            for model in all_models:
                for instance in model.get("loaded_instances", []):
                    instance_id = instance.get("id")
                    if instance_id:
                        loaded_instances.append(instance_id)

            if not loaded_instances:
                return "No models currently loaded"

            unloaded = []
            failed = []

            for instance_id in loaded_instances:
                unload_response = requests.post(
                    f"{base_url}/api/v1/models/unload",
                    headers={"Content-Type": "application/json"},
                    json={"instance_id": instance_id},
                    timeout=timeout_unload,
                )

                if unload_response.status_code == 200:
                    unloaded.append(instance_id)
                else:
                    failed.append(instance_id)

            parts = []
            if unloaded:
                parts.append(f"Unloaded: {', '.join(unloaded)}")
            if failed:
                parts.append(f"Failed: {', '.join(failed)}")
            return " | ".join(parts) if parts else "Nothing was unloaded"

        except requests.exceptions.ConnectionError:
            return f"Connection error: Could not reach LM Studio at {endpoint}"
        except requests.exceptions.Timeout:
            return "Request timed out"
        except Exception as e:
            return f"Error: {str(e)}"

    def _generate_log_info(
        self,
        model: str,
        endpoint: str,
        preset_prompt: str,
        output_language: str,
        max_tokens: int,
        temperature: float,
        top_p: float,
        top_k: int,
        repetition_penalty: float,
        seed: int,
        size_limitation: int,
        batch_mode: bool,
        image_count: int = 0,
        success: bool = True,
        error_msg: str = "",
        processed_count: int = 0,
        error_count: int = 0,
        duration: float = 0.0,
    ):
        config = _load_config()
        show_log = config.get("show_log_panel", True)
        if not show_log:
            return ""

        log_lines = []
        log_lines.append(f"🤖 模型: {model}")
        
        if batch_mode:
            log_lines.append(f"📦 批处理模式: 启用")
            if image_count > 0:
                log_lines.append(f"🖼️ 图片数量: {image_count}")
            if processed_count > 0 or error_count > 0:
                log_lines.append(f"✅ 成功处理: {processed_count}")
                log_lines.append(f"❌ 失败数量: {error_count}")
        elif image_count > 0:
            log_lines.append(f"🖼️ 图片数量: {image_count}")
        
        if duration > 0:
            log_lines.append(f"⏱️ 耗时: {duration:.2f}秒")
        
        if success:
            log_lines.append(f"✨ 状态: 推理完成")
        else:
            log_lines.append(f"⚠️ 状态: 推理失败")
            if error_msg:
                log_lines.append(f"❗ 错误信息: {error_msg}")
        
        return "\n".join(log_lines)

    def _prepare_return(
        self,
        result: str,
        endpoint: str,
        unload_model: bool,
        remove_think_tags: bool = False,
        log_info: str = "",
    ):
        if remove_think_tags:
            result = self._remove_think_content(result)
        result = result.strip() if isinstance(result, str) else result
        if unload_model:
            self._unload_model(endpoint)
        return {"ui": {"log_info": [log_info]}, "result": (result,)}

    def run(
        self,
        preset_prompt: str,
        output_language: str,
        user_prompt: str,
        system_prompt: str,
        endpoint: str,
        model: str,
        size_limitation: int,
        max_tokens: int,
        temperature: float,
        top_p: float,
        top_k: int,
        repetition_penalty: float,
        seed: int,
        unload_model: bool,
        batch_mode: bool,
        batch_folder_path: str,
        skip_exists: bool = False,
        remove_think_tags: bool = False,
        image=None,
        image_2=None,
        image_3=None,
        image_4=None,
    ):
        _maybe_refresh(endpoint)
        start_time = time.time()
        
        folder_read_mode = _get_folder_read_mode()

        if seed == 0:
            import random
            seed = random.randint(1, 0xFFFFFFFFFFFFFFFF)

        config = _load_config()
        prompt_version = config.get("prompt_version", "new")
        presets = LMSTUDIO_PROMPT_PRESETS.get(prompt_version, LMSTUDIO_PROMPT_PRESETS.get("new", {}))
        preset_text = presets.get(preset_prompt, "")

        if preset_prompt == "Ignore":
            full_user_text = user_prompt.strip() if user_prompt.strip() else ""
        else:
            full_user_text = user_prompt.strip() if user_prompt.strip() else preset_text

        full_user_text = self._apply_output_language(full_user_text, output_language)

        effective_system_prompt = system_prompt if preset_prompt == "Ignore" else ""

        if not batch_mode:
            all_images = []
            for img in [image, image_2, image_3, image_4]:
                if img is not None:
                    all_images.append(img)
            
            image_count = len(all_images)

            if image_count == 0:
                messages = []
                if effective_system_prompt.strip():
                    messages.append(
                        {"role": "system", "content": effective_system_prompt}
                    )
                messages.append({"role": "user", "content": full_user_text})

                try:
                    result = self._call_api(
                        endpoint,
                        model,
                        messages,
                        max_tokens,
                        temperature,
                        top_p,
                        top_k,
                        repetition_penalty,
                        seed,
                    )
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        image_count=image_count,
                        success=True,
                        duration=duration,
                    )
                    return self._prepare_return(
                        result, endpoint, unload_model, remove_think_tags, log_info
                    )
                except Exception as e:
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        image_count=image_count,
                        success=False,
                        error_msg=str(e),
                        duration=duration,
                    )
                    return self._prepare_return(
                        "", endpoint, unload_model, remove_think_tags, log_info
                    )

            user_content = []
            
            for img in all_images:
                if len(img.shape) == 4 and img.shape[0] > 0:
                    image_tensor = img[0:1]
                else:
                    image_tensor = img
                
                b64 = self._tensor_to_base64(
                    image_tensor, size_limitation if size_limitation > 0 else None
                )
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{b64}"},
                })
            
            user_content.append({"type": "text", "text": full_user_text})

            messages = []
            if effective_system_prompt.strip():
                messages.append({"role": "system", "content": effective_system_prompt})
            messages.append({"role": "user", "content": user_content})

            try:
                result = self._call_api(
                    endpoint,
                    model,
                    messages,
                    max_tokens,
                    temperature,
                    top_p,
                    top_k,
                    repetition_penalty,
                    seed,
                )
                duration = time.time() - start_time
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=image_count,
                    success=True,
                    duration=duration,
                )
                return self._prepare_return(
                    result, endpoint, unload_model, remove_think_tags, log_info
                )
            except Exception as e:
                duration = time.time() - start_time
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=image_count,
                    success=False,
                    error_msg=str(e),
                    duration=duration,
                )
                return self._prepare_return(
                    "", endpoint, unload_model, remove_think_tags, log_info
                )

        else:
            results = []

            if batch_folder_path and batch_folder_path.strip():
                try:
                    if folder_read_mode == "sequential":
                        subfolders = self._get_subfolders_sorted(batch_folder_path.strip())
                        
                        if not subfolders:
                            log_info = self._generate_log_info(
                                model=model,
                                endpoint=endpoint,
                                preset_prompt=preset_prompt,
                                output_language=output_language,
                                max_tokens=max_tokens,
                                temperature=temperature,
                                top_p=top_p,
                                top_k=top_k,
                                repetition_penalty=repetition_penalty,
                                seed=seed,
                                size_limitation=size_limitation,
                                batch_mode=batch_mode,
                                image_count=0,
                                success=False,
                                error_msg="未找到子文件夹",
                            )
                            return self._prepare_return(
                                "", endpoint, unload_model, remove_think_tags, log_info
                            )

                        total_folders = len(subfolders)
                        total_processed = 0
                        total_errors = 0
                        all_error_details = []
                        folder_results = []

                        batch_progress = _get_batch_progress()
                        start_folder_index = 0
                        processed_folders = set(batch_progress.get("processed_folders", []))

                        for i, subfolder in enumerate(subfolders):
                            if subfolder in processed_folders:
                                continue
                            start_folder_index = i
                            break

                        for folder_idx in range(start_folder_index, total_folders):
                            subfolder = subfolders[folder_idx]
                            folder_name = os.path.basename(subfolder)

                            _save_batch_progress({
                                "current_folder": subfolder,
                                "processed_folders": list(processed_folders),
                                "total_folders": total_folders,
                                "current_folder_index": folder_idx
                            })

                            image_paths = self._get_images_in_single_folder(subfolder)
                            
                            if not image_paths:
                                processed_folders.add(subfolder)
                                continue

                            folder_processed = 0
                            folder_errors = 0
                            folder_error_details = []

                            for image_path in image_paths:
                                try:
                                    if skip_exists:
                                        txt_file = os.path.splitext(image_path)[0] + ".txt"
                                        if os.path.exists(txt_file):
                                            continue

                                    image_array = self._load_image_from_path(image_path)
                                    if size_limitation > 0:
                                        image_array = self._resize_image_array(
                                            image_array, size_limitation
                                        )

                                    pil_img = Image.fromarray(
                                        (image_array * 255).astype(np.uint8)
                                    )
                                    buf = BytesIO()
                                    pil_img.save(buf, format="PNG")
                                    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                                    user_content = [
                                        {
                                            "type": "image_url",
                                            "image_url": {
                                                "url": f"data:image/png;base64,{b64}"
                                            },
                                        },
                                        {"type": "text", "text": full_user_text},
                                    ]

                                    messages = []
                                    if effective_system_prompt.strip():
                                        messages.append(
                                            {
                                                "role": "system",
                                                "content": effective_system_prompt,
                                            }
                                        )
                                    messages.append({"role": "user", "content": user_content})

                                    result = self._call_api(
                                        endpoint,
                                        model,
                                        messages,
                                        max_tokens,
                                        temperature,
                                        top_p,
                                        top_k,
                                        repetition_penalty,
                                        seed,
                                    )
                                    self._save_description(image_path, result)
                                    folder_processed += 1
                                    total_processed += 1

                                except Exception as e:
                                    folder_errors += 1
                                    total_errors += 1
                                    error_msg = str(e)
                                    folder_error_details.append(
                                        f"[{os.path.basename(image_path)}] {error_msg}"
                                    )
                                    all_error_details.append(
                                        f"[{folder_name}/{os.path.basename(image_path)}] {error_msg}"
                                    )

                            processed_folders.add(subfolder)
                            folder_results.append(
                                f"📁 {folder_name}: {folder_processed} 成功, {folder_errors} 失败"
                            )

                        _save_batch_progress({
                            "current_folder": "",
                            "processed_folders": [],
                            "total_folders": 0,
                            "current_folder_index": 0
                        })

                        duration = time.time() - start_time
                        log_message = f"顺序轮次模式处理完成!\n总文件夹数: {total_folders}\n总处理图片: {total_processed}\n总失败: {total_errors}\n\n各文件夹详情:\n" + "\n".join(folder_results)
                        if all_error_details:
                            log_message += "\n\n失败详情:\n" + "\n".join(all_error_details[:20])
                            if len(all_error_details) > 20:
                                log_message += f"\n... 还有 {len(all_error_details) - 20} 个错误"
                        
                        log_info = self._generate_log_info(
                            model=model,
                            endpoint=endpoint,
                            preset_prompt=preset_prompt,
                            output_language=output_language,
                            max_tokens=max_tokens,
                            temperature=temperature,
                            top_p=top_p,
                            top_k=top_k,
                            repetition_penalty=repetition_penalty,
                            seed=seed,
                            size_limitation=size_limitation,
                            batch_mode=batch_mode,
                            image_count=total_processed,
                            success=True,
                            processed_count=total_processed,
                            error_count=total_errors,
                            duration=duration,
                        )
                        return self._prepare_return(
                            log_message, endpoint, unload_model, remove_think_tags, log_info
                        )

                    else:
                        image_paths = self._traverse_folder_for_images(
                            batch_folder_path.strip()
                        )
                        if not image_paths:
                            log_info = self._generate_log_info(
                                model=model,
                                endpoint=endpoint,
                                preset_prompt=preset_prompt,
                                output_language=output_language,
                                max_tokens=max_tokens,
                                temperature=temperature,
                                top_p=top_p,
                                top_k=top_k,
                                repetition_penalty=repetition_penalty,
                                seed=seed,
                                size_limitation=size_limitation,
                                batch_mode=batch_mode,
                                image_count=0,
                                success=False,
                                error_msg="未找到图片文件",
                            )
                            return self._prepare_return(
                                "", endpoint, unload_model, remove_think_tags, log_info
                            )

                        total_images = len(image_paths)
                        processed_count = 0
                        error_count = 0
                        error_details = []

                        for i, image_path in enumerate(image_paths):
                            try:
                                if skip_exists:
                                    txt_file = os.path.splitext(image_path)[0] + ".txt"
                                    if os.path.exists(txt_file):
                                        continue

                                image_array = self._load_image_from_path(image_path)
                                if size_limitation > 0:
                                    image_array = self._resize_image_array(
                                        image_array, size_limitation
                                    )

                                pil_img = Image.fromarray(
                                    (image_array * 255).astype(np.uint8)
                                )
                                buf = BytesIO()
                                pil_img.save(buf, format="PNG")
                                b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                                user_content = [
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/png;base64,{b64}"
                                        },
                                    },
                                    {"type": "text", "text": full_user_text},
                                ]

                                messages = []
                                if effective_system_prompt.strip():
                                    messages.append(
                                        {
                                            "role": "system",
                                            "content": effective_system_prompt,
                                        }
                                    )
                                messages.append({"role": "user", "content": user_content})

                                result = self._call_api(
                                    endpoint,
                                    model,
                                    messages,
                                    max_tokens,
                                    temperature,
                                    top_p,
                                    top_k,
                                    repetition_penalty,
                                    seed,
                                )
                                self._save_description(image_path, result)
                                processed_count += 1

                            except Exception as e:
                                error_count += 1
                                error_msg = str(e)
                                error_details.append(
                                    f"[{os.path.basename(image_path)}] {error_msg}"
                                )

                        duration = time.time() - start_time
                        log_message = f"递归遍历模式处理完成!\n总图片数: {total_images}\n成功: {processed_count}\n失败: {error_count}"
                        if error_details:
                            log_message += "\n\n失败详情:\n" + "\n".join(error_details)
                        log_info = self._generate_log_info(
                            model=model,
                            endpoint=endpoint,
                            preset_prompt=preset_prompt,
                            output_language=output_language,
                            max_tokens=max_tokens,
                            temperature=temperature,
                            top_p=top_p,
                            top_k=top_k,
                            repetition_penalty=repetition_penalty,
                            seed=seed,
                            size_limitation=size_limitation,
                            batch_mode=batch_mode,
                            image_count=total_images,
                            success=True,
                            processed_count=processed_count,
                            error_count=error_count,
                            duration=duration,
                        )
                        return self._prepare_return(
                            log_message, endpoint, unload_model, remove_think_tags, log_info
                        )

                except Exception as e:
                    duration = time.time() - start_time
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        success=False,
                        error_msg=str(e),
                        duration=duration,
                    )
                    return self._prepare_return(
                        f"Batch processing failed: {str(e)}",
                        endpoint,
                        unload_model,
                        remove_think_tags,
                        log_info,
                    )

            else:
                if image is None:
                    log_info = self._generate_log_info(
                        model=model,
                        endpoint=endpoint,
                        preset_prompt=preset_prompt,
                        output_language=output_language,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        repetition_penalty=repetition_penalty,
                        seed=seed,
                        size_limitation=size_limitation,
                        batch_mode=batch_mode,
                        success=False,
                        error_msg="批处理模式下未提供图片",
                    )
                    return self._prepare_return(
                        "", endpoint, unload_model, remove_think_tags, log_info
                    )

                total_images = image.shape[0] if len(image.shape) == 4 else 1
                processed_count = 0
                error_count = 0
                error_details = []

                for i in range(total_images):
                    try:
                        if len(image.shape) == 4:
                            image_tensor = image[i : i + 1]
                        else:
                            image_tensor = image

                        b64 = self._tensor_to_base64(
                            image_tensor,
                            size_limitation if size_limitation > 0 else None,
                        )
                        user_content = [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{b64}"},
                            },
                            {"type": "text", "text": full_user_text},
                        ]

                        messages = []
                        if effective_system_prompt.strip():
                            messages.append(
                                {"role": "system", "content": effective_system_prompt}
                            )
                        messages.append({"role": "user", "content": user_content})

                        result = self._call_api(
                            endpoint,
                            model,
                            messages,
                            max_tokens,
                            temperature,
                            top_p,
                            top_k,
                            repetition_penalty,
                            seed,
                        )
                        results.append(f"Image {i + 1}/{total_images}:\n{result}")
                        processed_count += 1

                    except Exception as e:
                        error_count += 1
                        error_msg = str(e)
                        error_details.append(f"[Image {i + 1}] {error_msg}")

                duration = time.time() - start_time
                combined_result = "\n\n" + "=" * 50 + "\n\n".join(results)
                summary = f"Batch processing completed!\nTotal: {total_images} images\nSuccess: {processed_count}\nFailed: {error_count}"
                if error_details:
                    summary += "\n\nFailure details:\n" + "\n".join(error_details)
                combined_result = summary + "\n\n" + "=" * 50 + "\n" + combined_result
                log_info = self._generate_log_info(
                    model=model,
                    endpoint=endpoint,
                    preset_prompt=preset_prompt,
                    output_language=output_language,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=repetition_penalty,
                    seed=seed,
                    size_limitation=size_limitation,
                    batch_mode=batch_mode,
                    image_count=total_images,
                    success=True,
                    processed_count=processed_count,
                    error_count=error_count,
                    duration=duration,
                )
                return self._prepare_return(
                    combined_result, endpoint, unload_model, remove_think_tags, log_info
                )