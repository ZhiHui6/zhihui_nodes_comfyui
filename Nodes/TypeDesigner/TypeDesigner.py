import os
import json
from server import PromptServer
from aiohttp import web

current_path = os.path.dirname(os.path.abspath(__file__))
styles_path = os.path.join(current_path, "styles.json")
images_dir = os.path.join(current_path, "Preview_images")

class TypeDesigner:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text": ("STRING", {"multiline": True}),
            },
            "hidden": {
                "prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt_text",)
    FUNCTION = "process"
    CATEGORY = "Type Designer"

    def process(self, text, prompt=None, extra_pnginfo=None):
        return (text,)

@PromptServer.instance.routes.get("/zhihui/typedesigner/styles")
async def get_styles(request):
    if os.path.exists(styles_path):
        try:
            with open(styles_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return web.json_response(data)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)
    return web.json_response({"error": "styles.json not found"}, status=404)

image_map = {}

def build_image_map():
    global image_map
    image_map = {}

    if not os.path.exists(images_dir):
        return

    for root, dirs, files in os.walk(images_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.png', '.jpeg')):
                name = os.path.splitext(file)[0]
                key = name.replace("风格预览", "")

                if key.endswith("-001"):
                    key = key[:-4] + "1"
                elif key.endswith("-002"):
                    key = key[:-4] + "2"
                elif key.endswith("-003"):
                    key = key[:-4] + "3"

                full_path = os.path.join(root, file)
                image_map[key] = full_path
                image_map[name] = full_path

build_image_map()

@PromptServer.instance.routes.get("/zhihui/typedesigner/images")
async def get_image(request):
    style = request.query.get("style")
    if not style:
        return web.Response(status=400, text="Missing style parameter")
    
    image_path = image_map.get(style)
    if not image_path:
        build_image_map()
        image_path = image_map.get(style)
    
    if image_path and os.path.exists(image_path):
        return web.FileResponse(image_path)
    
    return web.Response(status=404, text="Image not found")