import torch
import comfy
import numpy as np
from typing import Tuple

class FilmGrain:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "开关": ("BOOLEAN", {"default": True}),
                "输入图像": ("IMAGE", {}),
                "颗粒强度": (
                    "FLOAT", {"default": 0.04, "min": 0.01, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
                "饱和度混合": (
                    "FLOAT", {"default": 0.50, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
                "颗粒分布": (
                    ["高斯分布", "平均分布"], {"default": "高斯分布"}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "apply_grain"
    CATEGORY = "zhihui/后期处理"

    def apply_grain(self, 输入图像=None, 颗粒强度=0.04, 饱和度混合=0.5, 颗粒分布=None, 开关=True):
        if not 开关:
            return (输入图像,)
            
        if 输入图像 is None:
            return (None,)
            
        if 颗粒分布 is None:
            颗粒分布 = "高斯分布"
            
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)

        if 颗粒分布 == "高斯分布":
            grain = torch.randn_like(输入图像)
        else:
            grain = torch.rand_like(输入图像) * 2.0 - 1.0

        grain[:, :, :, 0] *= 2.0
        grain[:, :, :, 2] *= 3.0
        gray = grain[:, :, :, 1].unsqueeze(3).repeat(1, 1, 1, 3)
        grain = 饱和度混合 * grain + (1.0 - 饱和度混合) * gray

        output = 输入图像 + grain * 颗粒强度
        output = output.clamp(0.0, 1.0)
        output = output.to(comfy.model_management.intermediate_device())
        
        return (output,)