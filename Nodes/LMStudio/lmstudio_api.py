import json
import os
import uuid
import time
from aiohttp import web
from server import PromptServer

CONFIG_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.path.join(CONFIG_DIR, "lmstudio_config.json")
TEMPLATES_FILE = os.path.join(CONFIG_DIR, "lmstudio_system_prompt_templates.json")

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
        if "prompt_version" in data:
            config["prompt_version"] = data["prompt_version"]
        if "show_log_panel" in data:
            config["show_log_panel"] = data["show_log_panel"]
        if "folder_read_mode" in data:
            config["folder_read_mode"] = data["folder_read_mode"]
        if _save_config(config):
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "Failed to save config"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)


def _load_templates():
    if os.path.exists(TEMPLATES_FILE):
        try:
            with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("templates", [])
        except Exception:
            pass
    return []


def _save_templates(templates):
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(TEMPLATES_FILE, 'w', encoding='utf-8') as f:
            json.dump({"templates": templates}, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False


@PromptServer.instance.routes.get("/zhihui/lmstudio/templates")
async def get_templates(request):
    templates = _load_templates()
    return web.json_response({"templates": templates})


@PromptServer.instance.routes.post("/zhihui/lmstudio/templates")
async def create_template(request):
    try:
        data = await request.json()
        name = data.get("name", "").strip()
        content = data.get("content", "").strip()
        
        if not name:
            return web.json_response({"status": "error", "message": "Template name is required"}, status=400)
        
        templates = _load_templates()
        
        new_template = {
            "id": str(uuid.uuid4()),
            "name": name,
            "content": content,
            "created_at": int(time.time()),
            "updated_at": int(time.time())
        }
        
        templates.append(new_template)
        
        if _save_templates(templates):
            return web.json_response({"status": "success", "template": new_template})
        else:
            return web.json_response({"status": "error", "message": "Failed to save template"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)


@PromptServer.instance.routes.put("/zhihui/lmstudio/templates/{template_id}")
async def update_template(request):
    try:
        template_id = request.match_info.get("template_id")
        data = await request.json()
        name = data.get("name", "").strip()
        content = data.get("content", "").strip()
        
        if not name:
            return web.json_response({"status": "error", "message": "Template name is required"}, status=400)
        
        templates = _load_templates()
        
        for i, template in enumerate(templates):
            if template["id"] == template_id:
                templates[i]["name"] = name
                templates[i]["content"] = content
                templates[i]["updated_at"] = int(time.time())
                
                if _save_templates(templates):
                    return web.json_response({"status": "success", "template": templates[i]})
                else:
                    return web.json_response({"status": "error", "message": "Failed to save template"}, status=500)
        
        return web.json_response({"status": "error", "message": "Template not found"}, status=404)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)


@PromptServer.instance.routes.delete("/zhihui/lmstudio/templates/{template_id}")
async def delete_template(request):
    try:
        template_id = request.match_info.get("template_id")
        templates = _load_templates()
        
        new_templates = [t for t in templates if t["id"] != template_id]
        
        if len(new_templates) == len(templates):
            return web.json_response({"status": "error", "message": "Template not found"}, status=404)
        
        if _save_templates(new_templates):
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "Failed to save templates"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)
