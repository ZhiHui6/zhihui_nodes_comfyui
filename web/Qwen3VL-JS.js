import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

class APIConfigManager {
    constructor() {
        this.configPath = "custom_nodes/zhihui_nodes_comfyui/Nodes/Qwen3VL/api_config.json";
        this.config = null;
        this.isDialogOpen = false;
    }

    async loadConfig() {
        try {
            const response = await api.fetchApi(`/zhihui_nodes/api_config`, {
                method: "GET"
            });
            if (response.ok) {
                this.config = await response.json();
            } else {
                this.config = this.getDefaultConfig();
            }
        } catch (error) {
            console.error("加载API配置失败:", error);
            this.config = this.getDefaultConfig();
        }
        return this.config;
    }

    async saveConfig(config) {
        try {
            const response = await api.fetchApi(`/zhihui_nodes/api_config`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(config)
            });
            return response.ok;
        } catch (error) {
            console.error("保存API配置失败:", error);
            return false;
        }
    }

    getDefaultConfig() {
        return {
            api_keys: {
                SiliconFlow: {
                    api_key: "",
                    description: "SiliconFlow平台API密钥",
                    website: "https://siliconflow.cn",
                    docs: "https://docs.siliconflow.cn"
                },
                ModelScope: {
                    api_key: "",
                    description: "ModelScope平台API密钥",
                    website: "https://modelscope.cn",
                    docs: "https://modelscope.cn/docs"
                }
            },
            config_version: "1.0",
            last_updated: "",
            notes: "此文件用于存储Qwen3VL API节点的API密钥配置。请妥善保管您的API密钥，不要将其分享给他人。"
        };
    }

    showConfigDialog(buttonElement = null) {
        if (this.isDialogOpen) {
            return;
        }
        
        this.isDialogOpen = true;
        const config = this.config;

        const overlay = document.createElement("div");
        overlay.className = "comfy-modal-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: block;
        `;

        const dialog = document.createElement("div");
        dialog.className = "comfy-modal";
        dialog.style.cssText = `
            position: fixed;
            width: 400px;
            height: auto;
            background: var(--comfy-menu-bg);
            border: 2px solid #4488ff;
            border-radius: 8px;
            padding: 15px;
            max-height: 70vh;
            overflow-y: auto;
            color: var(--input-text);
            display: block;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            cursor: move;
        `;

        const dialogTop = (window.innerHeight - 400) / 2;
        const dialogLeft = (window.innerWidth - 400) / 2;

        dialog.style.top = Math.max(50, dialogTop) + 'px';
        dialog.style.left = Math.max(50, dialogLeft) + 'px';

        dialog.innerHTML = `
            <h2 id="dialog-title" style="
                margin-top: 0; 
                color: var(--input-text);
                user-select: none;
                padding: 8px;
                margin: -15px -15px 15px -15px;
                background: var(--comfy-input-bg);
                border-bottom: 1px solid var(--border-color);
                border-radius: 8px 8px 0 0;
                text-align: center;
                font-size: 16px;
                cursor: move;
            ">API密钥配置</h2>
            <div id="api-config-content">
                <div style="margin-bottom: 15px;">
                    <p style="color: var(--descrip-text); font-size: 13px; margin: 0;">
                        配置各个平台的API密钥。配置后，节点将自动使用这些密钥，无需每次手动输入。
                    </p>
                </div>
                <div id="platform-configs"></div>
                <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: flex-end;">
                    <button id="save-config" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    ">保存</button>
                    <button id="cancel-config" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    ">取消</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const closeDialog = () => {
            if (overlay && overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            if (dialog && dialog.parentNode) {
                document.body.removeChild(dialog);
            }
            this.isDialogOpen = false;
        };

        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        const titleElement = dialog.querySelector('#dialog-title');
        
        titleElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - dialog.offsetLeft;
            dragOffset.y = e.clientY - dialog.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newLeft = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - dialog.offsetWidth));
                const newTop = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - dialog.offsetHeight));
                
                dialog.style.left = newLeft + 'px';
                dialog.style.top = newTop + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.loadConfig().then(config => {
            this.renderPlatformConfigs(config);
        });

        dialog.querySelector("#save-config").onclick = () => {
            this.saveConfigFromDialog(dialog, () => {
                closeDialog();
            });
        };

        dialog.querySelector("#cancel-config").onclick = closeDialog;

        dialog.onclick = (e) => {
            e.stopPropagation();
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        const originalCloseDialog = closeDialog;
        closeDialog = () => {
            document.removeEventListener('keydown', handleKeyDown);
            originalCloseDialog();
        };
    }

    renderPlatformConfigs(config) {
        const container = document.querySelector("#platform-configs");
        container.innerHTML = "";

        Object.entries(config.api_keys || {}).forEach(([platform, platformConfig]) => {
            const platformDiv = document.createElement("div");
            platformDiv.style.cssText = `
                margin-bottom: 12px;
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
            `;

            platformDiv.innerHTML = `
                <h3 style="margin: 0 0 8px 0; color: var(--input-text); font-size: 14px;">${platform}</h3>
                <p style="margin: 0 0 8px 0; color: var(--descrip-text); font-size: 11px;">
                    ${platformConfig.description || ""}
                </p>
                <div style="margin-bottom: 8px;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API密钥:</label>
                    <input type="password" 
                           data-platform="${platform}" 
                           value="${platformConfig.api_key || ""}"
                           placeholder="输入${platform}的API密钥"
                           style="
                               width: 100%;
                               padding: 6px;
                               border: 1px solid var(--border-color);
                               border-radius: 4px;
                               background: var(--comfy-input-bg);
                               color: var(--input-text);
                               box-sizing: border-box;
                               font-size: 12px;
                           ">
                </div>
                <div style="display: flex; gap: 8px; font-size: 11px;">
                    <a href="${platformConfig.website || "#"}" target="_blank" 
                       style="color: var(--comfy-link-text); text-decoration: none;">
                       官网
                    </a>
                    <a href="${platformConfig.docs || "#"}" target="_blank" 
                       style="color: var(--comfy-link-text); text-decoration: none;">
                       文档
                    </a>
                </div>
            `;

            container.appendChild(platformDiv);
        });
    }

    async saveConfigFromDialog(dialog, onSuccess = null) {
        const inputs = dialog.querySelectorAll("input[data-platform]");
        const newConfig = { ...this.config };

        inputs.forEach(input => {
            const platform = input.dataset.platform;
            if (newConfig.api_keys[platform]) {
                newConfig.api_keys[platform].api_key = input.value;
            }
        });

        const success = await this.saveConfig(newConfig);
        if (success) {
            this.config = newConfig;
            alert("配置保存成功！");
            if (onSuccess) {
                onSuccess();
            }
        } else {
            alert("配置保存失败，请检查网络连接或重试。");
        }
    }
}

const apiConfigManager = new APIConfigManager();

app.registerExtension({
    name: "Comfyui_Qwen3VL.APIConfig",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (!nodeData?.category?.startsWith("Zhi.AI/Qwen3VL") && 
            !nodeData?.category?.startsWith("Comfyui_Qwen3VL")) {
            return;
        }
        
        switch (nodeData.name) {
            case "Qwen3VLAPI":
                const onNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                    
                    const configButton = this.addWidget("button", "配置API密钥", null, () => {
                        const buttonElement = document.querySelector('.comfy-widget-value[value="配置API密钥"]');
                        apiConfigManager.showConfigDialog(buttonElement);
                    });
                    
                    return r;
                };
                break;
                
            case "MultiplePathsInput":
                nodeType.prototype.onNodeCreated = function () {
                    this._type = "PATH";
                    this.inputs_offset = nodeData.name.includes("selective") ? 1 : 0;
                    
                    const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
                    if (inputcountWidget) {
                        const originalCallback = inputcountWidget.callback;
                        inputcountWidget.callback = (value) => {
                            if (originalCallback) originalCallback.call(this, value);
                            this.updateInputs(value);
                        };
                    }
                    
                    this.addWidget("button", "Update inputs", null, () => {
                        const target_number_of_inputs = this.widgets.find(
                            (w) => w.name === "inputcount"
                        )["value"];
                        this.updateInputs(target_number_of_inputs);
                    });
                    
                    this.updateInputs = function(target_number_of_inputs) {
                        if (!this.inputs) {
                            this.inputs = [];
                        }
                        
                        const currentPathInputs = this.inputs.filter(input => input.name.startsWith("path_")).length;
                        
                        if (target_number_of_inputs === currentPathInputs) return;

                        if (target_number_of_inputs < currentPathInputs) {
                            for (let i = this.inputs.length - 1; i >= 0; i--) {
                                const input = this.inputs[i];
                                if (input.name.startsWith("path_")) {
                                    const pathNum = parseInt(input.name.split("_")[1]);
                                    if (pathNum > target_number_of_inputs) {
                                        this.removeInput(i);
                                    }
                                }
                            }
                        } else {
                            for (let i = currentPathInputs + 1; i <= target_number_of_inputs; i++) {
                                this.addInput(`path_${i}`, this._type);
                            }
                        }
                    };
                };
                break;
                
            case "VideoLoader":
                const onVideoNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onVideoNodeCreated ? onVideoNodeCreated.apply(this, arguments) : undefined;
                    
                    const videoWidget = this.widgets?.find(w => w.name === "file" && w.type === "combo");
                    if (videoWidget) {
                        const originalCallback = videoWidget.callback;
                        videoWidget.callback = function(value) {
                            if (originalCallback) {
                                originalCallback.call(this, value);
                            }
                            
                            setTimeout(() => {
                                const videoElements = document.querySelectorAll('video');
                                videoElements.forEach(video => {
                                    if (video.src && video.src.includes(value)) {
                                        video.style.objectFit = 'contain';
                                        video.style.maxWidth = '100%';
                                        video.style.maxHeight = '100%';
                                        video.style.width = 'auto';
                                        video.style.height = 'auto';
                                    }
                                });
                            }, 100);
                        };
                    }
                    return r;
                };
                break;
        }
    },
    async setup() {
        const originalComputeVisibleNodes =
            LGraphCanvas.prototype.computeVisibleNodes;
        LGraphCanvas.prototype.computeVisibleNodes = function () {
            const visibleNodesSet = new Set(
                originalComputeVisibleNodes.apply(this, arguments)
            );
            for (const node of this.graph._nodes) {
                if (
                    (node.type === "SetNode" || node.type === "GetNode") &&
                    node.drawConnection
                ) {
                    visibleNodesSet.add(node);
                }
            }
            return Array.from(visibleNodesSet);
        };
    },
});