import os
import json
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
    
    def process_tags(self, tag_edit, unique_id=None, extra_pnginfo=None):
        processed_tags = self.clean_tags(tag_edit)
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
        """读取用户自定义标签"""
        user_tags_path = os.path.join(os.path.dirname(__file__), "user_tags.json")
        try:
            with open(user_tags_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    @classmethod
    def save_user_tags(cls, user_tags):
        """保存用户自定义标签"""
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
        
        # 确保自定义分类始终存在
        if not tags_data:
            tags_data = {}
            
        # 始终创建自定义分类，即使没有用户标签
        if user_tags:
            # 有用户标签时，创建正确的自定义分类结构
            tags_data["自定义"] = {
                "我的标签": user_tags
            }
        else:
            # 没有用户标签时，创建空的自定义分类结构
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