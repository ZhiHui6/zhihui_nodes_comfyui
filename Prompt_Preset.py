import comfy
import comfy.sd
import comfy.utils
import torch

class PromptPreset:
        
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "note_1": ("STRING", {"multiline": False, "default": "", "placeholder": "标记1"}),
                "prompt_1": ("STRING", {"multiline": True, "default": ""}),
                "note_2": ("STRING", {"multiline": False, "default": "", "placeholder": "标记2"}),
                "prompt_2": ("STRING", {"multiline": True, "default": ""}),
                "note_3": ("STRING", {"multiline": False, "default": "", "placeholder": "标记3"}),
                "prompt_3": ("STRING", {"multiline": True, "default": ""}),
                "note_4": ("STRING", {"multiline": False, "default": "", "placeholder": "标记4"}),
                "prompt_4": ("STRING", {"multiline": True, "default": ""}),
                "note_5": ("STRING", {"multiline": False, "default": "", "placeholder": "标记5"}),
                "prompt_5": ("STRING", {"multiline": True, "default": ""}),
                "note_6": ("STRING", {"multiline": False, "default": "", "placeholder": "标记6"}),
                "prompt_6": ("STRING", {"multiline": True, "default": ""}),
                "note_7": ("STRING", {"multiline": False, "default": "", "placeholder": "标记7"}),
                "prompt_7": ("STRING", {"multiline": True, "default": ""}),
                "note_8": ("STRING", {"multiline": False, "default": "", "placeholder": "标记8"}),
                "prompt_8": ("STRING", {"multiline": True, "default": ""}),
                "note_9": ("STRING", {"multiline": False, "default": "", "placeholder": "标记9"}),
                "prompt_9": ("STRING", {"multiline": True, "default": ""}),
                "note_10": ("STRING", {"multiline": False, "default": "", "placeholder": "标记10"}),
                "prompt_10": ("STRING", {"multiline": True, "default": ""}),
                "Selected_Prompt": (["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {"default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "execute"
    CATEGORY = "prompt"

    def execute(self, note_1, note_2, note_3, note_4, note_5, note_6, note_7, note_8, note_9, note_10, prompt_1, prompt_2, prompt_3, prompt_4, prompt_5, prompt_6, prompt_7, prompt_8, prompt_9, prompt_10, Selected_Prompt):
        prompts = [prompt_1, prompt_2, prompt_3, prompt_4, prompt_5, prompt_6, prompt_7, prompt_8, prompt_9, prompt_10]
        return (prompts[int(Selected_Prompt)-1],)

NODE_CLASS_MAPPINGS = {
    "PromptPreset": PromptPreset
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPreset": "Prompt Preset"
}