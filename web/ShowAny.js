import { app } from "../../../scripts/app.js";

const i18n = {
    zh: {
        nodeTitle: "ShowAny 节点",
        description: "用于显示任意类型的数据内容。",
        featuresTitle: "功能",
        feature1: "支持显示字符串、数字、数组等多种数据类型",
        feature2: "提供标准模式和排错模式两种预览模式",
        feature3: "自动处理编码问题",
        usageTitle: "使用说明",
        standardMode: "标准模式",
        standardModeDesc: "直接显示原始内容",
        debugMode: "排错模式",
        debugModeDesc: "自动修复编码问题，适合处理乱码",
        inputTitle: "输入",
        inputDesc: "接受任意类型的输入数据",
        outputTitle: "输出",
        outputDesc: "在节点内显示格式化后的内容",
        previewMode: "预览模式：",
        standard: "标准",
        debug: "排错"
    },
    en: {
        nodeTitle: "ShowAny Node",
        description: "Used to display any type of data content.",
        featuresTitle: "Features",
        feature1: "Supports displaying various data types such as strings, numbers, arrays, etc.",
        feature2: "Provides two preview modes: Standard and Debug",
        feature3: "Automatically handles encoding issues",
        usageTitle: "Usage",
        standardMode: "Standard Mode",
        standardModeDesc: "Displays raw content directly",
        debugMode: "Debug Mode",
        debugModeDesc: "Automatically fixes encoding issues, suitable for handling garbled text",
        inputTitle: "Input",
        inputDesc: "Accepts any type of input data",
        outputTitle: "Output",
        outputDesc: "Displays formatted content within the node",
        previewMode: "Preview Mode:",
        standard: "Standard",
        debug: "Debug"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function t(key) {
    const locale = getLocale();
    return i18n[locale]?.[key] || i18n['en']?.[key] || key;
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${t('nodeTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${t('description')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('featuresTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('feature3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('standardMode')}</strong>: <span style="color:#e2e8f0;">${t('standardModeDesc')}</span></li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;"><strong style="color:#f1f5f9;font-weight:500;">${t('debugMode')}</strong>: <span style="color:#e2e8f0;">${t('debugModeDesc')}</span></li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('inputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('inputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${t('outputDesc')}</li>
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
    name: "ShowAny",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ShowAny") {
            let uniqueCounter = 0;

            function fixEncoding(str, isDebugMode = false) {
                if (!isDebugMode || typeof str !== 'string') {
                    return str;
                }
                try {
                    if (/[\u0080-\u00FF]/.test(str) && !/[\u4E00-\u9FFF]/.test(str)) {
                        const bytes = new Uint8Array(str.length);
                        for (let i = 0; i < str.length; i++) {
                            bytes[i] = str.charCodeAt(i) & 0xFF;
                        }
                        const decoder = new TextDecoder('utf-8');
                        return decoder.decode(bytes);
                    }
                } catch (e) {}
                return str;
            }

            function createItemContainer(text, isDebugMode) {
                const container = document.createElement("div");
                container.style.cssText = "display:flex;flex-direction:column;gap:4px;width:100%;box-sizing:border-box;";

                const textarea = document.createElement("textarea");
                textarea.readOnly = true;
                textarea.style.cssText = "width:100%;resize:none;background:#1f2430;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px;font-size:12px;line-height:1.5;box-sizing:border-box;";
                textarea.value = fixEncoding(text, isDebugMode);

                container.appendChild(textarea);
                return { container, textarea };
            }

            function ensurePreviewUI(node) {
                if (node.__showAnyPreview) {
                    return;
                }

                const host = document.createElement("div");
                host.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%;height:100%;box-sizing:border-box;";

                const itemsContainer = document.createElement("div");
                itemsContainer.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%;overflow-y:auto;flex:1;";

                const footer = document.createElement("div");
                footer.style.cssText = "display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;flex-shrink:0;";

                const modeLabel = document.createElement("span");
                modeLabel.textContent = t("previewMode");
                modeLabel.style.cssText = "margin-right:4px;";

                const modeWrap = document.createElement("div");
                modeWrap.style.cssText = "display:flex;align-items:center;gap:10px;";

                uniqueCounter++;
                const radioName = `showany-mode-${Date.now()}-${uniqueCounter}`;

                const mkRadio = (value, text) => {
                    const label = document.createElement("label");
                    label.style.cssText = "display:flex;align-items:center;gap:4px;";
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = radioName;
                    input.value = value;
                    const span = document.createElement("span");
                    span.textContent = text;
                    label.appendChild(input);
                    label.appendChild(span);
                    return { label, input };
                };

                const radioStandard = mkRadio("Standard", t("standard"));
                const radioDebug = mkRadio("Debug", t("debug"));

                modeWrap.appendChild(radioStandard.label);
                modeWrap.appendChild(radioDebug.label);

                footer.appendChild(modeLabel);
                footer.appendChild(modeWrap);

                host.appendChild(itemsContainer);
                host.appendChild(footer);

                const domWidget = node.addDOMWidget("showany_preview", "div", host, {});
                domWidget.serialize = false;

                node.__showAnyPreview = {
                    host,
                    itemsContainer,
                    radioStandard,
                    radioDebug,
                    modeLabel,
                    radioStandardLabel: radioStandard.label.querySelector('span'),
                    radioDebugLabel: radioDebug.label.querySelector('span')
                };

                if (!node.properties) {
                    node.properties = {};
                }

                const savedMode = node.properties.showAnyMode || node.properties.showtextMode;
                const initialMode = savedMode === "Debug" ? "Debug" : "Standard";
                node.__showAnyPreview.radioStandard.input.checked = initialMode === "Standard";
                node.__showAnyPreview.radioDebug.input.checked = initialMode === "Debug";

                const onModeChange = () => {
                    const mode = node.__showAnyPreview.radioDebug.input.checked ? "Debug" : "Standard";
                    node.properties.showAnyMode = mode;
                    updatePreview(node, node.__showAnyRawData);
                };
                node.__showAnyPreview.radioStandard.input.addEventListener("change", onModeChange);
                node.__showAnyPreview.radioDebug.input.addEventListener("change", onModeChange);

                if (!node.size || node.size.length < 2) {
                    node.size = [520, 300];
                } else {
                    node.size = [Math.max(node.size[0], 520), Math.max(node.size[1], 300)];
                }
            }

            function updatePreview(node, data) {
                ensurePreviewUI(node);
                node.__showAnyRawData = data;
                const isDebugMode = node.properties.showAnyMode === "Debug";
                const itemsContainer = node.__showAnyPreview.itemsContainer;

                itemsContainer.innerHTML = "";

                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data !== null && data !== undefined) {
                    items = [data];
                }

                const isSingleItem = items.length === 1;

                itemsContainer.style.overflowY = "auto";
                itemsContainer.style.flex = "1";

                items.forEach((item, index) => {
                    let text = "";
                    if (item === null || item === undefined) {
                        text = "";
                    } else {
                        text = String(item);
                    }
                    const { container, textarea } = createItemContainer(text, isDebugMode);
                    itemsContainer.appendChild(container);
                    if (isSingleItem) {
                        container.style.height = "100%";
                        container.style.flex = "1";
                        container.style.minHeight = "0";
                        textarea.style.height = "100%";
                        textarea.style.overflow = "auto";
                    } else {
                        textarea.style.height = "80px";
                        textarea.style.overflow = "auto";
                    }
                });

                app.graph.setDirtyCanvas(true, false);
            }

            function updateUILanguage(node) {
                if (!node.__showAnyPreview) return;
                
                node.__showAnyPreview.modeLabel.textContent = t("previewMode");
                node.__showAnyPreview.radioStandardLabel.textContent = t("standard");
                node.__showAnyPreview.radioDebugLabel.textContent = t("debug");
            }

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                ensurePreviewUI(this);
                this._showAnyHelp = false;
                this._showAnyLocale = getLocale();
                return r;
            };

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);
                updatePreview(this, message?.text);
            };

            const onDrawForeground = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._showAnyLocale !== currentLocale) {
                    this._showAnyLocale = currentLocale;
                    updateUILanguage(this);
                }
                
                const r = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
                return r;
            };

            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const drawFg = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const currentLocale = getLocale();
                if (this._showAnyLocale !== currentLocale) {
                    this._showAnyLocale = currentLocale;
                    updateUILanguage(this);
                }
                
                const r = drawFg ? drawFg.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                if (this._showAnyHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._showAnyHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._showAnyHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._showAnyHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    currentHelpLocale = currentLocale;
                }

                if (this._showAnyHelp && helpElement !== null) {
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
                ctx.fillStyle = this._showAnyHelp ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.strokeStyle = this._showAnyHelp ? '#60a5fa' : 'rgba(96, 165, 250, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.font = 'bold 24px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = this._showAnyHelp ? '#93c5fd' : '#60a5fa';
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
                    this._showAnyHelp = !this._showAnyHelp;
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
    }
});
