import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Zhi.AI.PromptExpander",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData?.name !== "PromptExpander") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

            const updateCustomPromptVisibility = () => {
                const writingStyleWidget = this.widgets?.find(w => w.name === "writing_style");
                const customPromptWidget = this.widgets?.find(w => w.name === "custom_system_prompt");
                
                if (!writingStyleWidget || !customPromptWidget) return;

                const show = writingStyleWidget.value === "Custom";
                customPromptWidget.hidden = !show;
                customPromptWidget.disabled = !show;
                
                if (customPromptWidget.options && typeof customPromptWidget.options === "object") {
                    customPromptWidget.options.hidden = !show;
                }
                if (customPromptWidget.inputEl) {
                    customPromptWidget.inputEl.disabled = !show;
                }

                if (typeof this.computeSize === "function") {
                    const currentSize = this.size;
                    const computedSize = this.computeSize();
                    if (currentSize && currentSize.length > 0) {
                        this.size = [currentSize[0], computedSize[1]];
                    } else {
                        this.size = computedSize;
                    }
                }
                app.graph.setDirtyCanvas(true, true);
            };

            const writingStyleWidget = this.widgets?.find(w => w.name === "writing_style");
            if (writingStyleWidget) {
                const originalCallback = writingStyleWidget.callback;
                writingStyleWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(this, value);
                    updateCustomPromptVisibility();
                };
            }

            updateCustomPromptVisibility();
        };
    }
});
