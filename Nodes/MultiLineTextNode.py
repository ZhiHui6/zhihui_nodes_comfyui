from typing import Optional

class MultiLineTextNode:
    CATEGORY = "zhihui/Text"
    OUTPUT_NODE = True
    DESCRIPTION = "Multi-line Text Node: Used for inputting and processing multi-line text content. Supports enable/disable functionality, allows adding comments, suitable for long text content input and transmission."
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_node": ("BOOLEAN", {"default": True}),
                "comment": ("STRING", {"default": "", "multiline": False}),
                "text_content": ("STRING", {"default": "", "multiline": True}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "execute"
    
    def execute(self, enable_node: bool, comment: str, text_content: str) -> tuple:
        if not enable_node:
            return ("",)
        return (text_content,)