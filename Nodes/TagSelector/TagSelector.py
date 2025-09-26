import os
import json
import requests
import urllib.parse
import base64
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
                "expand_mode": (["Disabled", "Tag Style", "Natural Language"], {
                    "default": "Disabled"
                }),
                "language_output": (["中文", "English"], {
                    "default": "中文"
                }),
                "expand_model": (["deepseek", "deepseek-reasoning", "gemini", "mistral", "nova-fast", "openai", "openai-large", "openai-reasoning", "evil", "unity"], {
                    "default": "openai"
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
    CATEGORY = "zhihui/text"
    
    def process_tags(self, tag_edit, expand_mode, language_output, expand_model="openai", unique_id=None, extra_pnginfo=None):
        processed_tags = self.clean_tags(tag_edit)
        
        if expand_mode != "Disabled" and processed_tags.strip():
            expanded_tags = self._expand_tags_with_llm(processed_tags, expand_mode, language_output, expand_model)
            return (expanded_tags,)
        
        return (processed_tags,)
    
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
    
    def _expand_tags_with_llm(self, tags_text: str, expand_mode: str, language_output: str, expand_model: str = "openai") -> str:
        try:
            # 根据语言选择确定输出语言
            is_chinese = language_output == "中文"
            
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
输出：一个美丽的年轻女孩，有着富有表现力的眼睛和温柔的笑容，坐在一个郁郁葱葱的盛开花园里，花园里满是五颜六色的花朵，她怀里抱着一只可爱毛茸茸的猫，猫咪有着柔软的毛发，周围被透过绿叶的自然阳光包围，营造出一个宁静而迷人的场景，具有高细节和艺术品质"""
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
            
            # 模型映射字典
            model_mapping = {
                "deepseek": "deepseek",
                "deepseek-reasoning": "deepseek-reasoning",
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
    def IS_CHANGED(cls, tag_edit, expand_mode, language_output, expand_model=None, unique_id=None, extra_pnginfo=None):
        return tag_edit
    
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
        filename = f"{tag_name}_Preview.png"
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
            
            image_path = cls.get_preview_image_path(tag_name)
            
            with open(image_path, 'wb') as f:
                f.write(image_bytes)
            
            return True
        except Exception as e:
            print(f"Error saving preview image: {e}")
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
        
        if not name or not content:
            return web.json_response({"error": "名称和内容不能为空"}, status=400)
        
        user_tags = TagSelector.get_user_tags()
        user_tags[name] = {
            "content": content,
            "preview": f"/zhihui/user_tags/preview/{name}"
        }
        
        if TagSelector.save_user_tags(user_tags):
            if preview_image:
                TagSelector.save_preview_image(name, preview_image)
            
            return web.json_response({"success": True, "message": "标签保存成功"})
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