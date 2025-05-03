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
                "扩写模式": (["标准", "详细", "自定义"], {"default": "标准"}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 9999999999}),
                "输出语言": (["中文", "英文"], {"default": "英文"})
            },
            "optional": {
                "自定义规则": ("STRING", {"multiline": True, "default": ""})
            }
        }

    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("输出优化", "帮助信息")
    FUNCTION = "optimize_prompt"

    CATEGORY = "utils"

    def optimize_prompt(self, 用户提示词, seed, 扩写模式, 节点开关, 输出语言, 自定义规则=""):  
        if not 节点开关:
            return ("") 

        if not 用户提示词 or not 用户提示词.strip():
            raise ValueError("错误：用户提示词不能为空，请输入内容后再试。")
        
        api_system_prompt = ""
        if 扩写模式 == "标准":
            api_system_prompt = "请编写提示词并给出中英文双语文本，不要带有标题。"
        elif 扩写模式 == "详细":
            api_system_prompt = "请极度详细地编写提示词，增加极度丰富的各种细节，给出中英文双语文本，不要带有标题。"

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
            "model": "openai",
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
            if 输出语言 == "中文":
                chinese_part = re.search(r'[\u4e00-\u9fa5]+.*', optimized_prompt)
                optimized_prompt = chinese_part.group(0) if chinese_part else optimized_prompt
            elif 输出语言 == "英文":
                english_part = re.search(r'[a-zA-Z]+.*', optimized_prompt)
                optimized_prompt = english_part.group(0) if english_part else optimized_prompt
            
        help_info = """【使用说明】
1. 免硬件、免账号，开箱即用
2. 配有开关，方便随时开启或关闭节点功能
3. 支持双语输出，可选择中文或英文
4. 支持标准、详细、自定义三种扩写模式 
5. 支持自定义扩写规则，可根据自己的需求自定义扩写规则

【注意事项】
1. 自定义模式必须输入自定义规则，提示词不能为空
2. 选择自定义模式时，中英文选择功能将失效
"""
        return (optimized_prompt, help_info)