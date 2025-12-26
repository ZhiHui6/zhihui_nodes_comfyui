import os
import json
import folder_paths
from aiohttp import web
from server import PromptServer

@PromptServer.instance.routes.get("/zhihui/photograph/categories")
async def get_photograph_categories(request):
    """Get the list of category files"""
    try:
        options_dir = os.path.join(os.path.dirname(__file__), "options")
        categories = []
        if os.path.exists(options_dir):
            for filename in os.listdir(options_dir):
                if filename.endswith("_options.txt"):
                    category_name = filename.replace("_options.txt", "")
                    categories.append(category_name)
        
        return web.json_response(categories)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/zhihui/photograph/category/{category}")
async def get_photograph_category_data(request):
    """Get the data for a specific category, separating preset and user entries"""
    try:
        category = request.match_info["category"]
        options_dir = os.path.join(os.path.dirname(__file__), "options")
        filename = f"{category}_options.txt"
        filepath = os.path.join(options_dir, filename)
        preset_entries = []
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        preset_entries.append(line)

        user_entries = []
        user_json_path = os.path.join(os.path.dirname(__file__), "user_options.json")
        if os.path.exists(user_json_path):
            with open(user_json_path, "r", encoding="utf-8") as f:
                user_data = json.load(f)
                user_entries = user_data.get(category, [])

        return web.json_response({
            "preset_entries": preset_entries,
            "user_entries": user_entries
        })
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/zhihui/photograph/category/{category}")
async def save_photograph_category_data(request):
    """Save only the user-defined entries for a specific category to JSON file"""
    try:
        category = request.match_info["category"]
        data = await request.json()
        user_entries = data.get("user_entries", [])
        user_json_path = os.path.join(os.path.dirname(__file__), "user_options.json")
        user_data = {}

        if os.path.exists(user_json_path):
            with open(user_json_path, "r", encoding="utf-8") as f:
                user_data = json.load(f)

        user_data[category] = user_entries

        with open(user_json_path, "w", encoding="utf-8") as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)

        return web.json_response({"status": "success"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)