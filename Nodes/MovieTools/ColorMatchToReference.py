import torch
import comfy
import numpy as np
from typing import Tuple

class ColorMatchToReference:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "switch": ("BOOLEAN", {"default": True}),
                "reference_image": ("IMAGE", {}),
                "input_image": ("IMAGE", {}),
                "match_strength": (
                    "FLOAT", {"default": 1.00, "min": 0.0, "max": 1.0, "step": 0.01, "display": "slider", "round": 0.01}
                ),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "match_color"
    CATEGORY = "Zhi.AI/MovieTools"
    DESCRIPTION = "Color Match to Reference: Adjusts the color of the input image to match the reference image. Analyzes the color distribution of the reference image and automatically adjusts the hue, saturation, and brightness of the input image. Supports match strength adjustment, suitable for cinematic color grading and color consistency processing."

    def match_color(self, input_image: torch.Tensor = None, reference_image: torch.Tensor = None, match_strength: float = 1.0, switch: bool = True) -> Tuple[torch.Tensor]:
        if not switch or input_image is None:
            return (input_image,) if input_image is not None else (None,)
        
        if reference_image is None:
            return (input_image,)
            
        device = comfy.model_management.get_torch_device()
        input_image = input_image.to(device)
        reference_image = reference_image.to(device)

        try:
            from skimage.color import rgb2lab, lab2rgb
        except ImportError:
            return (input_image,)

        if input_image.shape[1:] != reference_image.shape[1:]:
            reference_image = torch.nn.functional.interpolate(
                reference_image.permute(0, 3, 1, 2),
                size=(input_image.shape[1], input_image.shape[2]),
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

        input_lab = rgb_to_lab(input_image)
        ref_lab = rgb_to_lab(reference_image)

        input_mean = torch.mean(input_lab, dim=(1, 2), keepdim=True)
        input_std = torch.std(input_lab, dim=(1, 2), keepdim=True)
        ref_mean = torch.mean(ref_lab, dim=(1, 2), keepdim=True)
        ref_std = torch.std(ref_lab, dim=(1, 2), keepdim=True)

        matched_lab = (input_lab - input_mean) * (ref_std / (input_std + 1e-5)) + ref_mean

        output = lab_to_rgb(matched_lab)
        
        output = input_image * (1 - match_strength) + output * match_strength
        output = output.clamp(0.0, 1.0)
        output = output.to(comfy.model_management.intermediate_device())
        
        return (output,)