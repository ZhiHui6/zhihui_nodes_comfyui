import os
import json
from aiohttp import web
from server import PromptServer

TRANSLATIONS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preset_translations.json")
PRESETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prompt_preset_flies")

def load_translations():
    if os.path.isfile(TRANSLATIONS_FILE):
        try:
            with open(TRANSLATIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"folders": {}, "files": {}}

def get_all_preset_options():
    if not os.path.isdir(PRESETS_DIR):
        return []
    options = []
    def scan_directory(base_path, prefix=""):
        items = []
        try:
            for item in sorted(os.listdir(base_path)):
                item_path = os.path.join(base_path, item)
                if os.path.isdir(item_path):
                    sub_items = scan_directory(item_path, f"{prefix}{item}/")
                    items.extend(sub_items)
                elif item.endswith('.txt'):
                    file_name = item.replace('.txt', '')
                    items.append(f"{prefix}{file_name}")
        except PermissionError:
            pass
        return items
    options = scan_directory(PRESETS_DIR)
    return options

def get_preset_content(preset_path):
    if '/' not in preset_path:
        return None
    parts = preset_path.rsplit('/', 1)
    if len(parts) == 2:
        folder_path, filename = parts[0], parts[1]
        file_path = os.path.join(PRESETS_DIR, folder_path, filename + '.txt')
        if os.path.isfile(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception:
                return None
    return None

@PromptServer.instance.routes.get("/zhihui/system_prompt/translations")
async def get_preset_translations(request):
    try:
        translations = load_translations()
        return web.json_response(translations)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/zhihui/system_prompt/presets")
async def get_presets(request):
    try:
        presets = get_all_preset_options()
        return web.json_response({"presets": presets})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/zhihui/system_prompt/preview")
async def get_preset_preview(request):
    try:
        preset_path = request.query.get("path", "")
        if not preset_path:
            return web.json_response({"error": "No preset path provided"}, status=400)
        content = get_preset_content(preset_path)
        if content is None:
            return web.json_response({"error": "Preset not found"}, status=404)
        return web.json_response({"content": content, "path": preset_path})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
