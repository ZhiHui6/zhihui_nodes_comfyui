from typing import Optional
from comfy import utils

class MultiLineTextNode:
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.comment = ""
        self.content = ""
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "启用": ("BOOLEAN", {"default": True}), 
                "注释": ("STRING", {"default": "", "multiline": False}),
                "文本": ("STRING", {"default": "", "multiline": True}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "execute"
    
    def execute(self, 注释: str, 文本: str, 启用: bool) -> tuple:
        self.comment = 注释
        self.content = 文本
        if not 启用:
            return ("",) 
        return (文本,)