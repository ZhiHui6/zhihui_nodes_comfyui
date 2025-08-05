import requests
import time
import json

class TranslateNodeBeta:

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {
                    "multiline": True, 
                    "default": "", 
                    "placeholder": "请输入要翻译的文本..."
                }),
                "源语言": (["自动检测", "中文", "英文"], {
                    "default": "自动检测"
                }),
                "目标语言": (["中文", "英文"], {
                    "default": "英文"
                }),
                "model": (["openai", "mistral", "qwen-coder", "llama"], {
                    "default": "openai"
                }),
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("翻译结果",)
    FUNCTION = "translate_text"
    CATEGORY = "utils"
    
    def detect_language(self, text):
        chinese_chars = sum(1 for char in text if '\u4e00' <= char <= '\u9fff')
        total_chars = len(text.strip())
        
        if total_chars == 0:
            return "unknown"
        
        chinese_ratio = chinese_chars / total_chars
        
        if chinese_ratio > 0.3:
            return "chinese"
        else:
            return "english"
    
    def build_translate_prompt(self, text, 源语言, 目标语言):
        if 源语言 == "自动检测":
            detected_lang = self.detect_language(text)
            actual_source = "中文" if detected_lang == "chinese" else "英文"
        else:
            actual_source = 源语言
        
        if actual_source == "中文" and 目标语言 == "英文":
            prompt = f"""请将以下中文文本翻译成英文，要求：
1. 翻译准确、自然、流畅
2. 保持原文的语气和风格
3. 如果是专业术语，请使用准确的英文表达
4. 只输出翻译结果，不要添加任何解释

要翻译的中文文本：
{text}"""
        elif actual_source == "英文" and 目标语言 == "中文":
            prompt = f"""请将以下英文文本翻译成中文，要求：
1. 翻译准确、自然、流畅
2. 保持原文的语气和风格
3. 使用符合中文表达习惯的语言
4. 只输出翻译结果，不要添加任何解释

要翻译的英文文本：
{text}"""
        elif actual_source == 目标语言:
            return f"源语言和目标语言相同，无需翻译。\n\n原文：\n{text}"
        else:
            prompt = f"""请将以下{actual_source}文本翻译成{目标语言}，要求：
1. 翻译准确、自然、流畅
2. 保持原文的语气和风格
3. 只输出翻译结果，不要添加任何解释

要翻译的文本：
{text}"""
        
        return prompt
    
    def _handle_error(self, error_type, error_msg, model):
        print(f"❌ {error_msg} | 模型: {model}")
        return f"[{error_type}] {error_msg}"
    
    def call_translate_api(self, prompt, model="openai"):
        try:
            api_url = "https://text.pollinations.ai/"
            print(f"🌐 翻译API调用 | 模型: {model}")
            
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "model": model,
                "timestamp": int(time.time())
            }
            
            response = requests.post(
                api_url, 
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.text.strip()
                print(f"✅ 翻译成功 | 模型: {model}")
                return result
            else:
                error_messages = {
                    400: "请求参数错误", 401: "API认证失败", 403: "访问被拒绝",
                    404: "API端点未找到", 429: "请求过于频繁", 500: "服务器内部错误",
                    502: "网关错误", 503: "服务不可用", 504: "网关超时"
                }
                error_msg = error_messages.get(response.status_code, f"HTTP错误: {response.status_code}")
                return self._handle_error("API错误", error_msg, model)
                
        except requests.exceptions.Timeout:
            return self._handle_error("超时错误", "请求超时", model)
        except requests.exceptions.ConnectionError:
            return self._handle_error("连接错误", "网络连接失败", model)
        except requests.exceptions.RequestException as e:
            return self._handle_error("网络错误", f"请求异常: {str(e)}", model)
        except json.JSONDecodeError:
            return self._handle_error("格式错误", "响应数据格式错误", model)
        except Exception as e:
            return self._handle_error("系统错误", f"未知异常: {str(e)}", model)
    
    def translate_text(self, text, 源语言, 目标语言, model):
        if not text.strip():
            return ("请输入要翻译的文本",)
        
        prompt = self.build_translate_prompt(text, 源语言, 目标语言)
        
        translated_text = self.call_translate_api(prompt, model)
        
        return (translated_text,)