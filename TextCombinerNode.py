from typing import Optional

from comfy import utils

class TextCombinerNode:
    CATEGORY = "ZhihuiNodes/Text"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.prompt1 = ""
        self.prompt2 = ""
        self.separator = ", "
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "note1": ("STRING", {"default": "", "multiline": False}),
                "prompt1": ("STRING", {"default": "", "multiline": True}),
                "note2": ("STRING", {"default": "", "multiline": False}),
                "prompt2": ("STRING", {"default": "", "multiline": True}),
                "separator": ("STRING", {"default": ", ", "multiline": False}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("combined_prompt",)
    FUNCTION = "execute"
    
    def execute(self, note1: str, prompt1: str, note2: str, prompt2: str, separator: str) -> tuple:
        len1 = len(prompt1)
        len2 = len(prompt2)
        combined = ""
        if len1 > 0 and len2 > 0:
            combined = prompt1 + separator + prompt2
        elif len1 > 0:
            combined = prompt1
        elif len2 > 0:
            combined = prompt2
        return (combined,)