# js/framework/CLAUDE.md

Detailed patterns for the shared editor framework and ComfyUI Vue frontend compatibility.

## ComfyUI Vue Frontend Compatibility

These patterns were discovered during debugging and must be followed across ALL editors.

1. **`onDrawForeground` does not fire** — Use `setInterval` polling instead for detecting upstream changes.

2. **Editor overlay removal** — Always use the `isEditorOpen(node)` pattern that checks `overlay.isConnected`:
   ```js
   function isEditorOpen(node) {
     if (!node._linuxtechlabEditor) return false;
     const overlay = node._linuxtechlabEditor.overlay;
     if (!overlay || !overlay.isConnected) {
       node._linuxtechlabEditor = null;
       return false;
     }
     return true;
   }
   ```

3. **`graph.links` may be a Map** — Always try both access patterns:
   ```js
   let link = graph.links?.[linkId];
   if (!link && typeof graph.links?.get === "function") link = graph.links.get(linkId);
   ```

4. **Execution detection** — Use ComfyUI API events (`execution_start`, `executing` with `null` detail = finished) from `/scripts/api.js`.

5. **DOM widget may be nulled while editor is open** — Guard with null-check + re-lookup from `node.widgets`:
   ```js
   editor.onSave = (jsonStr, dataURL) => {
     const w = widget || node.widgets?.find((x) => x.name === "SceneWidget");
     if (w) w.value = { scene_json: jsonStr };
   };
   ```

6. **Ctrl+Z escapes editor overlays** — Patch the bottleneck functions while the editor is open, then restore on cleanup:
   ```js
   this._savedLoadGraphData = app.loadGraphData.bind(app);
   app.loadGraphData = () => Promise.resolve();
   this._savedGraphConfigure = app.graph.configure.bind(app.graph);
   app.graph.configure = () => {};
   // On cleanup: app.loadGraphData = this._savedLoadGraphData; etc.
   ```
   Also neuter `graph.undo/redo`, `Comfy.Undo`/`Comfy.Redo` commands, plus a `node.onRemoved` resurrection-close safety net. See `js/note/core.mjs` for the full pattern.

7. **`installFocusTrap` and contenteditable don't mix** — For rich-text editors using contenteditable (Note LinuxTechLab), do NOT call `installFocusTrap`. Use the `loadGraphData` / `graph.configure` neutering pattern from point 6 instead.

8. **`nodeCreated` fires BEFORE `configure()` — defer initial DOM widget population via `queueMicrotask`**:
   ```js
   // In nodeCreated: create empty root, addDOMWidget, then defer:
   queueMicrotask(() => { /* populate from widget value */ });
   // Keep onConfigure re-render for "open different workflow" case
   ```

9. **For hidden state, prefer Python `hidden` inputs + `node.properties` + `graphToPrompt`** over hidden STRING widgets. Vue auto-exposes primitive-type required inputs as convertible input slots. Use `node.properties[YOUR_KEY]` for state, monkey-patch `app.graphToPrompt` to inject at submission. See Resolution LinuxTechLab as reference implementation.

## 3D CSS Isolation

`injectExtraStyles()` in `js/3d/core.mjs` must scope rules to `.p3d-workspace` — NOT the shared `.pxf-workspace` class — because the stylesheet persists after the 3D editor closes and bleeds into every other editor.

## Transparent Background Save-to-Disk

Paint, Composer, and 3D Builder each have a "Transparent BG (Save to Disk)" checkbox. It only affects Save to Disk — the workflow "Save" path is untouched so existing workflows stay compatible.

- **Paint**: checkbox in `createCanvasToolbar` (`canvas.mjs`), state on `this._canvasToolbar.transparentBg`
- **Composer**: checkbox in `js/composer/ui.mjs`, state on `this._transparentBg`
- **3D Builder**: checkbox in `js/3d/core.mjs`, state on `this._transparentBg`
