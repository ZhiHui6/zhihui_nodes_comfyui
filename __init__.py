from .PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .TriggerWordMerger import TriggerWordMerger
from .ImageScaler import ImageScaler
from .MultiLineTextNode import MultiLineTextNode
from .TextCombinerNode import TextCombinerNode
from .TextModifier import TextModifier
from .PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .TextSwitch import TextSwitch
from .ImgSwitch.ImageSwitch2way import ImageSwitch2way
from .ImgSwitch.ImageSwitch4way import ImageSwitch4way
from .ExtraOptions import ExtraOptions
from .PromptOptimizer import PromptOptimizer
from .SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .ColorRemoval import ColorRemoval
from .BaiduTranslate.BaiduTranslateNode import BaiduTranslateNode
from .ImgSwitch.AutoImageSwitch import AutoImageSwitch
from .TextExtractor import TextExtractor
from .KontextPresets.KontextPresetsPlus.KontextPresetsPlus import KontextPresetsPlus
from .KontextPresets.KontextPresetsBasic import LoadKontextPresetsBasic
from .TranslateNodeBeta import TranslateNodeBeta
from .WanPromptGenerator import WanPromptGenerator

NODE_CLASS_MAPPINGS = {
    "ColorRemoval": ColorRemoval,
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "TriggerWordMerger": TriggerWordMerger,
    "ImageScaler": ImageScaler,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "TextSwitch": TextSwitch,
    "ImageSwitch2way": ImageSwitch2way,
    "ExtraOptions": ExtraOptions,
    "ImageSwitch4way": ImageSwitch4way,
    "PromptOptimizer": PromptOptimizer,
    "SystemPromptLoader": SystemPromptLoader,
    "BaiduTranslateNode": BaiduTranslateNode,
    "AutoImageSwitch": AutoImageSwitch,
    "TextExtractor": TextExtractor,
    "KontextPresetsPlus": KontextPresetsPlus,
    "LoadKontextPresetsBasic": LoadKontextPresetsBasic,
    "TranslateNodeBeta": TranslateNodeBeta,
    "WanPromptGenerator": WanPromptGenerator,
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
    "ImageSwitch2way": "图像切换器-2路(可注释)",
    "ImageSwitch4way": "图像切换器-4路(可注释)",
    "ExtraOptions": "额外引导选项（通用）",
    "BaiduTranslateNode": "百度翻译",
    "PromptOptimizer": "提示词优化器",
    "SystemPromptLoader": "系统引导词加载器",
    "ColorRemoval": "颜色移除",
    "AutoImageSwitch": "自动图像切换",
    "TextExtractor": "中英文本提取器",
    "KontextPresetsPlus": "Kontext预设集(增强版)",
    "LoadKontextPresetsBasic": "Kontext预设集(基础版)",
    "TranslateNodeBeta": "中英文翻译器[beta]",
    "WanPromptGenerator": "万相视频提示词生成器",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']