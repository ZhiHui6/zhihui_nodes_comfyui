import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.PromptReplace",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "PromptReplace") return;

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

            const applyUnifyReplaceUI = () => {
                const unifyWidget = this.widgets?.find(w => w.name === "unify_replace");
                const unifiedReplaceWidget = this.widgets?.find(w => w.name === "unified_replace");
                const enabled = !!unifyWidget?.value;

                const isChinese = getIsChinese();
                if (unifyWidget) unifyWidget.label = isChinese ? "统一替换" : (unifyWidget.label || "Unified Replace");
                if (unifiedReplaceWidget) unifiedReplaceWidget.label = isChinese ? "统一替换内容" : (unifiedReplaceWidget.label || "Unified Replacement");

                applyWidgetVisibility(unifiedReplaceWidget, enabled);

                const target = parseInt(this.widgets?.find(w => w.name === "inputcount")?.value) || 0;
                for (let i = 1; i <= 10; i++) {
                    const w = this.widgets?.find(w => w.name === `replace_${i}`);
                    const show = !enabled && i <= target;
                    applyWidgetVisibility(w, show);
                }

                this.size = this.computeSize(this.size);
                app.graph.setDirtyCanvas(true, true);
            };

            const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
            if (inputcountWidget) {
                const originalCallback = inputcountWidget.callback;
                inputcountWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    this.updateWidgets(value);
                };
            }

            const unifyReplaceWidget = this.widgets?.find(w => w.name === "unify_replace");
            if (unifyReplaceWidget) {
                const originalCallback = unifyReplaceWidget.callback;
                unifyReplaceWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    applyUnifyReplaceUI();
                };
            }

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

                const currentPairs = this.widgets.filter(w => w.name && w.name.startsWith("find_")).length;

                if (target_number_of_inputs === currentPairs) return;

                if (target_number_of_inputs < currentPairs) {
                    for (let i = this.widgets.length - 1; i >= 0; i--) {
                        const widget = this.widgets[i];
                        if (widget.name && (widget.name.startsWith("find_") || widget.name.startsWith("replace_"))) {
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
                        const replaceName = `replace_${i}`;
                        
                        if (!this.widgets.find(w => w.name === findName)) {
                            const w = this.addWidget("text", findName, "", () => {}, {});
                            if (isChinese) w.label = `搜索_${i}`;
                        }
                        if (!this.widgets.find(w => w.name === replaceName)) {
                            const w = this.addWidget("text", replaceName, "", () => {}, {});
                            if (isChinese) w.label = `替换_${i}`;
                        }
                    }
                }

                this.widgets.sort((a, b) => {
                    if (a.name === "unify_replace") return -1;
                    if (b.name === "unify_replace") return 1;
                    if (a.name === "unified_replace") return -1;
                    if (b.name === "unified_replace") return 1;
                    if (a.type === "button") return 1;
                    if (b.type === "button") return -1;
                    if (a.name === "inputcount") return 1;
                    if (b.name === "inputcount") return -1;

                    const aIsFind = a.name.startsWith("find_");
                    const aIsReplace = a.name.startsWith("replace_");
                    const bIsFind = b.name.startsWith("find_");
                    const bIsReplace = b.name.startsWith("replace_");

                    if ((aIsFind || aIsReplace) && (bIsFind || bIsReplace)) {
                        const aIndex = parseInt(a.name.split("_")[1]);
                        const bIndex = parseInt(b.name.split("_")[1]);
                        if (aIndex !== bIndex) {
                            return aIndex - bIndex;
                        }

                        if (aIsFind && bIsReplace) return -1;
                        if (aIsReplace && bIsFind) return 1;
                    }
                    return 0;
                });

                this.onResize?.(this.size);
                this.setSize([this.size[0], 0]);
                applyUnifyReplaceUI();
            };

            if (inputcountWidget) {
                 this.updateWidgets(inputcountWidget.value);
            }

            applyUnifyReplaceUI();
        };
    }
});