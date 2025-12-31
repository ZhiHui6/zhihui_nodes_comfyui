import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.TextMergerNode",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "TextMergerNode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            this._type = "STRING";

            const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateInputs(value);
                };
            }

            this.addWidget("button", "更新输入端口·Update inputs", null, () => {
                const target_number_of_inputs = this.widgets.find(
                    (w) => w.name === "inputcount"
                )["value"];
                this.updateInputs(target_number_of_inputs);
            });

            this.updateInputs = function(target_number_of_inputs) {
                if (!this.inputs) {
                    this.inputs = [];
                }

                const currentTextInputs = this.inputs.filter(input => input.name.startsWith("text_")).length;

                if (target_number_of_inputs === currentTextInputs) return;

                if (target_number_of_inputs < currentTextInputs) {
                    for (let i = this.inputs.length - 1; i >= 0; i--) {
                        const input = this.inputs[i];
                        if (input.name.startsWith("text_")) {
                            const textNum = parseInt(input.name.split("_")[1]);
                            if (textNum > target_number_of_inputs) {
                                this.removeInput(i);
                            }
                        }
                    }
                    for (let i = this.widgets.length - 1; i >= 0; i--) {
                        const widget = this.widgets[i];
                        if (widget.name && widget.name.startsWith("text_")) {
                            const textNum = parseInt(widget.name.split("_")[1]);
                            if (textNum > target_number_of_inputs) {
                                this.widgets.splice(i, 1);
                            }
                        }
                    }
                } else {
                    for (let i = 1; i <= target_number_of_inputs; i++) {
                        const inputName = `text_${i}`;
                        if (!this.inputs.find(inp => inp.name === inputName)) {
                            this.addInput(inputName, this._type);
                        }
                    }
                }
            };
        };
    }
});
