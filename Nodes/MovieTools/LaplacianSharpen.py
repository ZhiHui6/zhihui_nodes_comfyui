import torch
import comfy
import numpy as np
from typing import Tuple

class LaplacianSharpen:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "开关": ("BOOLEAN", {"default": True}),
                "图像输入": ("IMAGE", {}),
                "锐化强度": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 2.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_laplacian"
    CATEGORY = "zhihui/后期处理"
    DESCRIPTION = "拉普拉斯锐化：使用拉普拉斯算子对图像进行锐化处理，增强图像的边缘和细节。支持锐化强度调节，适用于提升图像清晰度和细节表现，常用于电影后期制作和图像增强。"

    def apply_laplacian(self, 图像输入: torch.Tensor = None, 锐化强度: float = 0.5, 开关: bool = True) -> Tuple[torch.Tensor]:
        if not 开关:
            return (图像输入,)
            
        if 图像输入 is None:
            return (None,)
            
        device = comfy.model_management.get_torch_device()
        图像输入 = 图像输入.to(device)

        x = 图像输入.permute(0, 3, 1, 2)

        kernel = torch.tensor(
            [[0, -1, 0],
             [-1, 4, -1],
             [0, -1, 0]], dtype=torch.float32, device=device
        ).expand(3, 1, 3, 3)

        edges = torch.nn.functional.conv2d(x, kernel, padding=1, groups=3)

        sharpened = x + 锐化强度 * edges
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)