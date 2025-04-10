import re

class TextModifier:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "input_text": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
            },
            "optional": {
                "start_text": ("STRING", {"default": "", "multiline": False}),
                "end_text": ("STRING", {"default": "", "multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING",)  
    RETURN_NAMES = ("output_text",) 
    FUNCTION = "substr"
    OUTPUT_NODE = False 
    CATEGORY = "文本"

    def substr(self, input_text, start_text="", end_text=""):
        if input_text == "" or input_text is None:
            return (None,)
        
        if start_text == "" and end_text == "":
            out = input_text
        
        elif start_text == "":
            end_index = input_text.find(end_text)
            out = input_text[:end_index]
        
        elif end_text == "":
            start_index = input_text.find(start_text) + len(start_text)
            out = input_text[start_index:]
        
        else:
            start_index = input_text.find(start_text) + len(start_text)
            end_index = input_text.find(end_text, start_index)
            out = input_text[start_index:end_index]
        out = out.strip()
        return (out,)