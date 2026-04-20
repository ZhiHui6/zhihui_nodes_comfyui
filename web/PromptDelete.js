import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.PromptDelete",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "PromptDelete") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            const applyWidgetVisibility = (widget, show) => {
                if (!widget) return;
                widget.hidden = !show;
                widget.disabled = !show;
                if (widget.options && typeof widget.options === "object") {
                    widget.options.hidden = !show;
                }
                if (widget.inputEl) {
                    widget.inputEl.disabled = !show;
                }
            };

            const getIsChinese = () => {
                const inputcountWidget = this.widgets?.find(w => w.name === "inputcount");
                return inputcountWidget && (inputcountWidget.label === "输入数量" || inputcountWidget.name === "输入数量");
            };

            const updateButton = this.addWidget("button", "更新输入端口·Update inputs", null, () => {
                const target_number_of_inputs = this.widgets.find(
                    (w) => w.name === "inputcount"
                )["value"];
                this.updateWidgets(target_number_of_inputs);
            });

            this.updateWidgets = function(target_number_of_inputs) {
                if (!this.widgets) {
                    this.widgets = [];
                }

                const currentFinds = this.widgets.filter(w => w.name && w.name.startsWith("find_")).length;

                if (target_number_of_inputs === currentFinds) return;

                if (target_number_of_inputs < currentFinds) {
                    for (let i = this.widgets.length - 1; i >= 0; i--) {
                        const widget = this.widgets[i];
                        if (widget.name && widget.name.startsWith("find_")) {
                            const parts = widget.name.split("_");
                            const index = parseInt(parts[1]);
                            if (index > target_number_of_inputs) {
                                this.widgets.splice(i, 1);
                            }
                        }
                    }
                } else {
                    const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
                    const isChinese = inputcountWidget && (inputcountWidget.label === "输入数量" || inputcountWidget.name === "输入数量");

                    for (let i = 1; i <= target_number_of_inputs; i++) {
                        const findName = `find_${i}`;
                        
                        if (!this.widgets.find(w => w.name === findName)) {
                            const w = this.addWidget("text", findName, "", () => {}, {});
                            if (isChinese) w.label = `搜索_${i}`;
                        }
                    }
                }

                this.widgets.sort((a, b) => {
                    if (a.name === "auto_format") return -1;
                    if (b.name === "auto_format") return 1;
                    if (a.type === "button") return 1;
                    if (b.type === "button") return -1;
                    if (a.name === "inputcount") return 1;
                    if (b.name === "inputcount") return -1;

                    const aIsFind = a.name.startsWith("find_");
                    const bIsFind = b.name.startsWith("find_");

                    if (aIsFind && bIsFind) {
                        const aIndex = parseInt(a.name.split("_")[1]);
                        const bIndex = parseInt(b.name.split("_")[1]);
                        return aIndex - bIndex;
                    }
                    return 0;
                });

                this.onResize?.(this.size);
                this.setSize([this.size[0], 0]);
            };

            const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateWidgets(value);
                };
                 this.updateWidgets(inputcountWidget.value);
            }
        };
    }
});