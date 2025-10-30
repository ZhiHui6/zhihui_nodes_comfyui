import os
import sys
import torch
import numpy as np
import json
import requests
import base64
from io import BytesIO
from PIL import Image

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    print("警告: 未安装openai库，ModelScope API功能将使用requests库")
    OPENAI_AVAILABLE = False
    OpenAI = None

current_dir = os.path.dirname(os.path.abspath(__file__))

class Qwen3VLAPI:
    
    def __init__(self):
        self.config = self.load_config()
    
    def load_config(self):
        return self.get_default_config()
    
    def get_default_config(self):
        return {
            "platforms": {
                "SiliconFlow": {
                    "name": "SiliconFlow",
                    "api_base": "https://api.siliconflow.cn/v1/chat/completions",
                    "models": {
                        "Qwen3-VL-235B-A22B-Instruct": {
                            "display_name": "Qwen3-VL-235B-A22B-Instruct",
                            "api_name": "Qwen/Qwen3-VL-235B-A22B-Instruct",
                        },
                        "Qwen3-VL-235B-A22B-Thinking": {
                            "display_name": "Qwen3-VL-235B-A22B-Thinking",
                            "api_name": "Qwen/Qwen3-VL-235B-A22B-Thinking",
                        }
                    },
                    "default_params": {
                        "max_tokens": 1000,
                        "temperature": 0.7
                    }
                },
                "ModelScope": {
                    "name": "ModelScope",
                    "api_base": "https://api-inference.modelscope.cn/v1",
                    "models": {
                        "Qwen3-VL-235B-A22B-Instruct": {
                            "display_name": "Qwen3-VL-235B-A22B-Instruct",
                            "api_name": "Qwen/Qwen3-VL-235B-A22B-Instruct",
                        },
                        "Qwen3-VL-235B-A22B-Thinking": {
                            "display_name": "Qwen3-VL-235B-A22B-Thinking",
                            "api_name": "Qwen/Qwen3-VL-235B-A22B-Thinking",
                        }
                    },
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
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
            file_ext = os.path.splitext(image_path.lower())[1]
            if file_ext not in valid_extensions:
                raise ValueError(f"Unsupported image format: {file_ext}, supported formats: {', '.join(valid_extensions)}")
            
            image = Image.open(image_path)
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_array = np.array(image).astype(np.float32) / 255.0
            
            image_tensor = torch.from_numpy(image_array).permute(2, 0, 1)
            
            image_tensor = image_tensor.unsqueeze(0)
            
            return image_tensor
            
        except Exception as e:
            raise RuntimeError(f"Failed to load image {image_path}: {str(e)}")
    
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
            raise FileNotFoundError(f"Folder not found: {folder_path}")
        
        if not os.path.isdir(folder_path):
            raise ValueError(f"Path is not a folder: {folder_path}")
        
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
            raise RuntimeError(f"Failed to traverse folder {folder_path}: {str(e)}")
    
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
                    raise Exception("API response format exception")
            else:
                error_msg = f"API request failed, status code: {response.status_code}"
                try:
                    error_detail = response.json()
                    if "error" in error_detail:
                        error_msg += f", error message: {error_detail['error']}"
                except:
                    error_msg += f", response content: {response.text}"
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            raise Exception("Request timeout, please check network connection")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network request exception - {str(e)}")
        except Exception as e:
            if "API request failed" in str(e) or "API response format" in str(e) or "Request timeout" in str(e) or "Network request exception" in str(e):
                raise e
            else:
                raise Exception(f"Unexpected error: {str(e)}")
    
    def call_modelscope_api(self, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout=60):
        try:
            if OPENAI_AVAILABLE:
                return self._call_modelscope_with_openai(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            else:
                return self._call_modelscope_with_requests(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
                
        except Exception as e:
            raise Exception(f"ModelScope API call failed: {str(e)}")
    
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
            raise Exception(f"OpenAI client call failed: {str(e)}")
    
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
                    raise Exception("API response format error")
            else:
                raise Exception(f"API request failed, status code: {response.status_code}, response: {response.text}")
                
        except requests.exceptions.Timeout:
            raise Exception(f"API request timeout ({timeout} seconds)")
        except Exception as e:
            raise Exception(f"Requests call failed: {str(e)}")
    
    @classmethod
    def INPUT_TYPES(cls):
        instance = cls()
        available_models = instance.get_available_models()
        
        return {
            "required": {
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
                "api_platform": (["SiliconFlow", "ModelScope"], {
                    "default": "SiliconFlow",
                    "tooltip": "Select the API platform to use for image analysis."
                }),
                "api_key": ("STRING", {
                    "multiline": False,
                    "default": "",
                    "placeholder": "Enter your API key for the selected platform",
                    "tooltip": "API key for authentication with the selected platform."
                }),
                "model": (available_models if available_models else ["Qwen-VL-Max", "Qwen-VL-Plus"], {
                    "default": available_models[0] if available_models else "Qwen-VL-Max",
                    "tooltip": "Select the vision-language model to use for analysis."
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
    
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("analysis_result", "status_info")
    FUNCTION = "analyze_image"
    CATEGORY = "Zhi.AI/Qwen3VL"
    OUTPUT_NODE = True
    
    def validate_input_exclusivity(self, images, batch_mode, batch_folder_path):
        has_image_input = images is not None
        has_batch_folder = batch_mode and batch_folder_path and batch_folder_path.strip()
        
        if has_image_input and has_batch_folder:
            raise ValueError("⚠️ 输入冲突：不能同时使用图片输入端口和批量文件夹模式！\n\n请选择以下其中一种方式：\n• 使用图片输入端口 + 关闭批量模式\n• 启用批量模式 + 设置文件夹路径 + 断开图片输入端口")
        
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

    def analyze_image(self, images, api_platform, api_key, model, system_prompt, user_prompt, batch_mode, batch_folder_path, max_tokens, temperature, seed):
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
            if not api_key or api_key.strip() == "":
                error_msg = f"Please enter API key for {api_platform}"
                status_messages.append(f"❌ Error: {error_msg}")
                return ("", "\n".join(status_messages))
            
            platform_config = self.get_platform_config(api_platform)
            if not platform_config:
                error_msg = f"Unsupported platform: {api_platform}"
                status_messages.append(f"❌ Error: {error_msg}")
                return ("", "\n".join(status_messages))
            
            status_messages.append(f"✅ Platform: {api_platform}")
            
            api_model_name = self.get_model_api_name(api_platform, model)
            status_messages.append(f"✅ Model: {model} ({api_model_name})")
            
            final_prompt = self.get_final_prompt(system_prompt, user_prompt)
            
            if not batch_mode:
                status_messages.append("🔄 Processing single image...")
                
                if len(images.shape) == 4 and images.shape[0] > 0:
                    image_tensor = images[0:1]
                else:
                    image_tensor = images
                
                try:
                    result = self._process_single_image(
                        api_platform, api_key, image_tensor, final_prompt, 
                        api_model_name, max_tokens, temperature, timeout
                    )
                    status_messages.append("✅ Image analysis completed successfully")
                    return (result, "\n".join(status_messages))
                except Exception as e:
                    error_msg = f"Image analysis failed: {str(e)}"
                    status_messages.append(f"❌ Error: {error_msg}")
                    return ("", "\n".join(status_messages))
            
            else:
                results = []
                
                if batch_folder_path and batch_folder_path.strip():
                    status_messages.append(f"🔄 Starting batch processing from folder: {batch_folder_path}")
                    
                    try:
                        image_paths = self.traverse_folder_for_images(batch_folder_path.strip())
                        if not image_paths:
                            error_msg = f"No supported image files found in folder '{batch_folder_path}'"
                            status_messages.append(f"❌ Error: {error_msg}")
                            return ("", "\n".join(status_messages))
                        
                        total_images = len(image_paths)
                        processed_count = 0
                        error_count = 0
                        status_messages.append(f"📁 Found {total_images} images in folder")
                        
                        for i, image_path in enumerate(image_paths):
                            try:
                                status_messages.append(f"🔄 Processing image {i+1}/{total_images}: {os.path.basename(image_path)}")
                                
                                image_tensor = self.load_image_from_path(image_path)
                                
                                result = self._process_single_image(
                                    api_platform, api_key, image_tensor, final_prompt,
                                    api_model_name, max_tokens, temperature, timeout
                                )
                                
                                self.save_description(image_path, result)
                                processed_count += 1
                                
                                if i < total_images - 1:
                                    time.sleep(0.5)
                                    
                            except Exception as e:
                                error_count += 1
                                error_msg = f"Image {i+1}/{total_images} ({os.path.basename(image_path)}) failed: {str(e)}"
                                status_messages.append(f"❌ {error_msg}")
                                
                    except Exception as e:
                        error_msg = f"Folder traversal failed: {str(e)}"
                        status_messages.append(f"❌ Error: {error_msg}")
                        return ("", "\n".join(status_messages))
                        
                else:
                    total_images = images.shape[0] if len(images.shape) == 4 else 1
                    processed_count = 0
                    error_count = 0
                    status_messages.append(f"🔄 Starting batch processing of {total_images} tensor images")
                    
                    for i in range(total_images):
                        try:
                            status_messages.append(f"🔄 Processing tensor image {i+1}/{total_images}")
                            
                            if len(images.shape) == 4:
                                image_tensor = images[i:i+1]
                            else:
                                image_tensor = images
                            
                            result = self._process_single_image(
                                api_platform, api_key, image_tensor, final_prompt,
                                api_model_name, max_tokens, temperature, timeout
                            )
                            
                            results.append(f"Image {i+1}/{total_images}:\n{result}")
                            processed_count += 1
                            
                            if i < total_images - 1:
                                time.sleep(0.5)
                                
                        except Exception as e:
                            error_count += 1
                            error_msg = f"Image {i+1}/{total_images} failed: {str(e)}"
                            status_messages.append(f"❌ {error_msg}")
                
                status_messages.append(f"📊 Batch processing completed!")
                status_messages.append(f"   Total: {total_images} images")
                status_messages.append(f"   Success: {processed_count}")
                status_messages.append(f"   Failed: {error_count}")
                
                if batch_folder_path and batch_folder_path.strip():
                    log_message = f"Batch processing completed!\nTotal: {total_images} images\nSuccess: {processed_count}\nFailed: {error_count}"
                    return (log_message, "\n".join(status_messages))
                else:
                    combined_result = "\n\n" + "="*50 + "\n\n".join(results)
                    return (combined_result, "\n".join(status_messages))
                
        except Exception as e:
            error_msg = f"Image analysis failed: {str(e)}"
            status_messages.append(f"❌ Critical Error: {error_msg}")
            return ("", "\n".join(status_messages))
    
    def _process_single_image(self, api_platform, api_key, image_tensor, prompt, model, max_tokens, temperature, timeout):
        try:
            if api_platform == "SiliconFlow":
                return self.call_siliconflow_api(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            elif api_platform == "ModelScope":
                return self.call_modelscope_api(api_key, image_tensor, prompt, model, max_tokens, temperature, timeout)
            else:
                raise ValueError(f"Unsupported platform: {api_platform}")
        except Exception as e:
            raise Exception(f"API call failed: {str(e)}")
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")