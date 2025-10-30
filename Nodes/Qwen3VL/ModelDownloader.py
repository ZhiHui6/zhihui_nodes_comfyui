import os
import time
import folder_paths
from pathlib import Path
import threading
from typing import Optional, Dict, Any

class ModelDownloader:
    
    def __init__(self):
        self.download_status = {}
        self.download_thread = None
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": (
                    [
                        "Qwen3-VL-4B-Instruct",
                        "Qwen3-VL-4B-Thinking", 
                        "Qwen3-VL-8B-Instruct",
                        "Qwen3-VL-8B-Thinking",
                        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
                        
                    ],
                    {"default": "Qwen3-VL-8B-Instruct"},
                ),
                "platform": (
                    ["huggingface", "hf-mirror", "modelscope"],
                    {"default": "hf-mirror"},
                ),
                "force_redownload": ("BOOLEAN", {"default": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("info",)
    FUNCTION = "download_model"
    CATEGORY = "Zhi.AI/Qwen3VL"

    def get_platform_config(self, platform: str, model: str = None) -> Dict[str, Any]:
        configs = {
            "huggingface": {
                "repo_prefix": "qwen",
                "endpoint": None,
                "use_hf_hub": True,
            },
            "hf-mirror": {
                "repo_prefix": "qwen", 
                "endpoint": "https://hf-mirror.com",
                "use_hf_hub": True,
            },
            "modelscope": {
                "repo_prefix": "qwen",
                "endpoint": None,
                "use_hf_hub": False,
            }
        }
        
        config = configs.get(platform, configs["huggingface"])
        
        if platform == "modelscope" and model and "abliterated" in model:
            config = config.copy()
            config["repo_prefix"] = "ayumix5"
            
        return config

    def get_model_save_path(self, model: str) -> str:
        models_dir = os.path.join(folder_paths.models_dir, "prompt_generator")
        return os.path.join(models_dir, model)

    def check_model_exists(self, model_path: str) -> bool:
        if not os.path.exists(model_path):
            return False
        
        required_files = ["config.json"]
        for file in required_files:
            if not os.path.exists(os.path.join(model_path, file)):
                return False
        
        return True

    def download_from_huggingface(self, repo_id: str, local_dir: str, 
            endpoint: Optional[str] = None) -> bool:
        try:
            from huggingface_hub import snapshot_download
            import os
            import requests
            
            if endpoint:
                os.environ["HF_ENDPOINT"] = endpoint
            
            print(f"开始从 {'HF-Mirror' if endpoint else 'HuggingFace'} 下载模型: {repo_id}")
            print(f"保存路径: {local_dir}")
            
            snapshot_download(
                repo_id=repo_id,
                local_dir=local_dir,
                local_dir_use_symlinks=False,
                resume_download=True,
            )
            
            if endpoint and "HF_ENDPOINT" in os.environ:
                del os.environ["HF_ENDPOINT"]
                
            return True
            
        except requests.exceptions.Timeout as e:
            if endpoint and "HF_ENDPOINT" in os.environ:
                del os.environ["HF_ENDPOINT"]
            platform_name = 'HF-Mirror' if endpoint else 'HuggingFace'
            print(f"🚫 {platform_name} 连接超时: {str(e)}")
            return False
            
        except requests.exceptions.ConnectionError as e:
            if endpoint and "HF_ENDPOINT" in os.environ:
                del os.environ["HF_ENDPOINT"]
            platform_name = 'HF-Mirror' if endpoint else 'HuggingFace'
            print(f"🚫 无法连接到 {platform_name} 服务器: {str(e)}")
            return False
            
        except Exception as e:
            print(f"HuggingFace下载失败: {str(e)}")
            if endpoint and "HF_ENDPOINT" in os.environ:
                del os.environ["HF_ENDPOINT"]
            return False

    def download_from_modelscope(self, repo_id: str, local_dir: str) -> bool:
        try:
            from modelscope import snapshot_download as ms_snapshot_download
            import requests
            
            print(f"开始从 ModelScope 下载模型: {repo_id}")
            print(f"保存路径: {local_dir}")
            
            ms_snapshot_download(
                model_id=repo_id,
                local_dir=local_dir,
                revision="master"
            )
            
            return True
            
        except ImportError:
            print("🚫 ModelScope 库未安装，请安装: pip install modelscope")
            return False
            
        except requests.exceptions.Timeout as e:
            print(f"🚫 ModelScope 连接超时: {str(e)}")
            return False
            
        except requests.exceptions.ConnectionError as e:
            print(f"🚫 无法连接到 ModelScope 服务器: {str(e)}")
            return False
            
        except Exception as e:
            print(f"ModelScope下载失败: {str(e)}")
            return False

    def download_model_async(self, model: str, platform: str, model_path: str, 
                            force_redownload: bool):
        try:
            config = self.get_platform_config(platform, model)
            
            repo_id = f"{config['repo_prefix']}/{model}"
            
            self.download_status[model] = {
                "status": "downloading",
                "progress": 0,
                "message": f"正在从 {platform} 下载模型..."
            }
            
            if force_redownload and os.path.exists(model_path):
                import shutil
                shutil.rmtree(model_path)
                print(f"已删除现有模型目录: {model_path}")
            
            os.makedirs(model_path, exist_ok=True)
            
            success = False
            if config["use_hf_hub"]:
                success = self.download_from_huggingface(
                    repo_id, model_path, config["endpoint"]
                )
            else:
                success = self.download_from_modelscope(repo_id, model_path)
            
            if success:
                self.download_status[model] = {
                    "status": "completed",
                    "progress": 100,
                    "message": f"模型下载完成: {model_path}"
                }
                print(f"✅ 模型下载成功: {model}")
            else:
                self.download_status[model] = {
                    "status": "failed", 
                    "progress": 0,
                    "message": f"模型下载失败，请检查网络连接或尝试其他平台"
                }
                print(f"❌ 模型下载失败: {model}")
                
        except Exception as e:
            self.download_status[model] = {
                "status": "failed",
                "progress": 0, 
                "message": f"下载过程中出现错误: {str(e)}"
            }
            print(f"❌ 下载异常: {str(e)}")

    def download_model(self, model: str, platform: str, force_redownload: bool = False):
        
        model_path = self.get_model_save_path(model)
        
        if force_redownload and os.path.exists(model_path):
            import shutil
            shutil.rmtree(model_path)
            print(f"已删除现有模型目录: {model_path}")
        
        if not force_redownload and self.check_model_exists(model_path):
            info_msg = f"✅ 模型已存在，无需重新下载\n📁 模型路径: {model_path}\n💡 如需重新下载，请勾选'强制重新下载'选项"
            return (info_msg,)
        
        if (model in self.download_status and 
            self.download_status[model]["status"] == "downloading"):
            current_status = self.download_status[model]
            info_msg = f"⏳ {current_status['message']}\n📁 目标路径: {model_path}"
            return (info_msg,)
        
        print(f"🚀 开始下载模型: {model} (平台: {platform})")
        
        self.download_thread = threading.Thread(
            target=self.download_model_async,
            args=(model, platform, model_path, force_redownload)
        )
        self.download_thread.daemon = True
        self.download_thread.start()
        
        time.sleep(1)
        
        if model in self.download_status:
            current_status = self.download_status[model]
            info_msg = f"⏳ {current_status['message']}\n📁 目标路径: {model_path}"
        else:
            info_msg = f"⏳ 正在初始化下载: {model}\n📁 目标路径: {model_path}"
        
        return (info_msg,)