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
            base: "max-width:980px;width:96%;background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:16px 18px;color:#e8e8e8;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;",
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
                #${uniqueId} .inline-controls { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
                #${uniqueId} .model-row { gap:2px; }
                #${uniqueId} .inline-controls label { flex: 0 0 auto; }
                #${uniqueId} .inline-controls label span { white-space: nowrap; flex-shrink: 0; font-weight: 600; }
                #${uniqueId} .input-group > span { font-weight: 600; }
                #${uniqueId} .inline-controls .select-wrapper { flex: 0 1 auto; min-width: 240px; }
                #${uniqueId} .model-row .provider-item .select-wrapper { min-width: 160px; max-width: 220px; }
                #${uniqueId} .inline-controls .model-name { margin-left: 0; flex: 0 1 420px; min-width: 360px; }
                #${uniqueId} .inline-controls .download-button { flex: 0 0 auto; }
                #${uniqueId} .text-input, #${uniqueId} .select-input { ${styles.input} }
                #${uniqueId} .select-input { width:100%; appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:36px; display:block; }
                #${uniqueId} .select-wrapper { position:relative; display:flex; align-items:center; align-self:flex-start; }
                #${uniqueId} .select-wrapper::after { content:""; position:absolute; right:12px; top:50%; transform:translateY(-50%); border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #e8e8e8; pointer-events:none; }
                #${uniqueId} .select-input option, #${uniqueId} .select-input optgroup { background-color:#1e1e32; color:#e8e8e8; }
                #${uniqueId} .text-input:focus, #${uniqueId} .select-input:focus { outline:none; border-color:#4299e1; box-shadow:0 0 0 3px rgba(66,153,225,0.1); }
                #${uniqueId} .download-button { ${styles.button} ${styles.buttonPrimary} }
                #${uniqueId} .status { font-size:14px; color:#9aa0a6; }
                #${uniqueId} .status.highlight { color:#22c55e; }
                #${uniqueId} .status.success { color:#22c55e; font-weight:600; }
                #${uniqueId} .status.error { color:#ef4444; font-weight:600; }
                #${uniqueId} .status.warning { color:#f59e0b; font-weight:600; }
                #${uniqueId} .progress-container { margin-top:10px; display:none; }
                #${uniqueId} .progress-bar { ${styles.progressBar} }
                #${uniqueId} .progress-fill { ${styles.progressFill} }
                #${uniqueId} .progress-text { margin-top:6px; font-size:14px; color:#e8e8e8; }
                #${uniqueId} .manage { margin-top: 12px; border: 1px solid transparent; border-radius: 8px; padding: 10px; max-width: 920px; width: 100%; background: linear-gradient(145deg, #1a202c, #2d3748) padding-box, linear-gradient(145deg, #4a5568, #718096) border-box; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset; position: relative; }
                #${uniqueId} .manage-header { display:flex; align-items:center; justify-content:space-between; }
                #${uniqueId} .manage-title { font-size:15px; font-weight:600; }
                #${uniqueId} .manage-list { margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:160px; overflow:auto; }
                #${uniqueId} .manage-item { display:flex; align-items:center; justify-content:space-between; gap:8px; background:#0f1623; border:1px solid #243249; border-radius:6px; padding:6px 8px; }
                #${uniqueId} .manage-item > div:first-child { flex: 1 1 auto; min-width: 0; }
                #${uniqueId} .manage-item .name { font-size:14px; flex: 0 0 auto; }
                #${uniqueId} .manage-item .meta { font-size:12px; color: #9aa0a6; margin-left:8px; flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                #${uniqueId} .manage-item .subline { display:flex; align-items:center; gap:6px; }
                #${uniqueId} .manage-item .actions { display:flex; align-items:center; gap:8px; flex: 0 0 auto; }
                #${uniqueId} .btn-refresh { ${styles.button} background: #ff7f00; color: #fff; padding:4px 8px; font-size:12px; }
                #${uniqueId} .btn-activate { ${styles.button} background: #4299e1; color: #fff; padding:4px 8px; font-size:12px; }
                #${uniqueId} .btn-delete { ${styles.buttonDanger} }
                @media (min-width: 760px) {
                    #${uniqueId} .inline-controls { flex-wrap: nowrap; }
                    #${uniqueId} .inline-controls .select-wrapper { min-width: 240px; }
                    #${uniqueId} .model-row .provider-item .select-wrapper { min-width: 160px; max-width: 220px; }
                    #${uniqueId} .inline-controls .model-name { min-width: 420px; }
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

async function openSettings(node) {
    const configResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/config", { method: "GET" });
    let cfg = { cache_dir: "", provider: "huggingface", hf_mirror_url: "https://hf-mirror.com", use_default_cache: true, default_cache_dir: "" };
    if (configResult.ok && configResult.data) {
        cfg = { ...cfg, ...configResult.data };
    }

    const modelWidget = node.widgets?.find(w => w.name === "model");
    let displayOptions = [
        "Qwen3-VL-4B-Instruct",
        "Qwen3-VL-4B-Thinking",
        "Qwen3-VL-4B-Instruct-FP8",
        "Qwen3-VL-4B-Thinking-FP8",
        "Qwen3-VL-8B-Instruct",
        "Qwen3-VL-8B-Thinking",
        "Qwen3-VL-8B-Instruct-FP8",
        "Qwen3-VL-8B-Thinking-FP8",
        "Qwen3-VL-32B-Instruct",
        "Qwen3-VL-32B-Thinking",
        "Qwen3-VL-32B-Instruct-FP8",
        "Qwen3-VL-32B-Thinking-FP8",
        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
        "Huihui-Qwen3-VL-8B-Thinking-abliterated",
    ];
    if (modelWidget) {
        const modelOptions = Array.isArray(modelWidget.options) ? modelWidget.options : (modelWidget.options?.values || []);
        displayOptions = modelOptions.length > 0 ? modelOptions.map(s => String(s)) : displayOptions;
    }

    const overlay = createOverlay();
    const dialog = createDialog();
    const uniqueId = `qwen3vl-settings-${Math.random().toString(36).substring(2, 9)}`;
    

    dialog.innerHTML = `
        ${StyleManager.getUniqueStyles(uniqueId)}
        <div id="${uniqueId}">
            <div class="ui-header">
                <h3 class="ui-title">⚙️模型管理</h3>
                <button id="qwen3vl-close-circle" class="circle-close" type="button"></button>
            </div>
            <div class="ui-controls">
                <div class="inline-controls model-row">
                    <label class="provider-item" style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">下载源:</span>
                        <div class="select-wrapper">
                            <select id="qwen3vl-provider" class="select-input">
                                <option value="huggingface" ${cfg.provider === "huggingface" ? "selected" : ""}>HuggingFace</option>
                                <option value="hf-mirror" ${cfg.provider === "hf-mirror" ? "selected" : ""}>HF Mirror</option>
                                <option value="modelscope" ${cfg.provider === "modelscope" ? "selected" : ""}>ModelScope</option>
                            </select>
                        </div>
                    </label>
                    <label class="model-name" style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">模型名称:</span>
                        <div class="select-wrapper">
                            <select id="qwen3vl-model" class="select-input">
                                ${displayOptions.map(m => `<option value="${m}" ${m === (modelWidget?.value || displayOptions[0]) ? "selected" : ""}>${m}</option>`).join("")}
                            </select>
                        </div>
                    </label>
                    <button id="qwen3vl-download" class="download-button" type="button">下载</button>
                </div>
                <div id="qwen3vl-status" class="status"></div>
                <div id="qwen3vl-progress" class="progress-container">
                    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                    <div class="progress-text">0% • 0 MB/s</div>
                </div>
                <div class="manage">
                    <div class="manage-header">
                        <div class="manage-title">📦已下载模型</div>
                        <button id="qwen3vl-refresh" class="btn-refresh" type="button">刷新</button>
                    </div>
                    <div id="qwen3vl-model-list" class="manage-list"></div>
                </div>
            </div>
        </div>
    `;

    const close = () => {
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (dialog.parentNode) document.body.removeChild(dialog);
    };

    const updateConfig = async (updates) => {
        const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });
        return result.ok;
    };

    const providerEl = dialog.querySelector("#qwen3vl-provider");
    const modelEl = dialog.querySelector("#qwen3vl-model");
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

    const renderModelList = (list, activeName) => {
        const cont = dialog.querySelector(`#${uniqueId} #qwen3vl-model-list`);
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
            left.style.cssText = "display:flex; flex-direction:column; gap:4px; align-items:flex-start;";
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = m.name;
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = `${Utils.humanSize(m.size_bytes)} • ${m.path}`;
            const badge = document.createElement("span");
            badge.style.cssText = "margin-left:8px; padding:2px 6px; border-radius:10px; font-size:12px;";
            if (m.valid) {
                badge.textContent = "文件完整";
                badge.style.background = "rgba(34,197,94,0.12)";
                badge.style.color = "#22c55e";
                badge.style.border = "1px solid rgba(34,197,94,0.3)";
            } else {
                badge.textContent = "文件不完整";
                badge.style.background = "rgba(239,68,68,0.12)";
                badge.style.color = "#ef4444";
                badge.style.border = "1px solid rgba(239,68,68,0.3)";
            }
            const activeBadge = document.createElement("span");
            if (m.active || (activeName && m.name === activeName)) {
                activeBadge.textContent = "已激活";
                activeBadge.style.cssText = "margin-left:6px; padding:2px 6px; border-radius:10px; font-size:12px; background:rgba(0, 255, 85, 0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.3);";
            }
            const subline = document.createElement("div");
            subline.className = "subline";
            subline.appendChild(meta);
            subline.appendChild(badge);
            if (activeBadge.textContent) subline.appendChild(activeBadge);
            left.appendChild(name);
            left.appendChild(subline);
            const actions = document.createElement("div");
            actions.className = "actions";
            const activate = document.createElement("button");
            activate.className = "btn-activate";
            activate.textContent = "激活";
            activate.onclick = async () => {
                const status = dialog.querySelector("#qwen3vl-status");
                status.classList.remove("success", "error", "warning", "highlight");
                status.textContent = "正在激活...";
                const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/activate_model", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: m.name })
                });
                if (result.ok) {
                    status.classList.add("success");
                    status.textContent = `已激活：${m.name}`;
                    await fetchModelList();
                } else {
                    status.classList.add("error");
                    status.textContent = `激活失败：${result.error || '未知错误'}`;
                }
            };
            actions.appendChild(activate);
            const del = document.createElement("button");
            del.className = "btn-delete";
            del.textContent = "删除";
            del.onclick = async () => {
                if (!window.confirm(`确认删除模型：${m.name}？`)) return;
                const status = dialog.querySelector("#qwen3vl-status");
                status.classList.remove("success", "error", "warning", "highlight");
                status.textContent = "正在删除...";
                const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/delete_model", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: m.name })
                });
                if (result.ok) {
                    status.classList.add("success");
                    status.textContent = `已删除：${m.name}`;
                    await fetchModelList();
                } else {
                    status.classList.add("error");
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
        const result = await Utils.apiCall("/zhihui_nodes/qwen3vl/list_models", { method: "GET" });
        if (result.ok && result.data) {
            renderModelList(result.data.models || [], result.data.active_model_name || "");
        }
    };

    let progressPoll = null;
    dialog.querySelector("#qwen3vl-download").onclick = async () => {
        const provider = dialog.querySelector("#qwen3vl-provider").value;
        const model_name = dialog.querySelector("#qwen3vl-model").value;
        const status = dialog.querySelector("#qwen3vl-status");
        const checkResult = await Utils.apiCall(`/zhihui_nodes/qwen3vl/check_model?model=${encodeURIComponent(model_name)}`, { method: "GET" });
        if (checkResult.ok && checkResult.data?.exists) {
            status.classList.remove("success", "error");
            status.classList.add("warning");
            status.textContent = "模型已存在，请先删除后再下载";
            return;
        }
        status.classList.remove("success", "error", "warning", "highlight");
        status.textContent = "开始下载...";
        if (progressPoll) { clearInterval(progressPoll); progressPoll = null; }
        progressPoll = setInterval(async () => {
            const progressResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
            if (progressResult.ok && progressResult.data) {
                updateProgressUI(progressResult.data);
                if (progressResult.data.status === "done" || progressResult.data.status === "error") {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }
            }
        }, 500);
        const payload = { provider, model_name };
        const downloadResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (downloadResult.ok) {
            const data = downloadResult.data;
            status.classList.remove("error", "warning");
            status.classList.add("success");
            status.textContent = data.local_dir ? `下载完成：${data.local_dir}` : "下载完成";
            updateProgressUI({ percent: 100, speed_bps: 0, status: "done" });
            await fetchModelList();
        } else {
            status.classList.remove("success", "warning");
            status.classList.add("error");
            status.textContent = `下载失败：${downloadResult.error || '未知错误'}`;
            updateProgressUI({ percent: 0, speed_bps: 0, status: "error" });
        }
    };

    dialog.querySelector("#qwen3vl-refresh").onclick = fetchModelList;
    dialog.querySelector("#qwen3vl-close-circle").onclick = close;
    dialog.addEventListener('click', (e) => e.stopPropagation());
    overlay.addEventListener('click', (e) => e.stopPropagation());
    if (document.body.firstChild) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.body.appendChild(overlay);
    }
    overlay.appendChild(dialog);
    await fetchModelList();
    const initProg = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
    if (initProg.ok && initProg.data && initProg.data.status === "downloading") {
        const status = dialog.querySelector("#qwen3vl-status");
        status.classList.remove("success", "error", "warning", "highlight");
        status.textContent = "正在下载...";
        updateProgressUI(initProg.data);
        if (progressPoll) { clearInterval(progressPoll); progressPoll = null; }
        progressPoll = setInterval(async () => {
            const progressResult = await Utils.apiCall("/zhihui_nodes/qwen3vl/progress", { method: "GET" });
            if (progressResult.ok && progressResult.data) {
                updateProgressUI(progressResult.data);
                if (progressResult.data.status === "done" || progressResult.data.status === "error") {
                    clearInterval(progressPoll);
                    progressPoll = null;
                }
            }
        }, 500);
    }
}

app.registerExtension({
    name: "Qwen3VL.Settings",
    async beforeRegisterNodeDef(nodeType, nodeData, app_) {
        if (nodeData.name === "Qwen3VLAdvanced" || nodeData.name === "Qwen3VLBasic") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const btn = this.addWidget("button", "⚙️模型管理·Model Manager", "open_settings", () => {
                    setTimeout(() => openSettings(this), 0);
                }, { label: "⚙️模型管理·Model Manager" });
                btn.serialize = false;
                return r;
            };
        }
    }
});