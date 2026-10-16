from typing import Optional

class MultiLineTextNode:
    CATEGORY = "Zhi.AI/Text"
    OUTPUT_NODE = True
    DESCRIPTION = "Inputs and passes multi-line text, with an enable toggle and comments."
        
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