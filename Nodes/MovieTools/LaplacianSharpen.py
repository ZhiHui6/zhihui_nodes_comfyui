import torch
import comfy
import numpy as np
from typing import Tuple

class LaplacianSharpen:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "switch": ("BOOLEAN", {"default": True}),
                "image_input": ("IMAGE", {}),
                "sharpen_strength": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 2.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "apply_laplacian"
    CATEGORY = "Zhi.AI/MovieTools"
    DESCRIPTION = "Laplacian Sharpen: Uses Laplacian operator to sharpen images, enhancing edges and details. Supports sharpen strength adjustment, suitable for improving image clarity and detail performance. Commonly used in film post-production and image enhancement."

    def apply_laplacian(self, image_input: torch.Tensor = None, sharpen_strength: float = 0.5, switch: bool = True) -> Tuple[torch.Tensor]:
        if not switch:
            return (image_input,)
            
        if image_input is None:
            return (None,)
            
        device = comfy.model_management.get_torch_device()
        image_input = image_input.to(device)

        x = image_input.permute(0, 3, 1, 2)

        kernel = torch.tensor(
            [[0, -1, 0],
             [-1, 4, -1],
             [0, -1, 0]], dtype=torch.float32, device=device
        ).expand(3, 1, 3, 3)

        edges = torch.nn.functional.conv2d(x, kernel, padding=1, groups=3)

        sharpened = x + sharpen_strength * edges
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)