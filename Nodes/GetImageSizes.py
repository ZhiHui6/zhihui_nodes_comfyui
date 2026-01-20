class GetImageSizes:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
            }
        }

    RETURN_TYPES = ("INT", "INT")
    RETURN_NAMES = ("width", "height")
    FUNCTION = "get_size"
    CATEGORY = "Zhi.AI/Image"
    DESCRIPTION = "Get Image Sizes: Extract width/height from input image and show a live size preview on the node."

    def get_size(self, image):
        try:
            _, h, w, _ = image.shape
            w = int(w)
            h = int(h)
        except Exception:
            try:
                h = int(image.shape[1])
                w = int(image.shape[2])
            except Exception:
                w, h = 0, 0

        text = f"宽度: {w} , 高度: {h}\nWidth: {w} , Height: {h}"

        return {
            "ui": {
                "img_width": [w],
                "img_height": [h],
                "text": [text],
            },
            "result": (w, h),
        }