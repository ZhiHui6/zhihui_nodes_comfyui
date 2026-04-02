import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "VideoFrameExtractor",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "VideoFrameExtractor") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);

                const extractModeWidget = this.widgets.find(w => w.name === "extract_mode");
                
                const numFramesWidget = this.widgets.find(w => w.name === "num_frames");
                const frameIntervalValueWidget = this.widgets.find(w => w.name === "frame_interval_value");
                const timeIntervalValueWidget = this.widgets.find(w => w.name === "time_interval_value");
                const timeUnitWidget = this.widgets.find(w => w.name === "time_unit");
                const startFrameWidget = this.widgets.find(w => w.name === "start_frame");
                const endFrameWidget = this.widgets.find(w => w.name === "end_frame");
                const startTimeWidget = this.widgets.find(w => w.name === "start_time");
                const endTimeWidget = this.widgets.find(w => w.name === "end_time");
                const maxOutputFramesWidget = this.widgets.find(w => w.name === "max_output_frames");

                if (extractModeWidget) {
                    const updateVisibility = () => {
                        const mode = extractModeWidget.value;
                        const isTimeMode = mode === "time_count" || mode === "time_interval";
                        const isCountMode = mode === "frame_count" || mode === "time_count";

                        if (isTimeMode) {
                            startFrameWidget.type = "hidden";
                            startFrameWidget.hidden = true;
                            endFrameWidget.type = "hidden";
                            endFrameWidget.hidden = true;
                            startTimeWidget.type = "number";
                            startTimeWidget.hidden = false;
                            endTimeWidget.type = "number";
                            endTimeWidget.hidden = false;
                            timeUnitWidget.type = "combo";
                            timeUnitWidget.hidden = false;
                        } else {
                            startFrameWidget.type = "number";
                            startFrameWidget.hidden = false;
                            endFrameWidget.type = "number";
                            endFrameWidget.hidden = false;
                            startTimeWidget.type = "hidden";
                            startTimeWidget.hidden = true;
                            endTimeWidget.type = "hidden";
                            endTimeWidget.hidden = true;
                            timeUnitWidget.type = "hidden";
                            timeUnitWidget.hidden = true;
                        }

                        if (isCountMode) {
                            numFramesWidget.type = "number";
                            numFramesWidget.hidden = false;
                            frameIntervalValueWidget.type = "hidden";
                            frameIntervalValueWidget.hidden = true;
                            timeIntervalValueWidget.type = "hidden";
                            timeIntervalValueWidget.hidden = true;
                            maxOutputFramesWidget.type = "hidden";
                            maxOutputFramesWidget.hidden = true;
                        } else {
                            numFramesWidget.type = "hidden";
                            numFramesWidget.hidden = true;
                            if (isTimeMode) {
                                frameIntervalValueWidget.type = "hidden";
                                frameIntervalValueWidget.hidden = true;
                                timeIntervalValueWidget.type = "number";
                                timeIntervalValueWidget.hidden = false;
                            } else {
                                frameIntervalValueWidget.type = "number";
                                frameIntervalValueWidget.hidden = false;
                                timeIntervalValueWidget.type = "hidden";
                                timeIntervalValueWidget.hidden = true;
                            }
                            maxOutputFramesWidget.type = "number";
                            maxOutputFramesWidget.hidden = false;
                        }

                        updateSize(this);
                    };

                    const originalCallback = extractModeWidget.callback;
                    extractModeWidget.callback = function(value) {
                        const result = originalCallback?.apply(this, arguments);
                        updateVisibility();
                        return result;
                    };

                    updateVisibility();
                }

                const customPathWidget = this.widgets.find(w => w.name === "custom_path");
                const outputDirectoryWidget = this.widgets.find(w => w.name === "output_directory");
                const filenamePrefixWidget = this.widgets.find(w => w.name === "filename_prefix");

                if (customPathWidget && outputDirectoryWidget && filenamePrefixWidget) {
                    const updateOutputVisibility = () => {
                        const enabled = customPathWidget.value;
                        if (enabled) {
                            outputDirectoryWidget.type = "string";
                            outputDirectoryWidget.hidden = false;
                            filenamePrefixWidget.type = "string";
                            filenamePrefixWidget.hidden = false;
                        } else {
                            outputDirectoryWidget.type = "hidden";
                            outputDirectoryWidget.hidden = true;
                            filenamePrefixWidget.type = "hidden";
                            filenamePrefixWidget.hidden = true;
                        }
                        updateSize(this);
                    };

                    const originalCallback = customPathWidget.callback;
                    customPathWidget.callback = function(value) {
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
