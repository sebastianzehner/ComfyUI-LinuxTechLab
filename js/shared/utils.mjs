// ╔═══════════════════════════════════════════════════════════════╗
// ║  LinuxTechLab Shared — Constants & Utility Functions          ║
// ╚═══════════════════════════════════════════════════════════════╝

import { getBrand } from "../theme/palette.mjs";

export const allow_debug = true;

export const LINUXTECHLAB_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="264.797 214.493 968.385 1071.832">
  <path fill="#89b4fa" d="M 118.135696 903.455933 L 206.49971 903.455933 L 206.49971 991.895386 L 118.135696 991.895386 Z"/>
  <path fill="#89b4fa" d="M 263.03775 903.455933 L 351.401672 903.455933 L 351.401672 991.895386 L 263.03775 991.895386 Z"/>
  <path fill="#89b4fa" d="M 411.459137 903.455933 L 499.848389 903.455933 L 499.848389 991.895386 L 411.459137 991.895386 Z"/>
  <path fill="#89b4fa" d="M 556.386169 903.455933 L 644.72522 903.455933 L 644.72522 991.895386 L 556.386169 991.895386 Z"/>
  <path fill="#89b4fa" d="M 704.782532 903.455933 L 793.146667 903.455933 L 793.146667 991.895386 L 704.782532 991.895386 Z"/>
  <path fill="#89b4fa" d="M 849.709534 903.455933 L 938.073608 903.455933 L 938.073608 991.895386 L 849.709534 991.895386 Z"/>
  <path fill="#89b4fa" d="M 998.105835 903.455933 L 1086.520142 903.455933 L 1086.520142 991.895386 L 998.105835 991.895386 Z"/>
  <path fill="#89b4fa" d="M 1143.083252 903.455933 L 1231.447144 903.455933 L 1231.447144 991.895386 L 1143.083252 991.895386 Z"/>
  <path fill="#89b4fa" d="M 118.135696 1050.042236 L 206.49971 1050.042236 L 206.49971 1138.380859 L 118.135696 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 263.03775 1050.042236 L 351.401672 1050.042236 L 351.401672 1138.380859 L 263.03775 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 411.459137 1050.042236 L 499.848389 1050.042236 L 499.848389 1138.380859 L 411.459137 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 556.386169 1050.042236 L 644.72522 1050.042236 L 644.72522 1138.380859 L 556.386169 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 704.782532 1050.042236 L 793.146667 1050.042236 L 793.146667 1138.380859 L 704.782532 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 849.709534 1050.042236 L 938.073608 1050.042236 L 938.073608 1138.380859 L 849.709534 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 998.105835 1050.042236 L 1086.520142 1050.042236 L 1086.520142 1138.380859 L 998.105835 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 1143.083252 1050.042236 L 1231.447144 1050.042236 L 1231.447144 1138.380859 L 1143.083252 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 118.135696 1197.98584 L 206.49971 1197.98584 L 206.49971 1286.324707 L 118.135696 1286.324707 Z"/>
  <path fill="#89b4fa" d="M 263.03775 1197.98584 L 351.401672 1197.98584 L 351.401672 1286.324707 L 263.03775 1286.324707 Z"/>
  <path fill="#89b4fa" d="M 411.459137 1197.98584 L 1086.520142 1197.98584 L 1086.520142 1286.324707 L 411.459137 1286.324707 Z"/>
  <path fill="#89b4fa" d="M 1143.083252 1197.98584 L 1231.447144 1197.98584 L 1231.447144 1286.324707 L 1143.083252 1286.324707 Z"/>
  <path fill="#89b4fa" d="M 1292.661255 903.455933 L 1381 903.455933 L 1381 991.895386 L 1292.661255 991.895386 Z"/>
  <path fill="#89b4fa" d="M 1292.661255 1050.042236 L 1381 1050.042236 L 1381 1138.380859 L 1292.661255 1138.380859 Z"/>
  <path fill="#89b4fa" d="M 1292.661255 1197.98584 L 1381 1197.98584 L 1381 1286.324707 L 1292.661255 1286.324707 Z"/>
  <path fill="#89b4fa" d="M 264.797363 214.492676 L 1233.181885 214.492676 L 1233.181885 819.340088 L 264.797363 819.340088 Z"/>
</svg>
`)}`;

const LOGO_URL = "/linuxtechlab/assets/techlab_logo.png";

export function createDummyWidget(titleText, subtitleText, instructionText) {
  const imgSrc = LINUXTECHLAB_LOGO;
  const container = document.createElement("div");
  container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 20px;
      background-color: #11111b;
      border-radius: 8px;
      width: 100%;
      height: 100%;
      color: #cdd6f4;
      font-family: sans-serif;
      text-align: center;
      box-sizing: border-box;
    `;

  const logo = document.createElement("img");
  logo.src = imgSrc || "";
  logo.style.cssText = `
      width: 45px;
      height: auto;
      margin-bottom: 10px;
    `;
  container.appendChild(logo);

  const title = document.createElement("div");
  title.innerText = titleText;
  title.style.cssText = `
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    `;
  container.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.innerText = subtitleText;
  subtitle.style.cssText = `
      font-size: 18px;
      font-weight: 700;
      color: #89b4fa;
      margin: 0;
      line-height: 1.2;
    `;
  container.appendChild(subtitle);

  const instruction = document.createElement("div");
  instruction.innerText = instructionText;
  instruction.style.cssText = `
      font-size: 10px;
      color: #1e1e2e;
      margin-top: 12px;
    `;
  container.appendChild(instruction);

  return container;
}

export function installFocusTrap(overlay) {
  const trap = document.createElement("textarea");
  trap.dataset.linuxtechlabTrap = "1";
  trap.setAttribute("aria-hidden", "true");
  trap.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";
  overlay.appendChild(trap);
  trap.focus();
  const refocus = (e) => {
    const t = e.target;
    const tag = t?.tagName;
    // Exempt contenteditable regions (e.g. Note LinuxTechLab editor) — refocusing
    // the hidden trap on mouseup would steal focus mid-typing.
    if (t?.isContentEditable || t?.closest?.('[contenteditable="true"]')) return;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
      requestAnimationFrame(() => trap.focus());
    }
  };
  overlay.addEventListener("mouseup", refocus);
  return trap;
}

export function hideJsonWidget(widgets, widgetName) {
  const w = (widgets || []).find((x) => x.name === widgetName);
  if (w) {
    w.hidden = true;
    w.computeSize = () => [0, -4];
    if (w.element) w.element.style.display = "none";
    requestAnimationFrame(() => {
      if (w.element) w.element.style.display = "none";
      if (w.inputEl) w.inputEl.style.display = "none";
    });
  }
  return w;
}

export function restorePreview(node, widgetName, app) {
  const w = (node.widgets || []).find((x) => x.name === widgetName);
  if (!w?.value || w.value === "{}") return;
  try {
    const meta = JSON.parse(w.value);
    if (!meta.composite_path) return;
    const img = new Image();
    img.onload = () => {
      node.imgs = [img];
      app.graph.setDirtyCanvas(true, true);
    };
    const fn = meta.composite_path.split(/[\\/]/).pop();
    img.src = `/view?filename=${encodeURIComponent(fn)}&type=input&subfolder=linuxtechlab&t=${Date.now()}`;
  } catch (e) {
    console.warn("[LinuxTechLab] restore failed:", e);
  }
}

export function resizeNode(node, img, app) {
  const BASE_WIDTH = 380;
  node.size[0] = Math.max(node.size[0] || BASE_WIDTH, BASE_WIDTH);
  const aspect = img.naturalWidth / img.naturalHeight;
  node.size[1] = node.size[0] / aspect + 80;
  app.graph.setDirtyCanvas(true, true);
}

export function getLogo(cb) {
  let _logoCache = null;
  let _logoLoading = false;
  let _logoCbs = [];

  if (_logoCache) {
    cb(_logoCache);
    return;
  }
  _logoCbs.push(cb);
  if (_logoLoading) return;
  _logoLoading = true;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    _logoCache = img;
    _logoCbs.forEach((fn) => fn(img));
    _logoCbs = [];
  };
  img.onerror = () => {
    _logoCbs.forEach((fn) => fn(null));
    _logoCbs = [];
  };
  img.src = LOGO_URL;
}

export function createPlaceholder(name, buttonLabel, node, app) {
  getLogo((logo) => {
    const cvs = document.createElement("canvas");
    cvs.width = 480;
    cvs.height = 270;
    const ctx = cvs.getContext("2d");
    ctx.fillStyle = "#11111b";
    ctx.fillRect(0, 0, 480, 270);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 480; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 270);
      ctx.stroke();
    }
    for (let y = 0; y < 270; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }
    if (logo) ctx.drawImage(logo, 220, 65, 40, 40);
    ctx.fillStyle = "#cdd6f4";
    ctx.font = "bold 16px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, 240, 128);
    ctx.fillStyle = getBrand();
    ctx.fillText("LinuxTechLab", 240, 150);
    ctx.fillStyle = "#1e1e2e";
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("Click '" + buttonLabel + "' to start", 240, 175);
    const prev = new Image();
    prev.onload = () => {
      node.imgs = [prev];
      resizeNode(node, prev, app);
    };
    prev.src = cvs.toDataURL();
  });
}

export async function downloadDataURL(dataURL, suggestedName = "linuxtechlab_export.png") {
  if (!dataURL) return;
  const mimeMatch = dataURL.match(/^data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const ext = mime === "image/jpeg" ? "jpg" : "png";
  const name = suggestedName.endsWith(`.${ext}`) ? suggestedName : `${suggestedName}.${ext}`;

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: "Image", accept: { [mime]: [`.${ext}`] } }],
      });
      const blob = await (await fetch(dataURL)).blob();
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
      console.warn("[LinuxTechLab] showSaveFilePicker failed, falling back:", e);
    }
  }
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = name;
  a.click();
}
