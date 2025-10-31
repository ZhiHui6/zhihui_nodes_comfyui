import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

class APIConfigManager {
    constructor() {
        this.configPath = "custom_nodes/zhihui_nodes_comfyui/Nodes/Qwen3VL/api_config.json";
        this.config = null;
        this.isDialogOpen = false;     
        this.platformModels = {
            "ModelScope": [
                "Qwen3-VL-8B-Instruct",
                "Qwen3-VL-8B-Thinking",
                "Qwen3-VL-235B-A22B-Instruct"

            ],
            "SiliconFlow": [
                "Qwen3-VL-8B-Instruct",
                "Qwen3-VL-8B-Thinking",
                "Qwen3-VL-32B-Thinking",
                "Qwen3-VL-32B-Instruct",
                "Qwen3-VL-30B-A3B-Thinking",
                "Qwen3-VL-30B-A3B-Instruct"
            ],
            "Aliyun": [
                "qwen3-vl-plus",
                "qwen3-vl-flash",
                "qwen3-vl-235b-a22b-thinking",
                "qwen3-vl-235b-a22b-instruct",
                "qwen3-vl-32b-thinking",
                "qwen3-vl-32b-instruct",
                "qwen3-vl-30b-a3b-thinking",
                "qwen3-vl-30b-a3b-instruct",
                "qwen3-vl-8b-thinking",
                "qwen3-vl-8b-instruct"
            ]
        };
    }

    async loadConfig() {
        const defaultConfig = this.getDefaultConfig();
        
        try {
            const response = await api.fetchApi(`/zhihui_nodes/communication_config`, {
                method: "GET"
            });
            if (response.ok) {
                const fileConfig = await response.json();
                this.config = { ...defaultConfig };
                if (fileConfig.api_keys) {
                    Object.keys(defaultConfig.api_keys).forEach(platform => {
                        if (fileConfig.api_keys[platform]) {
                            if (fileConfig.api_keys[platform].api_key) {
                                this.config.api_keys[platform].api_key = fileConfig.api_keys[platform].api_key;
                            }
                            if (fileConfig.api_keys[platform].selected_model) {
                                this.config.api_keys[platform].selected_model = fileConfig.api_keys[platform].selected_model;
                            }
                        }
                    });
                }
                
                if (fileConfig.active_platform) {
                    this.config.active_platform = fileConfig.active_platform;
                }
                if (fileConfig.active_custom) {
                    this.config.active_custom = fileConfig.active_custom;
                }
                if (fileConfig.custom_configs) {
                    this.config.custom_configs = { ...this.config.custom_configs, ...fileConfig.custom_configs };
                }
            } else {
                this.config = defaultConfig;
            }
        } catch (error) {
            console.error("加载API配置失败:", error);
            this.config = defaultConfig;
        }
        return this.config;
    }

    async saveConfig(config) {
        try {
            const response = await api.fetchApi(`/zhihui_nodes/communication_config`, {
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
                    website: "https://siliconflow.cn",
                    docs: "https://docs.siliconflow.cn/cn/userguide/quickstart#4-1-%E5%88%9B%E5%BB%BAapi-key",
                    active: false
                },
                ModelScope: {
                    api_key: "",
                    website: "https://modelscope.cn",
                    docs: "https://modelscope.cn/docs/model-service/API-Inference/intro",
                    active: false
                },
                "Aliyun": {
                    api_key: "",
                    website: "https://www.aliyun.com/",
                    docs: "https://bailian.console.aliyun.com/?spm=5176.29619931.J_SEsSjsNv72yRuRFS2VknO.2.74cd405fVDTiYg&tab=api#/api",
                    api_base: "https://dashscope.aliyuncs.com/compatible-mode/v1",
                    active: false
                }
            },
            custom_configs: {
                custom_1: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                },
                custom_2: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                },
                custom_3: {
                    name: "",
                    api_base: "",
                    model_name: "",
                    api_key: "",
                    active: false
                }
            },
            active_platform: "SiliconFlow",
            active_custom: "custom_1",
            config_version: "3.0"
        };
    }

    async showConfigDialog(buttonElement = null) {
        if (this.isDialogOpen) {
            return;
        }
        
        this.isDialogOpen = true;
        
        const config = await this.loadConfig();
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
            width: 800px;
            height: auto;
            background: var(--comfy-menu-bg);
            border: 2px solid #4488ff;
            border-radius: 8px;
            padding: 20px;
            max-height: 80vh;
            overflow-y: auto;
            color: var(--input-text);
            display: block;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;

        dialog.innerHTML = `
            <h2 id="dialog-title" style="
                margin-top: 0; 
                color: var(--input-text);
                user-select: none;
                padding: 8px;
                margin: -20px -20px 15px -20px;
                background: var(--comfy-input-bg);
                border-bottom: 1px solid var(--border-color);
                border-radius: 8px 8px 0 0;
                text-align: center;
                font-size: 16px;
            ">通讯设置</h2>
            <div id="api-config-content">
                <div style="margin-bottom: 15px;">
                    <p style="color: var(--descrip-text); font-size: 13px; margin: 0;">
                        配置各个平台的API密钥。配置后，节点将自动使用这些密钥，无需每次手动输入。
                    </p>
                </div>
                
                <!-- 主配置区域 - 两行布局 -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- 第一行：平台预设 -->
                    <div style="flex: 1;">
                        <h3 style="
                            margin: 0 0 10px 0; 
                            color: var(--input-text); 
                            font-size: 14px; 
                            font-weight: bold;
                            border-bottom: 1px solid var(--border-color);
                            padding-bottom: 5px;
                        ">平台预设</h3>
                        <div id="platform-configs"></div>
                    </div>
                    
                    <!-- 第二行：自定义配置 -->
                    <div style="flex: 1;">
                        <h3 style="
                            margin: 0 0 10px 0; 
                            color: var(--input-text); 
                            font-size: 14px; 
                            font-weight: bold;
                            border-bottom: 1px solid var(--border-color);
                            padding-bottom: 5px;
                        ">完全自定义</h3>
                        <div id="custom-configs"></div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: space-between;">
                    <button id="restore-default" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#ff6b35'; this.style.borderColor='#ff6b35'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">恢复默认</button>
                    <div style="display: flex; gap: 8px;">
                        <button id="save-config" style="
                            background: var(--comfy-input-bg);
                            border: 1px solid var(--border-color);
                            color: var(--input-text);
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='#4488ff'; this.style.borderColor='#4488ff'; this.style.color='white';" 
                          onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">保存</button>
                        <button id="cancel-config" style="
                            background: var(--comfy-input-bg);
                            border: 1px solid var(--border-color);
                            color: var(--input-text);
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                          onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">取消</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        this.renderPlatformConfigs(config);
        this.renderCustomConfigs(config);

        const closeDialog = () => {
            if (overlay && overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            if (dialog && dialog.parentNode) {
                document.body.removeChild(dialog);
            }
            this.isDialogOpen = false;
        };

        dialog.querySelector("#save-config").onclick = () => {
            this.saveConfigFromDialog(dialog);
        };

        dialog.querySelector("#restore-default").onclick = () => {
            this.restoreDefaultConfig(dialog);
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

        const gridContainer = document.createElement("div");
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        `;

        const activePlatform = config.active_platform || "SiliconFlow";

        Object.entries(config.api_keys || {}).forEach(([platform, platformConfig]) => {
            const isActive = activePlatform === platform;
            
            const platformDiv = document.createElement("div");
            platformDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                min-height: 200px;
                display: flex;
                flex-direction: column;
            `;

            const supportedModels = this.platformModels[platform] || [];
            const configuredModel = platformConfig.selected_model || "";
            const selectedModel = supportedModels.includes(configuredModel) ? configuredModel : (supportedModels.length > 0 ? supportedModels[0] : "");          
            const modelOptions = supportedModels.map(model => 
                `<option value="${model}" ${model === selectedModel ? 'selected' : ''}>${model}</option>`
            ).join('');

            platformDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${platform}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_platform" 
                               value="${platform}"
                               ${isActive ? 'checked' : ''}
                               style="margin: 0; accent-color: #22c55e;">
                        <span style="font-size: 12px; color: ${isActive ? '#22c55e' : 'var(--input-text)'}; font-weight: ${isActive ? 'bold' : 'normal'};">激活</span>
                    </label>
                </div>
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">模型选择:</label>
                    <select data-platform-model="${platform}" 
                            style="
                                width: 100%;
                                padding: 6px;
                                border: 1px solid var(--border-color);
                                border-radius: 4px;
                                background: var(--comfy-input-bg);
                                color: var(--input-text);
                                font-size: 12px;
                            ">
                        ${modelOptions}
                    </select>
                </div>
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API密钥:</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" 
                               data-platform="${platform}" 
                               value="${platformConfig.api_key || ""}"
                               placeholder="输入${platform}的API密钥"
                               style="
                                   width: 100%;
                                   padding: 6px 35px 6px 6px;
                                   border: 1px solid var(--border-color);
                                   border-radius: 4px;
                                   background: var(--comfy-input-bg);
                                   color: var(--input-text);
                                   box-sizing: border-box;
                                   font-size: 12px;
                               ">
                        <button type="button" 
                                class="password-toggle-btn" 
                                data-platform="${platform}"
                                style="
                                    position: absolute;
                                    right: 8px;
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 2px;
                                    color: var(--input-text);
                                    font-size: 14px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'"
                                title="显示/隐藏密码">
                            👁️
                        </button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; font-size: 11px; justify-content: center; margin-top: auto;">
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

            gridContainer.appendChild(platformDiv);
        });

        container.appendChild(gridContainer);
        container.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const input = container.querySelector(`input[data-platform="${platform}"]`);
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        });

        container.querySelectorAll('input[name="active_platform"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_platform"]').forEach(r => {
                    const span = r.nextElementSibling;
                    if (span) {
                        span.style.color = 'var(--input-text)';
                        span.style.fontWeight = 'normal';
                    }
                });
                
                if (radio.checked) {
                    const span = radio.nextElementSibling;
                    if (span) {
                        span.style.color = '#22c55e';
                        span.style.fontWeight = 'bold';
                    }
                }
            });
        });
    }

    renderCustomConfigs(config) {
        const container = document.querySelector("#custom-configs");
        container.innerHTML = "";

        const customConfigs = config.custom_configs || {};
        const activeCustom = config.active_custom || "custom_1";

        const gridContainer = document.createElement("div");
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        `;

        ['custom_1', 'custom_2', 'custom_3'].forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const isActive = activeCustom === customKey;

            const customDiv = document.createElement("div");
            customDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                min-height: 200px;
                display: flex;
                flex-direction: column;
            `;

            customDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${customConfig.name || `自定义配置${customKey.slice(-1)}`}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_custom" 
                               value="${customKey}"
                               ${isActive ? 'checked' : ''}
                               style="margin: 0; accent-color: #22c55e;">
                        <span style="font-size: 12px; color: ${isActive ? '#22c55e' : 'var(--input-text)'}; font-weight: ${isActive ? 'bold' : 'normal'};">激活</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">配置名称:</label>
                    <input type="text" 
                           data-custom="${customKey}_name" 
                           value="${customConfig.name || `自定义配置${customKey.slice(-1)}`}"
                           placeholder="配置名称"
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
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API地址:</label>
                    <input type="text" 
                           data-custom="${customKey}_api_base" 
                           value="${customConfig.api_base || ""}"
                           placeholder="https://api.example.com/v1/chat/completions"
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
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">模型名称:</label>
                    <input type="text" 
                           data-custom="${customKey}_model_name" 
                           value="${customConfig.model_name || ""}"
                           placeholder="custom-model-name"
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
                
                <div style="margin-bottom: 8px; flex: 1;">
                    <label style="display: block; margin-bottom: 4px; color: var(--input-text); font-size: 12px;">API密钥:</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" 
                               data-custom="${customKey}_api_key" 
                               value="${customConfig.api_key || ""}"
                               placeholder="your-api-key-here"
                               style="
                                   width: 100%;
                                   padding: 6px 35px 6px 6px;
                                   border: 1px solid var(--border-color);
                                   border-radius: 4px;
                                   background: var(--comfy-input-bg);
                                   color: var(--input-text);
                                   box-sizing: border-box;
                                   font-size: 12px;
                               ">
                        <button type="button" 
                                class="custom-password-toggle-btn"
                                data-custom="${customKey}"
                                style="
                                    position: absolute;
                                    right: 8px;
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 2px;
                                    color: var(--input-text);
                                    font-size: 14px;
                                    opacity: 0.7;
                                    transition: opacity 0.2s;
                                "
                                onmouseover="this.style.opacity='1'"
                                onmouseout="this.style.opacity='0.7'"
                                title="显示/隐藏密码">
                            👁️
                        </button>
                    </div>
                </div>
            `;

            gridContainer.appendChild(customDiv);
        });

        container.appendChild(gridContainer);

        container.querySelectorAll('.custom-password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const customKey = btn.dataset.custom;
                const input = container.querySelector(`input[data-custom="${customKey}_api_key"]`);
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        });

        container.querySelectorAll('input[name="active_custom"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_custom"]').forEach(r => {
                    const span = r.nextElementSibling;
                    if (span) {
                        span.style.color = 'var(--input-text)';
                        span.style.fontWeight = 'normal';
                    }
                });
                
                if (radio.checked) {
                    const span = radio.nextElementSibling;
                    if (span) {
                        span.style.color = '#22c55e';
                        span.style.fontWeight = 'bold';
                    }
                }
            });
        });
    }

    async saveConfigFromDialog(dialog, onSuccess = null) {
        const platformInputs = dialog.querySelectorAll("input[data-platform]");
        const platformModelSelects = dialog.querySelectorAll("select[data-platform-model]");
        const customInputs = dialog.querySelectorAll("input[data-custom]");
        const newConfig = { ...this.config };

        platformInputs.forEach(input => {
            const platform = input.dataset.platform;
            if (newConfig.api_keys[platform]) {
                newConfig.api_keys[platform].api_key = input.value;
            }
        });

        platformModelSelects.forEach(select => {
            const platform = select.dataset.platformModel;
            if (newConfig.api_keys[platform]) {
                newConfig.api_keys[platform].selected_model = select.value;
            }
        });

        if (!newConfig.custom_configs) {
            newConfig.custom_configs = {};
        }

        customInputs.forEach(input => {
            const field = input.dataset.custom;
            const parts = field.split('_');
            if (parts.length >= 3 && parts[0] === 'custom') {
                const customKey = `${parts[0]}_${parts[1]}`; // custom_1, custom_2, custom_3
                const fieldName = parts.slice(2).join('_'); // name, api_base, model_name, api_key
                
                if (['custom_1', 'custom_2', 'custom_3'].includes(customKey)) {
                    if (!newConfig.custom_configs[customKey]) {
                        newConfig.custom_configs[customKey] = {};
                    }
                    newConfig.custom_configs[customKey][fieldName] = input.value;
                }
            }
        });

        const activePlatformRadio = dialog.querySelector('input[name="active_platform"]:checked');
        if (activePlatformRadio) {
            newConfig.active_platform = activePlatformRadio.value;
        }
        
        const activeCustomRadio = dialog.querySelector('input[name="active_custom"]:checked');
        if (activeCustomRadio) {
            newConfig.active_custom = activeCustomRadio.value;
        }

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

    restoreDefaultConfig(dialog) {
        if (!confirm("确定要恢复默认配置吗？这将清空所有当前设置。")) {
            return;
        }

        const defaultConfig = this.getDefaultConfig();
        
        this.config = { ...defaultConfig };
        this.renderPlatformConfigs(this.config);
        this.renderCustomConfigs(this.config);

        alert("已恢复默认配置！请点击保存按钮保存更改。");
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
                    
                    const configButton = this.addWidget("button", "Settings·设置", null, () => {
                        const buttonElement = document.querySelector('.comfy-widget-value[value="Settings·设置"]');
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