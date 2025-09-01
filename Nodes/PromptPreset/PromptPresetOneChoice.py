import comfy
import comfy.sd
import comfy.utils
import torch

class PromptPresetOneChoice:
    
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
                "提示词1_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词1_注释"], "placeholder": "标记1"}),
                "提示词1": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词1"]}),
                "提示词2_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词2_注释"], "placeholder": "标记2"}),
                "提示词2": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词2"]}),
                "提示词3_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词3_注释"], "placeholder": "标记3"}),
                "提示词3": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词3"]}),
                "提示词4_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词4_注释"], "placeholder": "标记4"}),
                "提示词4": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词4"]}),
                "提示词5_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词5_注释"], "placeholder": "标记5"}),
                "提示词5": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词5"]}),
                "提示词6_注释": ("STRING", {"multiline": False, "default": cls().prompt_cache["提示词6_注释"], "placeholder": "标记6"}),
                "提示词6": ("STRING", {"multiline": True, "default": cls().prompt_cache["提示词6"]}),
                "选择提示词": (["1", "2", "3", "4", "5", "6"], {"default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"
    DESCRIPTION = "单选提示词预设：提供6个预设提示词选项，用户可以选择其中一个输出。每个提示词都可以添加注释说明，方便管理和识别不同的提示词内容。"

    def execute(self, 提示词1_注释, 提示词2_注释, 提示词3_注释, 提示词4_注释, 提示词5_注释, 提示词6_注释, 提示词1, 提示词2, 提示词3, 提示词4, 提示词5, 提示词6, 选择提示词):
        # 更新缓存
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
        
        prompts = [self.prompt_cache["提示词1"], self.prompt_cache["提示词2"], self.prompt_cache["提示词3"], 
                  self.prompt_cache["提示词4"], self.prompt_cache["提示词5"], self.prompt_cache["提示词6"]]
        return (prompts[int(选择提示词)-1],)