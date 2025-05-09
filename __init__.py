from .PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .TriggerWordMerger import TriggerWordMerger
from .ImageScaler import ImageScaler
from .MultiLineTextNode import MultiLineTextNode
from .TextCombinerNode import TextCombinerNode
from .TextModifier import TextModifier
from .PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .TextSwitch import TextSwitch
from .ImgSwitch.Image_Switcher import ImageSwitch
from .ImgSwitch.Image_Switcher_4way import ImageSwitch
from .ExtraOptions import ExtraOptions
from .ColorTracking import ColorTracking
from .PromptOptimizer import PromptOptimizer

NODE_CLASS_MAPPINGS = {
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "TriggerWordMerger": TriggerWordMerger,
    "ImageScaler": ImageScaler,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "TextSwitch": TextSwitch,
    "ImageSwitch": ImageSwitch,
    "ExtraOptions": ExtraOptions,
    "ColorTracking": ColorTracking,
    "ImageSwitcher4Way": ImageSwitch,
    "PromptOptimizer": PromptOptimizer,

}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetOneChoice": "单选提示预设(可注释)",
    "PromptPresetMultipleChoice": "多选提示预设(可注释)",
    "TriggerWordMerger": "触发词合并器",
    "ImageScaler": "图像缩放器",
    "MultiLineTextNode": "多行文本(可注释)",
    "TextCombinerNode": "提示词合并器(可注释)",
    "TextModifier": "文本修改器",
    "PhotographPromptGenerator": "摄影提示词生成器",
    "TextSwitch": "文本切换器(可注释)",
    "ImageSwitch": "图像切换器(可注释)",
    "ExtraOptions": "额外引导选项（通用）",
    "ColorTracking": "颜色跟踪器",
    "ImageSwitcher4Way": "图像切换器(4路)",
    "PromptOptimizer": "提示词优化器",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']