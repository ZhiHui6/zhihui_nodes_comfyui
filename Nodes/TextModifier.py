import re

class TextModifier:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "start_text": ("STRING", {"default": "", "multiline": False}),
                "end_text": ("STRING", {"default": "", "multiline": False}),
                "remove_empty_lines": ("BOOLEAN", {"default": False}),
                "remove_spaces": ("BOOLEAN", {"default": False}),
                "remove_newlines": ("BOOLEAN", {"default": False}),
            },
        }

    RETURN_TYPES = ("STRING", "STRING")  
    RETURN_NAMES = ("text_output", "help") 
    FUNCTION = "substr"
    OUTPUT_NODE = False 
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Text Modifier: Extracts text content between specified start and end text. Supports optional cleanup: remove empty lines, remove spaces, remove newlines."
    
    def __init__(self):
        self.start_text = ""
        self.end_text = ""

    def substr(self, text_input, start_text="", end_text="", remove_empty_lines=False, remove_spaces=False, remove_newlines=False):
        help_text = "【节点功能】\n按起始与结束文本裁剪中间内容，并可选择性清理：\n· 去除空行：移除仅包含空白的行\n· 去除空格：移除半角空格与全角空格\n· 去除换行：移除所有换行符，将文本合并为一行\n\n【示例】\n若起始为 'your'、结束为 'who'\n原文：Save your heart for someone who cares.\n输出：heart for someone"
               
        if text_input == "" or text_input is None:
            return (None, help_text)
        
        if start_text == "" and end_text == "":
            out = text_input
        
        elif start_text == "":
            end_index = text_input.find(end_text)
            out = text_input[:end_index]
        
        elif end_text == "":
            start_index = text_input.find(start_text) + len(start_text)
            out = text_input[start_index:]
        
        else:
            start_index = text_input.find(start_text) + len(start_text)
            end_index = text_input.find(end_text, start_index)
            out = text_input[start_index:end_index]
        # 清理步骤：先去空行，再去换行，最后去空格
        if remove_empty_lines:
            lines = out.splitlines()
            lines = [ln for ln in lines if ln.strip() != ""]
            out = "\n".join(lines)

        if remove_newlines:
            out = out.replace("\r", "").replace("\n", "")

        if remove_spaces:
            out = out.replace(" ", "")
            out = out.replace("\u3000", "")

        out = out.strip()
        return (out, help_text)
