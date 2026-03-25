import json
import os
from aiohttp import web
from server import PromptServer

CONFIG_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.path.join(CONFIG_DIR, "lmstudio_config.json")

def _load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_config(config):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False

@PromptServer.instance.routes.get("/zhihui/lmstudio/config")
async def get_lmstudio_config(request):
    config = _load_config()
    return web.json_response(config)

@PromptServer.instance.routes.post("/zhihui/lmstudio/config")
async def save_lmstudio_config(request):
    try:
        data = await request.json()
        config = _load_config()
        if "timeouts" in data:
            config["timeouts"] = data["timeouts"]
        if "preset" in data:
            config["preset"] = data["preset"]
        if _save_config(config):
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "Failed to save config"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)
