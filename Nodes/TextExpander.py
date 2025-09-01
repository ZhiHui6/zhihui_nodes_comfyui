import requests
import urllib.parse

class TextExpander:
    CATEGORY = "zhihui/文本处理"
    FUNCTION = "expand_text"
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    DESCRIPTION = "文本扩展器：使用AI模型对输入的提示词进行智能扩写。支持多种AI模型，可调节创意温度，设置字符数量限制，并支持自定义系统引导词来控制扩写风格和方向。"

    模型选项 = [
        "claude", "deepseek", "gemini", "openai", "mistral", 
        "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"
    ]

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "节点开关": ("BOOLEAN", {"default": True}),
                "字符量控制": ("STRING", {"default": "", "multiline": False}),
                "创意温度": ("FLOAT", {"default": 0.7, "min": 0.1, "max": 2.0, "step": 0.1}),
                "模型品牌": (s.模型选项, {"default": "openai"}),
                "系统引导词": ("STRING", {"default": "", "multiline": True}),
                "用户提示词": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "加载系统引导词": ("STRING", {"default": "", "multiline": True, "forceInput": True}),
            }
        }

    def _call_llm_api(self, text, model="openai", custom_system_prompt="", temperature=0.7, char_limit=""):
        system_content = custom_system_prompt if custom_system_prompt and custom_system_prompt.strip() else ""
        
        if char_limit and char_limit.strip():
            try:
                char_limit_value = int(char_limit.strip())
                if char_limit_value >= 5:
                    limit_instruction = f"请确保输出内容控制在{char_limit_value}个字符以内。"
                    if system_content:
                        system_content = f"{system_content}\n{limit_instruction}"
                    else:
                        system_content = limit_instruction
            except ValueError:
                pass
        
        if system_content:
            full_prompt = f"{system_content}\n{text}"
        else:
            full_prompt = text
        
        encoded_prompt = urllib.parse.quote(full_prompt)
    
        model_mapping = {
            "claude": "claude",
            "deepseek": "deepseek",
            "gemini": "gemini",
            "openai": "openai",
            "mistral": "mistral",
            "qwen-coder": "qwen-coder",
            "llama": "llama",
            "sur": "sur",
            "unity": "unity",
            "searchgpt": "searchgpt",
            "evil": "evil"
        }
        
        model_name = model_mapping.get(model, "openai")
        api_url = f"https://text.pollinations.ai/{model_name}/{encoded_prompt}?temperature={temperature}"
        
        try:
            response = requests.get(api_url)
            response.raise_for_status()
            return response.text.strip()
        except requests.exceptions.RequestException as e:
            error_message = f"API请求失败: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | 服务器响应: {response.text}"
            print(error_message)
            return text

    def expand_text(self, 节点开关, 字符量控制, 创意温度, 模型品牌, 系统引导词, 用户提示词, 加载系统引导词=None):
        
        if not 节点开关:
            return (用户提示词,)
        
        if not 用户提示词.strip():
            raise ValueError("用户提示词不能为空！请输入需要扩写的提示词内容。")
            
        if 字符量控制 and 字符量控制.strip():
            try:
                char_limit_value = int(字符量控制.strip())
                if char_limit_value < 5:
                    raise ValueError("字符量控制参数不能低于5！请输入大于等于5的数值，或留空禁用该功能。")
            except ValueError as e:
                if "不能低于5" in str(e):
                    raise e
                else:
                    raise ValueError("字符量控制参数必须是有效的数字！请输入大于等于5的数值，或留空禁用该功能。")
        
        actual_system_prompt = 加载系统引导词 if 加载系统引导词 and 加载系统引导词.strip() else 系统引导词
        
        expanded_text = self._call_llm_api(
            用户提示词.strip(),
            model=模型品牌,
            custom_system_prompt=actual_system_prompt,
            temperature=创意温度,
            char_limit=字符量控制
        )
        
        return (expanded_text,)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()