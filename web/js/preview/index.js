import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import { getBrand, getBrandBackground, getTheme } from "../theme/palette.mjs";
import { getLogoSVG } from "../shared/utils.mjs";

// ---- constants ----
const DEFAULT_W = 320;
const DEFAULT_H = 380;
const MIN_W = 224;
const MIN_H = 260;
const TOAST_MS = 2000;

// ---- CSS injection ----
function injectCSS() {
  if (document.getElementById("ltl-preview-css")) return;
  const style = document.createElement("style");
  style.id = "ltl-preview-css";
  style.textContent = `
    .ltl-preview-root {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px 8px;
      background: transparent;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 11px;
    }

    /* ---- buttons ---- */
    .ltl-preview-buttons {
      display: flex;
      gap: 8px;
    }
    .ltl-preview-btn {
      flex: 1;
      height: 26px;
      border: 1px solid #45475a;
      border-radius: 4px;
      background: #313244;
      color: #6c7086;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.08s, border-color 0.08s, color 0.08s;
      pointer-events: auto;
    }
    .ltl-preview-btn.active {
      background: var(--ltl-brand, #89b4fa);
      border-color: var(--ltl-brand, #89b4fa);
      color: #1e1e2e;
    }
    .ltl-preview-btn.active:hover {
      background: #b9d2fc;
      border-color: #b9d2fc;
    }

    /* ---- toast ---- */
    .ltl-preview-toast {
      display: none;
      position: absolute;
      top: 6px;
      left: 8px;
      right: 8px;
      height: 26px;
      background: rgba(17,17,27,0.92);
      border: 1px solid var(--ltl-brand, #89b4fa);
      border-radius: 4px;
      color: #cdd6f4;
      font-size: 11px;
      align-items: center;
      justify-content: center;
      z-index: 10;
      pointer-events: none;
    }
    .ltl-preview-toast.visible {
      display: flex;
    }

    /* ---- image strip ---- */
    .ltl-preview-strip {
      flex: 1;
      min-height: 180px;
      display: flex;
      gap: 4px;
      align-items: stretch;
      overflow: hidden;
      position: relative;
    }
    .ltl-preview-slot {
      flex: 1;
      position: relative;
      cursor: default;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #222;
      border-radius: 2px;
    }
    .ltl-preview-slot img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }
    .ltl-preview-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(0,0,0,0.72);
      color: #fff;
      font-size: 10px;
      font-family: ui-monospace, monospace;
      padding: 1px 5px;
      border-radius: 3px;
      pointer-events: none;
    }
    .ltl-preview-badge.selected {
      background: var(--ltl-brand, #89b4fa);
      color: #1e1e2e;
    }
    .ltl-preview-slot.selected {
      outline: 2px solid var(--ltl-brand, #89b4fa);
      outline-offset: -2px;
      cursor: zoom-in;
    }

    /* ---- fullscreen overlay ---- */
    .ltl-preview-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      cursor: zoom-out;
    }
    .ltl-preview-overlay img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      display: block;
      border-radius: 4px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
      cursor: default;
    }
    .ltl-preview-overlay-footer {
      margin-top: 10px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: #888;
    }
    .ltl-preview-overlay-badge {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.72);
      color: #fff;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      padding: 3px 10px;
      border-radius: 4px;
      pointer-events: none;
    }
    .ltl-preview-overlay-close {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.7);
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      line-height: 1;
    }
    .ltl-preview-overlay-close:hover {
      background: rgba(255,103,68,0.95);
    }
    .ltl-preview-overlay-nav {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: rgba(0,0,0,0.6);
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
    }
    .ltl-preview-overlay-nav.prev {
      left: 20px;
    }
    .ltl-preview-overlay-nav.next {
      right: 20px;
    }
    .ltl-preview-overlay-nav:hover {
      background: rgba(137,180,250,0.3);
    }
    .ltl-preview-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
      width: 100%;
    }
  `;
  document.head.appendChild(style);
}

// ---- frame-loading helpers ----
function buildViewUrl(entry) {
  const params = new URLSearchParams({
    filename: entry.filename,
    subfolder: entry.subfolder || "",
    type: entry.type || "temp",
    t: String(Date.now()),
  });
  return `/view?${params.toString()}`;
}

// ---- blob / data URI helpers ----
async function getPreviewBlob(node) {
  const idx = node._ltlSelectedFrame ?? 0;
  const frame = node._ltlFrames?.[idx];
  if (frame?.url) {
    const resp = await fetch(frame.url);
    if (!resp.ok) throw new Error(`preview fetch failed: ${resp.status}`);
    return await resp.blob();
  }
  return null;
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("FileReader failed"));
    r.readAsDataURL(blob);
  });
}

async function dataURLToBlob(dataURL) {
  const resp = await fetch(dataURL);
  return await resp.blob();
}

function bumpFilenameCounter(name, offset) {
  const m = name.match(/^(.+?_)(\d+)(_\.[^.]+)$/);
  if (!m) return name;
  const newN = String(parseInt(m[2], 10) + offset).padStart(m[2].length, "0");
  return `${m[1]}${newN}${m[3]}`;
}

async function getWorkflowAndPrompt() {
  const { workflow, output } = await app.graphToPrompt();
  return { workflow, prompt: output };
}

function readFilenamePrefix(node) {
  const w = node.widgets?.find((x) => x.name === "filename_prefix");
  const v = (w?.value ?? "img").toString().trim();
  return v || "img";
}

// ---- toast ----
function showToast(toastEl, text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add("visible");
  setTimeout(() => toastEl.classList.remove("visible"), TOAST_MS);
}

// ---- save handlers ----
async function saveToOutput(node, toastEl) {
  if (!node._ltlFrames?.length) {
    showToast(toastEl, "Run the workflow first");
    return;
  }
  try {
    const blob = await getPreviewBlob(node);
    if (!blob) throw new Error("no preview blob");
    const dataURL = await blobToDataURL(blob);
    const { workflow, prompt } = await getWorkflowAndPrompt();
    const resp = await fetch("/linuxtechlab/api/preview/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_b64: dataURL,
        filename_prefix: readFilenamePrefix(node),
        workflow,
        prompt,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      showToast(toastEl, `Save failed: ${data.error || resp.status}`);
      return;
    }
    showToast(toastEl, `Saved: ${data.filename}`);
  } catch (err) {
    showToast(toastEl, `Save failed: ${err.message || err}`);
  }
}

async function saveToDisk(node, toastEl) {
  if (!node._ltlFrames?.length) {
    showToast(toastEl, "Run the workflow first");
    return;
  }
  const idx = node._ltlSelectedFrame ?? 0;
  const frame = node._ltlFrames[idx];
  if (!frame?.url) {
    showToast(toastEl, "No image available");
    return;
  }

  const prefix = readFilenamePrefix(node);
  const ext = frame.filename?.split(".").pop() || "png";
  const suggestedName = `${prefix}.${ext}`;

  try {
    const resp = await fetch(frame.url);
    if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
    const blob = await resp.blob();

    if (typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description: "PNG image", accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        node._ltlDiskOffset = (node._ltlDiskOffset ?? 0) + 1;
        showToast(toastEl, `Saved: ${handle.name}`);
      } catch (err) {
        if (err?.name === "AbortError") return;
        showToast(toastEl, `Save failed: ${err.message || err}`);
      }
      return;
    }

    // Fallback: <a download>
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    node._ltlDiskOffset = (node._ltlDiskOffset ?? 0) + 1;
    showToast(toastEl, "Saved to Downloads");
  } catch (err) {
    showToast(toastEl, `Save failed: ${err.message || err}`);
  }
}

// ---- DOM widget builder ----
function createPreviewWidget(node) {
  injectCSS();

  const brand = getBrand();

  // Root
  const root = document.createElement("div");
  root.className = "ltl-preview-root";
  root.style.setProperty("--ltl-brand", brand);

  // Buttons row
  const btnRow = document.createElement("div");
  btnRow.className = "ltl-preview-buttons";
  btnRow.style.position = "relative";

  const toastEl = document.createElement("div");
  toastEl.className = "ltl-preview-toast";
  btnRow.appendChild(toastEl);

  const diskBtn = document.createElement("button");
  diskBtn.className = "ltl-preview-btn";
  diskBtn.textContent = "Save to Disk";
  diskBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    saveToDisk(node, toastEl);
  });

  const outputBtn = document.createElement("button");
  outputBtn.className = "ltl-preview-btn";
  outputBtn.textContent = "Save to Output";
  outputBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    saveToOutput(node, toastEl);
  });

  btnRow.appendChild(diskBtn);
  btnRow.appendChild(outputBtn);
  root.appendChild(btnRow);

  // Strip
  const strip = document.createElement("div");
  strip.className = "ltl-preview-strip";
  root.appendChild(strip);

  // Dimensions display
  const dimsEl = document.createElement("div");
  dimsEl.style.cssText =
    "text-align:center;font-size:10px;font-family:ui-monospace,monospace;color:#6c7086;min-height:14px;";
  root.appendChild(dimsEl);

  // Update button active state
  function updateButtons() {
    const active = !!node._ltlFrames?.length;
    diskBtn.classList.toggle("active", active);
    outputBtn.classList.toggle("active", active);
  }

  // ---- fullscreen overlay ----
  function openOverlay(startIdx) {
    const frames = node._ltlFrames || [];
    if (!frames.length) return;

    let current = startIdx ?? node._ltlSelectedFrame ?? 0;

    const overlay = document.createElement("div");
    overlay.className = "ltl-preview-overlay";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ltl-preview-overlay-close";
    closeBtn.textContent = "×";
    overlay.appendChild(closeBtn);

    const img = document.createElement("img");
    overlay.appendChild(img);

    const footer = document.createElement("div");
    footer.className = "ltl-preview-overlay-footer";
    overlay.appendChild(footer);

    let badge = null;
    let prevBtn = null;
    let nextBtn = null;

    if (frames.length > 1) {
      badge = document.createElement("div");
      badge.className = "ltl-preview-overlay-badge";
      overlay.appendChild(badge);

      prevBtn = document.createElement("button");
      prevBtn.className = "ltl-preview-overlay-nav prev";
      prevBtn.textContent = "‹";
      overlay.appendChild(prevBtn);

      nextBtn = document.createElement("button");
      nextBtn.className = "ltl-preview-overlay-nav next";
      nextBtn.textContent = "›";
      overlay.appendChild(nextBtn);
    }

    function showFrame(idx) {
      current = ((idx % frames.length) + frames.length) % frames.length;
      img.src = frames[current].url;
      img.onload = () => {
        footer.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      };
      if (badge) badge.textContent = `${current + 1} / ${frames.length}`;
      node._ltlSelectedFrame = current;
      node.properties = node.properties || {};
      node.properties.ltlSelected = current;
      renderStrip();
    }

    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (frames.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showFrame(current - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showFrame(current + 1);
      }
    }

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
    });
    overlay.addEventListener("click", close);
    img.addEventListener("click", (e) => e.stopPropagation());
    if (prevBtn)
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showFrame(current - 1);
      });
    if (nextBtn)
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showFrame(current + 1);
      });
    document.addEventListener("keydown", onKey);

    document.body.appendChild(overlay);
    showFrame(current);
  }

  // Render strip — click opens fullscreen overlay
  function renderStrip() {
    strip.innerHTML = "";
    const frames = node._ltlFrames || [];
    if (!frames.length) {
      dimsEl.textContent = "";
      const placeholder = document.createElement("div");
      placeholder.className = "ltl-preview-placeholder";
      placeholder.style.backgroundImage = `url("${getLogoSVG(getBrand(), getBrandBackground(), 75)}")`;
      placeholder.style.backgroundRepeat = "no-repeat";
      placeholder.style.backgroundPosition = "center";
      placeholder.style.backgroundSize = "75px 75px";
      strip.appendChild(placeholder);
      return;
    }

    const sel = node._ltlSelectedFrame ?? 0;

    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const slot = document.createElement("div");
      slot.className = "ltl-preview-slot" + (i === sel && frames.length > 1 ? " selected" : "");

      const img = document.createElement("img");
      img.src = f.url;
      if (i === sel) {
        img.onload = () => {
          dimsEl.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
        };
      }
      slot.appendChild(img);

      if (frames.length > 1) {
        const badge = document.createElement("div");
        badge.className = "ltl-preview-badge" + (i === sel ? " selected" : "");
        badge.textContent = `${i + 1} / ${frames.length}`;
        slot.appendChild(badge);
      }

      slot.addEventListener("click", (e) => {
        e.stopPropagation();
        if (i === node._ltlSelectedFrame) {
          openOverlay(i);
        } else {
          node._ltlSelectedFrame = i;
          node.properties = node.properties || {};
          node.properties.ltlSelected = i;
          renderStrip();
        }
      });

      strip.appendChild(slot);
    }
  }

  // Public render function
  function render() {
    updateButtons();
    renderStrip();
  }

  // Initial render — show placeholder
  render();

  // Expose render on node for external calls
  node._ltlRender = render;

  return root;
}

// ---- hydrate frames ----
function hydrateFrames(node, framesMeta) {
  node._ltlFrames = framesMeta.map((f) => ({
    filename: f.filename,
    subfolder: f.subfolder || "",
    type: f.type || "temp",
    url: buildViewUrl(f),
  }));
  if ((node._ltlSelectedFrame ?? 0) >= framesMeta.length) {
    node._ltlSelectedFrame = 0;
  }
  node._ltlRender?.();
}

// ---- restore from properties ----
function restoreFromProperties(node) {
  if (node._ltlFrames?.length) return;
  const saved = node.properties?.ltlFrames;
  if (!Array.isArray(saved) || !saved.length) return;
  // Skip temp frames on restore — they don't survive a server restart
  const persistent = saved.filter((f) => f.type === "output");
  if (!persistent.length) return;
  node._ltlSelectedFrame = node.properties?.ltlSelected ?? 0;
  node._ltlExpanded = !!node.properties?.ltlExpanded;
  hydrateFrames(node, persistent);
}

// ---- extension ----
app.registerExtension({
  name: "LinuxTechLab.Preview",

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "LinuxTechLab_Preview") return;

    const origNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      if (origNodeCreated) origNodeCreated.apply(this, arguments);

      const root = createPreviewWidget(this);
      this.addDOMWidget("ltl_preview_widget", "custom", root, {
        serialize: false,
        getMinHeight: () => MIN_H - 46,
      });

      if (!this.size || this.size[0] < DEFAULT_W) this.size[0] = DEFAULT_W;
      if (!this.size[1] || this.size[1] < DEFAULT_H) this.size[1] = DEFAULT_H;

      queueMicrotask(() => restoreFromProperties(this));
    };

    const origConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      const r = origConfigure ? origConfigure.apply(this, arguments) : undefined;
      restoreFromProperties(this);
      return r;
    };

    const origResize = nodeType.prototype.onResize;
    nodeType.prototype.onResize = function (size) {
      if (origResize) origResize.apply(this, arguments);
      if (this.size[0] < MIN_W) this.size[0] = MIN_W;
      if (this.size[1] < MIN_H) this.size[1] = MIN_H;
    };

    const origRemoved = nodeType.prototype.onRemoved;
    nodeType.prototype.onRemoved = function () {
      return origRemoved ? origRemoved.apply(this, arguments) : undefined;
    };
  },
});

// ---- executed event ----
api.addEventListener("executed", ({ detail }) => {
  const frames = detail?.output?.linuxtechlab_preview_frames;
  if (!frames || !frames.length) return;

  let node = app.graph.getNodeById(detail.node);
  if (!node && typeof detail.node === "string") {
    node = app.graph.getNodeById(parseInt(detail.node, 10));
  }
  if (!node || node.type !== "LinuxTechLab_Preview") return;

  node.properties = node.properties || {};
  node.properties.ltlFrames = frames.map((f) => ({
    filename: f.filename,
    subfolder: f.subfolder || "",
    type: f.type || "temp",
  }));
  if ((node._ltlSelectedFrame ?? 0) >= frames.length) {
    node._ltlSelectedFrame = 0;
  }
  node.properties.ltlSelected = node._ltlSelectedFrame ?? 0;
  node._ltlDiskOffset = 0;
  hydrateFrames(node, node.properties.ltlFrames);
});
