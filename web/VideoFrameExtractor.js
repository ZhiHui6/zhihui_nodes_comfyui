import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "VideoFrameExtractor",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "VideoFrameExtractor") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                
                const modeWidget = this.widgets.find(w => w.name === "mode");
                const maxFramesWidget = this.widgets.find(w => w.name === "max_frames");
                const intervalWidget = this.widgets.find(w => w.name === "interval");
                
                if (modeWidget && maxFramesWidget && intervalWidget) {
                    const updateModeVisibility = () => {
                        const mode = modeWidget.value;
                        if (mode === "extract_by_count") {
                            maxFramesWidget.type = "number";
                            maxFramesWidget.hidden = false;
                            intervalWidget.type = "hidden";
                            intervalWidget.hidden = true;
                        } else {
                            maxFramesWidget.type = "hidden";
                            maxFramesWidget.hidden = true;
                            intervalWidget.type = "number";
                            intervalWidget.hidden = false;
                        }
                        updateSize(this);
                    };
                    
                    const originalCallback = modeWidget.callback;
                    modeWidget.callback = function(value) {
                        const result = originalCallback?.apply(this, arguments);
                        updateModeVisibility();
                        return result;
                    };
                    
                    updateModeVisibility();
                }
                
                const enableOutputWidget = this.widgets.find(w => w.name === "enable_output");
                const outputPathWidget = this.widgets.find(w => w.name === "output_path");
                const filenamePrefixWidget = this.widgets.find(w => w.name === "filename_prefix");
                
                if (enableOutputWidget && outputPathWidget && filenamePrefixWidget) {
                    const updateOutputVisibility = () => {
                        const enabled = enableOutputWidget.value;
                        if (enabled) {
                            outputPathWidget.type = "string";
                            outputPathWidget.hidden = false;
                            filenamePrefixWidget.type = "string";
                            filenamePrefixWidget.hidden = false;
                        } else {
                            outputPathWidget.type = "hidden";
                            outputPathWidget.hidden = true;
                            filenamePrefixWidget.type = "hidden";
                            filenamePrefixWidget.hidden = true;
                        }
                        updateSize(this);
                    };
                    
                    const originalCallback = enableOutputWidget.callback;
                    enableOutputWidget.callback = function(value) {
                        const result = originalCallback?.apply(this, arguments);
                        updateOutputVisibility();
                        return result;
                    };
                    
                    updateOutputVisibility();
                }
                
                return r;
            };
        }
    },
});

function updateSize(node) {
    const currentWidth = node.size[0];
    const newSize = node.computeSize();
    node.setSize([currentWidth, newSize[1]]);
    app.graph.setDirtyCanvas(true, false);
}