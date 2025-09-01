from typing import Optional

class MultiLineTextNode:
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True
    DESCRIPTION = "多行文本节点：用于输入和处理多行文本内容。支持启用/禁用功能，可添加注释说明，适用于长文本内容的输入和传递。"
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "启用节点": ("BOOLEAN", {"default": True}),
                "注释": ("STRING", {"default": "", "multiline": False}),
                "文本": ("STRING", {"default": "", "multiline": True}),
            }
        }
     
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "execute"
    
    def execute(self, 启用节点: bool, 注释: str, 文本: str) -> tuple:
        if not 启用节点:
            return ("",)
        return (文本,)