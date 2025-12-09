import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const Utils = {
    async apiCall(url, options = {}) {
        try {
            const resp = await api.fetchApi(url, options);
            if (resp.ok) {
                let data = null;
                try { data = await resp.json(); } catch { data = null; }
                return { ok: true, data, error: null };
            } else {
                let bodyText = "";
                let bodyJson = null;
                try { bodyJson = await resp.json(); } catch { bodyJson = null; }
                if (bodyJson && typeof bodyJson === "object") {
                    bodyText = bodyJson.error || bodyJson.message || JSON.stringify(bodyJson);
                } else {
                    try { bodyText = await resp.text(); } catch { bodyText = ""; }
                }
                const code = resp.status || "";
                const reason = resp.statusText || "";
                const composed = [code, reason, bodyText].filter(Boolean).join(" • ");
                return { ok: false, data: null, error: composed };
            }
        } catch (error) {
            return { ok: false, data: null, error: String(error && error.message || error) };
        }
    }
};

const StyleManager = {
    getStyles() {
        return {
            base: "width:600px;height:435px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);padding:0;color:#f8fafc;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
            overlay: "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:10001;display:flex;align-items:center;justify-content:center;",
            input: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; height:32px; width:66.67%;",
            button: "border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s ease;",
            buttonPrimary: "background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; box-shadow:0 2px 6px rgba(59, 130, 246, 0.3);",
            buttonSuccess: "background:linear-gradient(135deg, #10b981 0%, #059669 100%); color=white; box-shadow:0 2px 6px rgba(16, 185, 129, 0.3);",
            buttonDanger: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(220, 38, 38, 0.3);",
            buttonClear: "background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 2px 8px rgba(220, 38, 38, 0.3);",
            select: "background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:14px; transition:all .2s ease; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px; height:32px; width:66.67%;",
            checkbox: "width:16px; height:16px; accent-color:#3b82f6;",
            label: "font-size:13px; font-weight:600; color:#f8fafc; margin-bottom:6px;"
        };
    },
    getUniqueStyles(uniqueId) {
        const styles = this.getStyles();
        return `
            <style>
                #${uniqueId} { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; 
                    -webkit-font-smoothing: antialiased; 
                    -moz-osx-font-smoothing: grayscale; 
                }
                
                #${uniqueId} .ui-header { 
                    display:flex; 
                    align-items:center; 
                    justify-content:space-between; 
                    padding:6px 12px; 
                    background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
                    border-bottom:1px solid #1e293b; 
                    border-radius: 12px 12px 0 0;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .ui-title { 
                    font-size:18px; 
                    font-weight:700; 
                    color:#f0f0f0;
                    letter-spacing:0.3px;
                    margin:0;
                }
                
                #${uniqueId} .close-button { 
                    width:26px; 
                    height:26px; 
                    border-radius:6px; 
                    border:1px solid rgba(220, 38, 38, 0.5); 
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    cursor:pointer; 
                    display:inline-flex; 
                    align-items:center; 
                    justify-content:center; 
                    transition:all .2s ease; 
                    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
                }
                
                #${uniqueId} .close-button::before { 
                    content:"×"; 
                    color:#ffffff; 
                    font-size:18px; 
                    line-height:1; 
                    font-weight: 300;
                }
                
                #${uniqueId} .close-button:hover { 
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-color:#ef4444; 
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
                }
                
                #${uniqueId} .close-button:active {
                    transform: scale(0.95);
                }
                
                #${uniqueId} .ui-content {
                    display:flex; 
                    flex-direction:column; 
                    height: 395px;
                    min-height: 395px;
                    max-height: 395px;
                    overflow: hidden;
                }
                
                /* 顶部标签页样式 */
                #${uniqueId} .platform-tabs { 
                    display:flex;
                    background: #0f172a;
                    border-bottom: 1px solid #1a2332;
                    padding: 6px 16px;
                    overflow-x: auto;
                    flex-shrink: 0;
                    height: auto;
                    min-height: auto;
                    gap: 4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar {
                    height: 4px;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                #${uniqueId} .platform-tabs::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 2px;
                }
                
                #${uniqueId} .tab-item { 
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: #94a3b8;
                    border: 1px solid #334155;
                    border-radius: 5px;
                    background: transparent;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .tab-item:hover { 
                    color: #e2e8f0;
                    border-color: #ffffff;
                    background: rgba(59, 130, 246, 0.08);
                }
                
                #${uniqueId} .tab-item.active { 
                    color: #3b82f6;
                    border-color: #3b82f6;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%);
                    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(59, 130, 246, 0.1);
                }
                
                #${uniqueId} .tab-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #0f172a;
                    min-height: 0;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar {
                    width: 6px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 3px;
                }
                
                #${uniqueId} .tab-content::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
                
                #${uniqueId} .platform-config { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 8; 
                    min-height: 294px;
                    height: 100%;
                }
                
                #${uniqueId} .config-header { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding-bottom: 6px;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .config-title { 
                    font-size: 16px; 
                    font-weight: 700; 
                    color: #f8fafc; 
                    letter-spacing: 0.3px; 
                    margin: 0;
                }
                
                #${uniqueId} .config-form { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 10px; 
                    flex: 1;
                    min-height: 0;
                }
                
                #${uniqueId} .form-group { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 6px; 
                }
                
                #${uniqueId} .form-group-inline { 
                    display: flex; 
                    flex-direction: row; 
                    align-items: center; 
                    gap: 6px; 
                    margin-bottom: 4px;
                }
                
                #${uniqueId} .form-group-inline label { 
                    ${styles.label}
                    margin-bottom: 0;
                    min-width: 120px;
                    text-align: right;
                    flex-shrink: 0;
                }
                
                #${uniqueId} .form-group-inline input { 
                    ${styles.input}
                    flex: 1;
                    margin-bottom: 0;
                    max-width: 450px;
                }
                
                #${uniqueId} .form-group label { 
                    ${styles.label}
                }
                
                #${uniqueId} .form-group input { 
                    ${styles.input}
                }
                
                #${uniqueId} .form-group select { 
                    ${styles.select}
                }
                
                #${uniqueId} .zhipu-custom-instruction {
                    margin-bottom: 6px;
                }
                
                #${uniqueId} .form-row { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 20px; 
                }
                
                #${uniqueId} .form-actions { 
                    display: flex; 
                    gap: 8px; 
                    margin-top: 2px;
                    padding: 6px 0 0 0; 
                    flex-shrink: 0;
                    justify-content: flex-end;
                    align-items: center;
                    min-height: 28px;
                }
                
                #${uniqueId} .btn-save { 
                    ${styles.button} ${styles.buttonSuccess}
                }
                
                #${uniqueId} .platform-info { 
                    padding: 8px; 
                    background: rgba(30, 41, 59, 0.5); 
                    border-radius: 6px; 
                    border-left: 3px solid #3b82f6; 
                    margin-bottom: 12px; 
                    flex-shrink: 0;
                }
                
                #${uniqueId} .platform-info h4 { 
                    margin: 0 0 8px 0; 
                    color: #3b82f6; 
                    font-size: 16px; 
                    font-weight: 700;
                    letter-spacing: 0.2px;
                }
                
                #${uniqueId} .platform-info p { 
                    margin: 4px 0; 
                    color: #cbd5e1; 
                    font-size: 13px; 
                    line-height: 1.5;
                }
                
                #${uniqueId} .platform-info p a {
                    color: #60a5fa;
                    text-decoration: none;
                    transition: color .2s ease;
                    font-weight: 600;
                }
                
                #${uniqueId} .platform-info p a:hover {
                    color: #93c5fd;
                    text-decoration: underline;
                }
                
                #${uniqueId} .loading { 
                    display: inline-block; 
                    width: 16px; 
                    height: 16px; 
                    border: 2px solid #f8fafc; 
                    border-top: 2px solid #3b82f6; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite; 
                    margin-right: 8px;
                }
                
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                
                /* 响应式设计 */
                @media (max-width: 768px) {
                    #${uniqueId} .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    
                    #${uniqueId} .ui-header {
                        padding: 20px 24px;
                    }
                    
                    #${uniqueId} .tab-content {
                        padding: 24px;
                    }
                    
                    #${uniqueId} .form-actions {
                        flex-direction: column;
                        gap: 4px;
                        padding: 8px 0 0 0;
                        align-items: flex-end;
                        justify-content: center;
                        min-height: 32px;
                    }
                    
                    #${uniqueId} .btn-save {
                        width: auto;
                        padding: 6px 12px;
                        font-size: 12px;
                    }
                    
                    #${uniqueId} .ui-content {
                        height: 360px;
                        min-height: 360px;
                        max-height: 360px;
                    }
                }
            </style>
        `;
    }
};

function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "comfy-modal-overlay";
    overlay.style.cssText = StyleManager.getStyles().overlay;
    return overlay;
}

function createDialog() {
    const dialog = document.createElement("div");
    dialog.className = "comfy-modal";
    dialog.style.cssText = StyleManager.getStyles().base;
    return dialog;
}

async function loadConfig() {
    const result = await Utils.apiCall("/zhihui_nodes/translate/config", { method: "GET" });
    return result.ok && result.data ? result.data : null;
}

async function saveConfig(config) {
    const result = await Utils.apiCall("/zhihui_nodes/translate/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
    });
    return result.ok;
}

async function clearConfig() {
    const result = await Utils.apiCall("/zhihui_nodes/translate/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return result.ok;
}



function getPlatformFields(platform) {
    const fields = {
        baidu: [
            { name: "app_id", label: "APP ID", type: "text", required: true },
            { name: "api_key", label: "API Key", type: "text", required: true }
        ],
        aliyun: [
            { name: "access_key_id", label: "Access Key ID", type: "text", required: true },
            { name: "access_key_secret", label: "Access Key Secret", type: "text", required: true }
        ],
        youdao: [
            { name: "app_key", label: "App Key", type: "text", required: true },
            { name: "app_secret", label: "App Secret", type: "text", required: true }
        ],
        zhipu: [
            { name: "api_key", label: "API Key", type: "text", required: true },
            { name: "model", label: "模型", type: "select", options: ["glm-4-flash", "glm-4.5-flash", "glm-4.6v-flash"], default: "glm-4-flash" }
        ],
        free: [
            { name: "platform", label: "翻译平台", type: "select", options: ["腾讯翻译君", "Pollinations AI"], default: "腾讯翻译君" }
        ]
    };
    return fields[platform] || [];
}

function getPlatformInfo(platform) {
    const info = {
        baidu: {
            name: "百度翻译",
            description: "百度翻译API，支持多种语言互译，需要注册百度翻译开放平台获取API密钥。免费额度：标准版5万字符/月，高级版100万字符/月（需个人认证）",
            website: "https://api.fanyi.baidu.com/"
        },
        aliyun: {
            name: "阿里云翻译",
            description: "阿里云翻译API，企业级翻译服务，支持多种语言和领域。免费额度：100万字符/月。",
            website: "https://www.aliyun.com/product/ai/alimt"
        },
        youdao: {
            name: "有道翻译",
            description: "有道翻译API，基于神经网络翻译技术，提供高质量翻译。免费额度：赠送50元的体验金。",
            website: "https://ai.youdao.com/"
        },
        zhipu: {
            name: "智谱AI翻译",
            description: "智谱AI翻译API，基于大语言模型技术，提供高质量翻译服务，需要智谱AI开放平台API密钥。免费额度：新用户默认获得每月一定数量的免费额度。",
            website: "https://open.bigmodel.cn/"
        },
        free: {
            name: "免费翻译",
            description: "完全免费使用翻译服务，无需API密钥，可在腾讯翻译君和Pollinations AI之间切换。",
            website: ""
        }
    };
    return info[platform] || {};
}

async function openSettings(node) {
    const config = await loadConfig();
    if (!config) {
        alert("无法加载配置文件");
        return;
    }

    overlay = createOverlay();
    dialog = createDialog();
    const uniqueId = `translate-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    let currentPlatform = config.default_platform || "baidu";
    let currentConfig = { ...config };

    function renderPlatformTabs() {
        const platforms = Object.keys(currentConfig.platforms);
        const platformNames = {
            baidu: "百度翻译",
            aliyun: "阿里云翻译",
            youdao: "有道翻译",
            zhipu: "智谱AI翻译",
            free: "免费翻译"
        };
        
        return `
            <div class="platform-tabs">
                ${platforms.map(platform => {
                    const displayName = currentConfig.platforms[platform].name || platformNames[platform] || platform;
                    return `
                        <div class="tab-item ${platform === currentPlatform ? 'active' : ''}" data-platform="${platform}">
                            ${displayName}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderPlatformConfig() {
        const platformData = currentConfig.platforms[currentPlatform];
        const fields = getPlatformFields(currentPlatform);
        const info = getPlatformInfo(currentPlatform);
        
        let fieldsHtml = "";
        if (fields.length > 0) {
            fieldsHtml = `
                <div class="config-form">
                    ${fields.map(field => {
                        const value = platformData.config[field.name] || field.default || "";
                        const isSensitiveField = field.name.toLowerCase().includes('key') || 
                                               field.name.toLowerCase().includes('secret') ||
                                               field.name.toLowerCase().includes('password') ||
                                               field.name.toLowerCase().includes('app_id') ||
                                               field.name.toLowerCase().includes('appid') ||
                                               field.name.toLowerCase().includes('app_key') ||
                                               field.name.toLowerCase().includes('app_secret') ||
                                               field.name.toLowerCase().includes('access_key');
                        
                        const useInlineLayout = isSensitiveField && (field.type === "text" || field.type === "password");
                        const useInlineSelect = field.type === "select" && (
                    field.name === "region" || 
                    field.name === "model" ||
                    field.name === "platform"
                );
                        
                        if (field.type === "select" && useInlineSelect) {
                            return `
                                <div class="form-group-inline">
                                    <label style="text-align: right; min-width: 120px; flex-shrink: 0;">${field.label}:</label>
                                    <select id="field-${field.name}" class="select-input" data-field="${field.name}" 
                                            style="width: 33.33%; max-width: 225px; background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:4px; padding:8px 12px; font-size:14px; transition:all .2s ease; height:36px;">
                                        ${field.options.map(opt => `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt}</option>`).join("")}
                                    </select>
                                </div>
                            `;
                        } else if (field.type === "textarea") {
                            return `
                                <div class="form-group" id="field-group-${field.name}">
                                    <label>${field.label}${field.required ? " *" : ""}:</label>
                                    <textarea id="field-${field.name}" 
                                              placeholder="${field.placeholder || '请输入' + field.label}" 
                                              rows="8" 
                                              style="width: 100%; resize: none;">${value}</textarea>
                                </div>
                            `;
                        } else if (useInlineLayout) {
                            return `
                                <div class="form-group-inline">
                                    <label style="text-align: right; min-width: 120px; flex-shrink: 0;">${field.label}${field.required ? " *" : ""}:</label>
                                    <div style="position: relative; display: flex; align-items: center; flex: 1; max-width: 450px;">
                                        <input type="password" id="field-${field.name}" value="${value}" placeholder="请输入${field.label}" 
                                               style="width: 100%; padding-right: 35px; background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:6px; padding:8px 12px; font-size:14px; transition:all .2s ease; height:36px;">
                                        <button type="button" 
                                                class="password-toggle-btn" 
                                                data-field="${field.name}"
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
                        } else {
                            return `
                                <div class="form-group">
                                    <label>${field.label}${field.required ? " *" : ""}:</label>
                                    <input type="${field.type}" id="field-${field.name}" value="${value}" placeholder="请输入${field.label}">
                                </div>
                            `;
                        }
                    }).join("")}
                </div>
            `;
        }

        return `
            <div class="platform-config">
                <div class="config-header">
                    <h2 class="config-title">${info.name} 配置</h2>
                </div>
                
                ${info.description ? `
                    <div class="platform-info">
                        <h4>平台信息</h4>
                        <p>${info.description}</p>
                        ${info.website ? `<p><strong>官网:</strong> <a href="${info.website}" target="_blank">${info.website}</a></p>` : ""}
                    </div>
                ` : ""}

                ${fieldsHtml}

                <div class="form-actions">
                    <button id="btn-clear" class="btn-clear" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); margin-right: 8px;">清除所有配置</button>
                    <button id="btn-save" class="btn-save">保存配置</button>
                </div>
            </div>
        `;
    }

    function render() {
        dialog.innerHTML = `
            ${StyleManager.getUniqueStyles(uniqueId)}
            <div id="${uniqueId}">
                <div class="ui-header">
                    <h1 class="ui-title">⚙️ 翻译平台配置管理</h1>
                    <button id="close-button" class="close-button" type="button"></button>
                </div>
                <div class="ui-content">
                    ${renderPlatformTabs()}
                    <div class="tab-content">
                        ${renderPlatformConfig()}
                    </div>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        dialog.querySelectorAll(".tab-item").forEach(item => {
            item.addEventListener("click", (e) => {
                const platform = e.currentTarget.dataset.platform;
                if (platform !== currentPlatform) {
                    currentPlatform = platform;
                    render();
                    attachEvents();
                }
            });
        });

        // 翻译指令功能已移除，只允许使用默认专业指令

        dialog.querySelector("#close-button").addEventListener("click", closeDialog);

        dialog.querySelectorAll(".password-toggle-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const fieldName = this.dataset.field;
                const input = dialog.querySelector(`#field-${fieldName}`);
                if (input) {
                    if (input.type === "password") {
                        input.type = "text";
                        this.textContent = "👁️";
                        this.title = "隐藏密码";
                    } else {
                        input.type = "password";
                        this.textContent = "🙈";
                        this.title = "显示密码";
                    }
                }
            });
        });

        dialog.querySelector("#btn-save").addEventListener("click", async () => {
            const fields = getPlatformFields(currentPlatform);
            const platformData = currentConfig.platforms[currentPlatform];
            
            fields.forEach(field => {
                const element = dialog.querySelector(`#field-${field.name}`);
                if (element) {
                    platformData.config[field.name] = element.value;
                }
            });

            const success = await saveConfig(currentConfig);
            // 获取当前平台的显示名称
            const platformNames = {
                baidu: "百度翻译",
                tencent: "腾讯翻译",
                aliyun: "阿里云翻译",
                youdao: "有道翻译",
                zhipu: "智谱AI翻译",
                free: "免费翻译"
            };
            const platformDisplayName = platformNames[currentPlatform] || currentPlatform;
            
            if (success) {
                showPopupNotification(`✅ ${platformDisplayName}配置保存成功！`, "success");
            } else {
                showPopupNotification(`❌ ${platformDisplayName}配置保存失败，请重试。`, "error");
            }
        });

        dialog.querySelector("#btn-clear").addEventListener("click", async () => {
            // 显示确认对话框
            if (!confirm("确定要清除所有配置信息吗？此操作不可恢复！")) {
                return;
            }

            const success = await clearConfig();
            
            if (success) {
                // 清空所有输入框
                dialog.querySelectorAll("input, select, textarea").forEach(element => {
                    if (element.type === "select-one") {
                        element.selectedIndex = 0;
                    } else {
                        element.value = "";
                    }
                });
                
                // 重新加载配置
                const config = await loadConfig();
                if (config) {
                    currentConfig = config;
                }
                
                showPopupNotification("✅ 所有配置信息已清除！", "success");
            } else {
                showPopupNotification("❌ 配置清除失败，请重试。", "error");
            }
        });
    }

    function showPopupNotification(message, type) {
        const existingNotification = document.getElementById('translate-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'translate-notification';     
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--comfy-menu-bg);
            border: 2px solid ${type === 'success' ? '#4CAF50' : '#F44336'};
            border-radius: 8px;
            padding: 20px 30px;
            color: var(--input-text);
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.3s ease;
            text-align: center;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function closeDialog() {
        enableMainUIInteraction();
        cleanupModal();
        document.body.removeChild(overlay);
        dialog = null;
        overlay = null;
    }

    render();
    attachEvents();
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    disableMainUIInteraction();
}

app.registerExtension({
    name: "zhihui_nodes.MultiPlatformTranslate",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "MultiPlatformTranslate") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const configButton = this.addWidget("button", "⚙️配置管理·Configuration Management", null, () => {
                    openSettings(this);
                });
                
                return r;
            };
        }
    }
});

let dialog = null;
let overlay = null;
let keyboardBlockHandler = null;
let uniqueId = 'zhihui-translate-settings-' + Math.random().toString(36).substr(2, 9);

function disableMainUIInteraction() {
    let modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'translate-settings-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
            pointer-events: all;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            transition: opacity 0.2s ease-in-out;
        `;
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.style.opacity = '0';
    modalOverlay.style.display = 'block';
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
    }, 10);
    
    const interactiveElements = document.querySelectorAll(
        'button:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), input:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), select:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), textarea:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), a[href]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), [onclick]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore]), [contenteditable="true"]:not([id*="' + uniqueId + '"]):not([data-translate-settings-ignore])'
    );
    
    interactiveElements.forEach(element => {
        if (!dialog || !dialog.contains(element)) {
            element.dataset.originalTabIndex = element.tabIndex;
            element.dataset.originalPointerEvents = element.style.pointerEvents;
            element.dataset.originalUserSelect = element.style.userSelect;
            
            element.tabIndex = -1;
            element.style.pointerEvents = 'none';
            element.style.userSelect = 'none';
            
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.dataset.originalDisabled = element.disabled;
                element.disabled = true;
            }
            
            element.dataset.translateSettingsDisabled = 'true';
        }
    });
    
    if (!keyboardBlockHandler) {
        keyboardBlockHandler = function(e) {
            const target = e.target;
            const isTextInput = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            );
            
            if (isTextInput && (e.ctrlKey || e.metaKey)) {
                const allowedKeys = ['c', 'v', 'x', 'a', 'z'];
                if (allowedKeys.includes(e.key.toLowerCase())) {
                    return true;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                const blockedKeys = ['s', 'o', 'n', 'r', 'y'];
                if (blockedKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            if (e.key === 'F5') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', keyboardBlockHandler, true);
    }
}

function enableMainUIInteraction() {
    const modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 200);
    }
    
    const interactiveElements = document.querySelectorAll('[data-translate-settings-disabled="true"]');
    
    interactiveElements.forEach(element => {
        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
            delete element.dataset.originalTabIndex;
        }
        
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
            delete element.dataset.originalPointerEvents;
        }
        
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
            delete element.dataset.originalUserSelect;
        }
        
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
            delete element.dataset.originalDisabled;
        }
        
        delete element.dataset.translateSettingsDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

function cleanupModal() {
    const modalOverlay = document.getElementById('translate-settings-modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
    
    const disabledElements = document.querySelectorAll('[data-translate-settings-disabled="true"]');
    disabledElements.forEach(element => {
        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
        }
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
        }
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
        }
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
        }
        
        delete element.dataset.originalTabIndex;
        delete element.dataset.originalPointerEvents;
        delete element.dataset.originalUserSelect;
        delete element.dataset.originalDisabled;
        delete element.dataset.translateSettingsDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

window.addEventListener('beforeunload', cleanupModal);
window.addEventListener('pagehide', cleanupModal);