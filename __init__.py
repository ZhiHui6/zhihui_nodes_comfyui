from .Nodes.PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .Nodes.PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .Nodes.TriggerWordMerger import TriggerWordMerger
from .Nodes.ImageScaler import ImageScaler
from .Nodes.MultiLineTextNode import MultiLineTextNode
from .Nodes.TextCombinerNode import TextCombinerNode
from .Nodes.TextModifier import TextModifier
from .Nodes.PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .Nodes.TextSwitch.TextSwitch import TextSwitch
from .Nodes.ImgSwitch.ImageSwitch2way import ImageSwitch2way
from .Nodes.ImgSwitch.ImageSwitch4way import ImageSwitch4way
from .Nodes.ExtraOptions import ExtraOptions
from .Nodes.SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .Nodes.SystemPrompt.SystemPromptLoaderBase import SystemPromptLoaderBase
from .Nodes.ColorRemoval import ColorRemoval
from .Nodes.Translate.BaiduTranslate import BaiduTranslate
from .Nodes.ImgSwitch.AutoImageSwitch import AutoImageSwitch
from .Nodes.TextExtractor import TextExtractor
from .Nodes.KontextPresets.KontextPresetsPlus.KontextPresetsPlus import KontextPresetsPlus
from .Nodes.KontextPresets.KontextPresetsBasic import LoadKontextPresetsBasic
from .Nodes.Translate.FreeTranslate import FreeTranslate
from .Nodes.WanPromptGenerator import WanPromptGenerator
from .Nodes.TextSwitch.AutoTextSwitch import AutoTextSwitch
from .Nodes.TextExpander import TextExpander
from .Nodes.MovieTools.LaplacianSharpen import LaplacianSharpen
from .Nodes.MovieTools.SobelSharpen import SobelSharpen
from .Nodes.MovieTools.USMSharpen import USMSharpen
from .Nodes.MovieTools.ColorMatchToReference import ColorMatchToReference
from .Nodes.MovieTools.FilmGrain import FilmGrain

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
    "ImageSwitch2way": ImageSwitch2way,
    "ExtraOptions": ExtraOptions,
    "ImageSwitch4way": ImageSwitch4way,
    "SystemPromptLoader": SystemPromptLoader,
    "SystemPromptLoaderBase": SystemPromptLoaderBase,
    "ColorRemoval": ColorRemoval,
    "BaiduTranslate": BaiduTranslate,
    "AutoImageSwitch": AutoImageSwitch,
    "TextExtractor": TextExtractor,
    "KontextPresetsPlus": KontextPresetsPlus,
    "LoadKontextPresetsBasic": LoadKontextPresetsBasic,
    "FreeTranslate": FreeTranslate,
    "WanPromptGenerator": WanPromptGenerator,
    "AutoTextSwitch": AutoTextSwitch,
    "TextExpander": TextExpander,
    "LaplacianSharpen": LaplacianSharpen,
    "SobelSharpen": SobelSharpen,
    "USMSharpen": USMSharpen,
    "ColorMatchToReference": ColorMatchToReference,
    "FilmGrain": FilmGrain,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "WanPromptGenerator": "万相视频提示词生成器",
    "PhotographPromptGenerator": "摄影提示词生成器",
    "KontextPresetsPlus": "Kontext预设集(增强版)",
    "LoadKontextPresetsBasic": "Kontext预设集(基础版)",
    
    "TextExpander": "提示词扩展(通用)",
    "SystemPromptLoader": "系统引导词加载器",
    "SystemPromptLoaderBase": "系统引导词加载器(基础版)",  
    "ExtraOptions": "额外引导选项（通用）",  
    
    "PromptPresetOneChoice": "单选提示预设(可注释)",
    "PromptPresetMultipleChoice": "多选提示预设(可注释)",
    "TextModifier": "文本修改器",
    "TextCombinerNode": "提示词合并器(可注释)",
    "TextExtractor": "中英文本提取器",
    "TriggerWordMerger": "触发词合并器",
    "MultiLineTextNode": "多行文本(可注释)",
    "TextSwitch": "文本切换器(可注释)",
    "AutoTextSwitch": "自动文本切换",
    
    "ImageSwitch2way": "图像切换器-2路(可注释)",
    "ImageSwitch4way": "图像切换器-4路(可注释)",
    "AutoImageSwitch": "自动图像切换",
    "ImageScaler": "图像缩放器",
    "ColorRemoval": "颜色移除",
    
    "BaiduTranslate": "百度翻译",
    "FreeTranslate": "免费翻译[测试]",

    "LaplacianSharpen": "拉普拉斯锐化",
    "SobelSharpen": "索贝尔锐化",
    "USMSharpen": "USM锐化",
    "ColorMatchToReference": "颜色匹配",
    "FilmGrain": "胶片颗粒",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']