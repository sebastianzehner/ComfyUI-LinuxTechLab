# js/note/CLAUDE.md

Detailed patterns for Note LinuxTechLab. Regressing any of these reintroduces specific bugs.

## File Structure
| File | Purpose |
|------|---------|
| `index.js` | Node lifecycle, DEFAULT_CFG, parseCfg, onConfigure/onResize |
| `core.mjs` | Class shell: open/close, save, undo history, Ctrl+Z neutering, code/preview toggle |
| `toolbar.mjs` | _buildToolbar: bold/italic/headings/colour pickers/link/code/HR/Button Design |
| `blocks.mjs` | Button Design dialog, YouTube/Discord dialogs, renderButtonHTML, insertAtSavedRange |
| `render.mjs` | createNoteDOMWidget, renderContent, attachEditButton, injectCopyButtons |
| `sanitize.mjs` | Allowlist-based HTML sanitizer (tags, attrs, classes, styles, href) |
| `css.mjs` | injectCSS — all note styles |

## Critical Patterns

1. **Sanitizer must UNWRAP on invalid href, not remove** — unwrap the anchor, keep inner text.

2. **URL validation must fully parse** — use `new URL(url)` + `u.hostname` check, not just regex.

3. **Python widget default MUST stay in sync with JS DEFAULT_CFG** — `backgroundColor` and `accentColor` must match between `node_note.py` and `js/note/index.js`.

4. **Bg picker is THREE-state** — do NOT always-override `node.color`/`node.bgcolor`:
   - `undefined / key missing` → leave node colors alone (native Colors menu wins)
   - `null OR "transparent"` → revert to Catppuccin Mocha defaults (`#b4befe` / `#1e1e2e`)
   - `hex string` → `node.bgcolor = hex`, `node.color = darken(hex, 0.3)`

5. **Ctrl+Z escape fix** — patch `app.loadGraphData` AND `app.graph.configure` while open. Also neuter `graph.undo/redo`, `Comfy.Undo`/`Comfy.Redo`, plus `node.onRemoved` safety net.

6. **Do NOT call `installFocusTrap` with contenteditable** — steals focus and wipes text selection.

7. **Inline errors, not `alert()`** — `alert()` context-switches out of the editor.

8. **Button pill structure** — `renderButtonHTML(v)` wraps pill + folder hint in `<span class="ltl-note-btnblock">`. Size hint inside `<a>` as `<span class="ltl-note-btnsize">`. Folder hint outside `<a>` as sibling `<span class="ltl-note-folderhint">`.

9. **Block-insert dialogs: capture the range BEFORE the modal opens** — `saveRange(editArea)` snapshots the cloned range; `insertAtSavedRange` restores it.

10. **Code block inserts by direct DOM manipulation** — grabs `startBlock`/`endBlock` references before modal, replaces directly with new `<pre><code>` + trailing `<p>`.

11. **Manual undo history** — `core.mjs` maintains innerHTML-snapshot stack. All direct-DOM operations must bracket with `_snapBefore`/`_snapAfter`.

12. **Paste strips formatting + prevents ComfyUI image-drop escape** — window-capture `paste` and `drop`/`dragover` handlers in `core.mjs`.

13. **Swatches** — `SWATCHES` array in `toolbar.mjs` (28 swatches = 4 rows × 7). CSS grid is `repeat(7, 18px)`. Keep row count a multiple of 7.

14. **Page bg default is `#111111` as CSS-baseline fallback ONLY** — do NOT set it as `DEFAULT_CFG.backgroundColor` or widget default. The cfg value for "no override" is explicitly absent (undefined).

15. **Code view: `<pre>`-overlay-under-transparent-`<textarea>`** — both MUST share identical font-family, font-size, line-height, padding, white-space, word-break.

16. **Edit-in-place pencil: ONE reusable floating button** — not one-per-block. `PENCIL_BLOCK_SELECTORS` in `core.mjs` MUST stay in sync with `_dispatchBlockEdit` in `blocks.mjs`.

17. **Grid insert bypasses `execCommand("insertHTML")` entirely** — use direct DOM manipulation via `_insertGridBlock` in `blocks.mjs`. Follow this pattern for any new block-level insert.

18. **Block modals live in `document.body`** — overlay close handler must check `hasModal` guard: `document.querySelector(".ltl-note-blockdlg, .ltl-note-confirm-backdrop, .ltl-note-colorpop")`.

19. **`<a>` clicks inside edit area must be `preventDefault`ed** — install capture-phase click listener in `core.mjs` `open()`.

20. **Inline icons: THREE-file contract** — `server_routes.py` enumerates SVGs, `icons.mjs` injects CSS rules, `sanitize.mjs` allows `ltl-note-ic` class + `data-ic` attribute.

21. **Bold uses `queryCommandState("bold")`** — not a B/STRONG tag walk. Handles headings and CSS spans.

22. **Picked colors must be restaged on EVERY caret move** — `selectionchange` handler calls `editor._restageColors?.()`. `_restageColors()` replays `hiliteColor` FIRST, `foreColor` SECOND.

23. **Chrome `hiliteColor` on collapsed selection clears staged `foreColor`** — after `execCommand("hiliteColor")`, replay `execCommand("foreColor")` with the cached text color.

24. **CSS vars on editArea need explicit init** — call `_applyCfgColorsToEditArea()` immediately after `this._editArea = editArea` in `open()`.

25. **`save()` body lookup must be robust against Vue detachment** — three-step lookup: `_noteBody?.isConnected` → `_noteDOMWrap` → `widgets.find`.

26. **Btn/Ln color split** — two independent pickers: `buttonColor` (drives `--ltl-note-btn`) and `lineColor` (drives `--ltl-note-line`). Three sync points: `DEFAULT_CFG`, `parseCfg` migration, `node_note.py` widget default.

27. **Toolbar mask-icons: two classes** — `.ltl-note-tbtn-maskicon` (single-layer, `currentColor`) and `.ltl-note-tbtn-maskicon-multi` (two-layer: outline=currentColor, drop=tinted). Two-layer icons need `<name>-outline.svg` + `<name>-drop.svg`.

28. **Color picker icons = last explicit pick, NO selectionchange mirror** — the Clear branch must call `removeProperty("--ltl-note-tbtn-tint")`.

29. **Grid table: `ltl-note-grid` marker class must be in sanitizer allowlist** — plus five table tags. `codeview.mjs` `TOP_LEVEL_BLOCK_TAGS` must include `"table"`. Tab intercept in `_keyBlock` for cell navigation.
