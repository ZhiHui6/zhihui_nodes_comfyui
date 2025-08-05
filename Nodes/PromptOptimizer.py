import requests

class PromptOptimizer:
    def __init__(self):
        self.扩写模式 = ""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "用户提示词": ("STRING", {"multiline": True, "default": ""}), 
                "节点开关": ("BOOLEAN", {"default": True}),
                "扩写模式": (["标准（中文）", "标准（英文）", "详细（中文）", "详细（英文）", "自定义"], {"default": "标准（中文）"}),
                "模型选择": (["gemini", "openai", "deepseek", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil",], {"default": "openai"}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 9999999999})
            },
            "optional": {
                "自定义规则": ("STRING", {"multiline": True, "default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出优化",)
    FUNCTION = "optimize_prompt"
    CATEGORY = "zhihui/生成器"

    def optimize_prompt(self, 用户提示词, seed, 扩写模式, 节点开关, 模型选择, 自定义规则=""):  
        if not 节点开关:
            return ("") 

        if not 用户提示词 or not 用户提示词.strip():
            raise ValueError("错误：用户提示词不能为空，请输入内容后再试。")
        
        api_system_prompt = ""
        if 扩写模式 == "标准（中文）":
            api_system_prompt = "请将我提供的基础提示词进行扩写出用于文生图的简短提示词，给出不要带有标题和过多解释的中文文本。"
        elif 扩写模式 == "详细（中文）":
            api_system_prompt = "请将我提供的基础提示词进行极致详细地扩写出用于文生图的提示词，增加更多丰富的各种细节，给出不要带有标题的中文文本。"
        elif 扩写模式 == "标准（英文）":
            api_system_prompt = "请将我提供的基础提示词进行扩写出用于文生图的简短提示词，给出不要带有标题和过多解释的英文文本。"
        elif 扩写模式 == "详细（英文）":
            api_system_prompt = "请将我提供的基础提示词进行极致详细地扩写出用于文生图的提示词，增加更多丰富的各种细节，给出不要带有标题的英文文本。"

        elif 扩写模式 == "自定义":
            if not 自定义规则 or not 自定义规则.strip():
                raise ValueError("错误：自定义模式必须输入内容，请输入自定义扩写规则后再试。")
            api_system_prompt = 自定义规则

        url = "https://text.pollinations.ai/"
        payload = {
            "messages": [
                {"role": "system", "content": api_system_prompt},
                {"role": "user", "content": "Prompt: " + 用户提示词}
            ],
            "seed": seed,
            "model": 模型选择,
        }
        headers = {
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            optimized_prompt = response.text
        except requests.exceptions.RequestException as e:
            optimized_prompt = "服务器请求失败，请稍后再试"
            print(f"请求发生错误: {type(e).__name__}")

        import re
        if 扩写模式 != "自定义":
            optimized_prompt = optimized_prompt
            
        return (optimized_prompt,)