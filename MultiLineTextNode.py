from typing import Optional

from comfy import utils

class MultiLineTextNode:
    CATEGORY = "ZhihuiNodes/Text"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.comment = ""
        self.content = ""
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "note": ("STRING", {"default": "", "multiline": False}),
                "text": ("STRING", {"default": "", "multiline": True}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "execute"
    
    def execute(self, note: str, text: str) -> tuple:
        return (text,)