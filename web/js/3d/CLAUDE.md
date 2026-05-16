# js/3d/CLAUDE.md

Detailed patterns for the 3D Builder. Regressing any of these reintroduces specific bugs.

## File Structure
| File | Purpose |
|------|---------|
| `index.js` | Entry: ComfyUI extension registration |
| `core.mjs` | Class shell, UI building, Three.js lazy loading |
| `engine.mjs` | Three.js scene/renderer/camera init, animation |
| `objects.mjs` | Object CRUD, selection, geometry, materials, layer thumbs |
| `shapes.mjs` | Shape registry: id → { icon, label, build, params, defaults, live } |
| `shape_params.mjs` | Per-object Shape panel (right sidebar) + geometry rebuild |
| `composites.mjs` | Multi-mesh Groups registry + builders |
| `picker.mjs` | "Add 3D Object" modal picker |
| `importer.mjs` | GLB/OBJ lazy loaders + wrapImportPivot |
| `interaction.mjs` | Tools, camera views, keyboard, undo/redo |
| `persistence.mjs` | Save/restore scene JSON, background image |
| `api.mjs` | ThreeDAPI backend calls |

## Critical Patterns

1. **Use `Box3.setFromObject(o, true)` — ALWAYS pass `precise=true`** for drop-to-floor, auto-frame, and any bbox measurement on a rotated object. Without it, Three.js returns a LOOSE AABB that can be √2× larger along Y.

2. **Composites must have `skipPivotWrap: true`** — they're built with pivot at base-center already. Re-centering via `wrapImportPivot` drifts the pivot every rebuild.

3. **Primitive restore must merge `geoParams` over shape defaults** — `{ ...getShapeDefaults(type), ...savedGeoParams }`. Without the merge, v1 saves missing newer params deserialize with `undefined` and produce NaN geometry.

4. **Composite restore is SYNCHRONOUS** — use static import of `prepareImportedGroup`. Dynamic `import()` + placeholder-sphere-swap produces visible sphere flicker on every undo/load.

5. **Undo preserves async groups by id** — `_applySnap` must match `userData.id` against the target snapshot and REUSE existing imports/bunnies instead of disposing + refetching.

6. **Shape panel sliders debounce on heavy shapes** — entries with `live: false` (terrain, blob, rock, teapot) debounce slider rebuilds to prevent browser freezing.

7. **Seam welding must be normal-aware** — `weldSeamByPosition(geo, tolerance, normalThreshold)` clusters by NORMAL direction, not just position. Threshold 0.5 preserves hard edges.

8. **Thickness for vessels uses `thickVesselProfile(outer, wall, baseT)`** — goblet is a special case and writes its own closed profile manually.

9. **Layer thumbnails use a secondary WebGLRenderer** — `_getThumbRenderer()` in `objects.mjs`. Must be disposed with `forceContextLoss()` in `onCleanup` or Chrome caps at ~16 contexts.

10. **Post-processing camera swap** — when `_setPerspective` toggles, must update `this._renderPass.camera` AND `this._outlinePass.renderCamera`.

11. **Keyboard shortcuts use `e.code`, not `e.key`** — `Digit1`, `Digit2`, `Numpad1` etc. Layout-independent.

12. **CSS isolation** — scope all injected styles to `.p3d-workspace`, NOT `.pxf-workspace`. See `js/framework/CLAUDE.md`.
