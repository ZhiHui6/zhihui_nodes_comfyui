import json

class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

any_type = AnyType("*")

class ShowAny:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "input": (any_type, {"forceInput": False}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    INPUT_IS_LIST = True
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    
    RETURN_TYPES = ("STRING",)
    FUNCTION = "notify"
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Text Display: Used to display text content in the ComfyUI interface. Can receive any text input and display it visually on the node interface, convenient for debugging and viewing text processing results."

    def _to_text(self, value):
        if value is None:
            return "None"
        if isinstance(value, str):
            return value
        if isinstance(value, (int, float, bool)):
            return str(value)
        try:
            return json.dumps(value, indent=4, ensure_ascii=False)
        except Exception:
            try:
                return str(value)
            except Exception:
                return "source exists, but could not be serialized."

    def notify(self, input=None, unique_id=None, extra_pnginfo=None):
        if isinstance(input, list):
            converted = [self._to_text(v) for v in input]
        else:
            converted = [self._to_text(input)]
        if unique_id is not None and extra_pnginfo is not None:
            if not isinstance(extra_pnginfo, list):
                print("Error: extra_pnginfo is not a list")
            elif (
                not isinstance(extra_pnginfo[0], dict)
                or "workflow" not in extra_pnginfo[0]
            ):
                print("Error: extra_pnginfo[0] is not a dictionary or missing 'workflow' key")
            else:
                workflow = extra_pnginfo[0]["workflow"]
                node = next(
                    (x for x in workflow["nodes"] if str(x["id"]) == str(unique_id[0])),
                    None,
                )
                if node:
                    node["widgets_values"] = [converted]

        return {"ui": {"text": converted}, "result": (converted,)}