try:
    from comfy_extras.nodes_video import save_video_preview
except Exception:
    save_video_preview = None


class VideoPreview:
    CATEGORY = "Zhi.AI/Video"
    FUNCTION = "preview"
    OUTPUT_NODE = True
    RETURN_TYPES = ("VIDEO",)
    RETURN_NAMES = ("VIDEO",)
    DESCRIPTION = (
        "Preview an upstream video on the node without saving it to the output folder. "
        "The clip is remuxed losslessly into the temp directory and reused across runs; no frame decoding."
    )

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "video": ("VIDEO",),
            },
        }

    def preview(self, video):
        if video is None:
            return (video,)
        if save_video_preview is None:
            raise ValueError(
                "Video Preview: comfy_extras.nodes_video.save_video_preview is unavailable; "
                "requires ComfyUI 0.37 or newer."
            )
        return {"result": (video,), "ui": save_video_preview(video).as_dict()}
