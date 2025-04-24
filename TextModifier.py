import re

class TextModifier:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "文本输入": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "起始文本": ("STRING", {"default": "", "multiline": False}),
                "末尾文本": ("STRING", {"default": "", "multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING",)  
    RETURN_NAMES = ("文本输出",) 
    FUNCTION = "substr"
    OUTPUT_NODE = False 
    CATEGORY = "zhihui/文本"
    
    def __init__(self):
        self.起始文本 = ""
        self.末尾文本 = ""

    def substr(self, 文本输入, 起始文本="", 末尾文本=""):
        if 文本输入 == "" or 文本输入 is None:
            return (None,)
        
        if 起始文本 == "" and 末尾文本 == "":
            out = 文本输入
        
        elif 起始文本 == "":
            end_index = 文本输入.find(末尾文本)
            out = 文本输入[:end_index]
        
        elif 末尾文本 == "":
            start_index = 文本输入.find(起始文本) + len(起始文本)
            out = 文本输入[start_index:]
        
        else:
            start_index = 文本输入.find(起始文本) + len(起始文本)
            end_index = 文本输入.find(末尾文本, start_index)
            out = 文本输入[start_index:end_index]
        out = out.strip()
        return (out,)