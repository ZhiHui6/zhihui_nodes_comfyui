import torch
import torch.nn.functional as F
import comfy
import numpy as np
from typing import Tuple

class USMSharpen:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "switch": ("BOOLEAN", {"default": True}),
                "input_image": ("IMAGE", {}),
                "sharpen_strength": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 2.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "apply_unsharp"
    CATEGORY = "Zhi.AI/MovieTools"
    DESCRIPTION = "USM Sharpen: Uses Unsharp Mask technique for image sharpening, which is the most commonly used sharpening method in professional image processing. Enhances details by creating a blurred version and comparing it with the original image. Supports sharpen strength adjustment, suitable for high-quality image post-processing."

    def apply_unsharp(self, input_image: torch.Tensor, sharpen_strength: float, switch: bool) -> Tuple[torch.Tensor]:
        if not switch:
            return (input_image,)
            
        device = comfy.model_management.get_torch_device()
        input_image = input_image.to(device)

        x = input_image.permute(0, 3, 1, 2)

        kernel = torch.ones(3, 1, 3, 3, dtype=torch.float32, device=device) / 9.0
        blur = torch.nn.functional.conv2d(x, kernel, padding=1, groups=3)

        mask = x - blur
        sharpened = x + sharpen_strength * mask
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)