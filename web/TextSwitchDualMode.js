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

            this._commentStorageKey = () => {
                try {
                    return `zh_textswitch_comments_${this.id || 'unknown'}`;
                } catch (_) { return 'zh_textswitch_comments_unknown'; }
            };

            this.saveCommentValues = function () {
                try {
                    const inputcountW = this.widgets?.find(w => w.name === "inputcount");
                    const target = Math.max(1, parseInt(inputcountW?.value) || 1);
                    const comments = [];
                    for (let i = 1; i <= target; i++) {
                        const w = this.widgets?.find(w => w.name === `text${i}_comment`);
                        comments.push(w ? (w.value ?? "") : "");
                    }
                    this.properties.zh_textswitch = { count: target, comments };
                    try {
                        window.localStorage.setItem(this._commentStorageKey(), JSON.stringify({ count: target, comments }));
                    } catch (_) {}
                } catch (_) {}
            };

            this.restoreCommentValues = function () {
                try {
                    let saved = null;
                    try {
                        const raw = window.localStorage.getItem(this._commentStorageKey());
                        if (raw) saved = JSON.parse(raw);
                    } catch (_) {}
                    if (!saved) saved = this.properties?.zh_textswitch;
                    if (!saved || !Array.isArray(saved.comments)) return;
                    const target = Math.max(1, parseInt(saved.count) || saved.comments.length || 1);
                    for (let i = 1; i <= target; i++) {
                        const w = this.widgets?.find(w => w.name === `text${i}_comment`);
                        if (w && saved.comments[i - 1] !== undefined) w.value = saved.comments[i - 1];
                    }
                } catch (_) {}
            };

            const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");

            this.updateInputs = function (n) {
                if (!this.inputs) this.inputs = [];
                const isTextPort = (name) => /^text\d+$/.test(name);
                const current = this.inputs.filter(i => isTextPort(i.name)).length;
                const newlyAdded = [];
                if (n === current) return;
                if (n < current) {
                    for (let i = this.inputs.length - 1; i >= 0; i--) {
                        const input = this.inputs[i];
                        if (isTextPort(input.name)) {
                            const num = parseInt(input.name.replace("text", ""));
                            if (num > n) this.removeInput(i);
                        }
                    }
                } else {
                    for (let i = current + 1; i <= n; i++) {
                        const name = `text${i}`;
                        const exists = this.inputs.some(inp => inp.name === name);
                        if (!exists) { this.addInput(name, this._type, { optional: true }); newlyAdded.push(name); }
                    }
                }
                for (const inp of this.inputs || []) {
                    if (isTextPort(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            this.getConnectedTextInputs = function () {
                const connected = [];
                if (!this.inputs) return connected;
                for (const input of this.inputs) {
                    if (/^text\d+$/.test(input.name) && input.link != null && input.link !== undefined) {
                        const num = parseInt(input.name.replace("text", ""));
                        connected.push(num);
                    }
                }
                return connected.sort((a, b) => a - b);
            };

            this.updateSelectTextOptions = function (n) {
                const w = this.widgets?.find(w => w.name === "select_text");
                if (!w) return;
                const modeWidget = this.widgets?.find(w => w.name === "mode");
                const isManual = modeWidget?.value === "manual";
                let opts;
                if (isManual) {
                    const connected = this.getConnectedTextInputs();
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
                        if (w) {
                            const orig = w.callback;
                            w.callback = (val) => { if (orig) orig.call(this, val); this.saveCommentValues(); };
                        }
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
                this.restoreCommentValues();
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            if (inputcountWidget) {
                const saved = this.properties?.zh_textswitch;
                if (saved && typeof saved.count !== "undefined") {
                    inputcountWidget.value = String(saved.count);
                }
                const self = this;
                const handleInputChange = () => {
                    const n = parseInt(inputcountWidget.value) || 1;
                    self.updateInputs(n);
                    self.updateSelectTextOptions(n);
                    self.syncCommentWidgets(n);
                    self.saveCommentValues();
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
                const v = parseInt(inputcountWidget.value) || 1;
                this.updateInputs(v);
                this.updateSelectTextOptions(v);
                this.syncCommentWidgets(v);
                this.restoreCommentValues();
            }

            const modeWidget = this.widgets?.find(w => w.name === "mode");
            if (modeWidget) {
                const self = this;
                const originalModeCallback = modeWidget.callback;
                modeWidget.callback = function(value) {
                    if (originalModeCallback) originalModeCallback.call(this, value);
                    const inputcountW = self.widgets?.find(w => w.name === "inputcount");
                    const n = parseInt(inputcountW?.value) || 1;
                    self.updateSelectTextOptions(n);
                };
            }

            const onConnectionsChange = this.onConnectionsChange;
            this.onConnectionsChange = function (type, slot, connected, link_info) {
                const result = onConnectionsChange ? onConnectionsChange.apply(this, arguments) : undefined;
                if (type === 1) {
                    const inputcountW = this.widgets?.find(w => w.name === "inputcount");
                    const n = parseInt(inputcountW?.value) || 1;
                    this.updateSelectTextOptions(n);
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
                    try { const raw = window.localStorage.getItem(this._commentStorageKey()); if (raw) saved = JSON.parse(raw); } catch(_){}
                    if (!saved) saved = this.properties?.zh_textswitch;
                    if (saved && typeof saved.count !== "undefined") {
                        const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
                        if (inputcountWidget) inputcountWidget.value = String(saved.count);
                        const n = parseInt(saved.count) || 1;
                        this.updateInputs(n);
                        this.updateSelectTextOptions(n);
                        this.syncCommentWidgets(n);
                        this.restoreCommentValues();
                    }
                } catch (_) {}
                return r3;
            };

            const onSerialize = nodeType.prototype.onSerialize;
            nodeType.prototype.onSerialize = function (o) {
                try { this.saveCommentValues(); } catch(_){}
                return onSerialize ? onSerialize.apply(this, arguments) : undefined;
            };

            return r;
        };
    }
});
