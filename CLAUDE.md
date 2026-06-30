# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.
Detailed patterns for specific editors live in subdirectory CLAUDE.md files.

## Project Overview

ComfyUI-LinuxTechLab is a custom node plugin for ComfyUI that adds interactive visual editors (3D Builder, Paint Studio, Image Composer, Image Crop, Note LinuxTechLab, Preview Image LinuxTechLab) directly inside ComfyUI workflows. Zero core dependencies — PIL and PyTorch come from ComfyUI's environment. All nodes share the `LinuxTechLab` menu category.

## Development Setup

No build step. Install by placing this folder in `ComfyUI/custom_nodes/`. ComfyUI auto-imports `__init__.py` on startup. No test suite or linting configuration exists.

## Architecture

### Entry Points

- `__init__.py` — Aggregates all node classes, registers routes, exports `WEB_DIRECTORY = "./js"`
- `server_routes.py` — aiohttp HTTP routes for file I/O, asset serving, and AI features
- `nodes/*.py` — Individual node implementations (one per editor, all under 100 lines)

### Node → ComfyUI Integration

Each node file exports `NODE_CLASS_MAPPINGS` and `NODE_DISPLAY_NAME_MAPPINGS`. `__init__.py` merges them all. Nodes are `OUTPUT_NODE = True` and receive editor state as a serialized JSON string. They load pre-rendered images from disk and return PyTorch tensors.

### Frontend → Backend Data Flow

1. User edits in browser (WebGL / Canvas)
2. JS saves result to disk via `POST /linuxtechlab/api/*/save`
3. On workflow execution, Python node reads the saved file path from widget JSON and loads it as a tensor

### Backend Routes (server_routes.py)

| Route                               | Purpose                                     |
| ----------------------------------- | ------------------------------------------- |
| `/linuxtechlab/api/layer/upload`    | Save paint layers                           |
| `/linuxtechlab/api/project/save`    | Save composition                            |
| `/linuxtechlab/api/paint/save`      | Save paint strokes                          |
| `/linuxtechlab/api/3d/save`         | Save 3D render                              |
| `/linuxtechlab/api/3d/bg_upload`    | Upload 3D background                        |
| `/linuxtechlab/api/crop/save`       | Save crop result                            |
| `/linuxtechlab/api/preview/save`    | Write PNG with workflow metadata to output/ |
| `/linuxtechlab/api/preview/prepare` | Return in-memory PNG bytes for Save-to-Disk |
| `/linuxtechlab/remove_bg`           | AI background removal (rembg)               |
| `/linuxtechlab/assets/{filename}`   | Serve logo/assets                           |
| `/linuxtechlab/api/note/icons/list` | List inline-icon SVGs                       |
| `/linuxtechlab/vendor/{tail}`       | Serve vendored Three.js                     |

### Frontend Directory Structure

The frontend is organized into **directory-per-editor** modules under `js/`. Each directory is self-contained with files split by concern (~300 lines max per file).

**File extension convention:** Only `index.js` files (entry points that call `app.registerExtension`) use the `.js` extension. All other module files use `.mjs`. This is because ComfyUI auto-loads every `*.js` file as a separate extension — using `.mjs` for non-entry modules prevents them from being loaded twice.

```
js/
├── framework/          # Shared UI toolkit (all editors depend on this)
│   ├── index.mjs       # Barrel re-export (import from here)
│   ├── theme.mjs       # CSS injection, brand colors, _uiIcon helper
│   ├── layout.mjs      # createEditorLayout() — fullscreen overlay shell
│   ├── components.mjs  # Buttons, panels, sliders, inputs, tool grids, zoom, transform
│   ├── layers.mjs      # Photoshop-style layer panel with drag reorder
│   └── canvas.mjs      # Canvas settings, frame overlay, toolbar + drag-drop
│
├── shared/             # Shared utilities (constants, node preview, helpers)
│   ├── index.mjs       # Barrel re-export
│   ├── utils.mjs       # BRAND, installFocusTrap, hideJsonWidget, downloadDataURL
│   ├── preview.mjs     # createNodePreview, showNodePreview, restoreNodePreview
│   └── label_css.mjs   # injectLabelCSS() for label editor
│
├── paint/              # Paint Studio (PaintStudio class, mixin pattern)
│   ├── index.js        # Entry: ComfyUI extension registration
│   ├── core.mjs        # Class shell: constructor, open/close, UI building
│   ├── canvas.mjs      # Canvas init, layer CRUD (add/delete/merge/flatten)
│   ├── render.mjs      # Layer rendering with transforms, grid
│   ├── transform.mjs   # Transform handles, hit-test, zoom/pan
│   ├── events.mjs      # Mouse/keyboard event binding & routing
│   ├── tools.mjs       # Brush, pencil, eraser, smudge, fill, pick, shape
│   ├── history.mjs     # Undo/redo snapshots
│   ├── ui.mjs          # Color picker, tool options, layer panel sync
│   ├── engine.mjs      # BrushEngine class, color conversion utils
│   └── api.mjs         # PaintAPI backend calls
│
├── 3d/                 # 3D Builder (LinuxTechLab3DEditor class, mixin pattern)
│   ├── index.js        # Entry: ComfyUI extension registration
│   ├── core.mjs        # Class shell, UI building, Three.js lazy loading
│   ├── engine.mjs      # Three.js scene/renderer/camera init, animation
│   ├── objects.mjs     # Object CRUD, selection, geometry, materials, layer thumbs
│   ├── shapes.mjs      # Shape registry: id → { icon, label, build, params, defaults, live }
│   ├── shape_params.mjs # Per-object Shape panel (right sidebar) + geometry rebuild
│   ├── composites.mjs  # Multi-mesh Groups (tree, house, flower, …) registry + builders
│   ├── picker.mjs      # "Add 3D Object" modal picker (categorised grid)
│   ├── importer.mjs    # GLB/OBJ lazy loaders + wrapImportPivot + _addImportedGroup
│   ├── interaction.mjs # Tools, camera views, keyboard, undo/redo
│   ├── persistence.mjs # Save/restore scene JSON, background image
│   └── api.mjs         # ThreeDAPI backend calls
│
├── composer/           # Image Composer (LinuxTechLabEditor class, mixin pattern)
│   ├── index.js        # Entry: ComfyUI extension registration
│   ├── core.mjs        # Class shell, state management
│   ├── eraser.mjs      # Eraser mode, mask creation/loading
│   ├── interaction.mjs # Events, alignment, keyboard, transforms
│   ├── render.mjs      # Rendering, history/undo
│   ├── ui.mjs          # Sidebar panel builder
│   ├── layers.mjs      # Layer helper module
│   └── api.mjs         # LinuxTechLabAPI backend calls
│
├── crop/               # Crop Image (CropEditor class, mixin pattern)
│   ├── index.js        # Entry: ComfyUI extension registration
│   ├── core.mjs        # Class shell, UI building
│   ├── interaction.mjs # Mouse/keyboard, crop handle dragging
│   └── render.mjs      # Canvas rendering, aspect ratio logic, save
│
├── label/              # Label Editor (function-based, not a class)
│   ├── index.js        # Entry: ComfyUI extension registration
│   ├── core.mjs        # LabelEditor class, UI building
│   └── render.mjs      # Canvas text rendering, typography helpers
│
├── note/               # Note LinuxTechLab (NoteEditor class, mixin pattern)
│   ├── index.js        # Entry: node lifecycle, DEFAULT_CFG, parseCfg, onConfigure/onResize
│   ├── core.mjs        # Class shell: open/close, save, undo history, Ctrl+Z neutering,
│   │                   #  code/preview view toggle, _applyEditAreaBg, _normalizeEditArea
│   ├── toolbar.mjs     # _buildToolbar: bold/italic/headings/colour pickers/link/code/HR/
│   │                   #  Button Design/YT/Discord entries, undo/redo, view toggle, SWATCHES,
│   │                   #  _promptLinkUrl + _promptCodeBlock themed modals
│   ├── blocks.mjs      # Button Design rich dialog (icon picker, live preview, toggles),
│   │                   #  YouTube + Discord generic block dialogs, validateUrl helper,
│   │                   #  renderButtonHTML, insertAtSavedRange, saveRange/restoreRange
│   ├── render.mjs      # createNoteDOMWidget, renderContent, attachEditButton,
│   │                   #  attachCanvasClickDelegation, injectCopyButtons (for <pre>)
│   ├── sanitize.mjs    # Allowlist-based HTML sanitizer (tags, attrs, classes, styles, href)
│   └── css.mjs         # injectCSS — all note styles (overlay, editarea, pills, toggles)
│
├── resolution/         # Resolution LinuxTechLab (single file, ~640 lines)
│   └── index.js        # 3x3 ratio chip grid + 8-row size list + Custom mode
│                       #  (W/H inputs, swap, snap chips, aspect preview).
│                       #  State on node.properties + graphToPrompt hook.
│
├── compare/            # Compare Viewer (single file, 413 lines)
│   └── index.js        # Full compare widget (LiteGraph node drawing)
│
├── preview/            # Preview Image LinuxTechLab (single file, ~320 lines)
│   └── index.js        # Two blue buttons (Save to Disk / Save to Output) as
│                       #  an addCustomWidget placed between filename_prefix and
│                       #  the ComfyUI-native preview image. saveToOutput posts
│                       #  to /linuxtechlab/api/preview/save; saveToDisk posts to
│                       #  /linuxtechlab/api/preview/prepare then writes via
│                       #  window.showSaveFilePicker with <a download> fallback.
│                       #  Node-level onMouseMove/onMouseLeave for hover (widget
│                       #  mouse() doesn't get pointermove on Vue).
│
├── showtext/           # Show Text node (single file, 97 lines)
│   └── index.js
│
├── reference/          # Reference node (single file, 140 lines)
    └── index.js
```

### Mixin Pattern

Editor classes use a **prototype mixin pattern** to split methods across files:

- `core.mjs` defines the class with constructor and UI building
- Other `.mjs` files add methods: `ClassName.prototype.methodName = function() { ... };`
- `index.js` imports all mixin files as side-effect imports before using the class

### Import Conventions

- Editors import framework from `../framework/index.mjs`
- Editors import shared utils from `../shared/index.mjs`
- ComfyUI app: `import { app } from "/scripts/app.js";`
- Only `index.js` entry points use `.js`; all other modules use `.mjs`

### Offline-first: Vendored Three.js

Three.js is vendored at `assets/vendor/three/`. Served at `/linuxtechlab/vendor/{tail}`. Do NOT reintroduce esm.sh/unpkg/jsdelivr imports.

### ComfyUI Settings Integration

Settings registered via `settings` array in `app.registerExtension()`. All use `["LinuxTechLab", "..."]` category prefix. Read via `app.ui.settings.getSettingValue("LinuxTechLab.SomeEditor.SettingName")`.

### Security Patterns

- `_safe_path()` in `server_routes.py` — validates all file paths stay within `LINUXTECHLAB_INPUT_ROOT`
- IDs validated against `^[a-zA-Z0-9_\-]+$` regex (max 64 chars)
- Base64 payloads capped at 50 MB

## Token-Saving Rules for AI Agents

**IMPORTANT: Follow these rules to minimize token usage and work efficiently.**

### 1. Read only what you need

- **To edit brush tools**: read only `js/paint/tools.mjs` (~250 lines) — NOT the entire paint directory
- **To edit 3D object management**: read only `js/3d/objects.mjs` — NOT `core.mjs` or `engine.mjs`
- **To change UI components**: read only `js/framework/components.mjs` — NOT `theme.mjs` (which is mostly CSS)
- **To fix a save bug**: read only the editor's `persistence.mjs` or `render.mjs` (where `_save` lives)

### 2. Use the file names to find code

Files are named by concern. Match the task to the file:

| Task                                                          | Read this file                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fix brush/drawing                                             | `js/paint/tools.mjs`                                                                                                                                                                                                                                                                                                                             |
| Fix layer add/delete                                          | `js/paint/canvas.mjs` or `js/composer/layers.mjs`                                                                                                                                                                                                                                                                                                |
| Fix undo/redo                                                 | `js/<editor>/history.mjs`                                                                                                                                                                                                                                                                                                                        |
| Fix keyboard shortcuts                                        | `js/<editor>/events.mjs` or `interaction.mjs`                                                                                                                                                                                                                                                                                                    |
| Fix save/load                                                 | `js/<editor>/persistence.mjs` or `render.mjs` (for crop/composer)                                                                                                                                                                                                                                                                                |
| Fix zoom/pan                                                  | `js/<editor>/transform.mjs`                                                                                                                                                                                                                                                                                                                      |
| Change a UI panel                                             | `js/<editor>/core.mjs` (sidebar building) or `ui.mjs`                                                                                                                                                                                                                                                                                            |
| Change shared buttons/sliders                                 | `js/framework/components.mjs`                                                                                                                                                                                                                                                                                                                    |
| Change canvas frame/toolbar                                   | `js/framework/canvas.mjs`                                                                                                                                                                                                                                                                                                                        |
| Change layer panel UI                                         | `js/framework/layers.mjs`                                                                                                                                                                                                                                                                                                                        |
| Add a new primitive 3D shape                                  | `js/3d/shapes.mjs` (one registry entry: icon, label, build, params, defaults)                                                                                                                                                                                                                                                                    |
| Add a new composite (multi-mesh) 3D shape                     | `js/3d/composites.mjs` + `js/3d/picker.mjs` SECTIONS                                                                                                                                                                                                                                                                                             |
| Change the per-object Shape panel                             | `js/3d/shape_params.mjs`                                                                                                                                                                                                                                                                                                                         |
| Handle GLB/OBJ import behavior                                | `js/3d/importer.mjs`                                                                                                                                                                                                                                                                                                                             |
| Add / change Resolution LinuxTechLab sizes per ratio          | `js/resolution/index.js` `SIZES` const + `DEFAULT_PER_RATIO` (per-ratio click default) — keep the spec doc table in sync. Layout sizing (NODE\*H / WIDGET_H / list min-height) lives at the top of the same file. State schema on `node.properties.resolutionState` + `app.graphToPrompt` injection hook at the bottom of the file (Pattern #9). |
| Fix / extend Note toolbar (buttons, pickers)                  | `js/note/toolbar.mjs`                                                                                                                                                                                                                                                                                                                            |
| Add / change a toolbar mask-icon                              | `js/note/css.mjs` (`.pix-note-tbtn-maskicon` for single-layer, `.pix-note-tbtn-maskicon-multi` for two-layer color pickers) + SVG files in `assets/icons/ui/` (two-layer icons need `<name>-outline.svg` + `<name>-drop.svg`) + `makeMaskIcon`/`makeMaskIconMulti` call in `toolbar.mjs`                                                         |
| Change per-note colour pickers (Btn, Ln, Bg, text, highlight) | `js/note/toolbar.mjs` (`makeColorPicker` factory for Btn/Ln; inline pickers for text / highlight / Bg in G3); `js/note/render.mjs` writes CSS vars on canvas body; `core.mjs` `_applyCfgColorsToEditArea` writes same vars on the editor's contenteditable on each open                                                                          |
| Fix Note block dialogs (Download/YT/Discord, link, code)      | `js/note/blocks.mjs` (+ `_promptLinkUrl`/`_promptCodeBlock` in toolbar.mjs)                                                                                                                                                                                                                                                                      |
| Change what HTML/attrs/classes are allowed in a note          | `js/note/sanitize.mjs` (allowlists)                                                                                                                                                                                                                                                                                                              |
| Change how a note renders on canvas or node colour behaviour  | `js/note/render.mjs` (`renderContent`)                                                                                                                                                                                                                                                                                                           |
| Change Note default colour / size / placeholder               | `js/note/index.js` DEFAULT_CFG + `nodes/node_note.py` widget default (keep in sync)                                                                                                                                                                                                                                                              |
| Add / manage inline note icons (SVG library)                  | Drop SVGs into `assets/icons/note/`. Label derivation + list endpoint live in `server_routes.py`'s `/linuxtechlab/api/note/icons/list` route, mirrored in `js/note/icons.mjs::deriveLabel`. Both must stay in sync if you change the rules.                                                                                                      |
| Change inline-icon rendering (size / alignment / color model) | `js/note/css.mjs` base `.pix-note-ic` rule + per-icon rules dynamically injected by `js/note/icons.mjs::injectIconCSS`. Picker popup styles: `.pix-note-iconpop` family in `css.mjs`.                                                                                                                                                            |
| Add backend route                                             | `server_routes.py`                                                                                                                                                                                                                                                                                                                               |
| Add a new Python node                                         | `nodes/node*<name>.py`                                                                                                                                                                                                                                                                                                                           |

| Fix composer blend mode save/restore/execute | `js/composer/interaction.mjs`(save),`render.mjs`(restore),`ui.mjs`(dropdown sync),`nodes/node_composition.py` `\_blend_over()` |
| Paint AI Background Removal panel | `js/paint/core.mjs` `\_buildBgRemovalPanel`+`\_removeBgFromActiveLayer`(button gated on`ly.sourceKind === "image"`, set by the `onAddImage`handler and serialized as`source_kind`in the layer project JSON). Reuses the`/linuxtechlab/remove_bg`backend route via`PaintAPI.removeBg`. |
| Preview Image LinuxTechLab — change button layout / geometry / colors | `js/preview/index.js` constants at the top (`BTN_H`, `BTN_GAP`, `MIN_W`, `MIN_H`, `DEFAULT_W`, `DEFAULT_H`, `COLOR_ACTIVE__`/`COLOR*DISABLED*_`). Button rects computed in `computeButtonRects`, painted in `paintBtn`. Buttons live as an `addCustomWidget`(so they reserve vertical space above the image) — don't switch back to`onDrawForeground`overlay; it collides with ComfyUI's native preview + dimension label. |
| Preview Image LinuxTechLab — change save flow / routes | Backend:`nodes/node_preview.py`(tensor → temp PNG for preview display) +`server_routes.py`helpers`\_embed_workflow_metadata`, `/linuxtechlab/api/preview/save`, `/linuxtechlab/api/preview/prepare`. Frontend: `js/preview/index.js` `saveToOutput`/`saveToDisk`. Both POST a dataURL + the workflow/prompt from `app.graphToPrompt()`. Metadata embedding lives in Python only (single source of truth). |

### 3. When adding a new method to an editor class

- Add it to the most relevant existing `.mjs` file by concern (tools, events, render, etc.)
- Use the mixin pattern: `ClassName.prototype.newMethod = function() { ... };`
- Do NOT create new files unless the relevant file would exceed ~400 lines
- New module files must use `.mjs` extension (only `index.js` entry points use `.js`)

### 4. When creating a new editor

Follow the existing directory structure:

1. Create `js/<name>/` with `index.js` (entry point, `.js`), `core.mjs`, and concern-based splits (all `.mjs`)
2. Create `nodes/node_<name>.py` with mappings
3. Import and merge in `__init__.py`
4. If it needs backend routes: add to `server_routes.py`
5. Keep every file under ~300 lines

### 5. Do not read framework CSS

`js/framework/theme.mjs` is ~660 lines but ~580 are a CSS string literal. You almost never need to read it. Only read it if you're adding a new CSS class or changing the color theme.

## Git Workflow

The user works on the `main` branch of `ComfyUI-LinuxTechLab`.

1. **Local commits** — after any non-trivial working change, create a local commit as a checkpoint. Default — no confirmation needed.
2. **Push to GitHub** — only when the user explicitly says "push" or "push to github".

- Keep commits small and focused: one coherent change per commit
- Never amend a pushed commit
- Commit message format: `scope: description` (e.g. `feat: add prompt writer node`)

## Publishing

CI/CD auto-publishes to the ComfyUI registry when `pyproject.toml` is pushed to `main`. Do not modify `pyproject.toml`, `LICENSE`, or `.github/workflows/publish.yml`.

## Important Note

After major changes, update this file and the relevant subdirectory CLAUDE.md. Keep them in sync with the project's status.
