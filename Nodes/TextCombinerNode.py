from typing import Optional
from comfy import utils

class TextCombinerNode:
    CATEGORY = "zhihui/Text"
    OUTPUT_NODE = True
    
    def __init__(self):
        self.prompt1 = ""
        self.prompt2 = ""
        self.separator = ", "
        self.prompt1_comment = ""
        self.prompt2_comment = ""
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt1_comment": ("STRING", {"default": "", "multiline": False}),
                 "enable_prompt1": ("BOOLEAN", {"default": True}), 
                 "prompt1": ("STRING", {"default": "", "multiline": True}),
                 "prompt2_comment": ("STRING", {"default": "", "multiline": False}),
                 "enable_prompt2": ("BOOLEAN", {"default": True}), 
                 "prompt2": ("STRING", {"default": "", "multiline": True}),
                 "separator": ("STRING", {"default": ", ", "multiline": False}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "execute"
    DESCRIPTION = "Text Combiner: Combines two text inputs with a specified separator into a single text output. Each text can be independently enabled or disabled, supports custom separators, suitable for prompt combination and text concatenation."
    
    def execute(self, prompt1_comment: str, prompt1: str, prompt2_comment: str, prompt2: str, separator: str, enable_prompt1: bool, enable_prompt2: bool) -> tuple:
         self.prompt1 = prompt1 if enable_prompt1 else ""
         self.prompt2 = prompt2 if enable_prompt2 else ""
         self.prompt1_comment = prompt1_comment
         self.prompt2_comment = prompt2_comment
         self.separator = separator
         len1 = len(self.prompt1)
         len2 = len(self.prompt2)
         combined = ""
         if len1 > 0 and len2 > 0:
             combined = self.prompt1 + separator + self.prompt2
         elif len1 > 0:
             combined = self.prompt1
         elif len2 > 0:
             combined = self.prompt2
         return (combined,)