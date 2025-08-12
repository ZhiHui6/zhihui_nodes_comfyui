import torch
import comfy
import numpy as np
from typing import Tuple

class ColorMatchToReference:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "开关": ("BOOLEAN", {"default": True}),
                "输入图像": ("IMAGE",),
                "参考图像": ("IMAGE",),
                "匹配强度": (
                    "FLOAT", {"default": 1.00, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "match_color"
    CATEGORY = "zhihui/后期处理"

    def match_color(self, 输入图像: torch.Tensor, 参考图像: torch.Tensor, 匹配强度: float, 开关: bool) -> Tuple[torch.Tensor]:
        if not 开关:
            return (输入图像,)
            
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)
        参考图像 = 参考图像.to(device)

        def rgb_to_lab(img):
            device = img.device
            img_np = img.cpu().numpy()
            lab = []
            for frame in img_np:
                lab_frame = []
                for i in range(frame.shape[0]):
                    rgb = (frame[i].transpose(1, 2, 0) * 255).astype(np.uint8)
                    lab_img = rgb2lab(rgb)
                    lab_frame.append(lab_img.transpose(2, 0, 1) / 100.0)
                lab.append(np.stack(lab_frame))
            return torch.tensor(np.array(lab), device=device)

        def lab_to_rgb(lab):
            device = lab.device
            lab_np = lab.cpu().numpy()
            rgb = []
            for frame in lab_np:
                rgb_frame = []
                for i in range(frame.shape[0]):
                    lab_img = (frame[i].transpose(1, 2, 0) * 100.0).astype(np.float32)
                    rgb_img = lab2rgb(lab_img)
                    rgb_frame.append(rgb_img.transpose(2, 0, 1) / 255.0)
                rgb.append(np.stack(rgb_frame))
            return torch.tensor(np.array(rgb), device=device)

        try:
            from skimage.color import rgb2lab, lab2rgb
        except ImportError:
            return (输入图像,)

        input_lab = rgb_to_lab(输入图像)
        ref_lab = rgb_to_lab(参考图像)

        input_mean = torch.mean(input_lab, dim=(2, 3), keepdim=True)
        input_std = torch.std(input_lab, dim=(2, 3), keepdim=True)
        ref_mean = torch.mean(ref_lab, dim=(2, 3), keepdim=True)
        ref_std = torch.std(ref_lab, dim=(2, 3), keepdim=True)

        matched_lab = (input_lab - input_mean) * (ref_std / (input_std + 1e-5)) + ref_mean

        output = lab_to_rgb(matched_lab)
        output = 输入图像 * (1 - 匹配强度) + output * 匹配强度
        output = output.clamp(0.0, 1.0)
        output = output.to(comfy.model_management.intermediate_device())
        return (output,)