// ╔═══════════════════════════════════════════════════════════════╗
// ║  LinuxTechLab Shared — Label Editor CSS Injection             ║
// ╚═══════════════════════════════════════════════════════════════╝

let _labelCssInjected = false;
export function injectLabelCSS() {
  if (_labelCssInjected) return;
  _labelCssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
.ltl-lbl-body {
    max-height: 400px; overflow-y: auto; padding-right: 8px;
}
.ltl-lbl-body::-webkit-scrollbar { width: 6px; }
.ltl-lbl-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
.ltl-lbl-body::-webkit-scrollbar-thumb { background: #45475a; border-radius: 10px; }
.ltl-lbl-body::-webkit-scrollbar-thumb:hover { background: #6c7086; }
.ltl-lbl-body { scrollbar-width: thin; scrollbar-color: #45475a rgba(0,0,0,0.1); }
.ltl-lbl-overlay {
    position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Segoe UI', system-ui, sans-serif;
}
.ltl-lbl-panel {
    background: #1e1e2e; border: 1px solid #313244; border-radius: 10px;
    width: 660px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6); position: relative;
}
.ltl-lbl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid #313244;
}
.ltl-lbl-header span { color: #cdd6f4; font-size: 15px; font-weight: 600; }
.ltl-lbl-close {
    background: none; border: none; color: #6c7086; font-size: 20px;
    cursor: pointer; padding: 0 4px; line-height: 1;
}
.ltl-lbl-close:hover { color: #cdd6f4; }
.ltl-lbl-body { padding: 16px 18px; }
.ltl-lbl-field { margin-bottom: 14px; }
.ltl-lbl-field > .ltl-lbl-lbl {
    display: block; color: #6c7086; font-size: 10px; margin-bottom: 5px;
    text-transform: uppercase; letter-spacing: 0.6px;
}
.ltl-lbl-field textarea {
    width: 100%; box-sizing: border-box; background: #181825; border: 1px solid #313244;
    border-radius: 5px; color: #cdd6f4; padding: 8px 10px; font-size: 13px;
    font-family: inherit; outline: none; resize: vertical; min-height: 56px;
}
.ltl-lbl-field textarea:focus { border-color: #89b4fa; }
.ltl-lbl-preview {
    margin-bottom: 14px; background: #11111b; border-radius: 6px; padding: 12px;
    min-height: 36px; display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.ltl-lbl-preview canvas { max-width: 100%; height: auto; }
.ltl-lbl-btns { display: flex; gap: 4px; flex-wrap: wrap; }
.ltl-lbl-btn {
    padding: 5px 12px; border: 1px solid #45475a; border-radius: 4px;
    background: #313244; color: #a6adc8; font-size: 12px; cursor: pointer; transition: all 0.15s;
}
.ltl-lbl-btn:hover { border-color: #6c7086; color: #cdd6f4; }
.ltl-lbl-btn.active { background: #89b4fa; border-color: #89b4fa; color: #1e1e2e; }
.ltl-lbl-bold { font-weight: bold; min-width: 32px; text-align: center; }
.ltl-lbl-range-wrap { display: flex; align-items: center; gap: 8px; }
.ltl-lbl-range-wrap input[type="range"] { flex: 1; accent-color: #89b4fa; }
.ltl-lbl-range-wrap .ltl-lbl-val { color: #6c7086; font-size: 12px; min-width: 32px; text-align: right; }
.ltl-lbl-row { display: flex; gap: 12px; align-items: flex-end; }
.ltl-lbl-row > .ltl-lbl-field { flex: 1; margin-bottom: 0; }
.ltl-lbl-swatches { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; }
.ltl-lbl-swatch {
    width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
    border: 2px solid transparent; transition: border-color 0.15s; box-sizing: border-box;
}
.ltl-lbl-swatch:hover { border-color: #6c7086; }
.ltl-lbl-swatch.active { border-color: #cdd6f4; }
.ltl-lbl-swatch-transp {
    width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
    border: 2px solid transparent; box-sizing: border-box;
    background: repeating-conic-gradient(#45475a 0% 25%, #313244 0% 50%) 50%/10px 10px;
}
.ltl-lbl-swatch-transp:hover { border-color: #6c7086; }
.ltl-lbl-swatch-transp.active { border-color: #cdd6f4; }
.ltl-lbl-color-row { display: flex; align-items: center; gap: 6px; }
.ltl-lbl-color-row input[type="color"] {
    width: 30px; height: 26px; padding: 0; border: 1px solid #45475a;
    border-radius: 4px; background: #181825; cursor: pointer;
}
.ltl-lbl-color-row .ltl-lbl-hex {
    width: 76px; background: #181825; border: 1px solid #313244; border-radius: 4px;
    color: #cdd6f4; padding: 4px 6px; font-size: 11px; font-family: monospace; outline: none;
}
.ltl-lbl-color-row .ltl-lbl-hex:focus { border-color: #89b4fa; }
.ltl-lbl-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 12px 18px; border-top: 1px solid #313244;
}
.ltl-lbl-footer button {
    padding: 8px 20px; border: none; border-radius: 5px;
    font-size: 13px; cursor: pointer; font-weight: 500;
}
.ltl-lbl-btn-cancel { background: #313244; color: #a6adc8; }
.ltl-lbl-btn-cancel:hover { background: #45475a; }
.ltl-lbl-btn-save { background: #89b4fa; color: #1e1e2e; }
.ltl-lbl-btn-save:hover { opacity: 0.9; }
.ltl-lbl-align-icon { display: flex; flex-direction: column; gap: 2px; width: 14px; align-items: flex-start; }
.ltl-lbl-align-icon span { display: block; height: 2px; background: currentColor; border-radius: 1px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(1) { width: 14px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(2) { width: 10px; }
.ltl-lbl-align-left .ltl-lbl-align-icon span:nth-child(3) { width: 12px; }
.ltl-lbl-align-center .ltl-lbl-align-icon { align-items: center; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(1) { width: 14px; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(2) { width: 10px; }
.ltl-lbl-align-center .ltl-lbl-align-icon span:nth-child(3) { width: 12px; }
.ltl-lbl-align-right .ltl-lbl-align-icon { align-items: flex-end; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(1) { width: 14px; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(2) { width: 10px; }
.ltl-lbl-align-right .ltl-lbl-align-icon span:nth-child(3) { width: 12px; }
.ltl-lbl-help-overlay {
    position: absolute; inset: 0; background: #1e1e2e; border-radius: 10px;
    padding: 28px; overflow-y: auto; color: #a6adc8; font-size: 13px; line-height: 1.7; z-index: 10;
}
.ltl-lbl-help-overlay h3 { color: #89b4fa; margin: 0 0 12px 0; font-size: 16px; }
.ltl-lbl-help-overlay p { margin: 0 0 8px 0; }
.ltl-lbl-help-overlay kbd {
    background: #313244; border: 1px solid #45475a; border-radius: 3px;
    padding: 1px 5px; font-size: 11px; font-family: monospace; color: #cdd6f4;
}
.ltl-lbl-help-close {
    position: absolute; top: 12px; right: 16px;
    background: none; border: none; color: #6c7086; font-size: 20px; cursor: pointer;
}
.ltl-lbl-help-close:hover { color: #cdd6f4; }
.ltl-lbl-btn-help { background: #313244; color: #a6adc8; font-size: 12px; padding: 8px 14px; }
.ltl-lbl-btn-help:hover { background: #45475a; color: #cdd6f4; }
`;
  document.head.appendChild(style);
}
