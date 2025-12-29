import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "ImageAspectRatio",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ImageAspectRatio") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this.initialized = true;
                
                this.lastCustomSize = { width: 1328, height: 1328 };
                this.lastPresetSize = null;

                const QWEN_PRESETS = [
                    "1:1(1328x1328)",
                    "16:9(1664x928)",
                    "9:16(928x1664)",
                    "4:3(1472x1104)",
                    "3:4(1104x1472)",
                    "3:2(1584x1056)",
                    "2:3(1056x1584)",
                ];
                const FLUX_PRESETS = [
                    "1:1(1024x1024)",
                    "16:9(1344x768)",
                    "9:16(768x1344)",
                    "4:3(1152x864)",
                    "3:4(864x1152)",
                    "3:2(1216x832)",
                    "2:3(832x1216)",
                ];
                const WAN_PRESETS = [
                    "1:1(1024x1024)",
                    "16:9(1280x720)",
                    "9:16(720x1280)",
                    "4:3(1024x768)",
                    "3:4(768x1024)",
                    "21:9(1344x576)",
                    "9:21(576x1344)",
                ];
                const SD_PRESETS = [
                    "1:1(1024x1024)",
                    "9:8(1152x896)",
                    "8:9(896x1152)",
                    "3:2(1216x832)",
                    "2:3(832x1216)",
                    "7:4(1344x768)",
                    "4:7(768x1344)",
                    "12:5(1536x640)",
                    "5:12(640x1536)",
                    "9:16(768x1344)",
                    "16:9(1344x768)",
                ];
                const ZIMAGE_PRESETS = [
                    "1:1(1024x1024)",
                    "1:1(1280x1280)",
                    "1:1(1536x1536)",
                    "9:7(1152x896)",
                    "9:7(1440x1120)",
                    "9:7(1728x1344)",
                    "7:9(896x1152)",
                    "7:9(1120x1440)",
                    "7:9(1344x1728)",
                    "4:3(1152x864)",
                    "4:3(1472x1104)",
                    "4:3(1728x1296)",
                    "3:4(864x1152)",
                    "3:4(1104x1472)",
                    "3:4(1296x1728)",
                    "3:2(1248x832)",
                    "3:2(1536x1024)",
                    "3:2(1872x1248)",
                    "2:3(832x1248)",
                    "2:3(1024x1536)",
                    "2:3(1248x1872)",
                    "16:9(1280x720)",
                    "16:9(1536x864)",
                    "16:9(2048x1152)",
                    "9:16(720x1280)",
                    "9:16(864x1536)",
                    "9:16(1152x2048)",
                    "21:9(1344x576)",
                    "21:9(1680x720)",
                    "21:9(2016x864)",
                    "9:21(576x1344)",
                    "9:21(720x1680)",
                    "9:21(864x2016)",
                ];

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

                const getComboOptions = (widget) => {
                    if (!widget) return [];
                    if (Array.isArray(widget.options)) return widget.options;
                    if (widget.options && Array.isArray(widget.options.values)) return widget.options.values;
                    return [];
                };

                const applyAspectOptionsByMode = (mode, aspectRatioWidget) => {
                    let presets;
                    switch (mode) {
                        case "Flux":
                            presets = FLUX_PRESETS;
                            break;
                        case "Wan":
                            presets = WAN_PRESETS;
                            break;
                        case "SDXL":
                            presets = SD_PRESETS;
                            break;
                        case "Z-image":
                            presets = ZIMAGE_PRESETS;
                            break;
                        case "Custom Size":
                            presets = [];
                            break;
                        case "Qwen image":
                        default:
                            presets = QWEN_PRESETS;
                            break;
                    }
                    const opts = [...presets];
                    setComboOptions(aspectRatioWidget, opts);
                    if (opts.length > 0 && !opts.includes(aspectRatioWidget.value)) {
                        aspectRatioWidget.value = opts[0];
                    }
                };

                this.swapWidthHeight = function() {
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    
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
                        
                        app.graph.setDirtyCanvas(true, true);
                    }
                };

                this.repositionCustomControls = function(isCustom) {
                    const currentSize = { ...this.size };
                    
                    const widgets = this.widgets || [];
                    const modeIdx = widgets.findIndex(w => w && w.name === "preset_mode");
                    const aspectIdx = widgets.findIndex(w => w && w.name === "aspect_ratio");
                    const widthIdx = widgets.findIndex(w => w && w.name === "custom_width");
                    const heightIdx = widgets.findIndex(w => w && w.name === "custom_height");
                    const lockIdx = widgets.findIndex(w => w && w.name === "aspect_lock");
                    const swapIdx = widgets.findIndex(w => w && w.name === "🔁互换宽高·Swap_W&H");
                    
                    if (modeIdx < 0 || aspectIdx < 0 || widthIdx < 0 || heightIdx < 0 || lockIdx < 0) return;
                    
                    const aspectWidget = widgets[aspectIdx];
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
                    
                    const indicesToRemove = [aspectIdx, widthIdx, heightIdx, lockIdx, swapIdx].filter(idx => idx >= 0).sort((a, b) => b - a);
                    for (const idx of indicesToRemove) {
                        widgets.splice(idx, 1);
                    }
                    
                    if (isCustom) {
                        widgets.splice(modeIdx + 1, 0, widthWidget, heightWidget);
                        
                        if (!swapWidget) {
                            swapWidget = this.addWidget("button", "🔁互换宽高·Swap_W&H", null, () => {
                                this.swapWidthHeight();
                            });
                            const curIdx = widgets.indexOf(swapWidget);
                            if (curIdx >= 0) widgets.splice(curIdx, 1);
                        }

                        widgets.splice(modeIdx + 3, 0, swapWidget, lockWidget);
                        
                        aspectWidget.hidden = true;
                        widthWidget.hidden = false;
                        heightWidget.hidden = false;
                        lockWidget.hidden = false;
                        if (swapWidget) {
                            swapWidget.hidden = false;
                        }
                        widthWidget.value = this.lastCustomSize.width;
                        heightWidget.value = this.lastCustomSize.height;
                        widgets.push(aspectWidget);
                    } else {
                        widgets.splice(modeIdx + 1, 0, aspectWidget);
                        aspectWidget.hidden = false;
                        widthWidget.hidden = true;
                        heightWidget.hidden = true;
                        lockWidget.hidden = true;
                        widgets.push(widthWidget, heightWidget, lockWidget);
                        if (swapWidget) {
                            swapWidget.hidden = true;
                            widgets.push(swapWidget);
                        }
                    }
                    
                    this.size = currentSize;
                    app.graph.setDirtyCanvas(true, true);
                };

                const originalCallback = this.callback;
                this.callback = function() {
                    if (originalCallback) {
                        originalCallback.apply(this, arguments);
                    }
                    
                    const aspectRatioWidget = this.widgets.find(w => w.name === "aspect_ratio");
                    const widthWidget = this.widgets.find(w => w.name === "custom_width");
                    const heightWidget = this.widgets.find(w => w.name === "custom_height");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    
                    if (!aspectRatioWidget || !widthWidget || !heightWidget || !lockWidget || !modeWidget) {
                        return;
                    }
                    
                    applyAspectOptionsByMode(modeWidget.value, aspectRatioWidget);

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
                    const aspectRatioWidget = this.widgets.find(w => w.name === "aspect_ratio");
                    const lockWidget = this.widgets.find(w => w.name === "aspect_lock");
                    const modeWidget = this.widgets.find(w => w.name === "preset_mode");
                    
                    if (widthWidget && heightWidget && aspectRatioWidget && lockWidget && modeWidget) {
                        if (widthWidget.value === '' || widthWidget.value === null || widthWidget.value === undefined) {
                            widthWidget.value = 1328;
                        }
                        if (heightWidget.value === '' || heightWidget.value === null || heightWidget.value === undefined) {
                            heightWidget.value = 1328;
                        }
                        
                        this.lastWidth = parseInt(widthWidget.value) || 1328;
                        this.lastHeight = parseInt(heightWidget.value) || 1328;
                        this.aspectRatio = this.lastHeight > 0 ? this.lastWidth / this.lastHeight : 1;
                        this.isUpdating = false;
                        
                        const originalAspectCallback = aspectRatioWidget.callback;
                        const originalLockCallback = lockWidget.callback;
                        const originalModeCallback = modeWidget.callback;
                        
                        aspectRatioWidget.callback = () => {
                            if (originalAspectCallback) originalAspectCallback.apply(aspectRatioWidget, arguments);
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
                            applyAspectOptionsByMode(modeWidget.value, aspectRatioWidget);
                            
                            const isCustom = modeWidget.value === "Custom Size";
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
                        
                        applyAspectOptionsByMode(modeWidget.value, aspectRatioWidget);
                        
                        const isCustom = modeWidget.value === "Custom Size";
                        this.repositionCustomControls(isCustom);
                        
                        this.callback();
                    }
                }, 100);
                
                return r;
            };
        }
    },
});