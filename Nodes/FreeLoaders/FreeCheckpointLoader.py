import os
import sys
import logging
import json
import glob
from typing import List, Dict, Any, Optional

comfyui_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if comfyui_root not in sys.path:
    sys.path.append(comfyui_root)

import folder_paths
import comfy.utils

class FreeCheckpointLoader:
    custom_checkpoint_paths: Dict[str, List[str]] = {}
    custom_model_lists: Dict[str, List[str]] = {}
    
    @classmethod
    def INPUT_TYPES(s):
        def _as_is(name: str) -> str:
            try:
                return str(name)
            except Exception:
                return name

        def _load_persisted_models() -> List[str]:
            try:
                loader_dir = os.path.dirname(os.path.abspath(__file__))
                saved_paths_file = os.path.join(loader_dir, "free_checkpoint_loader_paths.json")
                if not os.path.exists(saved_paths_file):
                    return []
                with open(saved_paths_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                paths: List[str] = []
                if isinstance(data, dict):
                    raw_paths = data.get('paths') or []
                    if isinstance(raw_paths, list):
                        paths.extend([p for p in raw_paths if isinstance(p, str)])
                checkpoint_extensions = ['.safetensors', '.ckpt', '.pt', '.pth']
                model_set = set()
                for p in set(paths):
                    if p and os.path.exists(p) and os.path.isdir(p):
                        try:
                            for file in os.listdir(p):
                                file_path = os.path.join(p, file)
                                if os.path.isfile(file_path):
                                    ext = os.path.splitext(file)[1].lower()
                                    if ext in checkpoint_extensions:
                                        model_set.add(file)
                        except Exception:
                            pass
                return sorted(model_set)
            except Exception:
                return []

        persisted_models = [_as_is(x) for x in _load_persisted_models()]

        cached_models = []
        try:
            if hasattr(FreeCheckpointLoader, 'custom_model_lists'):
                for models in FreeCheckpointLoader.custom_model_lists.values():
                    for m in (models or []):
                        if isinstance(m, str):
                            cached_models.append(_as_is(m))
        except Exception:
            pass

        allowed = sorted(set(persisted_models + cached_models))
        
        return {
            "required": {
                "ckpt_name": (allowed, {"tooltip": "The name of the checkpoint (model) to load."}),
            }
        }
    
    RETURN_TYPES = ("MODEL", "CLIP", "VAE")
    FUNCTION = "load_checkpoint"
    CATEGORY = "Zhi.AI/Loaders"
    DESCRIPTION = "Loads a diffusion model checkpoint with custom path support via web UI."

    def load_checkpoint(self, ckpt_name):
        import comfy.sd
        
        ckpt_path = self._get_checkpoint_path(ckpt_name)
        
        if not ckpt_path:
            def _resolve_default_filename(name: str) -> Optional[str]:
                try:
                    default_files = folder_paths.get_filename_list("checkpoints")
                    if name in default_files:
                        return name
                    base = os.path.splitext(name)[0]
                    for f in default_files:
                        if os.path.splitext(f)[0] == base:
                            return f
                except Exception:
                    pass
                return None

            resolved = _resolve_default_filename(ckpt_name)
            if resolved:
                ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", resolved)
            else:
                ckpt_path = folder_paths.get_full_path_or_raise("checkpoints", ckpt_name)
        
        out = comfy.sd.load_checkpoint_guess_config(ckpt_path, output_vae=True, output_clip=True, embedding_directory=folder_paths.get_folder_paths("embeddings"))
        return (out[0], out[1], out[2])
    
    def _get_checkpoint_path(self, ckpt_name: str) -> Optional[str]:
        
        node_id = getattr(self, 'id', None)
        
        def _search_in_paths(paths: List[str]) -> Optional[str]:
            for custom_path in paths or []:
                if custom_path and os.path.exists(custom_path):
                    for ext in ['.safetensors', '.ckpt', '.pt', '.pth']:
                        full_path = os.path.join(custom_path, ckpt_name + ext)
                        if os.path.isfile(full_path):
                            return full_path
                        full_path2 = os.path.join(custom_path, ckpt_name)
                        if os.path.isfile(full_path2):
                            return full_path2
            return None

        if node_id and node_id in self.custom_checkpoint_paths:
            found = _search_in_paths(self.custom_checkpoint_paths.get(node_id) or [])
            if found:
                return found

        try:
            loader_dir = os.path.dirname(os.path.abspath(__file__))
            saved_paths_file = os.path.join(loader_dir, "free_checkpoint_loader_paths.json")
            if os.path.exists(saved_paths_file):
                with open(saved_paths_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                paths: List[str] = []
                if isinstance(data, dict):
                    raw_paths = data.get('paths') or []
                    if isinstance(raw_paths, list):
                        paths.extend([p for p in raw_paths if isinstance(p, str)])
                found = _search_in_paths(paths)
                if found:
                    return found
        except Exception:
            pass
        
        return None
    
    @classmethod
    def scan_checkpoint_path(cls, path: str, node_id: str) -> Dict[str, Any]:
        try:
            if not path or not os.path.exists(path):
                return {
                    "success": False,
                    "error": "路径不存在 / Path does not exist",
                    "model_count": 0,
                    "models": []
                }
            
            if not os.path.isdir(path):
                return {
                    "success": False,
                    "error": "路径不是目录 / Path is not a directory",
                    "model_count": 0,
                    "models": []
                }
            
            checkpoint_extensions = ['.safetensors', '.ckpt']
            existing = cls.custom_checkpoint_paths.get(node_id, [])
            if path not in existing:
                existing.append(path)
            cls.custom_checkpoint_paths[node_id] = existing

            model_set = set()
            for p in existing:
                if p and os.path.exists(p) and os.path.isdir(p):
                    try:
                        for file in os.listdir(p):
                            file_path = os.path.join(p, file)
                            if os.path.isfile(file_path):
                                file_ext = os.path.splitext(file)[1].lower()
                                if file_ext in checkpoint_extensions:
                                    model_set.add(file)
                    except Exception:
                        pass
            models = sorted(model_set)
            cls.custom_model_lists[node_id] = models

            return {
                "success": True,
                "error": "",
                "model_count": len(models),
                "models": models,
                "paths": existing,
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_count": 0,
                "models": []
            }
    
    @classmethod
    def get_custom_models_for_node(cls, node_id: str) -> List[str]:
        return cls.custom_model_lists.get(node_id, [])

    @classmethod
    def scan_multiple_paths(cls, paths: List[str], node_id: str) -> Dict[str, Any]:
        try:
            checkpoint_extensions = ['.safetensors', '.ckpt']
            valid_paths = []
            model_set = set()
            for p in (paths or []):
                if p and os.path.exists(p) and os.path.isdir(p):
                    valid_paths.append(p)
                    try:
                        for file in os.listdir(p):
                            file_path = os.path.join(p, file)
                            if os.path.isfile(file_path):
                                file_ext = os.path.splitext(file)[1].lower()
                                if file_ext in checkpoint_extensions:
                                    model_set.add(file)
                    except Exception:
                        pass
            models = sorted(model_set)
            cls.custom_checkpoint_paths[node_id] = valid_paths
            cls.custom_model_lists[node_id] = models
            return {
                "success": True,
                "error": "",
                "model_count": len(models),
                "models": models,
                "paths": valid_paths,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_count": 0,
                "models": [],
                "paths": [],
            }

    @classmethod
    def scan_checkpoint_path_single(cls, path: str) -> Dict[str, Any]:
        try:
            if not path or not os.path.exists(path):
                return {
                    "success": False,
                    "error": "路径不存在 / Path does not exist",
                    "model_count": 0,
                    "models": []
                }
            if not os.path.isdir(path):
                return {
                    "success": False,
                    "error": "路径不是目录 / Path is not a directory",
                    "model_count": 0,
                    "models": []
                }
            checkpoint_extensions = ['.safetensors', '.ckpt']
            models = []
            try:
                for file in os.listdir(path):
                    file_path = os.path.join(path, file)
                    if os.path.isfile(file_path):
                        file_ext = os.path.splitext(file)[1].lower()
                        if file_ext in checkpoint_extensions:
                            models.append(file)
            except Exception:
                pass
            models.sort()
            return {
                "success": True,
                "error": "",
                "model_count": len(models),
                "models": models,
                "paths": [path],
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_count": 0,
                "models": [],
                "paths": [path],
            }

def register_free_checkpoint_loader_routes():
    try:
        from aiohttp import web
        import server
        import time
        
        LOADER_DIR = os.path.dirname(os.path.abspath(__file__))
        PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        SAVED_PATHS_FILE = os.path.join(LOADER_DIR, "free_checkpoint_loader_paths.json")
        OLD_SAVED_PATHS_FILE = os.path.join(PLUGIN_ROOT, "free_checkpoint_loader_paths.json")

        def ensure_saved_paths_file():
            try:
                if not os.path.exists(SAVED_PATHS_FILE):
                    migrated_data = {}
                    if os.path.exists(OLD_SAVED_PATHS_FILE):
                        try:
                            with open(OLD_SAVED_PATHS_FILE, 'r', encoding='utf-8') as f:
                                migrated_data = json.load(f)
                        except Exception as e:
                            logging.warning(f"读取旧保存路径文件失败，将创建空文件: {e}")
                    with open(SAVED_PATHS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(migrated_data or {}, f, ensure_ascii=False, indent=2)
            except Exception as e:
                logging.error(f"创建保存路径文件失败: {e}")
        
        ensure_saved_paths_file()
        
        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/scan_path")
        async def scan_checkpoint_path(request):
            try:
                data = await request.json()
                path = data.get("path", "")
                node_id = data.get("node_id", "")
                
                if not path or not node_id:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                        "model_count": 0,
                        "models": []
                    })
                
                result = FreeCheckpointLoader.scan_checkpoint_path(path, node_id)
                return web.json_response(result)
                
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}",
                    "model_count": 0,
                    "models": []
                })

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/scan_path_single")
        async def scan_checkpoint_path_single(request):
            try:
                data = await request.json()
                path = data.get("path", "")
                if not path:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                        "model_count": 0,
                        "models": []
                    })
                result = FreeCheckpointLoader.scan_checkpoint_path_single(path)
                return web.json_response(result)
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}",
                    "model_count": 0,
                    "models": []
                })
        
        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/browse_folder")
        async def browse_checkpoint_folder(request):
            try:
                data = await request.json()
                folder_path = data.get("path", "")
                node_id = data.get("node_id", "")
                
                if not folder_path:
                    default_checkpoint_dirs = folder_paths.get_folder_paths("checkpoints")
                    if default_checkpoint_dirs:
                        folder_path = default_checkpoint_dirs[0]
                    else:
                        folder_path = "."
                
                if not os.path.exists(folder_path):
                    return web.json_response({
                        "success": False,
                        "error": "路径不存在 / Path does not exist",
                        "folders": [],
                        "current_path": folder_path
                    })
                
                if not os.path.isdir(folder_path):
                    return web.json_response({
                        "success": False,
                        "error": "路径不是目录 / Path is not a directory",
                        "folders": [],
                        "current_path": folder_path
                    })
                
                folders = []
                try:
                    for item in os.listdir(folder_path):
                        item_path = os.path.join(folder_path, item)
                        if os.path.isdir(item_path):
                            folders.append(item)
                    
                    folders.sort()
                except PermissionError:
                    return web.json_response({
                        "success": False,
                        "error": "权限不足，无法访问该目录 / Insufficient permissions to access directory",
                        "folders": [],
                        "current_path": folder_path
                    })
                
                return web.json_response({
                    "success": True,
                    "folders": folders,
                    "current_path": folder_path
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"浏览失败: {str(e)} / Browse failed: {str(e)}",
                    "folders": [],
                    "current_path": ""
                })

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/check_path")
        async def check_path(request):
            try:
                data = await request.json()
                raw_path = data.get("path", "")
                path = str(raw_path).strip()
                exists = bool(path) and os.path.exists(path)
                is_dir = exists and os.path.isdir(path)
                return web.json_response({
                    "success": True,
                    "exists": exists,
                    "is_directory": is_dir,
                    "normalized_path": path,
                    "message": ("OK" if is_dir else ("路径不存在或不是目录 / Path does not exist or is not a directory"))
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}",
                    "exists": False,
                    "is_directory": False,
                })
        
        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/save_path")
        async def save_checkpoint_path(request):
            try:
                data = await request.json()
                raw_path = data.get("path", "")
                raw_node_id = data.get("node_id", "")
                path = str(raw_path).strip()
                node_id = str(raw_node_id).strip()
                
                if not path or not node_id:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                    })
                
                ensure_saved_paths_file()
                
                try:
                    with open(SAVED_PATHS_FILE, 'r', encoding='utf-8') as f:
                        saved_data = json.load(f)
                except Exception:
                    saved_data = {}

                if isinstance(saved_data, dict) and ("paths" in saved_data or "path" in saved_data):
                    record = saved_data
                else:
                    try:
                        candidates = [v for v in saved_data.values() if isinstance(v, dict)]
                        record = max(candidates, key=lambda x: int(x.get("timestamp", 0))) if candidates else {}
                    except Exception:
                        record = {}

                existing_paths = record.get("paths") or ([] if not record.get("path") else [record.get("path")])
                if path not in existing_paths:
                    existing_paths.append(path)
                new_record = {
                    "paths": existing_paths,
                    "path": existing_paths[-1] if existing_paths else "",
                    "timestamp": int(time.time() * 1000),
                }

                try:
                    with open(SAVED_PATHS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(new_record, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    return web.json_response({
                        "success": False,
                        "error": f"写入文件失败: {str(e)} / Failed to write file: {str(e)}"
                    })
                
                return web.json_response({
                    "success": True,
                    "message": "路径已保存到JSON文件 / Path saved to JSON file",
                    "file": SAVED_PATHS_FILE,
                    "paths": new_record["paths"],
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}"
                })

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/save_settings")
        async def save_settings(request):
            try:
                data = await request.json()
                raw_node_id = data.get("node_id", "")
                raw_paths = data.get("paths", None)
                node_id = str(raw_node_id).strip()
                if not node_id:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                    })

                def _normalize_paths(raw):
                    try:
                        if raw is None:
                            return None
                        if isinstance(raw, list):
                            return [str(p).strip() for p in raw if str(p).strip()]
                        if isinstance(raw, str):
                            p = str(raw).strip()
                            return [p] if p else []
                    except Exception:
                        pass
                    return None
                provided_paths = _normalize_paths(raw_paths)

                ensure_saved_paths_file()
                try:
                    with open(SAVED_PATHS_FILE, 'r', encoding='utf-8') as f:
                        saved_data = json.load(f)
                except Exception:
                    saved_data = {}

                if isinstance(saved_data, dict) and ("paths" in saved_data or "path" in saved_data):
                    record = saved_data
                else:
                    try:
                        candidates = [v for v in saved_data.values() if isinstance(v, dict)]
                        record = max(candidates, key=lambda x: int(x.get("timestamp", 0))) if candidates else {}
                    except Exception:
                        record = {}
                paths = provided_paths if provided_paths is not None else (record.get("paths") or [])
                new_record = {
                    "paths": paths,
                }

                try:
                    with open(SAVED_PATHS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(new_record, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    return web.json_response({
                        "success": False,
                        "error": f"写入文件失败: {str(e)} / Failed to write file: {str(e)}"
                    })

                return web.json_response({
                    "success": True,
                    "paths": new_record["paths"],
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}"
                })

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/load_path")
        async def load_path(request):
            try:
                data = await request.json()
                raw_node_id = data.get("node_id", "")
                node_id = str(raw_node_id).strip()
                if not node_id:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                    })

                ensure_saved_paths_file()
                try:
                    with open(SAVED_PATHS_FILE, 'r', encoding='utf-8') as f:
                        saved_data = json.load(f)
                except Exception:
                    saved_data = {}

                if isinstance(saved_data, dict) and "paths" in saved_data:
                    paths = saved_data.get("paths") or []
                    return web.json_response({
                        "success": True,
                        "paths": paths,
                    })
                entry = saved_data.get(node_id) or {}
                paths = entry.get("paths") or []
                return web.json_response({
                    "success": True,
                    "paths": paths,
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}"
                })
        
        print("✅ FreeCheckpointLoader API routes registered successfully")

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/remove_path")
        async def remove_path(request):
            try:
                data = await request.json()
                raw_path = data.get("path", "")
                raw_node_id = data.get("node_id", "")
                path = str(raw_path).strip()
                node_id = str(raw_node_id).strip()
                if not node_id or not path:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                    })

                ensure_saved_paths_file()
                try:
                    with open(SAVED_PATHS_FILE, 'r', encoding='utf-8') as f:
                        saved_data = json.load(f)
                except Exception:
                    saved_data = {}
                if isinstance(saved_data, dict) and "paths" in saved_data:
                    record = saved_data
                else:
                    record = saved_data.get(node_id) or {}
                paths = record.get("paths") or []
                paths = [p for p in paths if p != path]
                new_record = {
                    "paths": paths,
                }

                try:
                    with open(SAVED_PATHS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(new_record, f, ensure_ascii=False, indent=2)
                except Exception as e:
                    return web.json_response({
                        "success": False,
                        "error": f"写入文件失败: {str(e)} / Failed to write file: {str(e)}"
                    })

                FreeCheckpointLoader.custom_checkpoint_paths[node_id] = paths
                result = FreeCheckpointLoader.scan_multiple_paths(paths, node_id)
                return web.json_response({
                    "success": True,
                    "paths": new_record["paths"],
                    "models": result.get("models", []),
                    "model_count": result.get("model_count", 0),
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}"
                })

        @server.PromptServer.instance.routes.post("/free_checkpoint_loader/scan_paths")
        async def scan_paths(request):
            try:
                data = await request.json()
                raw_node_id = data.get("node_id", "")
                node_id = str(raw_node_id).strip()
                
                if not node_id:
                    return web.json_response({
                        "success": False,
                        "error": "缺少必要参数 / Missing required parameters",
                    })
                
                custom_models = FreeCheckpointLoader.get_custom_models_for_node(node_id)
                return web.json_response({
                    "success": True,
                    "models": custom_models,
                    "count": len(custom_models),
                })
            except Exception as e:
                return web.json_response({
                    "success": False,
                    "error": f"服务器错误: {str(e)} / Server error: {str(e)}"
                })
        
    except ImportError:
        print("⚠️ 无法导入server模块，API路由注册失败 / Failed to import server module, API route registration failed")
    except Exception as e:
        print(f"❌ 注册FreeCheckpointLoader API路由时出错 / Error registering FreeCheckpointLoader API routes: {e}")

try:
    register_free_checkpoint_loader_routes()
except:
    pass