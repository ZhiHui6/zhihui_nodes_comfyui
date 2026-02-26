import torch
import numpy as np
from PIL import Image
import os
import math
from comfy.comfy_types import IO, ComfyNodeABC
import folder_paths

class VideoFrameExtractor(ComfyNodeABC):
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "video": ("VIDEO",),
                "mode": (["extract_by_count", "extract_by_interval"],),
                "max_frames": ("INT", {"default": 16, "min": 1, "max": 100, "step": 1}),
                "interval": ("INT", {"default": 10, "min": 1, "max": 500, "step": 1}),
            },
            "optional": {
                "start_frame": ("INT", {"default": 0, "min": 0, "max": 99999, "step": 1}),
                "enable_output": ("BOOLEAN", {"default": False}),
                "output_path": ("STRING", {"default": "", "multiline": False}),
                "filename_prefix": ("STRING", {"default": "", "multiline": False}),
            }
        }

    CATEGORY = "Zhi.AI/Video"
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("IMAGES",)
    OUTPUT_IS_LIST = (True,)
    FUNCTION = "extract_frames"

    def extract_frames(self, video, mode, max_frames, interval, start_frame=0, enable_output=False, output_path="", filename_prefix="frame"):
        if enable_output and (not output_path or not output_path.strip()):
            raise ValueError("Output path must be specified when output is enabled / 当启用输出时，必须指定输出路径")
        
        if not filename_prefix or not filename_prefix.strip():
            filename_prefix = "frame"
        
        components = video.get_components()
        frames_tensor = components.images

        if isinstance(frames_tensor, torch.Tensor):
            if frames_tensor.ndim == 5:
                frames_tensor = frames_tensor[0]
            elif frames_tensor.ndim == 4:
                pass
            else:
                raise ValueError(f"Unexpected tensor shape: {frames_tensor.shape}")
            
            frame_count = frames_tensor.shape[0]
        else:
            raise ValueError(f"Unexpected frames type: {type(frames_tensor)}")

        if frame_count == 0:
            raise ValueError("No frames found in video")

        selected_indices = []

        if mode == "extract_by_count":
            total_available = frame_count - start_frame
            if total_available <= 0:
                raise ValueError("Start frame exceeds video length")
            
            step = max(1, total_available // max_frames)
            for i in range(max_frames):
                idx = start_frame + i * step
                if idx < frame_count:
                    selected_indices.append(idx)
        else:
            idx = start_frame
            while idx < frame_count:
                selected_indices.append(idx)
                idx += interval

        if len(selected_indices) == 0:
            selected_indices = [0]

        selected_indices = selected_indices[:max_frames]

        pil_images = []
        for idx in selected_indices:
            frame = frames_tensor[idx]
            
            if frame.ndim == 3 and frame.shape[0] == 3:
                frame_np = frame.cpu().numpy()
                frame_np = np.transpose(frame_np, (1, 2, 0))
            elif frame.ndim == 3 and frame.shape[0] == 4:
                frame_np = frame.cpu().numpy()
                frame_np = np.transpose(frame_np, (1, 2, 0))
            elif frame.ndim == 2:
                frame_np = frame.cpu().numpy()
            else:
                frame_np = frame.cpu().numpy()

            if frame_np.dtype != np.uint8:
                frame_np = np.clip(frame_np * 255, 0, 255).astype(np.uint8)

            pil_images.append(Image.fromarray(frame_np))

        if enable_output and output_path and output_path.strip():
            save_dir = output_path.strip()
            if not os.path.isdir(save_dir):
                os.makedirs(save_dir, exist_ok=True)
            for i, img in enumerate(pil_images):
                frame_path = os.path.join(save_dir, f"{filename_prefix}_{i:04d}.png")
                img.save(frame_path)
                print(f"[VideoFrameExtractor] Saved frame {i} to: {frame_path}")

        images_list = []
        for img in pil_images:
            img_np = np.array(img).astype(np.float32) / 255.0
            img_tensor = torch.from_numpy(img_np)[None,]
            images_list.append(img_tensor)

        return (images_list,)