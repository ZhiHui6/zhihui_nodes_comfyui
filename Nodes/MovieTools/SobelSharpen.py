import torch
import comfy
import numpy as np
from typing import Tuple

class SobelSharpen:
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
    FUNCTION = "apply_sobel"
    CATEGORY = "Zhi.AI/MovieTools"
    DESCRIPTION = "Sobel Sharpen: Uses Sobel operator for edge detection and sharpening, enhancing edge information by calculating image gradients. Supports sharpen strength adjustment, particularly suitable for highlighting image contours and edge details. Commonly used in image preprocessing and artistic effect creation."

    def apply_sobel(self, input_image: torch.Tensor = None, sharpen_strength: float = 0.5, switch: bool = True) -> Tuple[torch.Tensor]:
        if not switch:
            return (input_image,)
            
        if input_image is None:
            return (None,)
            
        device = comfy.model_management.get_torch_device()
        input_image = input_image.to(device)

        x = input_image.permute(0, 3, 1, 2)

        sobel_x = torch.tensor(
            [[-1, 0, 1],
             [-2, 0, 2],
             [-1, 0, 1]], dtype=torch.float32, device=device
        ).expand(3, 1, 3, 3)

        sobel_y = torch.tensor(
            [[-1, -2, -1],
             [0, 0, 0],
             [1, 2, 1]], dtype=torch.float32, device=device
        ).expand(3, 1, 3, 3)

        edges_x = torch.nn.functional.conv2d(x, sobel_x, padding=1, groups=3)
        edges_y = torch.nn.functional.conv2d(x, sobel_y, padding=1, groups=3)
        edges = torch.sqrt(edges_x ** 2 + edges_y ** 2)

        sharpened = x + sharpen_strength * edges
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)