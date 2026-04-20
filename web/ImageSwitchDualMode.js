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
            };

            this.getConnectedImageInputs = function () {
                const connected = [];
                if (!this.inputs) return connected;
                for (const input of this.inputs) {
                    if (/^image\d+$/.test(input.name) && input.link != null && input.link !== undefined) {
                        const num = parseInt(input.name.replace("image", ""));
                        connected.push(num);
                    }
                }
                return connected.sort((a, b) => a - b);
            };

            this.updateSelectOptions = function (n) {
                const w = this.widgets?.find(w => w.name === "select_image");
                if (!w) return;
                const modeWidget = this.widgets?.find(w => w.name === "mode");
                const isManual = modeWidget?.value === "manual";
                let opts;
                if (isManual) {
                    const connected = this.getConnectedImageInputs();
                    opts = connected.length > 0 ? connected.map(String) : ["1"];
                } else {
                    opts = Array.from({ length: Math.max(1, parseInt(n) || 1) }, (_, i) => String(i + 1));
                }
                if (Array.isArray(w.options)) w.options = opts; else if (w.options && typeof w.options === "object") w.options.values = opts; else w.options = opts;
                const v = parseInt(w.value);
                if (!v || !opts.includes(String(v))) {
                    w.value = opts[0] || "1";
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
                const self = this;
                const handleInputChange = () => {
                    const n = parseInt(inputcountWidget.value) || 1;
                    self.updateInputs(n);
                    self.updateSelectOptions(n);
                    self.syncCommentWidgets(n);
                    self.saveNoteValues();
                };
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = function(value) {
                    if (originalCallback) originalCallback.call(this, value);
                    handleInputChange();
                };
                const originalMouseUp = inputcountWidget.mouseUp;
                inputcountWidget.mouseUp = function(e, pos, node) {
                    const result = originalMouseUp ? originalMouseUp.call(this, e, pos, node) : undefined;
                    handleInputChange();
                    return result;
                };
                const originalOnKeyDown = inputcountWidget.onKeyDown;
                inputcountWidget.onKeyDown = function(e) {
                    const result = originalOnKeyDown ? originalOnKeyDown.call(this, e) : undefined;
                    if (e.keyCode === 13) {
                        handleInputChange();
                    }
                    return result;
                };
                let saved = null;
                try { const raw = window.localStorage.getItem(this._noteStorageKey()); if (raw) saved = JSON.parse(raw); } catch(_){}
                if (!saved) saved = this.properties?.zh_imageswitch;
                if (saved && typeof saved.count !== "undefined") {
                    inputcountWidget.value = saved.count;
                }
                const v = parseInt(inputcountWidget.value) || 1;
                this.updateInputs(v);
                this.updateSelectOptions(v);
                this.syncCommentWidgets(v);
                this.restoreNoteValues();
            }

            const modeWidget = this.widgets?.find(w => w.name === "mode");
            if (modeWidget) {
                const self = this;
                const originalModeCallback = modeWidget.callback;
                modeWidget.callback = function(value) {
                    if (originalModeCallback) originalModeCallback.call(this, value);
                    const inputcountW = self.widgets?.find(w => w.name === "inputcount");
                    const n = parseInt(inputcountW?.value) || 1;
                    self.updateSelectOptions(n);
                };
            }

            const onConnectionsChange = this.onConnectionsChange;
            this.onConnectionsChange = function (type, slot, connected, link_info) {
                const result = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
                if (type === 1) {
                    const inputcountW = this.widgets?.find(w => w.name === "inputcount");
                    const n = parseInt(inputcountW?.value) || 1;
                    this.updateSelectOptions(n);
                }
                return result;
            };

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
                        if (inputcountWidget) inputcountWidget.value = saved.count;
                        const n = parseInt(saved.count) || 1;
                        this.updateInputs(n);
                        this.updateSelectOptions(n);
                        this.syncCommentWidgets(n);
                        this.restoreNoteValues();
                    }
                } catch (_) {}
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