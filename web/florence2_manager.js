import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const i18n = {
    zh: {
        modelManager: "模型管理",
        modelsManager: "Florence2 模型管理",
        downloadSource: "下载源",
        modelScope: "魔搭社区",
        huggingFace: "抱抱脸",
        useChinaMirror: "使用中国镜像站",
        loading: "加载中...",
        errorLoadingModels: "加载模型失败",
        noModelsFound: "未找到模型",
        installed: "已安装",
        notInstalled: "未安装",
        currentSelected: "当前选择",
        delete: "删除",
        download: "下载",
        confirmDelete: "确定要删除",
        deleteFailed: "删除失败",
        deleteError: "删除错误",
        downloadRequestFailed: "下载请求失败",
        startingDownload: "开始下载...",
        downloading: "正在下载",
        downloadCompleted: "下载完成！",
        error: "错误",
        configButton: "⚙️ 模型管理"
    },
    en: {
        modelManager: "Model Manager",
        modelsManager: "Florence2 Model Manager",
        downloadSource: "Download Source",
        modelScope: "ModelScope",
        huggingFace: "Hugging Face",
        useChinaMirror: "Use China Mirror",
        loading: "Loading...",
        errorLoadingModels: "Error loading models",
        noModelsFound: "No models found",
        installed: "Installed",
        notInstalled: "Not Installed",
        currentSelected: "Selected",
        delete: "Delete",
        download: "Download",
        confirmDelete: "Are you sure you want to delete",
        deleteFailed: "Delete failed",
        deleteError: "Delete error",
        downloadRequestFailed: "Download request failed",
        startingDownload: "Starting download...",
        downloading: "Downloading",
        downloadCompleted: "Download completed!",
        error: "Error",
        configButton: "⚙️ Model Manager"
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

const style = `
.zhihui-florence-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #1e1e24 0%, #2a2a35 100%);
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 12px;
    z-index: 1000;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.zhihui-florence-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 999;
    backdrop-filter: blur(2px);
}
.zhihui-florence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 2px solid #444;
    padding-bottom: 15px;
}
.zhihui-florence-header h3 {
    margin: 0;
    font-size: 1.5em;
    background: linear-gradient(90deg, #4dabf7, #74c0fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.zhihui-florence-list {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 15px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 5px;
}
.zhihui-florence-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #3a3a3a;
    transition: background 0.2s;
}
.zhihui-florence-item:hover {
    background: rgba(255,255,255,0.05);
}
.zhihui-florence-item:last-child {
    border-bottom: none;
}
.zhihui-florence-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
}
.zhihui-florence-actions button {
    padding: 6px 14px;
    cursor: pointer;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 0.9em;
    transition: all 0.2s;
    font-weight: 500;
}
.zhihui-florence-actions button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.btn-primary {
    background: linear-gradient(135deg, #228be6 0%, #15aabf 100%) !important;
}
.btn-primary:hover {
    filter: brightness(1.1);
}
.btn-danger {
    background: linear-gradient(135deg, #fa5252 0%, #e03131 100%) !important;
}
.btn-danger:hover {
    filter: brightness(1.1);
}
.btn-success {
    background: linear-gradient(135deg, #40c057 0%, #2f9e44 100%) !important;
}
.btn-success:hover {
    filter: brightness(1.1);
}
.zhihui-florence-platform-selector {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    border: 1px solid #3a3a3a;
}
.zhihui-florence-platform-selector label {
    margin-right: 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}
.zhihui-hf-group {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.zhihui-hf-options {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
#close-btn {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 1.5em;
    line-height: 1;
    padding: 0 5px;
    transition: color 0.2s;
}
#close-btn:hover {
    color: #fff;
}
`;

const styleEl = document.createElement("style");
styleEl.textContent = style;
document.head.appendChild(styleEl);

app.registerExtension({
    name: "zhihui.florence2.manager",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "Florence2Plus") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                
                this.addWidget("button", $t('configButton'), "manage_models", () => {
                    showManagerModal(this);
                });
                
                return r;
            };
        }
    }
});

async function showManagerModal(nodeInstance) {

    const existing = document.querySelector(".zhihui-florence-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "zhihui-florence-overlay";
    
    const modal = document.createElement("div");
    modal.className = "zhihui-florence-modal";
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const close = () => {
        document.body.removeChild(overlay);
        if (pollInterval) clearInterval(pollInterval);
    };
    
    const header = document.createElement("div");
    header.className = "zhihui-florence-header";
    header.innerHTML = `<h3>${$t('modelsManager')}</h3><button id="close-btn">×</button>`;
    modal.appendChild(header);
    header.querySelector("#close-btn").onclick = close;
    
    const platformDiv = document.createElement("div");
    platformDiv.className = "zhihui-florence-platform-selector";
    platformDiv.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #ffffffff;">${$t('downloadSource')}:</div>
        <label><input type="radio" name="platform" value="ModelScope" checked> ${$t('modelScope')}</label>
        <span class="zhihui-hf-group"><label><input type="radio" name="platform" value="Hugging Face"> ${$t('huggingFace')}</label><span id="hf-options" class="zhihui-hf-options"><label><input type="checkbox" id="use-mirror"> ${$t('useChinaMirror')}</label></span></span>
    `;
    modal.appendChild(platformDiv);
    
    const updatePreview = () => {
        const platform = platformDiv.querySelector('input[name="platform"]:checked').value;
        const hfOptions = platformDiv.querySelector('#hf-options');
        
        if (platform === "ModelScope") {
            hfOptions.style.display = "none";
        } else {
            hfOptions.style.display = "inline-flex";
        }
    };
    
    platformDiv.querySelectorAll('input').forEach(input => {
        input.onchange = updatePreview;
    });
    updatePreview();
    
    const content = document.createElement("div");
    content.className = "zhihui-florence-list";
    content.innerHTML = `<div style="padding:20px; text-align:center;">${$t('loading')}</div>`;
    modal.appendChild(content);
    
    const statusDiv = document.createElement("div");
    statusDiv.style.marginTop = "10px";
    statusDiv.style.padding = "10px";
    statusDiv.style.borderTop = "1px solid #444";
    statusDiv.style.fontSize = "0.9em";
    statusDiv.style.color = "#aaa";
    modal.appendChild(statusDiv);
    
    let pollInterval;

    const refresh = async () => {
        content.innerHTML = `<div style="padding:20px; text-align:center;">${$t('loading')}</div>`;
        try {
            const res = await api.fetchApi("/zhihui/florence2/models");
            const models = await res.json();
            renderList(models);
        } catch (e) {
            content.textContent = $t('errorLoadingModels') + ": " + e;
        }
    };
    
    const renderList = (models) => {
        content.innerHTML = "";
        if (models.length === 0) {
            content.textContent = $t('noModelsFound') + ".";
            return;
        }
        
        models.forEach(m => {
            const item = document.createElement("div");
            item.className = "zhihui-florence-item";
            
            const info = document.createElement("div");
            const statusColor = m.installed ? "#40c057" : "#868e96";
            
            const modelWidget = nodeInstance.widgets.find(w => w.name === "model_name");
            const isSelected = modelWidget && modelWidget.value === m.name;
            
            info.innerHTML = `
                <div style="font-size:1.1em; font-weight:bold; margin-bottom:4px;">${m.name}</div>
                <div style="font-size:0.85em; display:flex; gap:10px;">
                    <span style="color: ${statusColor}">● ${m.installed ? $t('installed') : $t('notInstalled')}</span>
                    ${isSelected ? `<span style="color: #ffd43b; font-weight:bold;">★ ${$t('currentSelected')}</span>` : ''}
                </div>
            `;
            item.appendChild(info);
            
            const actions = document.createElement("div");
            actions.className = "zhihui-florence-actions";
            
            if (m.installed) {
                const delBtn = document.createElement("button");
                delBtn.textContent = $t('delete');
                delBtn.className = "btn-danger";
                delBtn.onclick = async () => {
                    if (confirm(`${$t('confirmDelete')} ${m.name}?`)) {
                        try {
                            const res = await api.fetchApi("/zhihui/florence2/models", {
                                method: "DELETE",
                                body: JSON.stringify({ model_name: m.name })
                            });
                            if (res.ok) refresh();
                            else alert($t('deleteFailed'));
                        } catch (e) {
                            alert($t('deleteError') + ": " + e);
                        }
                    }
                };
                actions.appendChild(delBtn);
            } else {
                const downloadBtn = document.createElement("button");
                downloadBtn.textContent = $t('download');
                downloadBtn.className = "btn-primary";
                downloadBtn.onclick = async () => {
                    const platform = platformDiv.querySelector('input[name="platform"]:checked').value;
                    const useMirror = platformDiv.querySelector('#use-mirror').checked;
                    
                    try {
                        const res = await api.fetchApi("/zhihui/florence2/download", {
                            method: "POST",
                            body: JSON.stringify({
                                model_name: m.name,
                                platform: platform,
                                use_mirror: useMirror
                            })
                        });
                        const data = await res.json();
                        if (data.status === "error") {
                            alert(data.message);
                        } else {
                            startPolling();
                        }
                    } catch (e) {
                            alert($t('downloadRequestFailed') + ": " + e);
                    }
                };
                actions.appendChild(downloadBtn);
            }           
            item.appendChild(actions);
            content.appendChild(item);
        });
    };
    
    const startPolling = () => {
        if (pollInterval) clearInterval(pollInterval);
        statusDiv.textContent = $t('startingDownload');
        pollInterval = setInterval(async () => {
            try {
                const res = await api.fetchApi("/zhihui/florence2/download_status");
                const status = await res.json();
                
                if (status.status === "downloading") {
                    statusDiv.textContent = `${$t('downloading')} ${status.model_name}: ${status.message}`;
                } else if (status.status === "success") {
                    statusDiv.textContent = $t('downloadCompleted');
                    clearInterval(pollInterval);
                    refresh();
                } else if (status.status === "error") {
                    statusDiv.textContent = $t('error') + ": " + status.message;
                    clearInterval(pollInterval);
                }
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    };   
    refresh();
}