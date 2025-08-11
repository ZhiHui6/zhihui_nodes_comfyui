import torch
import comfy
import numpy as np
from typing import Tuple

class FilmGrain:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "输入图像": ("IMAGE",),
                "颗粒强度": (
                    "FLOAT", {"default": 0.04, "min": 0.01, "max": 1.0, "step": 0.01}
                ),
                "饱和度混合": (
                    "FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_grain"
    CATEGORY = "zhihui/后期处理"

    def apply_grain(self, 输入图像, 颗粒强度, 饱和度混合):
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)

        grain = torch.randn_like(输入图像)

        grain[:, :, :, 0] *= 2.0
        grain[:, :, :, 2] *= 3.0

        gray = grain[:, :, :, 1].unsqueeze(3).repeat(1, 1, 1, 3)
        grain = 饱和度混合 * grain + (1.0 - 饱和度混合) * gray

        output = 输入图像 + grain * 颗粒强度
        output = output.clamp(0.0, 1.0)

        output = output.to(comfy.model_management.intermediate_device())
        return (output,)