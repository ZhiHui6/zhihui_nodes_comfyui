import math
import torch
import numpy as np
from PIL import Image
import cv2

class ImageRotateTool:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "preset": (["Custom", "Rotate 90°", "Rotate 180°", "Rotate 270°", "Vertical Flip", "Horizontal Flip"], {
                    "default": "Custom"
                }),
                "custom_angle": ("FLOAT", {
                    "default": 0.0,
                    "min": -360.0,
                    "max": 360.0,
                    "step": 0.01,
                    "display": "number"
                }),
                "canvas_mode": (["Expand Canvas", "Crop Blank"], {
                    "default": "Expand Canvas"
                }),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "rotate"
    CATEGORY = "Zhi.AI/image"

    def rotate(self, image: torch.Tensor, preset: str, custom_angle: float, canvas_mode: str):
        batch, h, w, c = image.shape
        out = []
        
        if preset != "Custom":
            for b in range(batch):
                pil = Image.fromarray(
                    (image[b].cpu().numpy() * 255).astype(np.uint8), mode="RGB"
                )
                
                if preset == "Rotate 90°":
                    expand = canvas_mode == "Expand Canvas"
                    pil = pil.rotate(-90, expand=expand, fillcolor=(0, 0, 0))
                elif preset == "Rotate 180°":
                    expand = canvas_mode == "Expand Canvas"
                    pil = pil.rotate(-180, expand=expand, fillcolor=(0, 0, 0))
                elif preset == "Rotate 270°":
                    expand = canvas_mode == "Expand Canvas"
                    pil = pil.rotate(-270, expand=expand, fillcolor=(0, 0, 0))
                elif preset == "Vertical Flip":
                    pil = pil.transpose(Image.FLIP_TOP_BOTTOM)
                elif preset == "Horizontal Flip":
                    pil = pil.transpose(Image.FLIP_LEFT_RIGHT)
                
                np_img = np.array(pil).astype(np.float32) / 255.0
                out.append(torch.from_numpy(np_img))
            
            return (torch.stack(out, dim=0),)
        
        for b in range(batch):
            pil = Image.fromarray(
                (image[b].cpu().numpy() * 255).astype(np.uint8), mode="RGB"
            )
            if canvas_mode == "Expand Canvas":
                rad = math.radians(custom_angle)
                cos_a, sin_a = abs(math.cos(rad)), abs(math.sin(rad))
                new_w = int(w * cos_a + h * sin_a)
                new_h = int(w * sin_a + h * cos_a)
                pil = pil.rotate(
                    -custom_angle,
                    expand=True,
                    fillcolor=(0, 0, 0)
                )
                pil = self._center_crop_or_pad(pil, (new_w, new_h))
            else:  # canvas_mode == "Crop Blank"
                pil = pil.rotate(-custom_angle, expand=False, fillcolor=(0, 0, 0))

            np_img = np.array(pil).astype(np.float32) / 255.0
            out.append(torch.from_numpy(np_img))

        return (torch.stack(out, dim=0),)

    @staticmethod
    def _center_crop_or_pad(im: Image.Image, tgt_size: tuple):
        tw, th = tgt_size
        iw, ih = im.size
        if iw == tw and ih == th:
            return im
        new_im = Image.new("RGB", (tw, th), (0, 0, 0))
        x = (tw - iw) // 2
        y = (th - ih) // 2
        new_im.paste(im, (x, y))
        return new_im