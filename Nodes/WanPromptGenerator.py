import random
import requests
import urllib.parse

class WanPromptGenerator:
    CATEGORY = "zhihui/Generator"
    FUNCTION = "generate_prompt"
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("source_prompt", "prompt_output")
    DESCRIPTION = "Universal Prompt Generator: Generates professional image prompts through rich parameter options. Supports multi-dimensional settings such as subject type, emotion, action, scene, lighting, composition, etc. Built-in movie scene presets, supports AI expansion, suitable for various creative image generation needs."

    subject_type_options = [
        "关闭", "随机", 
        "[人物]年轻漂亮的女人", "[人物]时尚女孩", "[人物]青春少女", "[人物]儿童女孩", "[人物]中年女性", "[人物]老年女性", "[人物]年轻帅气的男人", "[人物]健美男子", "[人物]阳光男孩", "[人物]儿童男孩", "[人物]中年男性", "[人物]老年男性", 
        "[人物]婴儿", "[人物]职业人士", "[人物]运动员", "[人物]艺术家", "[人物]科学家", "[人物]教师", "[人物]医生", "[人物]警察", "[人物]消防员", "[人物]军人", "[人物]厨师", "[人物]学生",
        "[动物]猫", "[动物]狗", "[动物]马", "[动物]鸟", "[动物]鱼", "[动物]兔子", "[动物]鹿", "[动物]熊", "[动物]狼", "[动物]狐狸", "[动物]大象", "[动物]老虎", "[动物]狮子", "[动物]熊猫", "[动物]海豚", "[动物]蝴蝶", "[动物]蜜蜂", "[动物]恐龙", "[动物]龙", "[动物]凤凰"  
    ]

    character_emotion_options = [
        "关闭", "随机", "愤怒", "恐惧", "高兴", "悲伤", "惊讶", "忧虑", "困惑", "欣慰", "狂喜", "绝望", "平静", "期待", "羞涩", "厌恶", "自豪"
    ]
    
    action_pose_options = [
        "关闭", "随机", 
        "站立", "坐姿", "侧身", "转身", "蹲姿", "躺姿", "行走", "挥手", "拥抱", "握手", "敬礼", "鞠躬", "跳舞", "唱歌", "读书", "写字", "打电话", "拍照", "开车", "做饭", "打扫", "购物", "工作", "睡觉", "冥想", "祈祷", "战斗姿态",
        "荡秋千", "坐过山车", "追逐", "跳跃障碍", "奔跑", "跳跃", "爬行", "进食", "饮水", "玩耍", "打斗", "警戒",
        "[人物]走秀-开场步", "[人物]走秀-转身", "[人物]走秀-定点", "[人物]走秀-台步", "[人物]走秀-猫步", "[人物]走秀-军装步", "[人物]走秀-淑女步", "[人物]走秀-活泼步", "[人物]走秀-停步", "[人物]走秀-退场",
        "[动物]趴卧", "[动物]飞翔", "[动物]捕猎", "[动物]求偶", "[动物]觅食", "[动物]筑巢", "[动物]迁徙", "[动物]挖洞", "[动物]冬眠", "[动物]蜕皮", "[动物]变色", "[动物]喷墨", "[动物]放电", "[动物]发光", "[动物]伪装", "[动物]群体迁徙", "[动物]筑坝"
    ]
    
    scene_type_options = [
        "关闭", "随机",
        "[自然]田野", "[自然]森林", "[自然]山脉", "[自然]草原", "[自然]湖泊", "[自然]河流", "[自然]海洋", "[自然]沙漠", "[自然]雪山", "[自然]雨林", "[自然]花园", "[自然]果园", "[自然]湿地", "[自然]峡谷", "[自然]瀑布", "[自然]火山", "[自然]极光", "[自然]冰川", "[自然]洞穴", "[自然]悬崖",
        "[城市]街道", "[城市]室内", "[城市]建筑", "[城市]公园", "[城市]广场", "[城市]商场", "[城市]地铁站", "[城市]咖啡馆", "[城市]图书馆", "[城市]博物馆", "[城市]剧院", "[城市]体育场", "[城市]游乐场", "[城市]天桥", "[城市]屋顶", "[城市]地下通道", "[城市]停车场", "[城市]写字楼", "[城市]住宅区", "[城市]工业区",
        "[虚构]异世界", "[虚构]太空", "[虚构]梦境", "[虚构]魔法森林", "[虚构]未来城市", "[虚构]古代遗迹", "[虚构]海底王国", "[虚构]天空之城", "[虚构]时间裂缝", "[虚构]镜像世界", "[虚构]虚拟现实", "[虚构]平行宇宙", "[虚构]末日废土", "[虚构]蒸汽朋克", "[虚构]赛博都市", "[虚构]巨龙巢穴", "[虚构]精灵王国", "[虚构]恶魔领域", "[虚构]天使之城", "[虚构]混沌空间",
        "[电影]霍格沃茨大厅", "[电影]中土世界", "[电影]哥谭市", "[电影]阿凡达潘多拉", "[电影]星际穿越空间站", "[电影]泰坦尼克号甲板", "[电影]侏罗纪公园", "[电影]指环王魔多", "[电影]复仇者联盟总部", "[电影]黑客帝国矩阵", "[电影]加勒比海盗船", "[电影]哈利波特对角巷", "[电影]阿甘正传跑步路", "[电影]肖申克监狱", "[电影]教父唐人街", "[电影]夺宝奇兵神庙", "[电影]007秘密基地", "[电影]异形飞船", "[电影]终结者未来", "[电影]狮子王荣耀石",
        "[电影]速度与激情赛车场", "[电影]碟中谍特工基地", "[电影]变形金刚战场", "[电影]钢铁侠实验室", "[电影]蝙蝠侠韦恩庄园", "[电影]超人氪星", "[电影]神奇女侠天堂岛", "[电影]蜘蛛侠纽约街头", "[电影]X战警学校", "[电影]银河护卫队飞船", "[电影]雷神阿斯加德", "[电影]蚁人微观世界", "[电影]黑豹瓦坎达", "[电影]美国队长训练营", "[电影]绿巨人实验室", "[电影]死侍酒吧", "[电影]刀锋战士夜店", "[电影]地狱男爵博物馆", "[电影]木乃伊金字塔",
        "[电影]星球大战死星", "[电影]阿凡达家园树", "[电影]指环王瑞文戴尔", "[电影]哈利波特禁林", "[电影]加勒比海盗沉船湾", "[电影]侏罗纪世界努布拉岛", "[电影]变形金刚赛博坦", "[电影]速度与激情里约", "[电影]碟中谍巴黎", "[电影]007威尼斯", "[电影]蝙蝠侠高谭市", "[电影]超人 Metropolis", "[电影]神奇女侠1984", "[电影]银河护卫队Knowhere", "[电影]雷神新阿斯加德", "[电影]蚁人幽灵维度", "[电影]黑豹仪式挑战场", "[电影]美国队长冬日战士", "[电影]绿巨人浩克世界", "[电影]死侍时间变体管理局",
        "[电影]指环王圣盔谷", "[电影]哈利波特魔法部", "[电影]加勒比海盗托尔图加", "[电影]侏罗纪公园游客中心", "[电影]变形金刚7汽车博物馆", "[电影]速度与激情东京街头", "[电影]碟中谍上海摩天楼", "[电影]007迈阿密海滩", "[电影]蝙蝠侠冰山俱乐部", "[电影]超人孤独堡垒", "[电影]神奇女侠Themyscira岛", "[电影]银河护卫队收藏者博物馆", "[电影]雷神彩虹桥", "[电影]蚁人皮姆科技", "[电影]黑豹瀑布宫殿", "[电影]美国队长史塔克大厦", "[电影]绿巨人萨卡星", "[电影]死侍X特攻队总部", "[电影]X战警金大坚实验室", "[电影]蜘蛛侠号角日报",
        "[电影]夺宝奇兵埃及神庙", "[电影]侏罗纪世界火山", "[电影]变形金刚废墟星球", "[电影]速度与激情多米尼加", "[电影]碟中谍伦敦威斯敏斯特", "[电影]007阿尔卑斯山", "[电影]蝙蝠侠泛美大厦", "[电影]超人肯特农场", "[电影]神奇女侠博物馆", "[电影]银河护卫队星球", "[电影]雷神简的公寓", "[电影]蚁人旧金山", "[电影]黑豹联合国总部", "[电影]美国队长博物馆", "[电影]绿巨人伯克利实验室", "[电影]死侍红门酒吧", "[电影]X战警白宫", "[电影]蜘蛛侠布鲁克林", "[电影]钢铁侠阿富汗", "[电影]木乃伊开罗"
    ]

    light_source_options = [
        "关闭", "随机", "日光", "人工光", "月光", "实用光", "火光", "荧光", "阴天光", "混合光", "晴天光"
    ]
    
    light_type_options = [
        "关闭", "随机", "柔光", "硬光", "顶光", "侧光", "背光", "底光", "边缘光", "剪影", "低对比度", "高对比度",
    ]
    
    time_period_options = [
        "关闭", "随机", "白天", "夜晚", "黄昏", "日落", "日出", "黎明"
    ]
    
    shot_type_options = [
        "关闭", "随机", "特写", "近景", "中景", "中近景", "中全景", "全景", "广角"
    ]
    
    composition_options = [
        "关闭", "随机", "中心构图", "平衡构图", "右侧重构图", "左侧重构图", "对称构图", "短边构图"
    ]
    
    lens_focal_length_options = [
        "关闭", "随机", "中焦距", "广角", "长焦", "望远", "超广角-鱼眼"
    ]
    
    camera_angle_options = [
        "关闭", "随机", "平视角度拍摄", "过肩镜头角度拍摄", "高角度拍摄", "低角度拍摄", "倾斜角度", "航拍", "俯视角度拍摄"
    ]
    
    lens_type_options = [
        "关闭", "随机", "干净的单人镜头", "双人镜头", "三人镜头", "群像镜头", "定场镜头"
    ]
    
    color_tone_options = [
        "关闭", "随机", "暖色调", "冷色调", "高饱和度", "低饱和度", "混合色调"
    ]
    
    camera_movement_options = [
        "关闭", "随机", "[基础]镜头推进", "[基础]镜头拉远", "[基础]镜头向右移动", "[基础]镜头向左移动", "[基础]镜头上摇", "[基础]镜头下摇", "[高级]手持镜头", "[高级]跟随镜头", "[高级]环绕运镜", "[高级]复合运镜",
        "[测试]慢动作推轨镜头", "[测试]无人机环绕拉升", "[测试]焦点转移", "[测试]手持肩扛式跟拍", "[测试]穿越镜头", "[测试]第一人称视角", "[测试]高速旋转镜头", "[测试]水下镜头", "[测试]反射镜头", "[测试]剪影镜头", "[测试]长焦压缩镜头", "[测试]荷兰角", "[测试]弧形滑轨镜头", "[测试]由下至上摇摄"
    ]
    
    motion_type_options = [
        "关闭", "随机", "跑步", "滑滑板", "踢足球", "网球", "乒乓球", "滑雪", "篮球", "橄榄球", "顶碗舞", "侧手翻", "滑板", "骑自行车", "游泳", "跳舞", "瑜伽", "举重", "拳击", "攀岩", "冲浪", "潜水",
        "滑冰", "打篮球", "打网球", "打羽毛球", "打乒乓球", "打高尔夫", "射箭", "跳伞", "蹦极", "街舞", "芭蕾舞", "肚皮舞", "探戈舞", "爵士舞", "嘻哈舞", "打太极",
    ]
    
    visual_style_options = [
        "关闭", "随机", "赛博朋克", "勾线插画", "废土风格", "毛毡风格", "3D卡通", "像素风格", "木偶动画", "水彩画", "3D游戏", "黏土风格", "二次元", "黑白动画", "油画风格"
    ]
    
    special_effect_options = [
        "关闭", "随机", "移轴摄影", "延时拍摄"
    ]

    preset_combination_options = [
        "不使用预设", "电影级画面", "记录风格", "动作风格", "浪漫风格", "恐怖风格"
    ]

    preset_combination_mapping = {
        "电影级画面": "黄昏，柔光，侧光，边缘光，中景，中心构图，暖色调，低饱和度，干净的单人镜头",
        "记录风格": "日光，自然光，平拍，中景，手持镜头，跟随镜头，写实风格",
        "动作风格": "硬光，高对比度，低角度拍摄，快速剪辑，动态模糊，运动镜头",
        "浪漫风格": "黄昏，柔光，背光，近景，暖色调，高饱和度，浅景深",
        "恐怖风格": "夜晚，底光，硬光，倾斜角度，冷色调，低饱和度，手持镜头"
    }

    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional": {
                "enable_node": ("BOOLEAN", {"default": True}),
                "subject_type": (s.subject_type_options, {"default": "随机"}),
                "character_emotion": (s.character_emotion_options, {"default": "随机"}),
                "action_pose": (s.action_pose_options, {"default": "随机"}),
                "scene_type": (s.scene_type_options, {"default": "随机"}),          
                "light_source": (s.light_source_options, {"default": "随机"}),
                "light_type": (s.light_type_options, {"default": "随机"}),
                "time_period": (s.time_period_options, {"default": "随机"}),
                "shot_type": (s.shot_type_options, {"default": "随机"}),
                "composition": (s.composition_options, {"default": "随机"}),
                "lens_focal_length": (s.lens_focal_length_options, {"default": "随机"}),
                "camera_angle": (s.camera_angle_options, {"default": "随机"}),
                "lens_type": (s.lens_type_options, {"default": "随机"}),
                "color_tone": (s.color_tone_options, {"default": "随机"}),
                "camera_movement": (s.camera_movement_options, {"default": "随机"}),
                "motion_type": (s.motion_type_options, {"default": "随机"}),
                "visual_style": (s.visual_style_options, {"default": "随机"}),
                "special_effect": (s.special_effect_options, {"default": "随机"}),
                "preset_combination": (s.preset_combination_options, {"default": "不使用预设"}),
                "add_prefix": ("BOOLEAN", {"default": False}),
                "enable_expansion": ("BOOLEAN", {"default": False}),
                "model_brand": (["claude","deepseek", "gemini", "openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"], {"default": "openai"}), 
                "supplementary_text": ("STRING", {"default": "", "multiline": True}),
                "custom_system_prompt": ("STRING", {"default": "", "multiline": True, "forceInput": True}),
            }
        }

    def _get_random_option(self, options_list):
        exclude_list = ["关闭", "随机"]
        available_options = [opt for opt in options_list if opt not in exclude_list and not opt.endswith("随机")]   
        if available_options:
            prefixed_options = [opt for opt in available_options if opt.startswith("[") and "]" in opt]
            if prefixed_options:
                first_option = prefixed_options[0]
                prefix = first_option.split("]", 1)[0] + "]"
                same_prefix_options = [opt for opt in available_options if opt.startswith(prefix)]
                if same_prefix_options:
                    return random.choice(same_prefix_options)
            return random.choice(available_options)
        return ""

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

    def _call_llm_api(self, text, model="openai", custom_system_prompt=""):
        if custom_system_prompt.strip():
            system_prompt = custom_system_prompt
        else:
            system_prompt = f"""你现在是[通义万相2.2]视频提示词生成专家，你需要将用户提供的文本进行极致详细地扩写出丰富的细节并转换为用于生成视频的专业提示词。请直接给出最终文本，不要有冗余的解释。"""
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
            error_message = f"API request failed: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | Server response: {response.text}"
            print(error_message)
            return text
    
    def generate_prompt(self, enable_expansion, enable_node=True, model_brand="openai", add_prefix=False, preset_combination="不使用预设", supplementary_text="", custom_system_prompt="", **kwargs):
        
        if not enable_node:
            return ("", "")
        
        if preset_combination != "不使用预设":
            original_prompt = self.preset_combination_mapping.get(preset_combination, "")
            if supplementary_text.strip():
                original_prompt = f"{original_prompt}，{supplementary_text.strip()}" if original_prompt else supplementary_text.strip()
            if add_prefix and original_prompt:
                original_prompt = f"画面采用{original_prompt}"
            
            expanded_prompt = original_prompt
            if enable_expansion and original_prompt:
                expanded_prompt = self._call_llm_api(original_prompt, model_brand, custom_system_prompt)
            
            return (original_prompt, expanded_prompt)
        
        processed_args = {}
        processed_args['subject_type'] = self._process_option(kwargs.get('subject_type'), self.subject_type_options)
        processed_args['scene_type'] = self._process_option(kwargs.get('scene_type'), self.scene_type_options)
        processed_args['camera_movement'] = self._process_option(kwargs.get('camera_movement'), self.camera_movement_options)

        option_map = {
            'light_source': self.light_source_options,
            'light_type': self.light_type_options,
            'time_period': self.time_period_options,
            'shot_type': self.shot_type_options,
            'composition': self.composition_options,
            'lens_focal_length': self.lens_focal_length_options,
            'camera_angle': self.camera_angle_options,
            'lens_type': self.lens_type_options,
            'color_tone': self.color_tone_options,
            'character_emotion': self.character_emotion_options,
            'motion_type': self.motion_type_options,
            'visual_style': self.visual_style_options,
            'special_effect': self.special_effect_options,
            'action_pose': self.action_pose_options,
        }

        for key, options in option_map.items():
            processed_args[key] = self._process_option(kwargs.get(key), options)

        elements = [
            processed_args.get('visual_style'),
            processed_args.get('light_source'),
            processed_args.get('light_type'),
            processed_args.get('lens_type'),
            processed_args.get('color_tone'),
            processed_args.get('special_effect'),
            processed_args.get('time_period'),
            processed_args.get('shot_type'),
            processed_args.get('composition'),
            processed_args.get('lens_focal_length'),
            processed_args.get('camera_angle'),
            processed_args.get('camera_movement'),
            processed_args.get('action_pose')
        ]

        prompt_parts = [e for e in elements if e]
        prompt = "，".join(prompt_parts) if prompt_parts else ""
        
        if add_prefix:
            end_elements = []
            if processed_args.get('subject_type'):
                end_elements.append(processed_args.get('subject_type'))
            if processed_args.get('scene_type'):
                end_elements.append(processed_args.get('scene_type'))
            if processed_args.get('character_emotion'):
                end_elements.append(processed_args.get('character_emotion'))
            
            if end_elements:
                prompt = f"{prompt}，{ '，'.join(end_elements) }" if prompt else '，'.join(end_elements)
        else:
            front_elements = []
            if processed_args.get('subject_type'):
                front_elements.append(processed_args.get('subject_type'))
            if processed_args.get('scene_type'):
                front_elements.append(processed_args.get('scene_type'))
            
            if front_elements:
                prompt = f"{ '，'.join(front_elements) }，{prompt}" if prompt else '，'.join(front_elements)
        
        if processed_args.get('character_emotion') and not add_prefix:
            prompt = f"{prompt}，{processed_args.get('character_emotion')}" if prompt else processed_args.get('character_emotion')
        
        if supplementary_text.strip():
             prompt = f"{prompt}，{supplementary_text.strip()}" if prompt else supplementary_text.strip()

        original_prompt = prompt
        if add_prefix and original_prompt:
            original_prompt = f"画面采用{original_prompt}"
        
        expanded_prompt = original_prompt
        if enable_expansion and original_prompt:
            expanded_prompt = self._call_llm_api(original_prompt, model_brand, custom_system_prompt)
        
        return (original_prompt, expanded_prompt)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()