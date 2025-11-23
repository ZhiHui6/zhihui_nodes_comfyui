import os
import torch
from PIL import ImageOps, Image
import numpy as np
import re

try:
    import pillow_jxl
    jxl = True
except ImportError:
    jxl = False

def extract_first_number(s):
    match = re.search(r'\d+', s)
    return int(match.group()) if match else float('inf')

sort_methods = [
    "None",
    "Alphabetical (ASC)",
    "Alphabetical (DESC)",
    "Numerical (ASC)",
    "Numerical (DESC)",
    "Datetime (ASC)",
    "Datetime (DESC)"
]

def sort_by(items, base_path='.', method=None):
    def fullpath(x): return os.path.join(base_path, x)

    def get_timestamp(path):
        try:
            return os.path.getmtime(path)
        except FileNotFoundError:
            return float('-inf')

    if method == "Alphabetical (ASC)":
        return sorted(items)
    elif method == "Alphabetical (DESC)":
        return sorted(items, reverse=True)
    elif method == "Numerical (ASC)":
        return sorted(items, key=lambda x: extract_first_number(os.path.splitext(x)[0]))
    elif method == "Numerical (DESC)":
        return sorted(items, key=lambda x: extract_first_number(os.path.splitext(x)[0]), reverse=True)
    elif method == "Datetime (ASC)":
        return sorted(items, key=lambda x: get_timestamp(fullpath(x)))
    elif method == "Datetime (DESC)":
        return sorted(items, key=lambda x: get_timestamp(fullpath(x)), reverse=True)
    else:
        return items

class BatchLoadingOfImages:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "directory": ("STRING", {"default": ""}),
            },
            "optional": {
                "image_load_cap": ("INT", {"default": 0, "min": 0, "step": 1}),
                "start_index": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff, "step": 1}),
                "load_always": ("BOOLEAN", {"default": False, "label_on": "enabled", "label_off": "disabled"}),
                "sort_method": (sort_methods,),
            }
        }

    RETURN_TYPES = ("IMAGE", "MASK", "STRING")
    RETURN_NAMES = ("IMAGE", "MASK", "FILE PATH")
    OUTPUT_IS_LIST = (True, True, True)

    FUNCTION = "load_images"

    CATEGORY = "Zhi.AI/Image"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        if 'load_always' in kwargs and kwargs['load_always']:
            return float("NaN")
        else:
            return hash(frozenset(kwargs.items()))

    def load_images(self, directory: str, image_load_cap: int = 0, start_index: int = 0, load_always=False, sort_method=None):
        if not os.path.isdir(directory):
            raise FileNotFoundError(f"Directory '{directory}' cannot be found.")
        dir_files = os.listdir(directory)
        if len(dir_files) == 0:
            raise FileNotFoundError(f"No files in directory '{directory}'.")

        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if jxl:
            valid_extensions.append('.jxl')
        dir_files = [f for f in dir_files if any(f.lower().endswith(ext) for ext in valid_extensions)]

        dir_files = sort_by(dir_files, directory, sort_method)
        dir_files = [os.path.join(directory, x) for x in dir_files]

        dir_files = dir_files[start_index:]

        images = []
        masks = []
        file_paths = []

        limit_images = image_load_cap > 0
        image_count = 0

        for image_path in dir_files:
            if os.path.isdir(image_path):
                continue
            if limit_images and image_count >= image_load_cap:
                break
            i = Image.open(image_path)
            i = ImageOps.exif_transpose(i)
            image = i.convert("RGB")
            image = np.array(image).astype(np.float32) / 255.0
            image = torch.from_numpy(image)[None,]

            if 'A' in i.getbands():
                mask_array = np.array(i.getchannel('A')).astype(np.float32) / 255.0
                mask = torch.from_numpy(mask_array)[None, None, :, :]
            else:
                h, w = image.shape[1], image.shape[2]
                mask_array = np.ones((h, w), dtype=np.float32)
                mask = torch.from_numpy(mask_array)[None, None, :, :]

            images.append(image)
            masks.append(mask)
            file_paths.append(str(image_path))
            image_count += 1

        return (images, masks, file_paths)
