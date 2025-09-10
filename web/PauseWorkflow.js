import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const postContinue = (nodeId) => fetch("/pause_workflow/continue/" + nodeId, { method: "POST" });
const postCancel = () => fetch("/pause_workflow/cancel", { method: "POST" });

app.registerExtension({
  name: "zhihui_PauseWorkflow",
  nodeCreated(node) {
    if (node.comfyClass === "PauseWorkflow") {
      node.addWidget("button", "▶️Continue", "CONTINUE", () => {
        postContinue(node.id);
      });

      node.addWidget("button", "⏹️Cancel", "CANCEL", () => {
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