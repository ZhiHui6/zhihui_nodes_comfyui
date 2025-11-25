import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const Utils = {
    formatSpeed(bps) {
        if (!bps || bps <= 0) return "0 MB/s";
        const mbps = bps / (1024 * 1024);
        if (mbps < 1) return `${(bps / 1024).toFixed(1)} KB/s`;
        return `${mbps.toFixed(2)} MB/s`;
    },
    
    humanSize(bytes) {
        const b = Number(bytes || 0);
        if (b <= 0) return "0 B";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let i = 0, v = b;
        while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
        }
        return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
    },
    
    async apiCall(url, options = {}) {
        try {
            const resp = await api.fetchApi(url, options);
            return { ok: resp.ok, data: resp.ok ? await resp.json() : null, error: resp.ok ? null : resp.status };
        } catch (error) {
            return { ok: false, data: null, error: error.message };
        }
    }
};

const StyleManager = {
    getStyles() {
        return {
            base: "max-width:680px;width:92%;background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:14px 16px;color:#e8e8e8;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
            overlay: "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;",
            input: "background:linear-gradient(145deg,#2a2a3e,#1e1e32); color:#e8e8e8; border:1px solid #4a5568; border-radius:6px; padding:10px 14px; font-size:14px; transition:all .3s ease; height:38px;",
            button: "border:none; border-radius:6px; padding:10px 14px; font-size:14px; cursor:pointer; transition:all .3s ease;",
            buttonPrimary: "background:linear-gradient(145deg,#667eea,#764ba2); color:white;",
            buttonSuccess: "background:linear-gradient(145deg,#22c55e,#16a34a); color:white;",
            buttonDanger: "background: #dc2626; color: #fff; border:none; border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;",
            progressBar: "width:100%; height:12px; background:#1e1e32; border:1px solid #4a5568; border-radius:6px; overflow:hidden;",
            progressFill: "height:100%; width:0%; background:linear-gradient(90deg, #22c55e, #16a34a); transition:width .2s ease;"
        };
    },
    
    getUniqueStyles(uniqueId) {
        const styles = this.getStyles();
        return `
            <style>
                #${uniqueId} .ui-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.1); }
                #${uniqueId} .ui-title { font-size:14px; font-weight:600; color:#f0f0f0; }
                #${uniqueId} .circle-close { width:28px; height:28px; border-radius:50%; border:1px solid rgba(255,255,255,0.25); background:#1f2937; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background .2s ease, border-color .2s ease, box-shadow .2s ease; }
                #${uniqueId} .circle-close::before { content:"×"; color:#e8e8e8; font-size:16px; line-height:1; }
                #${uniqueId} .circle-close:hover { background:#b91c1c; border-color:#ef4444; box-shadow:0 0 0 2px rgba(239,68,68,0.25); }
                #${uniqueId} .ui-controls { display:flex; flex-direction:column; gap:10px; }
                #${uniqueId} .input-group { display:flex; flex-direction:column; gap:6px; max-width:650px; width:100%; }
                #${uniqueId} .inline-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
                #${uniqueId} .inline-controls label { flex: 0 0 auto; }
                #${uniqueId} .inline-controls label span { white-space: nowrap; flex-shrink: 0; font-weight: 600; }
                #${uniqueId} .input-group > span { font-weight: 600; }
                #${uniqueId} .inline-controls .select-wrapper { flex: 0 1 auto; min-width: 180px; }
                #${uniqueId} .inline-controls .model-name { margin-left: 16px; flex: 0 1 auto; min-width: 260px; }
                #${uniqueId} .inline-controls .download-button { margin-left: 8px; flex: 0 0 auto; }
                #${uniqueId} .text-input, #${uniqueId} .select-input { ${styles.input} }
                #${uniqueId} #sa2va-cache { flex: 1 1 520px; min-width: 320px; }
                #${uniqueId} .select-input { width:100%; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px; display:block; }
                #${uniqueId} .select-wrapper { position:relative; display:flex; align-items:center; align-self:flex-start; }
                #${uniqueId} .select-wrapper::after { content:""; position:absolute; right:12px; top:50%; transform:translateY(-50%); border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #e8e8e8; pointer-events:none; }
                #${uniqueId} .select-input option, #${uniqueId} .select-input optgroup { background-color:#1e1e32; color:#e8e8e8; }
                #${uniqueId} .text-input:focus, #${uniqueId} .select-input:focus { outline:none; border-color:#4299e1; box-shadow:0 0 0 3px rgba(66,153,225,0.1); }
                #${uniqueId} .download-button { ${styles.button} ${styles.buttonPrimary} }
                #${uniqueId} .set-button { ${styles.button} }
                #${uniqueId} .set-button.enabled { ${styles.buttonSuccess} }
                #${uniqueId} .set-button.enabled:hover { background:linear-gradient(145deg,#16a34a,#15803d); box-shadow:0 4px 12px rgba(34,197,94,.35); }
                #${uniqueId} .set-button.disabled { background:linear-gradient(145deg,#6b7280,#4b5563); color:#e5e7eb; cursor:not-allowed; opacity:.8; }
                #${uniqueId} .status { font-size:14px; color:#9aa0a6; }
                #${uniqueId} .status.highlight { color:#22c55e; }
                #${uniqueId} .progress-container { margin-top:10px; display:none; }
                #${uniqueId} .progress-bar { ${styles.progressBar} }
                #${uniqueId} .progress-fill { ${styles.progressFill} }
                #${uniqueId} .progress-text { margin-top:6px; font-size:14px; color:#e8e8e8; }
                #${uniqueId} .manage { 
                    margin-top: 12px;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    padding: 10px;
                    max-width: 650px;
                    width: 100%;
                    background: linear-gradient(145deg, #1a202c, #2d3748) padding-box,
                                linear-gradient(145deg, #4a5568, #718096) border-box;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06),
                                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                    position: relative;
                }
                #${uniqueId} .manage::before {
                    content: '';
                    position: absolute;
                    top: -2px; left: -2px; right: -2px; bottom: -2px;
                    background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
                    border-radius: 10px;
                    z-index: -1;
                    pointer-events: none;
                }
                #${uniqueId} .manage-header { display:flex; align-items:center; justify-content:space-between; }
                #${uniqueId} .manage-title { font-size:15px; font-weight:600; }
                #${uniqueId} .manage-list { margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:160px; overflow:auto; }
                #${uniqueId} .manage-item { display:flex; align-items:center; justify-content:space-between; background:#0f1623; border:1px solid #243249; border-radius:6px; padding:6px 8px; }
                #${uniqueId} .manage-item .name { font-size:14px; }
                #${uniqueId} .manage-item .meta { font-size:12px; color: #9aa0a6; margin-left:8px; }
                #${uniqueId} .manage-item .actions { display:flex; align-items:center; gap:8px; }
                #${uniqueId} .btn-refresh { ${styles.button} background: #4299e1; color: #fff; padding:8px 12px; font-size:13px; }
                #${uniqueId} .btn-delete { ${styles.buttonDanger} }
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

async function openSettings(node) {
    const configResult = await Utils.apiCall("/zhihui_nodes/sa2va/config", { method: "GET" });
    let cfg = { cache_dir: "", provider: "huggingface", hf_mirror_url: "https://hf-mirror.com", use_default_cache: true, default_cache_dir: "" };
    if (configResult.ok && configResult.data) {
        cfg = { ...cfg, ...configResult.data };
    }

    const modelWidget = node.widgets?.find(w => w.name === "model_name");
    let displayOptions = ["Sa2VA-InternVL3-2B", "Sa2VA-InternVL3-8B", "Sa2VA-InternVL3-14B", "Sa2VA-Qwen2_5-VL-3B", "Sa2VA-Qwen2_5-VL-7B", "Sa2VA-Qwen3-VL-4B"];
    
    if (modelWidget) {
        const modelOptions = Array.isArray(modelWidget.options) ? modelWidget.options : 
                            (modelWidget.options?.values || []);
        displayOptions = modelOptions.length > 0 ? modelOptions.map(s => String(s).replace(/^ByteDance\//, "")) : displayOptions;
    }

    const overlay = createOverlay();
    const dialog = createDialog();
    const uniqueId = `sa2va-settings-${Math.random().toString(36).substring(2, 9)}`;
    
    dialog.innerHTML = `
        ${StyleManager.getUniqueStyles(uniqueId)}
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">⚙️设置</h3>
                <button id="sa2va-close-circle" class="circle-close" type="button"></button>
            </div>
            <div class="ui-controls">
                <div class="inline-controls">
                    <label style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">下载源:</span>
                        <div class="select-wrapper">
                            <select id="sa2va-provider" class="select-input">
                                <option value="huggingface" ${cfg.provider === "huggingface" ? "selected" : ""}>HuggingFace</option>
                                <option value="hf-mirror" ${cfg.provider === "hf-mirror" ? "selected" : ""}>HF Mirror</option>
                                <option value="modelscope" ${cfg.provider === "modelscope" ? "selected" : ""}>ModelScope</option>
                            </select>
                        </div>
                    </label>
                    <label class="model-name" style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">模型名称:</span>
                        <div class="select-wrapper">
                            <select id="sa2va-model" class="select-input">
                                ${displayOptions.map(m => `<option value="${m}" ${m === (modelWidget?.value || displayOptions[0]) ? "selected" : ""}>${m}</option>`).join("")}
                            </select>
                        </div>
                    </label>
                    <button id="sa2va-download" class="download-button" type="button">下载</button>
                </div>
                
                <div id="sa2va-status" class="status"></div>
                <div id="sa2va-progress" class="progress-container">
                    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                    <div class="progress-text">0% • 0 MB/s</div>
                </div>
                <div class="manage">
                    <div class="manage-header">
                        <div class="manage-title">📦模型管理</div>
                        <button id="sa2va-refresh" class="btn-refresh" type="button">刷新</button>
                    </div>
                    <div id="sa2va-model-list" class="manage-list"></div>
                </div>
            </div>
        </div>
    `;

    const close = () => {
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (dialog.parentNode) document.body.removeChild(dialog);
    };

    const updateConfig = async (updates) => {
        const result = await Utils.apiCall("/zhihui_nodes/sa2va/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });
        return result.ok;
    };

    const providerEl = dialog.querySelector("#sa2va-provider");
    providerEl.onchange = async () => {
        await updateConfig({ provider: providerEl.value });
    };

    const updateProgressUI = (p) => {
        const cont = dialog.querySelector(`#${uniqueId} .progress-container`);
        const isDownloading = p && p.status === "downloading";
        cont.style.display = isDownloading ? "block" : "none";
        
        if (isDownloading) {
            const fill = dialog.querySelector(`#${uniqueId} .progress-fill`);
            const text = dialog.querySelector(`#${uniqueId} .progress-text`);
            const pct = Math.max(0, Math.min(100, Number(p?.percent || 0)));
            fill.style.width = `${pct}%`;
            text.textContent = `${pct.toFixed(1)}% • ${Utils.formatSpeed(Number(p?.speed_bps || 0))}`;
        }
    };

    const renderModelList = (list) => {
        const cont = dialog.querySelector(`#${uniqueId} #sa2va-model-list`);
        cont.innerHTML = "";
        
        if (!Array.isArray(list) || list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "manage-item";
            empty.innerHTML = `<div class="name">暂无已下载模型</div>`;
            cont.appendChild(empty);
            return;
        }

        list.forEach((m) => {
            const row = document.createElement("div");
            row.className = "manage-item";
            
            const left = document.createElement("div");
            left.style.cssText = "display:flex; align-items:center; gap:6px;";
            
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = m.name;
            
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = `${Utils.humanSize(m.size_bytes)} • ${m.path}`;
            
            left.appendChild(name);
            left.appendChild(meta);
            
            const actions = document.createElement("div");
            actions.className = "actions";
            
            const del = document.createElement("button");
            del.className = "btn-delete";
            del.textContent = "删除";
            del.onclick = async () => {
                if (!window.confirm(`确认删除模型：${m.name}？`)) return;
                
                const status = dialog.querySelector("#sa2va-status");
                status.textContent = "正在删除...";
                
                const result = await Utils.apiCall("/zhihui_nodes/sa2va/delete_model", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: m.name })
                });
                
                if (result.ok) {
                    status.textContent = `已删除：${m.name}`;
                    await fetchModelList();
                } else {
                    status.textContent = `删除失败：${result.error || '未知错误'}`;
                }
            };
            
            actions.appendChild(del);
            row.appendChild(left);
            row.appendChild(actions);
            cont.appendChild(row);
        });
    };

    const fetchModelList = async () => {
        const result = await Utils.apiCall("/zhihui_nodes/sa2va/list_models", { method: "GET" });
        if (result.ok && result.data) {
            renderModelList(result.data.models || []);
        }
    };

    dialog.querySelector("#sa2va-download").onclick = async () => {
        const provider = dialog.querySelector("#sa2va-provider").value;
        const model_name = dialog.querySelector("#sa2va-model").value;
        const status = dialog.querySelector("#sa2va-status");
        
        const checkResult = await Utils.apiCall(`/zhihui_nodes/sa2va/check_model?model=${encodeURIComponent(model_name)}`, { method: "GET" });
        if (checkResult.ok && checkResult.data?.exists) {
            status.classList.add("highlight");
            status.textContent = "模型已存在，请先删除后再下载";
            return;
        }

        status.classList.remove("highlight");
        status.textContent = "开始下载...";
        
        let stop = false;
        const poll = setInterval(async () => {
            if (stop) return;
            const progressResult = await Utils.apiCall("/zhihui_nodes/sa2va/progress", { method: "GET" });
            if (progressResult.ok && progressResult.data) {
                updateProgressUI(progressResult.data);
                if (progressResult.data.status === "done") stop = true;
            }
        }, 500);
        
        const downloadResult = await Utils.apiCall("/zhihui_nodes/sa2va/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider, model_name })
        });
        
        stop = true;
        clearInterval(poll);
        
        if (downloadResult.ok) {
            const data = downloadResult.data;
            status.textContent = data.local_dir ? `下载完成：${data.local_dir}` : "下载完成";
            status.classList.add("highlight");
            updateProgressUI({ percent: 100, speed_bps: 0, status: "done" });
            await fetchModelList();
        } else {
            status.textContent = `下载失败：${downloadResult.error || '未知错误'}`;
            updateProgressUI({ percent: 0, speed_bps: 0, status: "error" });
        }
    };

    dialog.querySelector("#sa2va-refresh").onclick = fetchModelList;
    dialog.querySelector("#sa2va-close-circle").onclick = close;
    dialog.addEventListener('click', (e) => e.stopPropagation());
    overlay.addEventListener('click', (e) => e.stopPropagation());

    if (document.body.firstChild) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.body.appendChild(overlay);
    }
    overlay.appendChild(dialog);
    
    await fetchModelList();
}

app.registerExtension({
    name: "Sa2VA.Settings",
    async beforeRegisterNodeDef(nodeType, nodeData, app_) {
        if (nodeData.name === "Sa2VAAdvanced") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const btn = this.addWidget("button", "⚙️设置·Settings", "open_settings", () => { 
                    setTimeout(() => openSettings(this), 0); 
                }, { label: "⚙️设置·Settings" });
                btn.serialize = false;
                
                const modelWidget = this.widgets?.find((w) => w.name === "model_name");
                if (modelWidget && modelWidget.callback) {
                    const originalCallback = modelWidget.callback;
                    modelWidget.callback = (val) => { 
                        try { 
                            originalCallback(val); 
                        } catch (error) {
                            console.warn('Model widget callback error:', error);
                        }
                    };
                }
                return r;
            };
        }
    },
});
