import { app } from "/scripts/app.js";

export function getBrand() {
  try {
    return app.extensionManager?.setting?.get("LinuxTechLab.BrandColor", "#89b4fa") ?? "#89b4fa";
  } catch {
    return "#89b4fa";
  }
}

export function getBrandBackground() {
  try {
    return app.extensionManager?.setting?.get("LinuxTechLab.BrandBackground", "#1e1e2e") ?? "#1e1e2e";
  } catch {
    return "#1e1e2e";
  }
}

export function lightenColor(hex, amount = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

export function darkenColor(hex, amount = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.round(r * (1 - amount)));
  const ng = Math.max(0, Math.round(g * (1 - amount)));
  const nb = Math.max(0, Math.round(b * (1 - amount)));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

// ─── Catppuccin Mocha ─────────────────────────────────────
export const MOCHA = {
  _name: "Catppuccin Mocha",
  // Base
  background: "#1e1e2e", // base
  surface: "#313244", // surface0
  overlay: "#6c7086", // overlay0
  // Text
  text: "#cdd6f4", // text
  subtext: "#a6adc8", // subtext0
  muted: "#6c7086", // overlay0
  // Node Colors (ComfyUI Color Menu)
  red: "#f38ba8", // red
  brown: "#fab387", // peach
  green: "#a6e3a1", // green
  blue: "#89b4fa", // blue
  pale_blue: "#94e2d5", // teal
  cyan: "#74c7ec", // sapphire
  purple: "#cba6f7", // mauve
  yellow: "#f9e2af", // yellow
  black: "#585b70", // surface2

  // ── Full Palette Reference (unused) ───────────────────
  // mantle:    "#181825",
  // crust:     "#11111b",
  // surface1:  "#45475a",
  // surface2:  "#585b70",
  // overlay1:  "#7f849c",
  // overlay2:  "#9399b2",
  // subtext1:  "#bac2de",
  // lavender:  "#b4befe",
  // sky:       "#89dceb",
  // maroon:    "#eba0ac",
  // pink:      "#f5c2e7",
  // flamingo:  "#f2cdcd",
  // rosewater: "#f5e0dc",
};

// ─── Catppuccin Latte ─────────────────────────────────────
export const LATTE = {
  _name: "Catppuccin Latte",
  // Base
  background: "#eff1f5", // base
  surface: "#ccd0da", // surface0
  overlay: "#9ca0b0", // overlay0
  // Text
  text: "#4c4f69", // text
  subtext: "#6c6f85", // subtext0
  muted: "#9ca0b0", // overlay0
  // Node Colors (ComfyUI Color Menu)
  red: "#d20f39", // red
  brown: "#fe640b", // peach
  green: "#40a02b", // green
  blue: "#1e66f5", // blue
  pale_blue: "#179299", // teal
  cyan: "#209fb5", // sapphire
  purple: "#8839ef", // mauve
  yellow: "#df8e1d", // yellow
  black: "#acb0be", // surface2

  // ── Full Palette Reference (unused) ───────────────────
  // mantle:    "#e6e9ef",
  // crust:     "#dce0e8",
  // surface1:  "#bcc0cc",
  // surface2:  "#acb0be",
  // overlay1:  "#8c8fa1",
  // overlay2:  "#7c7f93",
  // subtext1:  "#5c5f77",
  // lavender:  "#7287fd",
  // sky:       "#04a5e5",
  // maroon:    "#e64553",
  // pink:      "#ea76cb",
  // flamingo:  "#dd7878",
  // rosewater: "#dc8a78",
};

// ─── ComfyUI Dark (Default) ───────────────────────────────
export const COMFY_DARK = {
  _name: "ComfyUI Dark",
  // Base
  background: "#353535", // NODE_DEFAULT_BGCOLOR
  surface: "#222", // WIDGET_BGCOLOR
  overlay: "#666", // NODE_DEFAULT_BOXCOLOR
  // Text
  text: "#DDD", // WIDGET_TEXT_COLOR
  subtext: "#999", // WIDGET_SECONDARY_TEXT_COLOR
  muted: "#666", // WIDGET_DISABLED_TEXT_COLOR
  // Node Colors (ComfyUI Color Menu)
  red: "#FF6E6E", // VAE
  brown: "#FFA931", // CONDITIONING
  green: "#6EE7B7", // CONTROL_NET
  blue: "#64B5F6", // IMAGE
  pale_blue: "#A8DADC", // CLIP_VISION
  cyan: "#66FFFF", // GUIDER
  purple: "#B39DDB", // MODEL
  yellow: "#FFD500", // CLIP
  black: "#B0B0B0", // NOISE
};

// ─── ComfyUI Light ────────────────────────────────────────
export const COMFY_LIGHT = {
  _name: "ComfyUI Light",
  // Base
  background: "#F5F5F5", // NODE_DEFAULT_BGCOLOR
  surface: "#D4D4D4", // WIDGET_BGCOLOR
  overlay: "#CCC", // NODE_DEFAULT_BOXCOLOR
  // Text
  text: "#222", // WIDGET_TEXT_COLOR
  subtext: "#555", // WIDGET_SECONDARY_TEXT_COLOR
  muted: "#999", // WIDGET_DISABLED_TEXT_COLOR
  // Node Colors (ComfyUI Color Menu)
  red: "#FF7043", // VAE
  brown: "#FFA726", // CLIP
  green: "#66BB6A", // CONTROL_NET
  blue: "#42A5F5", // IMAGE
  pale_blue: "#5C6BC0", // CLIP_VISION
  cyan: "#66FFFF", // GUIDER
  purple: "#7E57C2", // MODEL
  yellow: "#EF5350", // CONDITIONING
  black: "#B0B0B0", // NOISE
};

// ─── Active Theme ─────────────────────────────────────────
export function getTheme() {
  try {
    const val = app.extensionManager?.setting?.get("LinuxTechLab.ColorTheme", "mocha");
    if (val === "latte") return LATTE;
    if (val === "comfy_dark") return COMFY_DARK;
    if (val === "comfy_light") return COMFY_LIGHT;
    return MOCHA;
  } catch {
    return MOCHA;
  }
}
