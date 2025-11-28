import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.TextSwitchDualMode.DynamicInputs",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "TextSwitchDualMode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "STRING";
            this.properties = this.properties || {};
            const nodeName = nodeData?.name || "TextSwitchDualMode";
            const today = new Date().toISOString().slice(0, 10);
            this._noticeStorageKey = `zhihui_nodes_unconnected_notice_disabled_${nodeName}_${today}`;
            this._unconnectedNoticeDisabled = !!window.localStorage.getItem(this._noticeStorageKey);
            this._noticeOpen = false;
            this._noticeDismissMs = 12000;
            const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateInputs(value);
                    this.updateSelectTextOptions(value);
                    this.syncCommentWidgets(value);
                };
            }

            this.addWidget("button", "Update inputs", null, () => {
                const target_number_of_inputs = this.widgets.find((w) => w.name === "inputcount")["value"];
                this.updateInputs(target_number_of_inputs);
                this.updateSelectTextOptions(target_number_of_inputs);
                this.syncCommentWidgets(target_number_of_inputs);
            });

            this.updateInputs = function (target_number_of_inputs) {
                if (!this.inputs) this.inputs = [];

                const isTextPort = (name) => /^text\d+$/.test(name);
                const currentTextInputs = this.inputs.filter(input => isTextPort(input.name)).length;
                const newlyAdded = [];

                if (target_number_of_inputs === currentTextInputs) return;

                if (target_number_of_inputs < currentTextInputs) {
                    for (let i = this.inputs.length - 1; i >= 0; i--) {
                        const input = this.inputs[i];
                        if (isTextPort(input.name)) {
                            const num = parseInt(input.name.replace("text", ""));
                            if (num > target_number_of_inputs) {
                                this.removeInput(i);
                            }
                        }
                    }
                } else {
                    for (let i = currentTextInputs + 1; i <= target_number_of_inputs; i++) {
                        const name = `text${i}`;
                        const exists = this.inputs.some(inp => inp.name === name);
                        if (!exists) {
                            this.addInput(name, this._type || "STRING", { optional: true });
                            newlyAdded.push(name);
                        }
                    }
                }
                for (const inp of this.inputs || []) {
                    if (/^text\d+$/.test(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);

                // 检查所有未连接端口（而非仅新增端口）
                const allUnconnected = (this.inputs || [])
                    .filter(i => isTextPort(i.name) && (i.link == null || i.link === undefined))
                    .map(i => i.name);
                if (allUnconnected.length) this.showUnconnectedNotice(allUnconnected, "文本端口");
            };

            this.updateSelectTextOptions = function (n) {
                const w = this.widgets?.find(w => w.name === "select_text");
                if (!w) return;
                const opts = Array.from({ length: Math.max(1, parseInt(n) || 1) }, (_, i) => String(i + 1));
                if (Array.isArray(w.options)) {
                    w.options = opts;
                } else if (w.options && typeof w.options === "object") {
                    w.options.values = opts;
                } else {
                    w.options = opts;
                }
                const v = parseInt(w.value);
                if (!v || v < 1 || v > opts.length) {
                    w.value = "1";
                } else {
                    w.value = String(v);
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            this.repositionSelectText = function(currentMode) {
                const widgets = this.widgets || [];
                const selIdx = widgets.findIndex(w => w && w.name === "select_text");
                const modeIdx = widgets.findIndex(w => w && w.name === "mode");
                if (selIdx < 0 || modeIdx < 0) return;
                const sel = widgets[selIdx];
                const hide = currentMode === "auto";
                sel.hidden = hide;
                if (hide) {
                    widgets.splice(selIdx, 1);
                    widgets.push(sel);
                } else {
                    widgets.splice(selIdx, 1);
                    const insertPos = widgets.findIndex(w => w && w.name === "mode");
                    widgets.splice(insertPos + 1, 0, sel);
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            const modeWidget = this.widgets?.find(w => w.name === "mode");
            const selectTextWidget = this.widgets?.find(w => w.name === "select_text");
            if (modeWidget && selectTextWidget) {
                const originalModeCallback = modeWidget.callback;
                modeWidget.callback = (value) => {
                    if (originalModeCallback) originalModeCallback.call(this, value);
                    this.repositionSelectText(modeWidget.value);
                };
                this.repositionSelectText(modeWidget.value);
            }

            this.syncCommentWidgets = function (n) {
                const target = Math.max(1, parseInt(n) || 1);
                const isComment = (name) => /^text\d+_comment$/.test(name);
                for (let i = (this.widgets?.length || 0) - 1; i >= 0; i--) {
                    const w = this.widgets[i];
                    if (w && isComment(w.name)) {
                        const idx = parseInt(w.name.replace("text", "").replace("_comment", ""));
                        if (idx > target) {
                            w.onRemove?.();
                            this.widgets.splice(i, 1);
                        }
                    }
                }
                for (let i = 1; i <= target; i++) {
                    const name = `text${i}_comment`;
                    let w = this.widgets?.find(w => w.name === name);
                    if (!w) {
                        w = this.addWidget("text", name, "");
                        if (w) w.serialize = true;
                    }
                }
                const posAfterInput = (this.widgets?.findIndex(w => w.name === "inputcount") ?? -1) + 1;
                if (posAfterInput > 0) {
                    const others = [];
                    const comments = [];
                    for (const w of this.widgets || []) {
                        if (isComment(w.name)) comments.push(w); else others.push(w);
                    }
                    this.widgets.length = 0;
                    const head = others.slice(0, posAfterInput);
                    const tail = others.slice(posAfterInput);
                    this.widgets.push(...head, ...comments, ...tail);
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            if (inputcountWidget) {
                const v = inputcountWidget.value;
                this.updateInputs(v);
                this.updateSelectTextOptions(v);
                this.syncCommentWidgets(v);
            }

            this.showUnconnectedNotice = function(names, label) {
                try {
                    if (this._unconnectedNoticeDisabled || this._noticeOpen) return;
                    this._noticeOpen = true;
                    const overlay = document.createElement("div");
                    overlay.style.cssText = `position: fixed;left:0;top:0;width:100%;height:100%;background: rgba(0,0,0,0.45);z-index: 9999;`;
                    const dialog = document.createElement("div");
                    dialog.style.cssText = `position: fixed;left:50%;top:50%;transform: translate(-50%,-50%);width: 520px;background: var(--comfy-menu-bg);border: 2px solid #4488ff;border-radius:8px;padding:16px;color: var(--input-text);z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);`;
                    dialog.innerHTML = `
                        <h3 style="margin:0 0 10px 0;text-align:center;color:var(--input-text);">未连接端口</h3>
                        <div style="font-size:13px;color:var(--descrip-text);margin-bottom:12px;">以下${label}当前未连接：</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
                            ${names.map(n => `<span style=\"padding:4px 8px;border:1px solid var(--border-color);border-radius:4px;background:var(--comfy-input-bg);color:var(--input-text);\">${n}</span>`).join("")}
                        </div>
                        <div style="display:flex;justify-content:center;gap:8px;align-items:center;">
                            <button id="notice-ok" style="background: #4488ff;border: 1px solid #4488ff;color: #ffffff;padding: 4px 10px;border-radius: 4px;cursor: pointer;font-size: 12px;">知道了</button>
                            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--input-text);">
                                <input id="notice-disable" type="checkbox" style="accent-color:#22c55e;">本日内不再提示
                            </label>
                        </div>
                        <div style="text-align:center;margin-top:8px;font-size:12px;">此窗口将自动在 <span id="countdown-val" style="font-weight:600;color:#22c55e;">${(this._noticeDismissMs/1000)|0}</span> 秒后关闭</div>`;
                    document.body.appendChild(overlay);
                    document.body.appendChild(dialog);
                    const close = () => { 
                        try { document.body.removeChild(dialog); document.body.removeChild(overlay);} catch(e){}
                        this._noticeOpen = false;
                        if (intervalId) { clearInterval(intervalId); intervalId = null; }
                    };
                    dialog.querySelector('#notice-ok')?.addEventListener('click', close);
                    overlay.addEventListener('click', close);
                    const disableEl = dialog.querySelector('#notice-disable');
                    disableEl?.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            try { window.localStorage.setItem(this._noticeStorageKey, '1'); } catch(err){}
                            this._unconnectedNoticeDisabled = true;
                        }
                    });
                    const countdownEl = dialog.querySelector('#countdown-val');
                    let remaining = this._noticeDismissMs;
                    const colorFor = (ms) => {
                        const s = Math.ceil(ms/1000);
                        if (s > 4) return '#22c55e';
                        if (s > 2) return '#f59e0b';
                        return '#ef4444';
                    };
                    let intervalId = setInterval(() => {
                        remaining -= 1000;
                        if (countdownEl) {
                            countdownEl.textContent = String(Math.max(0, Math.ceil(remaining/1000)));
                            countdownEl.style.color = colorFor(remaining);
                        }
                        if (remaining <= 0) close();
                    }, 1000);
                    setTimeout(close, this._noticeDismissMs);
                } catch(e) { console.warn('showUnconnectedNotice failed', e); }
            };

            return r;
        };
    }
});
