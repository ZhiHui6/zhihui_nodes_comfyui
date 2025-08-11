import os
import json
import requests
import hashlib
import comfy.utils
from comfy.sd import CLIP

class BaiduTranslateNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "启用翻译": ("BOOLEAN", {"default": True}),
                "密钥加载": (["明文加载", "后台加载"],),
                "app_id": ("STRING", {"default": "", "multiline": False}),
                "api_key": ("STRING", {"default": "", "multiline": False}),
                "源语言": (["auto", "zh", "en"], {"default": "auto"}),
                "目标语言": (["zh", "en"], {"default": "en"}),
                "text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("译文结果",)
    FUNCTION = "translate"
    CATEGORY = "zhihui/文本"

    def translate(self, 启用翻译, 密钥加载, app_id, api_key, 源语言, 目标语言, text):
        if not 启用翻译:
            return (text,)

        if 密钥加载 == "明文加载":
            if not app_id or not api_key:
                raise ValueError("明文加载模式下必须填写APP_ID和API_KEY")
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
                        raise ValueError("后台加载模式下配置文件必须填写APP_ID和API_KEY")
            except Exception as e:
                raise ValueError(f"加载配置文件失败: {str(e)}")

        if not baidu_app_id or not baidu_api_key:
            return (text,)

        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        salt = "12345678"
        sign = baidu_app_id + text + salt + baidu_api_key
        sign = hashlib.md5(sign.encode()).hexdigest()
        
        params = {
            "q": text,
            "from": 源语言,
            "to": 目标语言,
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
            
        return (text,)