import json
import requests

class TencentTranslater:

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        input_types = {
            "required": {
                "Text": ("STRING", {
                    "multiline": True,
                    "tooltip": "Text input to be translated"
                }),
                "Translate_Enable": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "Enable or disable translation. When disabled, original text is returned unchanged"
                }),
                "From": ([
                    "Auto detect",
                    "en",
                    "zh"
                ], {
                    "default": "Auto detect",
                    "tooltip": "Source language for translation. 'Auto' will automatically detect the input language"
                }),
                "To": ([
                    "en",
                    "zh"
                ], {
                    "default": "en",
                    "tooltip": "Target language for translation output"
                }),
            }
        }
        return input_types

    CATEGORY = "zhihui/Translate"

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("Translation_Result",)
    FUNCTION = "translate_text"

    DESCRIPTION = "Tencent Translator: Translate text between Auto-detect, English, and Chinese using Tencent's translation API. Supports single text input with translation control and automatic language detection."

    def initData(self, source_lang, target_lang, translate_text):
        return {
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

    def translate_text(self, Text, Translate_Enable, From, To):
        if not Translate_Enable:
            return (Text,)

        lang_map = {
            "Auto detect": None,
            "en": "en",
            "zh": "zh"
        }

        source_lang = lang_map[From]
        target_lang = lang_map[To]

        def do_translate(text):
            if not text:
                return ""
            url = 'https://transmart.qq.com/api/imt'
            post_data = self.initData(source_lang, target_lang, text)
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

        translated_text = do_translate(Text)
        return (translated_text,)