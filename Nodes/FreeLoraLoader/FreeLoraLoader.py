import server
from aiohttp import web
import os
import json
import torch
import folder_paths
import comfy.utils
import comfy.model_management
from pathlib import Path
import urllib.parse
import asyncio
from collections import OrderedDict

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
SUPPORTED_LORA_EXTENSIONS = ['.safetensors', '.ckpt', '.pt', '.pth', '.bin']

LORA_SELECTION_FILE = os.path.join(NODE_DIR, "selected_lora.json")

class LoraCache:
    """LORA模型缓存管理"""
    def __init__(self, max_size=50):
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
    """安全验证器"""
    @staticmethod
    def is_safe_path(path):
        if not path:
            return False
        try:
            resolved_path = os.path.abspath(path)
            return os.path.exists(resolved_path)
        except (OSError, ValueError):
            return False
    
    @staticmethod
    def validate_lora_file(path):
        if not path:
            return False
        ext = os.path.splitext(path)[1].lower()
        return ext in SUPPORTED_LORA_EXTENSIONS and os.path.isfile(path)

class LoraProcessor:
    """LORA处理器"""
    def __init__(self, cache):
        self.cache = cache
    
    async def load_lora_info(self, path):
        """加载LORA信息"""
        cache_key = f"lora_info_{path}_{os.path.getmtime(path)}"
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        try:
            loop = asyncio.get_event_loop()
            lora_info = await loop.run_in_executor(None, self._get_lora_info, path)
            self.cache.put(cache_key, lora_info)
            return lora_info
        except Exception as e:
            print(f"FreeLoraLoader: Error loading LORA info {path}: {e}")
            return None
    
    def _get_lora_info(self, path):
        """获取LORA文件信息"""
        try:
            file_size = os.path.getsize(path)
            file_size_mb = round(file_size / (1024 * 1024), 2)
            
            # 尝试加载LORA以获取更多信息
            try:
                lora = comfy.utils.load_torch_file(path, safe_load=True)
                keys = list(lora.keys()) if isinstance(lora, dict) else []
                model_type = self._detect_lora_type(keys)
            except:
                keys = []
                model_type = "Unknown"
            
            return {
                "path": path,
                "filename": os.path.basename(path),
                "size_mb": file_size_mb,
                "model_type": model_type,
                "key_count": len(keys),
                "extension": os.path.splitext(path)[1].lower()
            }
        except Exception as e:
            print(f"Error getting LORA info: {e}")
            return None
    
    def _detect_lora_type(self, keys):
        """检测LORA类型"""
        if not keys:
            return "Unknown"
        
        # 检查是否为LoRA
        if any("lora_up" in key or "lora_down" in key for key in keys):
            return "LoRA"
        
        # 检查是否为LyCORIS
        if any("lokr" in key or "hada" in key for key in keys):
            return "LyCORIS"
        
        # 检查是否为Textual Inversion
        if any("string_to_param" in key for key in keys):
            return "Textual Inversion"
        
        return "LoRA/Adapter"

class FreeLoraLoader:
    """自由LORA加载器节点"""
    _cache = LoraCache(max_size=50)
    _processor = LoraProcessor(_cache)
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": ("MODEL",),
                "strength_model": ("FLOAT", {"default": 1.0, "min": -20.0, "max": 20.0, "step": 0.01}),
            }
        }
    
    RETURN_TYPES = ("MODEL",)
    RETURN_NAMES = ("model",)
    FUNCTION = "load_lora"
    CATEGORY = "Zhi.AI/Loaders"
    DESCRIPTION = "自由LORA加载器：可以加载任意路径的LORA模型文件，支持跨路径访问和可视化文件浏览。"
    
    def load_lora(self, model, strength_model):
        """加载LORA模型"""
        # 从选择文件中读取LORA路径
        lora_name = ""
        try:
            if os.path.exists(LORA_SELECTION_FILE):
                with open(LORA_SELECTION_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    lora_name = data.get("selected_path", "")
        except Exception as e:
            print(f"FreeLoraLoader: Error reading selection file: {e}")
        
        if not lora_name or not os.path.exists(lora_name):
            return (model,)
        
        if not SecurityValidator.validate_lora_file(lora_name):
            return (model,)
        
        try:
            # 加载LORA
            lora = comfy.utils.load_torch_file(lora_name, safe_load=True)
            
            # 只应用LORA到模型，不处理CLIP
            model_lora, _ = comfy.sd.load_lora_for_models(
                model, None, lora, strength_model, 0.0
            )
            
            return (model_lora,)
            
        except Exception as e:
            error_msg = f"加载LORA失败: {str(e)}"
            print(f"FreeLoraLoader Error: {error_msg}")
            return (model,)

# API处理器
class APIHandler:
    @staticmethod
    def create_error_response(status, message):
        return web.json_response({"error": message}, status=status)
    
    @staticmethod
    def create_success_response(data=None, message="Success"):
        response = {"success": True, "message": message}
        if data is not None:
            response["data"] = data
        return web.json_response(response)

# 获取服务器实例
prompt_server = server.PromptServer.instance

@prompt_server.routes.post("/free_lora_loader/set_lora_path")
async def set_lora_path(request):
    """设置选中的LORA路径"""
    try:
        data = await request.json()
        lora_path = data.get("path", "")
        
        if not SecurityValidator.is_safe_path(lora_path):
            return APIHandler.create_error_response(400, "Invalid path")
        
        if not SecurityValidator.validate_lora_file(lora_path):
            return APIHandler.create_error_response(400, "Invalid LORA file")
        
        # 保存选中的路径
        with open(LORA_SELECTION_FILE, 'w', encoding='utf-8') as f:
            json.dump({"selected_path": lora_path}, f, ensure_ascii=False, indent=2)
        
        return APIHandler.create_success_response({"path": lora_path})
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Server error: {str(e)}")

@prompt_server.routes.get("/free_lora_loader/get_lora_info")
async def get_lora_info(request):
    """获取LORA文件信息"""
    try:
        path = request.query.get("path", "")
        
        if not SecurityValidator.validate_lora_file(path):
            return APIHandler.create_error_response(400, "Invalid LORA file")
        
        lora_info = await FreeLoraLoader._processor.load_lora_info(path)
        
        if lora_info is None:
            return APIHandler.create_error_response(500, "Failed to load LORA info")
        
        return APIHandler.create_success_response(lora_info)
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Server error: {str(e)}")

@prompt_server.routes.get("/free_lora_loader/browse_directory")
async def browse_directory(request):
    """浏览目录中的LORA文件"""
    try:
        directory = request.query.get("path", "")
        
        if not SecurityValidator.is_safe_path(directory):
            return APIHandler.create_error_response(400, "Invalid directory path")
        
        if not os.path.isdir(directory):
            return APIHandler.create_error_response(400, "Path is not a directory")
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _scan_lora_directory, directory)
        
        return APIHandler.create_success_response(result)
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Server error: {str(e)}")

def _scan_lora_directory(directory):
    """扫描目录中的LORA文件"""
    try:
        items = []
        
        # 添加上级目录
        parent_dir = os.path.dirname(directory)
        if parent_dir != directory:  # 不是根目录
            items.append({
                "name": "..",
                "path": parent_dir,
                "type": "directory",
                "is_parent": True
            })
        
        # 扫描当前目录
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            
            if os.path.isdir(item_path):
                items.append({
                    "name": item,
                    "path": item_path,
                    "type": "directory",
                    "is_parent": False
                })
            elif SecurityValidator.validate_lora_file(item_path):
                file_size = os.path.getsize(item_path)
                items.append({
                    "name": item,
                    "path": item_path,
                    "type": "lora",
                    "size": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2),
                    "extension": os.path.splitext(item)[1].lower()
                })
        
        # 排序：目录在前，然后按名称排序
        items.sort(key=lambda x: (x["type"] != "directory", x["name"].lower()))
        
        return {
            "current_path": directory,
            "items": items,
            "total_loras": len([item for item in items if item["type"] == "lora"])
        }
        
    except Exception as e:
        print(f"Error scanning directory: {e}")
        return {"current_path": directory, "items": [], "total_loras": 0}

@prompt_server.routes.get("/free_lora_loader/get_drives")
async def get_drives(request):
    """获取系统驱动器列表（Windows）"""
    try:
        drives = []
        
        if os.name == 'nt':  # Windows
            import string
            for letter in string.ascii_uppercase:
                drive = f"{letter}:\\"
                if os.path.exists(drive):
                    drives.append({
                        "name": f"{letter}:",
                        "path": drive,
                        "type": "drive"
                    })
        else:  # Unix-like
            drives.append({
                "name": "Root",
                "path": "/",
                "type": "drive"
            })
        
        return APIHandler.create_success_response(drives)
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Server error: {str(e)}")

@prompt_server.routes.get("/free_lora_loader/get_path_segments")
async def get_path_segments(request):
    """获取路径分段"""
    try:
        path = request.query.get("path", "")
        
        if not path:
            return APIHandler.create_success_response([])
        
        segments = []
        current_path = ""
        
        if os.name == 'nt':  # Windows
            parts = path.replace('/', '\\').split('\\')
            for i, part in enumerate(parts):
                if i == 0 and ':' in part:  # 驱动器
                    current_path = part + '\\'
                    segments.append({
                        "name": part,
                        "path": current_path
                    })
                elif part:
                    current_path = os.path.join(current_path, part)
                    segments.append({
                        "name": part,
                        "path": current_path
                    })
        else:  # Unix-like
            parts = path.split('/')
            for part in parts:
                if part:
                    current_path = os.path.join(current_path, part)
                    segments.append({
                        "name": part,
                        "path": current_path
                    })
        
        return APIHandler.create_success_response(segments)
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Server error: {str(e)}")

@prompt_server.routes.get("/zhihui_nodes/scan_drive_lora")
async def scan_drive_lora(request):
    """扫描整个驱动器中的LORA文件（性能警告：可能需要较长时间）"""
    try:
        drive_path = request.query.get("path", "")
        
        if not drive_path:
            return APIHandler.create_error_response(400, "Drive path is required")
        
        if not SecurityValidator.is_safe_path(drive_path):
            return APIHandler.create_error_response(400, "Invalid drive path")
        
        # 检查是否为驱动器根目录
        if not (len(drive_path) <= 3 and drive_path.endswith((':\\', ':/'))):
            return APIHandler.create_error_response(400, "Path must be a drive root (e.g., C:\\)")
        
        if not os.path.exists(drive_path):
            return APIHandler.create_error_response(404, "Drive not found")
        
        # 执行深度扫描
        lora_files = []
        total_scanned = 0
        
        def scan_recursive(directory):
            nonlocal total_scanned
            try:
                for root, dirs, files in os.walk(directory):
                    total_scanned += len(files)
                    
                    # 跳过系统目录和隐藏目录
                    dirs[:] = [d for d in dirs if not d.startswith('.') and 
                              d.lower() not in ['system volume information', '$recycle.bin', 'windows', 'program files', 'program files (x86)']]
                    
                    for file in files:
                        if any(file.lower().endswith(ext) for ext in SUPPORTED_LORA_EXTENSIONS):
                            file_path = os.path.join(root, file)
                            try:
                                stat = os.stat(file_path)
                                lora_files.append({
                                    "name": file,
                                    "path": file_path,
                                    "size": stat.st_size,
                                    "modified": stat.st_mtime,
                                    "type": "lora",
                                    "directory": root
                                })
                            except (OSError, IOError):
                                continue  # 跳过无法访问的文件
                    
                    # 限制结果数量以避免内存问题
                    if len(lora_files) > 10000:
                        break
                        
            except (PermissionError, OSError):
                pass  # 跳过无权限访问的目录
        
        # 开始扫描
        scan_recursive(drive_path)
        
        # 按文件名排序
        lora_files.sort(key=lambda x: x["name"].lower())
        
        return APIHandler.create_success_response({
            "items": lora_files,
            "total_loras": len(lora_files),
            "total_scanned": total_scanned,
            "current_path": drive_path,
            "scan_type": "drive_scan"
        })
        
    except Exception as e:
        return APIHandler.create_error_response(500, f"Scan error: {str(e)}")

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "web")