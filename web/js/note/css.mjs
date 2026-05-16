let _injected = false;

export function injectCSS() {
  if (_injected) return;
  _injected = true;
  const s = document.createElement("style");
  s.setAttribute("data-linuxtechlab-note", "1");
  s.textContent = `
/* ── On-canvas node body ───────────────────────────────────── */
.pix-note-body {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Segoe UI", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #cdd6f4;
  word-wrap: break-word;
  user-select: text;
  text-decoration: none !important;
  text-shadow: none;
}
.pix-note-body::-webkit-scrollbar { width: 6px; }
.pix-note-body::-webkit-scrollbar-track { background: transparent; }
.pix-note-body::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
.pix-note-body::-webkit-scrollbar-thumb:hover { background: var(--ltl-brand); }
.pix-note-body h1 { font-size: 20px; font-weight: 700; margin: 4px 0 8px; color: #cdd6f4; }
.pix-note-body h2 { font-size: 16px; font-weight: 700; margin: 10px 0 6px; color: #cdd6f4; }
.pix-note-body h3 { font-size: 14px; font-weight: 700; margin: 8px 0 4px; color: #cdd6f4; }
.pix-note-body p  { margin: 6px 0; }
.pix-note-body hr { border: none; border-top: 1px solid var(--pix-note-line, var(--ltl-brand)); margin: 10px 0; }
.pix-note-body ul, .pix-note-body ol { margin: 4px 0 4px 20px; padding: 0; }
.pix-note-body li { margin: 2px 0; }
.pix-note-body code {
  background: #313244; padding: 0 5px; border-radius: 3px;
  font-family: "Consolas", "Courier New", monospace; font-size: 0.92em;
}
.pix-note-body pre {
  position: relative;
  background: #11111b; border: 1px solid #313244; border-radius: 4px;
  padding: 8px 10px; overflow-x: auto; margin: 8px 0;
  font-family: "Consolas", "Courier New", monospace; font-size: 12px;
}
.pix-note-body pre code { background: transparent; padding: 0; }
.pix-note-copybtn {
  position: absolute; top: 4px; right: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; padding: 0;
  background: rgba(0,0,0,0.55); border: 1px solid #313244; border-radius: 3px;
  cursor: pointer; opacity: 0; transition: opacity 120ms, background 120ms;
}
.pix-note-body pre:hover .pix-note-copybtn { opacity: 0.9; }
.pix-note-copybtn:hover { background: var(--ltl-brand); border-color: var(--ltl-brand); opacity: 1; }
.pix-note-copybtn.copied { background: #a6e3a1; border-color: #a6e3a1; opacity: 1; }
.pix-note-copybtn img {
  width: 12px; height: 12px; pointer-events: none;
  filter: brightness(0) invert(1);
}
.pix-note-body a { color: var(--ltl-brand); text-decoration: underline; cursor: pointer; }
.pix-note-body a:hover { text-decoration: none; }
.pix-note-body label { display: inline-flex; align-items: center; gap: 6px; cursor: default; }

.pix-note-placeholder {
  color: #6c7086; font-style: italic; pointer-events: none;
  text-decoration: none !important;
}

.pix-note-body a.pix-note-dl,
.pix-note-body a.pix-note-yt,
.pix-note-body a.pix-note-discord,
.pix-note-body a.pix-note-vp,
.pix-note-body a.pix-note-rm,
.pix-note-editarea a.pix-note-dl,
.pix-note-editarea a.pix-note-yt,
.pix-note-editarea a.pix-note-discord,
.pix-note-editarea a.pix-note-vp,
.pix-note-editarea a.pix-note-rm,
.pix-note-prevwrap a.pix-note-dl,
.pix-note-prevwrap a.pix-note-yt,
.pix-note-prevwrap a.pix-note-discord,
.pix-note-prevwrap a.pix-note-vp,
.pix-note-prevwrap a.pix-note-rm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  margin: 2px;
  color: #1e1e2e;
  border-radius: 4px;
  text-decoration: none !important;
  font-weight: 600;
  font-size: 11px;
  line-height: 1.2;
  box-shadow: none;
  cursor: pointer;
  vertical-align: middle;
}
.pix-note-body a.pix-note-dl,
.pix-note-editarea a.pix-note-dl,
.pix-note-prevwrap a.pix-note-dl,
.pix-note-body a.pix-note-vp,
.pix-note-editarea a.pix-note-vp,
.pix-note-prevwrap a.pix-note-vp,
.pix-note-body a.pix-note-rm,
.pix-note-editarea a.pix-note-rm,
.pix-note-prevwrap a.pix-note-rm {
  background: var(--pix-note-btn, var(--ltl-brand));
}
.pix-note-body a.pix-note-yt,
.pix-note-editarea a.pix-note-yt,
.pix-note-prevwrap a.pix-note-yt { background: #f38ba8; }
.pix-note-body a.pix-note-discord,
.pix-note-editarea a.pix-note-discord,
.pix-note-prevwrap a.pix-note-discord { background: #5865f2; }
.pix-note-body a.pix-note-dl:hover,
.pix-note-body a.pix-note-yt:hover,
.pix-note-body a.pix-note-discord:hover,
.pix-note-body a.pix-note-vp:hover,
.pix-note-body a.pix-note-rm:hover,
.pix-note-editarea a.pix-note-dl:hover,
.pix-note-editarea a.pix-note-yt:hover,
.pix-note-editarea a.pix-note-discord:hover,
.pix-note-editarea a.pix-note-vp:hover,
.pix-note-editarea a.pix-note-rm:hover { filter: brightness(1.1); }

.pix-note-body a.pix-note-dl::before,
.pix-note-body a.pix-note-yt::before,
.pix-note-body a.pix-note-discord::before,
.pix-note-body a.pix-note-vp::before,
.pix-note-body a.pix-note-rm::before,
.pix-note-editarea a.pix-note-dl::before,
.pix-note-editarea a.pix-note-yt::before,
.pix-note-editarea a.pix-note-discord::before,
.pix-note-editarea a.pix-note-vp::before,
.pix-note-editarea a.pix-note-rm::before,
.pix-note-prevwrap a.pix-note-dl::before,
.pix-note-prevwrap a.pix-note-yt::before,
.pix-note-prevwrap a.pix-note-discord::before,
.pix-note-prevwrap a.pix-note-vp::before,
.pix-note-prevwrap a.pix-note-rm::before {
  content: "";
  display: inline-block;
  width: 12px; height: 12px;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center; mask-position: center;
  -webkit-mask-size: contain;    mask-size: contain;
}
.pix-note-body a.pix-note-dl::before,
.pix-note-editarea a.pix-note-dl::before,
.pix-note-prevwrap a.pix-note-dl::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/download-model.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/download-model.svg);
}
.pix-note-body a.pix-note-yt::before,
.pix-note-editarea a.pix-note-yt::before,
.pix-note-prevwrap a.pix-note-yt::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/youtube.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/youtube.svg);
}
.pix-note-body a.pix-note-discord::before,
.pix-note-editarea a.pix-note-discord::before,
.pix-note-prevwrap a.pix-note-discord::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/discord.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/discord.svg);
}
.pix-note-body a.pix-note-vp::before,
.pix-note-editarea a.pix-note-vp::before,
.pix-note-prevwrap a.pix-note-vp::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/view-model-page.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/view-model-page.svg);
}
.pix-note-body a.pix-note-rm::before,
.pix-note-editarea a.pix-note-rm::before,
.pix-note-prevwrap a.pix-note-rm::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/read-more.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/read-more.svg);
}

.pix-note-body .pix-note-btnblock,
.pix-note-editarea .pix-note-btnblock,
.pix-note-prevwrap .pix-note-btnblock {
  display: inline-block;
  max-width: 100%;
  vertical-align: top;
}
.pix-note-body .pix-note-btnsize,
.pix-note-editarea .pix-note-btnsize,
.pix-note-prevwrap .pix-note-btnsize {
  font-weight: 500;
  opacity: 0.9;
  white-space: nowrap;
}
.pix-note-body .pix-note-btnsize::before,
.pix-note-editarea .pix-note-btnsize::before,
.pix-note-prevwrap .pix-note-btnsize::before {
  content: "\\2022";
  margin: 0 6px 0 2px;
  opacity: 0.55;
  font-weight: 700;
}
.pix-note-body .pix-note-folderhint,
.pix-note-editarea .pix-note-folderhint,
.pix-note-prevwrap .pix-note-folderhint {
  display: block;
  margin: 4px 2px 2px 2px;
  padding: 2px 0;
  color: var(--pix-note-line, #a6adc8);
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}
.pix-note-body .pix-note-folderhint::before,
.pix-note-editarea .pix-note-folderhint::before,
.pix-note-prevwrap .pix-note-folderhint::before {
  content: "";
  display: inline-block;
  width: 12px; height: 12px;
  background-color: currentColor;
  -webkit-mask: url(/linuxtechlab/assets/icons/ui/folder.svg) no-repeat center / contain;
          mask: url(/linuxtechlab/assets/icons/ui/folder.svg) no-repeat center / contain;
  vertical-align: -2px;
  margin-right: 6px;
  opacity: 0.85;
}

.pix-note-ic {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  vertical-align: -0.15em;
  background-color: currentColor;
  -webkit-mask-size: contain;
          mask-size: contain;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center;
          mask-position: center;
}

.pix-note-editbtn {
  position: absolute;
  top: 6px; right: 10px;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  background: var(--ltl-brand);
  color: #1e1e2e;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 10;
  box-shadow: none;
}
.pix-note-editbtn-icon {
  width: 12px; height: 12px; pointer-events: none;
  filter: brightness(0) invert(0);
}
.pix-note-wrap:hover .pix-note-editbtn { opacity: 0.95; }
.pix-note-editbtn:hover { opacity: 1 !important; filter: brightness(1.1); }

.pix-note-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.pix-note-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e1e2e;
  border: 1px solid var(--ltl-brand);
  color: #cdd6f4;
  padding: 8px 14px;
  border-radius: 5px;
  font-size: 13px;
  z-index: 100000;
  box-shadow: 0 4px 14px rgba(0,0,0,.5);
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease;
}
.pix-note-toast.show { opacity: 1; }

/* ── Editor overlay ───────────────────────────────────────── */
.pix-note-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.72);
  z-index: 99990; display: flex; align-items: center; justify-content: center;
  font-family: "Segoe UI", system-ui, sans-serif;
}
.pix-note-panel {
  background: #1e1e2e; border: 1px solid #313244; border-radius: 8px;
  width: min(920px, 94vw); height: min(720px, 90vh);
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
  position: relative;
}
.pix-note-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: #181825; border-bottom: 1px solid #313244;
  color: #cdd6f4;
}
.pix-note-title { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; }
.pix-note-title-logo { width: 18px; height: 18px; }
.pix-note-title-brand { color: var(--ltl-brand); }
.pix-note-close {
  background: none; border: none; color: #a6adc8; font-size: 22px; cursor: pointer;
  width: 28px; height: 28px; line-height: 1; border-radius: 4px;
}
.pix-note-close:hover { background: #313244; color: #cdd6f4; }

.pix-note-main {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  position: relative;
}
.pix-note-editarea {
  flex: 1; overflow-y: auto; padding: 14px 18px; color: #cdd6f4; font-size: 13px;
  line-height: 1.55; background: #11111b; outline: none;
}
.pix-note-editarea:focus-visible { outline: 1px solid var(--ltl-brand); outline-offset: -2px; }
.pix-note-editarea p, .pix-note-editarea div { margin: 0 0 6px 0; }
.pix-note-editarea p:last-child, .pix-note-editarea div:last-child { margin-bottom: 0; }
.pix-note-editarea h1 { font-size: 22px; font-weight: 700; margin: 4px 0 8px; color: #cdd6f4; }
.pix-note-editarea h2 { font-size: 17px; font-weight: 700; margin: 10px 0 6px; color: #cdd6f4; }
.pix-note-editarea h3 { font-size: 15px; font-weight: 700; margin: 8px 0 4px; color: #cdd6f4; }
.pix-note-editarea hr { border:none; border-top: 1px solid var(--pix-note-line, var(--ltl-brand)); margin: 10px 0; }

.pix-note-viewtoggle {
  margin-left: auto; display: inline-flex; background: #11111b;
  padding: 2px; border-radius: 4px; gap: 2px;
}
.pix-note-viewtoggle button {
  background: transparent; border: none; color: #6c7086;
  padding: 3px 10px; font-size: 11px; font-weight: 600;
  border-radius: 3px; cursor: pointer;
}
.pix-note-viewtoggle button.active { background: var(--ltl-brand); color: #1e1e2e; }

.pix-note-codewrap {
  position: relative;
  flex: 1;
  margin: 8px 12px 0;
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 6px;
  overflow: hidden;
  min-height: 120px;
}
.pix-note-hl,
.pix-note-raw {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  font-family: "Consolas", "Menlo", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 2;
}
.pix-note-hl {
  pointer-events: none;
  color: #cdd6f4;
  background: transparent;
  overflow: hidden;
  z-index: 1;
}
.pix-note-raw {
  resize: none;
  color: transparent;
  background: transparent;
  caret-color: var(--ltl-brand);
  outline: none;
  overflow: auto;
  z-index: 2;
}
.pix-note-raw::selection { background: rgba(137, 180, 250, 0.35); color: transparent; }

.pix-note-hl .tk-tag-punct   { color: #45475a; }
.pix-note-hl .tk-tag-name    { color: #45475a; }
.pix-note-hl .tk-attr-name   { color: #74c7ec; }
.pix-note-hl .tk-attr-equals { color: #45475a; }
.pix-note-hl .tk-attr-value  { color: var(--ltl-brand); }
.pix-note-hl .tk-pix-class   { color: var(--ltl-brand); font-weight: 700; }
.pix-note-hl .tk-text        { color: #cdd6f4; }
.pix-note-hl .tk-entity      { color: #6c7086; font-style: italic; }
.pix-note-hl .tk-whitespace  { }

.pix-note-codearea { display: none; }

.pix-note-help-overlay {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #1e1e2e; border: 1px solid var(--ltl-brand);
  border-radius: 10px; padding: 0;
  width: 960px; max-width: 95vw; max-height: 86vh;
  z-index: 99995; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}
.pix-note-help-header {
  display: flex; align-items: center; padding: 14px 20px;
  border-bottom: 1px solid #313244;
}
.pix-note-help-header h3 {
  flex: 1; color: var(--ltl-brand); font-size: 14px; margin: 0; font-weight: 600;
}
.pix-note-help-close {
  background: #313244; color: #a6adc8; border: 1px solid #45475a;
  border-radius: 4px; padding: 4px 10px; cursor: pointer;
  font-size: 13px; line-height: 1; flex-shrink: 0;
}
.pix-note-help-close:hover { background: #45475a; color: #cdd6f4; }
.pix-note-help-content {
  padding: 18px 24px; overflow-y: auto;
  max-height: calc(86vh - 110px);
  font-size: 11px; line-height: 1.7; color: #a6adc8;
  column-count: 2; column-gap: 36px;
}
.pix-note-help-section {
  break-inside: avoid; margin-bottom: 14px;
}
.pix-note-help-section:last-child { margin-bottom: 0; }
.pix-note-help-section h4 {
  color: var(--ltl-brand);
  margin: 0 0 6px 0; font-size: 11px; font-weight: 700;
  letter-spacing: 0.6px; text-transform: uppercase;
}
.pix-note-help-grid {
  display: grid; grid-template-columns: max-content 1fr;
  gap: 3px 14px;
}
.pix-note-help-grid b { color: #cdd6f4; white-space: nowrap; font-weight: 600; }
.pix-note-help-grid span { color: #bac2de; }
.pix-note-help-grid .pix-note-tbtn-maskicon,
.pix-note-help-grid .pix-note-tbtn-maskicon-multi {
  width: 14px; height: 14px; vertical-align: -3px;
  display: inline-block;
  margin-right: 2px;
}
.pix-note-help-grid .pix-note-tbtn-maskicon-multi {
  --pix-note-tbtn-tint: var(--ltl-brand);
}
.pix-note-help-grid img.pix-note-tbtn-icon {
  width: 14px; height: 14px; vertical-align: -3px;
  margin-right: 2px;
}
.pix-note-help-content b { color: #cdd6f4; }
.pix-note-help-content code {
  background: #313244; border: 1px solid #45475a; border-radius: 3px;
  padding: 1px 5px; font-size: 10px; color: #cdd6f4;
  font-family: "Consolas", monospace;
}
.pix-note-help-footer {
  padding: 10px 20px; border-top: 1px solid #313244;
  font-size: 10px; color: #6c7086; text-align: center; line-height: 1.6;
  flex-shrink: 0;
}
.pix-note-help-footer a { color: var(--ltl-brand); text-decoration: none; }
.pix-note-help-footer a:hover { text-decoration: underline; }
.pix-note-editarea a  { color: var(--ltl-brand); text-decoration: underline; }
.pix-note-editarea code { background: #313244; padding: 0 5px; border-radius: 3px; font-family: "Consolas", monospace; font-size: 0.92em; }
.pix-note-editarea pre  { background: #11111b; border:1px solid #313244; border-radius: 4px; padding: 8px 10px; font-family: "Consolas", monospace; font-size: 12px; }
.pix-note-editarea pre code { background: transparent; padding: 0; font-size: inherit; }
.pix-note-editarea ul, .pix-note-editarea ol { margin: 4px 0 4px 20px; padding: 0; }
.pix-note-editarea li { margin: 2px 0; }

.pix-note-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 10px 14px; background: #181825; border-top: 1px solid #313244;
}
.pix-note-btn {
  padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600;
  border: 1px solid #45475a; background: #313244; color: #cdd6f4; cursor: pointer;
}
.pix-note-btn:hover { background: #45475a; }
.pix-note-btn.primary { background: var(--ltl-brand); border-color: var(--ltl-brand); color: #1e1e2e; }
.pix-note-btn.primary:hover { filter: brightness(1.08); }
.pix-note-btn.ghost { background: transparent; }

.pix-note-confirm-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 100010;
}
.pix-note-confirm-box {
  min-width: 360px; max-width: 460px;
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 18px 22px 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
}
.pix-note-confirm-title {
  font-size: 14px; font-weight: 700; color: #cdd6f4; margin-bottom: 6px;
}
.pix-note-confirm-text {
  font-size: 12px; color: #bac2de; margin-bottom: 14px; line-height: 1.45;
  text-wrap: pretty;
}
.pix-note-confirm-actions {
  display: flex; justify-content: flex-end; gap: 8px;
}

/* ── Toolbar ──────────────────────────────────────────────── */
.pix-note-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 3px;
  padding: 6px 8px; background: #181825; border-bottom: 1px solid #313244;
}
.pix-note-tbtn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 26px; height: 26px; padding: 0 7px;
  background: #313244; border: 1px solid transparent; border-radius: 3px;
  color: #cdd6f4; font-size: 12px; font-weight: 600; cursor: pointer;
  user-select: none;
}
.pix-note-tbtn:hover { background: #45475a; border-color: #585b70; }
.pix-note-tbtn.active { background: var(--ltl-brand); color: #1e1e2e; border-color: var(--ltl-brand); }
.pix-note-tbtn.pix-note-tbtn-accent {
  background: var(--ltl-brand); color: #1e1e2e; border-color: var(--ltl-brand);
}
.pix-note-tbtn.pix-note-tbtn-accent:hover { filter: brightness(1.1); background: var(--ltl-brand); }
.pix-note-tbtn-icon {
  width: 14px; height: 14px; pointer-events: none;
  filter: brightness(0) invert(1);
}
.pix-note-tbtn-maskicon {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: -2px;
  background-color: var(--pix-note-tbtn-tint, currentColor);
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center;
          mask-position: center;
  -webkit-mask-size: contain;
          mask-size: contain;
  pointer-events: none;
}
.pix-note-tbtn-maskicon-multi {
  position: relative;
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: -2px;
  pointer-events: none;
}
.pix-note-tbtn-maskicon-multi::before,
.pix-note-tbtn-maskicon-multi::after {
  content: "";
  position: absolute;
  inset: 0;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-position: center;
          mask-position: center;
  -webkit-mask-size: contain;
          mask-size: contain;
}
.pix-note-tbtn-maskicon-multi::before { background-color: currentColor; }
.pix-note-tbtn-maskicon-multi::after  { background-color: var(--pix-note-tbtn-tint, currentColor); }

.pix-note-icon-text-color::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/text-color-outline.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/text-color-outline.svg);
}
.pix-note-icon-text-color::after {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/text-color-drop.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/text-color-drop.svg);
}
.pix-note-icon-highlight-color::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/highlight-color-outline.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/highlight-color-outline.svg);
}
.pix-note-icon-highlight-color::after {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/highlight-color-drop.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/highlight-color-drop.svg);
}
.pix-note-icon-bg-color::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/bg-color-outline.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/bg-color-outline.svg);
}
.pix-note-icon-bg-color::after {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/bg-color-drop.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/bg-color-drop.svg);
}
.pix-note-icon-button-color::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/button-color-outline.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/button-color-outline.svg);
}
.pix-note-icon-button-color::after {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/button-color-drop.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/button-color-drop.svg);
}
.pix-note-icon-line-color::before {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/line-color-outline.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/line-color-outline.svg);
}
.pix-note-icon-line-color::after {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/line-color-drop.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/line-color-drop.svg);
}
.pix-note-icon-separator {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/separator.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/separator.svg);
}
.pix-note-icon-code {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/code.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/code.svg);
}
.pix-note-icon-list-dot {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/list-dot.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/list-dot.svg);
}
.pix-note-icon-list-number {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/list-number.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/list-number.svg);
}
.pix-note-icon-link {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/link.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/link.svg);
}
.pix-note-tbtn.italic { font-style: italic; font-family: Georgia, serif; }
.pix-note-tbtn.under { text-decoration: underline; }
.pix-note-tbtn.strike { text-decoration: line-through; }
.pix-note-tsep { width: 1px; height: 18px; background: #45475a; margin: 0 4px; }
.pix-note-tgroup { display: inline-flex; gap: 3px; }
.pix-note-tspacer { flex: 1 1 auto; min-width: 8px; }

/* ── Color popover ───────────────────────────────────────── */
.pix-note-colorpop {
  position: absolute; background: #1e1e2e; border: 1px solid #45475a; border-radius: 5px;
  padding: 8px; z-index: 100000; display: flex; flex-direction: column; gap: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,.5);
}
.pix-note-swatches { display: grid; grid-template-columns: repeat(7, 18px); gap: 4px; }
.pix-note-swatch {
  width: 18px; height: 18px; border-radius: 3px; cursor: pointer;
  border: 1px solid rgba(205,214,244,.1);
}
.pix-note-swatch.active { outline: 2px solid var(--ltl-brand); outline-offset: 1px; }
.pix-note-colorrow { display: flex; gap: 4px; align-items: center; }
.pix-note-colorrow input[type="color"] { width: 26px; height: 22px; padding: 0; border: 1px solid #45475a; border-radius: 3px; background: #11111b; cursor: pointer; }
.pix-note-colorrow input[type="text"] {
  flex: 1; width: 80px; background: #11111b; border: 1px solid #45475a;
  color: #cdd6f4; padding: 3px 6px; font-size: 11px; font-family: "Consolas", monospace;
  border-radius: 3px;
}
.pix-note-colorrow .clearbtn {
  background: repeating-conic-gradient(#45475a 0 25%, #313244 0 50%) 50%/8px 8px;
  width: 22px; height: 22px; border: 1px solid #45475a; border-radius: 3px; cursor: pointer;
}

.pix-note-iconpop {
  position: absolute;
  z-index: 100000;
  background: #1e1e2e;
  color: #cdd6f4;
  border: 1px solid #313244;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}
.pix-note-iconswatches {
  display: grid;
  grid-template-columns: repeat(7, 32px);
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}
.pix-note-iconswatch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(205,214,244, 0.04);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}
.pix-note-iconswatch:hover {
  border-color: #89b4fa;
  background: rgba(137, 180, 250, 0.15);
}
.pix-note-iconswatch .pix-note-ic {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}
.pix-note-iconpop-empty {
  color: #6c7086;
  font-size: 12px;
  padding: 12px 6px;
  max-width: 220px;
  text-align: center;
  line-height: 1.4;
}
.pix-note-iconpop-empty code {
  background: rgba(205,214,244, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #cdd6f4;
}

.pix-note-icon-icon-insert {
  -webkit-mask-image: url(/linuxtechlab/assets/icons/ui/icon-insert.svg);
          mask-image: url(/linuxtechlab/assets/icons/ui/icon-insert.svg);
}

/* ── Insert-link dialog inputs ───────────────────────────── */
.pix-note-linklbl {
  font-size: 10.5px; color: #6c7086; text-transform: uppercase;
  letter-spacing: 0.5px; margin: 6px 0 3px;
}
.pix-note-linkinput {
  width: 100%; box-sizing: border-box;
  background: #11111b; border: 1px solid #313244; border-radius: 3px;
  color: #cdd6f4; font-size: 12px; padding: 6px 8px;
  font-family: "Consolas", monospace;
}
.pix-note-linkinput:focus { outline: 1px solid var(--ltl-brand); outline-offset: -1px; border-color: var(--ltl-brand); }
.pix-note-linkerr {
  color: #fab387; font-size: 11px; margin-top: 6px; min-height: 14px;
}
.pix-note-confirm-box.wide { min-width: 560px; max-width: 720px; }
.pix-note-codeinput {
  width: 100%; box-sizing: border-box;
  background: #11111b; border: 1px solid #313244; border-radius: 3px;
  color: #cdd6f4; font-size: 12px; padding: 6px 8px;
  font-family: "Consolas", "Courier New", monospace;
  resize: vertical; min-height: 120px;
  white-space: pre; tab-size: 2;
}
.pix-note-codeinput:focus { outline: 1px solid var(--ltl-brand); outline-offset: -1px; border-color: var(--ltl-brand); }

/* ── Block edit dialog ───────────────────────────────────── */
.pix-note-blockdlg {
  position: fixed; background: #1e1e2e; border: 1px solid #45475a;
  border-radius: 6px; padding: 14px 16px; z-index: 100001;
  box-shadow: 0 10px 30px rgba(0,0,0,.6);
  min-width: 420px; max-width: 90vw;
  font-family: "Segoe UI", system-ui, sans-serif;
}
.pix-note-blockdlg h4 { margin: 0 0 10px; color: #cdd6f4; font-size: 14px; }
.pix-note-blockdlg .field { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
.pix-note-blockdlg label.lbl { font-size: 10.5px; color: #6c7086; text-transform: uppercase; letter-spacing: 0.5px; }
.pix-note-blockdlg input {
  background: #11111b; border: 1px solid #313244; border-radius: 3px;
  color: #cdd6f4; font-size: 12px; padding: 5px 8px;
}
.pix-note-blockdlg input:focus { outline: 1px solid var(--ltl-brand); outline-offset: -1px; }
.pix-note-blockdlg .dlgfooter { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }

.pix-note-btndesign { min-width: 440px; }

.pix-note-prevwrap {
  display: block;
  padding: 14px;
  background: #11111b;
  border: 1px dashed #45475a;
  border-radius: 4px;
  margin-bottom: 12px;
  text-align: left;
}
.pix-note-prevwrap a.pix-note-dl,
.pix-note-prevwrap a.pix-note-yt,
.pix-note-prevwrap a.pix-note-discord,
.pix-note-prevwrap a.pix-note-vp,
.pix-note-prevwrap a.pix-note-rm {
  cursor: default;
  pointer-events: none;
  font-size: 12px;
}
.pix-note-prevwrap .pix-note-folderhint {
  margin-top: 6px;
}

.pix-note-iconpick {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 5px;
  margin-bottom: 12px;
}
.pix-note-iconpick button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #6c7086;
  font-family: inherit;
  font-size: 10.5px;
  cursor: pointer;
  transition: background 120ms, color 120ms, border-color 120ms;
}
.pix-note-iconpick button:hover { background: rgba(205,214,244,.04); color: #a6adc8; }
.pix-note-iconpick button.active {
  background: rgba(137,180,250,.15);
  border-color: var(--ltl-brand);
  color: var(--ltl-brand);
}
.pix-note-iconpick button .ico {
  display: inline-block;
  width: 20px; height: 20px;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center;  mask-position: center;
  -webkit-mask-size: contain;     mask-size: contain;
  pointer-events: none;
}
.pix-note-iconpick button .ico-lbl { line-height: 1; }

.pix-note-optrow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 2px 6px;
  margin-top: 4px;
  border-top: 1px solid #313244;
  cursor: pointer;
  user-select: none;
}
.pix-note-optrow:hover .lbl { color: #cdd6f4; }
.pix-note-optrow .lbl {
  font-size: 11px;
  font-weight: 600;
  color: #bac2de;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 120ms;
}
.pix-note-toggle {
  position: relative;
  width: 32px; height: 16px;
  background: #45475a;
  border-radius: 9px;
  transition: background 160ms;
  flex-shrink: 0;
}
.pix-note-toggle.on { background: var(--ltl-brand); }
.pix-note-toggle::after {
  content: "";
  position: absolute;
  top: 2px; left: 2px;
  width: 12px; height: 12px;
  background: #1e1e2e;
  border-radius: 50%;
  transition: left 160ms;
}
.pix-note-toggle.on::after { left: 18px; }

.pix-note-optinput {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 2px 2px;
  transition: opacity 160ms;
}
.pix-note-optinput input {
  flex: 1;
  background: #11111b; border: 1px solid #313244; border-radius: 3px;
  color: #cdd6f4; font-size: 12px; padding: 5px 8px;
  font-family: inherit;
}
.pix-note-optinput input:focus { outline: 1px solid var(--ltl-brand); outline-offset: -1px; }
.pix-note-optinput.disabled { opacity: 0.35; pointer-events: none; }
.pix-note-optinput .folderico {
  display: inline-block;
  width: 16px; height: 16px;
  background-color: #bac2de;
  -webkit-mask: url(/linuxtechlab/assets/icons/ui/folder.svg) no-repeat center / contain;
          mask: url(/linuxtechlab/assets/icons/ui/folder.svg) no-repeat center / contain;
  flex-shrink: 0;
}

.pix-note-pencil {
  position: absolute;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--ltl-brand);
  color: #1e1e2e;
  cursor: pointer;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 120ms ease-out;
}
.pix-note-pencil { pointer-events: none; }
.pix-note-pencil.visible { opacity: 0.95; pointer-events: auto; }
.pix-note-pencil.visible:hover { opacity: 1; }
.pix-note-pencil img {
  width: 12px;
  height: 12px;
  filter: brightness(0) invert(0);
  pointer-events: none;
}

/* ── Grid (table) block ───────────────────────────────────────────── */
.pix-note-body table.pix-note-grid,
.pix-note-editarea table.pix-note-grid {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
  margin: 8px 0;
  font-size: 13px;
  word-wrap: break-word;
}
.pix-note-body table.pix-note-grid th,
.pix-note-body table.pix-note-grid td,
.pix-note-editarea table.pix-note-grid th,
.pix-note-editarea table.pix-note-grid td {
  border: 1px solid var(--pix-note-line, var(--ltl-brand));
  padding: 6px 8px;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  text-align: center;
}
.pix-note-body table.pix-note-grid thead th,
.pix-note-editarea table.pix-note-grid thead th {
  background: #181825;
  color: #cdd6f4;
  font-weight: 700;
  border-bottom: 2px solid var(--pix-note-line, var(--ltl-brand));
}

/* ── Grid insert dialog ──────────────────────────────────────────── */
.pix-note-griddlg .pix-note-prevwrap {
  display: block;
  text-align: left;
  padding: 8px 0;
}
.pix-note-gridprev {
  display: grid;
  gap: 3px;
  width: 100%;
  min-height: 60px;
  padding: 4px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 4px;
}
.pix-note-gridprevcell {
  height: 14px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 2px;
}
.pix-note-gridprevcell.head {
  background: #45475a;
  border-bottom: 2px solid var(--pix-note-line, var(--ltl-brand));
}
.pix-note-stepper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.pix-note-step {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #45475a;
  border-radius: 3px;
  background: #313244;
  color: #cdd6f4;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.pix-note-step:hover:not(:disabled) { background: #45475a; border-color: var(--ltl-brand); }
.pix-note-step:disabled { opacity: 0.4; cursor: not-allowed; }
.pix-note-stepnum {
  min-width: 20px;
  text-align: center;
  color: #cdd6f4;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
  `;
  document.head.appendChild(s);
}
