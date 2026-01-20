import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.ImageSwitchDualMode.DynamicInputs",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "ImageSwitchDualMode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "IMAGE";
            this.properties = this.properties || {};
            const nodeName = nodeData?.name || "ImageSwitchDualMode";
            const today = new Date().toISOString().slice(0, 10);
            this._noticeStorageKey = `zhihui_nodes_unconnected_notice_disabled_${nodeName}_${today}`;
            this._unconnectedNoticeDisabled = !!window.localStorage.getItem(this._noticeStorageKey);
            this._noticeOpen = false;
            this._noticeDismissMs = 12000;

            this._noteStorageKey = () => {
                try { return `zh_imageswitch_notes_${this.id || 'unknown'}`; } catch(_) { return 'zh_imageswitch_notes_unknown'; }
            };

            this.saveNoteValues = function () {
                try {
                    const inputcountW = this.widgets?.find(w => w.name === "inputcount");
                    const target = Math.max(1, parseInt(inputcountW?.value) || 1);
                    const notes = [];
                    for (let i = 1; i <= target; i++) {
                        const w = this.widgets?.find(w => w.name === `image${i}_note`);
                        notes.push(w ? (w.value ?? "") : "");
                    }
                    this.properties.zh_imageswitch = { count: target, notes };
                    try { window.localStorage.setItem(this._noteStorageKey(), JSON.stringify({ count: target, notes })); } catch(_){}
                } catch(_){}
            };

            this.restoreNoteValues = function () {
                try {
                    let saved = null;
                    try { const raw = window.localStorage.getItem(this._noteStorageKey()); if (raw) saved = JSON.parse(raw); } catch(_){}
                    if (!saved) saved = this.properties?.zh_imageswitch;
                    if (!saved || !Array.isArray(saved.notes)) return;
                    const target = Math.max(1, parseInt(saved.count) || saved.notes.length || 1);
                    for (let i = 1; i <= target; i++) {
                        const w = this.widgets?.find(w => w.name === `image${i}_note`);
                        if (w && saved.notes[i - 1] !== undefined) w.value = saved.notes[i - 1];
                    }
                } catch(_){}
            };
            const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const saved = this.properties?.zh_imageswitch;
                if (saved && typeof saved.count !== "undefined") {
                    inputcountWidget.value = String(saved.count);
                }
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateInputs(value);
                    this.updateSelectOptions(value);
                    this.syncCommentWidgets(value);
                    this.saveNoteValues();
                };
            }

            this.addWidget("button", "Update inputs", null, () => {
                const n = this.widgets.find(w => w.name === "inputcount").value;
                this.updateInputs(n);
                this.updateSelectOptions(n);
                this.syncCommentWidgets(n);
                this.saveNoteValues();
            });

            this.updateInputs = function (n) {
                if (!this.inputs) this.inputs = [];
                const isImage = (name) => /^image\d+$/.test(name);
                const current = this.inputs.filter(i => isImage(i.name)).length;
                const newlyAdded = [];
                if (n === current) return;
                if (n < current) {
                    for (let i = this.inputs.length - 1; i >= 0; i--) {
                        const input = this.inputs[i];
                        if (isImage(input.name)) {
                            const num = parseInt(input.name.replace("image", ""));
                            if (num > n) this.removeInput(i);
                        }
                    }
                } else {
                    for (let i = current + 1; i <= n; i++) {
                        const name = `image${i}`;
                        const exists = this.inputs.some(inp => inp.name === name);
                        if (!exists) { this.addInput(name, this._type, { optional: true }); newlyAdded.push(name); }
                    }
                }
                for (const inp of this.inputs || []) {
                    if (isImage(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);

                // 检查所有未连接端口（而非仅新增端口）
                const allUnconnected = (this.inputs || [])
                    .filter(i => isImage(i.name) && (i.link == null || i.link === undefined))
                    .map(i => i.name);
                if (allUnconnected.length) this.showUnconnectedNotice(allUnconnected, "图像端口");
            };

            this.updateSelectOptions = function (n) {
                const w = this.widgets?.find(w => w.name === "select_image");
                if (!w) return;
                const opts = Array.from({ length: Math.max(1, parseInt(n) || 1) }, (_, i) => String(i + 1));
                if (Array.isArray(w.options)) w.options = opts; else if (w.options && typeof w.options === "object") w.options.values = opts; else w.options = opts;
                const v = parseInt(w.value);
                w.value = !v || v < 1 || v > opts.length ? "1" : String(v);
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            this.repositionSelectImage = function(currentMode) {
                const widgets = this.widgets || [];
                const selIdx = widgets.findIndex(w => w && w.name === "select_image");
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

            this.syncCommentWidgets = function (n) {
                const target = Math.max(1, parseInt(n) || 1);
                const isNote = (name) => /^image\d+_note$/.test(name);
                for (let i = (this.widgets?.length || 0) - 1; i >= 0; i--) {
                    const w = this.widgets[i];
                    if (w && isNote(w.name)) {
                        const idx = parseInt(w.name.replace("image", "").replace("_note", ""));
                        if (idx > target) {
                            w.onRemove?.();
                            this.widgets.splice(i, 1);
                        }
                    }
                }
                for (let i = 1; i <= target; i++) {
                    const name = `image${i}_note`;
                    let w = this.widgets?.find(w => w.name === name);
                    if (!w) {
                        w = this.addWidget("text", name, "");
                        if (w) w.serialize = true;
                        if (w) {
                            const orig = w.callback;
                            w.callback = (val) => { if (orig) orig.call(this, val); this.saveNoteValues(); };
                        }
                    }
                }
                const posAfterInput = (this.widgets?.findIndex(w => w.name === "inputcount") ?? -1) + 1;
                if (posAfterInput > 0) {
                    const others = [];
                    const notes = [];
                    for (const w of this.widgets || []) {
                        if (isNote(w.name)) notes.push(w); else others.push(w);
                    }
                    this.widgets.length = 0;
                    const head = others.slice(0, posAfterInput);
                    const tail = others.slice(posAfterInput);
                    this.widgets.push(...head, ...notes, ...tail);
                }
                this.restoreNoteValues();
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            if (inputcountWidget) {
                const v = inputcountWidget.value;
                this.updateInputs(v);
                this.updateSelectOptions(v);
                this.syncCommentWidgets(v);
                this.restoreNoteValues();
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
                        <div style="text-align:center;margin-top:8px;font-size:12px;">此窗口将自动在 <span id=\"countdown-val\" style=\"font-weight:600;color:#22c55e;\">${(this._noticeDismissMs/1000)|0}</span> 秒后关闭</div>`;
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

            const modeWidget = this.widgets?.find(w => w.name === "mode");
            const selectWidget = this.widgets?.find(w => w.name === "select_image");
            if (modeWidget && selectWidget) {
                const originalModeCallback = modeWidget.callback;
                modeWidget.callback = (value) => {
                    if (originalModeCallback) originalModeCallback.call(this, value);
                    this.repositionSelectImage(modeWidget.value);
                };
                this.repositionSelectImage(modeWidget.value);
            }

            const configure = nodeType.prototype.configure;
            nodeType.prototype.configure = function () {
                const r2 = configure ? configure.apply(this, arguments) : undefined;
                this.properties = this.properties || {};
                return r2;
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                const r3 = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                try {
                    let saved = null;
                    try { const raw = window.localStorage.getItem(this._noteStorageKey()); if (raw) saved = JSON.parse(raw); } catch(_){}
                    if (!saved) saved = this.properties?.zh_imageswitch;
                    if (saved && typeof saved.count !== "undefined") {
                        const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
                        if (inputcountWidget) inputcountWidget.value = String(saved.count);
                        const n = parseInt(saved.count) || 1;
                        this.updateInputs(n);
                        this.updateSelectOptions(n);
                        this.syncCommentWidgets(n);
                        this.restoreNoteValues();
                    }
                } catch(_){}
                return r3;
            };

            const onSerialize = nodeType.prototype.onSerialize;
            nodeType.prototype.onSerialize = function (o) {
                try { this.saveNoteValues(); } catch(_){}
                return onSerialize ? onSerialize.apply(this, arguments) : undefined;
            };

            return r;
        };
    }
});