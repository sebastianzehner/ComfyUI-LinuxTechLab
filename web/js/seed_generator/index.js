import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import { getBrand } from "../theme/palette.mjs";

// ---- constants ----
const MAX_HISTORY = 50;
const STEP_OPTIONS = [1, 10, 100, 1000];
const MODES = ["manual", "random", "increment", "decrement"];

const DEFAULT_STATE = {
  seed: 0,
  locked: false,
  step: 1,
  mode: "manual",
  history: [],
};

// ---- Lucide Icons ----
const LOCK_CLOSED = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

const LOCK_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;

const TRASH = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

// ---- CSS ----
function injectCSS() {
  if (document.getElementById("ltl-seed-css")) return;
  const style = document.createElement("style");
  style.id = "ltl-seed-css";
  style.textContent = `
    .ltl-seed-root {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 11px;
      color: #cdd6f4;
    }
    .ltl-seed-display {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ltl-seed-input {
      flex: 1;
      background: #181825;
      border: 1px solid #45475a;
      border-radius: 4px;
      color: var(--ltl-brand, #89b4fa);
      font-size: 15px;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      text-align: center;
      height: 32px;
      padding: 0px 8px;
      box-sizing: border-box;
      min-width: 0;
    }
    .ltl-seed-input:focus {
      outline: none;
      border-color: var(--ltl-brand, #89b4fa);
    }
    .ltl-seed-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .ltl-seed-lock {
      width: 32px;
      height: 32px;
      border: 1px solid #45475a;
      border-radius: 4px;
      background: #181825;
      color: #6c7086;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.08s, border-color 0.08s, color 0.08s;
    }
    .ltl-seed-lock.locked {
      background: var(--ltl-brand, #89b4fa);
      border-color: var(--ltl-brand, #89b4fa);
      color: #1e1e2e;
    }
    .ltl-seed-lock:hover { border-color: var(--ltl-brand, #89b4fa); }
    .ltl-seed-buttons {
      display: grid;
      grid-template-columns: 1fr 32px 32px 32px;
      gap: 6px;
    }
    .ltl-seed-btn {
      height: 32px;
      border: 1px solid #45475a;
      border-radius: 4px;
      background: #181825;
      color: #bac2de;
      font-size: 11px;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.08s, border-color 0.08s, color 0.08s;
      padding: 0 8px;
    }
    .ltl-seed-btn:hover {
      border-color: var(--ltl-brand, #89b4fa);
      color: var(--ltl-brand, #89b4fa);
    }
    .ltl-seed-btn.primary {
      background: var(--ltl-brand, #89b4fa);
      border-color: var(--ltl-brand, #89b4fa);
      color: #1e1e2e;
      font-weight: 600;
    }
    .ltl-seed-btn.primary:hover { background: #b9d2fc; border-color: #b9d2fc; }
    .ltl-seed-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ltl-seed-btn.icon {
      width: 32px;
      height: 32px;
      padding: 0;
      font-size: 13px;
      flex-shrink: 0;
    }
    .ltl-seed-btn.trash {
      width: 32px;
      height: 32px;
      padding: 0;
      font-size: 14px;
    }
    .ltl-seed-btn.trash:hover {
      border-color: #f38ba8;
      color: #f38ba8;
    }
    .ltl-seed-step-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ltl-seed-step-label {
      font-size: 9px;
      color: #6c7086;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .ltl-seed-step-btns { display: flex; gap: 2px; }
    .ltl-seed-step-btn {
      background: #181825;
      border: 1px solid #45475a;
      border-radius: 3px;
      color: #6c7086;
      font-size: 9px;
      padding: 2px 5px;
      cursor: pointer;
      font-family: ui-monospace, monospace;
      line-height: 1;
    }
    .ltl-seed-step-btn:hover { color: #cdd6f4; border-color: #6c7086; }
    .ltl-seed-step-btn.active {
      background: var(--ltl-brand, #89b4fa);
      color: #1e1e2e;
      border-color: var(--ltl-brand, #89b4fa);
    }
  `;
  document.head.appendChild(style);
}

// ---- helpers ----
function formatTs(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day}.${month}.${year} ${time}`;
}

function randomSeed() {
  return Math.floor(Math.random() * 4294967296);
}

function clampSeed(n) {
  return Math.max(0, Math.min(4294967295, Math.round(n)));
}

// ---- state helpers ----
function readState(node) {
  const w = (node.widgets || []).find((x) => x.name === "seed_json");
  if (w?.value) {
    try {
      return { ...DEFAULT_STATE, ...JSON.parse(w.value) };
    } catch {
      /* fall through */
    }
  }
  return { ...DEFAULT_STATE };
}

function writeState(node, state) {
  const w = (node.widgets || []).find((x) => x.name === "seed_json");
  if (w) w.value = JSON.stringify(state);
}

function addToHistory(state, seed) {
  const entry = { seed, ts: Date.now() };
  const history = [entry, ...(state.history || []).filter((h) => h.seed !== seed)];
  return history.slice(0, MAX_HISTORY);
}

function updateHistoryWidget(node, history) {
  const hw = (node.widgets || []).find((w) => w.name === "ltl_history");
  if (!hw) return;
  if (history.length === 0) {
    hw.options.values = ["No history yet"];
    hw.value = "No history yet";
    hw.disabled = true;
  } else {
    const entries = history.map((h) => `${formatTs(h.ts)}  -  ${h.seed}`);
    hw.options.values = entries;
    hw.value = entries[0];
    hw.disabled = false;
  }
}

function updateModeWidget(node, mode) {
  const mw = (node.widgets || []).find((w) => w.name === "ltl_mode");
  if (mw) mw.value = mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ---- widget builder ----
function createSeedWidget(node) {
  injectCSS();

  const root = document.createElement("div");
  root.className = "ltl-seed-root";
  root.style.setProperty("--ltl-brand", getBrand());

  // ── seed display ──
  const displayRow = document.createElement("div");
  displayRow.className = "ltl-seed-display";

  const seedInput = document.createElement("input");
  seedInput.type = "text";
  seedInput.inputMode = "numeric";
  seedInput.className = "ltl-seed-input";
  seedInput.spellcheck = false;

  const lockBtn = document.createElement("button");
  lockBtn.className = "ltl-seed-lock";
  lockBtn.title = "Lock seed — overrides all modes, seed stays fixed";

  displayRow.append(seedInput, lockBtn);
  root.appendChild(displayRow);

  // ── buttons row: Generate | − | + | 🗑 ──
  const buttonsRow = document.createElement("div");
  buttonsRow.className = "ltl-seed-buttons";

  const generateBtn = document.createElement("button");
  generateBtn.className = "ltl-seed-btn primary";
  generateBtn.textContent = "Generate";

  const decrBtn = document.createElement("button");
  decrBtn.className = "ltl-seed-btn icon";
  decrBtn.textContent = "−";
  decrBtn.title = "Decrement seed by step";

  const incrBtn = document.createElement("button");
  incrBtn.className = "ltl-seed-btn icon";
  incrBtn.textContent = "+";
  incrBtn.title = "Increment seed by step";

  const trashBtn = document.createElement("button");
  trashBtn.className = "ltl-seed-btn icon trash";
  trashBtn.innerHTML = TRASH;
  //trashBtn.textContent = "🗑";
  trashBtn.title = "Clear history";

  buttonsRow.append(generateBtn, decrBtn, incrBtn, trashBtn);
  root.appendChild(buttonsRow);

  // ── step selector ──
  const stepRow = document.createElement("div");
  stepRow.className = "ltl-seed-step-row";
  const stepLabel = document.createElement("span");
  stepLabel.className = "ltl-seed-step-label";
  stepLabel.textContent = "Step:";
  const stepBtns = document.createElement("div");
  stepBtns.className = "ltl-seed-step-btns";
  const stepEls = [];
  for (const v of STEP_OPTIONS) {
    const btn = document.createElement("button");
    btn.className = "ltl-seed-step-btn";
    btn.textContent = String(v);
    btn.dataset.v = String(v);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cur = readState(node);
      writeState(node, { ...cur, step: v });
      render();
    });
    stepBtns.appendChild(btn);
    stepEls.push(btn);
  }
  stepRow.append(stepLabel, stepBtns);
  root.appendChild(stepRow);

  // ── render ──
  function render() {
    const state = readState(node);
    const locked = !!state.locked;
    const step = state.step || 1;
    const mode = state.mode || "random";

    seedInput.value = String(state.seed ?? 0);
    seedInput.disabled = locked;

    lockBtn.innerHTML = locked ? LOCK_CLOSED : LOCK_OPEN;
    lockBtn.classList.toggle("locked", locked);

    generateBtn.disabled = locked;
    decrBtn.disabled = locked;
    incrBtn.disabled = locked;

    for (const btn of stepEls) {
      btn.classList.toggle("active", parseInt(btn.dataset.v) === step);
    }

    updateModeWidget(node, mode);
    updateHistoryWidget(node, state.history || []);
  }

  // ── event handlers ──
  seedInput.addEventListener("blur", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    if (cur.locked) return;
    const v = parseInt(seedInput.value, 10);
    const seed = Number.isFinite(v) ? clampSeed(v) : cur.seed;
    writeState(node, { ...cur, seed });
    render();
  });

  seedInput.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      seedInput.blur();
    }
  });

  lockBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    writeState(node, { ...cur, locked: !cur.locked });
    render();
  });

  generateBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    if (cur.locked) return;
    writeState(node, { ...cur, seed: randomSeed() });
    render();
  });

  decrBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    if (cur.locked) return;
    writeState(node, { ...cur, seed: clampSeed(cur.seed - (cur.step || 1)) });
    render();
  });

  incrBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    if (cur.locked) return;
    writeState(node, { ...cur, seed: clampSeed(cur.seed + (cur.step || 1)) });
    render();
  });

  trashBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cur = readState(node);
    writeState(node, { ...cur, history: [] });
    render();
  });

  node._ltlSeedRender = render;
  return root;
}

// ---- extension ----
app.registerExtension({
  name: "LinuxTechLab.SeedGenerator",

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "LinuxTechLab_SeedGenerator") return;

    const origNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      if (origNodeCreated) origNodeCreated.apply(this, arguments);

      // DOM widget
      const root = createSeedWidget(this);
      this.addDOMWidget("ltl_seed_widget", "custom", root, {
        serialize: false,
        getMinHeight: () => 120,
      });

      // Native mode combo — label hidden via empty string
      const modeWidget = this.addWidget(
        "combo",
        "ltl_mode",
        "Random",
        (v) => {
          const cur = readState(this);
          writeState(this, { ...cur, mode: v.toLowerCase() });
          this._ltlSeedRender?.();
        },
        { values: MODES.map((m) => m.charAt(0).toUpperCase() + m.slice(1)) },
      );
      modeWidget.label = "Mode";
      modeWidget.serialize = false;

      // Native history combo — label hidden
      const historyWidget = this.addWidget(
        "combo",
        "ltl_history",
        "No history yet",
        (v) => {
          const parts = v.split("  -  ");
          if (parts.length < 2) return;
          const seed = parseInt(parts[1].trim(), 10);
          if (!Number.isFinite(seed)) return;
          const cur = readState(this);
          writeState(this, { ...cur, seed });
          this._ltlSeedRender?.();
        },
        { values: ["No history yet"] },
      );
      historyWidget.label = "History";
      historyWidget.disabled = true;
      historyWidget.serialize = false;

      //if (!this.size || this.size[0] < 280) this.size[0] = 280;
      //if (!this.size[1] || this.size[1] < 300) this.size[1] = 300;
      if (!this.size || this.size[0] === 0) this.size = [290, 230];

      // Hide "Show advanced inputs" footer
      requestAnimationFrame(() => {
        const nodeEl = document.querySelector(`[data-node-id="${this.id}"]`);
        if (nodeEl) {
          const footer = nodeEl.querySelector("button:has(span.truncate)");
          if (footer?.parentElement) footer.parentElement.style.display = "none";
        }
      });

      queueMicrotask(() => {
        const state = readState(this);
        if (!state.seed) writeState(this, { ...state, seed: randomSeed() });
        this._ltlSeedRender?.();
      });
    };

    const origConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      const r = origConfigure ? origConfigure.apply(this, arguments) : undefined;
      this._ltlSeedRender?.();
      requestAnimationFrame(() => {
        const nodeEl = document.querySelector(`[data-node-id="${this.id}"]`);
        if (nodeEl) {
          const footer = nodeEl.querySelector("button:has(span.truncate)");
          if (footer?.parentElement) footer.parentElement.style.display = "none";
        }
      });
      return r;
    };
  },
});

// ---- executed event ----
// History is only written when the workflow actually runs.
// Python returns the new seed via ui.ltl_seed so JS can update seed_json
// before the next run — this ensures mode changes take effect correctly.
api.addEventListener("executed", ({ detail }) => {
  const seed = detail?.output?.ltl_seed?.[0];
  if (seed === undefined) return;

  let node = app.graph.getNodeById(detail.node);
  if (!node && typeof detail.node === "string") {
    node = app.graph.getNodeById(parseInt(detail.node, 10));
  }
  if (!node || node.type !== "LinuxTechLab_SeedGenerator") return;

  // Write new seed back into seed_json so next run picks it up
  const cur = readState(node);
  const newHistory = addToHistory(cur, seed);
  writeState(node, { ...cur, seed, history: newHistory });
  node._ltlSeedRender?.();
});
