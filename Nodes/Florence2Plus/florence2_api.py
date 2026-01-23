import os
import json
import threading
import shutil
import time
try:
    from aiohttp import web
    from server import PromptServer
    HAS_SERVER = True
except ImportError:
    HAS_SERVER = False
    web = None
    PromptServer = None

import folder_paths

MODELS_DIR = os.path.join(folder_paths.models_dir, "LLM")
os.makedirs(MODELS_DIR, exist_ok=True)

FLORENCE2_MODELS = [
    'microsoft/Florence-2-base',
    'microsoft/Florence-2-large',
    'MiaoshouAI/Florence-2-base-PromptGen-v2.0',
    'MiaoshouAI/Florence-2-large-PromptGen-v2.0'
]

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "florence2_config.json")

download_status = {
    "status": "idle",
    "model_name": "",
    "message": "",
    "percent": 0
}
download_lock = threading.Lock()

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {"active_models": {}}

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

def run_download(model_name, platform, use_mirror):
    global download_status
    with download_lock:
        download_status["status"] = "downloading"
        download_status["model_name"] = model_name
        download_status["message"] = "Initializing download..."
        download_status["percent"] = 0
        
        try:
            dirname = model_name.split("/")[-1]
            local_dir = os.path.join(MODELS_DIR, dirname)
            
            if platform == "ModelScope":
                try:
                    from modelscope import snapshot_download
                except ImportError:
                    raise Exception("ModelScope library not installed. Please install 'modelscope'.")
                
                repo_id = model_name
                if model_name.startswith("microsoft/"):
                    repo_id = "AI-ModelScope/" + model_name.split("/")[-1]
                elif model_name.startswith("MiaoshouAI/"):
                    repo_id = "cutemodel/" + model_name.split("/")[-1]
                
                download_status["message"] = f"Downloading from ModelScope: {repo_id}..."
                snapshot_download(repo_id, local_dir=local_dir)
                
            else:
                from huggingface_hub import snapshot_download
                
                env = os.environ.copy()
                if use_mirror:
                    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
                    download_status["message"] = f"Downloading from Hugging Face Mirror..."
                else:
                    download_status["message"] = f"Downloading from Hugging Face..."
                
                try:
                    snapshot_download(repo_id=model_name, local_dir=local_dir, local_dir_use_symlinks=False)
                finally:
                    if use_mirror:
                        del os.environ["HF_ENDPOINT"]

            download_status["status"] = "success"
            download_status["message"] = "Download complete"
            download_status["percent"] = 100
            
        except Exception as e:
            download_status["status"] = "error"
            download_status["message"] = str(e)
            print(f"Download error: {e}")

if HAS_SERVER:
    @PromptServer.instance.routes.get("/zhihui/florence2/models")
    async def get_models(request):
        config = load_config()
        active_models = config.get("active_models", {})
        
        installed_dirs = []
        if os.path.exists(MODELS_DIR):
            installed_dirs = [d for d in os.listdir(MODELS_DIR) if os.path.isdir(os.path.join(MODELS_DIR, d))]

        models_info = []
        for m in FLORENCE2_MODELS:
            dirname = m.split("/")[-1]
            is_installed = dirname in installed_dirs
            is_active = active_models.get(m, True)
            
            models_info.append({
                "name": m,
                "dirname": dirname,
                "installed": is_installed,
                "active": is_active
            })
            
        return web.json_response(models_info)

    @PromptServer.instance.routes.post("/zhihui/florence2/toggle")
    async def toggle_model(request):
        data = await request.json()
        model_name = data.get("model_name")
        active = data.get("active")
        
        if not model_name:
            return web.json_response({"error": "Missing model_name"}, status=400)
            
        config = load_config()
        if "active_models" not in config:
            config["active_models"] = {}
            
        config["active_models"][model_name] = active
        save_config(config)
        
        return web.json_response({"status": "success"})

    @PromptServer.instance.routes.post("/zhihui/florence2/download")
    async def download_model(request):
        global download_status
        if download_status["status"] == "downloading":
            return web.json_response({"status": "error", "message": "Already downloading"}, status=400)
        
        data = await request.json()
        model_name = data.get("model_name")
        platform = data.get("platform", "Hugging Face")
        use_mirror = data.get("use_mirror", False)
        
        if not model_name:
            return web.json_response({"error": "Missing model_name"}, status=400)
            
        threading.Thread(target=run_download, args=(model_name, platform, use_mirror)).start()
        return web.json_response({"status": "started"})

    @PromptServer.instance.routes.get("/zhihui/florence2/download_status")
    async def get_download_status(request):
        return web.json_response(download_status)

    @PromptServer.instance.routes.delete("/zhihui/florence2/models")
    async def delete_model(request):
        data = await request.json()
        model_name = data.get("model_name")
        
        if not model_name:
            return web.json_response({"error": "Missing model_name"}, status=400)
            
        dirname = model_name.split("/")[-1]
        path = os.path.join(MODELS_DIR, dirname)
        
        if os.path.exists(path):
            try:
                shutil.rmtree(path)
                return web.json_response({"status": "success"})
            except Exception as e:
                return web.json_response({"error": str(e)}, status=500)
        else:
            return web.json_response({"error": "Model not found"}, status=404)