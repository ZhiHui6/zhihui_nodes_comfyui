import torch

class AutoTextSwitch:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {
                "文本A": ("STRING", {"multiline": True, "forceInput": True}),
                "文本B": ("STRING", {"multiline": True, "forceInput": True}),
                "文本C": ("STRING", {"multiline": True, "forceInput": True})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出文本",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"

    def execute(self, 文本A=None, 文本B=None, 文本C=None):
        texts = [文本A, 文本B, 文本C]
        
        valid_inputs = []
        for i, text in enumerate(texts):
            if text is not None and text.strip() != "":
                valid_inputs.append((i, text))
        
        if len(valid_inputs) > 1:
            raise ValueError("只能有一个端口输入文本，检测到多个端口同时有输入，请先禁用前端多余的输入源")
        
        if len(valid_inputs) == 0:
            return ("",)
        
        return (valid_inputs[0][1],)