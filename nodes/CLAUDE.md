# nodes/CLAUDE.md

Detailed patterns for Python nodes and backend routes.

## Save Mp4 LinuxTechLab (`node_save_mp4.py`)

- ffmpeg resolved via `_resolve_ffmpeg` (imageio-ffmpeg first, ffmpeg on PATH fallback)
- Frames piped to ffmpeg's stdin as raw rgb24 (no temp PNGs)
- Audio written to temp WAV via `_write_wav_pcm16` (stdlib `wave` + numpy, NO torchaudio dep)
- Stderr drained in daemon thread to avoid Windows pipe-buffer deadlock
- `trim_to_audio` adds `-shortest` only when audio is present
- Output naming via `folder_paths.get_save_image_path` (auto-increments)
- `OUTPUT_NODE = True` (terminal)
- Returns `{"ui": {"images": [...], "linuxtechlab_videos": [...]}}` — `linuxtechlab_videos` consumed by `js/save_mp4/index.js`
- Encoder defaults: `_CRF = 19`, `_PIX_FMT = yuv420p`

## Preview Image LinuxTechLab (`node_preview.py` + `server_routes.py`)

- `_embed_workflow_metadata` in `server_routes.py` is the single source of truth for metadata embedding
- `saveToOutput` → `/linuxtechlab/api/preview/save`
- `saveToDisk` → `/linuxtechlab/api/preview/prepare` → `showSaveFilePicker` with `<a download>` fallback

## AudioReact Engine (`_audio_react_engine.py`)

ALL motion functions, overlays, audio helpers, `Params`, `MOTION_MODES`, `OVERLAYS`, and `generate_video()` live here ONLY. See `js/audio_studio/CLAUDE.md` for full details.

`node_audio_studio.py` is a thin wrapper — `optional` image/audio inputs + `hidden` studio_json. `_migrate_cfg` handles forward-compatible schema bumps.

## Security Patterns

- `_safe_path()` — validates all file paths stay within `LINUXTECHLAB_INPUT_ROOT`
- IDs validated against `^[a-zA-Z0-9_\-]+$` regex (max 64 chars)
- Base64 payloads capped at 50 MB
- Note sanitizer (`js/note/sanitize.mjs`) — allowlist-based. Anything user-reachable must round-trip through `sanitize(html)`.

## Vendored Three.js Route

Served at `/linuxtechlab/vendor/{tail}`. Blocks `..` traversal and chars outside `[A-Za-z0-9_\-./]`. Realpath-checked against `LINUXTECHLAB_VENDOR_DIR`.

Upgrading Three.js: re-fetch `https://esm.sh/three@<VERSION>/es2022/*` for each file, keeping relative paths identical (`three.mjs` at root, `examples/jsm/<category>/*.mjs` for addons).
