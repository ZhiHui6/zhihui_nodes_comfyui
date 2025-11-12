import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
    name: "Comfy.FreeCheckpointLoader",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FreeCheckpointLoader") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                const node = this;
                const settingsBtn = this.addWidget("button", "⚙️设置·Settings", "open_settings", () => {
                    setTimeout(() => openSettingsDialog.call(node), 0);
                });
                settingsBtn.serialize = false;
                node.defaultCheckpoints = [];
                setTimeout(() => {
                    const checkpointWidget = node.widgets?.find(w => w.name === 'ckpt_name');
                    if (checkpointWidget && checkpointWidget.options && checkpointWidget.options.values) {
                        node.defaultCheckpoints = [...checkpointWidget.options.values];
                    }
                }, 100);

                async function openSettingsDialog() {
                    const uniqueId = `checkpoint-loader-ui-${Math.random().toString(36).substring(2, 9)}`;
                    const overlay = document.createElement("div");
                    overlay.className = "comfy-modal-overlay";
                    overlay.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;";
                    const dialog = document.createElement("div");
                    dialog.className = "comfy-modal";
                    dialog.style.cssText = "max-width:800px;width:90%;background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.4);padding:14px 16px;color:#e8e8e8;z-index:10002;display:block;opacity:1;visibility:visible;pointer-events:auto;";
                    dialog.innerHTML = `
                        <style>
                            #${uniqueId} .ui-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); }
                            #${uniqueId} .ui-title { font-size:14px; font-weight:600; color:#f0f0f0; }
                            #${uniqueId} .ui-controls { display:flex; flex-direction:column; gap:10px; }
                            #${uniqueId} .path-input-group { display:flex; gap:8px; align-items:center; }
                            #${uniqueId} .path-input { flex:1; background:linear-gradient(145deg,#2a2a3e,#1e1e32); color:#e8e8e8; border:1px solid #4a5568; border-radius:6px; padding:8px 12px; font-size:12px; transition:all .3s ease; }
                            #${uniqueId} .path-input:focus { outline:none; border-color:#4299e1; box-shadow:0 0 0 3px rgba(66,153,225,0.1); }
                            #${uniqueId} .browse-button { background:linear-gradient(145deg,#667eea,#764ba2); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:4px; }
                            #${uniqueId} .browse-button:hover { background:linear-gradient(145deg,#5a6fd8,#6a4190); transform:translateY(-1px); box-shadow:0 4px 12px rgba(102,126,234,.4); }
                            #${uniqueId} .clear-button { background:linear-gradient(145deg,#64748b,#475569); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:4px; }
                            #${uniqueId} .clear-button:hover { background:linear-gradient(145deg,#5b6b82,#3f4a5a); box-shadow:0 4px 12px rgba(100,116,139,.35); }
                            #${uniqueId} .save-button { background:linear-gradient(145deg,#ed8936,#dd6b20); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:4px; }
                            #${uniqueId} .save-button:hover { background:linear-gradient(145deg,#dd6b20,#c05621); box-shadow:0 4px 12px rgba(237,137,54,.4); }
                            #${uniqueId} .status-message { font-size:11px; padding:6px 10px; border-radius:4px; margin-top:8px; display:block; min-height:28px; visibility:hidden; }
                            #${uniqueId} .status-success { background:rgba(72,187,120,.2); color:#68d391; border:1px solid rgba(72,187,120,.3); }
                            #${uniqueId} .status-error { background:rgba(245,101,101,.2); color:#fc8181; border:1px solid rgba(245,101,101,.3); }
                            #${uniqueId} .status-info { background:rgba(66,153,225,.2); color:#63b3ed; border:1px solid rgba(66,153,225,.3); }
                            #${uniqueId} .path-count { margin-top:4px; padding:6px 8px; font-size:12px; font-weight:600; color:#22c55e; border:1px solid rgba(34,197,94,.70); border-radius:6px; background:rgba(34,197,94,.14); display:block; }
                            #${uniqueId} .path-list { margin-top:8px; max-height:200px; overflow-y:auto; border:1px solid rgba(255,255,255,.1); border-radius:4px; background:rgba(25,25,25,.25); }
                            #${uniqueId} .path-item { display:flex; flex-direction:column; gap:6px; padding:8px; font-size:12px; border-bottom:1px solid rgba(255,255,255,.05); }
                            #${uniqueId} .path-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
                            #${uniqueId} .path-text { flex:1; color:#e8e8e8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
                            #${uniqueId} .remove-path-btn { background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%); color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; }
                            #${uniqueId} .clear-button { background:linear-gradient(145deg,#3b82f6,#1d4ed8); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:6px; }
                            #${uniqueId} .clear-button:hover { background:linear-gradient(145deg,#2563eb,#1e40af); box-shadow:0 4px 12px rgba(59,130,246,.35); }
                            #${uniqueId} .ui-footer { display:flex; justify-content:flex-end; margin-top:10px; gap:8px; }
                            #${uniqueId} .exit-button { background:linear-gradient(145deg,#6b7280,#4b5563); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:6px; }
                            #${uniqueId} .exit-button:hover { background:linear-gradient(145deg,#dc2626,#b91c1c); box-shadow:0 4px 12px rgba(220,38,38,.35); }
                            #${uniqueId} .persist-button { background:linear-gradient(145deg,#22c55e,#16a34a); color:white; border:none; border-radius:6px; padding:8px 12px; font-size:12px; cursor:pointer; transition:all .3s ease; white-space:nowrap; display:flex; align-items:center; gap:6px; }
                            #${uniqueId} .persist-button:hover { background:linear-gradient(145deg,#16a34a,#15803d); box-shadow:0 4px 12px rgba(34,197,94,.35); }
                        </style>
                        <div id="${uniqueId}">
                            <h3 class="ui-title">👩🏻‍💻路径设置</h3>
                            <div class="ui-controls">
                                <div class="path-input-group">
                                    <input type="text" class="path-input" placeholder="输入checkpoint模型文件夹路径">
                                    <button class="clear-button" type="button">🧹清除</button>
                                    <button class="browse-button" type="button">📁加载</button>
                                    <button class="save-button" type="button">➕添加</button>
                                </div>
                                <div class="path-list"></div>
                                <div class="status-message"></div>
                                
                                <div class="ui-footer">
                                    <button class="exit-button" type="button">🚪退出</button>
                                    <button class="persist-button" type="button">💾保存设置</button>
                                </div>
                            </div>
                        </div>
                    `;
                    overlay.appendChild(dialog);
                    if (document.body.firstChild) {
                        document.body.insertBefore(overlay, document.body.firstChild);
                    } else {
                        document.body.appendChild(overlay);
                    }

                    const pathInput = dialog.querySelector('.path-input');
                    const browseButton = dialog.querySelector('.browse-button');
                    if (browseButton) browseButton.remove();
                    const saveButton = dialog.querySelector('.save-button');
                    const clearButton = dialog.querySelector('.clear-button');
                    const persistButton = dialog.querySelector('.persist-button');
                    const exitButton = dialog.querySelector('.exit-button');
                    const statusMessage = dialog.querySelector('.status-message');
                    const pathList = dialog.querySelector('.path-list');
                    node.checkpointPathInput = pathInput;
                    node.checkpointStatusMessage = statusMessage;
                    
                    node._pathCounts = node._pathCounts || {};

                    function showStatus(message, type = 'info') {
                        statusMessage.textContent = message;
                        statusMessage.className = `status-message status-${type}`;
                        statusMessage.style.visibility = 'visible';
                        if (type === 'error' || type === 'info') {
                            if (statusMessage._hideTimer) clearTimeout(statusMessage._hideTimer);
                            statusMessage._hideTimer = setTimeout(() => {
                                statusMessage.style.visibility = 'hidden';
                                statusMessage._hideTimer = null;
                            }, 3000);
                        }
                    }
                    function renderPathList(paths) {
                        const items = (paths || []).map(p => `
                            <div class="path-item">
                                <div class="path-row">
                                    <span class="path-text">${p}</span>
                                    <button class="remove-path-btn" data-path="${p}">删除</button>
                                </div>
                                <div class="path-count" data-path="${p}">正在扫描...</div>
                            </div>
                        `);
                        pathList.innerHTML = items.join('') || '<div class="path-item"><span class="path-text">尚未添加路径</span></div>';
                        pathList.querySelectorAll('.remove-path-btn').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                const p = btn.getAttribute('data-path');
                                node._tempPaths = (node._tempPaths || []).filter(x => x !== p);
                                renderPathList(node._tempPaths);
                                try {
                                    const scanResp = await api.fetchApi('/free_checkpoint_loader/scan_paths', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ paths: node._tempPaths, node_id: node.id })
                                    });
                                    const scanData = await scanResp.json();
                                    node._previewModels = scanData.models || [];
                                } catch (_) {
                                    node._previewModels = [];
                                }
                                await updatePathCounts(node._tempPaths);
                                showStatus('已从临时列表移除路径（未保存）', 'info');
                            });
                        });
                    }

                    async function updatePathCounts(paths) {
                        const list = Array.isArray(paths) ? paths : [];
                        const counts = {};
                        await Promise.all(list.map(async (p) => {
                            try {
                                const resp = await api.fetchApi('/free_checkpoint_loader/scan_path_single', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ path: p })
                                });
                                const data = await resp.json();
                                counts[p] = data.model_count || 0;
                            } catch (_) {
                                counts[p] = 0;
                            }
                            const c = counts[p] || 0;
                            pathList.querySelectorAll('.path-count').forEach(el => {
                                const ep = el.getAttribute('data-path');
                                if (ep === p) {
                                    el.textContent = `已发现模型数量：${c}个`;
                                }
                            });
                        }));
                        node._pathCounts = counts;
                    }
                    async function loadCustomPathModels(path) {
                        if (!path) return;
                        try {
                            showStatus('正在验证并添加到临时列表...', 'info');
                            let pathIsValid = false;
                            try {
                                const vResp = await api.fetchApi('/free_checkpoint_loader/check_path', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ path, node_id: node.id })
                                });
                                const vData = await vResp.json();
                                pathIsValid = !!(vData && vData.success && vData.exists && vData.is_directory);
                            } catch (_) {
                                try {
                                    const sResp = await api.fetchApi('/free_checkpoint_loader/scan_path', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ path, node_id: node.id })
                                    });
                                    const sData = await sResp.json();
                                    pathIsValid = !!(sData && sData.success);
                                } catch (_) { pathIsValid = false; }
                            }
                            if (!pathIsValid) {
                                showStatus('路径不存在或不可访问', 'error');
                                return;
                            }
                            node._tempPaths = Array.from(new Set([...(node._tempPaths || []), path]));
                            renderPathList(node._tempPaths);
                            let singleScanData = null;
                            try {
                                const sResp = await api.fetchApi('/free_checkpoint_loader/scan_path_single', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ path })
                                });
                                singleScanData = await sResp.json();
                            } catch (_) { singleScanData = null; }

                            if (singleScanData && singleScanData.success) {
                                const pathCount = singleScanData.model_count || 0;
                                showStatus(`已添加到临时列表，并预览到 ${pathCount} 个模型`, 'success');
                            } else {
                                const err = (singleScanData && singleScanData.error) ? singleScanData.error : '未知错误';
                                showStatus(`扫描失败: ${err}`, 'error');
                            }

                            let aggData = null;
                            try {
                                const aResp = await api.fetchApi('/free_checkpoint_loader/scan_paths', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ paths: node._tempPaths, node_id: node.id })
                                });
                                aggData = await aResp.json();
                            } catch (_) { aggData = null; }
                            node._previewModels = (aggData && aggData.success) ? (aggData.models || []) : (singleScanData?.models || []);
                            await updatePathCounts(node._tempPaths);
                        } catch (error) {
                            const errorMessage = error ? (error.message || error.toString()) : '未知错误';
                            showStatus(`扫描错误: ${errorMessage}`, 'error');
                            renderPathList(node._tempPaths);
                        }
                    }
                    saveButton.addEventListener('click', async () => {
                        const path = pathInput.value.trim();
                        if (!path) {
                            showStatus('请先输入有效路径', 'error');
                            return;
                        }
                        await loadCustomPathModels(path);
                    });
                    if (clearButton) {
                        clearButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (pathInput) {
                                pathInput.value = '';
                                pathInput.setAttribute('value', '');
                                pathInput.focus();
                            }
                            showStatus('已清空输入', 'info');
                        });
                    }
                    
                    try {
                        const resp = await api.fetchApi('/free_checkpoint_loader/load_path', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ node_id: node.id })
                        });
                        const data = await resp.json();
                        node._savedPaths = data.paths || [];
                        node._tempPaths = [...(node._savedPaths || [])];
                        renderPathList(node._tempPaths);
                        if (node._tempPaths && node._tempPaths.length) {
                            let scanResp = await api.fetchApi('/free_checkpoint_loader/scan_paths', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paths: node._tempPaths, node_id: node.id })
                            });
                            let scanData = await scanResp.json();
                            if (!(scanData && scanData.success)) {
                                showStatus('扫描路径失败，请检查路径是否有效', 'error');
                            }
                            node._previewModels = scanData.models || [];
                        }
                    } catch {}
                    await updatePathCounts(node._tempPaths);

                    persistButton.addEventListener('click', async () => {
                        const toSavePaths = node._tempPaths || [];
                        try {
                            showStatus('正在保存设置并应用...', 'info');
                            const resp = await api.fetchApi('/free_checkpoint_loader/save_settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ node_id: node.id, paths: toSavePaths })
                            });
                            const data = await resp.json();
                            if (!(data && data.success)) {
                                const err = (data && data.error) ? data.error : '未知错误';
                                showStatus(`保存失败：${err}`, 'error');
                                return;
                            }
                            node._savedPaths = Array.isArray(data.paths) ? data.paths : toSavePaths;
                            let scanResp = await api.fetchApi('/free_checkpoint_loader/scan_paths', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paths: node._savedPaths, node_id: node.id })
                            });
                            let scanData = await scanResp.json();
                            if (!(scanData && scanData.success)) {
                                showStatus('扫描路径失败，请检查路径是否有效', 'error');
                            }
                            node.customModels = scanData.models || [];
                            node._previewModels = undefined;
                            node.updateCheckpointList(node.customModels || []);
                            await updatePathCounts(node._savedPaths || []);
                            showStatus('设置已保存并生效', 'success');
                        } catch (err) {
                            const msg = err ? (err.message || err.toString()) : '未知错误';
                            showStatus(`保存出错：${msg}`, 'error');
                        }
                    });

                    if (exitButton) {
                        exitButton.addEventListener('click', () => {
                            closeDialog();
                        });
                    }

                    function closeDialog() {
                        if (overlay && overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }
                        node.modelList = null;
                        document.removeEventListener('keydown', handleEscape, true);
                    }
                    const handleEscape = (e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    };
                    document.addEventListener('keydown', handleEscape, true);
                    setTimeout(() => {
                        overlay.addEventListener('click', (e) => {
                            e.stopPropagation();
                        });
                    }, 0);
                    dialog.addEventListener('click', (e) => e.stopPropagation());
                    const closeBtn = dialog.querySelector('.close-btn');
                    closeBtn.addEventListener('click', closeDialog);
                }

                (async () => {
                    try {
                        try {
                            const checkpointWidget = node.widgets?.find(w => w.name === 'ckpt_name');
                            if (checkpointWidget) {
                                checkpointWidget.options.values = [];
                                checkpointWidget.value = '';
                                if (checkpointWidget.callback) {
                                    checkpointWidget.callback(checkpointWidget.value, node, checkpointWidget);
                                }
                            }
                        } catch {}
                        const response = await api.fetchApi('/free_checkpoint_loader/load_path', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ node_id: node.id })
                        });
                        const data = await response.json();
                        if (data && data.success) {
                            node._savedPaths = data.paths || [];
                        if (node._savedPaths && node._savedPaths.length) {
                            let scanResp = await api.fetchApi('/free_checkpoint_loader/scan_paths', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paths: node._savedPaths, node_id: node.id })
                            });
                            let scanData = await scanResp.json();
                            if (!(scanData && scanData.success)) {
                                showStatus('扫描路径失败，请检查路径是否有效', 'error');
                            }
                            node.customModels = scanData.models || [];
                        }
                            node.updateCheckpointList(node.customModels || []);
                        }
                    } catch {}
                })();
                
                return r;
            };
            
            nodeType.prototype.updateCheckpointList = function(models) {
                const checkpointWidget = this.widgets?.find(w => w.name === 'ckpt_name');
                if (checkpointWidget) {
                    const finalModels = Array.isArray(models) ? models.map(m => String(m)) : [];
                    checkpointWidget.options.values = finalModels;
                    
                    if (!finalModels.includes(checkpointWidget.value)) {
                        checkpointWidget.value = finalModels[0] || '';
                    }
                    
                    if (checkpointWidget.callback) {
                        checkpointWidget.callback(checkpointWidget.value, this, checkpointWidget);
                    }
                }
            };
    }
}
});