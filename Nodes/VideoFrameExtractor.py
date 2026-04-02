import torch
import numpy as np
from PIL import Image
import os
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
                "extract_mode": (
                    [
                        "frame_count",
                        "frame_interval",
                        "time_count",
                        "time_interval",
                    ],
                ),
                "num_frames": (
                    "INT",
                    {"default": 16, "min": 1, "max": 99999, "step": 1},
                ),
                "frame_interval_value": (
                    "INT",
                    {"default": 10, "min": 1, "max": 500, "step": 1},
                ),
                "time_interval_value": (
                    "FLOAT",
                    {"default": 1.0, "min": 0.01, "max": 600.0, "step": 0.1},
                ),
                "time_unit": (["seconds", "minutes"],),
                "start_frame": (
                    "INT",
                    {"default": 0, "min": 0, "max": 99999, "step": 1},
                ),
                "end_frame": (
                    "INT",
                    {"default": -1, "min": -1, "max": 99999, "step": 1},
                ),
                "start_time": (
                    "FLOAT",
                    {"default": 0.0, "min": 0.0, "max": 99999.0, "step": 0.1},
                ),
                "end_time": (
                    "FLOAT",
                    {"default": -1.0, "min": -1.0, "max": 99999.0, "step": 0.1},
                ),
                "max_output_frames": (
                    "INT",
                    {"default": -1, "min": -1, "max": 99999, "step": 1},
                ),
            },
            "optional": {
                "custom_path": ("BOOLEAN", {"default": False}),
                "output_directory": ("STRING", {"default": "", "multiline": False}),
                "filename_prefix": ("STRING", {"default": "", "multiline": False}),
            },
        }

    CATEGORY = "Zhi.AI/Video"
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("IMAGES",)
    OUTPUT_IS_LIST = (True,)
    FUNCTION = "extract_frames"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

    def _extract_from_file(
        self, video_path, selected_indices, enable_output, output_path, filename_prefix
    ):
        if not HAS_CV2:
            raise ImportError(
                "OpenCV (cv2) is required for video extraction. Please install it with: pip install opencv-python"
            )

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
                    frame_path = os.path.join(
                        save_dir, f"{filename_prefix}_{len(images_list):04d}.png"
                    )
                    pil_image.save(frame_path)
                    print(
                        f"[VideoFrameExtractor] Saved frame {len(images_list)} to: {frame_path}"
                    )

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

    def extract_frames(
        self,
        video_path,
        extract_mode,
        num_frames,
        frame_interval_value,
        time_interval_value,
        time_unit,
        start_frame,
        end_frame,
        start_time,
        end_time,
        max_output_frames=-1,
        custom_path=False,
        output_directory="",
        filename_prefix="frame",
    ):
        if custom_path and (not output_directory or not output_directory.strip()):
            raise ValueError(
                "Output path must be specified when output is enabled / 当启用输出时，必须指定输出路径"
            )

        if not filename_prefix or not filename_prefix.strip():
            filename_prefix = "frame"

        if not video_path or not isinstance(video_path, str) or not video_path.strip():
            raise ValueError("Video path must be provided")

        file_path = video_path.strip()
        if not os.path.exists(file_path):
            raise ValueError(f"Video path does not exist: {file_path}")

        if not HAS_CV2:
            raise ImportError(
                "OpenCV (cv2) is required for video extraction. Please install it with: pip install opencv-python"
            )

        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {file_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        cap.release()

        if total_frames == 0:
            raise ValueError("No frames found in video")

        is_time_mode = extract_mode in ["time_count", "time_interval"]
        is_count_mode = extract_mode in ["frame_count", "time_count"]

        if is_time_mode:
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

        if is_count_mode:
            total_available = effective_end - start_frame + 1
            if total_available <= 0:
                raise ValueError("No frames available in the specified range")

            if num_frames >= total_available:
                selected_indices = list(range(start_frame, effective_end + 1))
            else:
                for i in range(num_frames):
                    idx = (
                        start_frame + int(i * (total_available - 1) / (num_frames - 1))
                        if num_frames > 1
                        else start_frame
                    )
                    selected_indices.append(idx)
        else:
            if is_time_mode:
                time_multiplier = 60.0 if time_unit == "minutes" else 1.0
                frame_interval = max(1, int(time_interval_value * fps * time_multiplier))
            else:
                frame_interval = frame_interval_value
            idx = start_frame
            while idx <= effective_end:
                selected_indices.append(idx)
                idx += frame_interval
            if max_output_frames > 0:
                selected_indices = selected_indices[:max_output_frames]

        if len(selected_indices) == 0:
            selected_indices = [start_frame]

        print(f"[VideoFrameExtractor] Extracting from: {file_path}")
        images_list = self._extract_from_file(
            file_path, selected_indices, custom_path, output_directory, filename_prefix
        )

        return (images_list,)
