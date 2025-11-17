from typing import List
import os
try:
    from server import PromptServer
    from aiohttp import web
    _PS_OK = True
except Exception:
    PromptServer = None
    web = None
    _PS_OK = False

_SEGMENTATION_PRESET_STATE = {}

class Sa2VASegmentationPreset:
    DESCRIPTION = "Segmentation preset selection to build segmentation prompt for Sa2VA"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "enable_node": (
                    "BOOLEAN",
                    {"default": True},
                ),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("segmentation_preset",)
    FUNCTION = "build_prompt"
    CATEGORY = "Zhi.AI/Sa2VA"

    def _normalize_list(self, items) -> List[str]:
        if items is None:
            return []
        if isinstance(items, list):
            return [str(x).strip() for x in items if str(x).strip()]
        s = str(items or "")
        return [p.strip() for p in s.split(",") if p and p.strip()]

    def _build_prompt_text(self, parts: List[str]) -> str:
        if not parts:
            return "请分割目标图像区域，并返回一个合并遮罩。"
        readable = ", ".join(parts)
        return "请仅分割以下部位或对象：" + readable + "。将所选区域合并为单个遮罩，排除其他区域。"

    def build_prompt(self, enable_node=True, unique_id=None, extra_pnginfo=None):
        if not enable_node:
            return ("",)
        node_id = unique_id[0] if isinstance(unique_id, list) and len(unique_id) > 0 else str(unique_id)
        state = _SEGMENTATION_PRESET_STATE.get(str(node_id))
        parts = []
        names = []
        if isinstance(state, dict):
            parts = self._normalize_list(state.get("parts"))
            names = self._normalize_list(state.get("parts_text"))
        readable = names if len(names) > 0 else parts
        prompt = self._build_prompt_text(readable)
        return (prompt,)

if _PS_OK:
    @PromptServer.instance.routes.post("/zhihui_nodes/segmentation_preset/set/{node_id}")
    async def _hp_set(request):
        node_id = request.match_info.get("node_id")
        try:
            data = await request.json()
        except Exception:
            data = {}
        parts = data.get("parts")
        parts_text = data.get("parts_text")
        try:
            seq = int(data.get("seq") or 0)
        except Exception:
            seq = 0
        if not isinstance(parts, list):
            parts = []
        if not isinstance(parts_text, list):
            parts_text = []
        prev = _SEGMENTATION_PRESET_STATE.get(str(node_id)) or {}
        try:
            prev_seq = int(prev.get("seq") or 0)
        except Exception:
            prev_seq = 0
        if seq < prev_seq:
            return web.json_response({"status": "ignored", "seq": seq, "prev_seq": prev_seq})
        _SEGMENTATION_PRESET_STATE[str(node_id)] = {"parts": parts, "parts_text": parts_text, "seq": seq}
        return web.json_response({"status": "ok", "count": len(parts), "text_count": len(parts_text), "seq": seq})

    @PromptServer.instance.routes.get("/zhihui_nodes/segmentation_preset/get/{node_id}")
    async def _sp_get(request):
        node_id = request.match_info.get("node_id")
        state = _SEGMENTATION_PRESET_STATE.get(str(node_id)) or {"parts": [], "parts_text": [], "seq": 0}
        return web.json_response({"parts": state.get("parts", []), "parts_text": state.get("parts_text", []), "seq": state.get("seq", 0)})