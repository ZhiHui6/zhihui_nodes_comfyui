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
                if (fileConfig.active_target) {
                    this.config.active_target = fileConfig.active_target;
                } else if (fileConfig.active_platform) {
                    this.config.active_target = fileConfig.active_platform;
                } else if (fileConfig.active_custom) {
                    this.config.active_target = fileConfig.active_custom;
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
            active_target: "SiliconFlow",
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
            max-height: 95vh;
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
            ">设置</h2>
            <div id="api-config-content">
                <div style="margin-bottom: 15px;">
                    <p style="color: var(--descrip-text); font-size: 13px; margin: 0;">
                        配置各个平台的API密钥。配置后，节点将自动使用这些密钥，无需每次手动输入。
                    </p>
                </div>
                
                <!-- 主配置区域 - 两行布局 -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- 平台服务配置（包含自定义配置） -->
                    <div style="flex: 1;">
                        <h3 style="
                            margin: 0 0 10px 0; 
                            color: var(--input-text); 
                            font-size: 14px; 
                            font-weight: bold;
                            border-bottom: 1px solid var(--border-color);
                            padding-bottom: 5px;
                        ">平台服务配置</h3>
                        <div id="platform-configs"></div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: space-between; align-items: center;">
                    <div>
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
                    </div>
                    <div>
                        <button id="exit-dialog" style="
                            background: var(--comfy-input-bg);
                            border: 1px solid var(--border-color);
                            color: var(--input-text);
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                          onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">退出</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        this.renderPlatformConfigs(config);
        this.attachActiveTargetHandlers(dialog);

        const closeDialog = () => {
            if (overlay && overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            if (dialog && dialog.parentNode) {
                document.body.removeChild(dialog);
            }
            this.isDialogOpen = false;
        };

        dialog.querySelector("#restore-default").onclick = () => {
            this.restoreDefaultConfig(dialog);
        };

        const exitBtn = dialog.querySelector("#exit-dialog");
        if (exitBtn) {
            exitBtn.onclick = () => {
                closeDialog();
            };
        }

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

        const activeTarget = config.active_target || "SiliconFlow";

        Object.entries(config.api_keys || {}).forEach(([platform, platformConfig]) => {
            const isActive = activeTarget === platform;
            
            const platformDiv = document.createElement("div");
            const condensedPlatforms = ["SiliconFlow", "ModelScope", "Aliyun"];
            const isCondensed = condensedPlatforms.includes(platform);
            platformDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                ${isCondensed ? '' : 'height: 320px;\nmin-height: 320px;'}
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
                               name="active_target" 
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
                            🙈
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
                <div class="per-card-save" style="visibility: hidden; margin-top: auto; text-align: right; display: flex; gap: 8px; justify-content: flex-end; min-height: 32px; height: 32px; align-items: center;">
                    <button type="button" class="save-card-btn" data-card="${platform}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4488ff'; this.style.borderColor='#4488ff'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">保存该平台配置</button>
                    <button type="button" class="cancel-card-btn" data-card="${platform}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">取消</button>
                </div>
            `;

            platformDiv.dataset.cardType = "platform";
            platformDiv.dataset.cardKey = platform;
            platformDiv.dataset.initialModel = selectedModel;
            platformDiv.dataset.initialApiKey = platformConfig.api_key || "";

            gridContainer.appendChild(platformDiv);
        });

        const customConfigs = config.custom_configs || {};
        ['custom_1', 'custom_2', 'custom_3'].forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const isActive = activeTarget === customKey;

            const customDiv = document.createElement("div");
            customDiv.style.cssText = `
                padding: 10px;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: var(--comfy-input-bg);
                height: 320px;
                min-height: 320px;
                display: flex;
                flex-direction: column;
            `;

            customDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: var(--input-text); font-size: 14px;">${customConfig.name || `自定义配置${customKey.slice(-1)}`}</h3>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                        <input type="radio" 
                               name="active_target" 
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
                
                <div style="margin-bottom: 8px; position: relative;">
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
                                class="password-toggle-btn" 
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
                            🙈
                        </button>
                    </div>
                </div>
                <div class="per-card-save" style="visibility: hidden; margin-top: auto; text-align: right; display: flex; gap: 8px; justify-content: flex-end; min-height: 32px; height: 32px; align-items: center;">
                    <button type="button" class="save-card-btn" data-card="${customKey}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4488ff'; this.style.borderColor='#4488ff'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">保存该平台配置</button>
                    <button type="button" class="cancel-card-btn" data-card="${customKey}" style="
                        background: var(--comfy-input-bg);
                        border: 1px solid var(--border-color);
                        color: var(--input-text);
                        padding: 6px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#ff4444'; this.style.borderColor='#ff4444'; this.style.color='white';" 
                      onmouseout="this.style.background='var(--comfy-input-bg)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--input-text)';">取消</button>
                </div>
            `;

            customDiv.dataset.cardType = "custom";
            customDiv.dataset.cardKey = customKey;
            customDiv.dataset.initialName = customConfig.name || `自定义配置${customKey.slice(-1)}`;
            customDiv.dataset.initialApiBase = customConfig.api_base || "";
            customDiv.dataset.initialModelName = customConfig.model_name || "";
            customDiv.dataset.initialApiKey = customConfig.api_key || "";

            gridContainer.appendChild(customDiv);
        });

        container.appendChild(gridContainer);
        container.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const customKey = btn.dataset.custom;
                let input = null;
                if (platform) {
                    input = container.querySelector(`input[data-platform="${platform}"]`);
                } else if (customKey) {
                    input = container.querySelector(`input[data-custom="${customKey}_api_key"]`);
                }
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '👁️';
                } else {
                    input.type = 'password';
                    btn.textContent = '🙈';
                }
            });
        });

        container.querySelectorAll('input[name="active_target"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_target"]').forEach(r => {
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

        container.querySelectorAll('[data-card-type="platform"]').forEach(card => {
            const key = card.dataset.cardKey;
            const selectEl = card.querySelector(`select[data-platform-model="${key}"]`);
            const keyInput = card.querySelector(`input[data-platform="${key}"]`);
            const saveContainer = card.querySelector('.per-card-save');
            const btn = card.querySelector('.save-card-btn');
            const cancelBtn = card.querySelector('.cancel-card-btn');

            const toggleVisibility = () => {
                const isDirty = (
                    (selectEl && selectEl.value !== card.dataset.initialModel) ||
                    (keyInput && keyInput.value !== card.dataset.initialApiKey)
                );
                saveContainer.style.visibility = isDirty ? 'visible' : 'hidden';
            };

            if (selectEl) selectEl.addEventListener('change', toggleVisibility);
            if (keyInput) keyInput.addEventListener('input', toggleVisibility);

            if (btn) btn.addEventListener('click', async () => {
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = '保存中...';
                const ok = await this.saveSingleCardConfig(card);
                btn.disabled = false;
                btn.textContent = originalText;
                if (ok) {
                    saveContainer.style.visibility = 'hidden';
                    if (selectEl) card.dataset.initialModel = selectEl.value;
                    if (keyInput) card.dataset.initialApiKey = keyInput.value;
                } else {
                    alert('保存失败，请重试');
                }
            });

            if (cancelBtn) cancelBtn.addEventListener('click', () => {
                if (selectEl && card.dataset.initialModel !== undefined) {
                    selectEl.value = card.dataset.initialModel;
                }
                if (keyInput && card.dataset.initialApiKey !== undefined) {
                    keyInput.value = card.dataset.initialApiKey;
                }
                saveContainer.style.visibility = 'hidden';
            });
        });

        container.querySelectorAll('[data-card-type="custom"]').forEach(card => {
            const key = card.dataset.cardKey;
            const nameInput = card.querySelector(`input[data-custom="${key}_name"]`);
            const apiBase = card.querySelector(`input[data-custom="${key}_api_base"]`);
            const modelName = card.querySelector(`input[data-custom="${key}_model_name"]`);
            const apiKey = card.querySelector(`input[data-custom="${key}_api_key"]`);
            const saveContainer = card.querySelector('.per-card-save');
            const btn = card.querySelector('.save-card-btn');
            const cancelBtn = card.querySelector('.cancel-card-btn');

            const toggleVisibility = () => {
                const isDirty = (
                    (nameInput && nameInput.value !== card.dataset.initialName) ||
                    (apiBase && apiBase.value !== card.dataset.initialApiBase) ||
                    (modelName && modelName.value !== card.dataset.initialModelName) ||
                    (apiKey && apiKey.value !== card.dataset.initialApiKey)
                );
                saveContainer.style.visibility = isDirty ? 'visible' : 'hidden';
            };

            [nameInput, apiBase, modelName, apiKey].forEach(el => el && el.addEventListener('input', toggleVisibility));

            if (btn) btn.addEventListener('click', async () => {
                btn.disabled = true;
                const originalText = btn.textContent;
                btn.textContent = '保存中...';
                const ok = await this.saveSingleCardConfig(card);
                btn.disabled = false;
                btn.textContent = originalText;
                if (ok) {
                    saveContainer.style.visibility = 'hidden';
                    if (nameInput) card.dataset.initialName = nameInput.value;
                    if (apiBase) card.dataset.initialApiBase = apiBase.value;
                    if (modelName) card.dataset.initialModelName = modelName.value;
                    if (apiKey) card.dataset.initialApiKey = apiKey.value;
                } else {
                    alert('保存失败，请重试');
                }
            });

            if (cancelBtn) cancelBtn.addEventListener('click', () => {
                if (nameInput && card.dataset.initialName !== undefined) {
                    nameInput.value = card.dataset.initialName;
                }
                if (apiBase && card.dataset.initialApiBase !== undefined) {
                    apiBase.value = card.dataset.initialApiBase;
                }
                if (modelName && card.dataset.initialModelName !== undefined) {
                    modelName.value = card.dataset.initialModelName;
                }
                if (apiKey && card.dataset.initialApiKey !== undefined) {
                    apiKey.value = card.dataset.initialApiKey;
                }
                saveContainer.style.visibility = 'hidden';
            });
        });

        gridContainer.addEventListener('focusin', (e) => {
            const interactiveEl = e.target.closest('input, select, button');
            if (!interactiveEl) return;
            const card = interactiveEl.closest('[data-card-type]');
            if (!card) return;
            gridContainer.querySelectorAll('[data-card-type]').forEach(c => {
                c.style.borderColor = 'var(--border-color)';
                c.style.boxShadow = 'none';
            });
            card.style.borderColor = '#4488ff';
            card.style.boxShadow = '0 0 0 2px rgba(68,136,255,0.2)';
        });
        gridContainer.addEventListener('mousedown', (e) => {
            const interactiveEl = e.target.closest('input, select, button');
            if (!interactiveEl) return;
            const card = interactiveEl.closest('[data-card-type]');
            if (!card) return;
            gridContainer.querySelectorAll('[data-card-type]').forEach(c => {
                c.style.borderColor = 'var(--border-color)';
                c.style.boxShadow = 'none';
            });
            card.style.borderColor = '#4488ff';
            card.style.boxShadow = '0 0 0 2px rgba(68,136,255,0.2)';
        });
    }

    renderCustomConfigs(config) {
        const container = document.querySelector("#custom-configs");
        container.innerHTML = "";

        const customConfigs = config.custom_configs || {};
        const activeTarget = config.active_target || "custom_1";

        const gridContainer = document.createElement("div");
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        `;

        ['custom_1', 'custom_2', 'custom_3'].forEach(customKey => {
            const customConfig = customConfigs[customKey] || {};
            const isActive = activeTarget === customKey;

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
                               name="active_target" 
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
                            🙈
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
                    btn.textContent = '👁️';
                } else {
                    input.type = 'password';
                    btn.textContent = '🙈';
                }
            });
        });

        container.querySelectorAll('input[name="active_target"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="active_target"]').forEach(r => {
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

    attachActiveTargetHandlers(root) {
        const rootEl = root || document;
        const self = this;
        const radios = rootEl.querySelectorAll('input[name="active_target"]');
        const updateAll = () => {
            const allRadios = rootEl.querySelectorAll('input[name="active_target"]');
            allRadios.forEach(r => {
                const span = r.nextElementSibling;
                if (span) {
                    span.style.color = r.checked ? '#22c55e' : 'var(--input-text)';
                    span.style.fontWeight = r.checked ? 'bold' : 'normal';
                }
            });
        };
        radios.forEach(radio => {
            radio.addEventListener('change', async () => {
                updateAll();
                const newTarget = radio.value;
                if (newTarget && self.config) {
                    const newConfig = { ...self.config, active_target: newTarget };
                    const ok = await self.saveConfig(newConfig);
                    if (ok) {
                        self.config.active_target = newTarget;
                        console.log(`active_target 已更新为 ${newTarget}`);
                    } else {
                        console.warn('激活更新失败，请稍后重试。');
                    }
                }
            });
        });
        updateAll();
    }

    async saveSingleCardConfig(cardElement) {
        const type = cardElement?.dataset?.cardType;
        const key = cardElement?.dataset?.cardKey;
        const currentConfig = this.config || (await this.loadConfig());
        const updatedConfig = JSON.parse(JSON.stringify(currentConfig));
        let ok = false;
        try {
            if (type === "platform") {
                const selectEl = cardElement.querySelector(`select[data-platform-model="${key}"]`);
                const apiInput = cardElement.querySelector(`input[data-platform="${key}"]`);
                if (!updatedConfig.api_keys[key]) updatedConfig.api_keys[key] = {};
                if (selectEl) updatedConfig.api_keys[key].selected_model = selectEl.value;
                if (apiInput) updatedConfig.api_keys[key].api_key = apiInput.value;
            } else if (type === "custom") {
                const nameInput = cardElement.querySelector(`input[data-custom="${key}_name"]`);
                const apiBase = cardElement.querySelector(`input[data-custom="${key}_api_base"]`);
                const modelName = cardElement.querySelector(`input[data-custom="${key}_model_name"]`);
                const apiKey = cardElement.querySelector(`input[data-custom="${key}_api_key"]`);
                if (!updatedConfig.custom_configs) updatedConfig.custom_configs = {};
                if (!updatedConfig.custom_configs[key]) updatedConfig.custom_configs[key] = {};
                if (nameInput) updatedConfig.custom_configs[key].name = nameInput.value;
                if (apiBase) updatedConfig.custom_configs[key].api_base = apiBase.value;
                if (modelName) updatedConfig.custom_configs[key].model_name = modelName.value;
                if (apiKey) updatedConfig.custom_configs[key].api_key = apiKey.value;
            }
            ok = await this.saveConfig(updatedConfig);
            if (ok) {
                this.config = updatedConfig;
            }
        } catch (err) {
            console.error("保存单平台配置失败:", err);
            ok = false;
        }
        return ok;
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
                const customKey = `${parts[0]}_${parts[1]}`;
                const fieldName = parts.slice(2).join('_');
                
                if (['custom_1', 'custom_2', 'custom_3'].includes(customKey)) {
                    if (!newConfig.custom_configs[customKey]) {
                        newConfig.custom_configs[customKey] = {};
                    }
                    newConfig.custom_configs[customKey][fieldName] = input.value;
                }
            }
        });

        const activeTargetRadio = dialog.querySelector('input[name="active_target"]:checked');
        if (activeTargetRadio) {
            newConfig.active_target = activeTargetRadio.value;
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

        alert("已恢复默认配置！如需提交更改，请在各平台卡片底部点击保存。");
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