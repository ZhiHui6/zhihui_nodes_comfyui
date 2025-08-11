import torch
import comfy
import kornia
import numpy as np
from typing import Tuple

class ColorMatchToReference:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "输入图像": ("IMAGE",),
                "参考图像": ("IMAGE",),
                "匹配强度": (
                    "FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0, "step": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES =("图像输出",)
    FUNCTION = "match_color"
    CATEGORY = "zhihui/后期处理"
    DESCRIPTION = "使用LAB均值/标准差对齐方法将输入图像的色调匹配到参考图像"

    def match_color(self, 输入图像, 参考图像, 匹配强度):
        device = comfy.model_management.get_torch_device()

        输入图像 = 输入图像.to(device)
        参考图像 = 参考图像.to(device)

        输入图像 = 输入图像.permute(0, 3, 1, 2)
        参考图像 = 参考图像.permute(0, 3, 1, 2)

        img_lab = kornia.color.rgb_to_lab(输入图像)
        ref_lab = kornia.color.rgb_to_lab(参考图像)

        img_mean = img_lab.mean(dim=[2, 3], keepdim=True)
        img_std = img_lab.std(dim=[2, 3], keepdim=True) + 1e-5

        ref_mean = ref_lab.mean(dim=[2, 3], keepdim=True)
        ref_std = ref_lab.std(dim=[2, 3], keepdim=True)

        matched_lab = (img_lab - img_mean) / img_std * ref_std + ref_mean
        blended_lab = 匹配强度 * matched_lab + (1.0 - 匹配强度) * img_lab

        output = kornia.color.lab_to_rgb(blended_lab)
        output = output.clamp(0.0, 1.0)
        output = output.permute(0, 2, 3, 1)
        output = output.to(comfy.model_management.intermediate_device())

        return (output,)