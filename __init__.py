from .Prompt_Preset import PromptPreset
from .Prompt_Preset_MultipleChoice import PromptPresetMultipleChoice
from .TriggerWord_Merger import TriggerWordMerger
from .VideoBatchLoader import VideoBatchLoader
from .VideoCombine import VideoCombine
from .ImageScaler import ImageScaler
from .MultiLineTextNode import MultiLineTextNode
from .TextCombinerNode import TextCombinerNode
from .TextModifier import TextModifier
from .PhotographPromptGenerator import PhotographPromptGenerator
from .TextSwitch import TextSwitch
from .Image_Switcher import ImageSwitch

NODE_CLASS_MAPPINGS = {
    "PromptPreset": PromptPreset,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "TriggerWordMerger": TriggerWordMerger,
    "VideoBatchLoader": VideoBatchLoader,
    "VideoCombine": VideoCombine,
    "ImageScaler": ImageScaler,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "TextSwitch": TextSwitch,
    "ImageSwitch": ImageSwitch,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPreset": "单选提示预设(可注释)",
    "PromptPresetMultipleChoice": "多选提示预设(可注释)",
    "TriggerWordMerger": "触发词合并器",
    "VideoBatchLoader": "视频批量加载器",
    "VideoCombine": "视频合并器",
    "ImageScaler": "图像缩放器",
    "MultiLineTextNode": "多行文本(可注释)",
    "TextCombinerNode": "提示词合并器(可注释)",
    "TextModifier": "文本修改器",
    "PhotographPromptGenerator": "摄影提示词生成器",
    "TextSwitch": "文本切换器(可注释)",
    "ImageSwitch": "图像切换器(可注释)",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']