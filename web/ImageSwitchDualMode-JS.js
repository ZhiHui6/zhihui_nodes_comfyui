import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.ImageSwitchDualMode.DynamicInputs",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "ImageSwitchDualMode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "IMAGE";
            const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateInputs(value);
                    this.updateSelectOptions(value);
                    this.syncCommentWidgets(value);
                };
            }

            this.addWidget("button", "Update inputs", null, () => {
                const n = this.widgets.find(w => w.name === "inputcount").value;
                this.updateInputs(n);
                this.updateSelectOptions(n);
                this.syncCommentWidgets(n);
            });

            this.updateInputs = function (n) {
                if (!this.inputs) this.inputs = [];
                const isImage = (name) => /^image\d+$/.test(name);
                const current = this.inputs.filter(i => isImage(i.name)).length;
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
                        if (!exists) this.addInput(name, this._type, { optional: true });
                    }
                }
                for (const inp of this.inputs || []) {
                    if (isImage(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
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
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            if (inputcountWidget) {
                const v = inputcountWidget.value;
                this.updateInputs(v);
                this.updateSelectOptions(v);
                this.syncCommentWidgets(v);
            }

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

            return r;
        };
    }
});
