import torch
import comfy
import numpy as np
from typing import Tuple

class ColorMatchToReference:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "开关": ("BOOLEAN", {"default": True}),
                "参考图像": ("IMAGE", {}),
                "输入图像": ("IMAGE", {}),
                "匹配强度": (
                    "FLOAT", {"default": 1.00, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "match_color"
    CATEGORY = "zhihui/后期处理"

    def match_color(self, 输入图像: torch.Tensor = None, 参考图像: torch.Tensor = None, 匹配强度: float = 1.0, 开关: bool = True) -> Tuple[torch.Tensor]:
        if not 开关 or 输入图像 is None:
            return (输入图像,) if 输入图像 is not None else (None,)
        
        if 参考图像 is None:
            return (输入图像,)
            
        device = comfy.model_management.get_torch_device()
        输入图像 = 输入图像.to(device)
        参考图像 = 参考图像.to(device)

        try:
            from skimage.color import rgb2lab, lab2rgb
        except ImportError:
            return (输入图像,)

        if 输入图像.shape[1:] != 参考图像.shape[1:]:
            参考图像 = torch.nn.functional.interpolate(
                参考图像.permute(0, 3, 1, 2),
                size=(输入图像.shape[1], 输入图像.shape[2]),
                mode='bilinear',
                align_corners=False
            ).permute(0, 2, 3, 1)

        def rgb_to_lab(img):
            device = img.device
            img_np = img.cpu().numpy()
            
            if len(img_np.shape) == 4:
                lab_frames = []
                for frame in img_np:
                    rgb = (frame * 255).astype(np.uint8)
                    lab_img = rgb2lab(rgb)
                    lab_frames.append(lab_img / 100.0)
                lab = np.stack(lab_frames)
            else:
                rgb = (img_np * 255).astype(np.uint8)
                lab = rgb2lab(rgb) / 100.0
                
            return torch.tensor(lab, device=device, dtype=torch.float32)

        def lab_to_rgb(lab):
            device = lab.device
            lab_np = lab.cpu().numpy()
            
            if len(lab_np.shape) == 4:
                rgb_frames = []
                for frame in lab_np:
                    lab_img = frame * 100.0
                    rgb_img = lab2rgb(lab_img)
                    rgb_frames.append(rgb_img)
                rgb = np.stack(rgb_frames)
            else:
                lab_img = lab_np * 100.0
                rgb = lab2rgb(lab_img)
                
            return torch.tensor(rgb, device=device, dtype=torch.float32)

        input_lab = rgb_to_lab(输入图像)
        ref_lab = rgb_to_lab(参考图像)

        input_mean = torch.mean(input_lab, dim=(1, 2), keepdim=True)
        input_std = torch.std(input_lab, dim=(1, 2), keepdim=True)
        ref_mean = torch.mean(ref_lab, dim=(1, 2), keepdim=True)
        ref_std = torch.std(ref_lab, dim=(1, 2), keepdim=True)

        matched_lab = (input_lab - input_mean) * (ref_std / (input_std + 1e-5)) + ref_mean

        output = lab_to_rgb(matched_lab)
        
        output = 输入图像 * (1 - 匹配强度) + output * 匹配强度
        output = output.clamp(0.0, 1.0)
        output = output.to(comfy.model_management.intermediate_device())
        
        return (output,)