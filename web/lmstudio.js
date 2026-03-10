import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "ZhihuiNodes.LMStudio",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LMStudioNode") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function() {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
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
        max-width: 1000px; /* 最大宽度限制，防止在大屏幕上过宽影响阅读 */
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
                min-width: 200px;
                max-width: 360px;
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
    
    refreshDashboard();

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
}
