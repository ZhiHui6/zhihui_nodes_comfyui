import numpy as np
import cv2
import torch

class ColorRemoval:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "输入图像": ("IMAGE",),
            },
        }

    CATEGORY = "zhihui/图像"
    DESCRIPTION = "去色节点：将彩色图像转换为灰度图像，移除所有颜色信息保留亮度信息。适用于创建黑白效果、图像预处理、艺术风格转换等场景。"

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "remove_color"

    def remove_color(self, 输入图像):
        for img in 输入图像:
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