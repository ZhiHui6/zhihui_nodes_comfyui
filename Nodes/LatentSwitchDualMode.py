import torch

class LatentSwitchDualMode:

    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (["manual", "auto"], {"default": "manual"}),
                "select_channel": (["1", "2", "3"], {"default": "1"}),
            },
            "optional": {
                "Latent_1": ("LATENT", {}),
                "Latent_2": ("LATENT", {}),
                "Latent_3": ("LATENT", {}),
                "Latent_1_comment": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of Latent 1"}),
                "Latent_2_comment": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of Latent 2"}),
                "Latent_3_comment": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of Latent 3"}),
            }
        }

    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("output_latent",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/latent"
    DESCRIPTION = "Latent Switcher: Multi-channel latent switcher supporting manual and automatic modes. Can switch between 3 latent inputs, supports annotation tags for easy management, intelligently selects non-empty inputs in automatic mode, suitable for conditional branching and dynamic switching in workflows."

    def execute(self, mode, select_channel, Latent_1=None, Latent_2=None, Latent_3=None, 
                Latent_1_comment="", Latent_2_comment="", Latent_3_comment=""):
        
        latents = [Latent_1, Latent_2, Latent_3]
        
        if mode == "manual":
            idx = int(select_channel) - 1
            if idx < 0 or idx > 2:
                idx = 0
            
            selected_latent = latents[idx]
            if selected_latent is None:
                raise ValueError(f"Selected channel {select_channel} has no input")
                
        else:
            selected_latent = None
            for latent in latents:
                if latent is not None:
                    selected_latent = latent
                    break
            
            if selected_latent is None:
                raise ValueError("No valid Latent input found in automatic mode")
        
        return (selected_latent,)