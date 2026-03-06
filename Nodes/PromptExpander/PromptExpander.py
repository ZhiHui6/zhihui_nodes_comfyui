import os
import json
import requests
import time

try:
    from server import PromptServer
    from aiohttp import web
    PROMPT_SERVER_AVAILABLE = True
except ImportError:
    PROMPT_SERVER_AVAILABLE = False
    PromptServer = None
    web = None

class PromptExpander:
    PLATFORMS = ["auto", "OpenAI", "Anthropic", "Google", "ZhipuAI", "DeepSeek", "SiliconFlow", "MoonshotAI", "MiniMax", "Alibaba", "OpenRouter", "Tencent", "User-defined"]

    PLATFORM_MAP = {
        "auto": "auto",
        "OpenAI": "openai",
        "Anthropic": "claude",
        "Google": "gemini",
        "ZhipuAI": "zhipu",
        "DeepSeek": "deepseek",
        "SiliconFlow": "siliconflow",
        "MoonshotAI": "kimi",
        "MiniMax": "minimax",
        "Alibaba": "qwen",
        "OpenRouter": "openrouter",
        "Tencent": "tencent",
        "User-defined": "custom"
    }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "platform": (cls.PLATFORMS, {"default": "auto"}),
                "writing_style": (["Natural", "Tag", "Custom"], {"default": "Natural"}),
                "output_language": (["English", "Chinese"], {"default": "English"}),
                "max_tokens": ("INT", {"default": 2048, "min": 256, "max": 8192, "step": 256}),
                "prompt": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "custom_system_prompt": ("STRING", {"default": "", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("expanded_prompt",)
    FUNCTION = "expand_prompt"
    CATEGORY = "Zhi.AI/Generator"
    DESCRIPTION = "AI-powered prompt expansion, one-click to generate high-quality prompts"

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
            return {}

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
                    "config": {"base_url": "https://hunyuan.tencentcloudapi.com", "model": "hunyuan-lite"},
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

    def get_system_prompt(self, writing_style, output_language="English", custom_system_prompt=""):
        lang_instruction = "输出英文提示词" if output_language == "English" else "输出中文提示词"
        
        if writing_style == "Custom":
            return custom_system_prompt.strip()
        
        prompts = {
            "Natural": f"""你是一位富有艺术创造力的AI绘画提示词大师，擅长以流畅优美的自然语言进行提示词扩写。

你的任务是将用户的简短描述转化为一段富有文采、逻辑清晰、画面感强的完整描述。

扩写原则：
1. 以流畅连贯的自然语言为基础，避免机械堆砌关键词
2. 运用丰富的修辞手法，让描述具有文学性和艺术感染力
3. 构建完整的视觉场景：从主体到环境，从光线到氛围，从细节到意境
4. 融入专业的艺术与摄影知识，如构图法则、光影运用、色彩理论等
5. 保持原意的同时，赋予提示词更深层次的艺术表达
6. {lang_instruction}
7. 输出格式：只输出扩写后的自然语言描述，不要解释""",

            "Tag": f"""你是一位精通AI绘画标签体系的提示词专家，擅长通过精准的标签组合创造性地扩展提示词。

你的任务是将用户的描述转化为结构化、层次分明、富有创造力的标签组合。

扩写原则：
1. 采用标签化结构，使用逗号分隔各个标签
2. 标签层次：质量标签 → 主体标签 → 细节标签 → 风格标签 → 技术标签
3. 质量标签：masterpiece, best quality, highly detailed, 8k uhd, ultra high res等
4. 主体标签：精确描述画面主体，包括外观、姿态、表情、服装等
5. 细节标签：光线效果、环境氛围、背景元素、材质纹理等
6. 风格标签：艺术风格、绘画技法、视觉特效等
7. 技术标签：构图方式、镜头参数、渲染技术等
8. 保持原意的同时，通过标签组合实现创造性的视觉延伸
9. {lang_instruction}
10. 输出格式：只输出标签组合，使用英文逗号分隔，不要解释"""
        }
        return prompts.get(writing_style, prompts["Natural"])

    def get_platform(self, selected_platform):
        self.api_keys = self.load_api_keys()
        platform_id = self.PLATFORM_MAP.get(selected_platform, selected_platform)
        
        if platform_id and platform_id != "auto":
            platform_config = self.config["platforms"].get(platform_id)
            if platform_config:
                api_key = self.get_api_key(platform_id)
                if api_key and platform_config.get("enabled", True):
                    return platform_id, platform_config
                else:
                    return platform_id, None
            else:
                return platform_id, None
        
        for platform_id, platform_config in self.config["platforms"].items():
            api_key = self.get_api_key(platform_id)
            if api_key and platform_config.get("enabled", True):
                return platform_id, platform_config
        return None, None

    def expand_prompt(self, platform, writing_style, output_language, max_tokens, prompt, custom_system_prompt=""):
        if not prompt.strip():
            return (prompt,)

        self.config = self.load_config()
        platform, platform_config = self.get_platform(platform)
        if not platform:
            error_output = "[ZhiAI Prompt Expander] 错误：未配置可用的API平台\n请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥"
            print("\n" + "="*60)
            print("[ZhiAI Prompt Expander] 错误：未配置可用的API平台")
            print("="*60)
            print("请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥")
            print("="*60 + "\n")
            return (error_output,)

        if platform_config is None:
            platform_names = {
                "openai": "OpenAI",
                "claude": "Anthropic",
                "gemini": "Google",
                "zhipu": "ZhipuAI",
                "deepseek": "DeepSeek",
                "siliconflow": "SiliconFlow",
                "kimi": "MoonshotAI",
                "minimax": "MiniMax",
                "qwen": "Alibaba",
                "openrouter": "OpenRouter",
                "tencent": "Tencent",
                "nvidia": "NVIDIA",
                "custom": "User-defined"
            }
            platform_name = platform_names.get(platform, platform)
            error_output = f"[ZhiAI Prompt Expander] 错误：当前选择的平台 '{platform_name}' 未配置API密钥\n请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台"
            print("\n" + "="*60)
            print(f"[ZhiAI Prompt Expander] 错误：当前选择的平台 '{platform_name}' 未配置API密钥")
            print("="*60)
            print(f"请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台")
            print("="*60 + "\n")
            return (error_output,)

        api_key = self.get_api_key(platform)
        if not api_key:
            error_output = f"[ZhiAI Prompt Expander] 错误：{platform_config['name']} 未配置API密钥\n请在设置页面配置 {platform_config['name']} 的API密钥"
            print("\n" + "="*60)
            print(f"[ZhiAI Prompt Expander] 错误：{platform_config['name']} 未配置API密钥")
            print("="*60)
            print(f"请在设置页面配置 {platform_config['name']} 的API密钥")
            print("="*60 + "\n")
            return (error_output,)

        try:
            system_prompt = self.get_system_prompt(writing_style, output_language, custom_system_prompt)
            temperature = 0.7
            
            if platform == "openai":
                result = self.call_openai(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "claude":
                result = self.call_claude(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "gemini":
                result = self.call_gemini(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "zhipu":
                result = self.call_zhipu(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "deepseek":
                result = self.call_deepseek(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "siliconflow":
                result = self.call_siliconflow(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "kimi":
                result = self.call_kimi(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "minimax":
                result = self.call_minimax(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "qwen":
                result = self.call_qwen(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "openrouter":
                result = self.call_openrouter(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "tencent":
                result = self.call_tencent(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "nvidia":
                result = self.call_nvidia(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            elif platform == "custom":
                result = self.call_custom(platform, platform_config, system_prompt, prompt, max_tokens, temperature)
            else:
                result = prompt

            return (result,)
        except Exception as e:
            error_msg = str(e)
            error_output = f"[ZhiAI Prompt Expander] API调用失败：{platform_config['name']}\n错误信息：{error_msg}\n可能的原因：\n  1. API密钥无效或已过期\n  2. 网络连接问题\n  3. API服务暂时不可用\n  4. 模型名称不正确\n建议：请检查设置页面的API配置，或尝试切换其他平台"
            print("\n" + "="*60)
            print(f"[ZhiAI Prompt Expander] API调用失败：{platform_config['name']}")
            print("="*60)
            print(f"错误信息：{error_msg}")
            print("-"*60)
            print("可能的原因：")
            print("  1. API密钥无效或已过期")
            print("  2. 网络连接问题")
            print("  3. API服务暂时不可用")
            print("  4. 模型名称不正确")
            print("-"*60)
            print("建议：请检查设置页面的API配置，或尝试切换其他平台")
            print("="*60 + "\n")
            return (error_output,)

    def call_openai(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gpt-4o-mini")
        base_url = config["config"].get("base_url", "https://api.openai.com/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"OpenAI API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_claude(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "claude-3-5-sonnet-20241022")
        base_url = config["config"].get("base_url", "https://api.anthropic.com").rstrip('/')
        
        url = f"{base_url}/v1/messages"
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        data = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "content" in result:
            return result["content"][0]["text"].strip()
        else:
            raise Exception(f"Claude API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_gemini(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gemini-1.5-flash")
        base_url = config["config"].get("base_url", "https://generativelanguage.googleapis.com").rstrip('/')
        
        url = f"{base_url}/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [
                    {"text": system_prompt + "\n\n用户输入: " + user_prompt}
                ]
            }],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "candidates" in result:
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            raise Exception(f"Gemini API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_zhipu(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "glm-4-flash")
        base_url = config["config"].get("base_url", "https://open.bigmodel.cn/api/paas/v4").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"GLM API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_deepseek(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "deepseek-chat")
        base_url = config["config"].get("base_url", "https://api.deepseek.com").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"DeepSeek API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_siliconflow(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "Qwen/Qwen2.5-7B-Instruct")
        base_url = config["config"].get("base_url", "https://api.siliconflow.cn/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"SiliconFlow API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_kimi(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "moonshot-v1-8k")
        base_url = config["config"].get("base_url", "https://api.moonshot.cn/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"Kimi API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_minimax(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "abab6.5s-chat")
        base_url = config["config"].get("base_url", "https://api.minimax.chat/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"MiniMax API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_qwen(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "qwen-turbo")
        base_url = config["config"].get("base_url", "https://dashscope.aliyuncs.com/compatible-mode/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"Qwen API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_openrouter(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "openai/gpt-4o-mini")
        base_url = config["config"].get("base_url", "https://openrouter.ai/api/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com",
            "X-Title": "ComfyUI Prompt Expander"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"OpenRouter API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_tencent(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "hunyuan-lite")
        base_url = config["config"].get("base_url", "https://hunyuan.tencentcloudapi.com").rstrip('/')
        
        url = f"{base_url}/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"Tencent API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_custom(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "")
        api_url = config["config"].get("api_url", "")
        
        if not api_url:
            raise Exception("Custom API address not configured")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(api_url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200:
            if "choices" in result:
                return result["choices"][0]["message"]["content"].strip()
            elif "content" in result:
                return result["content"][0]["text"].strip()
            else:
                return str(result)
        else:
            raise Exception(f"Custom API error: {result.get('error', {}).get('message', 'Unknown error')}")

    def call_nvidia(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "nvidia/llama-3.1-nemotron-70b-instruct")
        base_url = config["config"].get("base_url", "https://integrate.api.nvidia.com/v1").rstrip('/')
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"NVIDIA API error: {result.get('error', {}).get('message', 'Unknown error')}")