import server
from aiohttp import web
import os
import json
from PIL import Image, ImageOps
import urllib.parse
import io
import torch
import numpy as np
from collections import OrderedDict
import asyncio
from pathlib import Path
import mimetypes

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']
SUPPORTED_TEXT_EXTENSIONS = ['.txt', '.json', '.js']

JS_TEMP_DIR = os.path.join(NODE_DIR, "jsTemp")
if not os.path.exists(JS_TEMP_DIR):
    os.makedirs(JS_TEMP_DIR)

IMAGE_SELECTION_FILE = os.path.join(JS_TEMP_DIR, "selected_image.json")

class LRUCache:
    def __init__(self, max_size=100):
        self.max_size = max_size
        self.cache = OrderedDict()
    
    def get(self, key):
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        return None
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        elif len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        self.cache[key] = value
    
    def clear(self):
        self.cache.clear()

class SecurityValidator:
    @staticmethod
    def is_safe_path(path):
        if not path:
            return False
        if ".." in path or path.startswith("/") and not os.name == 'posix':
            return False
        try:
            resolved_path = os.path.abspath(path)
            return os.path.exists(resolved_path)
        except (OSError, ValueError):
            return False
    
    @staticmethod
    def validate_file_extension(path, allowed_extensions):
        if not path:
            return False
        ext = os.path.splitext(path)[1].lower()
        return ext in allowed_extensions

class FileProcessor:
    def __init__(self, cache):
        self.cache = cache
    
    async def process_image(self, path):
        cache_key = f"image_{path}_{os.path.getmtime(path)}"
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        try:
            loop = asyncio.get_event_loop()
            image_tensor = await loop.run_in_executor(None, self._load_image, path)
            self.cache.put(cache_key, image_tensor)
            return image_tensor
        except Exception as e:
            print(f"LocalFileGallery: Error processing image {path}: {e}")
            default_tensor = torch.zeros(1, 1, 1, 4)
            self.cache.put(cache_key, default_tensor)
            return default_tensor
    
    def _load_image(self, path):
        with Image.open(path) as img:
            if 'A' in img.getbands():
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            
            img_array = np.array(img).astype(np.float32) / 255.0
            return torch.from_numpy(img_array)[None,]
    
    async def process_text(self, path):
        cache_key = f"text_{path}_{os.path.getmtime(path)}"
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        try:
            content = await asyncio.get_event_loop().run_in_executor(None, self._load_text, path)
            self.cache.put(cache_key, content)
            return content
        except Exception as e:
            print(f"LocalFileGallery: Error processing text {path}: {e}")
            error_content = ""
            self.cache.put(cache_key, error_content)
            return error_content
    
    def _load_text(self, path):
        with open(path, 'r', encoding='utf-8') as text_file:
            return text_file.read()

class LocalFileGallery:
    _cache = LRUCache(max_size=100)
    _file_processor = FileProcessor(_cache)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")

    @classmethod
    def INPUT_TYPES(cls): 
        return {"required": {}}
    
    RETURN_TYPES = ("IMAGE", "STRING")
    RETURN_NAMES = ("image_output", "text_content")
    FUNCTION = "get_media_outputs"
    CATEGORY = "zhihui"
    DESCRIPTION = "本地文件画廊节点：用于浏览和选择本地图片和文本文件。支持图片格式：jpg, jpeg, png, bmp, gif, webp；支持文本格式：txt, json, js。选择的图片将输出为IMAGE类型，文本内容将输出为STRING类型。"

    def get_media_outputs(self):
        default_image = torch.zeros(1, 1, 1, 4)
        empty_output = ""
        
        image_output = default_image
        text_output = empty_output

        if os.path.exists(IMAGE_SELECTION_FILE):
            try:
                with open(IMAGE_SELECTION_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    path = data.get("path")
                    file_type = data.get("type", "image")
                    
                    if path and SecurityValidator.is_safe_path(path):
                        if file_type == "image" and SecurityValidator.validate_file_extension(path, SUPPORTED_IMAGE_EXTENSIONS):
                            try:
                                with Image.open(path) as img:
                                    if 'A' in img.getbands():
                                        img = img.convert("RGBA")
                                    else:
                                        img = img.convert("RGB")
                                    
                                    img_array = np.array(img).astype(np.float32) / 255.0
                                    image_output = torch.from_numpy(img_array)[None,]
                            except Exception as e:
                                print(f"LocalFileGallery: Error loading image {path}: {e}")
                                image_output = default_image
                        
                        elif file_type == "text" and SecurityValidator.validate_file_extension(path, SUPPORTED_TEXT_EXTENSIONS):
                            try:
                                with open(path, 'r', encoding='utf-8') as text_file:
                                    text_output = text_file.read()
                            except Exception as e:
                                print(f"LocalFileGallery: Error reading text file {path}: {e}")
                                text_output = ""
                            
            except Exception as e:
                print(f"LocalFileGallery: Error processing file selection: {e}")
        
        return (image_output, text_output)

class APIHandler:
    @staticmethod
    def create_error_response(status, message):
        return web.json_response({"error": message}, status=status)
    
    @staticmethod
    def create_success_response(data=None, message="Success"):
        response_data = {"message": message}
        if data:
            response_data.update(data)
        return web.json_response(response_data)

prompt_server = server.PromptServer.instance

@prompt_server.routes.post("/local_file_gallery/set_image_path")
async def set_image_path(request):
    try:
        data = await request.json()
        path = data.get("path")
        file_type = data.get("type", "image")
        
        if not path:
            return APIHandler.create_error_response(400, "Path is required")
        
        if not SecurityValidator.is_safe_path(path):
            return APIHandler.create_error_response(400, "Invalid or unsafe path")
        
        if not file_type or file_type == "image":
            path_lower = path.lower()
            if SecurityValidator.validate_file_extension(path, SUPPORTED_IMAGE_EXTENSIONS):
                file_type = "image"
            elif SecurityValidator.validate_file_extension(path, SUPPORTED_TEXT_EXTENSIONS):
                file_type = "text"
            else:
                file_type = "other"
        
        selection_data = {"path": path, "type": file_type}
        with open(IMAGE_SELECTION_FILE, 'w', encoding='utf-8') as f:
            json.dump(selection_data, f, ensure_ascii=False, indent=2)
        
        return APIHandler.create_success_response(message="Selection saved successfully")
    except Exception as e:
        print(f"LocalFileGallery: Error saving selection: {e}")
        return APIHandler.create_error_response(500, "Internal server error")

@prompt_server.routes.get("/local_file_gallery/image_info")
async def get_image_info(request):
    try:
        path = request.query.get("path")
        if not path or not SecurityValidator.is_safe_path(path):
            return APIHandler.create_error_response(404, "File not found or invalid path")
        
        if not SecurityValidator.validate_file_extension(path, SUPPORTED_IMAGE_EXTENSIONS):
            return APIHandler.create_error_response(400, "Not an image file")
        
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, _get_image_info_sync, path)
        return web.json_response(info)
    except Exception as e:
        print(f"LocalFileGallery: Error getting image info: {e}")
        return APIHandler.create_error_response(500, "Internal server error")

def _get_image_info_sync(path):
    with Image.open(path) as img:
        width, height = img.size
        mode = img.mode
        
        color_type_map = {
            'RGB': 'RGB', 'RGBA': 'RGBA', 'L': 'Grayscale',
            'LA': 'Grayscale + Alpha', 'P': 'Palette', 'CMYK': 'CMYK',
            'B&W': 'B&W', 'LAB': 'LAB', 'HSV': 'HSV', 'YCbCr': 'YCbCr'
        }
        
        return {
            'width': width,
            'height': height,
            'color_type': color_type_map.get(mode, mode),
            'mode': mode
        }

@prompt_server.routes.get("/local_file_gallery/images")
async def get_local_images(request):
    try:
        directory = request.query.get('directory', '')
        if not directory or not SecurityValidator.is_safe_path(directory) or not os.path.isdir(directory):
            return APIHandler.create_error_response(404, "Directory not found")
        
        params = {
            'show_text': request.query.get('show_text', 'false').lower() == 'true',
            'show_images': request.query.get('show_images', 'true').lower() == 'true',
            'show_videos': request.query.get('show_videos', 'false').lower() == 'true',
            'show_audio': request.query.get('show_audio', 'false').lower() == 'true',
            'display_mode': request.query.get('display_mode', 'manual'),
            'page': int(request.query.get('page', 1)),
            'per_page': int(request.query.get('per_page', 50)),
            'sort_by': request.query.get('sort_by', 'name'),
            'sort_order': request.query.get('sort_order', 'asc')
        }
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _scan_directory, directory, params)
        return web.json_response(result)
    except Exception as e:
        return APIHandler.create_error_response(500, str(e))

def _scan_directory(directory, params):
    def scan_recursive(dir_path):
        files_with_stats = []
        try:
            for root, dirs, files in os.walk(dir_path):
                for file in files:
                    full_path = os.path.join(root, file)
                    try:
                        stats = os.stat(full_path)
                        ext = os.path.splitext(file)[1].lower()
                        relative_path = os.path.relpath(full_path, dir_path)
                        display_name = relative_path if root != dir_path else file
                        
                        if params['show_text'] and ext in SUPPORTED_TEXT_EXTENSIONS:
                            files_with_stats.append({'type': 'text', 'path': full_path, 'name': display_name, 'mtime': stats.st_mtime})
                        elif params['show_images'] and ext in SUPPORTED_IMAGE_EXTENSIONS:
                            files_with_stats.append({'type': 'image', 'path': full_path, 'name': display_name, 'mtime': stats.st_mtime})
                    except (PermissionError, FileNotFoundError):
                        continue
        except (PermissionError, FileNotFoundError):
            pass
        return files_with_stats
    
    dirs, files_with_stats = [], []
    
    if params['display_mode'] == 'auto':
        files_with_stats = scan_recursive(directory)
    else:
        for item in os.listdir(directory):
            full_path = os.path.join(directory, item)
            try:
                stats = os.stat(full_path)
                ext = os.path.splitext(item)[1].lower()
                
                if os.path.isdir(full_path):
                    dirs.append({'type': 'dir', 'path': full_path, 'name': item, 'mtime': stats.st_mtime})
                elif params['show_text'] and ext in SUPPORTED_TEXT_EXTENSIONS:
                    files_with_stats.append({'type': 'text', 'path': full_path, 'name': item, 'mtime': stats.st_mtime})
                elif params['show_images'] and ext in SUPPORTED_IMAGE_EXTENSIONS:
                    files_with_stats.append({'type': 'image', 'path': full_path, 'name': item, 'mtime': stats.st_mtime})
            except (PermissionError, FileNotFoundError):
                continue
    
    reverse_order = params['sort_order'] == 'desc'
    sort_key = 'mtime' if params['sort_by'] == 'date' else 'name'
    dirs.sort(key=lambda x: x[sort_key], reverse=reverse_order)
    files_with_stats.sort(key=lambda x: x[sort_key], reverse=reverse_order)
    all_items = dirs + files_with_stats
    
    parent_directory = os.path.dirname(directory)
    if parent_directory == directory:
        parent_directory = None
    
    start = (params['page'] - 1) * params['per_page']
    end = start + params['per_page']
    paginated_items = all_items[start:end]
    
    return {
        "items": paginated_items,
        "total_pages": (len(all_items) + params['per_page'] - 1) // params['per_page'],
        "current_page": params['page'],
        "current_directory": directory,
        "parent_directory": parent_directory
    }

@prompt_server.routes.get("/local_file_gallery/get_folder_tree")
async def get_folder_tree(request):
    try:
        path = request.query.get('path', '')
        if not path:
            import platform
            if platform.system() == 'Windows':
                import string
                drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\")]
                folders = [{'name': drive, 'path': drive, 'type': 'drive'} for drive in drives]
            else:
                folders = [{'name': '/', 'path': '/', 'type': 'root'}]
            return web.json_response({"folders": folders, "current_path": ""})
        
        if not SecurityValidator.is_safe_path(path) or not os.path.isdir(path):
            return APIHandler.create_error_response(404, "Path not found or not a directory")
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _get_folder_tree_sync, path)
        return web.json_response(result)
    except Exception as e:
        return APIHandler.create_error_response(500, str(e))

def _get_folder_tree_sync(path):
    folders = []
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            try:
                os.listdir(item_path)
                folders.append({
                    'name': item,
                    'path': item_path,
                    'type': 'folder'
                })
            except (PermissionError, OSError):
                continue
    
    folders.sort(key=lambda x: x['name'].lower())
    return {
        "folders": folders,
        "current_path": path,
        "parent_path": os.path.dirname(path) if os.path.dirname(path) != path else None
    }

@prompt_server.routes.get("/local_file_gallery/get_path_segments")
async def get_path_segments(request):
    try:
        path = request.query.get('path', '')
        if not path:
            return web.json_response({"segments": []})
        
        if not SecurityValidator.is_safe_path(path):
            return APIHandler.create_error_response(400, "Invalid path")
        
        segments = []
        import platform
        if platform.system() == 'Windows':
            parts = path.replace('/', '\\').split('\\')
            if parts[0].endswith(':'):
                segments.append({
                    'name': parts[0] + '\\',
                    'path': parts[0] + '\\'
                })
                current_build = parts[0] + '\\'
                for part in parts[1:]:
                    if part:
                        current_build = os.path.join(current_build, part)
                        segments.append({
                            'name': part,
                            'path': current_build
                        })
        else:
            parts = path.split('/')
            if path.startswith('/'):
                segments.append({
                    'name': '/',
                    'path': '/'
                })
                current_build = '/'
                for part in parts[1:]:
                    if part:
                        current_build = os.path.join(current_build, part)
                        segments.append({
                            'name': part,
                            'path': current_build
                        })
        
        return web.json_response({"segments": segments})
    except Exception as e:
        return APIHandler.create_error_response(500, str(e))

@prompt_server.routes.get("/local_file_gallery/thumbnail")
async def get_thumbnail(request):
    try:
        filepath = request.query.get('filepath')
        if not filepath or not SecurityValidator.is_safe_path(filepath):
            return web.Response(status=400)
        
        filepath = urllib.parse.unquote(filepath)
        if not os.path.exists(filepath):
            return web.Response(status=404)
        
        loop = asyncio.get_event_loop()
        thumbnail_data = await loop.run_in_executor(None, _generate_thumbnail, filepath)
        
        if thumbnail_data is None:
            return web.Response(status=500)
        
        return web.Response(body=thumbnail_data['data'], content_type=thumbnail_data['content_type'])
    except Exception as e:
        print(f"LocalFileGallery: Error generating thumbnail for {filepath}: {e}")
        return web.Response(status=500)

def _generate_thumbnail(filepath):
    try:
        with Image.open(filepath) as img:
            has_alpha = img.mode == 'RGBA' or (img.mode == 'P' and 'transparency' in img.info)
            img = img.convert("RGBA") if has_alpha else img.convert("RGB")
            img.thumbnail([320, 320], Image.LANCZOS)
            
            buffer = io.BytesIO()
            format_type, content_type = ('PNG', 'image/png') if has_alpha else ('JPEG', 'image/jpeg')
            img.save(buffer, format=format_type, quality=90 if format_type == 'JPEG' else None)
            buffer.seek(0)
            
            return {
                'data': buffer.read(),
                'content_type': content_type
            }
    except Exception:
        return None

@prompt_server.routes.get("/local_file_gallery/view")
async def view_image(request):
    try:
        filepath = request.query.get('filepath')
        if not filepath or not SecurityValidator.is_safe_path(filepath):
            return web.Response(status=400)
        
        filepath = urllib.parse.unquote(filepath)
        if not os.path.exists(filepath):
            return web.Response(status=404)
        
        return web.FileResponse(filepath)
    except Exception:
        return web.Response(status=500)

WEB_DIRECTORY = "./web"