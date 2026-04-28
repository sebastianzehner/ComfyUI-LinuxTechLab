# js/composer/CLAUDE.md

Detailed patterns for the Image Composer. Regressing any of these reintroduces specific bugs.

## File Structure
| File | Purpose |
|------|---------|
| `index.js` | Entry: ComfyUI extension registration |
| `core.mjs` | Class shell, state management |
| `eraser.mjs` | Eraser mode, mask creation/loading |
| `interaction.mjs` | Events, alignment, keyboard, transforms, save |
| `render.mjs` | Rendering, history/undo, restore |
| `ui.mjs` | Sidebar panel builder, dropdown sync |
| `layers.mjs` | Layer helper module |
| `api.mjs` | LinuxTechLabAPI backend calls |

## Critical Patterns

1. **Per-layer blend mode has FOUR touch points that must stay in sync:**
   - `render.mjs` — canvas draw (reads `layer.blendMode`, maps via `BLEND_MAP`)
   - `interaction.mjs` — project JSON save (writes `blendMode` on `layerEntry`)
   - `nodes/node_composition.py` `_blend_over()` — W3C Compositing L1
   - `index.js` `rebuildPreview` → `drawLayer` — client-side mini-preview recomposite

2. **Active-layer blend dropdown needs explicit sync** — `updateActiveLayerUI()` in `ui.mjs` must call `core._layerPanel.setBlend(layer.blendMode || "Normal")` whenever a layer becomes active.

3. **Restore path has THREE layer-construction sites** — `attemptRestore()` in `render.mjs` builds layer objects in three places: `isPlaceholder` fast path, `img.onload` success, and `img.onerror` fallback. Any new serialized field must be copied in ALL three.
