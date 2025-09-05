import torch
import comfy
import numpy as np
from typing import Tuple

class FilmGrain:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "switch": ("BOOLEAN", {"default": True}),
                "input_image": ("IMAGE", {}),
                "grain_strength": (
                    "FLOAT", {"default": 0.04, "min": 0.01, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
                "saturation_blend": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
                "grain_distribution": (
                    ["Gaussian", "Uniform"], {"default": "Gaussian"}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "apply_grain"
    CATEGORY = "zhihui/post_processing"
    DESCRIPTION = "Film Grain Effect: Adds film grain texture to images, simulating the visual effect of traditional film photography. Supports adjusting grain strength, saturation blend ratio, and choosing between Gaussian or uniform grain distribution types. Suitable for cinematic post-processing."

    def apply_grain(self, input_image=None, grain_strength=0.04, saturation_blend=0.5, grain_distribution=None, switch=True):
        if not switch:
            return (input_image,)
            
        if input_image is None:
            return (None,)
            
        if grain_distribution is None:
            grain_distribution = "Gaussian"
            
        device = comfy.model_management.get_torch_device()
        input_image = input_image.to(device)

        if grain_distribution == "Gaussian":
            grain = torch.randn_like(input_image)
        else:
            grain = torch.rand_like(input_image) * 2.0 - 1.0

        grain[:, :, :, 0] *= 2.0
        grain[:, :, :, 2] *= 3.0
        gray = grain[:, :, :, 1].unsqueeze(3).repeat(1, 1, 1, 3)
        grain = saturation_blend * grain + (1.0 - saturation_blend) * gray

        output = input_image + grain * grain_strength
        output = output.clamp(0.0, 1.0)
        output = output.to(comfy.model_management.intermediate_device())
        
        return (output,)