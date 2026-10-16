import asyncio
import json
import os
from aiohttp import web
from server import PromptServer

from .lmstudio_node import NO_MODELS_FOUND, refresh_models_now

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

@PromptServer.instance.routes.get("/zhiai/lmstudio/config")
async def get_lmstudio_config(request):
    config = _load_config()
    return web.json_response(config)

@PromptServer.instance.routes.post("/zhiai/lmstudio/config")
async def save_lmstudio_config(request):
    try:
        data = await request.json()
        config = _load_config()
        if "endpoint" in data:
            endpoint = str(data.get("endpoint") or "").strip().rstrip("/")
            if endpoint:
                config["endpoint"] = endpoint
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
        if "last_batch_folder" in data:
            config["last_batch_folder"] = str(data.get("last_batch_folder") or "").strip()
        if _save_config(config):
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "Failed to save config"}, status=500)
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)


@PromptServer.instance.routes.post("/zhiai/lmstudio/refresh_models")
async def refresh_lmstudio_models(request):
    try:
        data = await request.json()
    except Exception:
        data = {}
    if not isinstance(data, dict):
        data = {}

    endpoint = str(data.get("endpoint") or "").strip() or _load_config().get("endpoint", "http://localhost:1234")

    models = await asyncio.to_thread(refresh_models_now, endpoint)
    available = [m for m in models if m and m != NO_MODELS_FOUND]

    if not available:
        return web.json_response(
            {
                "status": "error",
                "endpoint": endpoint,
                "models": [],
                "message": "无法从 LM Studio 获取模型列表",
            },
            status=503,
        )

    return web.json_response({"status": "success", "endpoint": endpoint, "models": available})


def _select_directory_sync():
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        try:
            root.attributes("-topmost", True)
        except Exception:
            pass
        path = filedialog.askdirectory(title="Select folder")
        root.destroy()
        return path or ""
    except Exception as e:
        print(f"[LMStudio] folder picker failed: {e}")
        return ""


@PromptServer.instance.routes.get("/zhiai/lmstudio/select_directory")
async def select_lmstudio_directory(request):
    try:
        loop = asyncio.get_running_loop()
        path = await loop.run_in_executor(None, _select_directory_sync)
        if not path:
            return web.json_response({"path": "", "cancelled": True})
        if not os.path.isdir(path):
            return web.json_response({"path": "", "message": "Invalid directory selected"}, status=400)
        return web.json_response({"path": path})
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)



_FOLDER_SEARCH_SKIP = {
    "windows", "program files", "program files (x86)", "programdata", "appdata",
    "system volume information", "$recycle.bin", "recovery", "perflogs",
    "node_modules", "__pycache__", ".git",
}


def _folder_search_roots():
    roots = []

    def push(path):
        if not path:
            return
        try:
            real = os.path.abspath(os.path.expanduser(str(path).strip()))
        except Exception:
            return
        if os.path.isdir(real) and real not in roots:
            roots.append(real)

    last = _load_config().get("last_batch_folder")
    if isinstance(last, str) and last.strip():
        push(os.path.dirname(os.path.abspath(last.strip())))

    try:
        import folder_paths  # type: ignore

        push(getattr(folder_paths, "base_path", ""))
    except Exception:
        pass

    home = os.path.expanduser("~")
    push(home)
    for sub in ("Desktop", "Documents", "Downloads", "Pictures", "datasets", "dataset"):
        push(os.path.join(home, sub))

    if os.name == "nt":
        for letter in "CDEFGHIJKLMNOPQRSTUVWXYZ":
            push(f"{letter}:\\")

    return roots


def _search_folder_by_name(name, limit=50, max_depth=3, max_visited=20000, budget_seconds=4.0):
    target = str(name or "").strip().lower()
    if not target:
        return [], 0
    import time

    started = time.time()
    scanned = 0
    matches = []

    for root in _folder_search_roots():
        queue = [root]
        depth = 0
        while queue and depth <= max_depth:
            next_level = []
            for current in queue:
                scanned += 1
                if scanned > max_visited or (time.time() - started) > budget_seconds:
                    return matches, scanned
                try:
                    entries = [e for e in os.scandir(current) if e.is_dir(follow_symlinks=False)]
                except Exception:
                    continue
                for entry in entries:
                    if entry.name.startswith(".") or entry.name.lower() in _FOLDER_SEARCH_SKIP:
                        continue
                    if entry.name.lower() == target:
                        matches.append(entry.path)
                        if len(matches) >= limit:
                            return matches, scanned
                    if depth < max_depth:
                        next_level.append(entry.path)
            queue = next_level
            depth += 1

    return matches, scanned


@PromptServer.instance.routes.get("/zhiai/lmstudio/locate_folder")
async def locate_lmstudio_folder(request):
    try:
        name = (request.rel_url.query.get("name") or "").strip()
        if not name:
            return web.json_response({"matches": [], "query": "", "scanned": 0})
        matches, scanned = await asyncio.to_thread(_search_folder_by_name, name)
        return web.json_response({
            "matches": matches,
            "query": name,
            "scanned": scanned,
            "roots": _folder_search_roots(),
        })
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)}, status=500)
