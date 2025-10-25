import cv2

class MultiplePathsInput:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "inputcount": ("INT", {"default": 1, "min": 1, "max": 1000, "step": 1}),
                "path_1": ("PATH",),
            },
            "optional": {}
        }

    RETURN_TYPES = ("PATH",)
    RETURN_NAMES = ("paths",)
    FUNCTION = "combine"
    CATEGORY = "Comfyui_Qwen3-VL_Adv"

    @staticmethod
    def convert_path_to_json(file_path):
        if not file_path or file_path.strip() == "":
            return None
            
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
            path_key = f"path_{c + 1}"
            if path_key in kwargs:
                path = kwargs[path_key]
                if path and path.strip() != "":
                    converted_path = self.convert_path_to_json(path)
                    if converted_path:
                        print(converted_path)
                        path_list.append(converted_path)
        print(path_list)
        result = path_list
        return (result,)