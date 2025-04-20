from typing import Optional
from comfy import utils

class TextCombinerNode:
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.提示词1 = ""
        self.提示词2 = ""
        self.分隔符 = ", "
        self.提示词1_注释 = ""
        self.提示词2_注释 = ""
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "提示词1_注释": ("STRING", {"default": cls().提示词1_注释, "multiline": False}),
                "提示词1": ("STRING", {"default": cls().提示词1, "multiline": True}),
                "提示词2_注释": ("STRING", {"default": cls().提示词2_注释, "multiline": False}),
                "提示词2": ("STRING", {"default": cls().提示词2, "multiline": True}),
                "分隔符": ("STRING", {"default": cls().分隔符, "multiline": False}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "execute"
    
    def execute(self, 提示词1_注释: str, 提示词1: str, 提示词2_注释: str, 提示词2: str, 分隔符: str) -> tuple:
        self.提示词1 = 提示词1
        self.提示词2 = 提示词2
        self.提示词1_注释 = 提示词1_注释
        self.提示词2_注释 = 提示词2_注释
        self.分隔符 = 分隔符
        len1 = len(提示词1)
        len2 = len(提示词2)
        combined = ""
        if len1 > 0 and len2 > 0:
            combined = 提示词1 + 分隔符 + 提示词2
        elif len1 > 0:
            combined = 提示词1
        elif len2 > 0:
            combined = 提示词2
        return (combined,)