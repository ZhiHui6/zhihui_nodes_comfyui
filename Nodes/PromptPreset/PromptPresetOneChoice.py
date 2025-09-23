import comfy
import comfy.sd
import comfy.utils
import torch

class PromptPresetOneChoice:
    
    def __init__(self):
        self.prompt_cache = {
            "prompt1": "", "prompt1_comment": "",
            "prompt2": "", "prompt2_comment": "",
            "prompt3": "", "prompt3_comment": "",
            "prompt4": "", "prompt4_comment": "",
            "prompt5": "", "prompt5_comment": "",
            "prompt6": "", "prompt6_comment": "",
        }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt1_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt1_comment"], "placeholder": "Label 1"}),
                "prompt1": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt1"]}),
                "prompt2_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt2_comment"], "placeholder": "Label 2"}),
                "prompt2": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt2"]}),
                "prompt3_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt3_comment"], "placeholder": "Label 3"}),
                "prompt3": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt3"]}),
                "prompt4_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt4_comment"], "placeholder": "Label 4"}),
                "prompt4": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt4"]}),
                "prompt5_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt5_comment"], "placeholder": "Label 5"}),
                "prompt5": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt5"]}),
                "prompt6_comment": ("STRING", {"multiline": False, "default": cls().prompt_cache["prompt6_comment"], "placeholder": "Label 6"}),
                "prompt6": ("STRING", {"multiline": True, "default": cls().prompt_cache["prompt6"]}),
                "select_prompt": (["1", "2", "3", "4", "5", "6"], {"default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/text"
    DESCRIPTION = "Single Choice Prompt Preset: Provides 6 preset prompt options, users can select one for output. Each prompt can have comment annotations for easy management and identification of different prompt contents."

    def execute(self, prompt1_comment, prompt2_comment, prompt3_comment, prompt4_comment, prompt5_comment, prompt6_comment, prompt1, prompt2, prompt3, prompt4, prompt5, prompt6, select_prompt):
        self.prompt_cache["prompt1"] = prompt1
        self.prompt_cache["prompt1_comment"] = prompt1_comment
        self.prompt_cache["prompt2"] = prompt2
        self.prompt_cache["prompt2_comment"] = prompt2_comment
        self.prompt_cache["prompt3"] = prompt3
        self.prompt_cache["prompt3_comment"] = prompt3_comment
        self.prompt_cache["prompt4"] = prompt4
        self.prompt_cache["prompt4_comment"] = prompt4_comment
        self.prompt_cache["prompt5"] = prompt5
        self.prompt_cache["prompt5_comment"] = prompt5_comment
        self.prompt_cache["prompt6"] = prompt6
        self.prompt_cache["prompt6_comment"] = prompt6_comment
        
        prompts = [self.prompt_cache["prompt1"], self.prompt_cache["prompt2"], self.prompt_cache["prompt3"], 
                  self.prompt_cache["prompt4"], self.prompt_cache["prompt5"], self.prompt_cache["prompt6"]]
        return (prompts[int(select_prompt)-1],)