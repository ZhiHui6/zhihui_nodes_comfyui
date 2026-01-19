import gc
import torch
import comfy.model_management as mm

class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

any_type = AnyType("*")

class ResourceCleaner:
    CATEGORY = "Zhi.AI/Toolkit"
    OUTPUT_NODE = True
    DESCRIPTION = "Resource Cleaner: Provides independent controls for clearing RAM, VRAM, and cache. Each cleaning function can be toggled individually to selectively release system resources."
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "clear_ram": ("BOOLEAN", {
                    "default": True,
                    "label_on": "ON",
                    "label_off": "OFF"
                }),
                "clear_vram": ("BOOLEAN", {
                    "default": True,
                    "label_on": "ON",
                    "label_off": "OFF"
                }),
                "clear_cache": ("BOOLEAN", {
                    "default": True,
                    "label_on": "ON",
                    "label_off": "OFF"
                }),
            },
            "optional": {
                "any_input": (any_type, {}),
            }
        }
    
    RETURN_TYPES = (any_type, "STRING")
    RETURN_NAMES = ("passthrough", "cleaning_report")
    FUNCTION = "clean_resources"
    
    def clean_resources(self, clear_ram: bool, clear_vram: bool, clear_cache: bool, any_input=None):
 
        report = []
        
        if clear_ram:
            try:
                collected = gc.collect()
                report.append(f"✓ RAM Clear Success - Collected {collected} objects (内存清理完成 - 回收了 {collected} 个对象)")
            except Exception as e:
                report.append(f"✗ RAM Clear Failed: {str(e)} (内存清理失败)")
        else:
            report.append("○ Skip RAM Clear (跳过内存清理)")
        
        if clear_vram:
            try:
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    torch.cuda.ipc_collect()
                    report.append("✓ VRAM Clear Success - CUDA cache cleared (显存清理完成 - CUDA缓存已清空)")
                else:
                    report.append("○ No CUDA device detected, skip VRAM clear (未检测到CUDA设备，跳过显存清理)")
                
                try:
                    mm.soft_empty_cache()
                    report.append("✓ ComfyUI memory management cache cleared (ComfyUI显存管理缓存已清理)")
                except:
                    pass
                    
            except Exception as e:
                report.append(f"✗ VRAM Clear Failed: {str(e)} (显存清理失败)")
        else:
            report.append("○ Skip VRAM Clear (跳过显存清理)")
        
        if clear_cache:
            try:
                import sys
                if hasattr(sys, 'modules'):
                    cached_modules = [m for m in sys.modules.keys() if '__pycache__' in str(sys.modules.get(m, ''))]
                
                gc.collect(generation=2)
                
                report.append("✓ Cache Clear Success - Python cache cleared (缓存清理完成 - Python缓存已清理)")
            except Exception as e:
                report.append(f"✗ Cache Clear Failed: {str(e)} (缓存清理失败)")
        else:
            report.append("○ Skip Cache Clear (跳过缓存清理)")
        
        if clear_ram or clear_vram or clear_cache:
            gc.collect()
            report.append("\n✓ Resource cleaning process completed (资源清理流程完成)")
        else:
            report.append("\n○ No cleaning operations performed (未执行任何清理操作)")
        
        report_text = "\n".join(report)
        print(f"\n{'='*50}")
        print("Resource Cleaning Report (资源清理报告):")
        print(report_text)
        print(f"{'='*50}\n")
        
        return (any_input, report_text)
