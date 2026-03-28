import torch
import numpy as np
from PIL import Image
import os
import math
import gc
from comfy.comfy_types import IO, ComfyNodeABC
import folder_paths

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

class VideoFrameExtractor(ComfyNodeABC):
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "video_path": ("PATH",),
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

    def _extract_from_file(self, video_path, selected_indices, enable_output, output_path, filename_prefix):
        if not HAS_CV2:
            raise ImportError("OpenCV (cv2) is required for video extraction. Please install it with: pip install opencv-python")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        images_list = []
        sorted_indices = sorted(selected_indices)
        
        try:
            current_frame = 0
            for target_idx in sorted_indices:
                if target_idx >= total_frames:
                    continue
                
                if target_idx != current_frame:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, target_idx)
                
                ret, frame = cap.read()
                if not ret:
                    continue
                
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)
                
                if enable_output and output_path and output_path.strip():
                    save_dir = output_path.strip()
                    if not os.path.isdir(save_dir):
                        os.makedirs(save_dir, exist_ok=True)
                    frame_path = os.path.join(save_dir, f"{filename_prefix}_{len(images_list):04d}.png")
                    pil_image.save(frame_path)
                    print(f"[VideoFrameExtractor] Saved frame {len(images_list)} to: {frame_path}")

                img_np = np.array(pil_image).astype(np.float32) / 255.0
                img_tensor = torch.from_numpy(img_np)[None,]
                images_list.append(img_tensor)
                
                del frame, frame_rgb, pil_image, img_np
                current_frame = target_idx + 1
                
                if len(images_list) % 10 == 0:
                    gc.collect()
        finally:
            cap.release()
        
        gc.collect()
        return images_list

    def extract_frames(self, video_path, range_mode, mode, max_frames, interval, start_frame=0, end_frame=-1, start_time=0.0, end_time=-1.0, time_unit="seconds", enable_output=False, output_path="", filename_prefix="frame"):
        if enable_output and (not output_path or not output_path.strip()):
            raise ValueError("Output path must be specified when output is enabled / 当启用输出时，必须指定输出路径")
        
        if not filename_prefix or not filename_prefix.strip():
            filename_prefix = "frame"
        
        if not video_path or not isinstance(video_path, str) or not video_path.strip():
            raise ValueError("Video path must be provided")
        
        file_path = video_path.strip()
        if not os.path.exists(file_path):
            raise ValueError(f"Video path does not exist: {file_path}")
        
        if not HAS_CV2:
            raise ImportError("OpenCV (cv2) is required for video extraction. Please install it with: pip install opencv-python")
        
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {file_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        cap.release()

        if total_frames == 0:
            raise ValueError("No frames found in video")

        if range_mode == "by_time":
            time_multiplier = 60.0 if time_unit == "minutes" else 1.0
            start_frame = int(start_time * fps * time_multiplier)
            if end_time < 0:
                end_frame = total_frames - 1
            else:
                end_frame = int(end_time * fps * time_multiplier)

        effective_end = end_frame if end_frame >= 0 else total_frames - 1
        effective_end = min(effective_end, total_frames - 1)

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

        print(f"[VideoFrameExtractor] Extracting from: {file_path}")
        images_list = self._extract_from_file(file_path, selected_indices, enable_output, output_path, filename_prefix)

        return (images_list,)
