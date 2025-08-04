import comfy
import comfy.sd
import comfy.utils
import torch

class TextSwitch:
        
    def __init__(self):
        self.text_cache = {"文本1": "", "文本2": "", "文本3": "", "文本4": ""}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "文本1": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本2": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本3": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本4": ("STRING", {"multiline": True, "default": "", "forceInput": True})
            },
            "required": {
                "文本1_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本2_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本3_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本4_注释": ("STRING", {"multiline": False, "default": ""}),
                "选择文本": (["1", "2", "3", "4"], {"default": "1"})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"

    def execute(self, 文本1_注释, 文本2_注释, 文本3_注释, 文本4_注释, 选择文本, 文本1="", 文本2="", 文本3="", 文本4=""):
        self.text_cache["文本1"] = 文本1
        self.text_cache["文本2"] = 文本2
        self.text_cache["文本3"] = 文本3
        self.text_cache["文本4"] = 文本4
        prompts = [文本1, 文本2, 文本3, 文本4]
        return (prompts[int(选择文本)-1],)