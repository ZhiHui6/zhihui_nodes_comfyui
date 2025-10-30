import comfy
from server import PromptServer
from aiohttp import web
import time
from comfy.model_management import InterruptProcessingException

class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

any_type = AnyType("*")

class TextEditorWithContinue:
    status_by_id = {}
    edited_text_by_id = {}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"forceInput": True}),
                "editable_text": ("STRING", {"multiline": True, "default": ""}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    INPUT_IS_LIST = True
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True, False)
    
    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("text_output", "help_info")
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Pauses workflow execution, provides manual text synchronization and editable text area, continues when user clicks continue button. (Note: Manual synchronization is required after editing text.)"

    def execute(self, text, editable_text, unique_id=None, extra_pnginfo=None):
        text_value = text[0] if isinstance(text, list) and len(text) > 0 else str(text)
        editable_value = editable_text[0] if isinstance(editable_text, list) and len(editable_text) > 0 else str(editable_text)
        node_id = unique_id[0] if isinstance(unique_id, list) and len(unique_id) > 0 else str(unique_id)
        
        if not editable_value or editable_value.strip() == "":
            initial_text = text_value
        else:
            initial_text = editable_value
        
        self.edited_text_by_id[node_id] = initial_text
        self.status_by_id[node_id] = "paused"
        
        if unique_id is not None and extra_pnginfo is not None:
            if isinstance(extra_pnginfo, list) and len(extra_pnginfo) > 0:
                if isinstance(extra_pnginfo[0], dict) and "workflow" in extra_pnginfo[0]:
                    workflow = extra_pnginfo[0]["workflow"]
                    node = next(
                        (x for x in workflow["nodes"] if str(x["id"]) == str(node_id)),
                        None,
                    )
                    if node:
                        node["widgets_values"] = [text_value, initial_text]
        
        while self.status_by_id[node_id] == "paused":
            time.sleep(0.1)
        
        if self.status_by_id[node_id] == "cancelled":
            raise InterruptProcessingException()
        
        output_text = self.edited_text_by_id.get(node_id, initial_text)
        
        if node_id in self.status_by_id:
            del self.status_by_id[node_id]
        if node_id in self.edited_text_by_id:
            del self.edited_text_by_id[node_id]
        
        help_text = (
            "节点使用步骤说明:\n"
            "1. 连接文本输入到此节点\n"
            "2. 运行工作流，节点会暂停执行\n"
            "3. 在编辑框中修改文本内容\n"
            "4. 点击'同步文本'按钮将编辑内容同步到编辑框\n"
            "5. 点击'继续运行'按钮恢复工作流执行\n"
            "6. 修改后的文本将从输出端口传递给下游节点\n\n"
            "注意事项:\n"
            "- 编辑文本后必须手动点击同步按钮\n"
            "- 节点暂停期间工作流会等待用户操作\n"
            "- 可以随时取消执行来中断工作流\n\n"
            "Node Usage Instructions:\n"
            "1. Connect text input to this node\n"
            "2. Run workflow, node will pause execution\n"
            "3. Edit text content in the text area\n"
            "4. Click 'Sync Text' button to synchronize edited content\n"
            "5. Click 'Continue' button to resume workflow execution\n"
            "6. Modified text will be passed to downstream nodes\n\n"
            "Important Notes:\n"
            "- Must manually click sync button after editing text\n"
            "- Workflow waits for user interaction during node pause\n"
            "- Can cancel execution anytime to interrupt workflow"
        )
        
        return {
            "ui": {
                "text": [text_value], 
                "editable_text": output_text
            }, 
            "result": ([output_text], help_text)
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