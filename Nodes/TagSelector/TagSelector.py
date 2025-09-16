import os
import json
from typing import Dict, Any
from aiohttp import web
from server import PromptServer

class TagSelector:
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

@PromptServer.instance.routes.get('/zhihui/tags')
async def get_tags(request):
    try:
        tags_data = TagSelector.get_tags_config()
        if tags_data:
            return web.json_response(tags_data)
        else:
            return web.json_response({"error": "Tags file not found", "tags": {}}, status=404)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)