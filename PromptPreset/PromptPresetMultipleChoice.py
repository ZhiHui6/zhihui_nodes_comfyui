import comfy
import comfy.sd
import comfy.utils
import torch

class PromptPresetMultipleChoice:
    
    def __init__(self):
        self.prompt_cache = {
            "提示词1": "", "提示词1_注释": "",
            "提示词2": "", "提示词2_注释": "",
            "提示词3": "", "提示词3_注释": "",
            "提示词4": "", "提示词4_注释": "",
            "提示词5": "", "提示词5_注释": "",
            "提示词6": "", "提示词6_注释": "",
        }

    @classmethod
    def INPUT_TYPES(cls):
        
        return {
            "required": {
                "总开关": ("BOOLEAN", {"default": False})
            },
            "optional": {
                "并联文本": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "提示词1_开关": ("BOOLEAN", {"default": False}),
                "提示词1_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词1": ("STRING", {"multiline": True, "default": ""}),
                "提示词2_开关": ("BOOLEAN", {"default": False}),
                "提示词2_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词2": ("STRING", {"multiline": True, "default": ""}),
                "提示词3_开关": ("BOOLEAN", {"default": False}),
                "提示词3_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词3": ("STRING", {"multiline": True, "default": ""}),
                "提示词4_开关": ("BOOLEAN", {"default": False}),
                "提示词4_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词4": ("STRING", {"multiline": True, "default": ""}),
                "提示词5_开关": ("BOOLEAN", {"default": False}),
                "提示词5_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词5": ("STRING", {"multiline": True, "default": ""}),
                "提示词6_开关": ("BOOLEAN", {"default": False}),
                "提示词6_注释": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "提示词6": ("STRING", {"multiline": True, "default": ""}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出文本",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"

    def execute(self, 总开关, 提示词1_开关, 提示词1_注释, 提示词1, 提示词2_开关, 提示词2_注释, 提示词2, 提示词3_开关, 提示词3_注释, 提示词3, 提示词4_开关, 提示词4_注释, 提示词4, 提示词5_开关, 提示词5_注释, 提示词5, 提示词6_开关, 提示词6_注释, 提示词6, 并联文本=""):
        
        self.prompt_cache["提示词1"] = 提示词1
        self.prompt_cache["提示词1_注释"] = 提示词1_注释
        self.prompt_cache["提示词2"] = 提示词2
        self.prompt_cache["提示词2_注释"] = 提示词2_注释
        self.prompt_cache["提示词3"] = 提示词3
        self.prompt_cache["提示词3_注释"] = 提示词3_注释
        self.prompt_cache["提示词4"] = 提示词4
        self.prompt_cache["提示词4_注释"] = 提示词4_注释
        self.prompt_cache["提示词5"] = 提示词5
        self.prompt_cache["提示词5_注释"] = 提示词5_注释
        self.prompt_cache["提示词6"] = 提示词6
        self.prompt_cache["提示词6_注释"] = 提示词6_注释
        
        enabled_prompts = [并联文本] if 并联文本 else []
        if 总开关:
            if 提示词1_开关 and 提示词1: enabled_prompts.append(提示词1)
            if 提示词2_开关 and 提示词2: enabled_prompts.append(提示词2)
            if 提示词3_开关 and 提示词3: enabled_prompts.append(提示词3)
            if 提示词4_开关 and 提示词4: enabled_prompts.append(提示词4)
            if 提示词5_开关 and 提示词5: enabled_prompts.append(提示词5)
            if 提示词6_开关 and 提示词6: enabled_prompts.append(提示词6)
            
        return ("\n".join(filter(None, enabled_prompts)),)