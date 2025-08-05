import json
import os
import requests
import time
import re

class KontextPresetsPlus:
    data = None
    
    @staticmethod
    def clean_json_trailing_commas(json_str):
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        return json_str
    
    @classmethod
    def load_presets(cls):
        if cls.data is not None:
            return cls.data
            
        current_dir = os.path.dirname(os.path.abspath(__file__))
        default_presets_file = os.path.join(current_dir, "presets.txt")
        user_presets_file = os.path.join(current_dir, "user_presets.txt")
        

        default_presets = []
        try:
            with open(default_presets_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cleaned_content = cls.clean_json_trailing_commas(content)
                default_data = json.loads(cleaned_content)

                if isinstance(default_data, list):
                    default_presets = default_data
                elif isinstance(default_data, dict) and "预设集" in default_data:
                    default_presets = default_data["预设集"]
                else:
                    default_presets = []

                for preset in default_presets:
                    preset["category"] = "默认"
            print(f"✅ 成功加载默认预设文件: {default_presets_file}")
        except FileNotFoundError:
            print(f"❌ 默认预设文件未找到: {default_presets_file}")
        except json.JSONDecodeError as e:
            print(f"❌ 默认预设文件格式错误: {e}")
        except Exception as e:
            print(f"❌ 加载默认预设文件时发生错误: {e}")
        

        user_presets = []
        try:
            with open(user_presets_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cleaned_content = cls.clean_json_trailing_commas(content)
                user_data = json.loads(cleaned_content)

                if isinstance(user_data, list):
                    user_presets = user_data
                elif isinstance(user_data, dict) and "预设集" in user_data:
                    user_presets = user_data["预设集"]
                else:
                    user_presets = []

                for preset in user_presets:
                    preset["category"] = "用户"
            print(f"✅ 成功加载用户预设文件: {user_presets_file}")
        except FileNotFoundError:
            print(f"ℹ️ 用户预设文件未找到，将跳过: {user_presets_file}")
        except json.JSONDecodeError as e:
            print(f"❌ 用户预设文件格式错误: {e}")
        except Exception as e:
            print(f"❌ 加载用户预设文件时发生错误: {e}")
        

        all_presets = default_presets + user_presets
        cls.data = {"预设集": all_presets}
            
        return cls.data

    @classmethod
    def INPUT_TYPES(cls):
        data = cls.load_presets()
        preset_names = []
        for 预设 in data.get("预设集", []):
            category = 预设.get("category", "默认")
            name = 预设["name"]
            display_name = f"[{category}] {name}"
            preset_names.append(display_name)
        return {
            "required": {
                "预设": (preset_names, {"default": preset_names[0] if preset_names else "无预设"}),
                "输出完整信息": ("BOOLEAN", {"default": False}),
                "扩写模型": (["deepseek", "gemini", "openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"], {"default": "openai"}),
                "启用内置扩写": ("BOOLEAN", {"default": False}),

            },
            "optional": {
                "自定义内容": ("STRING", {"multiline": True, "default": "", "placeholder": "当选择'自定义'预设时，请在此输入您的自定义内容..."}),
            }
        }
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("提示词内容",)
    FUNCTION = "get_预设"
    CATEGORY = "utils"
    
    @classmethod
    def get_brief_by_name(cls, display_name):

        if display_name.startswith("[") and "] " in display_name:
            actual_name = display_name.split("] ", 1)[1]
        else:
            actual_name = display_name
            
        data = cls.load_presets()
        for 预设 in data.get("预设集", []):
            if 预设["name"] == actual_name:
                return 预设["brief"]
        return None
    
    def _handle_error(self, error_type, error_msg, model, prompt):
        print(f"❌ {error_msg} | 模型: {model}")
        return f"[{error_type}] {error_msg}\n\n原始提示词:\n{prompt}"
    
    def call_llm_api(self, prompt, 扩写模型=""):
        try:
            api_url = "https://text.pollinations.ai/"
            random_seed = int(time.time() * 1000000) % 0xffffffffffffffff
            print(f"🎲 API调用随机种子: {random_seed}")
            
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "扩写模型": 扩写模型,
                "seed": random_seed,
                "timestamp": int(time.time())
            }
            response = requests.post(api_url, 
                                   json=payload,
                                   headers={"Content-Type": "application/json"},
                                   timeout=45)
            
            if response.status_code == 200:
                return response.text.strip()
            else:
                error_messages = {
                    400: "请求参数错误", 401: "API认证失败", 403: "访问被拒绝",
                    404: "API端点未找到", 429: "请求过于频繁", 500: "服务器内部错误",
                    502: "网关错误", 503: "服务不可用", 504: "网关超时"
                }
                error_msg = error_messages.get(response.status_code, f"HTTP错误: {response.status_code}")
                return self._handle_error("API错误", error_msg, 扩写模型, prompt)
                
        except requests.exceptions.Timeout:
            return self._handle_error("超时错误", "请求超时", 扩写模型, prompt)
        except requests.exceptions.ConnectionError:
            return self._handle_error("连接错误", "网络连接失败", 扩写模型, prompt)
        except requests.exceptions.RequestException as e:
            return self._handle_error("网络错误", f"请求异常: {str(e)}", 扩写模型, prompt)
        except json.JSONDecodeError:
            return self._handle_error("格式错误", "响应数据格式错误", 扩写模型, prompt)
        except Exception as e:
            return self._handle_error("系统错误", f"未知异常: {str(e)}", 扩写模型, prompt)

    def _process_with_llm(self, brief_content, prefix, suffix, 扩写模型):
        brief = "The Brief:" + brief_content
        full_prompt = prefix + "\n" + brief + "\n" + suffix
        return self.call_llm_api(full_prompt, 扩写模型)
    
    def get_预设(self, 预设, 输出完整信息, 启用内置扩写, 扩写模型, 自定义内容=""):
        data = self.load_presets()
        prefix = "You are a creative prompt engineer. Analyze the provided brief and transform it into a detailed, creative prompt that captures the essence and style described. Focus on visual elements, artistic techniques, mood, and atmosphere."
        suffix = "Your response must consist of concise instruction ready for the image editing AI. Do not add any conversational text, explanations, or deviations; only the instructions."
              

        if 预设.startswith("[") and "] " in 预设:
            actual_preset_name = 预设.split("] ", 1)[1]
        else:
            actual_preset_name = 预设
            
        if actual_preset_name == "自定义":
            brief_content = 自定义内容 if 自定义内容.strip() else ""
        else:
            brief_content = self.get_brief_by_name(预设)
        
        if 启用内置扩写:
            processed_string = self._process_with_llm(brief_content, prefix, suffix, 扩写模型)
            return (processed_string,)
        
        if 输出完整信息:
            full_info = f"{prefix}\n\n{brief_content}\n\n{suffix}"
            return (full_info,)
        else:
            return (brief_content,)