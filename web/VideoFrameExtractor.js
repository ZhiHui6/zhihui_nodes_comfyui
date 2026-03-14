import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "VideoFrameExtractor",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "VideoFrameExtractor") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);

                const rangeModeWidget = this.widgets.find(w => w.name === "range_mode");
                const startFrameWidget = this.widgets.find(w => w.name === "start_frame");
                const endFrameWidget = this.widgets.find(w => w.name === "end_frame");
                const startTimeWidget = this.widgets.find(w => w.name === "start_time");
                const endTimeWidget = this.widgets.find(w => w.name === "end_time");
                const timeUnitWidget = this.widgets.find(w => w.name === "time_unit");

                if (rangeModeWidget && startFrameWidget && endFrameWidget && startTimeWidget && endTimeWidget) {
                    const updateRangeModeVisibility = () => {
                        const rangeMode = rangeModeWidget.value;
                        if (rangeMode === "by_frame") {
                            startFrameWidget.type = "number";
                            startFrameWidget.hidden = false;
                            endFrameWidget.type = "number";
                            endFrameWidget.hidden = false;
                            startTimeWidget.type = "hidden";
                            startTimeWidget.hidden = true;
                            endTimeWidget.type = "hidden";
                            endTimeWidget.hidden = true;
                            if (timeUnitWidget) {
                                timeUnitWidget.type = "hidden";
                                timeUnitWidget.hidden = true;
                            }
                        } else {
                            startFrameWidget.type = "hidden";
                            startFrameWidget.hidden = true;
                            endFrameWidget.type = "hidden";
                            endFrameWidget.hidden = true;
                            startTimeWidget.type = "number";
                            startTimeWidget.hidden = false;
                            endTimeWidget.type = "number";
                            endTimeWidget.hidden = false;
                            if (timeUnitWidget) {
                                timeUnitWidget.type = "combo";
                                timeUnitWidget.hidden = false;
                            }
                        }
                        updateSize(this);
                    };

                    const originalCallback = rangeModeWidget.callback;
                    rangeModeWidget.callback = function(value) {
                        const result = originalCallback?.apply(this, arguments);
                        updateRangeModeVisibility();
                        return result;
                    };

                    updateRangeModeVisibility();
                }

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