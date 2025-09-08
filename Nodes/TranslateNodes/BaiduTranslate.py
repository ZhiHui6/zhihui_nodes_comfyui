import os
import json
import requests
import hashlib
import comfy.utils
from comfy.sd import CLIP

class BaiduTranslate:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_translate": ("BOOLEAN", {"default": True}),
                "key_loading": (["Plain text", "Background"],),
                "app_id": ("STRING", {"default": "", "multiline": False}),
                "api_key": ("STRING", {"default": "", "multiline": False}),
                "source_language": (["auto", "zh", "en"], {"default": "auto"}),
                "target_language": (["zh", "en"], {"default": "en"}),
                "your_text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translation_result",)
    FUNCTION = "translate"
    CATEGORY = "zhihui/Translate"
    DESCRIPTION = "Baidu Translate: Use Baidu Translate API for text translation. Supports Chinese-English mutual translation, automatic source language detection, and provides both plain text and background key loading methods. Suitable for multilingual prompt processing and internationalized content creation."

    def translate(self, enable_translate, key_loading, app_id, api_key, source_language, target_language, your_text):
        if not enable_translate:
            return (your_text,)

        if key_loading == "Plain text":
            if not app_id or not api_key:
                raise ValueError("APP_ID and API_KEY must be filled in plain text loading mode")
            baidu_app_id = app_id
            baidu_api_key = api_key
        else:
            config_path = os.path.join(os.path.dirname(__file__), "baidu_translate_config.json")
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    baidu_app_id = config.get("app_id", "")
                    baidu_api_key = config.get("api_key", "")
                    if not baidu_app_id or not baidu_api_key:
                        raise ValueError("Configuration file must contain APP_ID and API_KEY in background loading mode")
            except Exception as e:
                raise ValueError(f"Failed to load configuration file: {str(e)}")

        if not baidu_app_id or not baidu_api_key:
            return (your_text,)

        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        salt = "12345678"
        sign = baidu_app_id + your_text + salt + baidu_api_key
        sign = hashlib.md5(sign.encode()).hexdigest()
        
        params = {
            "q": your_text,
            "from": source_language,
            "to": target_language,
            "appid": baidu_app_id,
            "salt": salt,
            "sign": sign
        }

        try:
            response = requests.get(url, params=params)
            result = response.json()
            if "trans_result" in result:
                return (result["trans_result"][0]["dst"],)
        except:
            pass
            
        return (your_text,)