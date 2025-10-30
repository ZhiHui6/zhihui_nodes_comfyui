import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Comfyui_Qwen3VL.MultiplePathsInput",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (!nodeData?.category?.startsWith("Comfyui_Qwen3VL")) {
            return;
        }
        
        switch (nodeData.name) {
            case "MultiplePathsInput":
                nodeType.prototype.onNodeCreated = function () {
                    this._type = "PATH";
                    this.inputs_offset = nodeData.name.includes("selective") ? 1 : 0;
                    
                    const inputcountWidget = this.widgets.find(w => w.name === "inputcount");
                    if (inputcountWidget) {
                        const originalCallback = inputcountWidget.callback;
                        inputcountWidget.callback = (value) => {
                            if (originalCallback) originalCallback.call(this, value);
                            this.updateInputs(value);
                        };
                    }
                    
                    this.addWidget("button", "Update inputs", null, () => {
                        const target_number_of_inputs = this.widgets.find(
                            (w) => w.name === "inputcount"
                        )["value"];
                        this.updateInputs(target_number_of_inputs);
                    });
                    
                    this.updateInputs = function(target_number_of_inputs) {
                        if (!this.inputs) {
                            this.inputs = [];
                        }
                        
                        const currentPathInputs = this.inputs.filter(input => input.name.startsWith("path_")).length;
                        
                        if (target_number_of_inputs === currentPathInputs) return;

                        if (target_number_of_inputs < currentPathInputs) {
                            for (let i = this.inputs.length - 1; i >= 0; i--) {
                                const input = this.inputs[i];
                                if (input.name.startsWith("path_")) {
                                    const pathNum = parseInt(input.name.split("_")[1]);
                                    if (pathNum > target_number_of_inputs) {
                                        this.removeInput(i);
                                    }
                                }
                            }
                        } else {
                            for (let i = currentPathInputs + 1; i <= target_number_of_inputs; i++) {
                                this.addInput(`path_${i}`, this._type);
                            }
                        }
                    };
                };
                break;
            case "VideoLoader":
                const onNodeCreated = nodeType.prototype.onNodeCreated;
                nodeType.prototype.onNodeCreated = function () {
                    const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                    
                    const videoWidget = this.widgets?.find(w => w.name === "file" && w.type === "combo");
                    if (videoWidget) {
                        const originalCallback = videoWidget.callback;
                        videoWidget.callback = function(value) {
                            if (originalCallback) {
                                originalCallback.call(this, value);
                            }
                            
                            setTimeout(() => {
                                const videoElements = document.querySelectorAll('video');
                                videoElements.forEach(video => {
                                    if (video.src && video.src.includes(value)) {
                                        video.style.objectFit = 'contain';
                                        video.style.maxWidth = '100%';
                                        video.style.maxHeight = '100%';
                                        video.style.width = 'auto';
                                        video.style.height = 'auto';
                                    }
                                });
                            }, 100);
                        };
                    }
                    
                    return r;
                };
                break;
        }
    },
    async setup() {
        const originalComputeVisibleNodes =
            LGraphCanvas.prototype.computeVisibleNodes;
        LGraphCanvas.prototype.computeVisibleNodes = function () {
            const visibleNodesSet = new Set(
                originalComputeVisibleNodes.apply(this, arguments)
            );
            for (const node of this.graph._nodes) {
                if (
                    (node.type === "SetNode" || node.type === "GetNode") &&
                    node.drawConnection
                ) {
                    visibleNodesSet.add(node);
                }
            }
            return Array.from(visibleNodesSet);
        };
    },
});
