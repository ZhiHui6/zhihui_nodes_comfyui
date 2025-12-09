import os
import json
import requests
import hashlib
import time
import random
import hmac
import base64
import urllib.parse
from urllib.parse import quote
import uuid

class MultiPlatformTranslate:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_translate": ("BOOLEAN", {"default": True}),
                "platform": (["baidu", "aliyun", "youdao", "zhipu", "free"], {"default": "baidu"}),
                "source_language": (["auto", "zh", "en", "ja", "ko", "fr", "de", "es", "ru", "ar"], {"default": "auto"}),
                "target_language": (["zh", "en", "ja", "ko", "fr", "de", "es", "ru", "ar"], {"default": "en"}),
                "your_text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translation_result",)
    FUNCTION = "translate"
    CATEGORY = "Zhi.AI/Translate"
    DESCRIPTION = "Multi-platform translation node supporting Baidu, Tencent, Aliyun, Youdao and free translation services. Click 'Configuration Management' button below to manage API settings for each platform."

    def __init__(self):
        self.config_path = os.path.join(os.path.dirname(__file__), "MultiPlatformTranslateConfig.json")
        self.config = self.load_config()

    def load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def get_default_config(self):
        return {
            "platforms": {
                "baidu": {"name": "百度翻译", "config": {"app_id": "", "api_key": ""}},
                "aliyun": {"name": "阿里云翻译", "config": {"access_key_id": "", "access_key_secret": ""}},
                "youdao": {"name": "有道翻译", "config": {"app_key": "", "app_secret": ""}},
                "zhipu": {"name": "智谱AI翻译", "config": {"api_key": "", "model": "glm-4-flash"}},
                "free": {"name": "免费翻译", "config": {}}
            }
        }

    def save_config(self, config):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=4)
            self.config = config
            return True
        except Exception as e:
            print(f"Failed to save config file: {e}")
            return False

    def translate(self, enable_translate, platform, source_language, target_language, your_text):
        if not enable_translate or not your_text.strip():
            return (your_text,)

        platform_config = self.config["platforms"].get(platform)
        if not platform_config:
            return (your_text,)

        try:
            if platform == "baidu":
                result = self.translate_baidu(platform_config["config"], source_language, target_language, your_text)
            elif platform == "aliyun":
                result = self.translate_aliyun(platform_config["config"], source_language, target_language, your_text)
            elif platform == "youdao":
                result = self.translate_youdao(platform_config["config"], source_language, target_language, your_text)
            elif platform == "zhipu":
                result = self.translate_zhipu(platform_config["config"], source_language, target_language, your_text)
            elif platform == "free":
                result = self.translate_free(platform_config["config"], source_language, target_language, your_text)
            else:
                result = your_text

            return (result,)
        except Exception as e:
            print(f"Translation error with {platform}: {e}")
            return (your_text,)

    def translate_baidu(self, config, source_language, target_language, text):
        app_id = config.get("app_id", "")
        api_key = config.get("api_key", "")
        
        if not app_id or not api_key:
            raise ValueError("Baidu Translate API credentials not configured")

        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        salt = str(random.randint(1000000000, 9999999999))
        sign = hashlib.md5((app_id + text + salt + api_key).encode()).hexdigest()
        
        params = {
            "q": text,
            "from": source_language,
            "to": target_language,
            "appid": app_id,
            "salt": salt,
            "sign": sign
        }

        response = requests.get(url, params=params)
        result = response.json()
        
        if "trans_result" in result:
            return result["trans_result"][0]["dst"]
        else:
            raise Exception(f"Baidu Translate error: {result.get('error_msg', 'Unknown error')}")



    def translate_aliyun(self, config, source_language, target_language, text):
        access_key_id = config.get("access_key_id", "")
        access_key_secret = config.get("access_key_secret", "")
        
        if not access_key_id or not access_key_secret:
            raise ValueError("Aliyun Translate API credentials not configured")

        url = "https://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general"
        
        params = {
            "FormatType": "text",
            "SourceLanguage": source_language if source_language != "auto" else "auto",
            "TargetLanguage": target_language,
            "SourceText": text,
            "Scene": "general"
        }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_key_id}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        try:
            response = requests.post(url, headers=headers, data=json.dumps(params))
            result = response.json()
            
            if response.status_code == 200 and 'Data' in result:
                return result['Data']['Translated']
            else:

                return self.translate_free({}, source_language, target_language, text)
        except:
            return self.translate_free({}, source_language, target_language, text)

    def truncate(self, q):
        """
        计算input参数
        input=q前10个字符 + q长度 + q后10个字符（当q长度大于20）或 input=q字符串（当q长度小于等于20）
        """
        if len(q) <= 20:
            return q
        else:
            return q[0:10] + str(len(q)) + q[-10:]

    def translate_youdao(self, config, source_language, target_language, text):
        app_key = config.get("app_key", "")
        app_secret = config.get("app_secret", "")
        
        if not app_key or not app_secret:
            raise ValueError("Youdao Translate API credentials not configured")

        url = "https://openapi.youdao.com/api"
        
        salt = str(random.randint(1000000000, 9999999999))
        curtime = str(int(time.time()))
        input_str = self.truncate(text)  # 正确计算input参数
        sign_str = app_key + input_str + salt + curtime + app_secret
        sign = hashlib.sha256(sign_str.encode()).hexdigest()
        
        params = {
            'q': text,
            'from': source_language if source_language != "auto" else "auto",
            'to': target_language,
            'appKey': app_key,
            'salt': salt,
            'sign': sign,
            'signType': 'v3',
            'curtime': curtime
        }

        response = requests.post(url, data=params)
        result = response.json()
        
        if result.get('errorCode') == '0':
            return result['translation'][0]
        else:
            raise Exception(f"Youdao Translate error: {result.get('errorCode', 'Unknown error')}")

    def translate_free(self, config, source_language, target_language, text):
        """免费翻译方法，支持腾讯翻译君和Pollinations AI两种平台"""
        if not text.strip():
            return text
            
        platform = config.get("platform", "腾讯翻译君")
        
        if platform == "腾讯翻译君":
            return self._translate_with_tencent(source_language, target_language, text)
        elif platform == "Pollinations AI":
            return self._translate_with_pollinations(source_language, target_language, text)
        else:
            return self._translate_with_tencent(source_language, target_language, text)
    
    def _translate_with_tencent(self, source_language, target_language, text):
        """使用腾讯翻译君进行翻译"""
        lang_map = {
            "auto": "zh",
            "zh": "zh", 
            "en": "en",
            "ja": "ja",
            "ko": "ko",
            "fr": "fr",
            "de": "de",
            "es": "es",
            "ru": "ru",
            "ar": "ar"
        }
        
        source_lang = lang_map.get(source_language, "zh")
        target_lang = lang_map.get(target_language, "en")
        
        def do_translate(translate_text):
            if not translate_text:
                return ""
            url = 'https://transmart.qq.com/api/imt'
            post_data = {
                "header": {
                    "fn": "auto_translation",
                    "client_key": "browser-chrome-110.0.0-Mac OS-df4bd4c5-a65d-44b2-a40f-42f34f3535f2-1677486696487"
                },
                "type": "plain",
                "model_category": "normal",
                "source": {
                    "lang": source_lang,
                    "text_list": [translate_text]
                },
                "target": {
                    "lang": target_lang
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'referer': 'https://transmart.qq.com/zh-CN/index'
            }
            try:
                response = requests.post(url, headers=headers, data=json.dumps(post_data))
                result = response.json()
                if response.status_code != 200 or 'auto_translation' not in result or not result['auto_translation']:
                    error_msg = f"Translation failed with status code {response.status_code}: {result.get('error_msg', 'Unknown error')}"
                    print(error_msg)
                    raise RuntimeError(error_msg)
                return '\n'.join(result['auto_translation'])
            except Exception as e:
                error_msg = f"Error during translation: {str(e)}"
                print(error_msg)
                raise RuntimeError(error_msg)

        try:
            translated_text = do_translate(text)
            return translated_text
        except Exception as e:
            print(f"Tencent free translation error: {e}")
            return text
    
    def _translate_with_pollinations(self, source_language, target_language, text):
        """使用Pollinations AI进行翻译"""
        import urllib.parse
        
        lang_map = {
            "auto": "Auto detect",
            "zh": "zh", 
            "en": "en",
            "ja": "en", 
            "ko": "en",
            "fr": "en",
            "de": "en",
            "es": "en",
            "ru": "en",
            "ar": "en",
            "pt": "en",
            "it": "en",
            "th": "en",
            "vi": "en",
            "id": "en"
        }
        
        actual_source = lang_map.get(source_language, "Auto detect")
        actual_target = lang_map.get(target_language, "en")
        
        # 使用固定默认的专业翻译指令
        prompt = f"""Please translate the following text to {actual_target} with requirements:
1. Accurate, natural, and fluent translation
2. Maintain the tone and style of the original text
3. Only output the translation result without any explanation

Text to translate:
{text}"""
        
        try:
            encoded_prompt = urllib.parse.quote(prompt)
            api_url = f"https://text.pollinations.ai/deepseek/{encoded_prompt}"
            
            response = requests.get(api_url, timeout=30)
            
            if response.status_code == 200:
                result = response.text.strip()
                if result and len(result) > 1:
                    return result
                else:
                    print("Pollinations AI returned empty result")
                    return text
            else:
                error_msg = f"HTTP error: {response.status_code}"
                print(f"Pollinations AI translation error: {error_msg}")
                return text
                
        except requests.exceptions.Timeout:
            print("Pollinations AI translation timeout")
            return text
        except requests.exceptions.ConnectionError:
            print("Pollinations AI connection error")
            return text
        except Exception as e:
            print(f"Pollinations AI translation error: {str(e)}")
            return text

    def translate_zhipu(self, config, source_language, target_language, text):
        api_key = config.get("api_key", "")
        model = config.get("model", "glm-4-flash")
        
        if not api_key:
            raise ValueError("Zhipu AI API key not configured")

        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        
        if source_language == "auto":
            prompt = f"请将以下文本翻译成{target_language}，只需要返回翻译结果，不要添加任何解释或说明：\n\n{text}"
        else:
            source_lang_name = self.get_language_name(source_language)
            target_lang_name = self.get_language_name(target_language)
            prompt = f"请将以下{source_lang_name}文本翻译成{target_lang_name}，只需要返回翻译结果，不要添加任何解释或说明：\n\n{text}"
        
        post_data = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2048
        }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.post(url, headers=headers, data=json.dumps(post_data))
        result = response.json()
        
        if response.status_code == 200 and 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content'].strip()
        else:
            error_msg = result.get('error', {}).get('message', 'Unknown error') if 'error' in result else 'Unknown error'
            raise Exception(f"Zhipu AI translation error: {error_msg}")

    def get_language_name(self, lang_code):
        """获取语言代码对应的语言名称"""
        lang_names = {
            "zh": "中文",
            "en": "英语", 
            "ja": "日语",
            "ko": "韩语",
            "fr": "法语",
            "de": "德语",
            "es": "西班牙语",
            "ru": "俄语",
            "ar": "阿拉伯语",
            "pt": "葡萄牙语",
            "it": "意大利语",
            "th": "泰语",
            "vi": "越南语",
            "id": "印尼语"
        }
        return lang_names.get(lang_code, lang_code)

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")