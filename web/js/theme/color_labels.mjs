// ============================================================
// LinuxTechLab — Mocha Color Labels
// ============================================================
// Renames ComfyUI's built-in node-color preset tooltips (shown when
// hovering the color swatches / the current-color button in the node
// toolbar) to Catppuccin Mocha names, and fixes the "current color"
// indicator to show the actual assigned color instead of the shared
// node bgcolor.
//
// Tooltip text is real DOM content set by PrimeVue, not something CSS
// can rewrite — this has to happen here in JS.
//
// Toggle via Settings → LinuxTechLab → Appearance → "Rename Node Color
// Labels".
// ============================================================
import { app } from "/scripts/app.js";

const LABELS = {
  black: "Surface2",
  red: "Red",
  brown: "Peach",
  green: "Green",
  blue: "Blue",
  pale_blue: "Teal",
  cyan: "Sapphire",
  purple: "Mauve",
  yellow: "Yellow",
  noColor: "Lavender",
};

// Mocha hex values, lowercased, used to re-derive the correct preset key
// from the ACTUAL color of the selected node — bypasses ComfyUI's own
// (apparently unreliable) name-matching for the "current color" button.
const HEX_TO_KEY = {
  "#585b70": "black",
  "#f38ba8": "red",
  "#fab387": "brown",
  "#a6e3a1": "green",
  "#89b4fa": "blue",
  "#94e2d5": "pale_blue",
  "#74c7ec": "cyan",
  "#cba6f7": "purple",
  "#f9e2af": "yellow",
  "#1e1e2e": "noColor",
};

// Reverse of the above — used to fix the "current color" swatch's own
// displayed color, not just its tooltip. ComfyUI sets this icon's
// style.color reactively on every node-selection change, but (same bug)
// always to the shared bgcolor instead of the node's actual preset color.
const KEY_TO_HEX = {
  black: "#585b70",
  red: "#f38ba8",
  brown: "#fab387",
  green: "#a6e3a1",
  blue: "#89b4fa",
  pale_blue: "#94e2d5",
  cyan: "#74c7ec",
  purple: "#cba6f7",
  yellow: "#f9e2af",
  noColor: "#b4befe",
};

// Confirmed via DevTools: PrimeVue tooltips render as
//   <div role="tooltip" class="p-tooltip ...">
//     <div class="p-tooltip-arrow" ...></div>
//     <div class="p-tooltip-text" ...>Label</div>
//   </div>
// Target ONLY .p-tooltip-text — never the outer role="tooltip" wrapper,
// since overwriting its textContent destroys BOTH the arrow AND the text
// div as children, replacing them with a bare text node (that's what
// caused the "missing box" bug — the earlier captured snapshot without
// arrow/text children was already-damaged output from this same code,
// not the pristine structure).
function findTooltipTextEl(root) {
  if (root.matches?.(".p-tooltip-text")) return root;
  return root.querySelector?.(".p-tooltip-text") || null;
}

function isEnabled() {
  try {
    return app.extensionManager?.setting?.get("LinuxTechLab.MochaColorLabels.Enabled", true) ?? true;
  } catch {
    return true;
  }
}

function findHoveredTestId() {
  const el = document.querySelector(
    'i.pi-circle-fill:hover, [data-testid="color-picker-button"]:hover i.pi-circle-fill',
  );
  return el?.dataset?.testid || null;
}

function correctKeyForSelectedNode() {
  const nodes = app.canvas?.selected_nodes;
  const node = nodes && Object.values(nodes)[0];
  if (!node) return null;
  const hex = (node.color || "").toLowerCase();
  if (!hex) return "noColor"; // no preset assigned → treat as "No Color" / Lavender
  return HEX_TO_KEY[hex] || null;
}

// Guard so our own style write below doesn't immediately re-trigger the
// attribute observer that's watching for ComfyUI overwriting it back.
let _fixingSwatch = false;

function fixCurrentColorSwatch() {
  if (!isEnabled()) return;
  const icon = document.querySelector('i[data-testid="color-picker-current-color"]');
  if (!icon) return;
  const key = correctKeyForSelectedNode();
  const hex = key && KEY_TO_HEX[key];
  if (hex && icon.style.color !== hex) {
    _fixingSwatch = true;
    icon.style.color = hex;
    _fixingSwatch = false;
  }
}

const swatchStyleObserver = new MutationObserver(() => {
  if (_fixingSwatch) return;
  fixCurrentColorSwatch();
});

function ensureSwatchObserved(icon) {
  if (icon.dataset._mochaObserved) return;
  icon.dataset._mochaObserved = "1";
  swatchStyleObserver.observe(icon, { attributes: true, attributeFilter: ["style"] });
  fixCurrentColorSwatch();
}

function relabel(tooltipEl) {
  if (!isEnabled()) return;
  const testid = findHoveredTestId();
  if (!testid) return;
  const key = testid === "color-picker-current-color" ? correctKeyForSelectedNode() || testid : testid;
  const label = LABELS[key];
  if (label) tooltipEl.textContent = label;
}

app.registerExtension({
  name: "LinuxTechLab.MochaColorLabels",

  settings: [
    {
      id: "LinuxTechLab.MochaColorLabels.Enabled",
      name: "Rename Node Color Labels (Catppuccin Mocha)",
      type: "boolean",
      defaultValue: true,
      tooltip:
        "Renames the built-in node-color preset names/tooltips (e.g. 'Brown' → 'Peach') and fixes the current-color indicator to match Catppuccin Mocha. Disable to restore ComfyUI's default names/behavior.",
      category: ["LinuxTechLab", "Appearance"],
    },
  ],

  setup() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          const tooltipEl = findTooltipTextEl(node);
          if (tooltipEl) relabel(tooltipEl);

          const swatchIcon = node.matches?.('i[data-testid="color-picker-current-color"]')
            ? node
            : node.querySelector?.('i[data-testid="color-picker-current-color"]');
          if (swatchIcon) ensureSwatchObserved(swatchIcon);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Cover the case where the icon already exists in the DOM at setup time.
    const existing = document.querySelector('i[data-testid="color-picker-current-color"]');
    if (existing) ensureSwatchObserved(existing);
  },
});
