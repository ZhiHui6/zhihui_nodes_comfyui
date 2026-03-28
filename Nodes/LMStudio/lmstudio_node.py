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

def _load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_config(config):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

def _get_timeout(key, default):
    config = _load_config()
    return config.get("timeouts", {}).get(key, default)

LMSTUDIO_PROMPT_PRESETS = {
    "Ignore": "",
    "Normal - Describe": "Describe this @.",
    "Prompt Style - Tags": "Your task is to generate a clean list of comma-separated tags for a text-to-@ AI, based *only* on the visual information in the @. Limit the output to a maximum of 50 unique tags. Strictly describe visual elements like subject, clothing, environment, colors, lighting, and composition. Do not include abstract concepts, interpretations, marketing terms, or technical jargon (e.g., no 'SEO', 'brand-aligned', 'viral potential'). The goal is a concise list of visual descriptors. Avoid repeating tags.",
    "Prompt Style - Simple": "Analyze the @ and generate a simple, single-sentence text-to-@ prompt. Describe the main subject and the setting concisely.",
    "Prompt Style - Detailed": "Generate a detailed, artistic text-to-@ prompt based on the @. Combine the subject, their actions, the environment, lighting, and overall mood into a single, cohesive paragraph of about 2-3 sentences. Focus on key visual details.",
    "Prompt Style - Extreme Detailed": "Generate an extremely detailed and descriptive text-to-@ prompt from the @. Create a rich paragraph that elaborates on the subject's appearance, textures of clothing, specific background elements, the quality and color of light, shadows, and the overall atmosphere. Aim for a highly descriptive and immersive prompt.",
    "Prompt Style - Cinematic": "Act as a master prompt engineer. Create a highly detailed and evocative prompt for an @ generation AI. Describe the subject, their pose, the environment, the lighting, the mood, and the artistic style (e.g., photorealistic, cinematic, painterly). Weave all elements into a single, natural language paragraph, focusing on visual impact.",
    "Creative - Detailed Analysis": "Describe this @ in detail, breaking down the subject, attire, accessories, background, and composition into separate sections.",
    "Creative - Summarize Video": "Summarize the key events and narrative points in this video.",
    "Creative - Short Story": "Write a short, imaginative story inspired by this @ or video.",
    "Creative - Refine & Expand Prompt": "Refine and enhance the following user prompt for creative text-to-@ generation. Keep the meaning and keywords, make it more expressive and visually rich. Output **only the improved prompt text itself**, without any reasoning steps, thinking process, or additional commentary.",
}

LMSTUDIO_PROMPT_PRESETS_OLD = {
    "Ignore": "",
    "Tags": "Your task is to generate a clean list of comma-separated tags for a text-to-image AI, based *only* on the visual information in the image. Limit the output to a maximum of 50 unique tags. Strictly describe visual elements like subject, clothing, environment, colors, lighting, and composition. Do not include abstract concepts, interpretations, marketing terms, or technical jargon (e.g., no 'SEO', 'brand-aligned', 'viral potential'). The goal is a concise list of visual descriptors. Avoid repeating tags.",
    "Extreme Detailed": "Generate an extremely detailed and descriptive text-to-image prompt from the image. Create a rich paragraph that elaborates on the subject's appearance, textures of clothing, specific background elements, the quality and color of light, shadows, and the overall atmosphere. Aim for a highly descriptive and immersive prompt.",
    "Short Story": "Write a short, imaginative story inspired by this image or video.",
}

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
    url = _normalise_base(endpoint) + "/v1/models"
    timeout = _get_timeout("fetch_models", 5)
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            ids = [m["id"] for m in data.get("data", [])]
            return ids if ids else ["(no models found)"]
    except Exception as exc:
        return [f"(error: {exc})"]

_cached_endpoint: str = "http://localhost:1234"
_cached_models: list = _fetch_models("http://localhost:1234")

def _maybe_refresh(endpoint: str) -> list:
    global _cached_endpoint, _cached_models
    if endpoint != _cached_endpoint:
        _cached_endpoint = endpoint
        _cached_models = _fetch_models(endpoint)
    return _cached_models

class LMStudioNode:

    CATEGORY = "Zhi.AI/LM Studio"
    FUNCTION = "run"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    DESCRIPTION = "Connect to local LM Studio server for image analysis and text generation. Supports multiple preset templates, output language control, and auto model discovery. Requires LM Studio software running with a vision-capable model loaded."

    @classmethod
    def INPUT_TYPES(cls):
        models = list(_cached_models)
        config = _load_config()
        prompt_version = config.get("prompt_version", "new")
        if prompt_version == "old":
            preset_keys = list(LMSTUDIO_PROMPT_PRESETS_OLD.keys())
        else:
            preset_keys = list(LMSTUDIO_PROMPT_PRESETS.keys())
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
                        "tooltip": "System prompt / persona to guide the model",
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
                        "max": 0xffffffffffffffff,
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
            },
        }

    @classmethod
    def IS_CHANGED(cls, endpoint: str, **kwargs):
        _maybe_refresh(endpoint)
        return str(time.time())

    @staticmethod
    def _apply_output_language(prompt: str, output_language: str) -> str:
        if output_language == "Chinese":
            return prompt + " Please respond in Chinese."
        elif output_language == "English":
            return prompt + " Please respond in English."
        elif output_language == "Chinese&English":
            return prompt + " Please respond in both Chinese and English, first describe in Chinese, then describe in English."
        return prompt

    @staticmethod
    def _remove_think_content(text: str) -> str:
        if not isinstance(text, str):
            return text
        think_end_pos = text.find('</think>')
        if think_end_pos != -1:
            return text[think_end_pos + len('</think>'):].strip()
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
        
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
        file_ext = os.path.splitext(image_path.lower())[1]
        if file_ext not in valid_extensions:
            raise ValueError(f"不支持的图片格式: {file_ext}")
        
        image = Image.open(image_path)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
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
        
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
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
    def _save_description(image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(description)

    def _call_api(self, endpoint, model, messages, max_tokens, temperature, top_p, top_k, repetition_penalty, seed=None):
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

        timeout = _get_timeout("api_call", 120)
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
                timeout=timeout_list
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
                    timeout=timeout_unload
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

    def _prepare_return(self, result: str, endpoint: str, unload_model: bool, remove_think_tags: bool = False):
        if remove_think_tags:
            result = self._remove_think_content(result)
        if unload_model:
            self._unload_model(endpoint)
        return (result,)

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
        skip_exists: bool,
        remove_think_tags: bool = False,
        image=None,
    ):
        _maybe_refresh(endpoint)

        if seed == 0:
            import random
            seed = random.randint(1, 0xffffffffffffffff)

        config = _load_config()
        prompt_version = config.get("prompt_version", "new")
        if prompt_version == "old":
            preset_text = LMSTUDIO_PROMPT_PRESETS_OLD.get(preset_prompt, "")
        else:
            preset_text = LMSTUDIO_PROMPT_PRESETS.get(preset_prompt, "")

        if preset_text and "@" in preset_text:
            is_video = image is not None and len(image.shape) == 4 and image.shape[0] > 1
            input_type = "video" if is_video else "image"
            preset_text = preset_text.replace("@", input_type)

        if preset_prompt == "Ignore":
            full_user_text = user_prompt.strip() if user_prompt.strip() else ""
        else:
            full_user_text = user_prompt.strip() if user_prompt.strip() else preset_text

        full_user_text = self._apply_output_language(full_user_text, output_language)

        effective_system_prompt = system_prompt if preset_prompt == "Ignore" else ""

        if not batch_mode:
            if image is None:
                messages = []
                if effective_system_prompt.strip():
                    messages.append({"role": "system", "content": effective_system_prompt})
                messages.append({"role": "user", "content": full_user_text})

                try:
                    result = self._call_api(endpoint, model, messages, max_tokens, temperature, top_p, top_k, repetition_penalty, seed)
                    return self._prepare_return(result, endpoint, unload_model, remove_think_tags)
                except Exception as e:
                    return self._prepare_return("", endpoint, unload_model, remove_think_tags)

            if len(image.shape) == 4 and image.shape[0] > 0:
                image_tensor = image[0:1]
            else:
                image_tensor = image

            b64 = self._tensor_to_base64(image_tensor, size_limitation if size_limitation > 0 else None)
            user_content = [
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                {"type": "text", "text": full_user_text},
            ]

            messages = []
            if effective_system_prompt.strip():
                messages.append({"role": "system", "content": effective_system_prompt})
            messages.append({"role": "user", "content": user_content})

            try:
                result = self._call_api(endpoint, model, messages, max_tokens, temperature, top_p, top_k, repetition_penalty, seed)
                return self._prepare_return(result, endpoint, unload_model, remove_think_tags)
            except Exception as e:
                return self._prepare_return("", endpoint, unload_model, remove_think_tags)

        else:
            results = []

            if batch_folder_path and batch_folder_path.strip():
                try:
                    image_paths = self._traverse_folder_for_images(batch_folder_path.strip())
                    if not image_paths:
                        return self._prepare_return("", endpoint, unload_model, remove_think_tags)

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
                                image_array = self._resize_image_array(image_array, size_limitation)

                            pil_img = Image.fromarray((image_array * 255).astype(np.uint8))
                            buf = BytesIO()
                            pil_img.save(buf, format="PNG")
                            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                            user_content = [
                                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                                {"type": "text", "text": full_user_text},
                            ]

                            messages = []
                            if effective_system_prompt.strip():
                                messages.append({"role": "system", "content": effective_system_prompt})
                            messages.append({"role": "user", "content": user_content})

                            result = self._call_api(endpoint, model, messages, max_tokens, temperature, top_p, top_k, repetition_penalty, seed)
                            self._save_description(image_path, result)
                            processed_count += 1

                        except Exception as e:
                            error_count += 1
                            error_msg = str(e)
                            error_details.append(f"[{os.path.basename(image_path)}] {error_msg}")

                    log_message = f"Batch processing completed!\nTotal: {total_images} images\nSuccess: {processed_count}\nFailed: {error_count}"
                    if error_details:
                        log_message += "\n\nFailure details:\n" + "\n".join(error_details)
                    return self._prepare_return(log_message, endpoint, unload_model, remove_think_tags)

                except Exception as e:
                    return self._prepare_return(f"Batch processing failed: {str(e)}", endpoint, unload_model, remove_think_tags)

            else:
                if image is None:
                    return self._prepare_return("", endpoint, unload_model, remove_think_tags)

                total_images = image.shape[0] if len(image.shape) == 4 else 1
                processed_count = 0
                error_count = 0
                error_details = []

                for i in range(total_images):
                    try:
                        if len(image.shape) == 4:
                            image_tensor = image[i:i+1]
                        else:
                            image_tensor = image

                        b64 = self._tensor_to_base64(image_tensor, size_limitation if size_limitation > 0 else None)
                        user_content = [
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                            {"type": "text", "text": full_user_text},
                        ]

                        messages = []
                        if effective_system_prompt.strip():
                            messages.append({"role": "system", "content": effective_system_prompt})
                        messages.append({"role": "user", "content": user_content})

                        result = self._call_api(endpoint, model, messages, max_tokens, temperature, top_p, top_k, repetition_penalty, seed)
                        results.append(f"Image {i+1}/{total_images}:\n{result}")
                        processed_count += 1

                    except Exception as e:
                        error_count += 1
                        error_msg = str(e)
                        error_details.append(f"[Image {i+1}] {error_msg}")

                combined_result = "\n\n" + "="*50 + "\n\n".join(results)
                summary = f"Batch processing completed!\nTotal: {total_images} images\nSuccess: {processed_count}\nFailed: {error_count}"
                if error_details:
                    summary += "\n\nFailure details:\n" + "\n".join(error_details)
                combined_result = summary + "\n\n" + "="*50 + "\n" + combined_result
                return self._prepare_return(combined_result, endpoint, unload_model, remove_think_tags)