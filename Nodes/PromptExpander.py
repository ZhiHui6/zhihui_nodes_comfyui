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
    @classmethod
    def get_platforms_list(cls):
        config = cls().load_config()
        platforms = ["auto"]
        for platform_key, platform_info in config.get("platforms", {}).items():
            if isinstance(platform_info, dict):
                platform_name = platform_info.get("name", platform_key)
                if platform_name and platform_name not in platforms:
                    platforms.append(platform_name)
        if "User-defined" not in platforms:
            platforms.append("User-defined")
        return platforms
    
    @classmethod
    def get_platform_map(cls):
        config = cls().load_config()
        platform_map = {"auto": "auto"}
        for platform_key, platform_info in config.get("platforms", {}).items():
            if isinstance(platform_info, dict):
                platform_name = platform_info.get("name", platform_key)
                if platform_name:
                    platform_map[platform_name] = platform_key
        if "User-defined" not in platform_map.values():
            platform_map["User-defined"] = "custom"
        return platform_map
    
    @classmethod
    def INPUT_TYPES(cls):
        platforms = cls.get_platforms_list()
        return {
            "required": {
                "platform": (platforms, {"default": "auto"}),
                "writing_style": (["Natural", "Tag", "JSON", "Custom"], {"default": "Natural"}),
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
        self.config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "zhiai_api_config.json")
        self.keys_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "zhiai_api_keys.json")
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
            "platforms": {},
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
10. 输出格式：只输出标签组合，使用英文逗号分隔，不要解释""",

            "JSON": f"""你是一位精通AI绘画提示词结构化设计的专家，擅长将描述转化为结构清晰的JSON格式提示词。

你的任务是将用户的描述转化为结构化的JSON格式，便于程序解析和处理。

输出JSON结构说明：
{{
    "quality": ["画质相关标签，如masterpiece, best quality, highly detailed等"],
    "subject": {{
        "main": "主体描述，如人物、物体、场景等",
        "appearance": ["外观特征，如发型、肤色、体型等"],
        "clothing": ["服装描述"],
        "accessories": ["配饰描述"],
        "pose": ["姿态动作"],
        "expression": ["表情描述"]
    }},
    "environment": {{
        "location": "场景位置",
        "lighting": ["光线效果"],
        "atmosphere": ["氛围描述"],
        "background": ["背景元素"]
    }},
    "style": {{
        "art_style": ["艺术风格，如写实、动漫、油画等"],
        "technique": ["技法，如水彩、素描、3D渲染等"],
        "color_palette": ["色彩风格"]
    }},
    "technical": {{
        "composition": ["构图方式"],
        "camera": ["镜头参数"],
        "rendering": ["渲染技术"]
    }}
}}

扩写原则：
1. 根据用户描述的内容，智能填充JSON结构的各个字段
2. 如果某些字段不适用，可以省略或设为空数组
3. 标签使用英文，描述性文字根据输出语言选择
4. {lang_instruction}
5. 输出格式：只输出JSON对象，不要添加任何解释或markdown代码块标记"""
        }
        return prompts.get(writing_style, prompts["Natural"])

    def get_platform(self, selected_platform):
        self.api_keys = self.load_api_keys()
        platform_map = self.get_platform_map()
        platform_id = platform_map.get(selected_platform, selected_platform)
        
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
        platform_id, platform_config = self.get_platform(platform)
        if not platform_id:
            error_output = "[ZhiAI Prompt Expander] 错误：未配置可用的API平台\n请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥"
            print("\n" + "="*60)
            print("[ZhiAI Prompt Expander] 错误：未配置可用的API平台")
            print("="*60)
            print("请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥")
            print("="*60 + "\n")
            return (error_output,)

        if platform_config is None:
            platform_names = {}
            for platform_key, platform_info in self.config.get("platforms", {}).items():
                if isinstance(platform_info, dict):
                    platform_names[platform_key] = platform_info.get("name", platform_key)
            if "User-defined" not in platform_names.values():
                platform_names["custom"] = "User-defined"
            platform_name = platform_names.get(platform_id, platform_id)
            error_output = f"[ZhiAI Prompt Expander] 错误：当前选择的平台 '{platform_name}' 未配置API密钥\n请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台"
            print("\n" + "="*60)
            print(f"[ZhiAI Prompt Expander] 错误：当前选择的平台 '{platform_name}' 未配置API密钥")
            print("="*60)
            print(f"请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台")
            print("="*60 + "\n")
            return (error_output,)

        api_key = self.get_api_key(platform_id)
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
            
            platform_call_methods = {
                "openai": self.call_openai,
                "claude": self.call_claude,
                "gemini": self.call_gemini,
                "zhipu": self.call_zhipu,
                "deepseek": self.call_deepseek,
                "siliconflow": self.call_siliconflow,
                "kimi": self.call_kimi,
                "minimax": self.call_minimax,
                "qwen": self.call_qwen,
                "openrouter": self.call_openrouter,
                "tencent": self.call_tencent,
                "nvidia": self.call_nvidia,
                "custom": self.call_custom
            }
            
            call_method = platform_call_methods.get(platform_id)
            if call_method:
                result = call_method(platform_id, platform_config, system_prompt, prompt, max_tokens, temperature)
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
            raise Exception(f"Zhipu API error: {result.get('error', {}).get('message', 'Unknown error')}")

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
            "X-Title": "ComfyUI ZhiAI Nodes"
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
            raise Exception(f"Tencent API error: {result.get('error', {}).get('message', 'Unknown error')}")

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

    def call_custom(self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gpt-4-turbo")
        base_url = config["config"].get("base_url", "").rstrip('/')
        api_url = config["config"].get("api_url", f"{base_url}/chat/completions")
        
        if not api_url:
            api_url = f"{base_url}/chat/completions"
        
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
        
        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(f"Custom API error: {result.get('error', {}).get('message', 'Unknown error')}")
