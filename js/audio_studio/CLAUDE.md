# js/audio_studio/CLAUDE.md

Detailed patterns for AudioReact LinuxTechLab. Regressing any of these reintroduces specific bugs.

## File Structure
| File | Purpose |
|------|---------|
| `index.js` | Entry: button widget, app.graphToPrompt hook (Pattern #9), nodeCreated lifecycle |
| `core.mjs` | AudioStudioEditor class — open/close/save/discard, undo/redo, source resolution |
| `transport.mjs` | Transport bar UI (play/scrub/sparkline/frame stepper), Web Audio playback |
| `audio_analysis.mjs` | Decode (Web Audio API), inline FFT, 4-band envelope/onset, encodeWav() |
| `render.mjs` | WebGL2 pipeline init + 2-pass render (motion → overlay → screen) |
| `shaders.mjs` | 8 motion shader fragments + combined-overlay shader, compileProgram() |
| `ui.mjs` | Tabbed sidebar (Motion / Overlays / Audio / Output), control factories |
| `api.mjs` | Backend wrappers — uploadSource, getUpstreamImageUrl, getInlineSourceUrl |

## Engine Rule (CRITICAL)
**ALL motion functions, overlays, audio helpers, `Params`, `MOTION_MODES`, `OVERLAYS`, and `generate_video()` live in `nodes/_audio_react_engine.py` ONLY.**
`node_audio_studio.py` is a thin wrapper. NEVER inline math into the node file.

When changing a formula:
1. Update `docs/audio-react-math.md` first (single source of truth)
2. Update `nodes/_audio_react_engine.py`
3. Update matching GLSL shader in `js/audio_studio/shaders.mjs`
4. Run `scripts/audio_parity_check.py --regenerate`
5. Run browser parity harness (`assets/audio_studio_parity/index.html`)

## Critical Patterns

1. **`DEFAULT_CFG` in `index.js` MUST stay in sync with `Params` defaults in `_audio_react_engine.py`.**

2. **`slit_scan` is a per-row time-evolving sine wave, NOT a frame-buffer pull** — if you switch to a real frame buffer, clamp lookback to ≤ 0.5s or memory blows up.

3. **`shake` motion mode caches dx/dy on `self`, must be cleared at top of `generate()`** — `if hasattr(self, "_shake_dx_cache"): del ...`.

4. **Print line uses ASCII `->`, not `→` (U+2192)** — Windows console default codec (cp1252) can't encode the arrow.

5. **Color shift uses resolution-relative pixel counts** — `int(onset_t * strength * 0.012 * min(H, W))`. No hardcoded pixel counts.

6. **Overlay short-circuit at strength == 0 is mandatory** — every overlay's first line: `if env_t <= 0.001 or strength <= 0: return frame`.

7. **No `edge_headroom` widget — deliberately omitted, do not add it back.**

8. **Pattern #9 persistence** — `studio_json` declared `hidden` in `INPUT_TYPES`, state on `node.properties.audioStudioState`, `app.graphToPrompt` hook injects at submission. If input shows a slot dot, Pattern #9 is broken.

9. **`shake` shader uses deterministic JS RNG (mulberry32-like hash)** — NOT a port of `torch.Generator(0)`. Browser preview is approximate for shake. This is documented behavior.

10. **Audio analysis runs ONCE per audio load** — packing all 4 bands into one RGBA32F texture. Toggling `audio_band` is a free uniform swap, not a recompute.

11. **`_onCfgChanged` only triggers `_recomputeAudio` when `fps`/`smoothing`/`loop_safe` actually changed**, debounced 200ms.

12. **`_setImage` MUST re-attach `this.canvas` to `canvasHost`** if it's been disconnected by `_showCanvasMessage`.

13. **`isDirty()` must OR a `_uploadDirty` flag**, not just compare cfg JSON — re-uploading replaces bytes at the same path so the path doesn't change.

14. **Vue-compat: editor patches `app.loadGraphData` AND `app.graph.configure` while open** (Vue Frontend Compatibility Pattern #6).

15. **Window-level scrub listeners must be cached and detached in `forceClose`** — see `_detachTransportListeners` in `transport.mjs`. Also clear `_recomputeTimer` and `_snapTimer`.

16. **Inline-upload wire disconnects are queued, not immediate** — `_queueWireDisconnect(name)` records on `editor._pendingDisconnects`, committed on Save, discarded on Cancel.

17. **Audio is WAV-only on disk** — browser converts MP3/OGG/etc. via `decodeAudio` + `encodeWav` before upload. Do NOT add server-side ffmpeg/pydub.

18. **WebGL2 required, no fallback** — if `getContext("webgl2")` returns null, show clear error.

19. **Approximate-preview carve-outs documented in `docs/audio-react-math.md` §9** — `shake` and `bloom` are exempted from ΔE check in browser harness. Document new exceptions there.
