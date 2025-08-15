from .Nodes.PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .Nodes.PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .Nodes.KontextPresets.KontextPresetsBasic import LoadKontextPresetsBasic
from .Nodes.KontextPresets.KontextPresetsPlus.KontextPresetsPlus import KontextPresetsPlus
from .Nodes.SystemPrompt.SystemPromptLoaderBase import SystemPromptLoaderBase
from .Nodes.SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .Nodes.TextExpander import TextExpander
from .Nodes.ExtraOptions import ExtraOptions
from .Nodes.MultiLineTextNode import MultiLineTextNode
from .Nodes.TextCombinerNode import TextCombinerNode
from .Nodes.TextModifier import TextModifier
from .Nodes.TextExtractor import TextExtractor
from .Nodes.TriggerWordMerger import TriggerWordMerger
from .Nodes.TextSwitchDualMode import TextSwitchDualMode
from .Nodes.ShowText.show_text import ShowText, WEB_DIRECTORY
from .Nodes.Translate.BaiduTranslate import BaiduTranslate
from .Nodes.Translate.FreeTranslate import FreeTranslate
from .Nodes.PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .Nodes.WanPromptGenerator import WanPromptGenerator
from .Nodes.ImageScaler import ImageScaler
from .Nodes.ImgSwitch.ImageSwitchDualMode import ImageSwitchDualMode
from .Nodes.ImgSwitch.PriorityImageSwitch import PriorityImageSwitch
from .Nodes.ColorRemoval import ColorRemoval
from .Nodes.MovieTools.LaplacianSharpen import LaplacianSharpen
from .Nodes.MovieTools.SobelSharpen import SobelSharpen
from .Nodes.MovieTools.USMSharpen import USMSharpen
from .Nodes.MovieTools.ColorMatchToReference import ColorMatchToReference
from .Nodes.MovieTools.FilmGrain import FilmGrain
from .Nodes.LatentSwitch import LatentSwitch

NODE_CLASS_MAPPINGS = {
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "LoadKontextPresetsBasic": LoadKontextPresetsBasic,
    "KontextPresetsPlus": KontextPresetsPlus,
    "SystemPromptLoaderBase": SystemPromptLoaderBase,
    "SystemPromptLoader": SystemPromptLoader,
    "TextExpander": TextExpander,
    "ExtraOptions": ExtraOptions,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier,
    "TextExtractor": TextExtractor,
    "TriggerWordMerger": TriggerWordMerger,
    "TextSwitchDualMode": TextSwitchDualMode,
    "ShowText": ShowText,
    "BaiduTranslate": BaiduTranslate,
    "FreeTranslate": FreeTranslate,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "WanPromptGenerator": WanPromptGenerator,
    "ImageScaler": ImageScaler,
    "ImageSwitchDualMode": ImageSwitchDualMode,
    "PriorityImageSwitch": PriorityImageSwitch,
    "ColorRemoval": ColorRemoval,
    "LaplacianSharpen": LaplacianSharpen,
    "SobelSharpen": SobelSharpen,
    "USMSharpen": USMSharpen,
    "ColorMatchToReference": ColorMatchToReference,
    "FilmGrain": FilmGrain,
    "LatentSwitch": LatentSwitch,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetOneChoice": "单选提示预设(可注释)",
    "PromptPresetMultipleChoice": "多选提示预设(可注释)",
    "LoadKontextPresetsBasic": "Kontext预设集(基础版)",
    "KontextPresetsPlus": "Kontext预设集(增强版)",
    "SystemPromptLoaderBase": "系统引导词加载器(基础版)",
    "SystemPromptLoader": "系统引导词加载器",
    "TextExpander": "提示词扩展(通用)",
    "ExtraOptions": "额外引导选项（通用）",
    "MultiLineTextNode": "多行文本(可注释)",
    "TextCombinerNode": "提示词合并器(可注释)",
    "TextModifier": "文本修改器",
    "TextExtractor": "中英文本提取器",
    "TriggerWordMerger": "触发词合并器",
    "TextSwitchDualMode": "文本切换器(双模式)",
    "ShowText": "文本显示器",
    "BaiduTranslate": "百度翻译",
    "FreeTranslate": "免费翻译[测试]",
    "PhotographPromptGenerator": "摄影提示词生成器",
    "WanPromptGenerator": "万相视频提示词生成器",
    "ImageScaler": "图像缩放器",
    "ImageSwitchDualMode": "图像切换器(双模式)",
    "PriorityImageSwitch": "优先级图像切换",
    "ColorRemoval": "颜色移除",
    "LaplacianSharpen": "拉普拉斯锐化",
    "SobelSharpen": "索贝尔锐化",
    "USMSharpen": "USM锐化",
    "ColorMatchToReference": "颜色匹配",
    "FilmGrain": "胶片颗粒",
    "LatentSwitch": "Latent切换器-3路",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', "WEB_DIRECTORY"]