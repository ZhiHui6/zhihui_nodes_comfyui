import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.LatentSwitchDualMode.DynamicInputs",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "LatentSwitchDualMode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "LATENT";
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
                const isLatent = (name) => /^Latent_\d+$/.test(name);
                const current = this.inputs.filter(i => isLatent(i.name)).length;
                if (n === current) return;
                if (n < current) {
                    for (let i = this.inputs.length - 1; i >= 0; i--) {
                        const input = this.inputs[i];
                        if (isLatent(input.name)) {
                            const num = parseInt(input.name.replace("Latent_", ""));
                            if (num > n) this.removeInput(i);
                        }
                    }
                } else {
                    for (let i = current + 1; i <= n; i++) {
                        const name = `Latent_${i}`;
                        const exists = this.inputs.some(inp => inp.name === name);
                        if (!exists) this.addInput(name, this._type, { optional: true });
                    }
                }
                for (const inp of this.inputs || []) {
                    if (isLatent(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            this.updateSelectOptions = function (n) {
                const w = this.widgets?.find(w => w.name === "select_channel");
                if (!w) return;
                const opts = Array.from({ length: Math.max(1, parseInt(n) || 1) }, (_, i) => String(i + 1));
                if (Array.isArray(w.options)) w.options = opts; else if (w.options && typeof w.options === "object") w.options.values = opts; else w.options = opts;
                const v = parseInt(w.value);
                w.value = !v || v < 1 || v > opts.length ? "1" : String(v);
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            this.syncCommentWidgets = function (n) {
                const target = Math.max(1, parseInt(n) || 1);
                const isComment = (name) => /^Latent_\d+_comment$/.test(name);
                for (let i = (this.widgets?.length || 0) - 1; i >= 0; i--) {
                    const w = this.widgets[i];
                    if (w && isComment(w.name)) {
                        const idx = parseInt(w.name.replace("Latent_", "").replace("_comment", ""));
                        if (idx > target) {
                            w.onRemove?.();
                            this.widgets.splice(i, 1);
                        }
                    }
                }
                for (let i = 1; i <= target; i++) {
                    const name = `Latent_${i}_comment`;
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
                this.updateSelectOptions(v);
                this.syncCommentWidgets(v);
            }

            return r;
        };
    }
});