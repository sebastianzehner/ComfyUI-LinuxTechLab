import { app } from "/scripts/app.js";
import { getTheme } from "./palette.mjs";
import { allow_debug } from "../shared/utils.mjs";

// ─── Node Colors for right-click Color menu ───────────────
function buildColors() {
  const t = getTheme();
  return {
    red: { color: t.red, bgcolor: t.background, groupcolor: t.red },
    brown: { color: t.brown, bgcolor: t.background, groupcolor: t.brown },
    green: { color: t.green, bgcolor: t.background, groupcolor: t.green },
    blue: { color: t.blue, bgcolor: t.background, groupcolor: t.blue },
    pale_blue: { color: t.pale_blue, bgcolor: t.background, groupcolor: t.pale_blue },
    cyan: { color: t.cyan, bgcolor: t.background, groupcolor: t.cyan },
    purple: { color: t.purple, bgcolor: t.background, groupcolor: t.purple },
    yellow: { color: t.yellow, bgcolor: t.background, groupcolor: t.yellow },
    black: { color: t.black, bgcolor: t.background, groupcolor: t.black },
  };
}

export function applyColors() {
  const val = app.extensionManager?.setting?.get("LinuxTechLab.ColorTheme", "mocha");
  if (val === "none") return;

  if (typeof LGraphCanvas !== "undefined" && LGraphCanvas.node_colors) {
    const t = getTheme();
    Object.assign(LGraphCanvas.node_colors, buildColors());
    if (allow_debug) console.log("[LinuxTechLab] Node colors applied:", t._name);
  } else {
    setTimeout(applyColors, 500);
  }
}

applyColors();
