import torch
import comfy
import numpy as np
from typing import Tuple

class SobelSharpen:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "开关": ("BOOLEAN", {"default": True}),
                "输入图像": ("IMAGE", {}),
                "锐化强度": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 2.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_sobel"
    CATEGORY = "zhihui/后期处理"

    def apply_sobel(self, 输入图像: torch.Tensor = None, 锐化强度: float = 0.5, 开关: bool = True) -> Tuple[torch.Tensor]:
        if not 开关:
            return (输入图像,)
            
        if 输入图像 is None:
            return (None,)
            
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)

        x = 输入图像.permute(0, 3, 1, 2)

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

        sharpened = x + 锐化强度 * edges
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)