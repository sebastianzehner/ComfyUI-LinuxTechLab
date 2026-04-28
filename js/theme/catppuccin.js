(function () {
  // Catppuccin Mocha Node Colors for LinuxTechLab
  const COLORS = {
    red: { color: "#f38ba8", bgcolor: "#1e1e2e", groupcolor: "#f38ba8" },
    brown: { color: "#fab387", bgcolor: "#1e1e2e", groupcolor: "#fab387" },
    green: { color: "#a6e3a1", bgcolor: "#1e1e2e", groupcolor: "#a6e3a1" },
    blue: { color: "#89b4fa", bgcolor: "#1e1e2e", groupcolor: "#89b4fa" },
    pale_blue: { color: "#94e2d5", bgcolor: "#1e1e2e", groupcolor: "#94e2d5" },
    cyan: { color: "#74c7ec", bgcolor: "#1e1e2e", groupcolor: "#74c7ec" },
    purple: { color: "#cba6f7", bgcolor: "#1e1e2e", groupcolor: "#cba6f7" },
    yellow: { color: "#f9e2af", bgcolor: "#1e1e2e", groupcolor: "#f9e2af" },
    black: { color: "#585b70", bgcolor: "#1e1e2e", groupcolor: "#585b70" },
  };
  function applyColors() {
    if (typeof LGraphCanvas !== "undefined" && LGraphCanvas.node_colors) {
      Object.assign(LGraphCanvas.node_colors, COLORS);
      console.log("[LinuxTechLab] Catppuccin Mocha node colors applied.");
    } else {
      setTimeout(applyColors, 500);
    }
  }
  applyColors();
})();
