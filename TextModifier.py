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

    RETURN_TYPES = ("STRING", "STRING")  
    RETURN_NAMES = ("文本输出", "帮助") 
    FUNCTION = "substr"
    OUTPUT_NODE = False 
    CATEGORY = "zhihui/文本"
    
    def __init__(self):
        self.起始文本 = ""
        self.末尾文本 = ""

    def substr(self, 文本输入, 起始文本="", 末尾文本=""):
        help_text = """
        【节点功能】
        通过输入指定删除的字符，根据起始文本和末尾文本来提取剩余的文本。
        ·起始文本: 在原文中删除指定的字符串以及其前方所有文本。
        ·末尾文本: 在原文中删除指定的字符串以及其后方所有文本。
        
        【示例用法】
        如“起始文本”键入your，“末尾文本”键入who。
        原文：Save your heart for someone who cares.
        输出：heart for someone
        """
        if 文本输入 == "" or 文本输入 is None:
            return (None, help_text)
        
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
        return (out, help_text)