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
                    const rw = this.widgets?.find(w => w.name === `replace_${i}`);
                    const fw = this.widgets?.find(w => w.name === `find_${i}`);
                    const show = !enabled && i <= target;
                    applyWidgetVisibility(rw, show);
                    applyWidgetVisibility(fw, show);
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

                const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
                const isChinese = inputcountWidget && (inputcountWidget.label === "输入数量" || inputcountWidget.name === "输入数量");

                // 补齐 find_/replace_。不要删除或重排 widget——widgets 数组的顺序
                // 必须与 INPUT_TYPES 定义顺序一致，否则 configure 按位置恢复值会错位，
                // 导致 unify_replace 被写入文本值（truthy）而意外自动启用并丢失全部参数。
                for (let i = 1; i <= 10; i++) {
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