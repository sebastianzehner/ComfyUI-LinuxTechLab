# nodes/CLAUDE.md

Detailed patterns for Python nodes and backend routes.

## Preview Image LinuxTechLab (`node_preview.py` + `server_routes.py`)

- `_embed_workflow_metadata` in `server_routes.py` is the single source of truth for metadata embedding
- `saveToOutput` → `/linuxtechlab/api/preview/save`
- `saveToDisk` → `/linuxtechlab/api/preview/prepare` → `showSaveFilePicker` with `<a download>` fallback

## Security Patterns

- `_safe_path()` — validates all file paths stay within `LINUXTECHLAB_INPUT_ROOT`
- IDs validated against `^[a-zA-Z0-9_\-]+$` regex (max 64 chars)
- Base64 payloads capped at 50 MB
- Note sanitizer (`js/note/sanitize.mjs`) — allowlist-based. Anything user-reachable must round-trip through `sanitize(html)`.

## Vendored Three.js Route

Served at `/linuxtechlab/vendor/{tail}`. Blocks `..` traversal and chars outside `[A-Za-z0-9_\-./]`. Realpath-checked against `LINUXTECHLAB_VENDOR_DIR`.

Upgrading Three.js: re-fetch `https://esm.sh/three@<VERSION>/es2022/*` for each file, keeping relative paths identical (`three.mjs` at root, `examples/jsm/<category>/*.mjs` for addons).
