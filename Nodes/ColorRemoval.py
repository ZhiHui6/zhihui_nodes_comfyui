import numpy as np
import cv2
import torch

class ColorRemoval:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "input_image": ("IMAGE",),
            },
        }

    CATEGORY = "Zhi.AI/Image"
    DESCRIPTION = "Color Removal Node: Converts color images to grayscale images, removing all color information while preserving luminance information. Suitable for creating black and white effects, image preprocessing, artistic style conversion and other scenarios."

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "remove_color"

    def remove_color(self, input_image):
        for img in input_image:
            img_cv = tensor2cv2(img)
            gray_img = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            gray_img = cv2.cvtColor(gray_img, cv2.COLOR_GRAY2RGB)
            rst = torch.from_numpy(gray_img.astype(np.float32) / 255.0).unsqueeze(0)
        return (rst,)

def tensor2cv2(image: torch.Tensor) -> np.array:
    if image.dim() == 4:
        image = image.squeeze()
    npimage = image.numpy()
    cv2image = np.uint8(npimage * 255 / npimage.max())
    return cv2.cvtColor(cv2image, cv2.COLOR_RGB2BGR)