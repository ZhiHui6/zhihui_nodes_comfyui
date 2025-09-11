import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { api } from "../../../scripts/api.js";

const postContinue = (nodeId, editedText) => {
    return fetch("/text_editor_continue/continue/" + nodeId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edited_text: editedText })
    });
};

const fetchState = async (nodeId) => {
    try {
        const res = await fetch(`/text_editor_continue/state/${nodeId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (_) {
        return null;
    }
};

app.registerExtension({
    name: "TextEditorWithContinue",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TextEditorWithContinue") {
            function populateDisplayText(text) {
                if (this.displayWidgets) {
                    for (let i = 0; i < this.displayWidgets.length; i++) {
                        const widget = this.displayWidgets[i];
                        if (this.widgets) {
                            const index = this.widgets.indexOf(widget);
                            if (index > -1) {
                                this.widgets.splice(index, 1);
                            }
                        }
                        if (widget.inputEl && widget.inputEl.parentNode) {
                            widget.inputEl.parentNode.removeChild(widget.inputEl);
                        }
                        widget.onRemove?.();
                    }
                    this.displayWidgets = [];
                }

                if (!this.displayWidgets) {
                    this.displayWidgets = [];
                }

                const v = [...text];
                if (!v[0]) {
                    v.shift();
                }
                
                let editableIndex = -1;
                if (this.widgets) {
                    for (let i = 0; i < this.widgets.length; i++) {
                        if (this.widgets[i].name === "editable_text") {
                            editableIndex = i;
                            break;
                        }
                    }
                }

                for (let list of v) {
                    if (!(list instanceof Array)) list = [list];
                    for (const l of list) {
                        const w = ComfyWidgets["STRING"](this, "display_text_" + (this.displayWidgets?.length ?? 0), ["STRING", { multiline: true }], app).widget;
                        w.inputEl.readOnly = true;
                        w.inputEl.style.opacity = 1.0;
                        w.inputEl.style.backgroundColor = "#000000";
                        w.inputEl.style.color = "#FFFFFF";
                        w.value = l;
                        
                        if (editableIndex >= 0 && this.widgets) {
                            const widgetIndex = this.widgets.indexOf(w);
                            if (widgetIndex > -1) {
                                this.widgets.splice(widgetIndex, 1);
                            }
                            this.widgets.splice(editableIndex, 0, w);
                            editableIndex++;
                        }
                        
                        this.displayWidgets.push(w);
                    }
                }

                this.addEditSectionTitle(editableIndex);

                if (this.editableWidget && v.length > 0) {
                    const newText = v[0] instanceof Array ? v[0][0] : v[0];
                    if (this.editableWidget.value === "" || this.editableWidget.value === this.lastDisplayText) {
                        this.editableWidget.value = newText;
                        this.lastDisplayText = newText;
                    }
                }

                requestAnimationFrame(() => {
                    const sz = this.computeSize();
                    if (sz[0] < this.size[0]) {
                        sz[0] = this.size[0];
                    }
                    if (sz[1] < this.size[1]) {
                        sz[1] = this.size[1];
                    }
                    this.onResize?.(sz);
                    app.graph.setDirtyCanvas(true, false);
                });
            }

            function addEditSectionTitle(insertIndex) {
                if (this.editSectionTitle) {
                    const index = this.widgets.indexOf(this.editSectionTitle);
                    if (index > -1) {
                        this.widgets.splice(index, 1);
                    }
                }

                const titleWidget = this.addWidget("text", "Edit Section", "Edit Section");
                titleWidget.inputEl.readOnly = true;
                titleWidget.inputEl.style.fontWeight = "bold";
                titleWidget.inputEl.style.fontSize = "14px";
                titleWidget.inputEl.style.backgroundColor = "#2a2a2a";
                titleWidget.inputEl.style.color = "#ffffff";
                titleWidget.inputEl.style.border = "1px solid #555";
                titleWidget.inputEl.style.textAlign = "center";
                titleWidget.inputEl.style.padding = "5px";
                titleWidget.serialize = false;
                
                if (insertIndex >= 0 && this.widgets) {
                    const widgetIndex = this.widgets.indexOf(titleWidget);
                    if (widgetIndex > -1) {
                        this.widgets.splice(widgetIndex, 1);
                    }
                    this.widgets.splice(insertIndex, 0, titleWidget);
                }
                
                this.editSectionTitle = titleWidget;
            }

            function setupEditableWidget() {
                if (this.widgets) {
                    for (let widget of this.widgets) {
                        if (widget.name === "editable_text") {
                            this.editableWidget = widget;
                            widget.inputEl.placeholder = "在此编辑文本，然后点击继续运行按钮...\nEdit text here, then click the continue button to run...";
                            widget.inputEl.style.border = "2px solid #4CAF50";
                            widget.inputEl.style.borderRadius = "4px";
                            break;
                        }
                    }
                }
            }

            function addControlButtons() {
                if (this.continueButton) {
                    const index = this.widgets.indexOf(this.continueButton);
                    if (index > -1) {
                        this.widgets.splice(index, 1);
                    }
                }
                if (this.syncButton) {
                    const index = this.widgets.indexOf(this.syncButton);
                    if (index > -1) {
                        this.widgets.splice(index, 1);
                    }
                }

                this.syncButton = this.addWidget("button", "🔄 同步文本 / Sync Text", "SYNC", async () => {
                    const data = await fetchState(this.id);
                    if (data && (data.edited_text !== undefined)) {
                        setupEditableWidget.call(this);
                        const t = data.edited_text ?? "";
                        if (this.editableWidget) {
                            this.editableWidget.value = t;
                            this.lastDisplayText = t;
                        }
                        populateDisplayText.call(this, [t]);
                        app.graph.setDirtyCanvas(true, false);
                    }
                });
                this.syncButton.serialize = false;

                this.continueButton = this.addWidget("button", "▶️ 继续运行 / Continue", "CONTINUE", () => {
                    const editedText = this.editableWidget ? this.editableWidget.value : "";
                    postContinue(this.id, editedText);
                });
                this.continueButton.serialize = false;
            }

            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                onExecuted?.apply(this, arguments);
                if (message.text) {
                    populateDisplayText.call(this, message.text);
                }
                setupEditableWidget.call(this);
                addControlButtons.call(this);
            };

            const VALUES = Symbol();
            const configure = nodeType.prototype.configure;
            nodeType.prototype.configure = function () {
                this[VALUES] = arguments[0]?.widgets_values;
                return configure?.apply(this, arguments);
            };

            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                onConfigure?.apply(this, arguments);
                const widgets_values = this[VALUES];
                if (widgets_values?.length) {
                    requestAnimationFrame(() => {
                        if (widgets_values[0]) {
                            populateDisplayText.call(this, [widgets_values[0]]);
                        }
                        setupEditableWidget.call(this);
                        if (this.editableWidget && widgets_values[1] !== undefined) {
                            this.editableWidget.value = widgets_values[1];
                        }
                        addControlButtons.call(this);
                    });
                }
            };

            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);
                setupEditableWidget.call(this);
                addControlButtons.call(this);
            };
        }
    },
    setup() {
    },
});