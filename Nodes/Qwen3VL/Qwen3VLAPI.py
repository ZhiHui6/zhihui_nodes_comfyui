import os
import sys
import torch
import numpy as np
import json
import requests
import base64
from io import BytesIO
from PIL import Image
from datetime import datetime

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    print("警告: 未安装openai库，ModelScope API功能将使用requests库")
    OPENAI_AVAILABLE = False
    OpenAI = None

try:
    from server import PromptServer
    from aiohttp import web
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    print("警告: 无法导入PromptServer，API配置功能将不可用")
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None
    web = None

current_dir = os.path.dirname(os.path.abspath(__file__))

class Qwen3VLAPI:
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("result", "status")
    FUNCTION = "analyze_image"
    CATEGORY = "Zhi.AI/Qwen3VL"
    
    def __init__(self):
        self.config = self.load_config()
        self.api_config_path = os.path.join(current_dir, "api_config.json")
        self.api_config = self.load_api_config()
    
    def load_config(self):
        return self.get_default_config()
    
    def load_api_config(self):
        try:
            if os.path.exists(self.api_config_path):
                with open(self.api_config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                
                current_version = config.get("config_version", "1.0")
                if current_version != "3.0":
                    print("检测到旧版本配置文件，正在升级...")
                    config = self._upgrade_config(config)
                    self.save_api_config(config)
                    print("配置文件升级完成")
                
                return config
            else:
                default_config = {
                    "api_keys": {
                        "SiliconFlow": {
                            "api_key": "",
                            "selected_model": "Qwen3-VL-8B-Instruct",
                            "active": False
                        },
                        "ModelScope": {
                            "api_key": "",
                            "selected_model": "Qwen3-VL-8B-Instruct",
                            "active": False
                        }
                    },
                    "custom_configs": {
                        "custom_1": {
                            "name": "",
                            "api_base": "",
                            "model_name": "",
                            "api_key": "",
                            "active": False
                        },
                        "custom_2": {
                            "name": "",
                            "api_base": "",
                            "model_name": "",
                            "api_key": "",
                            "active": False
                        },
                        "custom_3": {
                            "name": "",
                            "api_base": "",
                            "model_name": "",
                            "api_key": "",
                            "active": False
                        }
                    },
                    "active_platform": "SiliconFlow",
                    "active_custom": "custom_1",
                    "config_version": "3.0",
                    "last_updated": "",
                    "notes": "此文件用于存储Qwen3VL API节点的通讯配置。包括平台预设的API密钥和完全自定义的配置信息。请妥善保管您的API密钥，不要将其分享给他人。"
                }
                self.save_api_config(default_config)
                return default_config
        except Exception as e:
            print(f"加载API配置文件失败: {e}")
            return {"api_keys": {}, "custom_configs": {}}
    
    def _upgrade_config(self, old_config):
        new_config = {
            "api_keys": old_config.get("api_keys", {}),
            "custom_configs": {
                "custom_1": {
                    "name": "",
                    "api_base": "",
                    "model_name": "",
                    "api_key": "",
                    "active": False
                },
                "custom_2": {
                    "name": "",
                    "api_base": "",
                    "model_name": "",
                    "api_key": "",
                    "active": False
                },
                "custom_3": {
                    "name": "",
                    "api_base": "",
                    "model_name": "",
                    "api_key": "",
                    "active": False
                }
            },
            "active_platform": "SiliconFlow",
            "active_custom": "custom_1",
            "config_version": "3.0",
            "last_updated": old_config.get("last_updated", ""),
            "notes": "此文件用于存储Qwen3VL API节点的通讯配置。包括平台预设的API密钥和完全自定义的配置信息。请妥善保管您的API密钥，不要将其分享给他人。"
        }
        
        old_active_config = old_config.get("active_config", {})
        if old_active_config:
            if old_active_config.get("type") == "platform":
                new_config["active_platform"] = old_active_config.get("name", "SiliconFlow")
            elif old_active_config.get("type") == "custom":
                new_config["active_custom"] = old_active_config.get("name", "custom_1")
        
        old_custom_configs = old_config.get("custom_configs", {})
        for key in ["custom_1", "custom_2", "custom_3"]:
            if key in old_custom_configs:
                old_custom = old_custom_configs[key]
                new_config["custom_configs"][key].update({
                    "name": old_custom.get("name", ""),
                    "api_base": old_custom.get("api_base", ""),
                    "model_name": old_custom.get("model_name", ""),
                    "api_key": old_custom.get("api_key", ""),
                    "active": old_custom.get("active", old_custom.get("enabled", False))
                })
        
        for platform in ["SiliconFlow", "ModelScope"]:
            if platform in new_config["api_keys"]:
                if "selected_model" not in new_config["api_keys"][platform]:
                    new_config["api_keys"][platform]["selected_model"] = "Qwen3-VL-8B-Instruct"
                if "active" not in new_config["api_keys"][platform]:
                    new_config["api_keys"][platform]["active"] = False
        
        return new_config
    
    def save_api_config(self, config):
        try:
            config["last_updated"] = datetime.now().isoformat()
            with open(self.api_config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=4)
            return True
        except Exception as e:
            print(f"保存API配置文件失败: {e}")
            return False
    
    def get_api_key_from_config(self, platform):
        try:
            return self.api_config.get("api_keys", {}).get(platform, {}).get("api_key", "")
        except:
            return ""
    
    def get_shared_models(self):
        return {
            "Qwen3-VL-8B-Instruct": {
                "display_name": "Qwen3-VL-8B-Instruct",
                "api_name": "Qwen/Qwen3-VL-8B-Instruct",
            },
            "Qwen3-VL-8B-Thinking": {
                "display_name": "Qwen3-VL-8B-Thinking",
                "api_name": "Qwen/Qwen3-VL-8B-Thinking",
            },
            "Qwen3-VL-30B-A3B-Instruct": {
                "display_name": "Qwen3-VL-30B-A3B-Instruct",
                "api_name": "Qwen/Qwen3-VL-30B-A3B-Instruct",
            },
            "Qwen3-VL-30B-A3B-Thinking": {
                "display_name": "Qwen3-VL-30B-A3B-Thinking",
                "api_name": "Qwen/Qwen3-VL-30B-A3B-Thinking",
            },
            "Qwen3-VL-32B-Instruct": {
                "display_name": "Qwen3-VL-32B-Instruct",
                "api_name": "Qwen/Qwen3-VL-32B-Instruct",
            },
            "Qwen3-VL-32B-Thinking": {
                "display_name": "Qwen3-VL-32B-Thinking",
                "api_name": "Qwen/Qwen3-VL-32B-Thinking",
            },
            "Qwen3-VL-235B-A22B-Instruct": {
                "display_name": "Qwen3-VL-235B-A22B-Instruct",
                "api_name": "Qwen/Qwen3-VL-235B-A22B-Instruct",
            },
            "Qwen3-VL-235B-A22B-Thinking": {
                "display_name": "Qwen3-VL-235B-A22B-Thinking",
                "api_name": "Qwen/Qwen3-VL-235B-A22B-Thinking",
            },
        }

    def get_default_config(self):
        shared_models = self.get_shared_models()
        
        return {
            "platforms": {
                "SiliconFlow": {
                    "name": "SiliconFlow",
                    "api_base": "https://api.siliconflow.cn/v1/chat/completions",
                    "models": shared_models,
                    "default_params": {
                        "max_tokens": 1000,
                        "temperature": 0.7
                    }
                },
                "ModelScope": {
                    "name": "ModelScope",
                    "api_base": "https://api-inference.modelscope.cn/v1",
                    "models": shared_models,
                    "default_params": {
                        "max_tokens": 1000,
                        "temperature": 0.7
                    }
                }
            },
            "default_prompts": {
                "image_description": "Please describe this image in detail, including main objects, scene, colors, composition and other elements.",
                "image_analysis": "Please analyze this image, including its visual elements, possible meanings, emotional expression and artistic features.",
                "creative_writing": "Based on this image, please create an interesting story or describe a scene.",
                "technical_analysis": "Please analyze this image from a technical perspective, including shooting techniques, lighting usage, composition methods, etc."
            },
            "ui_config": {
                "category": "Zhi.AI/Qwen3VL_API",
                "display_name": "Qwen3-VL Online",
                "description": "Qwen3-VL image analysis node supporting multi-platform APIs"
            }
        }
    
    def get_available_models(self):
        models = []
        for platform_key, platform_config in self.config.get("platforms", {}).items():
            for model_key, model_info in platform_config.get("models", {}).items():
                models.append(model_info["display_name"])
        return list(set(models))
    
    def tensor_to_base64(self, tensor):
        if tensor.max() <= 1.0:
            tensor = tensor * 255.0
        
        if len(tensor.shape) == 4:
            tensor = tensor.squeeze(0)
        
        if tensor.shape[0] == 3:
            tensor = tensor.permute(1, 2, 0)
        
        image_array = tensor.cpu().numpy().astype(np.uint8)
        image = Image.fromarray(image_array)
        
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def load_image_from_path(self, image_path):
        try:
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"图片文件未找到: {image_path}")
            
            valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
            file_ext = os.path.splitext(image_path.lower())[1]
            if file_ext not in valid_extensions:
                raise ValueError(f"不支持的图片格式: {file_ext}，支持的格式: {', '.join(valid_extensions)}")
            
            image = Image.open(image_path)
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_array = np.array(image).astype(np.float32) / 255.0
            
            image_tensor = torch.from_numpy(image_array).permute(2, 0, 1)
            
            image_tensor = image_tensor.unsqueeze(0)
            
            return image_tensor
            
        except Exception as e:
            raise RuntimeError(f"加载图片失败 {image_path}: {str(e)}")
    
    def parse_batch_paths(self, batch_paths_str):
        if not batch_paths_str or not batch_paths_str.strip():
            return []
        
        paths = []
        for line in batch_paths_str.strip().split('\n'):
            path = line.strip()
            if path:
                paths.append(path)
        
        return paths
    
    def traverse_folder_for_images(self, folder_path, recursive=True, sort_by='name', reverse=False):
        if not folder_path or not folder_path.strip():
            return []
        
        folder_path = folder_path.strip()
        
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"文件夹未找到: {folder_path}")
        
        if not os.path.isdir(folder_path):
            raise ValueError(f"路径不是文件夹: {folder_path}")
        
        valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tiff', '.tif', '.gif'}
        image_files = []
        
        try:
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
            
            if sort_by == 'name':
                image_files.sort(key=lambda x: os.path.basename(x).lower(), reverse=reverse)
            elif sort_by == 'size':
                image_files.sort(key=lambda x: os.path.getsize(x), reverse=reverse)
            elif sort_by == 'modified':
                image_files.sort(key=lambda x: os.path.getmtime(x), reverse=reverse)
            elif sort_by == 'created':
                image_files.sort(key=lambda x: os.path.getctime(x), reverse=reverse)
            else:
                image_files.sort(key=lambda x: os.path.basename(x).lower(), reverse=reverse)
            
            return image_files
            
        except Exception as e:
            raise RuntimeError(f"遍历文件夹失败 {folder_path}: {str(e)}")
    
    def get_folder_image_count(self, folder_path, recursive=True):
        try:
            image_files = self.traverse_folder_for_images(folder_path, recursive)
            return len(image_files)
        except Exception:
            return 0
    
    def save_description(self, image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(description)
    
    def call_siliconflow_api(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            base_url = "https://api.siliconflow.cn/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            image_base64 = self.tensor_to_base64(image_tensor)
            
            data = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_base64
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False
            }
            
            response = requests.post(base_url, headers=headers, json=data, timeout=timeout)
            
            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    return content
                else:
                    raise Exception("API响应格式异常")
            else:
                error_msg = f"API请求失败，状态码: {response.status_code}"
                try:
                    error_detail = response.json()
                    if "error" in error_detail:
                        error_msg += f"，错误信息: {error_detail['error']}"
                except:
                    error_msg += f"，响应内容: {response.text}"
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            raise Exception("请求超时，请检查网络连接")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求异常 - {str(e)}")
        except Exception as e:
            if "API请求失败" in str(e) or "API响应格式" in str(e) or "请求超时" in str(e) or "网络请求异常" in str(e):
                raise e
            else:
                raise Exception(f"意外错误: {str(e)}")
    
    def call_modelscope_api(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            if OPENAI_AVAILABLE:
                return self._call_modelscope_with_openai(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            else:
                return self._call_modelscope_with_requests(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
                
        except Exception as e:
            raise Exception(f"ModelScope API调用失败: {str(e)}")
    
    def _call_modelscope_with_openai(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            image_base64 = self.tensor_to_base64(image_tensor)
            if image_base64.startswith('data:image/'):
                image_base64 = image_base64.split(',', 1)[1]
            
            client = OpenAI(
                base_url='https://api-inference.modelscope.cn/v1',
                api_key=api_key
            )
            
            messages = [{
                'role': 'user',
                'content': [{
                    'type': 'text',
                    'text': prompt,
                }, {
                    'type': 'image_url',
                    'image_url': {
                        'url': f"data:image/png;base64,{image_base64}",
                    },
                }],
            }]
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"OpenAI客户端调用失败: {str(e)}")
    
    def _call_modelscope_with_requests(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            image_base64 = self.tensor_to_base64(image_tensor)
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            messages = []
            
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_base64
                        }
                    }
                ]
            })
            
            data = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(
                "https://api-inference.modelscope.cn/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    raise Exception("API响应格式错误")
            else:
                raise Exception(f"API请求失败，状态码: {response.status_code}，响应: {response.text}")
                
        except requests.exceptions.Timeout:
            raise Exception(f"API请求超时 ({timeout} 秒)")
        except Exception as e:
            raise Exception(f"Requests调用失败: {str(e)}")
    
    def call_custom_api(self, api_base, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            image_base64 = self.tensor_to_base64(image_tensor)
            
            data = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_base64
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False
            }
            
            response = requests.post(api_base, headers=headers, json=data, timeout=timeout)
            
            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    return content
                else:
                    raise Exception("API响应格式异常")
            else:
                error_msg = f"API请求失败，状态码: {response.status_code}"
                try:
                    error_detail = response.json()
                    if "error" in error_detail:
                        error_msg += f"，错误信息: {error_detail['error']}"
                except:
                    error_msg += f"，响应内容: {response.text}"
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            raise Exception("请求超时，请检查网络连接")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求异常 - {str(e)}")
        except Exception as e:
            if "API请求失败" in str(e) or "API响应格式" in str(e) or "请求超时" in str(e) or "网络请求异常" in str(e):
                raise e
            else:
                raise Exception(f"意外错误: {str(e)}")
    
    @classmethod
    def INPUT_TYPES(cls):
        instance = cls()
        available_models = instance.get_available_models()
        
        return {
            "required": {
                "config_mode": (["Platform Presets", "Fully Custom"], {
                    "default": "Platform Presets",
                    "tooltip": "Select configuration mode: Platform Preset uses built-in platform settings, Fully Custom allows manual setup of all parameters."
                }),
                "user_prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "user prompt",
                    "tooltip": "User prompt for image analysis. Describe what you want to know about the image."
                }),
                "system_prompt": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "system prompt",
                    "tooltip": "System prompt to guide the AI's behavior and response style."
                }),

                "max_tokens": ("INT", {
                    "default": 2048,
                    "min": 256,
                    "max": 8192,
                    "step": 1,
                    "tooltip": "Maximum number of tokens in the generated response."
                }),
                "temperature": ("FLOAT", {
                    "default": 0.7,
                    "min": 0.1,
                    "max": 2.0,
                    "step": 0.1,
                    "tooltip": "Temperature parameter controlling randomness in text generation. Lower values = more focused, higher values = more creative."
                }),
                "seed": ("INT", {
                    "default": -1,
                    "min": -1,
                    "max": 0xffffffffffffffff,
                    "tooltip": "Random seed for reproducible results. Use -1 for random seed."
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Enable batch processing mode."
                }),
                "batch_folder_path": ("STRING", {
                    "multiline": False,
                    "default": "",
                    "tooltip": "Path to folder containing images for batch processing."
                }),
            },
            "optional": {
                "images": ("IMAGE", {
                    "tooltip": "Input images for analysis."
                }),
            }
        }
    
    def validate_input_exclusivity(self, images, batch_mode, batch_folder_path):
        has_image_input = images is not None
        has_batch_folder = batch_mode and batch_folder_path and batch_folder_path.strip()
        
        if has_image_input and has_batch_folder:
            raise ValueError("⚠️ 输入冲突：不能同时使用图片输入端口和批量文件夹模式！\n\n请选择以下其中一种方式：\n• 使用图片输入端口：请关闭批量模式\n• 启用批量模式：请设置文件夹路径并断开图片输入端口")
        
        if batch_mode and not has_batch_folder and not has_image_input:
            raise ValueError("⚠️ 批量模式配置错误：已启用批量模式但未提供图片源！\n\n请选择以下其中一种方式：\n• 设置批量文件夹路径\n• 连接图片输入端口并关闭批量模式")
        
        if not batch_mode and not has_image_input:
            raise ValueError("⚠️ 缺少图片输入：未检测到任何图片输入源！\n\n请选择以下其中一种方式：\n• 连接图片输入端口\n• 启用批量模式并设置文件夹路径")

    def get_platform_config(self, platform_name):
        platform_mapping = {
            "SiliconFlow": "SiliconFlow",
            "ModelScope": "ModelScope", 
        }
        platform_key = platform_mapping.get(platform_name)
        if platform_key:
            return self.config.get("platforms", {}).get(platform_key, {})
        return {}
    
    def get_model_api_name(self, platform_name, display_model_name):
        config = self.load_config()
        if config and platform_name in config["platforms"]:
            platform_config = config["platforms"][platform_name]
            if "models" in platform_config:
                for model_key, model_info in platform_config["models"].items():
                    if model_info.get("display_name") == display_model_name:
                        return model_info.get("api_name", model_key)
        
        if platform_name == "SiliconFlow":
            return display_model_name
        return display_model_name
    
    def get_final_prompt(self, system_prompt, user_prompt):
        if system_prompt.strip():
            return f"System: {system_prompt.strip()}\n\nUser: {user_prompt.strip()}"
        else:
            return user_prompt.strip()

    def analyze_image(self, config_mode, system_prompt, user_prompt, batch_mode, batch_folder_path, max_tokens, temperature, seed, images=None):
        import random
        import time
        
        status_messages = []
        
        self.validate_input_exclusivity(images, batch_mode, batch_folder_path)
        
        if seed != -1:
            random.seed(seed)
            torch.manual_seed(seed)
            if torch.cuda.is_available():
                torch.cuda.manual_seed(seed)
        
        timeout = 60
        
        try:
            if config_mode == "完全自定义":
                config = self.load_api_config()
                active_custom = config.get("active_custom", "custom_1")
                
                custom_config = config.get("custom_configs", {}).get(active_custom, {})
                
                if not custom_config:
                    custom_configs = config.get("custom_configs", {})
                    custom_config = None
                    for key in ["custom_1", "custom_2", "custom_3"]:
                        if key in custom_configs and custom_configs[key].get("api_key"):
                            custom_config = custom_configs[key]
                            break
                    
                    if not custom_config:
                        custom_config = custom_configs.get("custom_1", {})
                
                custom_api_key = custom_config.get("api_key", "")
                custom_api_base = custom_config.get("api_base", "")
                custom_model_name = custom_config.get("model_name", "")
                custom_name = custom_config.get("name", "自定义配置")
                
                if not custom_api_key or custom_api_key.strip() == "":
                    error_msg = "完全自定义模式下必须在通讯配置界面中设置API密钥"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                if not custom_api_base or custom_api_base.strip() == "":
                    error_msg = "完全自定义模式下必须在通讯配置界面中设置API基础地址"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                if not custom_model_name or custom_model_name.strip() == "":
                    error_msg = "完全自定义模式下必须在通讯配置界面中设置模型名称"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                api_key = custom_api_key.strip()
                api_base = custom_api_base.strip()
                api_model_name = custom_model_name.strip()
                platform_name = "自定义"
                
                status_messages.append(f"✅ 使用完全自定义配置: {custom_name}")
                status_messages.append(f"✅ API地址: {api_base}")
                status_messages.append(f"✅ 模型: {api_model_name}")
                
            else:
                config = self.load_api_config()
                active_platform = config.get("active_platform", "SiliconFlow")
                
                selected_platform = active_platform
                
                platform_config_data = config.get("api_keys", {}).get(selected_platform, {})
                api_key = platform_config_data.get("api_key", "")
                selected_model = platform_config_data.get("selected_model", "Qwen3-VL-8B-Instruct")
                
                if not api_key or api_key.strip() == "":
                    error_msg = f"请在配置文件中设置{selected_platform}平台的API密钥，或点击'打开通讯配置界面'按钮进行配置"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                platform_config = self.get_platform_config(selected_platform)
                if not platform_config:
                    error_msg = f"不支持的平台: {selected_platform}"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                api_base = platform_config.get("api_base", "")
                api_model_name = self.get_model_api_name(selected_platform, selected_model)
                platform_name = selected_platform
                
                status_messages.append(f"✅ 使用配置文件中的API密钥")
                status_messages.append(f"✅ 平台: {selected_platform}")
                status_messages.append(f"✅ 模型: {selected_model} ({api_model_name})")
            
            final_prompt = self.get_final_prompt(system_prompt, user_prompt)
            
            if not batch_mode:
                status_messages.append("🔄 正在处理单张图片...")
                
                if images is None:
                    error_msg = "单图模式下必须提供图片输入"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
                
                if len(images.shape) == 4 and images.shape[0] > 0:
                    image_tensor = images[0:1]
                else:
                    image_tensor = images
                
                try:
                    result = self._process_single_image(
                        platform_name, api_key, image_tensor, final_prompt, 
                        api_model_name, max_tokens, temperature, timeout, api_base
                    )
                    status_messages.append("✅ 图片分析完成")
                    return (result, "\n".join(status_messages))
                except Exception as e:
                    error_msg = f"图片分析失败: {str(e)}"
                    status_messages.append(f"❌ 错误: {error_msg}")
                    return ("", "\n".join(status_messages))
            
            else:
                results = []
                
                if batch_folder_path and batch_folder_path.strip():
                    status_messages.append(f"🔄 开始批量处理文件夹: {batch_folder_path}")
                    
                    try:
                        image_paths = self.traverse_folder_for_images(batch_folder_path.strip())
                        if not image_paths:
                            error_msg = f"在文件夹 '{batch_folder_path}' 中未找到支持的图片文件"
                            status_messages.append(f"❌ 错误: {error_msg}")
                            return ("", "\n".join(status_messages))
                        
                        total_images = len(image_paths)
                        processed_count = 0
                        error_count = 0
                        status_messages.append(f"📁 在文件夹中找到 {total_images} 张图片")
                        
                        for i, image_path in enumerate(image_paths):
                            try:
                                status_messages.append(f"🔄 正在处理图片 {i+1}/{total_images}: {os.path.basename(image_path)}")
                                
                                image_tensor = self.load_image_from_path(image_path)
                                
                                result = self._process_single_image(
                                    platform_name, api_key, image_tensor, final_prompt,
                                    api_model_name, max_tokens, temperature, timeout, api_base
                                )
                                
                                self.save_description(image_path, result)
                                processed_count += 1
                                
                                if i < total_images - 1:
                                    time.sleep(0.5)
                                    
                            except Exception as e:
                                error_count += 1
                                error_msg = f"图片 {i+1}/{total_images} ({os.path.basename(image_path)}) 处理失败: {str(e)}"
                                status_messages.append(f"❌ {error_msg}")
                                
                    except Exception as e:
                        error_msg = f"文件夹遍历失败: {str(e)}"
                        status_messages.append(f"❌ 错误: {error_msg}")
                        return ("", "\n".join(status_messages))
                        
                else:
                    if images is None:
                        error_msg = "批量模式下必须提供图片输入或文件夹路径"
                        status_messages.append(f"❌ 错误: {error_msg}")
                        return ("", "\n".join(status_messages))
                    
                    total_images = images.shape[0] if len(images.shape) == 4 else 1
                    processed_count = 0
                    error_count = 0
                    status_messages.append(f"🔄 开始批量处理 {total_images} 张张量图片")
                    
                    for i in range(total_images):
                        try:
                            status_messages.append(f"🔄 正在处理张量图片 {i+1}/{total_images}")
                            
                            if len(images.shape) == 4:
                                image_tensor = images[i:i+1]
                            else:
                                image_tensor = images
                            
                            result = self._process_single_image(
                                platform_name, api_key, image_tensor, final_prompt,
                                api_model_name, max_tokens, temperature, timeout, api_base
                            )
                            
                            results.append(f"图片 {i+1}/{total_images}:\n{result}")
                            processed_count += 1
                            
                            if i < total_images - 1:
                                time.sleep(0.5)
                                
                        except Exception as e:
                            error_count += 1
                            error_msg = f"图片 {i+1}/{total_images} 处理失败: {str(e)}"
                            status_messages.append(f"❌ {error_msg}")
                
                status_messages.append(f"📊 批量处理完成！")
                status_messages.append(f"   总计: {total_images} 张图片")
                status_messages.append(f"   成功: {processed_count}")
                status_messages.append(f"   失败: {error_count}")
                
                if batch_folder_path and batch_folder_path.strip():
                    log_message = f"批量处理完成！\n总计: {total_images} 张图片\n成功: {processed_count}\n失败: {error_count}"
                    return (log_message, "\n".join(status_messages))
                else:
                    combined_result = "\n\n" + "="*50 + "\n\n".join(results)
                    return (combined_result, "\n".join(status_messages))
                
        except Exception as e:
            error_msg = f"图片分析失败: {str(e)}"
            status_messages.append(f"❌ 严重错误: {error_msg}")
            return ("", "\n".join(status_messages))
    
    def _process_single_image(self, platform_name, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout, api_base=None):
        try:
            if platform_name == "自定义":
                if not api_base:
                    raise ValueError("自定义模式下必须提供API基础地址")
                return self.call_custom_api(api_base, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            elif platform_name == "SiliconFlow":
                return self.call_siliconflow_api(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            elif platform_name == "ModelScope":
                return self.call_modelscope_api(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            else:
                raise ValueError(f"不支持的平台: {platform_name}")
        except Exception as e:
            raise Exception(f"API调用失败: {str(e)}")
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

if PROMPT_SERVER_AVAILABLE:
    _api_instance = None
    
    def get_api_instance():
        global _api_instance
        if _api_instance is None:
            _api_instance = Qwen3VLAPI()
        return _api_instance
    
    @PromptServer.instance.routes.get("/zhihui_nodes/communication_config")
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
    
    @PromptServer.instance.routes.post("/zhihui_nodes/communication_config")
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