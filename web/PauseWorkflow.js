import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const i18n = {
  zh: {
    continue: "▶️ 继续",
    cancel: "⏹️ 取消"
  },
  en: {
    continue: "▶️ Continue",
    cancel: "⏹️ Cancel"
  }
};

function getLocale() {
  const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
  return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
  const locale = getLocale();
  return i18n[locale][key] || i18n['en'][key] || key;
}

const postContinue = (nodeId) => fetch("/pause_workflow/continue/" + nodeId, { method: "POST" });
const postCancel = () => fetch("/pause_workflow/cancel", { method: "POST" });

app.registerExtension({
  name: "zhihui_PauseWorkflow",
  nodeCreated(node) {
    if (node.comfyClass === "PauseWorkflow") {
      
      node.addWidget("button", $t('continue'), "CONTINUE", () => {
        postContinue(node.id);
      });

      node.addWidget("button", $t('cancel'), "CANCEL", () => {
        postCancel();
      });
    }
  },
  setup() {
    const original_api_interrupt = api.interrupt;
    api.interrupt = function () {
      postCancel();
      original_api_interrupt.apply(this, arguments);
    }
  },
});