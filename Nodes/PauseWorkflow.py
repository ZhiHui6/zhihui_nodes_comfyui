import comfy
from server import PromptServer
from aiohttp import web
import time
from comfy.model_management import InterruptProcessingException

class AnyType(str):

    def __ne__(self, __value: object) -> bool:
        return False

any_type = AnyType("*")

class PauseWorkflow:
    _instance = None
    status_by_id = {}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "any": (any_type,),
            },
            "hidden": {
                "id": "UNIQUE_ID",
            },
        }

    RETURN_TYPES = (any_type,)
    RETURN_NAMES = ("any",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Pauses workflow execution and waits for user interaction to continue or cancel."
    OUTPUT_NODE = True

    def execute(self, any=None, id=None):
        self.status_by_id[id] = "paused"
        while self.status_by_id[id] == "paused":
            time.sleep(0.1)
        if self.status_by_id[id] == "cancelled":
            raise InterruptProcessingException()
        return {"result": (any,)}

@PromptServer.instance.routes.post("/pause_workflow/continue/{node_id}")
async def handle_continue(request):
    node_id = request.match_info["node_id"].strip()
    PauseWorkflow.status_by_id[node_id] = "continue"
    return web.json_response({"status": "ok"})

@PromptServer.instance.routes.post("/pause_workflow/cancel")
async def handle_cancel(request):
    for node_id in PauseWorkflow.status_by_id:
        PauseWorkflow.status_by_id[node_id] = "cancelled"
    return web.json_response({"status": "ok"})
