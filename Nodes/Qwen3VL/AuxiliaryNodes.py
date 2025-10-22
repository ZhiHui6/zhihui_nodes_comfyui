import cv2
import hashlib
import os
import folder_paths
from comfy.comfy_types import IO, ComfyNodeABC
from comfy_api.latest import InputImpl

class MultiplePathsInput:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "inputcount": ("INT", {"default": 1, "min": 1, "max": 1000, "step": 1}),
                "path_1": ("PATH",),
            },
        }

    RETURN_TYPES = ("PATH",)
    RETURN_NAMES = ("paths",)
    FUNCTION = "combine"
    CATEGORY = "Comfyui_Qwen3-VL_Adv"

    @staticmethod
    def convert_path_to_json(file_path):
        ext = file_path.split('.')[-1].lower()

        if ext in ["jpg", "jpeg", "png", "bmp", "tiff", "webp"]:
            return {"type": "image", "image": f"{file_path}"}
        elif ext in ["mp4", "mkv", "mov", "avi", "flv", "wmv", "webm", "m4v"]:
            print("source_video_path:", file_path)
            vidObj = cv2.VideoCapture(file_path)
            vr=[]
            while vidObj.isOpened():
                ret, frame = vidObj.read()
                if not ret:
                    break
                else:
                    vr.append(frame)
            total_frames = len(vr) + 1
            print("Total frames:", total_frames)
            avg_fps = vidObj.get(cv2.CAP_PROP_FPS)
            print("Get average FPS(frame per second):", avg_fps)
            duration = len(vr) / avg_fps
            print("Total duration:", duration, "seconds")
            width = vr[0].shape[1]
            height = vr[0].shape[0]
            print("Video resolution(width x height):", width, "x", height)
            vidObj.release()
            return {
                "type": "video",
                "video": f"{file_path}",
                "fps": 1.0,
            }
        else:
            return None

    def combine(self, inputcount, **kwargs):
        path_list = []
        for c in range(inputcount):
            path = kwargs[f"path_{c + 1}"]
            path = self.convert_path_to_json(path)
            print(path)
            path_list.append(path)
        print(path_list)
        result = path_list
        return (result,)

class ImageLoader:
    @classmethod
    def INPUT_TYPES(s):
        input_dir = folder_paths.get_input_directory()
        files = [
            f
            for f in os.listdir(input_dir)
            if os.path.isfile(os.path.join(input_dir, f))
            and f.split(".")[-1] in ["jpg", "jpeg", "png", "bmp", "tiff", "webp"]
        ]
        return {
            "required": {"image": (sorted(files), {"image_upload": True})},
        }

    CATEGORY = "Comfyui_Qwen3-VL_Adv"
    RETURN_TYPES = ("PATH",)
    FUNCTION = "load_image"

    def load_image(self, image):
        image_path = folder_paths.get_annotated_filepath(image)
        return (image_path,)

    @classmethod
    def IS_CHANGED(s, image):
        image_path = folder_paths.get_annotated_filepath(image)
        m = hashlib.sha256()
        with open(image_path, "rb") as f:
            m.update(f.read())
        return m.digest().hex()

    @classmethod
    def VALIDATE_INPUTS(s, image):
        if not folder_paths.exists_annotated_filepath(image):
            return "Invalid image file: {}".format(image)

        return True

class VideoLoader(ComfyNodeABC):
    @classmethod
    def INPUT_TYPES(cls):
        input_dir = folder_paths.get_input_directory()
        files = [
            f
            for f in os.listdir(input_dir)
            if os.path.isfile(os.path.join(input_dir, f))
        ]
        files = folder_paths.filter_files_content_types(files, ["video"])
        return {
            "required": {"file": (sorted(files), {"video_upload": True, "video_preview": True})},
        }

    CATEGORY = "Comfyui_Qwen3-VL_Adv"
    RETURN_TYPES = ("VIDEO", "PATH")
    RETURN_NAMES = ("VIDEO", "PATH")
    FUNCTION = "load_video"

    def load_video(self, file):
        video_path = folder_paths.get_annotated_filepath(file)
        return (InputImpl.VideoFromFile(video_path), video_path)

    @classmethod
    def IS_CHANGED(cls, file):
        video_path = folder_paths.get_annotated_filepath(file)
        mod_time = os.path.getmtime(video_path)
        return mod_time

    @classmethod
    def VALIDATE_INPUTS(cls, file):
        if not folder_paths.exists_annotated_filepath(file):
            return "Invalid video file: {}".format(file)

        return True