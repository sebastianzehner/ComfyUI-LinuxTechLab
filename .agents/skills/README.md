# ComfyUI Custom Node Skills

These skills are sourced from the GitHub repository
[jtydhr88/comfyui-custom-node-skills](https://github.com/jtydhr88/comfyui-custom-node-skills)
and work with any AI assistant or agent framework that can load skill/context
files (e.g. Pi Agent with local models).

## Purpose

The skills give an AI assistant comprehensive knowledge of the ComfyUI node
system, covering both the modern **V3 API** (recommended) and the older **V1
API** (legacy). This allows the assistant to help accurately with developing,
migrating, and debugging ComfyUI custom nodes.

## Included Skills

| Folder | Purpose |
|---|---|
| `comfyui-node-basics` | Node structure, `io.Schema`, inputs/outputs, `ComfyExtension` registration |
| `comfyui-node-inputs` | Widgets: INT, FLOAT, STRING, BOOLEAN, COMBO, hidden/optional/lazy inputs |
| `comfyui-node-outputs` | `NodeOutput`, preview images/masks/audio/text, `SavedImages`, UI helpers |
| `comfyui-node-datatypes` | IMAGE, LATENT, MASK, CONDITIONING, MODEL, CLIP, VAE, AUDIO, VIDEO, 3D, custom types |
| `comfyui-node-advanced` | Dynamic inputs, MatchType, Autogrow, DynamicCombo, `GraphBuilder`, async |
| `comfyui-node-lifecycle` | Execution debugging, caching, validation, `check_lazy_status`, execution order |
| `comfyui-node-frontend` | JS hooks, sidebar tabs, commands, settings, toasts, dialogs, context menus |
| `comfyui-node-migration` | Migrating V1 nodes to V3: property mapping, method conversion |
| `comfyui-node-packaging` | Project layout, `__init__.py`, `pyproject.toml`, `WEB_DIRECTORY`, registry publishing |

## Usage

The `SKILL.md` files are passed as additional context to the model depending on
the current task. Examples:

- "Create a V3 node with an image input and a float slider"
  → `comfyui-node-basics` + `comfyui-node-inputs`
- "Add a preview output to my node"
  → `comfyui-node-outputs`
- "Migrate my V1 node to V3"
  → `comfyui-node-migration`
- "Add a sidebar tab with custom settings"
  → `comfyui-node-frontend`

## Sources

The skills have been verified against the actual ComfyUI source code:

- [ComfyUI Backend](https://github.com/comfyanonymous/ComfyUI) — V3 API at `comfy_api/latest/`, V1 at `comfy/comfy_types/`
- [ComfyUI Frontend](https://github.com/Comfy-Org/ComfyUI_frontend) — Extension system, widget types, settings
- [Official ComfyUI Docs](https://docs.comfy.org/custom-nodes/overview)

## License

These skills are distributed under the **MIT License** of the original repository.
