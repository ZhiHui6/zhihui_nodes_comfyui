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
    DESCRIPTION = "文本提取器：根据选择的提取类型从文本中提取特定内容。支持中文提取（提取所有中文字符、标点和数字）和英文提取（提取所有英文字符、标点和数字），适用于多语言文本处理和内容分离。"

    def extract_text(self, 文本输入, 提取类型):
        if 提取类型 == "中文":
            pattern = r'[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+'
        else:
            pattern = r'[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};:\\",.<>/?]+'
        
        matches = re.findall(pattern, 文本输入)
        cleaned_matches = [' '.join(match.split()) for match in matches]
        extracted_text = ' '.join(cleaned_matches).strip()
        return (extracted_text,)