import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "ImageAspectRatio",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ImageAspectRatio") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this.initialized = true;

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
                    
                    aspectRatioWidget.hidden = isCustom;
                    widthWidget.hidden = !isCustom;
                    heightWidget.hidden = !isCustom;
                    lockWidget.hidden = !isCustom;
                    
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
                            this.callback();
                        };

                        modeWidget.callback = () => {
                            if (originalModeCallback) originalModeCallback.apply(modeWidget, arguments);
                            applyAspectOptionsByMode(modeWidget.value, aspectRatioWidget);
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
                                        
                                        this.isUpdating = false;
                                    }
                                }
                            }
                        }, 100);
                        
                        applyAspectOptionsByMode(modeWidget.value, aspectRatioWidget);
                        this.callback();
                    }
                }, 100);
                
                return r;
            };
        }
    },
});