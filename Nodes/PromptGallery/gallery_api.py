import os
import json
import asyncio
from aiohttp import web
from server import PromptServer
import mimetypes
from PIL import Image
import io

_DEFAULT_SETTINGS = {
    "rememberPath": True,
    "useWindowsPicker": False,
    "lastDir": ""
}

def _settings_file_path():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, "PromptGallerySettings.json")

def _read_settings():
    path = _settings_file_path()
    settings = dict(_DEFAULT_SETTINGS)
    if not os.path.isfile(path):
        return settings
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            if isinstance(data.get("rememberPath"), bool):
                settings["rememberPath"] = data["rememberPath"]
            if isinstance(data.get("useWindowsPicker"), bool):
                settings["useWindowsPicker"] = data["useWindowsPicker"]
            if isinstance(data.get("lastDir"), str):
                settings["lastDir"] = data["lastDir"]
    except Exception:
        return settings
    return settings

def _write_settings(settings):
    path = _settings_file_path()
    base_dir = os.path.dirname(path)
    os.makedirs(base_dir, exist_ok=True)
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)

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
        path = filedialog.askdirectory()
        root.destroy()
        return path or ""
    except Exception:
        return ""

@PromptServer.instance.routes.get("/zhihui/gallery/list_files")
async def list_gallery_files(request):
    try:
        dir_path = request.rel_url.query.get("path", "")
        if not dir_path or not os.path.isdir(dir_path):
            return web.json_response({"files": [], "error": "Invalid directory path"})

        image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}
        files_data = []

        for filename in os.listdir(dir_path):
            file_path = os.path.join(dir_path, filename)
            if not os.path.isfile(file_path):
                continue

            name, ext = os.path.splitext(filename)
            if ext.lower() in image_extensions:
                txt_filename = name + ".txt"
                txt_path = os.path.join(dir_path, txt_filename)
                has_text = os.path.isfile(txt_path)
                
                files_data.append({
                    "filename": filename,
                    "has_text": has_text,
                    "txt_filename": txt_filename if has_text else None
                })

        return web.json_response({"files": files_data})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/zhihui/gallery/style.css")
async def zhihui_gallery_style(request):
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        css_path = os.path.join(base_dir, "PromptGallery.css")
        if not os.path.isfile(css_path):
            return web.Response(status=404, text="Not found")
        with open(css_path, "r", encoding="utf-8") as f:
            content = f.read()
        return web.Response(text=content, content_type="text/css")
    except Exception as e:
        return web.Response(status=500, text=str(e))

@PromptServer.instance.routes.get("/zhihui/gallery/view_image")
async def view_gallery_image(request):
    try:
        dir_path = request.rel_url.query.get("path", "")
        filename = request.rel_url.query.get("filename", "")
        thumbnail = request.rel_url.query.get("thumbnail", "false") == "true"
        
        if not dir_path or not filename:
            return web.Response(status=400)

        file_path = os.path.join(dir_path, filename)
        
        if os.path.dirname(os.path.abspath(file_path)) != os.path.abspath(dir_path):
             return web.Response(status=403)

        if not os.path.isfile(file_path):
            return web.Response(status=404)

        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'

        if thumbnail:
            try:
                img = Image.open(file_path)
                if img.mode in ('RGBA', 'LA') and mime_type == 'image/jpeg':
                    img = img.convert('RGB')
                
                img.thumbnail((256, 256))
                
                buffer = io.BytesIO()
                save_format = 'JPEG' if mime_type == 'image/jpeg' else 'PNG'
                if mime_type == 'image/webp': save_format = 'WEBP'
                
                img.save(buffer, format=save_format)
                content = buffer.getvalue()
                
                return web.Response(body=content, content_type=mime_type)
            except Exception as e:
                print(f"Error creating thumbnail for {filename}: {e}")
                pass

        with open(file_path, 'rb') as f:
            content = f.read()

        return web.Response(body=content, content_type=mime_type)
    except Exception as e:
        return web.Response(status=500, text=str(e))

@PromptServer.instance.routes.get("/zhihui/gallery/select_directory")
async def select_gallery_directory(request):
    try:
        loop = asyncio.get_running_loop()
        path = await loop.run_in_executor(None, _select_directory_sync)
        if not path:
            return web.json_response({"error": "No directory selected"}, status=400)
        if not os.path.isdir(path):
            return web.json_response({"error": "Invalid directory selected"}, status=400)
        return web.json_response({"path": path})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/zhihui/gallery/settings")
async def get_gallery_settings(request):
    try:
        return web.json_response(_read_settings())
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/zhihui/gallery/settings")
async def set_gallery_settings(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON"}, status=400)

    current = _read_settings()
    if isinstance(body, dict):
        if isinstance(body.get("rememberPath"), bool):
            current["rememberPath"] = body["rememberPath"]
        if isinstance(body.get("useWindowsPicker"), bool):
            current["useWindowsPicker"] = body["useWindowsPicker"]
        if isinstance(body.get("lastDir"), str):
            current["lastDir"] = body["lastDir"]

    try:
        _write_settings(current)
        return web.json_response(current)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
