import comfy
import comfy.sd
import comfy.utils
import torch


class PromptPresetMultipleChoice:
        
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        
        return {
            "required": {
                
            },
            "optional": {
                "input_text": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "prompt_1_switch": ("BOOLEAN", {"default": False}),
                "note_1": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_1": ("STRING", {"multiline": True, "default": ""}),
                "prompt_2_switch": ("BOOLEAN", {"default": False}),
                "note_2": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_2": ("STRING", {"multiline": True, "default": ""}),
                "prompt_3_switch": ("BOOLEAN", {"default": False}),
                "note_3": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_3": ("STRING", {"multiline": True, "default": ""}),
                "prompt_4_switch": ("BOOLEAN", {"default": False}),
                "note_4": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_4": ("STRING", {"multiline": True, "default": ""}),
                "prompt_5_switch": ("BOOLEAN", {"default": False}),
                "note_5": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_5": ("STRING", {"multiline": True, "default": ""}),
                "prompt_6_switch": ("BOOLEAN", {"default": False}),
                "note_6": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_6": ("STRING", {"multiline": True, "default": ""}),
                "prompt_7_switch": ("BOOLEAN", {"default": False}),
                "note_7": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_7": ("STRING", {"multiline": True, "default": ""}),
                "prompt_8_switch": ("BOOLEAN", {"default": False}),
                "note_8": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_8": ("STRING", {"multiline": True, "default": ""}),
                "prompt_9_switch": ("BOOLEAN", {"default": False}),
                "note_9": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_9": ("STRING", {"multiline": True, "default": ""}),
                "prompt_10_switch": ("BOOLEAN", {"default": False}),
                "note_10": ("STRING", {"multiline": False, "default": "", "placeholder": ""}),
                "prompt_10": ("STRING", {"multiline": True, "default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "execute"
    CATEGORY = "prompt"

    def execute(self, prompt_1_switch, note_1, prompt_1, prompt_2_switch, note_2, prompt_2, prompt_3_switch, note_3, prompt_3, prompt_4_switch, note_4, prompt_4, prompt_5_switch, note_5, prompt_5, prompt_6_switch, note_6, prompt_6, prompt_7_switch, note_7, prompt_7, prompt_8_switch, note_8, prompt_8, prompt_9_switch, note_9, prompt_9, prompt_10_switch, note_10, prompt_10, input_text=""):

        enabled_prompts = [input_text] if input_text else []
        if prompt_1_switch and prompt_1: enabled_prompts.append(prompt_1)
        if prompt_2_switch and prompt_2: enabled_prompts.append(prompt_2)
        if prompt_3_switch and prompt_3: enabled_prompts.append(prompt_3)
        if prompt_4_switch and prompt_4: enabled_prompts.append(prompt_4)
        if prompt_5_switch and prompt_5: enabled_prompts.append(prompt_5)
        if prompt_6_switch and prompt_6: enabled_prompts.append(prompt_6)
        if prompt_7_switch and prompt_7: enabled_prompts.append(prompt_7)
        if prompt_8_switch and prompt_8: enabled_prompts.append(prompt_8)
        if prompt_9_switch and prompt_9: enabled_prompts.append(prompt_9)
        if prompt_10_switch and prompt_10: enabled_prompts.append(prompt_10)
        return ("\n".join(filter(None, enabled_prompts)),)

NODE_CLASS_MAPPINGS = {
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetMultipleChoice": "Prompt Preset (Multiple Choice)"
}