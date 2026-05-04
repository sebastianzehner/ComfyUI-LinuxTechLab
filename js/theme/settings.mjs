/**
 * LinuxTechLab Theme Settings
 * Registers the LinuxTechLab extension settings in the ComfyUI Application Settings.
 */

import { app } from "/scripts/app.js";
import { getBrand } from "../theme/palette.mjs";

app.registerExtension({
  name: "LinuxTechLab.Settings",
  async setup() {
    const brand = getBrand();
    document.documentElement.style.setProperty("--ltl-brand", brand);
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
