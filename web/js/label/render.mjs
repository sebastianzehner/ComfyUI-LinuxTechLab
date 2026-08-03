// ─── Defaults ────────────────────────────────────────────────
export const DEFAULTS = {
  text: "Label LinuxTechLab",
  fontSize: 40,
  fontFamily: "CaskaydiaCove Nerd Font",
  fontColor: "#cdd6f4",
  textAlign: "left",
  backgroundColor: "#1e1e2e",
  padding: 10,
  borderRadius: 10,
  opacity: 0.85,
  fontWeight: "normal",
  lineHeight: 1,
};

export const FONT_CHOICES = ["CaskaydiaCove Nerd Font", "DejaVu Sans", "Arial", "Times New Roman"];
export const FONT_SHORT = ["CaskaydiaCove", "DejaVu", "Arial", "Times"];

// Color swatches
export const TEXT_SWATCHES = [
  "#cdd6f4", // Text
  "#bac2de", // Subtext1
  "#a6adc8", // Subtext0
  "#6c7086", // Overlay1
  "#313244", // Surface0
  "#89b4fa", // Blue
  "#cba6f7", // Mauve
  "#f38ba8", // Red
  "#a6e3a1", // Green
  "#f9e2af", // Yellow
  "#fab387", // Peach
  "#94e2d5", // Teal
  "#89dceb", // Sky
  "#74c7ec", // Sapphire
  "#f5c2e7", // Pink
];
export const BG_SWATCHES = [
  "#1e1e2e", // Base
  "#181825", // Mantle
  "#11111b", // Crust
  "#313244", // Surface0
  "#45475a", // Surface1
  "#89b4fa", // Blue
  "#1e1e3e", // Base + Blue tint
  "#1e2e1e", // Base + Green tint
  "#2e1e2e", // Base + Mauve tint
  "#2e2e1e", // Base + Yellow tint
  "#f38ba822", // Red transparent
  "#a6e3a122", // Green transparent
  "#89b4fa22", // Blue transparent
  "#f9e2af22", // Yellow transparent
  "#cba6f722", // Mauve transparent
];

// ─── Helpers ─────────────────────────────────────────────────
export function fontStr(cfg) {
  return `${cfg.fontWeight === "bold" ? "bold " : ""}${cfg.fontSize}px '${cfg.fontFamily}', 'Segoe UI Emoji', 'Noto Color Emoji', system-ui, sans-serif`;
}

export function measureLabel(cfg) {
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  ctx.font = fontStr(cfg);
  const lines = (cfg.text || "").split("\n");
  const lh = cfg.fontSize * cfg.lineHeight;
  let maxW = 0;
  for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line).width);
  return {
    w: Math.ceil(maxW) + cfg.padding * 2,
    h: Math.ceil(lines.length * lh) + cfg.padding * 2,
    lines,
    lh,
  };
}

// ─── Canvas rendering (shared by preview and node draw) ──────
export function renderLabelToCanvas(ctx, cfg, m, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = cfg.opacity;
  if (cfg.backgroundColor !== "transparent") {
    ctx.fillStyle = cfg.backgroundColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, m.w, m.h, cfg.borderRadius);
    else ctx.rect(0, 0, m.w, m.h);
    ctx.fill();
  }
  ctx.font = fontStr(cfg);
  ctx.fillStyle = cfg.fontColor;
  ctx.textBaseline = "top";
  ctx.textAlign = cfg.textAlign;
  let tx = cfg.padding;
  if (cfg.textAlign === "center") tx = m.w / 2;
  else if (cfg.textAlign === "right") tx = m.w - cfg.padding;
  for (let i = 0; i < m.lines.length; i++) {
    ctx.fillText(m.lines[i], tx, cfg.padding + i * m.lh);
  }
  ctx.globalAlpha = 1;
}

// ─── CSS injection (once) ────────────────────────────────────
let _cssInjected = false;
export function injectCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
.ltl-lbl-overlay {
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Segoe UI', system-ui, sans-serif;
}
.ltl-lbl-panel {
    background: #1e1e2e; border: 1px solid #313244; border-radius: 10px;
    width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 16px 48px rgba(0,0,0,0.7); position: relative;
    scrollbar-width: thin; scrollbar-color: #45475a transparent;
}
.ltl-lbl-panel::-webkit-scrollbar { width: 5px; }
.ltl-lbl-panel::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
.ltl-lbl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-bottom: 1px solid #313244; position: sticky; top: 0;
    background: #1e1e2e; z-index: 1;
}
.ltl-lbl-title { display: flex; align-items: center; gap: 6px; color: #cdd6f4; font-size: 13px; font-weight: 600; letter-spacing: 0.2px; }
.ltl-lbl-title-logo { width: 18px; height: 18px; }
.ltl-lbl-title-brand { color: var(--ltl-brand); }
.ltl-lbl-close {
    background: none; border: none; color: #6c7086; font-size: 18px;
    cursor: pointer; padding: 0 2px; line-height: 1;
}
.ltl-lbl-close:hover { color: #cdd6f4; }
.ltl-lbl-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.ltl-lbl-lbl {
    display: block; color: #6c7086; font-size: 9px; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;
}
.ltl-lbl-field textarea {
    width: 100%; box-sizing: border-box;
    background: #181825; border: 1px solid #313244; border-radius: 5px;
    color: #cdd6f4; padding: 7px 9px; font-size: 13px;
    font-family: inherit; outline: none; resize: vertical; min-height: 46px;
}
.ltl-lbl-field textarea:focus { border-color: var(--ltl-brand); }
.ltl-lbl-preview {
    background: #11111b; border-radius: 5px; border: 1px solid #313244;
    padding: 8px; min-height: 28px; display: flex;
    align-items: center; justify-content: center; overflow: hidden;
}
.ltl-lbl-preview canvas { max-width: 100%; height: auto; }
.ltl-lbl-btns { display: flex; gap: 3px; flex-wrap: wrap; align-items: center; }
.ltl-lbl-btn {
    padding: 4px 10px; border: 1px solid #45475a; border-radius: 4px;
    background: #313244; color: #a6adc8; font-size: 11px; cursor: pointer;
    transition: all 0.12s; line-height: 1.4;
}
.ltl-lbl-btn:hover { border-color: #6c7086; color: #cdd6f4; }
.ltl-lbl-btn.active { background: var(--ltl-brand)22; border-color: var(--ltl-brand); color: var(--ltl-brand); }
.ltl-lbl-bold { font-weight: bold; min-width: 26px; text-align: center; }
.ltl-lbl-range-wrap { display: flex; align-items: center; gap: 6px; }
.ltl-lbl-range-wrap input[type="range"] { flex: 1; accent-color: var(--ltl-brand); height: 3px; }
.ltl-lbl-range-wrap .ltl-lbl-val {
    color: #6c7086; font-size: 11px; min-width: 28px; text-align: right; font-variant-numeric: tabular-nums;
}
.ltl-lbl-range-wrap input.ltl-lbl-num {
    width: 44px; box-sizing: border-box;
    background: var(--ltl-background-darkest); border: 1px solid var(--ltl-surface); border-radius: 3px;
    color: var(--ltl-subtext); padding: 3px 5px; font-size: 11px; font-family: monospace;
    text-align: center; outline: none; font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    -moz-appearance: textfield;
}
.ltl-lbl-range-wrap input.ltl-lbl-num::-webkit-outer-spin-button,
.ltl-lbl-range-wrap input.ltl-lbl-num::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0;
}
.ltl-lbl-range-wrap input.ltl-lbl-num:focus { border-color: var(--ltl-brand); }
/* Divider inside button row */
.ltl-lbl-vsep { width: 1px; height: 16px; background: var(--ltl-overlay); margin: 0 3px; flex-shrink: 0; }
/* 2-col color grid */
.ltl-lbl-color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ltl-lbl-color-col { min-width: 0; }
.ltl-lbl-swatches { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 5px; }
.ltl-lbl-swatch {
    width: 20px; height: 20px; border-radius: 3px; cursor: pointer;
    border: 2px solid transparent; transition: border-color 0.12s;
    box-sizing: border-box;
}
.ltl-lbl-swatch:hover { border-color: #6c7086; }
.ltl-lbl-swatch.active { border-color: #cdd6f4; }
.ltl-lbl-swatch-transp {
    width: 20px; height: 20px; border-radius: 3px; cursor: pointer;
    border: 2px solid transparent; box-sizing: border-box;
    background: repeating-conic-gradient(#45475a 0% 25%, #313244 0% 50%) 50%/8px 8px;
}
.ltl-lbl-swatch-transp:hover { border-color: #6c7086; }
.ltl-lbl-swatch-transp.active { border-color: #cdd6f4; }
.ltl-lbl-color-row { display: flex; align-items: center; gap: 5px; }
.ltl-lbl-color-row input[type="color"] {
    width: 26px; height: 22px; padding: 0; border: 1px solid #45475a;
    border-radius: 3px; background: #181825; cursor: pointer; flex-shrink: 0;
}
.ltl-lbl-color-row .ltl-lbl-hex {
    flex: 1; min-width: 0; background: #181825; border: 1px solid #313244; border-radius: 3px;
    color: #a6adc8; padding: 3px 5px; font-size: 11px; font-family: monospace; outline: none;
}
.ltl-lbl-color-row .ltl-lbl-hex:focus { border-color: var(--ltl-brand); }
.ltl-lbl-spacing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
.ltl-lbl-spacing-field { min-width: 0; }
.ltl-lbl-footer {
    display: flex; justify-content: flex-end; align-items: center; gap: 6px;
    padding: 8px 14px; border-top: 1px solid #313244; position: sticky; bottom: 0;
    background: #1e1e2e;
}
.ltl-lbl-footer button {
    padding: 6px 16px; border: none; border-radius: 5px;
    font-size: 12px; cursor: pointer; font-weight: 500;
}
.ltl-lbl-btn-cancel { background: #313244; color: #a6adc8; border: 1px solid #45475a; }
.ltl-lbl-btn-cancel:hover { background: #45475a; }
.ltl-lbl-btn-save { background: var(--ltl-brand); color: #1e1e2e; border: 1px solid transparent; }
.ltl-lbl-btn-save:hover { opacity: 0.88; }
.ltl-lbl-align-icon { display: flex; flex-direction: column; gap: 2px; width: 13px; align-items: flex-start; }
.ltl-lbl-align-icon span { display: block; height: 2px; background: currentColor; border-radius: 1px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(1) { width: 13px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(2) { width: 9px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(3) { width: 11px; }
.ltl-lbl-align-center .ltl-lbl-align-icon { align-items: center; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(1) { width: 13px; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(2) { width: 9px; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(3) { width: 11px; }
.ltl-lbl-align-right .ltl-lbl-align-icon { align-items: flex-end; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(1) { width: 13px; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(2) { width: 9px; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(3) { width: 11px; }
.ltl-lbl-help-overlay {
    position: absolute; inset: 0; background: #1e1e2e;
    border-radius: 10px; padding: 22px 20px; overflow-y: auto;
    color: #a6adc8; font-size: 12px; line-height: 1.65; z-index: 10;
}
.ltl-lbl-help-overlay h3 { color: var(--ltl-brand); margin: 0 0 10px 0; font-size: 14px; }
.ltl-lbl-help-overlay p { margin: 0 0 6px 0; }
.ltl-lbl-help-overlay kbd {
    background: #313244; border: 1px solid #45475a; border-radius: 3px;
    padding: 1px 4px; font-size: 10px; font-family: monospace; color: #cdd6f4;
}
.ltl-lbl-help-close {
    position: absolute; top: 10px; right: 14px;
    background: none; border: none; color: #6c7086; font-size: 18px; cursor: pointer;
}
.ltl-lbl-help-close:hover { color: #cdd6f4; }
.ltl-lbl-btn-help { background: none; border: none; color: #6c7086; font-size: 11px; padding: 6px 8px; margin-right: auto; }
.ltl-lbl-btn-help:hover { color: #a6adc8; }
`;
  document.head.appendChild(style);
}
