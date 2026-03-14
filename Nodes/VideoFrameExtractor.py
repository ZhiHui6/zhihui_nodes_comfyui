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
                "range_mode": (["by_frame", "by_time"],),
                "mode": (["extract_by_count", "extract_by_interval"],),
                "max_frames": ("INT", {"default": 16, "min": 1, "max": 100, "step": 1}),
                "interval": ("INT", {"default": 10, "min": 1, "max": 500, "step": 1}),
            },
            "optional": {
                "start_frame": ("INT", {"default": 0, "min": 0, "max": 99999, "step": 1}),
                "end_frame": ("INT", {"default": -1, "min": -1, "max": 99999, "step": 1}),
                "start_time": ("FLOAT", {"default": 0.0, "min": 0.0, "max": 99999.0, "step": 0.1}),
                "end_time": ("FLOAT", {"default": -1.0, "min": -1.0, "max": 99999.0, "step": 0.1}),
                "time_unit": (["seconds", "minutes"],),
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

    def extract_frames(self, video, range_mode, mode, max_frames, interval, start_frame=0, end_frame=-1, start_time=0.0, end_time=-1.0, time_unit="seconds", enable_output=False, output_path="", filename_prefix="frame"):
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

        components = video.get_components()
        fps = components.frame_rate if hasattr(components, 'frame_rate') else 30.0

        if range_mode == "by_time":
            time_multiplier = 60.0 if time_unit == "minutes" else 1.0
            start_frame = int(start_time * fps * time_multiplier)
            if end_time < 0:
                end_frame = frame_count - 1
            else:
                end_frame = int(end_time * fps * time_multiplier)

        effective_end = end_frame if end_frame >= 0 else frame_count - 1
        effective_end = min(effective_end, frame_count - 1)

        if start_frame > effective_end:
            raise ValueError("Start frame exceeds end frame")

        selected_indices = []

        if mode == "extract_by_count":
            total_available = effective_end - start_frame + 1
            if total_available <= 0:
                raise ValueError("No frames available in the specified range")

            step = max(1, total_available // max_frames)
            for i in range(max_frames):
                idx = start_frame + i * step
                if idx <= effective_end:
                    selected_indices.append(idx)
        else:
            idx = start_frame
            while idx <= effective_end:
                selected_indices.append(idx)
                idx += interval

        if len(selected_indices) == 0:
            selected_indices = [start_frame]

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