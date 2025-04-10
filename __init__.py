from .Prompt_Preset import PromptPreset
from .Prompt_Preset_MultipleChoice import PromptPresetMultipleChoice
from .TriggerWord_Merger import TriggerWordMerger
from .Video_Batch_Loader import VideoSequenceProcessor
from .Video_Combiner import VideoCombine
from .ImageScaler import ImageScaler
from .MultiLineTextNode import MultiLineTextNode
from .TextCombinerNode import TextCombinerNode
from .TextModifier import TextModifier

NODE_CLASS_MAPPINGS = {
    "PromptPreset": PromptPreset,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "TriggerWordMerger": TriggerWordMerger,
    "VideoSequenceProcessor": VideoSequenceProcessor,
    "VideoCombine": VideoCombine,
    "ImageScaler": ImageScaler,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPreset": "单选提示预设(带注释)",
    "PromptPresetMultipleChoice": "多选提示预设(带注释)",
    "TriggerWordMerger": "触发词合并器",
    "VideoSequenceProcessor": "视频批量加载器",
    "VideoCombine": "视频合并器",
    "ImageScaler": "图像缩放器",
    "MultiLineTextNode": "多行文本输入(带注释)",
    "TextCombinerNode": "提示词合并器(带注释)",
    "TextModifier": "文本修改器"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']