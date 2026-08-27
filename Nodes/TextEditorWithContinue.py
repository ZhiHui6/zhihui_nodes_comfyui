from server import PromptServer
from aiohttp import web
import time
from comfy.model_management import InterruptProcessingException

class TextEditorWithContinue:
    status_by_id = {}
    edited_text_by_id = {}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }

    INPUT_IS_LIST = True
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Pauses workflow execution, automatically synchronizes the incoming text to an editable text area, and continues when the user clicks the continue button. Click the top-right help icon for usage instructions."

    def execute(self, text, unique_id=None):
        text_value = text[0] if isinstance(text, list) and len(text) > 0 else str(text)
        node_id = unique_id[0] if isinstance(unique_id, list) and len(unique_id) > 0 else str(unique_id)

        initial_text = text_value
        
        self.edited_text_by_id[node_id] = initial_text
        self.status_by_id[node_id] = "paused"
        
        while self.status_by_id[node_id] == "paused":
            time.sleep(0.1)
        
        if self.status_by_id[node_id] == "cancelled":
            raise InterruptProcessingException()
        
        output_text = self.edited_text_by_id.get(node_id, initial_text)
        
        if node_id in self.status_by_id:
            del self.status_by_id[node_id]
        if node_id in self.edited_text_by_id:
            del self.edited_text_by_id[node_id]
        
        return {
            "ui": {
                "text": [output_text]
            }, 
            "result": ([output_text],)
        }

@PromptServer.instance.routes.post("/text_editor_continue/continue/{node_id}")
async def handle_continue(request):
    node_id = request.match_info["node_id"].strip()
    data = await request.json()
    edited_text = data.get("edited_text", "")
    
    TextEditorWithContinue.edited_text_by_id[node_id] = edited_text
    TextEditorWithContinue.status_by_id[node_id] = "continue"
    
    return web.json_response({"status": "ok"})

@PromptServer.instance.routes.get("/text_editor_continue/state/{node_id}")
async def handle_state(request):
    node_id = request.match_info["node_id"].strip()
    status = TextEditorWithContinue.status_by_id.get(node_id)
    edited_text = TextEditorWithContinue.edited_text_by_id.get(node_id, "")
    return web.json_response({"status": status, "edited_text": edited_text})
