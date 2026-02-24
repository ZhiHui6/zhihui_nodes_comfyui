import { app } from "../../../scripts/app.js";

app.registerExtension({
	name: "ShowAny",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "ShowAny") {
			const translations = {
				"Preview Mode:": "Preview Mode / 预览模式：",
				"Standard": "Standard / 标准模式",
				"Debug": "Debug / 排错模式"
			};

			function t(key) {
				return translations[key] || key;
			}

			function toPlainText(value, isDebugMode = false) {
				const parts = [];
				
				function fixEncoding(str) {
					if (!isDebugMode || typeof str !== 'string') {
						return str;
					}
					try {
						if (/[\u0080-\u00FF]/.test(str) && !/[\u4E00-\u9FFF]/.test(str)) {
							const bytes = new Uint8Array(str.length);
							for (let i = 0; i < str.length; i++) {
								bytes[i] = str.charCodeAt(i) & 0xFF;
							}
							const decoder = new TextDecoder('utf-8');
							return decoder.decode(bytes);
						}
					} catch (e) {}
					return str;
				}
				
				const pushValue = (v) => {
					if (Array.isArray(v)) {
						v.forEach(item => pushValue(item));
					} else if (v === null || v === undefined) {
						parts.push("");
					} else {
						parts.push(fixEncoding(String(v)));
					}
				};
				pushValue(value);
				return parts.join("\n");
			}

			function ensurePreviewUI(node) {
				if (node.__showAnyPreview) {
					return;
				}

				const host = document.createElement("div");
				host.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%;height:100%;box-sizing:border-box;";

				const textarea = document.createElement("textarea");
				textarea.readOnly = true;
				textarea.style.cssText = "width:100%;resize:none;background:#1f2430;color:#e5e7eb;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px;font-size:12px;line-height:1.5;box-sizing:border-box;";

				const footer = document.createElement("div");
				footer.style.cssText = "display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;";

				const modeLabel = document.createElement("span");
				modeLabel.textContent = t("Preview Mode:");
				modeLabel.style.cssText = "margin-right:4px;";

				const modeWrap = document.createElement("div");
				modeWrap.style.cssText = "display:flex;align-items:center;gap:10px;";

				const mkRadio = (value, text) => {
					const label = document.createElement("label");
					label.style.cssText = "display:flex;align-items:center;gap:4px;";
					const input = document.createElement("input");
					input.type = "radio";
					input.name = `showany-mode-${node.id || Math.random().toString(36).slice(2)}`;
					input.value = value;
					const span = document.createElement("span");
					span.textContent = text;
					label.appendChild(input);
					label.appendChild(span);
					return { label, input };
				};

				const radioStandard = mkRadio("Standard", t("Standard"));
				const radioDebug = mkRadio("Debug", t("Debug"));

				modeWrap.appendChild(radioStandard.label);
				modeWrap.appendChild(radioDebug.label);

				footer.appendChild(modeLabel);
				footer.appendChild(modeWrap);

				host.appendChild(textarea);
				host.appendChild(footer);

				const domWidget = node.addDOMWidget("showany_preview", "div", host, {});
				domWidget.serialize = false;

				node.__showAnyPreview = {
					host,
					textarea,
					radioStandard,
					radioDebug
				};

				if (!node.properties) {
					node.properties = {};
				}

				const savedMode = node.properties.showAnyMode || node.properties.showtextMode;
				const initialMode = savedMode === "Debug" ? "Debug" : "Standard";
				node.__showAnyPreview.radioStandard.input.checked = initialMode === "Standard";
				node.__showAnyPreview.radioDebug.input.checked = initialMode === "Debug";

				const onModeChange = () => {
					const mode = node.__showAnyPreview.radioDebug.input.checked ? "Debug" : "Standard";
					node.properties.showAnyMode = mode;
					updatePreview(node, node.__showAnyRawData);
				};
				node.__showAnyPreview.radioStandard.input.addEventListener("change", onModeChange);
				node.__showAnyPreview.radioDebug.input.addEventListener("change", onModeChange);



				const updateHeight = () => {
					const available = Math.max(120, node.size[1] - 70);
					textarea.style.height = `${available}px`;
				};

				const onResize = node.onResize;
				node.onResize = function(size) {
					const r = onResize?.apply(this, arguments);
					updateHeight();
					return r;
				};

				if (!node.size || node.size.length < 2) {
					node.size = [520, 300];
				} else {
					node.size = [Math.max(node.size[0], 520), Math.max(node.size[1], 300)];
				}

				updateHeight();
			}

			function updatePreview(node, data) {
				ensurePreviewUI(node);
				node.__showAnyRawData = data;
				const isDebugMode = node.properties.showAnyMode === "Debug";
				const text = toPlainText(data, isDebugMode);
				node.__showAnyPreview.textarea.value = text;
				app.graph.setDirtyCanvas(true, false);
			}

			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated?.apply(this, arguments);
				ensurePreviewUI(this);
				return r;
			};

			const onExecuted = nodeType.prototype.onExecuted;
			nodeType.prototype.onExecuted = function (message) {
				onExecuted?.apply(this, arguments);
				updatePreview(this, message?.text);
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
						const data = widgets_values.length === 1 ? widgets_values[0] : widgets_values;
						updatePreview(this, data);
					});
				}
			};
		}
	},
});