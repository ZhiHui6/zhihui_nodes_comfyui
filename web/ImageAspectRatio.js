import { app } from "../../../scripts/app.js";

const i18n = {
    zh: {
        swapSize: "🔃 尺寸互换",
        nodeTitle: "图像纵横比节点",
        description: "用于设置图像的纵横比和尺寸，支持多种模型的预设尺寸，可快速选择常用比例或自定义尺寸。",
        featuresTitle: "功能",
        feature1: "支持多种模型的预设尺寸（Qwen、Flux、Wan、SDXL等）",
        feature2: "提供常用纵横比快速选择",
        feature3: "支持自定义尺寸和宽高锁定",
        feature4: "支持批量大小设置",
        feature5: "输出潜空间张量",
        usageTitle: "使用说明",
        presetMode: "预设模式",
        presetModeDesc: "选择模型预设，自动提供该模型支持的尺寸选项",
        customMode: "自定义模式",
        customModeDesc: "手动输入宽度和高度，可选择锁定纵横比",
        batchSize: "批量大小",
        batchSizeDesc: "设置生成的潜空间批量大小",
        outputTitle: "输出",
        outputWidth: "宽度：输出图像宽度",
        outputHeight: "高度：输出图像高度",
        outputLatent: "潜空间：生成的潜空间张量"
    },
    en: {
        swapSize: "🔃 Swap Size",
        nodeTitle: "Image Aspect Ratio Node",
        description: "Used to set image aspect ratio and dimensions, supporting preset dimensions for multiple models, with quick selection of common ratios or custom sizes.",
        featuresTitle: "Features",
        feature1: "Supports preset dimensions for multiple models (Qwen, Flux, Wan, SDXL, etc.)",
        feature2: "Provides quick selection of common aspect ratios",
        feature3: "Supports custom dimensions and aspect ratio locking",
        feature4: "Supports batch size setting",
        feature5: "Outputs latent space tensor",
        usageTitle: "Usage",
        presetMode: "Preset Mode",
        presetModeDesc: "Select model preset to automatically provide size options supported by that model",
        customMode: "Custom Mode",
        customModeDesc: "Manually input width and height, with option to lock aspect ratio",
        batchSize: "Batch Size",
        batchSizeDesc: "Set batch size for generated latent space",
        outputTitle: "Output",
        outputWidth: "Width: Output image width",
        outputHeight: "Height: Output image height",
        outputLatent: "Latent: Generated latent space tensor"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${$t('nodeTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${$t('description')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('featuresTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature5')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('presetMode')}</strong>: <span style="color:#e2e8f0;">${$t('presetModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('customMode')}</strong>: <span style="color:#e2e8f0;">${$t('customModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${$t('batchSize')}</strong>: <span style="color:#e2e8f0;">${$t('batchSizeDesc')}</span></li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputWidth')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputHeight')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputLatent')}</li>
</ul>`;
}

function createHelpPopup(description, onClose) {
    const docElement = document.createElement('div');
    docElement.style.cssText = `
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        position: absolute;
        color: #e2e8f0;
        font: 13px 'Segoe UI', system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        padding: 20px 24px 24px 24px;
        border-radius: 16px;
        border: 1px solid rgba(99, 179, 237, 0.3);
        z-index: 1000;
        overflow: hidden;
        max-width: 560px;
        max-height: 600px;
        min-width: 400px;
        box-shadow: 
            0 0 40px rgba(59, 130, 246, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    `;

    docElement.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.3) transparent;">${description}</div>`;

    const accent = document.createElement('div');
    accent.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6);
        border-radius: 16px 16px 0 0;
        opacity: 0.8;
    `;
    docElement.insertBefore(accent, docElement.firstChild);

    document.body.appendChild(docElement);
    return docElement;
}

app.registerExtension({
    name: "ImageAspectRatio",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ImageAspectRatio") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this.initialized = true;
                this._imageAspectRatioHelp = false;
                this._imageAspectRatioLocale = getLocale();
                this._lastModeWasCustom = null;
                this._controlsRepositioned = false;
                
                this.lastCustomSize = { width: 1328, height: 1328 };
                this.lastPresetSize = null;

                for (const w of this.widgets || []) {
                    if (w.name === "custom_width" || w.name === "custom_height" || w.name === "aspect_lock") {
                        w.hidden = true;
                    }
                }

                const PRESETS_DATA = {
                    "Qwen image": {
                        "1:1": ["1328x1328"],
                        "16:9": ["1664x928"],
                        "9:16": ["928x1664"],
                        "4:3": ["1472x1104"],
                        "3:4": ["1104x1472"],
                        "3:2": ["1584x1056"],
                        "2:3": ["1056x1584"],
                        "Cinema": ["4K 4032x2128", "2K 2016x1008"],
                        "Video": ["1080p 1904x1008", "720p 1232x672"],
                    },
                    "Flux": {
                        "1:1": ["1024x1024"],
                        "16:9": ["1344x768"],
                        "9:16": ["768x1344"],
                        "4:3": ["1152x864"],
                        "3:4": ["864x1152"],
                        "3:2": ["1216x832"],
                        "2:3": ["832x1216"],
                    },
                    "Flux.2": {
                        "1:1": ["S 1024x1024", "M 1280x1280", "L 1536x1536"],
                        "16:9": ["S 1344x768", "M 1728x960", "L 2048x1152"],
                        "9:16": ["S 768x1344", "M 960x1728", "L 1152x2048"],
                        "4:3": ["S 1152x864", "M 1408x1056", "L 1728x1296"],
                        "3:4": ["S 864x1152", "M 1088x1472", "L 1280x1728"],
                        "3:2": ["S 1216x832", "M 1536x1024", "L 1920x1280"],
                        "2:3": ["S 832x1216", "M 1024x1536", "L 1280x1920"],
                    },
                    "Flux2 klein": {
                        "1:1": ["S 768x768", "M 896x896", "L 1024x1024"],
                        "16:9": ["S 1024x576", "M 1152x640", "L 1344x768"],
                        "9:16": ["S 576x1024", "M 640x1152", "L 768x1344"],
                        "4:3": ["S 768x576", "M 960x704", "L 1024x768"],
                        "3:4": ["S 576x768", "M 704x960", "L 768x1024"],
                        "3:2": ["S 960x640", "M 1152x768", "L 1344x896"],
                        "2:3": ["S 640x960", "M 768x1152", "L 896x1344"],
                        "Cinema": ["4K 4096x2160", "2K 2048x1072"],
                        "Video": ["1080p 1920x1072", "720p 1280x720"],
                    },
                    "Wan": {
                        "16:9": ["1280x720"],
                        "9:16": ["720x1280"],
                        "4:3": ["1024x768"],
                        "3:4": ["768x1024"],
                        "21:9": ["1344x576"],
                        "9:21": ["576x1344"],
                        "Cinema": ["4K 4096x2144", "2K 2048x1056"],
                        "Video": ["1080p 1920x1056", "720p 1280x704"],
                    },
                    "SDXL": {
                        "1:1": ["1024x1024"],
                        "9:8": ["1152x896"],
                        "8:9": ["896x1152"],
                        "3:2": ["1216x832"],
                        "2:3": ["832x1216"],
                        "7:4": ["1344x768"],
                        "4:7": ["768x1344"],
                        "12:5": ["1536x640"],
                        "5:12": ["640x1536"],
                    },
                    "LTX2.3": {
                        "16:9": ["480p 832x480", "720p 1280x704", "1080p 1920x1088", "2K 2048x1152", "4K 3840x2176"],
                        "10:16": ["480p 480x768", "720p 704x1152", "1080p 1088x1728", "2K 1280x2048", "4K 2368x3840"],
                        "16:10": ["480p 768x480", "720p 1152x704", "1080p 1728x1088", "2K 2048x1280", "4K 3840x2368"],
                        "9:16": ["480p 480x832", "720p 704x1280", "1080p 1088x1920", "2K 1152x2048", "4K 2176x3840"],
                        "21:9": ["480p 1152x480", "720p 1728x704", "1080p 2560x1088", "2K 2688x1152", "4K 5120x2176"],
                        "9:21": ["480p 480x1152", "720p 704x1728", "1080p 1088x2560", "2K 1152x2688", "4K 2176x5120"],
                    },
                    "Z-image": {
                        "1:1": ["1024x1024", "1280x1280", "1536x1536"],
                        "9:7": ["1152x896", "1440x1120", "1728x1344"],
                        "7:9": ["896x1152", "1120x1440", "1344x1728"],
                        "4:3": ["1152x864", "1472x1104", "1728x1296"],
                        "3:4": ["864x1152", "1104x1472", "1296x1728"],
                        "3:2": ["1248x832", "1536x1024", "1872x1248"],
                        "2:3": ["832x1248", "1024x1536", "1248x1872"],
                        "16:9": ["1280x720", "1536x864", "2048x1152"],
                        "9:16": ["720x1280", "864x1536", "1152x2048"],
                        "21:9": ["1344x576", "1680x720", "2016x864"],
                        "9:21": ["576x1344", "720x1680", "864x2016"],
                        "Cinema": ["4K 4096x2112", "2K 2048x1024"],
                        "Video": ["1080p 1920x1024", "720p 1280x704"],
                    },
                    "Custom Size": {},
                };

                const ALL_CATEGORIES = [...new Set([
                    ...Object.keys(PRESETS_DATA["Qwen image"]),
                    ...Object.keys(PRESETS_DATA["Flux"]),
                    ...Object.keys(PRESETS_DATA["Flux.2"]),
                    ...Object.keys(PRESETS_DATA["Flux2 klein"]),
                    ...Object.keys(PRESETS_DATA["Wan"]),
                    ...Object.keys(PRESETS_DATA["SDXL"]),
                    ...Object.keys(PRESETS_DATA["LTX2.3"]),
                    ...Object.keys(PRESETS_DATA["Z-image"]),
                ])].sort();

                const setComboOptions = (widget, values) => {
                    if (!widget) return;
                    if (Array.isArray(widget.options)) {
                        widget.options = values;
                    } else if (widget.options && Array.isArray(widget.options.values)) {
                        widget.options.values = values;
                    } else {
                        widget.options = values;
                    }
                };

                const getCategoriesByMode = (mode) => {
                    const data = PRESETS_DATA[mode];
                    if (!data) return [];
                    return Object.keys(data).sort();
                };

                const getSizesByCategory = (mode, category) => {
                    const data = PRESETS_DATA[mode];
                    if (!data || !data[category]) return [];
                    return data[category];
                };

                const applyCategoryOptionsByMode = (mode, categoryWidget) => {
                    const categories = getCategoriesByMode(mode);
                    setComboOptions(categoryWidget, categories);
                    if (categories.length > 0 && !categories.includes(categoryWidget.value)) {
                        categoryWidget.value = categories[0];
                    }
                    return categories;
                };

                const applySizeOptionsByCategory = (mode, category, sizeWidget) => {
                    const sizes = getSizesByCategory(mode, category);
                    setComboOptions(sizeWidget, sizes);
                    if (sizes.length > 0 && !sizes.includes(sizeWidget.value)) {
                        sizeWidget.value = sizes[0];
                    }
                    return sizes;
                };

                this.swapAll = function() {
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    
                    if (!modeWidget) return;
                    
                    const isCustom = modeWidget.value === "Custom Size";
                    
                    if (isCustom) {
                        if (widthWidget && heightWidget) {
                            const currentWidth = parseInt(widthWidget.value) || 1328;
                            const currentHeight = parseInt(heightWidget.value) || 1328;
                            
                            widthWidget.value = currentHeight;
                            heightWidget.value = currentWidth;
                            
                            this.lastCustomSize = {
                                width: currentHeight,
                                height: currentWidth
                            };
                            
                            if (this.aspectRatio && this.aspectRatio > 0) {
                                this.aspectRatio = currentHeight / currentWidth;
                                this.lastWidth = currentHeight;
                                this.lastHeight = currentWidth;
                            }
                        }
                    } else {
                        if (categoryWidget && sizeWidget) {
                            const currentCategory = categoryWidget.value;
                            const currentSizeValue = sizeWidget.value;
                            const swappedCategory = this.getSwappedRatio(currentCategory);
                            
                            if (swappedCategory && swappedCategory !== currentCategory) {
                                const categories = getCategoriesByMode(modeWidget.value);
                                if (categories.includes(swappedCategory)) {
                                    categoryWidget.value = swappedCategory;
                                    
                                    const sizeMatch = currentSizeValue.match(/(\d+)\s*[x×]\s*(\d+)/i);
                                    let swappedSizeValue = null;
                                    
                                    if (sizeMatch) {
                                        const width = parseInt(sizeMatch[1]);
                                        const height = parseInt(sizeMatch[2]);
                                        const swappedSizeStr = `${height}x${width}`;
                                        
                                        const newSizes = getSizesByCategory(modeWidget.value, swappedCategory);
                                        swappedSizeValue = newSizes.find(s => {
                                            const m = s.match(/(\d+)\s*[x×]\s*(\d+)/i);
                                            return m && parseInt(m[1]) === height && parseInt(m[2]) === width;
                                        });
                                    }
                                    
                                    applySizeOptionsByCategory(modeWidget.value, swappedCategory, sizeWidget);
                                    
                                    if (swappedSizeValue) {
                                        sizeWidget.value = swappedSizeValue;
                                    }
                                }
                            }
                        }
                    }
                    
                    this.callback();
                    app.graph.setDirtyCanvas(true, true);
                };

                this.getSwappedRatio = function(ratio) {
                    const swapMap = {
                        "16:9": "9:16",
                        "9:16": "16:9",
                        "16:10": "10:16",
                        "10:16": "16:10",
                        "4:3": "3:4",
                        "3:4": "4:3",
                        "3:2": "2:3",
                        "2:3": "3:2",
                        "21:9": "9:21",
                        "9:21": "21:9",
                        "9:8": "8:9",
                        "8:9": "9:8",
                        "9:7": "7:9",
                        "7:9": "9:7",
                        "7:4": "4:7",
                        "4:7": "7:4",
                        "12:5": "5:12",
                        "5:12": "12:5",
                    };
                    return swapMap[ratio] || ratio;
                };

                this.repositionCustomControls = function(isCustom) {
                    if (this._lastModeWasCustom === isCustom && this._controlsRepositioned) {
                        return;
                    }
                    
                    this._lastModeWasCustom = isCustom;
                    this._controlsRepositioned = true;
                    
                    const widgets = this.widgets || [];
                    const modeIdx = widgets.findIndex(w => w && w.name === "preset_mode");
                    const categoryIdx = widgets.findIndex(w => w && w.name === "aspect_category");
                    const sizeIdx = widgets.findIndex(w => w && w.name === "aspect_size");
                    const widthIdx = widgets.findIndex(w => w && w.name === "custom_width");
                    const heightIdx = widgets.findIndex(w => w && w.name === "custom_height");
                    const lockIdx = widgets.findIndex(w => w && w.name === "aspect_lock");
                    const swapIdx = widgets.findIndex(w => w && w.name === $t('swapSize'));
                    
                    if (modeIdx < 0 || categoryIdx < 0 || sizeIdx < 0 || widthIdx < 0 || heightIdx < 0 || lockIdx < 0) return;
                    
                    const categoryWidget = widgets[categoryIdx];
                    const sizeWidget = widgets[sizeIdx];
                    const widthWidget = widgets[widthIdx];
                    const heightWidget = widgets[heightIdx];
                    const lockWidget = widgets[lockIdx];
                    let swapWidget = swapIdx >= 0 ? widgets[swapIdx] : null;
                    
                    if (!isCustom) {
                        this.lastCustomSize = {
                            width: parseInt(widthWidget.value) || 1328,
                            height: parseInt(heightWidget.value) || 1328
                        };
                    }
                    
                    const indicesToRemove = [categoryIdx, sizeIdx, widthIdx, heightIdx, lockIdx, swapIdx].filter(idx => idx >= 0).sort((a, b) => b - a);
                    for (const idx of indicesToRemove) {
                        widgets.splice(idx, 1);
                    }
                    
                    if (isCustom) {
                        widgets.splice(modeIdx + 1, 0, widthWidget, heightWidget, lockWidget);
                        
                        if (!swapWidget) {
                            swapWidget = this.addWidget("button", $t('swapSize'), null, () => {
                                this.swapAll();
                            });
                            const curIdx = widgets.indexOf(swapWidget);
                            if (curIdx >= 0) widgets.splice(curIdx, 1);
                        }

                        widgets.push(swapWidget);
                        
                        categoryWidget.hidden = true;
                        sizeWidget.hidden = true;
                        widthWidget.hidden = false;
                        heightWidget.hidden = false;
                        lockWidget.hidden = false;
                        if (swapWidget) {
                            swapWidget.hidden = false;
                        }
                        widthWidget.value = this.lastCustomSize.width;
                        heightWidget.value = this.lastCustomSize.height;
                        widgets.push(categoryWidget, sizeWidget);
                    } else {
                        widgets.splice(modeIdx + 1, 0, categoryWidget, sizeWidget);
                        
                        if (!swapWidget) {
                            swapWidget = this.addWidget("button", $t('swapSize'), null, () => {
                                this.swapAll();
                            });
                            const curIdx = widgets.indexOf(swapWidget);
                            if (curIdx >= 0) widgets.splice(curIdx, 1);
                        }
                        
                        widgets.splice(modeIdx + 3, 0, swapWidget);
                        
                        categoryWidget.hidden = false;
                        sizeWidget.hidden = false;
                        widthWidget.hidden = true;
                        heightWidget.hidden = true;
                        lockWidget.hidden = true;
                        widgets.push(widthWidget, heightWidget, lockWidget);
                        if (swapWidget) {
                            swapWidget.hidden = false;
                        }
                    }
                    
                    app.graph.setDirtyCanvas(true, true);
                };

                const originalCallback = this.callback;
                this.callback = function() {
                    if (originalCallback) {
                        originalCallback.apply(this, arguments);
                    }
                    
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    
                    if (!categoryWidget || !sizeWidget || !widthWidget || !heightWidget || !lockWidget || !modeWidget) {
                        return;
                    }

                    const isCustom = modeWidget.value === "Custom Size";
                    
                    this.repositionCustomControls(isCustom);
                    
                    if (!isCustom) {
                        lockWidget.value = false;
                        this.aspectRatio = null;
                        return;
                    }
                    
                    if (widthWidget.value === '' || widthWidget.value === null || widthWidget.value === undefined) {
                        widthWidget.value = 1328;
                    }
                    if (heightWidget.value === '' || heightWidget.value === null || heightWidget.value === undefined) {
                        heightWidget.value = 1328;
                    }
                    
                    this.lastWidth = parseInt(widthWidget.value) || 1328;
                    this.lastHeight = parseInt(heightWidget.value) || 1328;
                };
                
                setTimeout(() => {
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    const categoryWidget = this.widgets.find(w => w.name === "aspect_category");
                    const sizeWidget = this.widgets.find(w => w.name === "aspect_size");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    const batchWidget = this.widgets.find(w => w.name === "batch_size");
                    
                    if (widthWidget && heightWidget && categoryWidget && sizeWidget && lockWidget && modeWidget) {
                        if (widthWidget.value === '' || widthWidget.value === null || widthWidget.value === undefined) {
                            widthWidget.value = 1328;
                        }
                        if (heightWidget.value === '' || heightWidget.value === null || heightWidget.value === undefined) {
                            heightWidget.value = 1328;
                        }
                        if (batchWidget && (batchWidget.value === '' || batchWidget.value === null || batchWidget.value === undefined || batchWidget.value === 1328)) {
                            batchWidget.value = 1;
                        }
                        
                        this.lastWidth = parseInt(widthWidget.value) || 1328;
                        this.lastHeight = parseInt(heightWidget.value) || 1328;
                        this.aspectRatio = this.lastHeight > 0 ? this.lastWidth / this.lastHeight : 1;
                        this.isUpdating = false;
                        
                        const originalCategoryCallback = categoryWidget.callback;
                        const originalSizeCallback = sizeWidget.callback;
                        const originalLockCallback = lockWidget.callback;
                        const originalModeCallback = modeWidget.callback;
                        
                        categoryWidget.callback = () => {
                            if (originalCategoryCallback) originalCategoryCallback.apply(categoryWidget, arguments);
                            applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                            this.callback();
                        };
                        
                        sizeWidget.callback = () => {
                            if (originalSizeCallback) originalSizeCallback.apply(sizeWidget, arguments);
                            this.callback();
                        };
                        
                        lockWidget.callback = () => {
                            if (originalLockCallback) originalLockCallback.apply(lockWidget, arguments);
                            if (lockWidget.value) {
                                const currentWidth = parseInt(widthWidget.value) || 1328;
                                const currentHeight = parseInt(heightWidget.value) || 1328;
                                if (currentHeight > 0) {
                                    this.aspectRatio = currentWidth / currentHeight;
                                    this.lastWidth = currentWidth;
                                    this.lastHeight = currentHeight;
                                } else {
                                    this.aspectRatio = 1;
                                    this.lastWidth = 1328;
                                    this.lastHeight = 1328;
                                }
                            }
                            this.lastCustomSize = {
                                width: parseInt(widthWidget.value) || 1328,
                                height: parseInt(heightWidget.value) || 1328
                            };
                            this.callback();
                        };

                        modeWidget.callback = () => {
                            if (originalModeCallback) originalModeCallback.apply(modeWidget, arguments);
                            
                            const isCustom = modeWidget.value === "Custom Size";
                            
                            if (this._lastModeWasCustom !== isCustom) {
                                this._controlsRepositioned = false;
                            }
                            
                            if (!isCustom) {
                                applyCategoryOptionsByMode(modeWidget.value, categoryWidget);
                                applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                            }
                            
                            this.repositionCustomControls(isCustom);
                            
                            this.callback();
                        };
                        
                        this.aspectRatioTimer = setInterval(() => {
                            if (lockWidget.value && modeWidget.value === "Custom Size") {
                                const currentWidth = parseInt(widthWidget.value) || 0;
                                const currentHeight = parseInt(heightWidget.value) || 0;
                                
                                if (!this.aspectRatio && currentWidth > 0 && currentHeight > 0) {
                                    this.aspectRatio = currentWidth / currentHeight;
                                    this.lastWidth = currentWidth;
                                    this.lastHeight = currentHeight;
                                }
                                
                                if (this.aspectRatio && (currentWidth !== this.lastWidth || currentHeight !== this.lastHeight)) {
                                    if (!this.isUpdating) {
                                        this.isUpdating = true;
                                        
                                        if (currentWidth !== this.lastWidth && currentWidth > 0) {
                                            const newHeight = Math.round(currentWidth / this.aspectRatio);
                                            if (!isNaN(newHeight) && newHeight > 0) {
                                                heightWidget.value = newHeight;
                                                this.lastHeight = newHeight;
                                            }
                                            this.lastWidth = currentWidth;
                                        } else if (currentHeight !== this.lastHeight && currentHeight > 0) {
                                            const newWidth = Math.round(currentHeight * this.aspectRatio);
                                            if (!isNaN(newWidth) && newWidth > 0) {
                                                widthWidget.value = newWidth;
                                                this.lastWidth = newWidth;
                                            }
                                            this.lastHeight = currentHeight;
                                        }
                                        
                                        this.lastCustomSize = {
                                            width: parseInt(widthWidget.value) || 1328,
                                            height: parseInt(heightWidget.value) || 1328
                                        };
                                        
                                        this.isUpdating = false;
                                    }
                                }
                            }
                        }, 100);
                        
                        applyCategoryOptionsByMode(modeWidget.value, categoryWidget);
                        applySizeOptionsByCategory(modeWidget.value, categoryWidget.value, sizeWidget);
                        
                        const isCustom = modeWidget.value === "Custom Size";
                        this.repositionCustomControls(isCustom);
                        
                        this.callback();
                    }
                }, 100);
                
                return r;
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function() {
                this._controlsRepositioned = false;
                this._lastModeWasCustom = null;
                
                const modeWidget = this.widgets?.find(w => w.name === "preset_mode");
                const isCustom = modeWidget?.value === "Custom Size";
                
                for (const w of this.widgets || []) {
                    if (isCustom) {
                        if (w.name === "aspect_category" || w.name === "aspect_size") {
                            w.hidden = true;
                        }
                    } else {
                        if (w.name === "custom_width" || w.name === "custom_height" || w.name === "aspect_lock") {
                            w.hidden = true;
                        }
                    }
                }
                
                if (onConfigure) {
                    onConfigure.apply(this, arguments);
                }
            };

            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._imageAspectRatioLocale !== currentLocale) {
                    this._imageAspectRatioLocale = currentLocale;
                }
                
                const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                if (this._imageAspectRatioHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._imageAspectRatioHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._imageAspectRatioHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._imageAspectRatioHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    currentHelpLocale = currentLocale;
                }

                if (this._imageAspectRatioHelp && helpElement !== null) {
                    const rect = ctx.canvas.getBoundingClientRect();
                    const scaleX = rect.width / ctx.canvas.width;
                    const scaleY = rect.height / ctx.canvas.height;

                    const transform = new DOMMatrix()
                        .scaleSelf(scaleX, scaleY)
                        .multiplySelf(ctx.getTransform())
                        .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                        .translateSelf(10, -32);

                    const bcr = app.canvas.canvas.getBoundingClientRect();
                    helpElement.style.left = `${transform.e + bcr.x}px`;
                    helpElement.style.top = `${transform.f + bcr.y}px`;
                }

                ctx.save();
                ctx.translate(x, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.fillStyle = this._imageAspectRatioHelp ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.strokeStyle = this._imageAspectRatioHelp ? '#60a5fa' : 'rgba(96, 165, 250, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.font = 'bold 24px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = this._imageAspectRatioHelp ? '#93c5fd' : '#60a5fa';
                ctx.fillText('?', 16, 19);
                
                ctx.restore();
                return r;
            };

            const mouseDown = nodeType.prototype.onMouseDown;
            nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
                const r = mouseDown ? mouseDown.apply(this, arguments) : undefined;
                const iconX = this.size[0] - iconSize - iconMargin;
                const iconY = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                if (
                    localPos[0] > iconX &&
                    localPos[0] < iconX + iconSize &&
                    localPos[1] > iconY &&
                    localPos[1] < iconY + iconSize
                ) {
                    this._imageAspectRatioHelp = !this._imageAspectRatioHelp;
                    return true;
                }
                return r;
            };

            const onRemoved = nodeType.prototype.onRemoved;
            nodeType.prototype.onRemoved = function () {
                const r = onRemoved ? onRemoved.apply(this, []) : undefined;
                if (helpElement) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                return r;
            };
        }
    },
});
