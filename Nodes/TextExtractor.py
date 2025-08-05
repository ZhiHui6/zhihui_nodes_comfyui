import re

class TextExtractor:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "文本输入": ("STRING", {"forceInput": True}),
                "提取类型": (["中文", "英文"], {"default": "中文"}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "extract_text"
    CATEGORY = "zhihui/text"

    def extract_text(self, 文本输入, 提取类型):
        if 提取类型 == "中文":
            pattern = r'[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+'
        else:
            pattern = r'[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};:\\",.<>/?]+'
        
        matches = re.findall(pattern, 文本输入)
        cleaned_matches = [' '.join(match.split()) for match in matches]
        extracted_text = ' '.join(cleaned_matches).strip()
        return (extracted_text,)