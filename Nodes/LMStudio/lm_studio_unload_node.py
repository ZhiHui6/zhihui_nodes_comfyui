import requests

class UnloadLMStudioModels:

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "lm_studio_url": ("STRING", {
                    "default": "http://localhost:1234",
                    "multiline": False,
                    "tooltip": "LM Studio server URL"
                }),
            },
            "optional": {
                "trigger": ("*", {}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "unload_models"
    CATEGORY = "Zhi.AI/LM Studio"
    OUTPUT_NODE = True
    DESCRIPTION = "Unload all loaded models from LM Studio server to free VRAM. Connect after other nodes to trigger unloading."

    def unload_models(self, lm_studio_url: str, trigger=None):
        lm_studio_url = lm_studio_url.rstrip("/")

        try:
            response = requests.get(
                f"{lm_studio_url}/api/v1/models",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            response.raise_for_status()
            models_data = response.json()

            all_models = models_data.get("models", models_data.get("data", []))

            loaded_instances = []
            for model in all_models:
                for instance in model.get("loaded_instances", []):
                    instance_id = instance.get("id")
                    if instance_id:
                        loaded_instances.append(instance_id)
                        print(f"[UnloadLMStudioModels] Found loaded instance: {instance_id}")

            if not loaded_instances:
                msg = "No models currently loaded in LM Studio."
                print(f"[UnloadLMStudioModels] {msg}")
                return (msg,)

            unloaded = []
            failed = []

            for instance_id in loaded_instances:
                print(f"[UnloadLMStudioModels] Attempting to unload: {instance_id}")

                unload_response = requests.post(
                    f"{lm_studio_url}/api/v1/models/unload",
                    headers={"Content-Type": "application/json"},
                    json={"instance_id": instance_id},
                    timeout=30
                )

                print(f"[UnloadLMStudioModels] Response {unload_response.status_code}: {unload_response.text}")

                if unload_response.status_code == 200:
                    unloaded.append(instance_id)
                    print(f"[UnloadLMStudioModels] Successfully unloaded: {instance_id}")
                else:
                    failed.append(instance_id)
                    print(f"[UnloadLMStudioModels] Failed to unload {instance_id}: {unload_response.status_code} {unload_response.text}")

            parts = []
            if unloaded:
                parts.append(f"Unloaded: {', '.join(unloaded)}")
            if failed:
                parts.append(f"Failed: {', '.join(failed)}")
            status = " | ".join(parts) if parts else "Nothing was unloaded."

        except requests.exceptions.ConnectionError:
            status = f"Connection error: Could not reach LM Studio at {lm_studio_url}. Is it running?"
            print(f"[UnloadLMStudioModels] {status}")
        except requests.exceptions.Timeout:
            status = "Request timed out."
            print(f"[UnloadLMStudioModels] {status}")
        except Exception as e:
            status = f"Error: {str(e)}"
            print(f"[UnloadLMStudioModels] {status}")

        return (status,)