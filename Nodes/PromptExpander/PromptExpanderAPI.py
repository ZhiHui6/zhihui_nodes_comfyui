import os
import json
import requests

try:
    from server import PromptServer
    from aiohttp import web
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None
    web = None

class PromptExpanderAPI:
    def __init__(self):
        self.config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "zhiai_api_config.json")
        self.keys_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "zhiai_api_keys.json")
        self.config = self.load_config()
        self.api_keys = self.load_api_keys()

    def load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def load_api_keys(self):
        try:
            with open(self.keys_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return self.get_default_api_keys()

    def get_default_api_keys(self):
        return {
            "openai": "",
            "claude": "",
            "gemini": "",
            "zhipu": "",
            "deepseek": "",
            "siliconflow": "",
            "kimi": "",
            "minimax": "",
            "qwen": "",
            "openrouter": "",
            "tencent": "",
            "nvidia": "",
            "custom": ""
        }

    def save_api_keys(self, api_keys):
        try:
            with open(self.keys_path, 'w', encoding='utf-8') as f:
                json.dump(api_keys, f, indent=4, ensure_ascii=False)
            self.api_keys = api_keys
            return True
        except Exception as e:
            print(f"Failed to save API keys: {e}")
            return False

    def get_api_key(self, platform):
        return self.api_keys.get(platform, "")

    def get_default_config(self):
        return {
            "platforms": {
                "openai": {
                    "name": "OpenAI",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.openai.com/v1", "model": "gpt-4o-mini"},
                    "api_url": "https://api.openai.com/v1/chat/completions"
                },
                "claude": {
                    "name": "Anthropic",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.anthropic.com", "model": "claude-3-5-sonnet-20241022"},
                    "api_url": "https://api.anthropic.com/v1/messages"
                },
                "gemini": {
                    "name": "Google",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://generativelanguage.googleapis.com", "model": "gemini-1.5-flash"},
                    "api_url": "https://generativelanguage.googleapis.com/v1beta/models"
                },
                "zhipu": {
                    "name": "ZhipuAI",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://open.bigmodel.cn/api/paas/v4", "model": "glm-4-flash"},
                    "api_url": "https://open.bigmodel.cn/api/paas/v4/chat/completions"
                },
                "deepseek": {
                    "name": "DeepSeek",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.deepseek.com", "model": "deepseek-chat"},
                    "api_url": "https://api.deepseek.com/chat/completions"
                },
                "siliconflow": {
                    "name": "SiliconFlow",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.siliconflow.cn/v1", "model": "Qwen/Qwen2.5-7B-Instruct"},
                    "api_url": "https://api.siliconflow.cn/v1/chat/completions"
                },
                "kimi": {
                    "name": "MoonshotAI",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.moonshot.cn/v1", "model": "moonshot-v1-8k"},
                    "api_url": "https://api.moonshot.cn/v1/chat/completions"
                },
                "minimax": {
                    "name": "MiniMax",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://api.minimax.chat/v1", "model": "abab6.5s-chat"},
                    "api_url": "https://api.minimax.chat/v1/chat/completions"
                },
                "qwen": {
                    "name": "Alibaba",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1", "model": "qwen-turbo"},
                    "api_url": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
                },
                "openrouter": {
                    "name": "OpenRouter",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://openrouter.ai/api/v1", "model": "openai/gpt-4o-mini"},
                    "api_url": "https://openrouter.ai/api/v1/chat/completions"
                },
                "tencent": {
                    "name": "Tencent",
                    "enabled": True,
                    "config": {"api_key": "", "base_url": "https://hunyuan.tencentcloudapi.com", "model": "hunyuan-lite"},
                    "api_url": "https://hunyuan.tencentcloudapi.com/v1/chat/completions"
                },
                "nvidia": {
                    "name": "NVIDIA",
                    "enabled": True,
                    "config": {"base_url": "https://integrate.api.nvidia.com/v1", "model": "nvidia/llama-3.1-nemotron-70b-instruct"},
                    "api_url": "https://integrate.api.nvidia.com/v1/chat/completions"
                },
                "custom": {
                    "name": "User-defined",
                    "enabled": True,
                    "config": {"base_url": "", "model": "", "api_url": ""},
                    "api_url": ""
                }
            },
            "default_platform": "auto"
        }

    def save_config(self, config):
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4, ensure_ascii=False)
            self.config = config
            return True
        except Exception as e:
            print(f"Failed to save config: {e}")
            return False

    def save_default_platform(self, platform):
        try:
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except Exception:
                pass
            
            self.config["default_platform"] = platform
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Failed to save default platform: {e}")
            return False

    def test_connection(self, platform, config):
        platform_config = self.config["platforms"].get(platform)
        if not platform_config:
            return {"success": False, "error": f"Platform configuration not found: {platform}"}

        api_key = config.get("api_key", "")
        if not api_key:
            api_key = self.get_api_key(platform)
        if not api_key:
            return {"success": False, "error": "API key cannot be empty"}

        base_url = config.get("base_url", "")
        if not base_url:
            base_url = platform_config["config"]["base_url"]

        model = config.get("model", "")
        if not model:
            model = platform_config["config"]["model"]

        if platform == "claude":
            api_url = f"{base_url}/v1/messages"
        elif platform == "gemini":
            api_url = f"{base_url}/v1beta/models/{model}:generateContent"
        else:
            api_url = f"{base_url}/chat/completions"

        system_prompt = "You are a helpful assistant."
        test_prompt = "Say 'test'"

        if not api_key:
            raise ValueError("API key cannot be empty")
        if not api_url:
            raise ValueError("API URL cannot be empty")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        if platform == "openrouter":
            headers["HTTP-Referer"] = "https://github.com"
            headers["X-Title"] = "ComfyUI Prompt Expander"
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": test_prompt}
            ],
            "max_tokens": 100
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=30)
        result = response.json()

        if response.status_code == 200:
            return {"success": True, "message": "Connection successful"}
        else:
            raise Exception(f"API error: {result.get('error', {}).get('message', 'Unknown error')}")


if PROMPT_SERVER_AVAILABLE and PromptServer:
    prompt_expander_api = PromptExpanderAPI()

    @PromptServer.instance.routes.get("/zhihui_nodes/prompt_expander/config")
    async def get_prompt_expander_config(request):
        return web.json_response(prompt_expander_api.config)

    @PromptServer.instance.routes.post("/zhihui_nodes/prompt_expander/config")
    async def save_prompt_expander_config(request):
        try:
            data = await request.json()
            success = prompt_expander_api.save_config(data)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.get("/zhihui_nodes/prompt_expander/api_keys")
    async def get_api_keys(request):
        return web.json_response(prompt_expander_api.api_keys)

    @PromptServer.instance.routes.post("/zhihui_nodes/prompt_expander/api_keys")
    async def save_api_keys_route(request):
        try:
            data = await request.json()
            success = prompt_expander_api.save_api_keys(data)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.post("/zhihui_nodes/prompt_expander/test")
    async def test_prompt_expander_connection(request):
        try:
            data = await request.json()
            platform = data.get("platform")
            config = data.get("config")
            result = await prompt_expander_api.test_connection(platform, config)
            return web.json_response(result)
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})

    @PromptServer.instance.routes.get("/zhihui_nodes/prompt_expander/default_platform")
    async def get_default_platform(request):
        default_platform = prompt_expander_api.config.get("default_platform", "auto")
        return web.json_response({"default_platform": default_platform})

    @PromptServer.instance.routes.post("/zhihui_nodes/prompt_expander/default_platform")
    async def set_default_platform(request):
        try:
            data = await request.json()
            platform = data.get("platform", "auto")
            success = prompt_expander_api.save_default_platform(platform)
            return web.json_response({"success": success})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)})
