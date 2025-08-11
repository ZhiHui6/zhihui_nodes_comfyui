import torch
import torch.nn.functional as F
import comfy
import numpy as np
from typing import Tuple

class UnsharpSharpen:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "输入图像": ("IMAGE",),
                "锐化强度": (
                    "FLOAT", {
                        "default": 0.5,
                        "min": 0.0,
                        "max": 2.0,
                        "step": 0.01
                    }
                )
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_unsharp"
    CATEGORY = "zhihui/后期处理"

    def apply_unsharp(self, 输入图像: torch.Tensor, 锐化强度: float) -> Tuple[torch.Tensor]:
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)

        x = 输入图像.permute(0, 3, 1, 2)

        blur = F.avg_pool2d(x, kernel_size=3, stride=1, padding=1)

        sharpened = x + 锐化强度 * (x - blur)

        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())

        return (sharpened,)