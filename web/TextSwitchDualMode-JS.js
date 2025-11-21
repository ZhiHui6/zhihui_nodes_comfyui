import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.TextSwitchDualMode.DynamicInputs",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "TextSwitchDualMode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "STRING";
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
                        if (!exists) this.addInput(name, this._type || "STRING", { optional: true });
                    }
                }
                // Ensure all dynamic text inputs are optional
                for (const inp of this.inputs || []) {
                    if (/^text\d+$/.test(inp.name)) inp.optional = true;
                }
                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
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

            return r;
        };
    }
});