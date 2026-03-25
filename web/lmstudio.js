import { app } from "../../scripts/app.js";

const LMSTUDIO_EXT_ID = "ZhihuiNodes.LMStudio";

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
        animation: fadeScale 0.2s ease;
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
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                if (!this.lmstudioState) {
                    this.lmstudioState = {
                        lastParamPreset: "Ignore"
                    };
                }
                
                const settingsBtn = this.addWidget("button", "⚙️状态设置 / Status", null, () => {
                    showLMStudioSettings(this);
                });
                settingsBtn.serialize = false;
                
                return result;
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
        max-width: 1050px; /* 最大宽度限制，防止在大屏幕上过宽影响阅读 */
        width: 100%;       /* 响应式宽度，在较小屏幕上自适应并保持两侧边距 */
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
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            #${uniqueId} .ui-title {
                font-size: 14px;
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
                flex-wrap: wrap;
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
                min-width: 80px;
            }
            #${uniqueId} .dashboard-item.endpoint {
                min-width: 160px;
                max-width: 220px;
            }
            #${uniqueId} .dashboard-item.loaded {
                min-width: 80px;
            }
            #${uniqueId} .dashboard-item.models {
                min-width: 350px;
                max-width: none;
                flex: 1;
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
                /* 固定宽度 600px，不伸缩，用于容纳参数预设选择器和说明文字 */
                flex: 0 0 613px;
                padding: 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
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
                min-width: 200px;
                max-width: 280px;
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
                /* 固定宽度 380px，不伸缩，用于容纳超时设置参数 */
                flex: 0 0 380px;
                padding: 16px;
                background: linear-gradient(145deg, #1a202c, #2d3748);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            #${uniqueId} .timeout-title {
                margin: 0 0 12px 0;
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
                gap: 12px;
                margin-bottom: 12px;
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
                min-width: 80px;
            }
            #${uniqueId} .timeout-input {
                width: 45px;
                padding: 6px 8px;
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
                grid-template-columns: repeat(5, 1fr);
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
            }
            #${uniqueId} .preset-param-item.wide {
                padding: 8px 4px;
                min-width: 0;
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
                padding: 12px 16px;
                background: linear-gradient(145deg, #1e3a5f, #2d4a6f);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
            }
            #${uniqueId} .cors-notice-title {
                font-size: 14px;
                font-weight: 600;
                color: #60a5fa;
                margin: 0 0 4px 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #${uniqueId} .cors-notice-content {
                font-size: 12px;
                color: #cbd5e1;
                line-height: 1.1;
                margin: 0;
            }
            #${uniqueId} .cors-notice-content strong {
                color: #fbbf24;
            }
        </style>
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">LM Studio状态设置</h3>
                <button class="circle-close" type="button"></button>
            </div>
            <div class="dashboard">
                <h4 class="dashboard-title" style="margin: 0 0 10px 0;">
                    <span>📊</span>
                    <span>服务状态监控</span>
                    <button class="dashboard-refresh" type="button">刷新状态</button>
                </h4>
                <div class="dashboard-row">
                    <div class="dashboard-item status">
                        <div class="dashboard-item-label">服务状态</div>
                        <div class="dashboard-item-value" id="lmstudio-status">检查中...</div>
                    </div>
                    <div class="dashboard-item endpoint">
                        <div class="dashboard-item-label">服务地址</div>
                        <div class="dashboard-item-value" id="lmstudio-endpoint">-</div>
                    </div>
                    <div class="dashboard-item loaded">
                        <div class="dashboard-item-label">已加载模型</div>
                        <div class="dashboard-item-value" id="lmstudio-loaded">-</div>
                    </div>
                    <div class="dashboard-item models">
                        <div class="dashboard-item-label">可用模型列表</div>
                        <div class="dashboard-item-value" id="lmstudio-models-list" style="max-height: 80px; overflow-y: auto; margin-top: 2px;">-</div>
                    </div>
                </div>
                <div class="cors-notice">
                    <h5 class="cors-notice-title">
                        <span>ℹ️ CORS 配置提示</span>
                    </h5>
                    <p class="cors-notice-content">
                        如果连接失败，请确保在 <strong>LM Studio 软件设置</strong>中启用了 <strong>CORS（跨源资源共享）</strong>功能。<br>
                        启用 CORS 允许 ComfyUI 向 LM Studio 服务器发起请求。在 LM Studio 的 Server 设置中找到 "Enable CORS" 选项并勾选。
                    </p>
                </div>
            </div>
            <div class="settings-row">
                <div class="preset-section">
                    <h4 class="preset-title">
                        <span>⚙️</span>
                        <span>参数组预设</span>
                    </h4>
                    <div class="preset-row">
                        <select class="preset-select" id="lmstudio-preset-select">
                            <option value="Ignore">Ignore - 不应用预设</option>
                            <option value="Image Analysis">Image Analysis - 图像分析</option>
                            <option value="Text Generation">Text Generation - 文本生成</option>
                            <option value="Creative Writing">Creative Writing - 创意写作</option>
                        </select>
                    </div>
                    <div class="preset-info" id="lmstudio-preset-info">
                        选择一个预设以自动配置适合该场景的参数。
                    </div>
                    <div class="preset-params" id="lmstudio-preset-params" style="display: none;"></div>
                </div>
                <div class="timeout-section">
                    <h4 class="timeout-title">
                        <span>⏱️</span>
                        <span>超时设置</span>
                    </h4>
                    <div class="timeout-grid">
                        <div class="timeout-item">
                            <label class="timeout-label">获取模型列表</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-fetch" min="1" max="60" step="1" value="5">
                            <span class="timeout-unit">秒</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">API推理调用</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-api" min="10" max="600" step="10" value="120">
                            <span class="timeout-unit">秒</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">获取已加载模型</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-list" min="1" max="60" step="1" value="10">
                            <span class="timeout-unit">秒</span>
                        </div>
                        <div class="timeout-item">
                            <label class="timeout-label">卸载模型</label>
                            <input type="number" class="timeout-input" id="lmstudio-timeout-unload" min="5" max="120" step="5" value="30">
                            <span class="timeout-unit">秒</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="save-section">
                <button class="reset-default-btn" type="button" id="lmstudio-reset-default">🔄 恢复默认</button>
                <button class="save-all-btn" type="button" id="lmstudio-save-all">💾 保存所有设置</button>
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
        statusEl.textContent = "检查中...";
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
            
            statusEl.textContent = availableModels.length > 0 ? "已连接" : "无可用模型";
            statusEl.className = "dashboard-item-value " + (availableModels.length > 0 ? "connected" : "disconnected");
            
            if (availableModels.length > 0) {
                modelsListEl.innerHTML = "<ul class='models-list'>" + 
                    availableModels.map(m => `<li>${m}</li>`).join("") + 
                    "</ul>";
            } else {
                modelsListEl.textContent = "无可用模型";
            }
            
            if (loadedModels.length > 0) {
                loadedEl.innerHTML = "<ul class='models-list'>" + 
                    loadedModels.map(m => `<li>${m}</li>`).join("") + 
                    "</ul>";
            } else {
                loadedEl.textContent = "无";
            }
            
        } catch (e) {
            statusEl.textContent = "连接失败";
            statusEl.className = "dashboard-item-value disconnected";
        }
        
        refreshBtn.disabled = false;
    };
    
    refreshBtn.onclick = refreshDashboard;
    
    const paramPresets = {
        "Ignore": {
            params: {},
            description: "不应用任何预设，保持当前参数不变。"
        },
        "Image Analysis": {
            params: {
                max_tokens: 4096,
                temperature: 0.4,
                top_p: 0.9,
                top_k: 40,
                repetition_penalty: 1.1
            },
            description: "适合图像分析：较低的temperature确保描述准确性，适中的repetition_penalty避免重复。"
        },
        "Text Generation": {
            params: {
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95,
                top_k: 50,
                repetition_penalty: 1.0
            },
            description: "适合通用文本生成：平衡的temperature兼顾创造性和连贯性。"
        },
        "Creative Writing": {
            params: {
                max_tokens: 4096,
                temperature: 0.9,
                top_p: 0.95,
                top_k: 60,
                repetition_penalty: 1.05
            },
            description: "适合创意写作：较高的temperature增加创造性输出，适合故事、诗歌等创作。"
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
                timeoutApiInput.value = timeouts.api_call || 120;
                timeoutListInput.value = timeouts.unload_model_list || 10;
                timeoutUnloadInput.value = timeouts.unload_model || 30;
                
                updatePresetDisplay();
            }
        } catch (e) {
            presetSelect.value = "Ignore";
            timeoutFetchInput.value = 5;
            timeoutApiInput.value = 120;
            timeoutListInput.value = 10;
            timeoutUnloadInput.value = 30;
            updatePresetDisplay();
        }
    };
    
    const updatePresetDisplay = () => {
        const selectedPreset = presetSelect.value;
        const preset = paramPresets[selectedPreset];
        
        if (selectedPreset === "Ignore") {
            presetInfo.textContent = preset.description;
            presetParams.style.display = "none";
        } else {
            presetInfo.textContent = preset.description;
            presetParams.style.display = "grid";
            presetParams.innerHTML = Object.entries(preset.params).map(([key, value]) => {
                const labelMap = {
                    max_tokens: "Max Tokens",
                    temperature: "Temperature",
                    top_p: "Top P",
                    top_k: "Top K",
                    repetition_penalty: "Repetition",
                    seed: "Seed"
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
        }
    };
    
    presetSelect.addEventListener("change", () => {
        node.lmstudioState.lastParamPreset = presetSelect.value;
        updatePresetDisplay();
    });
    
    const applyPresetToNode = (presetName) => {
        const preset = paramPresets[presetName];
        if (!preset || presetName === "Ignore") return 0;
        
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

        const config = {
            preset: selectedPreset,
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
                let appliedCount = 0;
                if (selectedPreset !== "Ignore") {
                    appliedCount = applyPresetToNode(selectedPreset);
                    if (appliedCount > 0) {
                        node.setDirtyCanvas(true, true);
                    }
                }

                showToast("所有设置已保存到配置文件", "success");
            } else {
                showToast("保存设置失败", "error");
            }
        } catch (e) {
            showToast("保存设置失败: " + e.message, "error");
        }
    };

    resetDefaultBtn.onclick = () => {
        showConfirm(
            "确定要恢复默认设置吗？这将重置所有配置为默认值。",
            async () => {
                presetSelect.value = "Ignore";
                node.lmstudioState.lastParamPreset = "Ignore";

                timeoutFetchInput.value = 5;
                timeoutApiInput.value = 120;
                timeoutListInput.value = 10;
                timeoutUnloadInput.value = 30;

                updatePresetDisplay();

                const config = {
                    preset: "Ignore",
                    timeouts: {
                        fetch_models: 5,
                        api_call: 120,
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
                        showToast("已恢复默认设置并保存", "success");
                    } else {
                        showToast("保存默认设置失败", "error");
                    }
                } catch (e) {
                    showToast("保存默认设置失败: " + e.message, "error");
                }
            }
        );
    };

    loadConfig();
    
    refreshDashboard();

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
}