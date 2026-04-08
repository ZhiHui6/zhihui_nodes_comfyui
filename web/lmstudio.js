import { app } from "../../scripts/app.js";

const LMSTUDIO_EXT_ID = "ZhihuiNodes.LMStudio";

const i18n = {
    zh: {
        title: "🤖 LM Studio 状态设置",
        statusMonitoring: "服务状态监控",
        serverStatus: "服务器状态",
        connected: "已连接",
        disconnected: "未连接",
        corsNotice: "⚠️ CORS 配置提示",
        corsWarning: "如检测到跨域问题，请确保 LM Studio 服务器已启用 CORS 支持。解决方法：打开 LM Studio → 进入 Developer → 选择 Local Server → 找到 Server Settings 选项卡 → 启用 \"Enable CORS\" 选项，然后重启服务器。",
        howToEnable: "如何启用 CORS",
        availableModels: "可用模型列表",
        refresh: "🔄 刷新",
        refreshStatus: "刷新状态",
        serviceStatus: "服务状态",
        serviceAddress: "服务地址",
        loadedModels: "已加载模型",
        none: "无",
        checking: "检查中...",
        paramPreset: "参数组预设",
        presetDescription: "选择合适的参数预设以优化模型输出效果",
        timeoutSettings: "超时设置",
        promptPresetVersion: "反推预设版本",
        newVersion: "新版预设",
        oldVersion: "旧版预设",
        newVersionHintPrefix: "新版预设包含更多选项：",
        newVersionHintOptions: "标签、简洁、详细、极详细、电影感、详细分析、短篇故事、优化扩展提示词",
        oldVersionHintPrefix: "旧版预设包含：",
        oldVersionHintOptions: "标签、极详细、短篇故事",
        fetchModelsTimeout: "获取模型列表超时",
        fetchModelsTimeoutDesc: "从LM Studio服务器获取可用模型列表的最大等待时间",
        apiCallTimeout: "API 调用超时",
        apiCallTimeoutDesc: "与模型进行对话请求的最大等待时间",
        unloadModelListTimeout: "模型列表卸载超时",
        unloadModelListTimeoutDesc: "获取已加载模型列表用于卸载操作的最大等待时间",
        unloadModelTimeout: "模型卸载超时",
        unloadModelTimeoutDesc: "执行模型卸载操作的最大等待时间",
        seconds: "秒",
        saveAll: "💾 保存所有设置",
        resetDefault: "🔄 恢复默认",
        confirmReset: "确定要恢复默认设置吗？这将重置所有配置为默认值。",
        saveSuccess: "所有设置已保存到配置文件",
        saveSuccessRefresh: "设置已保存，请刷新页面以更新主节点的预设选项",
        saveFailed: "保存设置失败",
        resetSuccess: "已恢复默认设置并保存",
        resetFailed: "保存默认设置失败",
        ignore: "默认预设",
        ignoreDesc: "使用当前节点设置的参数值，不进行预设参数替换。",
        custom: "用户自设",
        customDesc: "维持用户当前在节点中的参数不做任何修改。",
        precise: "精确模式",
        balanced: "平衡模式",
        creative: "创意模式",
        preciseDesc: "适合需要精确回答的场景：较低的temperature减少随机性，适合代码、数学、逻辑推理等任务。",
        balancedDesc: "适合大多数日常对话场景：平衡的参数设置，在准确性和创造性之间取得良好平衡。",
        creativeDesc: "适合创意写作：较高的temperature增加创造性输出，适合故事、诗歌等创作。",
        maxTokens: "Max Tokens",
        temperature: "Temperature",
        topP: "Top P",
        topK: "Top K",
        repetition: "Repetition",
        seed: "Seed",
        showLogPanel: "日志信息栏管理",
        enableLogPanel: "开启日志信息栏",
        showLogPanelDesc: "在节点底部显示推理日志信息，包含模型、参数、耗时等详细信息",
        logPanelTitle: "📋 推理日志",
        clearLog: "清屏"
    },
    en: {
        title: "🤖 LM Studio Status Settings",
        statusMonitoring: "Service Status Monitoring",
        serverStatus: "Server Status",
        connected: "Connected",
        disconnected: "Disconnected",
        corsNotice: "⚠️ CORS Configuration Notice",
        corsWarning: "If cross-origin issue detected, please ensure LM Studio server has CORS support enabled. Solution: Open LM Studio → Go to Developer → Select Local Server → Find Server Settings tab → Enable \"Enable CORS\" option, then restart the server.",
        howToEnable: "How to Enable CORS",
        availableModels: "Available Models",
        refresh: "🔄 Refresh",
        refreshStatus: "Refresh Status",
        serviceStatus: "Status",
        serviceAddress: "Service Address",
        loadedModels: "Loaded Models",
        none: "None",
        checking: "Checking...",
        paramPreset: "Parameter Preset",
        presetDescription: "Select appropriate parameter preset to optimize model output",
        timeoutSettings: "Timeout Settings",
        promptPresetVersion: "Prompt Preset Version",
        newVersion: "New Version",
        oldVersion: "Old Version",
        newVersionHintPrefix: "New presets include: ",
        newVersionHintOptions: "Tags, Simple, Detailed, Extreme Detailed, Cinematic, Detailed Analysis, Short Story ...",
        oldVersionHintPrefix: "Old presets include: ",
        oldVersionHintOptions: "Tags, Extreme Detailed, Short Story",
        fetchModelsTimeout: "Fetch Models Timeout",
        fetchModelsTimeoutDesc: "Maximum wait time to retrieve available models from LM Studio server",
        apiCallTimeout: "API Call Timeout",
        apiCallTimeoutDesc: "Maximum wait time for chat completion requests",
        unloadModelListTimeout: "Unload Model List Timeout",
        unloadModelListTimeoutDesc: "Maximum wait time to get loaded models list for unload operations",
        unloadModelTimeout: "Unload Model Timeout",
        unloadModelTimeoutDesc: "Maximum wait time for model unload operations",
        seconds: "S",
        saveAll: "💾 Save All Settings",
        resetDefault: "🔄 Reset Default",
        confirmReset: "Are you sure you want to reset to default settings? This will reset all configurations.",
        saveSuccess: "All settings saved to configuration file",
        saveSuccessRefresh: "Settings saved, please refresh page to update main node preset options",
        saveFailed: "Failed to save settings",
        resetSuccess: "Reset to default and saved",
        resetFailed: "Failed to save default settings",
        ignore: "Default Preset",
        ignoreDesc: "Uses the current node's parameter values without preset replacement.",
        custom: "Custom",
        customDesc: "Maintains user's current node parameters without any modification.",
        precise: "Precise Mode",
        balanced: "Balanced Mode",
        creative: "Creative Mode",
        preciseDesc: "For scenarios requiring precise answers: lower temperature reduces randomness, suitable for code, math, logic reasoning tasks.",
        balancedDesc: "For most daily conversation scenarios: balanced parameters for good accuracy and creativity balance.",
        creativeDesc: "For creative writing: higher temperature increases creative output, suitable for stories, poetry, etc.",
        maxTokens: "Max Tokens",
        temperature: "Temperature",
        topP: "Top P",
        topK: "Top K",
        repetition: "Repetition",
        seed: "Seed",
        showLogPanel: "Log Panel Management",
        enableLogPanel: "Enable Log Panel",
        showLogPanelDesc: "Display inference log information at the bottom of the node, including model, parameters, duration, etc.",
        logPanelTitle: "📋 Inference Log",
        clearLog: "Clear"
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

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    const bgColor = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#667eea";
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${bgColor};
        color: white;
        padding: 16px 32px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10003;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: fadeScale 0.3s ease;
        text-align: center;
        min-width: 240px;
    `;
    toast.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeScale {
            from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes fadeScaleDialog {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "fadeScale 0.3s ease reverse";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirm(message, onConfirm, onCancel) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10004;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
        background: #1f2937;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 24px 32px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: fadeScaleDialog 0.2s ease;
    `;

    const messageEl = document.createElement("p");
    messageEl.style.cssText = `
        color: #e8e8e8;
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 24px 0;
    `;
    messageEl.textContent = message;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: center;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.style.cssText = `
        padding: 10px 24px;
        background: transparent;
        color: #9ca3af;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    cancelBtn.onmouseover = () => {
        cancelBtn.style.background = "rgba(255, 255, 255, 0.1)";
        cancelBtn.style.color = "#e8e8e8";
    };
    cancelBtn.onmouseout = () => {
        cancelBtn.style.background = "transparent";
        cancelBtn.style.color = "#9ca3af";
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "确定";
    confirmBtn.style.cssText = `
        padding: 10px 24px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
    `;
    confirmBtn.onmouseover = () => {
        confirmBtn.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
        confirmBtn.style.transform = "translateY(-1px)";
    };
    confirmBtn.onmouseout = () => {
        confirmBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
        confirmBtn.style.transform = "translateY(0)";
    };

    cancelBtn.onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };

    confirmBtn.onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

app.registerExtension({
    name: LMSTUDIO_EXT_ID,
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LMStudioNode") {
            nodeType.prototype._createLogPanel = function() {
                const host = document.createElement("div");
                host.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    min-height: 120px;
                    max-height: 300px;
                    background: linear-gradient(145deg, #1a1a2e, #1e2a3e);
                    border-radius: 8px;
                    overflow: hidden;
                    margin-top: 8px;
                `;
                
                const header = document.createElement("div");
                header.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 2px 12px;
                    background: linear-gradient(90deg, #4a6fa5, #5a8fc5);
                    color: white;
                    font-weight: 400;
                    font-size: 11px;
                `;
                
                const titleSpan = document.createElement("span");
                titleSpan.textContent = $t('logPanelTitle');
                
                const clearBtn = document.createElement("button");
                clearBtn.textContent = $t('clearLog');
                clearBtn.style.cssText = `
                    padding: 1px 6px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                    color: white;
                    font-size: 9px;
                    font-weight: 400;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                clearBtn.onmouseover = () => {
                    clearBtn.style.background = "rgba(255, 255, 255, 0.3)";
                };
                clearBtn.onmouseout = () => {
                    clearBtn.style.background = "rgba(255, 255, 255, 0.2)";
                };
                clearBtn.onclick = () => {
                    if (this._logPanelContent) {
                        this._logPanelContent.innerHTML = "";
                        this._logPanelContent.style.display = "none";
                    }
                };
                
                header.appendChild(titleSpan);
                header.appendChild(clearBtn);
                
                const content = document.createElement("div");
                content.style.cssText = `
                    flex: 1;
                    padding: 10px 12px;
                    overflow-y: auto;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #e8e8e8;
                    white-space: pre-wrap;
                    word-break: break-word;
                    display: none;
                `;
                
                host.appendChild(header);
                host.appendChild(content);
                
                const domWidget = this.addDOMWidget("lmstudio_log_panel", "div", host, {});
                domWidget.serialize = false;
                
                this._logPanelHost = host;
                this._logPanelContent = content;
                this._logPanelHeader = header;
                
                this._loadLogPanelConfig();
            };
            
            nodeType.prototype._loadLogPanelConfig = async function() {
                try {
                    const response = await fetch("/zhihui/lmstudio/config");
                    if (response.ok) {
                        const config = await response.json();
                        const showLog = config.show_log_panel !== false;
                        this.lmstudioState.showLogPanel = showLog;
                        if (this._logPanelHost) {
                            this._logPanelHost.style.display = showLog ? "flex" : "none";
                        }
                    }
                } catch (e) {
                    this.lmstudioState.showLogPanel = true;
                }
            };
            
            nodeType.prototype._updateLogPanel = function(logText) {
                if (!this.lmstudioState?.showLogPanel || !this._logPanelContent) {
                    return;
                }
                
                this._logPanelContent.style.display = "block";
                
                const timestamp = new Date().toLocaleTimeString();
                const logLine = document.createElement("div");
                logLine.style.cssText = `
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(147, 51, 234, 0.3);
                `;
                
                const timeSpan = document.createElement("span");
                timeSpan.style.cssText = `
                    color: #c084fc;
                    font-weight: 600;
                    margin-right: 8px;
                `;
                timeSpan.textContent = `[${timestamp}]`;
                
                const textSpan = document.createElement("span");
                textSpan.style.cssText = `color: #e8e8e8;`;
                textSpan.textContent = logText;
                
                logLine.appendChild(timeSpan);
                logLine.appendChild(textSpan);
                
                this._logPanelContent.appendChild(logLine);
                this._logPanelContent.scrollTop = this._logPanelContent.scrollHeight;
            };
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                if (!this.lmstudioState) {
                    this.lmstudioState = {
                        lastParamPreset: "Ignore",
                        showLogPanel: true
                    };
                }
                
                const settingsBtn = this.addWidget("button", "⚙️状态设置 / Status", null, () => {
                    showLMStudioSettings(this);
                });
                settingsBtn.serialize = false;
                
                this._createLogPanel();
                
                return result;
            };
            
            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function(message) {
                onExecuted?.apply(this, arguments);
                
                if (message?.log_info && this._logPanelContent) {
                    const logText = message.log_info[0];
                    if (logText && logText.trim()) {
                        this._updateLogPanel(logText);
                    }
                }
            };
        }
    }
});

function showLMStudioSettings(node) {
    const overlay = document.createElement("div");
    overlay.className = "comfy-modal-overlay";
    overlay.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const dialog = document.createElement("div");
    dialog.className = "comfy-modal";
    dialog.style.cssText = `
        max-width: 1188px;
        width: 100%;
        min-height: 680px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        padding: 16px 18px;
        color: #e8e8e8;
        z-index: 10002;
        display: block;
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
    `;
    
    const uniqueId = `lmstudio-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    dialog.innerHTML = `
        <style>
            #${uniqueId} .ui-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
                padding-bottom: 4px;
            }
            #${uniqueId} .ui-title {
                font-size: 18px;
                font-weight: 600;
                color: #f0f0f0;
                margin: 0;
            }
            #${uniqueId} .circle-close {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.25);
                background: #1f2937;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            }
            #${uniqueId} .circle-close::before {
                content: "×";
                color: #e8e8e8;
                font-size: 16px;
                line-height: 1;
            }
            #${uniqueId} .circle-close:hover {
                background: #b91c1c;
                border-color: #ef4444;
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
            }
            #${uniqueId} .dashboard {
                margin-bottom: 16px;
                padding: 12px 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                height: 245px;
                min-height: 245px;
                max-height: 245px;
                overflow: hidden;
                width: 1150px;
            }
            #${uniqueId} .dashboard-title {
                margin: 0 0 10px 0;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .dashboard-row {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 10px;
                flex-wrap: nowrap;
            }
            #${uniqueId} .dashboard-row:last-child {
                margin-bottom: 0;
            }
            #${uniqueId} .dashboard-item {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 6px;
                padding: 8px 12px;
                flex-shrink: 0;
            }
            #${uniqueId} .dashboard-item.status {
                width: 100px;
                flex: 0 0 100px;
            }
            #${uniqueId} .dashboard-item.endpoint {
                width: 200px;
                flex: 0 0 200px;
            }
            #${uniqueId} .dashboard-item.loaded {
                width: 350px;
            }
            #${uniqueId} .dashboard-item.models {
                width: 432px;
                flex: 0 0 432px;
            }
            #${uniqueId} #lmstudio-models-list {
                height: 60px;
                overflow-y: auto;
            }
            #${uniqueId} .dashboard-item-label {
                font-size: 12px;
                color: #667eea;
                margin-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            #${uniqueId} .dashboard-item-value {
                font-size: 14px;
                color: #e8e8e8;
                font-weight: 500;
                word-break: break-all;
                line-height: 1.4;
                height: 60px;
                overflow-y: auto;
            }
            #${uniqueId} .dashboard-item-value.connected {
                color: #4ade80;
            }
            #${uniqueId} .dashboard-item-value.disconnected {
                color: #f87171;
            }
            #${uniqueId} .dashboard-item-value.loading {
                color: #fbbf24;
            }
            #${uniqueId} .dashboard-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            #${uniqueId} .dashboard-refresh {
                padding: 6px 14px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: background 0.2s ease;
            }
            #${uniqueId} .dashboard-refresh:hover {
                background: #5b67c8;
            }
            #${uniqueId} .dashboard-refresh:disabled {
                background: #4b5563;
                cursor: not-allowed;
            }
            #${uniqueId} .models-list {
                margin: 0;
                padding-left: 16px;
                font-size: 13px;
                color: #e8e8e8;
                line-height: 1.5;
            }
            #${uniqueId} .models-list li {
                margin-bottom: 2px;
            }
            #${uniqueId} #lmstudio-models-list::-webkit-scrollbar {
                width: 6px;
            }
            #${uniqueId} #lmstudio-models-list::-webkit-scrollbar-track {
                background: rgba(102, 126, 234, 0.1);
                border-radius: 3px;
            }
            #${uniqueId} #lmstudio-models-list::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #667eea, #5b67c8);
                border-radius: 3px;
            }
            #${uniqueId} #lmstudio-models-list::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #7c8ef0, #667eea);
            }
            #${uniqueId} .features-group {
                margin-top: 16px;
                padding: 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid transparent;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
            }
            #${uniqueId} .features-title {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: #e8e8e8;
            }
            #${uniqueId} .features-columns {
                display: flex;
                gap: 20px;
            }
            #${uniqueId} .features-column {
                flex: 1;
                padding: 12px;
                background: rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 6px;
            }
            #${uniqueId} .features-column-title {
                font-size: 13px;
                font-weight: 600;
                color: #667eea;
                margin-bottom: 8px;
            }
            #${uniqueId} .features-column-desc {
                font-size: 12px;
                color: #e8e8e8;
                line-height: 1.5;
                margin-bottom: 8px;
            }
            #${uniqueId} .features-column-audience {
                font-size: 11px;
                color: #22c55e;
                background: rgba(34, 197, 94, 0.1);
                padding: 6px 10px;
                border-radius: 4px;
                margin-top: 8px;
                border-left: 3px solid #22c55e;
            }
            #${uniqueId} .features-column-list {
                margin: 0;
                padding-left: 16px;
                font-size: 11px;
                color: #cbd5e1;
                line-height: 1.6;
            }
            #${uniqueId} .settings-row {
                display: flex;
                gap: 16px;
                margin-top: 16px;
            }
            #${uniqueId} .preset-section {
                flex: 0 0 650px;
                height: 230px;
                min-height: 230px;
                max-height: 230px;
                padding: 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            #${uniqueId} .preset-title {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .preset-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }
            #${uniqueId} .preset-select {
                width: auto;
                min-width: 100px;
                max-width: 130px;
                padding: 8px 12px;
                background: #1f2937;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                color: #e8e8e8;
                font-size: 13px;
                cursor: pointer;
                transition: border-color 0.2s ease;
            }
            #${uniqueId} .preset-select:hover {
                border-color: #667eea;
            }
            #${uniqueId} .preset-select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            #${uniqueId} .preset-apply-btn {
                padding: 8px 16px;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background 0.2s ease;
            }
            #${uniqueId} .preset-apply-btn:hover {
                background: #16a34a;
            }
            #${uniqueId} .timeout-section {
                flex: 0 0 485px;
                padding: 12px 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            #${uniqueId} .timeout-title {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .timeout-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            #${uniqueId} .timeout-item {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(0, 0, 0, 0.2);
                padding: 8px 10px;
                border-radius: 6px;
                width: fit-content;
            }
            #${uniqueId} .timeout-label {
                font-size: 12px;
                color: #9ca3af;
                flex-shrink: 0;
                min-width: 140px;
            }
            #${uniqueId} .timeout-input {
                width: 35px;
                padding: 6px 4px;
                background: #1f2937;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 4px;
                color: #e8e8e8;
                font-size: 13px;
                text-align: center;
                -moz-appearance: textfield;
            }
            #${uniqueId} .timeout-input::-webkit-outer-spin-button,
            #${uniqueId} .timeout-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            #${uniqueId} .timeout-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            #${uniqueId} .timeout-unit {
                font-size: 12px;
                color: #667eea;
            }
            #${uniqueId} .prompt-version-section {
                margin-top: 16px;
                padding: 12px 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            #${uniqueId} .prompt-version-title {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .prompt-version-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            #${uniqueId} .prompt-version-select {
                width: 140px;
                padding: 8px 12px;
                background: #1f2937;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                color: #e8e8e8;
                font-size: 13px;
                cursor: pointer;
            }
            #${uniqueId} .prompt-version-select:focus {
                outline: none;
                border-color: #667eea;
            }
            #${uniqueId} .prompt-version-hint {
                font-size: 12px;
                color: #e2e8f0;
                flex: 1;
                padding: 8px 12px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
                border: 1px solid rgba(102, 126, 234, 0.4);
                border-radius: 6px;
                line-height: 1.5;
            }
            #${uniqueId} .hint-options {
                color: #fbbf24;
                font-weight: 600;
            }
            #${uniqueId} .log-panel-section {
                margin-top: 16px;
                padding: 12px 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            #${uniqueId} .log-panel-title {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .log-panel-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            #${uniqueId} .log-panel-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            #${uniqueId} .log-panel-checkbox input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: #4a6fa5;
            }
            #${uniqueId} .log-panel-checkbox-label {
                font-size: 13px;
                color: #e8e8e8;
            }
            #${uniqueId} .log-panel-hint {
                font-size: 12px;
                color: #9ca3af;
                flex: 1;
            }
            #${uniqueId} .timeout-apply-btn {
                width: 100%;
                padding: 10px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background 0.2s ease;
            }
            #${uniqueId} .timeout-apply-btn:hover {
                background: #5b67c8;
            }
            #${uniqueId} .save-section {
                margin-top: 16px;
                text-align: center;
                display: flex;
                gap: 12px;
            }
            #${uniqueId} .save-all-btn {
                flex: 1;
                padding: 12px 20px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            }
            #${uniqueId} .reset-default-btn {
                flex: 1;
                padding: 12px 20px;
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }
            #${uniqueId} .reset-default-btn:hover {
                background: linear-gradient(135deg, #4b5563, #374151);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
            }
            #${uniqueId} .reset-default-btn:active {
                transform: translateY(0);
            }
            #${uniqueId} .save-all-btn:hover {
                background: linear-gradient(135deg, #16a34a, #15803d);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
            }
            #${uniqueId} .save-all-btn:active {
                transform: translateY(0);
            }
            #${uniqueId} .preset-info {
                font-size: 12px;
                color: #9ca3af;
                line-height: 1.5;
                padding: 10px 12px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                border-left: 3px solid #667eea;
            }
            #${uniqueId} .preset-params {
                display: grid;
                grid-template-columns: 1.2fr 1fr 0.7fr 0.7fr 1.2fr;
                gap: 8px;
                margin-top: 10px;
            }
            #${uniqueId} .preset-param-item {
                background: rgba(0, 0, 0, 0.2);
                padding: 8px 10px;
                border-radius: 4px;
                font-size: 13px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            #${uniqueId} .preset-param-item.narrow {
                padding: 8px 4px;
                min-width: 0;
                max-width: 80px;
            }
            #${uniqueId} .preset-param-item.wide {
                padding: 8px 16px;
                min-width: 0;
                max-width: 220px;
            }
            #${uniqueId} .preset-param-label {
                color: #667eea;
                font-weight: 600;
                line-height: 1.3;
            }
            #${uniqueId} .preset-param-value {
                color: #e8e8e8;
                margin-top: 2px;
            }
            #${uniqueId} .cors-notice {
                margin-top: 12px;
                padding: 6px 16px;
                background: linear-gradient(145deg, #1e3a5f, #2d4a6f);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
            }
            #${uniqueId} .cors-notice h5 {
                margin: 0;
            }
            #${uniqueId} .cors-notice p {
                margin: 0;
            }
            #${uniqueId} .cors-notice-title {
                font-size: 13px;
                font-weight: 600;
                color: #60a5fa;
                margin: 0 0 1px 0;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            #${uniqueId} .cors-notice-content {
                font-size: 12px;
                color: #cbd5e1;
                line-height: 1.2;
                margin: 0;
            }
            #${uniqueId} .cors-notice-content strong {
                color: #fbbf24;
            }
        </style>
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">${$t('title')}</h3>
                <button class="circle-close" type="button"></button>
            </div>
            <div class="dashboard">
                <h4 class="dashboard-title" style="margin: 0 0 10px 0;">
                    <span>📊</span>
                    <span>${$t('statusMonitoring')}</span>
                    <button class="dashboard-refresh" type="button">${$t('refreshStatus')}</button>
                </h4>
                <div class="dashboard-row">
                    <div class="dashboard-item status">
                        <div class="dashboard-item-label">${$t('serviceStatus')}</div>
                        <div class="dashboard-item-value" id="lmstudio-status">${$t('disconnected')}</div>
                    </div>
                    <div class="dashboard-item endpoint">
                        <div class="dashboard-item-label">${$t('serviceAddress')}</div>
                        <div class="dashboard-item-value" id="lmstudio-endpoint">-</div>
                    </div>
                    <div class="dashboard-item loaded">
                        <div class="dashboard-item-label">${$t('loadedModels')}</div>
                        <div class="dashboard-item-value" id="lmstudio-loaded">-</div>
                    </div>
                    <div class="dashboard-item models">
                        <div class="dashboard-item-label">${$t('availableModels')}</div>
                        <div class="dashboard-item-value" id="lmstudio-models-list">-</div>
                    </div>
                </div>
                <div class="cors-notice">
                    <h5 class="cors-notice-title">
                        <span>${$t('corsNotice')}</span>
                    </h5>
                    <p class="cors-notice-content">
                        ${$t('corsWarning')}
                    </p>
                </div>
            </div>
            <div class="settings-row">
                <div class="preset-section">
                    <h4 class="preset-title">
                        <span>⚙️</span>
                        <span>${$t('paramPreset')}</span>
                    </h4>
                    <div class="preset-row">
                        <select class="preset-select" id="lmstudio-preset-select">
                            <option value="Ignore">${$t('ignore')}</option>
                            <option value="Precise">${$t('precise')}</option>
                            <option value="Balanced">${$t('balanced')}</option>
                            <option value="Creative">${$t('creative')}</option>
                            <option value="Custom">${$t('custom')}</option>
                        </select>
                    </div>
                    <div class="preset-info" id="lmstudio-preset-info">
                        ${$t('presetDescription')}
                    </div>
                    <div class="preset-params" id="lmstudio-preset-params" style="display: none;"></div>
                </div>
                <div class="timeout-section">
                    <h4 class="timeout-title">
                        <span>⏱️</span>
                        <span>${$t('timeoutSettings')}</span>
                    </h4>
                    <div class="timeout-grid">
                        <div class="timeout-item">
                            <label class="timeout-label">${$t('fetchModelsTimeout')}</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-fetch" min="1" max="60" step="1" value="5">
                            <span class="timeout-unit">${$t('seconds')}</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">${$t('apiCallTimeout')}</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-api" min="10" max="600" step="10" value="450">
                            <span class="timeout-unit">${$t('seconds')}</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">${$t('unloadModelListTimeout')}</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-list" min="1" max="60" step="1" value="10">
                            <span class="timeout-unit">${$t('seconds')}</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">${$t('unloadModelTimeout')}</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-unload" min="5" max="120" step="5" value="30">
                            <span class="timeout-unit">${$t('seconds')}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="prompt-version-section">
                <h4 class="prompt-version-title">
                    <span>📋</span>
                    <span>${$t('promptPresetVersion')}</span>
                </h4>
                <div class="prompt-version-row">
                    <select class="prompt-version-select" id="lmstudio-prompt-version">
                        <option value="new">${$t('newVersion')}</option>
                        <option value="old">${$t('oldVersion')}</option>
                    </select>
                    <span class="prompt-version-hint">
                        <span class="hint-prefix">${$t('newVersionHintPrefix')}</span>
                        <span class="hint-options">${$t('newVersionHintOptions')}</span>
                    </span>
                </div>
            </div>
            <div class="log-panel-section">
                <h4 class="log-panel-title">
                    <span>📝</span>
                    <span>${$t('showLogPanel')}</span>
                </h4>
                <div class="log-panel-row">
                    <label class="log-panel-checkbox">
                        <input type="checkbox" id="lmstudio-show-log-panel" checked>
                        <span class="log-panel-checkbox-label">${$t('enableLogPanel')}</span>
                    </label>
                    <span class="log-panel-hint">${$t('showLogPanelDesc')}</span>
                </div>
            </div>
            <div class="save-section">
                <button class="reset-default-btn" type="button" id="lmstudio-reset-default">${$t('resetDefault')}</button>
                <button class="save-all-btn" type="button" id="lmstudio-save-all">${$t('saveAll')}</button>
            </div>
        </div>
    `;
    
    const close = () => {
        document.removeEventListener("keydown", keydownHandler, true);
        document.removeEventListener("keyup", keyupHandler, true);
        document.removeEventListener("keypress", keypressHandler, true);
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (dialog.parentNode) document.body.removeChild(dialog);
    };

    const keydownHandler = (e) => {
        e.stopPropagation();
    };

    const keyupHandler = (e) => {
        e.stopPropagation();
    };

    const keypressHandler = (e) => {
        e.stopPropagation();
    };

    document.addEventListener("keydown", keydownHandler, true);
    document.addEventListener("keyup", keyupHandler, true);
    document.addEventListener("keypress", keypressHandler, true);
    
    const closeBtn = dialog.querySelector(".circle-close");
    closeBtn.onclick = close;
    
    const refreshBtn = dialog.querySelector(".dashboard-refresh");
    
    const refreshDashboard = async () => {
        const statusEl = dialog.querySelector("#lmstudio-status");
        const endpointEl = dialog.querySelector("#lmstudio-endpoint");
        const modelsListEl = dialog.querySelector("#lmstudio-models-list");
        const loadedEl = dialog.querySelector("#lmstudio-loaded");  
        const currentEndpoint = node.widgets?.find(w => w.name === "endpoint")?.value || "http://localhost:1234";
        
        endpointEl.textContent = currentEndpoint;
        statusEl.textContent = $t('checking');
        statusEl.className = "dashboard-item-value loading";
        modelsListEl.textContent = "-";
        loadedEl.textContent = "-";
        
        refreshBtn.disabled = true;
        
        try {
            const base = currentEndpoint.replace(/\/+$/, "").replace(/\/v1$/, "");
            const v1Url = base + "/v1/models";
            const apiModelsUrl = base + "/api/v1/models";
            
            let availableModels = [];
            let loadedModels = [];
            
            try {
                const response = await fetch(v1Url);
                if (response.ok) {
                    const data = await response.json();
                    availableModels = data.data?.map(m => m.id) || [];
                }
            } catch (e) {
                availableModels = [];
            }
            
            try {
                const response = await fetch(apiModelsUrl);
                if (response.ok) {
                    const data = await response.json();
                    const models = data.models || data.data || [];
                    loadedModels = [];
                    models.forEach(m => {
                        if (m.loaded_instances && Array.isArray(m.loaded_instances)) {
                            m.loaded_instances.forEach(inst => {
                                if (inst.id) loadedModels.push(inst.id);
                            });
                        }
                    });
                }
            } catch (e) {
                loadedModels = [];
            }
            
            statusEl.textContent = availableModels.length > 0 ? $t('connected') : $t('disconnected');
            statusEl.className = "dashboard-item-value " + (availableModels.length > 0 ? "connected" : "disconnected");

            if (availableModels.length > 0) {
                modelsListEl.innerHTML = "<ul class='models-list'>" +
                    availableModels.map(m => `<li>${m}</li>`).join("") +
                    "</ul>";
            } else {
                modelsListEl.textContent = $t('disconnected');
            }
            
            if (loadedModels.length > 0) {
                loadedEl.innerHTML = loadedModels.map(m => `<div>${m}</div>`).join("");
            } else {
                loadedEl.textContent = $t('none');
            }
            
        } catch (e) {
            statusEl.textContent = $t('disconnected');
            statusEl.className = "dashboard-item-value disconnected";
        }
        
        refreshBtn.disabled = false;
    };
    
    refreshBtn.onclick = refreshDashboard;
    
    const paramPresets = {
        "Ignore": {
            params: {
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repetition_penalty: 1.0
            },
            description: $t('ignoreDesc')
        },
        "Custom": {
            params: {},
            description: $t('customDesc')
        },
        "Precise": {
            params: {
                max_tokens: 4096,
                temperature: 0.4,
                top_p: 0.9,
                top_k: 40,
                repetition_penalty: 1.1
            },
            description: $t('preciseDesc')
        },
        "Balanced": {
            params: {
                max_tokens: 2048,
                temperature: 0.75,
                top_p: 0.92,
                top_k: 45,
                repetition_penalty: 1.0
            },
            description: $t('balancedDesc')
        },
        "Creative": {
            params: {
                max_tokens: 4096,
                temperature: 0.9,
                top_p: 0.95,
                top_k: 60,
                repetition_penalty: 1.05
            },
            description: $t('creativeDesc')
        }
    };
    
    const presetSelect = dialog.querySelector("#lmstudio-preset-select");
    const presetInfo = dialog.querySelector("#lmstudio-preset-info");
    const presetParams = dialog.querySelector("#lmstudio-preset-params");
    const saveAllBtn = dialog.querySelector("#lmstudio-save-all");
    const resetDefaultBtn = dialog.querySelector("#lmstudio-reset-default");
    const timeoutFetchInput = dialog.querySelector("#lmstudio-timeout-fetch");
    const timeoutApiInput = dialog.querySelector("#lmstudio-timeout-api");
    const timeoutListInput = dialog.querySelector("#lmstudio-timeout-list");
    const timeoutUnloadInput = dialog.querySelector("#lmstudio-timeout-unload");
    const promptVersionSelect = dialog.querySelector("#lmstudio-prompt-version");
    let originalPromptVersion = "new";
    const showLogPanelCheckbox = dialog.querySelector("#lmstudio-show-log-panel");
    
    const loadConfig = async () => {
        try {
            const response = await fetch("/zhihui/lmstudio/config");
            if (response.ok) {
                const config = await response.json();
                const savedPreset = config.preset || "Ignore";
                presetSelect.value = savedPreset;
                node.lmstudioState.lastParamPreset = savedPreset;
                
                const timeouts = config.timeouts || {};
                timeoutFetchInput.value = timeouts.fetch_models || 5;
                timeoutApiInput.value = timeouts.api_call || 450;
                timeoutListInput.value = timeouts.unload_model_list || 10;
                timeoutUnloadInput.value = timeouts.unload_model || 30;
                
                const promptVersion = config.prompt_version || "new";
                promptVersionSelect.value = promptVersion;
                originalPromptVersion = promptVersion;
                updatePromptVersionHint();
                
                const showLogPanel = config.show_log_panel !== false;
                showLogPanelCheckbox.checked = showLogPanel;
                node.lmstudioState.showLogPanel = showLogPanel;
                
                updatePresetDisplay();
            }
        } catch (e) {
            presetSelect.value = "Ignore";
            timeoutFetchInput.value = 5;
            timeoutApiInput.value = 450;
            timeoutListInput.value = 10;
            timeoutUnloadInput.value = 30;
            promptVersionSelect.value = "new";
            showLogPanelCheckbox.checked = true;
            node.lmstudioState.showLogPanel = true;
            updatePromptVersionHint();
            updatePresetDisplay();
        }
    };
    
    const updatePromptVersionHint = () => {
        const hintEl = dialog.querySelector(".prompt-version-hint");
        if (hintEl) {
            const isNew = promptVersionSelect.value === "new";
            hintEl.innerHTML = `
                <span class="hint-prefix">${isNew ? $t('newVersionHintPrefix') : $t('oldVersionHintPrefix')}</span>
                <span class="hint-options">${isNew ? $t('newVersionHintOptions') : $t('oldVersionHintOptions')}</span>
            `;
        }
    };
    
    promptVersionSelect.addEventListener("change", updatePromptVersionHint);
    
    const updatePresetDisplay = () => {
        const selectedPreset = presetSelect.value;
        const preset = paramPresets[selectedPreset];
        
        presetInfo.textContent = preset.description;
        
        if (selectedPreset === "Custom") {
            presetParams.style.display = "none";
            return;
        }
        
        presetParams.style.display = "grid";
        const paramsToShow = preset.params;
        
        presetParams.innerHTML = Object.entries(paramsToShow).map(([key, value]) => {
            const labelMap = {
                max_tokens: $t('maxTokens'),
                temperature: $t('temperature'),
                top_p: $t('topP'),
                top_k: $t('topK'),
                repetition_penalty: $t('repetition'),
                seed: $t('seed')
            };
            let widthClass = 'preset-param-item';
            if (key === 'top_p' || key === 'top_k') {
                widthClass = 'preset-param-item narrow';
            } else if (key === 'max_tokens') {
                widthClass = 'preset-param-item wide';
            }
            return `<div class="${widthClass}">
                <span class="preset-param-label">${labelMap[key] || key}:</span>
                <span class="preset-param-value">${value}</span>
            </div>`;
        }).join("");
    };
    
    presetSelect.addEventListener("change", () => {
        node.lmstudioState.lastParamPreset = presetSelect.value;
        updatePresetDisplay();
    });
    
    const applyPresetToNode = (presetName) => {
        const preset = paramPresets[presetName];
        if (!preset || presetName === "Custom") return 0;
        
        const widgetMap = {
            max_tokens: "max_tokens",
            temperature: "temperature",
            top_p: "top_p",
            top_k: "top_k",
            repetition_penalty: "repetition_penalty",
            seed: "seed"
        };
        
        let appliedCount = 0;
        Object.entries(preset.params).forEach(([key, value]) => {
            const widgetName = widgetMap[key];
            if (widgetName) {
                const widget = node.widgets?.find(w => w.name === widgetName);
                if (widget) {
                    widget.value = value;
                    if (widget.callback) {
                        widget.callback(value);
                    }
                    appliedCount++;
                }
            }
        });
        
        return appliedCount;
    };
    
    saveAllBtn.onclick = async () => {
        const selectedPreset = presetSelect.value;
        const showLogPanel = showLogPanelCheckbox.checked;

        const config = {
            preset: selectedPreset,
            prompt_version: promptVersionSelect.value,
            show_log_panel: showLogPanel,
            timeouts: {
                fetch_models: parseInt(timeoutFetchInput.value),
                api_call: parseInt(timeoutApiInput.value),
                unload_model_list: parseInt(timeoutListInput.value),
                unload_model: parseInt(timeoutUnloadInput.value)
            }
        };

        try {
            const response = await fetch("/zhihui/lmstudio/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                node.lmstudioState.showLogPanel = showLogPanel;
                if (node._logPanelHost) {
                    node._logPanelHost.style.display = showLogPanel ? "flex" : "none";
                }
                
                let appliedCount = 0;
                if (selectedPreset !== "Ignore") {
                    appliedCount = applyPresetToNode(selectedPreset);
                    if (appliedCount > 0) {
                        node.setDirtyCanvas(true, true);
                    }
                }

                const newPromptVersion = promptVersionSelect.value;
                if (newPromptVersion !== originalPromptVersion) {
                    originalPromptVersion = newPromptVersion;
                    showToast($t('saveSuccessRefresh'), "success");
                } else {
                    showToast($t('saveSuccess'), "success");
                }
            } else {
                showToast($t('saveFailed'), "error");
            }
        } catch (e) {
            showToast($t('saveFailed') + ": " + e.message, "error");
        }
    };

    resetDefaultBtn.onclick = () => {
        showConfirm(
            $t('confirmReset'),
            async () => {
                const needRefresh = originalPromptVersion !== "new";
                
                presetSelect.value = "Ignore";
                node.lmstudioState.lastParamPreset = "Ignore";

                timeoutFetchInput.value = 5;
                timeoutApiInput.value = 450;
                timeoutListInput.value = 10;
                timeoutUnloadInput.value = 30;
                promptVersionSelect.value = "new";
                originalPromptVersion = "new";
                showLogPanelCheckbox.checked = true;
                node.lmstudioState.showLogPanel = true;
                if (node._logPanelHost) {
                    node._logPanelHost.style.display = "flex";
                }

                updatePresetDisplay();

                const config = {
                    preset: "Ignore",
                    prompt_version: "new",
                    show_log_panel: true,
                    timeouts: {
                        fetch_models: 5,
                        api_call: 450,
                        unload_model_list: 10,
                        unload_model: 30
                    }
                };

                try {
                    const response = await fetch("/zhihui/lmstudio/config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(config)
                    });

                    if (response.ok) {
                        if (needRefresh) {
                            showToast($t('saveSuccessRefresh'), "success");
                        } else {
                            showToast($t('resetSuccess'), "success");
                        }
                    } else {
                        showToast($t('resetFailed'), "error");
                    }
                } catch (e) {
                    showToast($t('resetFailed') + ": " + e.message, "error");
                }
            }
        );
    };

    loadConfig();
    
    refreshDashboard();

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
}