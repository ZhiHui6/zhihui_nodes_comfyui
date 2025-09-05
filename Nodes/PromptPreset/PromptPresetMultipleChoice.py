import comfy
import comfy.sd
import comfy.utils
import torch

class PromptPresetMultipleChoice:
    
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
                "master_switch": ("BOOLEAN", {"default": False})
            },
            "optional": {
                "parallel_text": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "prompt1_switch": ("BOOLEAN", {"default": False}),
                "prompt1_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt1": ("STRING", {"multiline": True, "default": ""}),
                "prompt2_switch": ("BOOLEAN", {"default": False}),
                "prompt2_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt2": ("STRING", {"multiline": True, "default": ""}),
                "prompt3_switch": ("BOOLEAN", {"default": False}),
                "prompt3_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt3": ("STRING", {"multiline": True, "default": ""}),
                "prompt4_switch": ("BOOLEAN", {"default": False}),
                "prompt4_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt4": ("STRING", {"multiline": True, "default": ""}),
                "prompt5_switch": ("BOOLEAN", {"default": False}),
                "prompt5_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt5": ("STRING", {"multiline": True, "default": ""}),
                "prompt6_switch": ("BOOLEAN", {"default": False}),
                "prompt6_comment": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt6": ("STRING", {"multiline": True, "default": ""}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output_text",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/text"
    DESCRIPTION = "Multiple Choice Prompt Preset: Provides 6 preset prompt options, each can be independently enabled or disabled. Supports master switch control, allows selecting multiple prompts for combined output, and supports external text parallel input."

    def execute(self, master_switch, prompt1_switch, prompt1_comment, prompt1, prompt2_switch, prompt2_comment, prompt2, prompt3_switch, prompt3_comment, prompt3, prompt4_switch, prompt4_comment, prompt4, prompt5_switch, prompt5_comment, prompt5, prompt6_switch, prompt6_comment, prompt6, parallel_text=""):
        
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
        
        enabled_prompts = [parallel_text] if parallel_text else []
        if master_switch:
            if prompt1_switch and prompt1: enabled_prompts.append(prompt1)
            if prompt2_switch and prompt2: enabled_prompts.append(prompt2)
            if prompt3_switch and prompt3: enabled_prompts.append(prompt3)
            if prompt4_switch and prompt4: enabled_prompts.append(prompt4)
            if prompt5_switch and prompt5: enabled_prompts.append(prompt5)
            if prompt6_switch and prompt6: enabled_prompts.append(prompt6)
            
        return ("\n".join(filter(None, enabled_prompts)),)