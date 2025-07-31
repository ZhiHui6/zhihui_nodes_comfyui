import random
import requests
import urllib.parse

class WanPromptGenerator:
    CATEGORY = "zhihui/生成器"
    FUNCTION = "generate_prompt"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("提示词",)

    光源类型选项 = [
        "关闭", "随机", "日光", "人工光", "月光", "实用光", "火光", "荧光", "阴天光", "混合光", "晴天光"
    ]
    
    光线类型选项 = [
        "关闭", "随机", "柔光", "硬光", "顶光", "侧光", "背光", "底光", "边缘光", "剪影", "低对比度", "高对比度",
    ]
    
    时间段选项 = [
        "关闭", "随机", "白天", "夜晚", "黄昏", "日落", "日出", "黎明"
    ]
    
    景别选项 = [
        "关闭", "随机", "特写", "近景", "中景", "中近景", "中全景", "全景", "广角"
    ]
    
    构图选项 = [
        "关闭", "随机", "中心构图", "平衡构图", "右侧重构图", "左侧重构图", "对称构图", "短边构图"
    ]
    
    镜头焦段选项 = [
        "关闭", "随机", "中焦距", "广角", "长焦", "望远", "超广角-鱼眼"
    ]
    
    机位角度选项 = [
        "关闭", "随机", "平视角度拍摄", "过肩镜头角度拍摄", "高角度拍摄", "低角度拍摄", "倾斜角度", "航拍", "俯视角度拍摄"
    ]
    
    镜头类型选项 = [
        "关闭", "随机", "干净的单人镜头", "双人镜头", "三人镜头", "群像镜头", "定场镜头"
    ]
    
    色调选项 = [
        "关闭", "随机", "暖色调", "冷色调", "高饱和度", "低饱和度", "混合色调"
    ]
    
    运镜方式选项 = [
        "关闭", "随机", "[基础]镜头推进", "[基础]镜头拉远", "[基础]镜头向右移动", "[基础]镜头向左移动", "[基础]镜头上摇", "[基础]镜头下摇", "[高级]手持镜头", "[高级]跟随镜头", "[高级]环绕运镜", "[高级]复合运镜"
    ]
    
    人物情绪选项 = [
        "关闭", "随机", "愤怒", "恐惧", "高兴", "悲伤", "惊讶", "忧虑", "困惑", "欣慰", "狂喜", "绝望", "平静", "期待", "羞涩", "厌恶", "自豪"
    ]
    
    运动类型选项 = [
        "关闭", "随机", "跑步", "滑滑板", "踢足球", "网球", "乒乓球", "滑雪", "篮球", "橄榄球", "顶碗舞", "侧手翻", "滑板", "骑自行车", "游泳", "跳舞", "瑜伽", "举重", "拳击", "攀岩", "冲浪", "潜水"
    ]
    
    视觉风格选项 = [
        "关闭", "随机", "赛博朋克", "勾线插画", "废土风格", "毛毡风格", "3D卡通", "像素风格", "木偶动画", "水彩画", "3D游戏", "黏土风格", "二次元", "黑白动画", "油画风格"
    ]
    
    特效镜头选项 = [
        "关闭", "随机", "移轴摄影", "延时拍摄"
    ]

    预设组合选项 = [
        "不使用预设", "电影级画面", "记录风格", "动作风格", "浪漫风格", "恐怖风格"
    ]

    预设组合映射 = {
        "电影级画面": "黄昏，柔光，侧光，边缘光，中景，中心构图，暖色调，低饱和度，干净的单人镜头",
        "记录风格": "日光，自然光，平拍，中景，手持镜头，跟随镜头，写实风格",
        "动作风格": "硬光，高对比度，低角度拍摄，快速剪辑，动态模糊，运动镜头",
        "浪漫风格": "黄昏，柔光，背光，近景，暖色调，高饱和度，浅景深",
        "恐怖风格": "夜晚，底光，硬光，倾斜角度，冷色调，低饱和度，手持镜头"
    }

    场景类型选项 = [
        "关闭", "随机",
        "[自然]田野", "[自然]森林", "[自然]山脉", "[自然]草原", "[自然]湖泊", "[自然]河流", "[自然]海洋", "[自然]沙漠", "[自然]雪山", "[自然]雨林", "[自然]花园", "[自然]果园", "[自然]湿地", "[自然]峡谷", "[自然]瀑布", "[自然]火山", "[自然]极光", "[自然]冰川", "[自然]洞穴", "[自然]悬崖",
        "[城市]街道", "[城市]室内", "[城市]建筑", "[城市]公园", "[城市]广场", "[城市]商场", "[城市]地铁站", "[城市]咖啡馆", "[城市]图书馆", "[城市]博物馆", "[城市]剧院", "[城市]体育场", "[城市]游乐场", "[城市]天桥", "[城市]屋顶", "[城市]地下通道", "[城市]停车场", "[城市]写字楼", "[城市]住宅区", "[城市]工业区",
        "[虚构]异世界", "[虚构]太空", "[虚构]梦境", "[虚构]魔法森林", "[虚构]未来城市", "[虚构]古代遗迹", "[虚构]海底王国", "[虚构]天空之城", "[虚构]时间裂缝", "[虚构]镜像世界", "[虚构]虚拟现实", "[虚构]平行宇宙", "[虚构]末日废土", "[虚构]蒸汽朋克", "[虚构]赛博都市", "[虚构]巨龙巢穴", "[虚构]精灵王国", "[虚构]恶魔领域", "[虚构]天使之城", "[虚构]混沌空间"
    ]

    主体类型选项 = [
        "关闭", "随机", 
        "[人物]成年男性", "[人物]成年女性", "[人物]老年男性", "[人物]老年女性", "[人物]青少年男孩", "[人物]青少年女孩", "[人物]儿童男孩", "[人物]儿童女孩", "[人物]婴儿", "[人物]职业人士", "[人物]运动员", "[人物]艺术家", "[人物]科学家", "[人物]教师", "[人物]医生", "[人物]警察", "[人物]消防员", "[人物]军人", "[人物]厨师", "[人物]学生",
        "[动物]猫", "[动物]狗", "[动物]马", "[动物]鸟", "[动物]鱼", "[动物]兔子", "[动物]鹿", "[动物]熊", "[动物]狼", "[动物]狐狸", "[动物]大象", "[动物]老虎", "[动物]狮子", "[动物]熊猫", "[动物]海豚", "[动物]蝴蝶", "[动物]蜜蜂", "[动物]恐龙", "[动物]龙", "[动物]凤凰"  
    ]

    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional": {
                "主体类型": (s.主体类型选项, {"default": "关闭"}),
                "人物情绪": (s.人物情绪选项, {"default": "关闭"}),
                "场景类型": (s.场景类型选项, {"default": "关闭"}),          
                "光源类型": (s.光源类型选项, {"default": "关闭"}),
                "光线类型": (s.光线类型选项, {"default": "关闭"}),
                "时间段": (s.时间段选项, {"default": "关闭"}),
                "景别": (s.景别选项, {"default": "关闭"}),
                "构图": (s.构图选项, {"default": "关闭"}),
                "镜头焦段": (s.镜头焦段选项, {"default": "关闭"}),
                "机位角度": (s.机位角度选项, {"default": "关闭"}),
                "镜头类型": (s.镜头类型选项, {"default": "关闭"}),
                "色调": (s.色调选项, {"default": "关闭"}),
                "运镜方式": (s.运镜方式选项, {"default": "关闭"}),
                "运动类型": (s.运动类型选项, {"default": "关闭"}),
                "视觉风格": (s.视觉风格选项, {"default": "关闭"}),
                "特效镜头": (s.特效镜头选项, {"default": "关闭"}),
                "添加前缀": ("BOOLEAN", {"default": False}),
                "预设组合": (s.预设组合选项, {"default": "不使用预设"}),    
                "启用扩写": ("BOOLEAN", {"default": False}),
                "扩写模型": (["claude","deepseek", "gemini", "openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"], {"default": "openai"}), 
                "补充提示词": ("STRING", {"default": "", "multiline": True}),
            }
        }

    def _get_random_option(self, options_list, exclude_list=None):
        if exclude_list is None:
            exclude_list = ["关闭", "随机", "自定义"]
        available_options = [opt for opt in options_list if opt not in exclude_list and not opt.endswith("随机")]
        return random.choice(available_options) if available_options else ""

    def _process_option(self, value, options_list, prefix_to_remove=None):
        if value == "随机":
            processed_value = self._get_random_option(options_list)
        else:
            processed_value = value

        if processed_value == "关闭":
            return ""

        if prefix_to_remove and processed_value.startswith(prefix_to_remove):
            return processed_value[len(prefix_to_remove):]
        
        if processed_value.startswith("[") and "]" in processed_value:
            return processed_value.split("]", 1)[1]

        return processed_value

    def _call_llm_api(self, text, model="openai"):
        system_prompt = """# 你是万相2.2视频提示词优化专家，请将用户提供的文本扩写出更多极致丰富的各种细节，转换为专业生成视频用的提示词。
## 规则：
- 输出格式：中文逗号分隔。
- 必须包含：光线类型+时间段+景别
- 根据内容自动添加：构图、色调、运镜、风格等。
- 直接输出结果，无需解释。
## 元素选择：
- 光线：日光/人工光/月光/火光/柔光/硬光/顶光/侧光/背光/边缘光
- 时间：白天/夜晚/黄昏/日落/日出/黎明
- 景别：特写/中近景/中景/全景/远景
- 运镜：推镜头/拉镜头/跟拍/环绕/手持
- 色调：暖色调/冷色调/高饱和度/低饱和度
### 示例：
- 输入：一个女孩在海边
- 输出：日落，柔光，边缘光，中景，一个女孩站在海边凝望远方，海浪轻轻拍打，暖色调。
"""
        full_prompt = f"{system_prompt}{text}"
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
        api_url = f"https://text.pollinations.ai/{model_name}/{encoded_prompt}"
        
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

    def generate_prompt(self, 启用扩写, 扩写模型="openai", 添加前缀=False, 预设组合="不使用预设", 补充提示词="", **kwargs):
        
        if 预设组合 != "不使用预设":
            prompt = self.预设组合映射.get(预设组合, "")
            if 启用扩写 and prompt:
                prompt = self._call_llm_api(prompt, 扩写模型)
            if 补充提示词.strip():
                prompt = f"{prompt}，{补充提示词.strip()}" if prompt else 补充提示词.strip()
            if 添加前缀 and prompt:
                prompt = f"画面采用{prompt}"
            return (prompt,)
        
        processed_args = {}
        
        processed_args['主体类型'] = self._process_option(kwargs.get('主体类型'), self.主体类型选项)
        processed_args['场景类型'] = self._process_option(kwargs.get('场景类型'), self.场景类型选项)
        processed_args['运镜方式'] = self._process_option(kwargs.get('运镜方式'), self.运镜方式选项)

        option_map = {
            '光源类型': self.光源类型选项,
            '光线类型': self.光线类型选项,
            '时间段': self.时间段选项,
            '景别': self.景别选项,
            '构图': self.构图选项,
            '镜头焦段': self.镜头焦段选项,
            '机位角度': self.机位角度选项,
            '镜头类型': self.镜头类型选项,
            '色调': self.色调选项,
            '人物情绪': self.人物情绪选项,
            '运动类型': self.运动类型选项,
            '视觉风格': self.视觉风格选项,
            '特效镜头': self.特效镜头选项,
        }

        for key, options in option_map.items():
            processed_args[key] = self._process_option(kwargs.get(key), options)

        elements = [
            f"{processed_args.get('视觉风格')}风格" if processed_args.get('视觉风格') else "",
            processed_args.get('光源类型'),
            processed_args.get('光线类型'),
            processed_args.get('镜头类型'),
            processed_args.get('色调'),
            processed_args.get('特效镜头'),
            processed_args.get('时间段'),
            processed_args.get('景别'),
            processed_args.get('构图'),
            processed_args.get('镜头焦段'),
            processed_args.get('机位角度'),
            processed_args.get('运镜方式')
        ]

        prompt_parts = [e for e in elements if e]
        prompt = "，".join(prompt_parts) if prompt_parts else ""
        
        if 添加前缀:
            end_elements = []
            if processed_args.get('主体类型'):
                end_elements.append(processed_args.get('主体类型'))
            if processed_args.get('场景类型'):
                end_elements.append(processed_args.get('场景类型'))
            if processed_args.get('人物情绪'):
                end_elements.append(processed_args.get('人物情绪'))
            
            if end_elements:
                prompt = f"{prompt}，{ '，'.join(end_elements) }" if prompt else '，'.join(end_elements)
        else:
            front_elements = []
            if processed_args.get('主体类型'):
                front_elements.append(processed_args.get('主体类型'))
            if processed_args.get('场景类型'):
                front_elements.append(processed_args.get('场景类型'))
            
            if front_elements:
                prompt = f"{ '，'.join(front_elements) }，{prompt}" if prompt else '，'.join(front_elements)
        
        if processed_args.get('人物情绪') and not 添加前缀:
            prompt = f"{prompt}，{processed_args.get('人物情绪')}" if prompt else processed_args.get('人物情绪')
        
        if 补充提示词.strip():
             prompt = f"{prompt}，{补充提示词.strip()}" if prompt else 补充提示词.strip()

        if 启用扩写 and prompt:
            prompt = self._call_llm_api(prompt, 扩写模型)
        
        if 添加前缀 and prompt:
            prompt = f"画面采用{prompt}"
        
        return (prompt,)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()