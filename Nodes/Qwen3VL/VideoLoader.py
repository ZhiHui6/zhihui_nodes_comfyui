import os
import folder_paths
from comfy.comfy_types import IO, ComfyNodeABC
from comfy_api.latest import InputImpl

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

    CATEGORY = "Zhi.AI/Qwen3VL"
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
            return "无效的视频文件: {}".format(file)

        return True