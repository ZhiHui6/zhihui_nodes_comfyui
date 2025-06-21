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
                "enable_translate": ("BOOLEAN", {"default": True}),
                "key_load_method": (["明文加载", "后台加载"],),
                "app_id": ("STRING", {"default": "", "multiline": False}),
                "api_key": ("STRING", {"default": "", "multiline": False}),
                "from_lang": (["auto", "zh", "en", "jp", "kor", "fra", "spa", "th", "ara", "ru", "pt", "de", "it", "el", "nl", "pl", "bul", "est", "dan", "fin", "cs", "rom", "slo", "swe", "hu", "cht", "vie"], {"default": "auto"}),
                "to_lang": (["zh", "en", "jp", "kor", "fra", "spa", "th", "ara", "ru", "pt", "de", "it", "el", "nl", "pl", "bul", "est", "dan", "fin", "cs", "rom", "slo", "swe", "hu", "cht", "vie"], {"default": "zh"}),
                "text": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translated_text",)
    FUNCTION = "translate"
    CATEGORY = "zhihui_nodes_comfyui/Translate"

    def translate(self, enable_translate, key_load_method, app_id, api_key, from_lang, to_lang, text):
        if not enable_translate:
            return (text,)

        if key_load_method == "明文加载":
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

        # 百度翻译API实现
        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        salt = "12345678"
        sign = baidu_app_id + text + salt + baidu_api_key
        sign = hashlib.md5(sign.encode()).hexdigest()
        
        params = {
            "q": text,
            "from": from_lang,
            "to": to_lang,
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

NODE_CLASS_MAPPINGS = {
    "BaiduTranslateNode": BaiduTranslateNode
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "BaiduTranslateNode": "百度翻译节点"
}