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
                "开关": ("BOOLEAN", {"default": True}),
                "输入图像": ("IMAGE", {}),
                "锐化强度": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 2.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_unsharp"
    CATEGORY = "zhihui/后期处理"
    DESCRIPTION = "USM锐化：使用反锐化掩模(Unsharp Mask)技术进行图像锐化，这是专业图像处理中最常用的锐化方法。通过创建模糊版本并与原图对比来增强细节，支持锐化强度调节，适用于高质量图像后期处理。"

    def apply_unsharp(self, 输入图像: torch.Tensor, 锐化强度: float, 开关: bool) -> Tuple[torch.Tensor]:
        if not 开关:
            return (输入图像,)
            
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)

        x = 输入图像.permute(0, 3, 1, 2)

        kernel = torch.ones(3, 1, 3, 3, dtype=torch.float32, device=device) / 9.0
        blur = torch.nn.functional.conv2d(x, kernel, padding=1, groups=3)

        mask = x - blur
        sharpened = x + 锐化强度 * mask
        sharpened = sharpened.clamp(0.0, 1.0)
        sharpened = sharpened.permute(0, 2, 3, 1)
        sharpened = sharpened.to(comfy.model_management.intermediate_device())
        return (sharpened,)