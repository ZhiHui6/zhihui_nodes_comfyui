import os
import numpy as np
import torch
import folder_paths
import cv2

class VideoCombine:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE",),
                "frame_rate": ("FLOAT", {"default": 8, "min": 1, "step": 1}),
                "filename_prefix": ("STRING", {"default": "AnimateDiff"}),
                "format": (["video/mp4", "video/avi", "video/mkv", "video/mov", "video/wmv"], {}),
                "pingpong": ("BOOLEAN", {"default": False}),
                "save_output": ("BOOLEAN", {"default": True}),
                "custom_output_path": ("STRING", {"default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("filename",)
    OUTPUT_NODE = True
    CATEGORY = "zhihui/视频"
    FUNCTION = "combine_video"

    def combine_video(self, images, frame_rate, filename_prefix="AnimateDiff", 
        format="video/mp4", pingpong=False, save_output=True, custom_output_path=""):

        if custom_output_path and os.path.isdir(custom_output_path):
            output_dir = custom_output_path
        else:
            output_dir = folder_paths.get_output_directory() if save_output else folder_paths.get_temp_directory()

        os.makedirs(output_dir, exist_ok=True)

        file = f"{filename_prefix}.mp4"
        file_path = os.path.join(output_dir, file)

        if isinstance(images, torch.Tensor):
            images = images.cpu().numpy()
        images = (images * 255).astype(np.uint8)

        if pingpong:
            images = np.concatenate([images, images[-2:0:-1]])

        height, width = images[0].shape[:2]

        format_configs = {
            "video/mp4": ("mp4v", "mp4"),
            "video/avi": ("XVID", "avi"),
            "video/mkv": ("X264", "mkv"),
            "video/mov": ("mp4v", "mov"),
            "video/wmv": ("WMV2", "wmv")
        }
        
        codec, ext = format_configs[format]
        file = f"{filename_prefix}.{ext}"
        file_path = os.path.join(output_dir, file)

        fourcc = cv2.VideoWriter_fourcc(*codec)
        out = cv2.VideoWriter(file_path, fourcc, frame_rate, (width, height))

        for img in images:

            frame = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            out.write(frame)

        out.release()

        return (file_path,)

    def _get_next_counter(self, output_dir, filename_prefix):
        max_counter = 0
        for f in os.listdir(output_dir):
            if f.startswith(filename_prefix):
                try:
                    counter = int(f.split("_")[-1].split(".")[0])
                    max_counter = max(max_counter, counter)
                except:
                    pass
        return max_counter + 1