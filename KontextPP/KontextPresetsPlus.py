import json
import requests
import os

class KontextPresetsPlus:
    data = None
    
    @classmethod
    def load_presets(cls):
        """从presets.txt文件加载预设数据"""
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
            # 使用默认的空数据结构
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
        return {
            "required": {
                "预设": ([预设["name"] for 预设 in data.get("预设集", [])],),
                "启用扩写": ("BOOLEAN", {"default": False}),
                "扩写模型": (["openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"],),
                "创意温度": ("FLOAT", {"default": 0.7, "min": 0.0, "max": 2.0, "step": 0.1, "round": 0.1, "display": "slider"}),
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
    
    def call_llm_api(self, prompt, 扩写模型="", 创意温度=0.7):
        try:
            api_url = "https://text.pollinations.ai/"
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "扩写模型": 扩写模型,
                "创意温度": 创意温度
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
                print(f"❌ API调用失败: {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
                return f"[API错误] {error_msg}\n\n原始提示词:\n{prompt}"
                
        except requests.exceptions.Timeout:
            error_msg = "请求超时 - API服务响应时间超过45秒"
            print(f"⏰ {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
            return f"[超时错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except requests.exceptions.ConnectionError:
            error_msg = "网络连接失败 - 无法连接到API服务器"
            print(f"🌐 {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
            return f"[连接错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except requests.exceptions.RequestException as e:
            error_msg = f"网络请求异常 - {str(e)}"
            print(f"📡 {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
            return f"[网络错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except json.JSONDecodeError:
            error_msg = "API响应格式错误 - 无法解析服务器返回的数据"
            print(f"📄 {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
            return f"[数据格式错误] {error_msg}\n\n原始提示词:\n{prompt}"
            
        except Exception as e:
            error_msg = f"未知异常 - {str(e)}"
            print(f"❓ {error_msg} | 模型: {扩写模型} | 创意温度: {创意温度}")
            return f"[系统错误] {error_msg}\n\n原始提示词:\n{prompt}"

    def get_预设(self, 预设, 启用扩写, 扩写模型, 创意温度):
        data = self.load_presets()
        
        brief = "The Brief:"+self.get_brief_by_name(预设)
        original_string = data.get("prefix")+"\n"+brief+"\n"+data.get("suffix")
        
        if 启用扩写:
            processed_string = self.call_llm_api(original_string, 扩写模型, 创意温度)
            return (processed_string,)
        else:
            return (original_string,)