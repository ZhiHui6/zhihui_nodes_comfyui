import os
import torch
import numpy as np
import cv2
import folder_paths

BIGMAX = 9999999
DIMMAX = 8192

class VideoSequenceProcessor:
    
    _current_index = 0
    _last_directory = None
    _video_files = []

    @classmethod
    def INPUT_TYPES(s):
        
        return {
            "required": {
                "directory": ("STRING", {
                    "placeholder": "Video folder path",
                    "default": folder_paths.get_input_directory()
                }),
                "mode": (["Single video", "Next video", "Random video"], {"default": "Single video"}),
                "video_index": ("INT", {"default": 0, "min": 0, "max": BIGMAX, "step": 1}),
                "frames_per_video": ("INT", {"default": 8, "min": 1, "max": BIGMAX, "step": 1}),
                "custom_width": ("INT", {"default": 0, "min": 0, "max": DIMMAX, "step": 8}),
                "custom_height": ("INT", {"default": 0, "min": 0, "max": DIMMAX, "step": 8}),
            },
        }

    RETURN_TYPES = ("IMAGE", "INT", "INT", "STRING")
    RETURN_NAMES = ("frames", "current_index", "total_videos", "filename_text")
    FUNCTION = "process_sequence"
    CATEGORY = "Loader/Video"

    @classmethod
    def process_sequence(cls, directory, mode="Single video", video_index=0, frames_per_video=8, custom_width=0, custom_height=0):
        
        
        if not os.path.isdir(directory):
            raise ValueError(f"Directory does not exist: {directory}")

        
        if cls._last_directory != directory:
            cls._current_index = 0
            cls._last_directory = directory
            
            cls._video_files = []
            video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']  
            for file in os.listdir(directory):
                
                if any(file.lower().endswith(ext) for ext in video_extensions):
                    cls._video_files.append(os.path.join(directory, file))

        if not cls._video_files:
            raise ValueError(f"No video files found in directory: {directory}")

        
        if mode == "Single video":
            selected_index = min(video_index, len(cls._video_files) - 1)  
        elif mode == "Next video":
            selected_index = cls._current_index
            cls._current_index = (cls._current_index + 1) % len(cls._video_files)  
        else:
            selected_index = np.random.randint(0, len(cls._video_files))  

        video_path = cls._video_files[selected_index]
        filename = os.path.basename(video_path)  
        
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Failed to open video: {video_path}")  

        frames = []  
        frame_count = 0
        
        while frame_count < frames_per_video:
            ret, frame = cap.read()  
            if not ret:  
                break

            if custom_width > 0 and custom_height > 0:
                frame = cv2.resize(frame, (custom_width, custom_height))
            
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = frame.astype(np.float32) / 255.0
            frames.append(frame)
            frame_count += 1

        cap.release()

        if not frames:
            raise ValueError("Failed to read video frames")

        frames_tensor = torch.from_numpy(np.stack(frames))
        return (frames_tensor, selected_index, len(cls._video_files), filename)

    @classmethod
    def IS_CHANGED(cls, directory, mode, **kwargs):
        
        if mode == "Next video":
            
            return float("nan")
        if not directory or not isinstance(directory, str):
            directory = folder_paths.get_input_directory()
        if not os.path.isdir(directory):
            return ""
        return os.path.getmtime(directory)

    @classmethod
    def VALIDATE_INPUTS(cls, directory, **kwargs):
        
        if not directory or not isinstance(directory, str):
            directory = folder_paths.get_input_directory()  
        if not os.path.isdir(directory):
            return "Invalid directory path: {}".format(directory)  
        return True  


NODE_CLASS_MAPPINGS = {
    "VideoSequenceProcessor": VideoSequenceProcessor  
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "VideoSequenceProcessor": "Video Batch Loader"  
}