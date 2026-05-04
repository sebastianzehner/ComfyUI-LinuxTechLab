/**
 * LinuxTechLab Theme Settings
 * Registers the LinuxTechLab extension settings in the ComfyUI Application Settings.
 */

import { app } from "/scripts/app.js";
import { getBrand, getTheme, lightenColor, darkenColor } from "../theme/palette.mjs";

app.registerExtension({
  name: "LinuxTechLab.Settings",
  async setup() {
    const brand = getBrand();
    const t = getTheme();
    // Brand
    document.documentElement.style.setProperty("--ltl-brand", brand);
    document.documentElement.style.setProperty("--ltl-brand-hover", lightenColor(brand, 0.15));
    document.documentElement.style.setProperty("--ltl-brand-dark", darkenColor(brand, 0.15));
    // Base
    document.documentElement.style.setProperty("--ltl-background", t.background);
    document.documentElement.style.setProperty("--ltl-surface", t.surface);
    document.documentElement.style.setProperty("--ltl-overlay", t.overlay);
    // Text
    document.documentElement.style.setProperty("--ltl-text", t.text);
    document.documentElement.style.setProperty("--ltl-subtext", t.subtext);
    document.documentElement.style.setProperty("--ltl-muted", t.muted);
    // Node Colors
    document.documentElement.style.setProperty("--ltl-red", t.red);
    document.documentElement.style.setProperty("--ltl-brown", t.brown);
    document.documentElement.style.setProperty("--ltl-green", t.green);
    document.documentElement.style.setProperty("--ltl-blue", t.blue);
    document.documentElement.style.setProperty("--ltl-pale-blue", t.pale_blue);
    document.documentElement.style.setProperty("--ltl-cyan", t.cyan);
    document.documentElement.style.setProperty("--ltl-purple", t.purple);
    document.documentElement.style.setProperty("--ltl-yellow", t.yellow);
    document.documentElement.style.setProperty("--ltl-black", t.black);
  },
  settings: [
    {
      id: "LinuxTechLab.ColorTheme",
      name: "Color Theme",
      tooltip: "Reload the page to apply the new theme.",
      type: "combo",
      defaultValue: "mocha",
      options: [
        { value: "none", text: "ComfyUI Default" },
        { value: "mocha", text: "Catppuccin Mocha" },
        { value: "latte", text: "Catppuccin Latte" },
        { value: "comfy_dark", text: "ComfyUI Dark" },
        { value: "comfy_light", text: "ComfyUI Light" },
      ],
      category: ["LinuxTechLab", "Appearance", "Color Theme"],
    },
    {
      id: "LinuxTechLab.BrandColor",
      name: "Brand Color",
      tooltip: "Reload the page to apply. Used for buttons, highlights and accents.",
      type: "color",
      defaultValue: "#89b4fa",
      category: ["LinuxTechLab", "Appearance", "Brand Color"],
    },
    {
      id: "LinuxTechLab.BrandBackground",
      name: "Brand Background Color",
      tooltip: "Reload the page to apply. Used for brand background accents.",
      type: "color",
      defaultValue: "#1e1e2e",
      category: ["LinuxTechLab", "Appearance", "Brand Background"],
    },
  ],
});
