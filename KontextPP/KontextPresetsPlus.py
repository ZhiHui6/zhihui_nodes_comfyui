import json
import os
import requests
import time

class KontextPresetsPlus:
    data = None
    
    @classmethod
    def load_presets(cls):
        if cls.data is not None:
            return cls.data
            
        current_dir = os.path.dirname(os.path.abspath(__file__))
        presets_file = os.path.join(current_dir, "presets.txt")
        
        try:
            with open(presets_file, 'r', encoding='utf-8') as f:
                cls.data = json.load(f)
            print(f"✅ 成功加载预设文件: {presets_file}")
        except FileNotFoundError:
            print(f"❌ 预设文件未找到: {presets_file}")
            cls.data = {
                "prefix": "You are a creative prompt engineer.",
                "预设集": [],
                "suffix": "Your response must consist of concise instruction ready for the image editing AI."
            }
        except json.JSONDecodeError as e:
            print(f"❌ 预设文件格式错误: {e}")
            cls.data = {
                "prefix": "You are a creative prompt engineer.",
                "预设集": [],
                "suffix": "Your response must consist of concise instruction ready for the image editing AI."
            }
        except Exception as e:
            print(f"❌ 加载预设文件时发生错误: {e}")
            cls.data = {
                "prefix": "You are a creative prompt engineer.",
                "预设集": [],
                "suffix": "Your response must consist of concise instruction ready for the image editing AI."
            }
            
        return cls.data

    @classmethod
    def INPUT_TYPES(cls):
        data = cls.load_presets()
        preset_names = [预设["name"] for 预设 in data.get("预设集", [])]
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
    RETURN_NAMES = ("预设内容",)
    FUNCTION = "get_预设"
    CATEGORY = "utils"
    
    @classmethod
    def get_brief_by_name(cls, name):
        data = cls.load_presets()
        for 预设 in data.get("预设集", []):
            if 预设["name"] == name:
                return 预设["brief"]
        return None
    
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
                    400: "请求参数错误 - 请检查模型名称和参数设置",
                    401: "API认证失败 - 请检查API密钥",
                    403: "访问被拒绝 - 可能超出了API使用限制",
                    404: "API端点未找到 - 请检查API地址",
                    429: "请求过于频繁 - 请稍后重试",
                    500: "服务器内部错误 - API服务暂时不可用",
                    502: "网关错误 - API服务连接失败",
                    503: "服务不可用 - API服务正在维护",
                    504: "网关超时 - API响应时间过长"
                }
                error_msg = error_messages.get(response.status_code, f"未知错误 - HTTP状态码: {response.status_code}")
                print(f"❌ API调用失败: {error_msg} | 模型: {扩写模型}")
                return f"[API错误] {error_msg}\n\n原始提示词:\n{prompt}"
                
        except requests.exceptions.Timeout:
            error_msg = "请求超时 - API服务响应时间超过45秒"
            print(f"⏰ {error_msg} | 模型: {扩写模型}")
            return f"[超时错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except requests.exceptions.ConnectionError:
            error_msg = "网络连接失败 - 无法连接到API服务器"
            print(f"🌐 {error_msg} | 模型: {扩写模型}")
            return f"[连接错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except requests.exceptions.RequestException as e:
            error_msg = f"网络请求异常 - {str(e)}"
            print(f"📡 {error_msg} | 模型: {扩写模型}")
            return f"[网络错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except json.JSONDecodeError:
            error_msg = "API响应格式错误 - 无法解析服务器返回的数据"
            print(f"📄 {error_msg} | 模型: {扩写模型}")
            return f"[数据格式错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except Exception as e:
            error_msg = f"未知异常 - {str(e)}"
            print(f"❓ {error_msg} | 模型: {扩写模型}")
            return f"[系统错误] {error_msg}\n\n原始提示词:\n{prompt}"

    def _process_with_llm(self, brief_content, prefix, suffix, 扩写模型):
        brief = "The Brief:" + brief_content
        full_prompt = prefix + "\n" + brief + "\n" + suffix
        return self.call_llm_api(full_prompt, 扩写模型)
    
    def get_预设(self, 预设, 输出完整信息, 启用内置扩写, 扩写模型, 自定义内容=""):
        data = self.load_presets()
        prefix = data.get("prefix", "")
        suffix = data.get("suffix", "")
              
        if 预设 == "自定义":
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