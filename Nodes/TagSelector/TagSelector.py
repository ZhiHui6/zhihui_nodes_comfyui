import os
import json
import requests
import base64
import random
from typing import Dict, Any, Optional, List, Set
from aiohttp import web
from server import PromptServer
from functools import lru_cache
import time
import urllib.parse
from cryptography.fernet import Fernet
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class TagSelectorCache:
    _instance = None
    _config_cache = None
    _config_cache_time = 0
    _api_keys_cache = None
    _api_keys_cache_time = 0
    _tags_data_cache = None
    _tags_data_cache_time = 0
    _random_settings_cache = None
    _random_settings_cache_time = 0
    CACHE_TTL = 5

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_config(self, config_path: str) -> dict:
        current_time = time.time()
        if (self._config_cache is not None and 
            current_time - self._config_cache_time < self.CACHE_TTL):
            return self._config_cache
        
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                self._config_cache = json.load(f)
                self._config_cache_time = current_time
                return self._config_cache
        except Exception:
            return {"platforms": {}, "default_platform": "auto"}

    def get_api_keys(self, keys_path: str) -> dict:
        current_time = time.time()
        if (self._api_keys_cache is not None and 
            current_time - self._api_keys_cache_time < self.CACHE_TTL):
            return self._api_keys_cache
        
        try:
            with open(keys_path, "r", encoding="utf-8") as f:
                self._api_keys_cache = json.load(f)
                self._api_keys_cache_time = current_time
                return self._api_keys_cache
        except Exception:
            return {}

    def invalidate_config_cache(self):
        self._config_cache = None
        self._config_cache_time = 0

    def invalidate_api_keys_cache(self):
        self._api_keys_cache = None
        self._api_keys_cache_time = 0


class TagSelector:
    DESCRIPTION = "Provides a visual tag selection interface, allowing users to select tags from preset categories. Supports hierarchical browsing, search functionality, and automatic deduplication. Selected tags are output as comma-separated strings."

    def __init__(self):
        self.selected_tags = ""
        self.config_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "zhiai_api_config.json",
        )
        self.keys_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "zhiai_api_keys.json",
        )
        self._cache = TagSelectorCache.get_instance()
        self.config = self._cache.get_config(self.config_path)
        self.api_keys = self._cache.get_api_keys(self.keys_path)

    def load_config(self):
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load config file: {e}")
            return self.get_default_config()

    def load_api_keys(self):
        try:
            with open(self.keys_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def get_api_key(self, platform):
        return self.api_keys.get(platform, "")

    def get_default_config(self):
        return {"platforms": {}, "default_platform": "auto"}

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
                "tag_edit": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "选择的标签将显示在这里。\nSelected tags will be displayed here.",
                    },
                ),
                "random_logic": (
                    ["Disabled", "Random Tags", "Character Extractor"],
                    {
                        "default": "Disabled",
                        "tooltip": "Select random tag generation logic: Disabled - disable random function; Random Tags - generate tags using rules configured in the random tags interface; Character Extractor - use the character extractor feature to get tags",
                    },
                ),
                "expand_mode": (
                    ["Disabled", "Tag Style", "Natural Language", "Structured JSON"],
                    {
                        "default": "Disabled",
                        "tooltip": "选择标签扩写模式：禁用/标签风格/自然语言风格/JSON结构化",
                    },
                ),
                "output_language": (
                    ["Chinese", "English"],
                    {
                        "default": "Chinese",
                        "tooltip": "选择扩写结果的语言：中文/英文。仅在启用标签扩写模式时生效。",
                    },
                ),
                "platform": (
                    platforms,
                    {"default": "auto", "tooltip": "选择用于标签扩写的API平台"},
                ),
                "max_tokens": (
                    "INT",
                    {
                        "default": 2048,
                        "min": 256,
                        "max": 8192,
                        "step": 256,
                        "tooltip": "设置AI生成内容的最大令牌数",
                    },
                ),
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

    def process_tags(
        self,
        tag_edit,
        random_logic,
        expand_mode,
        output_language,
        platform="auto",
        max_tokens=2048,
        unique_id=None,
        extra_pnginfo=None,
    ):
        if random_logic == "Random Tags":
            random_tags = self._generate_random_tags()
            if random_tags:
                processed_tags = self.clean_tags(random_tags)
            else:
                processed_tags = self.clean_tags(tag_edit)
        elif random_logic == "Character Extractor":
            extractor_tags = self._generate_extractor_tags()
            if extractor_tags:
                processed_tags = self.clean_tags(extractor_tags)
            else:
                processed_tags = self.clean_tags(tag_edit)
        else:
            processed_tags = self.clean_tags(tag_edit)

        if expand_mode != "Disabled" and processed_tags.strip():
            expanded_tags = self._expand_tags_with_llm(
                processed_tags, expand_mode, output_language, platform, max_tokens
            )
            return (expanded_tags,)

        return (processed_tags,)

    def _generate_random_tags(self):
        try:
            tags_data = self.get_tags_config()
            if not tags_data:
                print("[Zhihui] Random Tags: No tags data available")
                return ""

            random_settings = self.get_random_settings()
            print(f"[Zhihui] Random Tags: loaded settings, categories count={len(random_settings.get('categories', {}))}")

            generated_tags = []
            used_tags = set()

            enabled_categories = [
                path
                for path, setting in random_settings["categories"].items()
                if setting["enabled"]
            ]
            print(f"[Zhihui] Random Tags: enabled_categories count={len(enabled_categories)}")

            if random_settings.get("adultCategories"):
                enabled_adult_categories = [
                    path
                    for path, setting in random_settings["adultCategories"].items()
                    if setting["enabled"]
                ]
                enabled_categories.extend(enabled_adult_categories)

            if not enabled_categories:
                print("[Zhihui] Random Tags: No enabled categories, returning empty")
                return ""

            for category_path in enabled_categories:
                setting = random_settings["categories"].get(
                    category_path
                ) or random_settings["adultCategories"].get(category_path)
                if not setting:
                    continue

                should_include = random.random() < (
                    setting["weight"] / 10
                )  # 权重转换为概率

                if should_include:
                    tags = self._get_tags_from_category_path(tags_data, category_path)
                    if tags:
                        random_tags = random.sample(
                            tags, min(setting["count"], len(tags))
                        )
                        for tag in random_tags:
                            tag_value = (
                                tag
                                if isinstance(tag, str)
                                else tag.get("value", tag.get("display", ""))
                            )
                            if tag_value and tag_value not in used_tags:
                                used_tags.add(tag_value)
                                generated_tags.append(tag_value)

            target_count = random.randint(
                random_settings["totalTagsRange"]["min"],
                random_settings["totalTagsRange"]["max"],
            )

            if len(generated_tags) < target_count:
                all_available_tags = self._get_all_available_tags(
                    tags_data, random_settings
                )
                remaining_tags = [
                    tag for tag in all_available_tags if tag not in used_tags
                ]

                additional_count = min(
                    target_count - len(generated_tags), len(remaining_tags)
                )
                if additional_count > 0:
                    additional_tags = random.sample(remaining_tags, additional_count)
                    generated_tags.extend(additional_tags)

            result = ", ".join(generated_tags)
            print(f"[Zhihui] Random Tags: generated {len(generated_tags)} tags, result length={len(result)}")
            return result

        except Exception as e:
            print(f"[Zhihui] Error generating random tags: {e}")
            import traceback
            traceback.print_exc()
            return ""

    def _generate_extractor_tags(self):
        try:
            extractor_settings = self.get_extractor_settings()

            seed = extractor_settings.get("seed", -1) if extractor_settings else -1
            excluded = extractor_settings.get("excluded", "") if extractor_settings else ""
            custom_prompt = extractor_settings.get("customPrompt", "") if extractor_settings else ""

            if seed == -1:
                seed = random.randint(0, 0xffffffffffffffff)

            print(f"[Zhihui] Character Extractor: seed={seed}, excluded={excluded}, custom_prompt={custom_prompt}")
            prompt_data = fetch_cosplay_prompt(seed, excluded, custom_prompt)
            print(f"[Zhihui] Character Extractor: prompt_data type={type(prompt_data).__name__}")

            if isinstance(prompt_data, str):
                print(f"[Zhihui] Character Extractor error: {prompt_data}")
                return ""

            original_prompt = prompt_data.get("prompt", "")
            print(f"[Zhihui] Character Extractor: original_prompt length={len(original_prompt)}")
            if not original_prompt:
                return ""

            filtered_prompt = filter_prompt_by_excluded(original_prompt, excluded)
            print(f"[Zhihui] Character Extractor: filtered_prompt length={len(filtered_prompt)}")
            return filtered_prompt

        except Exception as e:
            print(f"[Zhihui] Error generating extractor tags: {e}")
            import traceback
            traceback.print_exc()
            return ""

    def _fetch_character_tags(self, seed, excluded, custom_prompt):
        try:
            tags_data = self.get_tags_config()
            if not tags_data:
                return ""

            cosplay_data = tags_data.get("cosplay", {})
            if not cosplay_data:
                return ""

            random.seed(seed)

            all_cosplay_tags = []
            for category, items in cosplay_data.items():
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, dict) and "value" in item:
                            all_cosplay_tags.append(item["value"])
                        elif isinstance(item, str):
                            all_cosplay_tags.append(item)

            if not all_cosplay_tags:
                return ""

            excluded_list = [e.strip() for e in excluded.split(",") if e.strip()]
            filtered_tags = [t for t in all_cosplay_tags if not any(e in t for e in excluded_list)]

            if not filtered_tags:
                filtered_tags = all_cosplay_tags

            count = random.randint(3, 8)
            selected_tags = random.sample(filtered_tags, min(count, len(filtered_tags)))

            if custom_prompt:
                selected_tags.append(custom_prompt)

            return ", ".join(selected_tags)

        except Exception as e:
            print(f"Error fetching character tags: {e}")
            return ""

    def get_extractor_settings(self):
        try:
            settings_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "Nodes",
                "TagSelector",
                "extractor_settings.json"
            )
            if os.path.exists(settings_path):
                with open(settings_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            return {"enabled": False, "seed": -1, "excluded": "", "customPrompt": ""}
        except Exception:
            return {"enabled": False, "seed": -1, "excluded": "", "customPrompt": ""}

    def _get_tags_from_category_path(self, tags_data, category_path):
        path_parts = category_path.split(".")
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
                            if isinstance(item, dict) and "value" in item:
                                tags.append(item["value"])
                            elif isinstance(item, str):
                                tags.append(item)
            elif isinstance(current, list):
                for item in current:
                    if isinstance(item, dict) and "value" in item:
                        tags.append(item["value"])
                    elif isinstance(item, str):
                        tags.append(item)

        extract(obj)
        return tags

    def _get_all_available_tags(self, tags_data, random_settings):
        all_tags = []
        excluded_categories = random_settings.get("excludedCategories", [])

        def extract_from_category(obj, category_path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{category_path}.{key}" if category_path else key
                    is_excluded = any(
                        excluded in current_path or excluded in key
                        for excluded in excluded_categories
                    )
                    if not is_excluded:
                        if isinstance(value, str):
                            all_tags.append(value)
                        elif isinstance(value, dict):
                            extract_from_category(value, current_path)
                        elif isinstance(value, list):
                            for item in value:
                                if isinstance(item, dict) and "value" in item:
                                    all_tags.append(item["value"])
                                elif isinstance(item, str):
                                    all_tags.append(item)

        extract_from_category(tags_data)
        return all_tags

    def clean_tags(self, tags_text: str) -> str:
        if not tags_text:
            return ""

        tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]

        seen = set()
        unique_tags = []
        for tag in tags:
            if tag not in seen:
                seen.add(tag)
                unique_tags.append(tag)

        return ", ".join(unique_tags)

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

    def _expand_tags_with_llm(
        self,
        tags_text: str,
        expand_mode: str,
        output_language: str,
        selected_platform: str = "auto",
        max_tokens: int = 2048,
    ) -> str:
        try:
            is_chinese = output_language == "Chinese"

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

            elif expand_mode == "Structured JSON":
                if is_chinese:
                    system_prompt = """你是一位精通AI绘画提示词结构化设计的专家，擅长将描述转化为结构清晰的JSON格式提示词。

你的任务是将用户提供的标签转化为结构化的JSON格式，便于程序解析和处理。

输出JSON结构说明：
{
    "quality": ["画质相关标签，如masterpiece, best quality, highly detailed等"],
    "subject": {
        "main": "主体描述，如人物、物体、场景等",
        "appearance": ["外观特征，如发型、肤色、体型等"],
        "clothing": ["服装描述"],
        "accessories": ["配饰描述"],
        "pose": ["姿态动作"],
        "expression": ["表情描述"]
    },
    "environment": {
        "location": "场景位置",
        "lighting": ["光线效果"],
        "atmosphere": ["氛围描述"],
        "background": ["背景元素"]
    },
    "style": {
        "art_style": ["艺术风格，如写实、动漫、油画等"],
        "technique": ["技法，如水彩、素描、3D渲染等"],
        "color_palette": ["色彩风格"]
    },
    "technical": {
        "composition": ["构图方式"],
        "camera": ["镜头参数"],
        "rendering": ["渲染技术"]
    }
}

要求：
1. 根据用户提供的标签，智能填充JSON结构的各个字段
2. 如果某些字段不适用，可以省略或设为空数组
3. 标签使用英文，描述性文字使用中文
4. 直接输出JSON对象，不要添加任何解释或markdown代码块标记"""
                else:
                    system_prompt = """You are an expert in AI art prompt structured design, skilled at converting descriptions into clearly structured JSON format prompts.

Your task is to convert the tags provided by the user into a structured JSON format for program parsing and processing.

JSON structure specification:
{
    "quality": ["quality related tags, e.g. masterpiece, best quality, highly detailed"],
    "subject": {
        "main": "main subject description, e.g. person, object, scene",
        "appearance": ["appearance features, e.g. hairstyle, skin tone, body type"],
        "clothing": ["clothing description"],
        "accessories": ["accessories description"],
        "pose": ["pose and action"],
        "expression": ["expression description"]
    },
    "environment": {
        "location": "scene location",
        "lighting": ["lighting effects"],
        "atmosphere": ["atmosphere description"],
        "background": ["background elements"]
    },
    "style": {
        "art_style": ["art style, e.g. realistic, anime, oil painting"],
        "technique": ["technique, e.g. watercolor, sketch, 3D render"],
        "color_palette": ["color style"]
    },
    "technical": {
        "composition": ["composition method"],
        "camera": ["camera parameters"],
        "rendering": ["rendering technology"]
    }
}

Requirements:
1. Intelligently fill the JSON structure fields based on user-provided tags
2. If certain fields are not applicable, omit them or set to empty arrays
3. Use English for tags
4. Output JSON object directly without any explanation or markdown code block markers"""

            else:
                return tags_text

            self.config = self.load_config()
            platform_id, platform_config = self.get_platform(selected_platform)

            if not platform_id:
                error_output = "[TagSelector] 错误：未配置可用的API平台\n请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥"
                print("\n" + "=" * 60)
                print("[TagSelector] 错误：未配置可用的API平台")
                print("=" * 60)
                print(
                    "请在ComfyUI设置页面的 ZhiAI > API配置 中配置至少一个平台的API密钥"
                )
                print("=" * 60 + "\n")
                return error_output

            if platform_config is None:
                platform_names = {}
                for p_key, p_info in self.config.get("platforms", {}).items():
                    if isinstance(p_info, dict):
                        platform_names[p_key] = p_info.get("name", p_key)
                if "User-defined" not in platform_names.values():
                    platform_names["custom"] = "User-defined"
                platform_name = platform_names.get(platform_id, platform_id)
                error_output = f"[TagSelector] 错误：当前选择的平台 '{platform_name}' 未配置API密钥\n请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台"
                print("\n" + "=" * 60)
                print(
                    f"[TagSelector] 错误：当前选择的平台 '{platform_name}' 未配置API密钥"
                )
                print("=" * 60)
                print(
                    f"请在设置页面配置 {platform_name} 的API密钥，或将默认平台切换为其他已配置的平台"
                )
                print("=" * 60 + "\n")
                return error_output

            api_key = self.get_api_key(platform_id)
            if not api_key:
                error_output = f"[TagSelector] 错误：{platform_config['name']} 未配置API密钥\n请在设置页面配置 {platform_config['name']} 的API密钥"
                print("\n" + "=" * 60)
                print(f"[TagSelector] 错误：{platform_config['name']} 未配置API密钥")
                print("=" * 60)
                print(f"请在设置页面配置 {platform_config['name']} 的API密钥")
                print("=" * 60 + "\n")
                return error_output

            user_prompt = f"输入标签：{tags_text}\n\n请扩写："
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
                "custom": self.call_custom,
            }

            call_method = platform_call_methods.get(platform_id)
            if call_method:
                result = call_method(
                    platform_id,
                    platform_config,
                    system_prompt,
                    user_prompt,
                    max_tokens,
                    temperature,
                )
                return result
            else:
                return tags_text

        except Exception as e:
            error_msg = str(e)
            error_output = f"[TagSelector] API调用失败：{platform_config['name']}\n错误信息：{error_msg}\n可能的原因：\n  1. API密钥无效或已过期\n  2. 网络连接问题\n  3. API服务暂时不可用\n  4. 模型名称不正确\n建议：请检查设置页面的API配置，或尝试切换其他平台"
            print("\n" + "=" * 60)
            print(f"[TagSelector] API调用失败：{platform_config['name']}")
            print("=" * 60)
            print(f"错误信息：{error_msg}")
            print("-" * 60)
            print("可能的原因：")
            print("  1. API密钥无效或已过期")
            print("  2. 网络连接问题")
            print("  3. API服务暂时不可用")
            print("  4. 模型名称不正确")
            print("-" * 60)
            print("建议：请检查设置页面的API配置，或尝试切换其他平台")
            print("=" * 60 + "\n")
            return error_output

    def call_openai(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gpt-4o-mini")
        base_url = (
            config["config"].get("base_url", "https://api.openai.com/v1").rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"OpenAI API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_claude(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "claude-3-5-sonnet-20241022")
        base_url = (
            config["config"].get("base_url", "https://api.anthropic.com").rstrip("/")
        )

        url = f"{base_url}/v1/messages"
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
        }
        data = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "content" in result:
            return result["content"][0]["text"].strip()
        else:
            raise Exception(
                f"Claude API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_gemini(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gemini-1.5-flash")
        base_url = (
            config["config"]
            .get("base_url", "https://generativelanguage.googleapis.com")
            .rstrip("/")
        )

        url = f"{base_url}/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": system_prompt + "\n\n" + user_prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "candidates" in result:
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            raise Exception(
                f"Gemini API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_zhipu(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "glm-4-flash")
        base_url = (
            config["config"]
            .get("base_url", "https://open.bigmodel.cn/api/paas/v4")
            .rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"Zhipu API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_deepseek(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "deepseek-chat")
        base_url = (
            config["config"].get("base_url", "https://api.deepseek.com").rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"DeepSeek API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_siliconflow(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "Qwen/Qwen2.5-7B-Instruct")
        base_url = (
            config["config"]
            .get("base_url", "https://api.siliconflow.cn/v1")
            .rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"SiliconFlow API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_kimi(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "moonshot-v1-8k")
        base_url = (
            config["config"].get("base_url", "https://api.moonshot.cn/v1").rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"Kimi API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_minimax(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "MiniMax-M2.5")
        base_url = (
            config["config"].get("base_url", "https://api.minimaxi.com/v1").rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"MiniMax API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_qwen(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "qwen-turbo")
        base_url = (
            config["config"]
            .get("base_url", "https://dashscope.aliyuncs.com/compatible-mode/v1")
            .rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"Qwen API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_openrouter(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "openai/gpt-4o-mini")
        base_url = (
            config["config"].get("base_url", "https://openrouter.ai/api/v1").rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com",
            "X-Title": "ComfyUI ZhiAI Nodes",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"OpenRouter API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_tencent(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "hunyuan-lite")
        base_url = (
            config["config"]
            .get("base_url", "https://hunyuan.tencentcloudapi.com")
            .rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"Tencent API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_nvidia(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "nvidia/llama-3.1-nemotron-70b-instruct")
        base_url = (
            config["config"]
            .get("base_url", "https://integrate.api.nvidia.com/v1")
            .rstrip("/")
        )

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"NVIDIA API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    def call_custom(
        self, platform_id, config, system_prompt, user_prompt, max_tokens, temperature
    ):
        api_key = self.get_api_key(platform_id)
        model = config["config"].get("model", "gpt-4-turbo")
        base_url = config["config"].get("base_url", "").rstrip("/")
        api_url = config["config"].get("api_url", f"{base_url}/chat/completions")

        if not api_url:
            api_url = f"{base_url}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        response = requests.post(api_url, headers=headers, json=data, timeout=60)
        result = response.json()

        if response.status_code == 200 and "choices" in result:
            return result["choices"][0]["message"]["content"].strip()
        else:
            raise Exception(
                f"Custom API error: {result.get('error', {}).get('message', 'Unknown error')}"
            )

    @classmethod
    def IS_CHANGED(
        cls,
        tag_edit,
        random_logic,
        expand_mode,
        output_language,
        platform=None,
        max_tokens=None,
        unique_id=None,
        extra_pnginfo=None,
    ):
        if random_logic != "Disabled":
            import time

            return f"{tag_edit}_{random_logic}_{time.time()}"
        return tag_edit

    @classmethod
    def get_random_settings(cls):
        settings_path = os.path.join(os.path.dirname(__file__), "random_settings.json")
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not load random settings from file: {e}")
            return cls._get_default_random_settings()

    @classmethod
    def save_random_settings(cls, settings):
        settings_path = os.path.join(os.path.dirname(__file__), "random_settings.json")
        try:
            os.makedirs(os.path.dirname(settings_path), exist_ok=True)
            with open(settings_path, "w", encoding="utf-8") as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving random settings: {e}")
            return False

    @classmethod
    def _get_default_random_settings(cls):
        return {
            "categories": {
                "常规标签.画质": {"enabled": True, "weight": 2, "count": 1},
                "艺术题材.艺术家风格": {"enabled": True, "weight": 1, "count": 1},
                "艺术题材.艺术流派": {"enabled": True, "weight": 1, "count": 1},
                "艺术题材.技法形式": {"enabled": True, "weight": 1, "count": 1},
                "艺术题材.媒介与效果": {"enabled": True, "weight": 1, "count": 1},
                "艺术题材.装饰图案": {"enabled": True, "weight": 1, "count": 1},
                "艺术题材.色彩与质感": {"enabled": True, "weight": 1, "count": 1},
                "人物类.角色.动漫角色": {"enabled": True, "weight": 2, "count": 1},
                "人物类.角色.游戏角色": {"enabled": True, "weight": 1, "count": 1},
                "人物类.角色.二次元虚拟偶像": {
                    "enabled": True,
                    "weight": 1,
                    "count": 1,
                },
                "人物类.角色.3D动画角色": {"enabled": True, "weight": 1, "count": 1},
                "人物类.外貌与特征": {"enabled": True, "weight": 2, "count": 2},
                "人物类.人设.职业": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.性别/年龄": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.胸部": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.脸型": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.鼻子": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.嘴巴": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.皮肤": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.体型": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.眉毛": {"enabled": True, "weight": 1, "count": 1},
                "人物类.人设.头发": {"enabled": True, "weight": 2, "count": 1},
                "人物类.人设.眼睛": {"enabled": True, "weight": 2, "count": 1},
                "人物类.人设.瞳孔": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰": {"enabled": True, "weight": 2, "count": 2},
                "人物类.服饰.常服": {"enabled": True, "weight": 2, "count": 1},
                "人物类.服饰.泳装": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.运动装": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.内衣": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.配饰": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.鞋类": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.睡衣": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.帽子": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.制服COS": {"enabled": True, "weight": 1, "count": 1},
                "人物类.服饰.传统服饰": {"enabled": True, "weight": 1, "count": 1},
                "动作/表情.姿态动作": {"enabled": True, "weight": 2, "count": 1},
                "动作/表情.多人互动": {"enabled": True, "weight": 1, "count": 1},
                "动作/表情.手部": {"enabled": True, "weight": 1, "count": 1},
                "动作/表情.腿部": {"enabled": True, "weight": 1, "count": 1},
                "动作/表情.眼神": {"enabled": True, "weight": 1, "count": 1},
                "动作/表情.表情": {"enabled": True, "weight": 2, "count": 1},
                "动作/表情.嘴型": {"enabled": True, "weight": 1, "count": 1},
                "常规标签.摄影": {"enabled": True, "weight": 2, "count": 1},
                "常规标签.构图": {"enabled": True, "weight": 2, "count": 1},
                "常规标签.光影": {"enabled": True, "weight": 2, "count": 1},
                "道具.翅膀": {"enabled": True, "weight": 1, "count": 1},
                "道具.尾巴": {"enabled": True, "weight": 1, "count": 1},
                "道具.耳朵": {"enabled": True, "weight": 1, "count": 1},
                "道具.角": {"enabled": True, "weight": 1, "count": 1},
                "场景类.光线环境": {"enabled": True, "weight": 2, "count": 1},
                "场景类.情感与氛围": {"enabled": True, "weight": 2, "count": 1},
                "场景类.背景环境": {"enabled": True, "weight": 1, "count": 1},
                "场景类.反射效果": {"enabled": True, "weight": 1, "count": 1},
                "场景类.室外": {"enabled": True, "weight": 2, "count": 1},
                "场景类.城市": {"enabled": True, "weight": 1, "count": 1},
                "场景类.建筑": {"enabled": True, "weight": 2, "count": 1},
                "场景类.室内装饰": {"enabled": True, "weight": 1, "count": 1},
                "场景类.自然景观": {"enabled": True, "weight": 2, "count": 1},
                "场景类.人造景观": {"enabled": True, "weight": 1, "count": 1},
                "动物生物.动物": {"enabled": True, "weight": 1, "count": 1},
                "动物生物.幻想生物": {"enabled": True, "weight": 1, "count": 1},
                "动物生物.行为动态": {"enabled": True, "weight": 1, "count": 1},
                "常规标签.商业摄影": {"enabled": False, "weight": 2, "count": 1},
                "艺术题材.国风": {"enabled": False, "weight": 2, "count": 1},
            },
            "adultCategories": {
                "轻度内容.涩影湿.擦边": {"enabled": True, "weight": 2, "count": 1},
                "性行为.涩影湿.NSFW.性行为类型": {
                    "enabled": True,
                    "weight": 3,
                    "count": 2,
                },
                "身体部位.涩影湿.NSFW.身体部位": {
                    "enabled": True,
                    "weight": 2,
                    "count": 1,
                },
                "道具玩具.涩影湿.NSFW.道具与玩具": {
                    "enabled": False,
                    "weight": 1,
                    "count": 1,
                },
                "束缚调教.涩影湿.NSFW.束缚与调教": {
                    "enabled": False,
                    "weight": 1,
                    "count": 1,
                },
                "特殊癖好.涩影湿.NSFW.特殊癖好与情境": {
                    "enabled": False,
                    "weight": 1,
                    "count": 1,
                },
                "视觉效果.涩影湿.NSFW.视觉风格与特定元素": {
                    "enabled": True,
                    "weight": 1,
                    "count": 1,
                },
            },
            "excludedCategories": ["自定义", "灵感套装"],
            "totalTagsRange": {"min": 12, "max": 20},
        }

    @classmethod
    def get_tags_config(cls):
        split_dir = os.path.join(os.path.dirname(__file__), "tags_split")
        hierarchy_path = os.path.join(split_dir, "hierarchy.json")

        try:
            with open(hierarchy_path, "r", encoding="utf-8") as f:
                hierarchy = json.load(f)
            return cls._rebuild_tags_from_hierarchy(split_dir, hierarchy)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading split tags: {e}")
            return {}

    @classmethod
    def _rebuild_tags_from_hierarchy(cls, split_dir, hierarchy):
        result = {}

        for name, info in hierarchy.items():
            if info.get("children") is None:
                file_path = os.path.join(split_dir, info["file"])
                if os.path.exists(file_path):
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            result[name] = json.load(f)
                    except (FileNotFoundError, json.JSONDecodeError) as e:
                        print(f"Error loading {file_path}: {e}")
                        result[name] = {}
            else:
                result[name] = cls._rebuild_tags_from_hierarchy(
                    split_dir, info["children"]
                )

        return result

    @classmethod
    def get_user_tags(cls):
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        try:
            encodings = ["utf-8", "gbk", "gb2312"]
            user_tags = None

            for encoding in encodings:
                try:
                    with open(user_tags_path, "r", encoding=encoding) as f:
                        user_tags = json.load(f)
                    break
                except UnicodeDecodeError:
                    continue

            if user_tags is None:
                with open(user_tags_path, "rb") as f:
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
                        "preview": f"/zhihui/user_tags/preview/{name}",
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

            if image_data.startswith("data:image"):
                header, encoded = image_data.split(",", 1)
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
                with open(image_path, "wb") as f:
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
            with open(user_tags_path, "w", encoding="utf-8") as f:
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


@PromptServer.instance.routes.get("/zhihui/random_settings")
async def get_random_settings(request):
    try:
        settings = TagSelector.get_random_settings()
        return web.json_response(settings)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.post("/zhihui/random_settings")
async def save_random_settings(request):
    try:
        data = await request.json()

        if TagSelector.save_random_settings(data):
            return web.json_response(
                {"success": True, "message": "随机规则设置保存成功"}
            )
        else:
            return web.json_response({"error": "保存失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.get("/zhihui/tags")
async def get_tags(request):
    try:
        tags_data = TagSelector.get_tags_config()
        user_tags = TagSelector.get_user_tags()

        if not tags_data:
            tags_data = {}

        if user_tags:
            tags_data["自定义"] = {"我的标签": user_tags}
        else:
            tags_data["自定义"] = {"我的标签": {}}

        return web.json_response(tags_data)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.post("/zhihui/user_tags")
async def save_user_tag(request):
    try:
        data = await request.json()
        name = data.get("name", "").strip()
        content = data.get("content", "").strip()
        preview_image = data.get("preview_image", None)
        original_name = data.get("original_name", "").strip()

        if not name or not content:
            return web.json_response({"error": "名称和内容不能为空"}, status=400)

        user_tags = TagSelector.get_user_tags()

        if original_name and original_name != name:
            if original_name in user_tags:
                del user_tags[original_name]
                TagSelector.delete_preview_image(original_name)

        delete_image = data.get("delete_image", False)
        if original_name and delete_image:
            TagSelector.delete_preview_image(name)

        user_tags[name] = {"content": content}

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


@PromptServer.instance.routes.delete("/zhihui/user_tags")
async def delete_user_tag(request):
    try:
        data = await request.json()
        name = data.get("name", "").strip()

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


@PromptServer.instance.routes.get("/zhihui/user_tags/preview/{tag_name}")
async def get_user_tag_preview(request):
    try:
        tag_name = request.match_info["tag_name"]
        image_path = TagSelector.get_preview_image_path(tag_name)

        if os.path.exists(image_path):
            return web.FileResponse(image_path)
        else:
            return web.json_response({"error": "预览图不存在"}, status=404)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.delete("/zhihui/user_tags/all")
async def delete_all_user_tags_and_images(request):
    try:
        user_tags = TagSelector.get_user_tags()

        if TagSelector.save_user_tags({}):
            user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")
            if os.path.exists(user_images_dir):
                deleted_count = 0
                for filename in os.listdir(user_images_dir):
                    if filename.endswith("_Preview.webp"):
                        image_path = os.path.join(user_images_dir, filename)
                        try:
                            os.remove(image_path)
                            deleted_count += 1
                        except Exception as e:
                            print(f"Error deleting image {filename}: {e}")

                return web.json_response(
                    {
                        "success": True,
                        "message": f"所有自定义标签和图片已删除（共删除 {deleted_count} 张图片）",
                    }
                )
            else:
                return web.json_response(
                    {
                        "success": True,
                        "message": "所有自定义标签已删除（未找到用户图片文件夹）",
                    }
                )
        else:
            return web.json_response({"error": "删除标签失败"}, status=500)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.get("/zhihui/user_tags/backup")
async def backup_user_tags(request):
    try:
        import zipfile
        import io

        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")

        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(
            zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=9
        ) as zip_file:
            if os.path.exists(user_tags_path):
                zip_file.write(user_tags_path, arcname="user_tags.json")

            if os.path.exists(user_images_dir):
                for root, dirs, files in os.walk(user_images_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(
                            file_path, os.path.dirname(user_images_dir)
                        )
                        zip_file.write(file_path, arcname=arcname)

        zip_buffer.seek(0)

        response = web.Response(
            body=zip_buffer.getvalue(),
            content_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="user_tags_backup.zip"'
            },
        )

        return response
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.post("/zhihui/user_tags/restore")
async def restore_user_tags(request):
    try:
        import zipfile
        import io

        data = await request.post()
        backup_file = data.get("backup_file")

        if not backup_file:
            return web.json_response({"error": "未选择备份文件"}, status=400)

        zip_buffer = io.BytesIO(backup_file.file.read())

        with zipfile.ZipFile(zip_buffer, "r") as zip_file:
            user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
            user_images_dir = os.path.join(os.path.dirname(__file__), "user_images")

            if "user_tags.json" in zip_file.namelist():
                with zip_file.open("user_tags.json") as source_file:
                    content = source_file.read()
                    with open(user_tags_path, "wb") as dest_file:
                        dest_file.write(content)

            for file_info in zip_file.infolist():
                if (
                    file_info.filename.startswith("user_images/")
                    and not file_info.is_dir()
                ):
                    dest_path = os.path.join(
                        os.path.dirname(__file__), file_info.filename
                    )
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    with zip_file.open(file_info) as source_file:
                        with open(dest_path, "wb") as dest_file:
                            dest_file.write(source_file.read())

        return web.json_response({"success": True, "message": "恢复成功"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


COSPLAY_ENCRYPT_KEY = b'TFh-VuLIr0qLLl6prDw06LSrxrYWk00wo2r-Z2IpJ_M='
cosplay_fernet = Fernet(COSPLAY_ENCRYPT_KEY)


def decrypt_cosplay_data(encrypted_str):
    try:
        decrypted_bytes = cosplay_fernet.decrypt(encrypted_str.encode('utf-8'))
        return json.loads(decrypted_bytes.decode('utf-8'))
    except Exception as e:
        return f"解密失败：{str(e)}"


def fetch_cosplay_prompt(seed, excluded="", custom_prompt=""):
    api_url = f"https://prompt.fxxkcar.com/getCosplayImagePrompt?hash=1&seed={seed}"
    if custom_prompt and custom_prompt.strip():
        encoded_prompt = urllib.parse.quote(custom_prompt.strip(), safe='')
        api_url += f"&prompt={encoded_prompt}"
    try:
        response = requests.get(api_url, timeout=30, verify=False)
        response.raise_for_status()
        data = response.json()
        if "encrypted_data" in data:
            return decrypt_cosplay_data(data["encrypted_data"])
        else:
            return data
    except requests.exceptions.RequestException as e:
        return f"获取提示词失败：{str(e)}"
    except Exception as e:
        return f"处理返回数据失败：{str(e)}"


def filter_prompt_by_excluded(original_prompt, excluded_str):
    if not excluded_str or excluded_str.strip() == "":
        return original_prompt
    excluded_keywords = excluded_str.replace('，', ',').split(',')
    excluded_keywords = list(set([kw.strip() for kw in excluded_keywords if kw.strip()]))
    prompt_segments = original_prompt.replace('，', ',').split(',')
    prompt_segments = [seg.strip() for seg in prompt_segments if seg.strip()]
    filtered_segments = []
    for seg in prompt_segments:
        contains_excluded = False
        for kw in excluded_keywords:
            if kw in seg:
                contains_excluded = True
                break
        if not contains_excluded:
            filtered_segments.append(seg)
    return '，'.join(filtered_segments)


@PromptServer.instance.routes.post("/zhihui/cosplay-prompt")
async def get_cosplay_prompt(request):
    try:
        data = await request.json()
        seed = data.get("seed", -1)
        max_side = data.get("max_side", 1600)
        excluded = data.get("excluded", "")
        custom_prompt = data.get("custom_prompt", "")

        if seed == -1:
            seed = random.randint(0, 0xffffffffffffffff)

        prompt_data = fetch_cosplay_prompt(seed, excluded, custom_prompt)

        if isinstance(prompt_data, str):
            return web.json_response({"success": False, "error": prompt_data})

        original_prompt = prompt_data.get("prompt", "一块鸡排")
        filtered_prompt = filter_prompt_by_excluded(original_prompt, excluded)

        return web.json_response({
            "success": True,
            "prompt": filtered_prompt,
            "seed": seed
        })
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.get("/zhihui/extractor_settings")
async def get_extractor_settings_api(request):
    try:
        settings = TagSelector.get_extractor_settings()
        return web.json_response(settings)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@PromptServer.instance.routes.post("/zhihui/extractor_settings")
async def save_extractor_settings_api(request):
    try:
        data = await request.json()
        settings_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "Nodes",
            "TagSelector",
            "extractor_settings.json"
        )
        with open(settings_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
