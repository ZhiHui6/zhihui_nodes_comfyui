from typing import Optional

class MultiLineTextNode:
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "注释": ("STRING", {"default": "", "multiline": False}),
                "文本": ("STRING", {"default": "", "multiline": True}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "execute"
    
    def execute(self, 注释: str, 文本: str) -> tuple:
        return (文本,)