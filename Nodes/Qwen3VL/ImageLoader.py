import hashlib
import os
import folder_paths

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