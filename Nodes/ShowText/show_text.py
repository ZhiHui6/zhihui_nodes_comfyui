class ShowText:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "文本": ("STRING", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    INPUT_IS_LIST = True
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    
    RETURN_TYPES = ("字符串",)
    FUNCTION = "notify"
    CATEGORY = "zhihui/文本"

    def notify(self, 文本, unique_id=None, extra_pnginfo=None):
        if unique_id is not None and extra_pnginfo is not None:
            if not isinstance(extra_pnginfo, list):
                print("错误: extra_pnginfo 不是列表")
            elif (
                not isinstance(extra_pnginfo[0], dict)
                or "workflow" not in extra_pnginfo[0]
            ):
                print("错误: extra_pnginfo[0] 不是字典或者缺少 'workflow' 键")
            else:
                workflow = extra_pnginfo[0]["workflow"]
                node = next(
                    (x for x in workflow["nodes"] if str(x["id"]) == str(unique_id[0])),
                    None,
                )
                if node:
                    node["widgets_values"] = [文本]

        return {"ui": {"文本": 文本}, "result": (文本,)}

WEB_DIRECTORY = "./Nodes/ShowText/web"