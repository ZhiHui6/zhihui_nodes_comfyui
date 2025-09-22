import os
import json
import requests
import urllib.parse
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
    
    def process_tags(self, tag_edit, expand_mode, unique_id=None, extra_pnginfo=None):
        processed_tags = self.clean_tags(tag_edit)
        
        if expand_mode != "Disabled" and processed_tags.strip():
            expanded_tags = self._expand_tags_with_llm(processed_tags, expand_mode)
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
    
    def _expand_tags_with_llm(self, tags_text: str, expand_mode: str) -> str:
        try:
            if expand_mode == "Tag Style":
                system_prompt = """你是一个专业的AI绘画提示词扩写助手。请将用户提供的简单标签扩写成更详细、更丰富的标签形式。

要求：
1. 保持标签格式，用逗号分隔
2. 为每个标签添加更多描述性的修饰词
3. 增加相关的风格、质量、技术参数标签
4. 保持原有标签的核心含义不变
5. 输出应该是可以直接用于AI绘画的提示词标签
6. 直接给出结果，不要出现说明解释性的句段。

示例：
输入：girl, cat, garden
输出：beautiful girl, cute girl, detailed face, expressive eyes, adorable cat, fluffy cat, cat ears, lush garden, blooming flowers, natural lighting, high quality, masterpiece, detailed, 8k resolution"""
            
            elif expand_mode == "Natural Language":
                system_prompt = """你是一个专业的AI绘画提示词扩写助手。请将用户提供的标签转换成自然流畅的句子。

要求：
1. 将标签组合成完整的、描述性的句子
2. 添加丰富的细节描述
3. 使用生动的形容词和副词
4. 保持语言自然流畅
5. 适合用作AI绘画的提示词
6. 直接给出结果，不要出现说明解释性的句段。

示例：
输入：girl, cat, garden
输出：A beautiful young girl with expressive eyes and a gentle smile, sitting in a lush blooming garden filled with colorful flowers, holding a cute fluffy cat with soft fur, surrounded by natural sunlight filtering through green leaves, creating a peaceful and enchanting scene with high detail and artistic quality"""
            
            else:
                return tags_text
            
            full_prompt = f"{system_prompt}\n\n输入标签：{tags_text}\n\n请扩写："
            encoded_prompt = urllib.parse.quote(full_prompt)
            
            api_url = f"https://text.pollinations.ai/claude/{encoded_prompt}?temperature=0.7"
            
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            
            expanded_text = response.text.strip()
            
            if not expanded_text:
                print("LLM API returned empty response, using original tags")
                return tags_text
                
            return expanded_text
            
        except Exception as e:
            print(f"LLM expansion failed: {e}")
            return tags_text
    
    @classmethod
    def IS_CHANGED(cls, tag_edit, unique_id=None, extra_pnginfo=None):
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
            with open(user_tags_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    @classmethod
    def save_user_tags(cls, user_tags):
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        try:
            with open(user_tags_path, 'w', encoding='utf-8') as f:
                json.dump(user_tags, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving user tags: {e}")
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
        
        if not name or not content:
            return web.json_response({"error": "名称和内容不能为空"}, status=400)
        
        user_tags = TagSelector.get_user_tags()
        user_tags[name] = content
        
        if TagSelector.save_user_tags(user_tags):
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
                return web.json_response({"success": True, "message": "标签删除成功"})
            else:
                return web.json_response({"error": "删除失败"}, status=500)
        else:
            return web.json_response({"error": "标签不存在"}, status=404)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)