import os
import json
import requests
import urllib.parse
import base64
import random
from typing import Dict, Any
from aiohttp import web
from server import PromptServer

class TagSelector:
    DESCRIPTION = "Provides a visual tag selection interface, allowing users to select tags from preset categories. Supports hierarchical browsing, search functionality, and automatic deduplication. Selected tags are output as comma-separated strings."
    
    def __init__(self):
        self.selected_tags = ""
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "tag_edit": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "选择的标签将显示在这里。\nSelected tags will be displayed here."
                }),
                "auto_random_tags": ("BOOLEAN", {
                    "default": False,
                    "label_on": "On",
                    "label_off": "Off",
                    "tooltip": "启用后将自动生成随机标签。需要先在标签选择器界面中配置随机标签生成设置，包括启用分类、设置权重和数量等参数。"
                }),
                "expand_mode": (["Disabled", "Tag Style", "Natural Language"], {
                    "default": "Disabled",
                    "tooltip": "选择标签扩写模式：禁用/标签风格/自然语言风格"
                }),
                "Expanded_result": (["Chinese", "English"], {
                    "default": "Chinese",
                    "tooltip": "选择扩写结果的语言：中文/英文。仅在启用标签扩写模式时生效。"
                }),
                "expand_model": (["deepseek", "deepseek-reasoning", "gemini", "mistral", "nova-fast", "openai", "openai-large", "openai-reasoning", "evil", "unity"], {
                    "default": "openai",
                    "tooltip": "选择用于标签扩写的AI模型"
                }),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("tags",)
    FUNCTION = "process_tags"
    CATEGORY = "Zhi.AI/Generator"
    
    def process_tags(self, tag_edit, auto_random_tags, expand_mode, Expanded_result, expand_model="openai", unique_id=None, extra_pnginfo=None):
        if auto_random_tags:
            random_tags = self._generate_random_tags()
            if random_tags:
                processed_tags = self.clean_tags(random_tags)
            else:
                processed_tags = self.clean_tags(tag_edit)
        else:
            processed_tags = self.clean_tags(tag_edit)
        
        if expand_mode != "Disabled" and processed_tags.strip():
            expanded_tags = self._expand_tags_with_llm(processed_tags, expand_mode, Expanded_result, expand_model)
            return (expanded_tags,)
        
        return (processed_tags,)
    
    def _generate_random_tags(self):
        try:
            tags_data = self.get_tags_config()
            if not tags_data:
                return ""
            
            random_settings = self.get_random_settings()
            
            generated_tags = []
            used_tags = set()
            
            enabled_categories = [path for path, setting in random_settings['categories'].items() 
                                if setting['enabled']]
            
            if random_settings['includeNSFW'] and random_settings['adultCategories']:
                enabled_adult_categories = [path for path, setting in random_settings['adultCategories'].items() 
                                          if setting['enabled']]
                enabled_categories.extend(enabled_adult_categories)
            
            if not enabled_categories:
                return ""
            
            for category_path in enabled_categories:
                setting = random_settings['categories'].get(category_path) or random_settings['adultCategories'].get(category_path)
                if not setting:
                    continue
                    
                should_include = random.random() < (setting['weight'] / 10)  # 权重转换为概率
                
                if should_include:
                    tags = self._get_tags_from_category_path(tags_data, category_path)
                    if tags:
                        random_tags = random.sample(tags, min(setting['count'], len(tags)))
                        for tag in random_tags:
                            tag_value = tag if isinstance(tag, str) else tag.get('value', tag.get('display', ''))
                            if tag_value and tag_value not in used_tags:
                                used_tags.add(tag_value)
                                generated_tags.append(tag_value)
            
            target_count = random.randint(
                random_settings['totalTagsRange']['min'],
                random_settings['totalTagsRange']['max']
            )
            
            if len(generated_tags) < target_count:
                all_available_tags = self._get_all_available_tags(tags_data, random_settings)
                remaining_tags = [tag for tag in all_available_tags if tag not in used_tags]
                
                additional_count = min(target_count - len(generated_tags), len(remaining_tags))
                if additional_count > 0:
                    additional_tags = random.sample(remaining_tags, additional_count)
                    generated_tags.extend(additional_tags)
            
            return ', '.join(generated_tags)
            
        except Exception as e:
            print(f"Error generating random tags: {e}")
            return ""
    
    def _get_tags_from_category_path(self, tags_data, category_path):
        path_parts = category_path.split('.')
        current = tags_data
        
        for part in path_parts:
            if current and isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return []
        
        return self._extract_all_tags_from_object(current)
    
    def _extract_all_tags_from_object(self, obj):
        tags = []
        
        def extract(current):
            if isinstance(current, dict):
                for key, value in current.items():
                    if isinstance(value, str):
                        tags.append(value)
                    elif isinstance(value, dict):
                        extract(value)
                    elif isinstance(value, list):
                        for item in value:
                            if isinstance(item, dict) and 'value' in item:
                                tags.append(item['value'])
                            elif isinstance(item, str):
                                tags.append(item)
            elif isinstance(current, list):
                for item in current:
                    if isinstance(item, dict) and 'value' in item:
                        tags.append(item['value'])
                    elif isinstance(item, str):
                        tags.append(item)
        
        extract(obj)
        return tags
    
    def _get_all_available_tags(self, tags_data, random_settings):
        all_tags = []
        excluded_categories = random_settings.get('excludedCategories', [])
        include_nsfw = random_settings.get('includeNSFW', False)
        
        def extract_from_category(obj, category_path=''):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{category_path}.{key}" if category_path else key                
                    is_excluded = any(excluded in current_path or excluded in key 
                                    for excluded in excluded_categories)                   
                    if not include_nsfw:
                        nsfw_keywords = ['NSFW', '涩影湿', '擦边', 'R18', '成人', '性行为', '身体部位', 
                                       '道具玩具', '束缚调教', '特殊癖好', '视觉效果']
                        if any(keyword in current_path or keyword in key for keyword in nsfw_keywords):
                            is_excluded = True                   
                    if not is_excluded:
                        if isinstance(value, str):
                            all_tags.append(value)
                        elif isinstance(value, dict):
                            extract_from_category(value, current_path)
                        elif isinstance(value, list):
                            for item in value:
                                if isinstance(item, dict) and 'value' in item:
                                    all_tags.append(item['value'])
                                elif isinstance(item, str):
                                    all_tags.append(item)
        
        extract_from_category(tags_data)
        return all_tags

    def clean_tags(self, tags_text: str) -> str:
        if not tags_text:
            return ""
        
        tags = [tag.strip() for tag in tags_text.split(',') if tag.strip()]

        seen = set()
        unique_tags = []
        for tag in tags:
            if tag not in seen:
                seen.add(tag)
                unique_tags.append(tag)
        
        return ', '.join(unique_tags)
    
    def _expand_tags_with_llm(self, tags_text: str, expand_mode: str, Expanded_result: str, expand_model: str = "openai") -> str:
        try:
            is_chinese = Expanded_result == "Chinese"
            
            if expand_mode == "Tag Style":
                if is_chinese:
                    system_prompt = """你是一个专业的AI绘画提示词扩写助手。请将用户提供的简单标签扩写成极致详细、更丰富的标签形式。

要求：
1. 保持标签格式，用逗号分隔
2. 为每个标签添加更多描述性的修饰词
3. 增加相关的风格、质量、技术参数标签
4. 保持原有标签的核心含义不变
5. 输出应该是可以直接用于AI绘画的提示词标签
6. 直接给出结果，不要出现说明解释性的句段
7. 请用中文输出所有标签

示例：
输入：girl, cat, garden
输出：美丽女孩, 可爱女孩, 精致面部, 表情丰富的眼睛, 可爱猫咪, 毛茸茸的猫, 猫耳朵, 茂盛花园, 盛开花朵, 自然光线, 高质量, 杰作, 精细, 8k分辨率"""
                else:
                    system_prompt = """You are a professional AI art prompt expansion assistant. Please expand the simple tags provided by the user into extremely detailed and more richer tag formats.

Requirements:
1. Maintain tag format, separated by commas
2. Add more descriptive modifiers to each tag
3. Add related style, quality, and technical parameter tags
4. Keep the core meaning of original tags unchanged
5. Output should be prompt tags that can be directly used for AI art
6. Give results directly without explanatory sentences
7. Please output all tags in English

Example:
Input: girl, cat, garden
Output: beautiful girl, cute girl, detailed face, expressive eyes, adorable cat, fluffy cat, cat ears, lush garden, blooming flowers, natural lighting, high quality, masterpiece, detailed, 8k resolution"""
            
            elif expand_mode == "Natural Language":
                if is_chinese:
                    system_prompt = """你是一个专业的AI绘画提示词扩写助手。请将用户提供的标签转换成自然流畅的句子。

要求：
1. 将标签组合成完整的、描述性的句子
2. 添加极致丰富的细节描述
3. 使用生动的形容词和副词
4. 保持语言自然流畅
5. 适合用作AI绘画的提示词
6. 直接给出结果，不要出现说明解释性的句段
7. 请用中文输出描述

示例：
输入：girl, cat, garden
输出：一个美丽的年轻女孩，有着富有表现力的眼睛和温柔笑容，坐在一个郁郁葱葱的盛开花园里，花园里满是五颜六色的花朵，她怀里抱一只可爱猫，猫咪有着柔软的毛发，周围被透过绿叶的自然阳光包围，营造出一个宁静而迷人的场景，具有高细节和艺术品质"""
                else:
                    system_prompt = """You are a professional AI art prompt expansion assistant. Please convert the tags provided by the user into natural and fluent sentences.

Requirements:
1. Combine tags into complete, descriptive sentences
2. Add extreme rich detail descriptions
3. Use vivid adjectives and adverbs
4. Keep language natural and fluent
5. Suitable for use as AI art prompts
6. Give results directly without explanatory sentences
7. Please output description in English

Example:
Input: girl, cat, garden
Output: A beautiful young girl with expressive eyes and a gentle smile, sitting in a lush blooming garden filled with colorful flowers, holding a cute fluffy cat with soft fur, surrounded by natural sunlight filtering through green leaves, creating a peaceful and enchanting scene with high detail and artistic quality"""
            
            else:
                return tags_text
            
            full_prompt = f"{system_prompt}\n\n输入标签：{tags_text}\n\n请扩写："
            encoded_prompt = urllib.parse.quote(full_prompt)
            model_mapping = {
                "gemini": "gemini",
                "mistral": "mistral",
                "nova-fast": "nova-fast",
                "openai": "openai",
                "openai-large": "openai-large",
                "openai-reasoning": "openai-reasoning",
                "evil": "evil",
                "unity": "unity"
            }
            
            model_name = model_mapping.get(expand_model, "openai")
            api_url = f"https://text.pollinations.ai/{model_name}/{encoded_prompt}"
            
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            
            expanded_text = response.text.strip()
            
            if not expanded_text:
                print(f"LLM API returned empty response (model: {expand_model}), using original tags")
                return tags_text
                
            return expanded_text
            
        except requests.exceptions.Timeout:
            print(f"LLM expansion timeout (model: {expand_model}), using original tags")
            return tags_text
        except requests.exceptions.RequestException as e:
            error_msg = f"LLM expansion failed (model: {expand_model}): {e}"
            if 'response' in locals() and response is not None:
                error_msg += f" | status: {response.status_code} | response: {response.text[:200]}..."
            print(error_msg)
            return tags_text
        except Exception as e:
            print(f"LLM expansion failed (model: {expand_model}): {e}")
            return tags_text
    
    @classmethod
    def IS_CHANGED(cls, tag_edit, auto_random_tags, expand_mode, Expanded_result, expand_model=None, unique_id=None, extra_pnginfo=None):
        if auto_random_tags:
            import time
            return f"{tag_edit}_{time.time()}"
        return tag_edit
    
    @classmethod
    def get_random_settings(cls):

        settings_path = os.path.join(os.path.dirname(__file__), "random_settings.json")
        try:
            with open(settings_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not load random settings from file: {e}")
            return cls._get_default_random_settings()
    
    @classmethod
    def save_random_settings(cls, settings):
        settings_path = os.path.join(os.path.dirname(__file__), "random_settings.json")
        try:
            os.makedirs(os.path.dirname(settings_path), exist_ok=True)
            with open(settings_path, 'w', encoding='utf-8') as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving random settings: {e}")
            return False
    
    @classmethod
    def _get_default_random_settings(cls):
        return {
            'categories': {
                '常规标签.画质': {'enabled': True, 'weight': 2, 'count': 1},
                '艺术题材.艺术家风格': {'enabled': True, 'weight': 1, 'count': 1},
                '艺术题材.艺术流派': {'enabled': True, 'weight': 1, 'count': 1},
                '艺术题材.技法形式': {'enabled': True, 'weight': 1, 'count': 1},
                '艺术题材.媒介与效果': {'enabled': True, 'weight': 1, 'count': 1},
                '艺术题材.装饰图案': {'enabled': True, 'weight': 1, 'count': 1},
                '艺术题材.色彩与质感': {'enabled': True, 'weight': 1, 'count': 1}, 
                '人物类.角色.动漫角色': {'enabled': True, 'weight': 2, 'count': 1},
                '人物类.角色.游戏角色': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.角色.二次元虚拟偶像': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.角色.3D动画角色': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.外貌与特征': {'enabled': True, 'weight': 2, 'count': 2},
                '人物类.人设.职业': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.性别/年龄': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.胸部': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.脸型': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.鼻子': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.嘴巴': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.皮肤': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.体型': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.眉毛': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.人设.头发': {'enabled': True, 'weight': 2, 'count': 1},
                '人物类.人设.眼睛': {'enabled': True, 'weight': 2, 'count': 1},
                '人物类.人设.瞳孔': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰': {'enabled': True, 'weight': 2, 'count': 2},
                '人物类.服饰.常服': {'enabled': True, 'weight': 2, 'count': 1},
                '人物类.服饰.泳装': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.运动装': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.内衣': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.配饰': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.鞋类': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.睡衣': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.帽子': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.制服COS': {'enabled': True, 'weight': 1, 'count': 1},
                '人物类.服饰.传统服饰': {'enabled': True, 'weight': 1, 'count': 1},
                '动作/表情.姿态动作': {'enabled': True, 'weight': 2, 'count': 1},
                '动作/表情.多人互动': {'enabled': True, 'weight': 1, 'count': 1},
                '动作/表情.手部': {'enabled': True, 'weight': 1, 'count': 1},
                '动作/表情.腿部': {'enabled': True, 'weight': 1, 'count': 1},
                '动作/表情.眼神': {'enabled': True, 'weight': 1, 'count': 1},
                '动作/表情.表情': {'enabled': True, 'weight': 2, 'count': 1},
                '动作/表情.嘴型': {'enabled': True, 'weight': 1, 'count': 1},
                '常规标签.摄影': {'enabled': True, 'weight': 2, 'count': 1},
                '常规标签.构图': {'enabled': True, 'weight': 2, 'count': 1},
                '常规标签.光影': {'enabled': True, 'weight': 2, 'count': 1},
                '道具.翅膀': {'enabled': True, 'weight': 1, 'count': 1},
                '道具.尾巴': {'enabled': True, 'weight': 1, 'count': 1},
                '道具.耳朵': {'enabled': True, 'weight': 1, 'count': 1},
                '道具.角': {'enabled': True, 'weight': 1, 'count': 1},
                '场景类.光线环境': {'enabled': True, 'weight': 2, 'count': 1},
                '场景类.情感与氛围': {'enabled': True, 'weight': 2, 'count': 1},
                '场景类.背景环境': {'enabled': True, 'weight': 1, 'count': 1},
                '场景类.反射效果': {'enabled': True, 'weight': 1, 'count': 1},
                '场景类.室外': {'enabled': True, 'weight': 2, 'count': 1},
                '场景类.城市': {'enabled': True, 'weight': 1, 'count': 1},
                '场景类.建筑': {'enabled': True, 'weight': 2, 'count': 1},
                '场景类.室内装饰': {'enabled': True, 'weight': 1, 'count': 1},
                '场景类.自然景观': {'enabled': True, 'weight': 2, 'count': 1},
                '场景类.人造景观': {'enabled': True, 'weight': 1, 'count': 1},              
                '动物生物.动物': {'enabled': True, 'weight': 1, 'count': 1},
                '动物生物.幻想生物': {'enabled': True, 'weight': 1, 'count': 1},
                '动物生物.行为动态': {'enabled': True, 'weight': 1, 'count': 1}
            },
            
            'adultCategories': {
                '轻度内容.涩影湿.擦边': {'enabled': True, 'weight': 2, 'count': 1},
                '性行为.涩影湿.NSFW.性行为类型': {'enabled': True, 'weight': 3, 'count': 2},
                '身体部位.涩影湿.NSFW.身体部位': {'enabled': True, 'weight': 2, 'count': 1},
               '道具玩具.涩影湿.NSFW.道具与玩具': {'enabled': False, 'weight': 1, 'count': 1},
                '束缚调教.涩影湿.NSFW.束缚与调教': {'enabled': False, 'weight': 1, 'count': 1},              
                '特殊癖好.涩影湿.NSFW.特殊癖好与情境': {'enabled': False, 'weight': 1, 'count': 1},               
                '视觉效果.涩影湿.NSFW.视觉风格与特定元素': {'enabled': True, 'weight': 1, 'count': 1}
            },
            
            'excludedCategories': ['自定义', '灵感套装'],
            'includeNSFW': False,
            'totalTagsRange': {'min': 12, 'max': 20}
        }
    
    @classmethod
    def get_tags_config(cls):
        config_path = os.path.join(os.path.dirname(__file__), "tags.json")
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading tags config: {e}")
            return {}
    
    @classmethod
    def get_user_tags(cls):
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        try:
            encodings = ['utf-8', 'gbk', 'gb2312']
            user_tags = None
            
            for encoding in encodings:
                try:
                    with open(user_tags_path, 'r', encoding=encoding) as f:
                        user_tags = json.load(f)
                    break
                except UnicodeDecodeError:
                    continue
            
            if user_tags is None:
                with open(user_tags_path, 'rb') as f:
                    content = f.read()
                    for encoding in encodings:
                        try:
                            content_decoded = content.decode(encoding)
                            user_tags = json.loads(content_decoded)
                            break
                        except (UnicodeDecodeError, json.JSONDecodeError):
                            continue
            
            if user_tags is None:
                return {}
            
            converted_tags = {}
            for name, data in user_tags.items():
                if isinstance(data, str):
                    converted_tags[name] = {
                        "content": data,
                        "preview": f"/zhihui/user_tags/preview/{name}"
                    }
                else:
                    converted_tags[name] = data
            return converted_tags
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    @classmethod
    def get_preview_image_path(cls, tag_name):
        user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
        filename = f"{tag_name}_Preview.webp"
        return os.path.join(user_images_dir, filename)

    @classmethod
    def save_preview_image(cls, tag_name, image_data):
        try:
            user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
            if not os.path.exists(user_images_dir):
                os.makedirs(user_images_dir)
            
            if image_data.startswith('data:image'):
                header, encoded = image_data.split(',', 1)
                image_data = encoded
            
            image_bytes = base64.b64decode(image_data)
            
            from PIL import Image
            import io
            
            img = Image.open(io.BytesIO(image_bytes))
            
            if img.mode in ["RGBA", "LA"]:
                pass
            elif img.mode in ["P", "L", "1"]:
                img = img.convert("RGB")
            elif img.mode not in ["RGB", "RGBA"]:
                img = img.convert("RGB")
            
            max_size = 800
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            image_path = cls.get_preview_image_path(tag_name)
            
            img.save(image_path, "WEBP", quality=85, optimize=True, method=6)
            
            return True
        except Exception as e:
            print(f"Error saving preview image: {e}")
            try:
                image_path = cls.get_preview_image_path(tag_name)
                image_bytes = base64.b64decode(image_data)
                with open(image_path, 'wb') as f:
                    f.write(image_bytes)
                return True
            except Exception as fallback_error:
                print(f"Fallback error saving preview image: {fallback_error}")
                return False

    @classmethod
    def save_user_tags(cls, user_tags):
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        try:
            os.makedirs(os.path.dirname(user_tags_path), exist_ok=True)
            with open(user_tags_path, 'w', encoding='utf-8') as f:
                json.dump(user_tags, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving user tags: {e}")
            return False

    @classmethod
    def delete_preview_image(cls, tag_name):
        try:
            image_path = cls.get_preview_image_path(tag_name)
            if os.path.exists(image_path):
                os.remove(image_path)
            return True
        except Exception as e:
            print(f"Error deleting preview image: {e}")
            return False

@PromptServer.instance.routes.get('/zhihui/random_settings')
async def get_random_settings(request):
    try:
        settings = TagSelector.get_random_settings()
        return web.json_response(settings)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/random_settings')
async def save_random_settings(request):
    try:
        data = await request.json()
        
        if TagSelector.save_random_settings(data):
            return web.json_response({"success": True, "message": "随机规则设置保存成功"})
        else:
            return web.json_response({"error": "保存失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get('/zhihui/tags')
async def get_tags(request):
    try:
        tags_data = TagSelector.get_tags_config()
        user_tags = TagSelector.get_user_tags()
        
        if not tags_data:
            tags_data = {}
            
        if user_tags:
            tags_data["自定义"] = {
                "我的标签": user_tags
            }
        else:
            tags_data["自定义"] = {
                "我的标签": {}
            }
        
        return web.json_response(tags_data)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/user_tags')
async def save_user_tag(request):
    try:
        data = await request.json()
        name = data.get('name', '').strip()
        content = data.get('content', '').strip()
        preview_image = data.get('preview_image', None)
        original_name = data.get('original_name', '').strip()
        
        if not name or not content:
            return web.json_response({"error": "名称和内容不能为空"}, status=400)
        
        user_tags = TagSelector.get_user_tags()
        
        if original_name and original_name != name:
            if original_name in user_tags:
                del user_tags[original_name]
                TagSelector.delete_preview_image(original_name)
        
        delete_image = data.get('delete_image', False)
        if original_name and delete_image:
            TagSelector.delete_preview_image(name)
        
        user_tags[name] = {
            "content": content
        }
        
        if not delete_image:
            user_tags[name]["preview"] = f"/zhihui/user_tags/preview/{name}"
        
        if TagSelector.save_user_tags(user_tags):
            if preview_image:
                TagSelector.save_preview_image(name, preview_image)
            elif original_name and delete_image:
                TagSelector.delete_preview_image(name)
            
            message = "标签更新成功！" if original_name else "标签保存成功"
            return web.json_response({"success": True, "message": message})
        else:
            return web.json_response({"error": "保存失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.delete('/zhihui/user_tags')
async def delete_user_tag(request):
    try:
        data = await request.json()
        name = data.get('name', '').strip()
        
        if not name:
            return web.json_response({"error": "标签名称不能为空"}, status=400)
        
        user_tags = TagSelector.get_user_tags()
        if name in user_tags:
            del user_tags[name]
            if TagSelector.save_user_tags(user_tags):
                TagSelector.delete_preview_image(name)
                return web.json_response({"success": True, "message": "标签删除成功"})
            else:
                return web.json_response({"error": "删除失败"}, status=500)
        else:
            return web.json_response({"error": "标签不存在"}, status=404)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get('/zhihui/user_tags/preview/{tag_name}')
async def get_user_tag_preview(request):
    try:
        tag_name = request.match_info['tag_name']
        image_path = TagSelector.get_preview_image_path(tag_name)
        
        if os.path.exists(image_path):
            return web.FileResponse(image_path)
        else:
            return web.json_response({"error": "预览图不存在"}, status=404)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.delete('/zhihui/user_tags/all')
async def delete_all_user_tags_and_images(request):
    try:
        user_tags = TagSelector.get_user_tags()
        
        if TagSelector.save_user_tags({}):
            user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
            if os.path.exists(user_images_dir):
                deleted_count = 0
                for filename in os.listdir(user_images_dir):
                    if filename.endswith('_Preview.webp'):
                        image_path = os.path.join(user_images_dir, filename)
                        try:
                            os.remove(image_path)
                            deleted_count += 1
                        except Exception as e:
                            print(f"Error deleting image {filename}: {e}")
                
                return web.json_response({
                    "success": True, 
                    "message": f"所有自定义标签和图片已删除（共删除 {deleted_count} 张图片）"
                })
            else:
                return web.json_response({
                    "success": True, 
                    "message": "所有自定义标签已删除（未找到用户图片文件夹）"
                })
        else:
            return web.json_response({"error": "删除标签失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get('/zhihui/user_tags/backup')
async def backup_user_tags(request):
    try:
        import zipfile
        import io
        
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zip_file:
            if os.path.exists(user_tags_path):
                zip_file.write(user_tags_path, arcname="user_tags.json")
            
            if os.path.exists(user_images_dir):
                for root, dirs, files in os.walk(user_images_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, os.path.dirname(user_images_dir))
                        zip_file.write(file_path, arcname=arcname)
        
        zip_buffer.seek(0)
        
        response = web.Response(
            body=zip_buffer.getvalue(),
            content_type='application/zip',
            headers={
                'Content-Disposition': 'attachment; filename="user_tags_backup.zip"'
            }
        )
        
        return response
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post('/zhihui/user_tags/restore')
async def restore_user_tags(request):
    try:
        import zipfile
        import io
        
        data = await request.post()
        backup_file = data.get('backup_file')
        
        if not backup_file:
            return web.json_response({"error": "未选择备份文件"}, status=400)
        
        zip_buffer = io.BytesIO(backup_file.file.read())
        
        with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
            user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
            user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
            
            if 'user_tags.json' in zip_file.namelist():
                with zip_file.open('user_tags.json') as source_file:
                    content = source_file.read()
                    with open(user_tags_path, 'wb') as dest_file:
                        dest_file.write(content)
            
            for file_info in zip_file.infolist():
                if file_info.filename.startswith('user_images/') and not file_info.is_dir():
                    dest_path = os.path.join(os.path.dirname(__file__), file_info.filename)
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    with zip_file.open(file_info) as source_file:
                        with open(dest_path, 'wb') as dest_file:
                            dest_file.write(source_file.read())
        
        return web.json_response({"success": True, "message": "恢复成功"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)