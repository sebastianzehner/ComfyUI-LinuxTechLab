import { app } from "/scripts/app.js";
import { allow_debug, hideJsonWidget } from "../shared/index.mjs";
import { DEFAULTS, fontStr, measureLabel } from "./render.mjs";
import { parseCfg, LabelEditor } from "./core.mjs";

// ─── Setup helpers ───────────────────────────────────────────
const NO_TITLE = (typeof LiteGraph !== "undefined" && LiteGraph.NO_TITLE) || 1;

function setupLabel(node) {
  try {
    hideJsonWidget(node.widgets, "label_json");
    node._labelCfg = parseCfg(node);
    node.color = "transparent";
    node.bgcolor = "transparent";
    node.flags = node.flags || {};
    node.flags.no_title = true;
    // Remove input slots so no connections can be made
    if (node.inputs) node.inputs.length = 0;
    const m = measureLabel(node._labelCfg);
    if (node.size) {
      node.size[0] = Math.max(m.w, 60);
      node.size[1] = Math.max(m.h, 30);
    }
  } catch (err) {
    console.error("[LinuxTechLab Label] setupLabel error:", err);
  }
}

// ─── Extension Registration ──────────────────────────────────
app.registerExtension({
  name: "LinuxTechLab.Label",

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "LinuxTechLabLabel") return;

    nodeType.title_mode = NO_TITLE;

    // ── Creation ─────────────────────────────────────────
    const _origCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      const r = _origCreated?.apply(this, arguments);
      setupLabel(this);
      this.badges = [];
      if (allow_debug) console.log("LinuxTechLabLabel", this);
      return r;
    };

    // ── Configure (load from saved workflow) ─────────────
    const _origCfg = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function (_data) {
      const r = _origCfg?.apply(this, arguments);
      setupLabel(this);
      return r;
    };

    // ── Drawing ──────────────────────────────────────────
    const _origDraw = nodeType.prototype.onDrawForeground;
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (_origDraw) _origDraw.call(this, ctx);
      this.color = "transparent";
      this.bgcolor = "transparent";

      const c = this._labelCfg || DEFAULTS;
      const m = measureLabel(c);
      this.size[0] = m.w;
      this.size[1] = m.h;

      ctx.save();
      ctx.globalAlpha = c.opacity;

      if (c.backgroundColor !== "transparent") {
        ctx.fillStyle = c.backgroundColor;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(0, 0, m.w, m.h, c.borderRadius);
        else ctx.rect(0, 0, m.w, m.h);
        ctx.fill();
      }

      ctx.font = fontStr(c);
      ctx.fillStyle = c.fontColor;
      ctx.textBaseline = "top";
      ctx.textAlign = c.textAlign;
      let tx = c.padding;
      if (c.textAlign === "center") tx = m.w / 2;
      else if (c.textAlign === "right") tx = m.w - c.padding;
      for (let i = 0; i < m.lines.length; i++) {
        ctx.fillText(m.lines[i], tx, c.padding + i * m.lh);
      }
      ctx.restore();

      // Remove input slots every frame (ComfyUI may re-add them)
      if (this.inputs && this.inputs.length) this.inputs.length = 0;
    };

    // ── Context Menu → open editor ───────────────────────
    nodeType.prototype.getExtraMenuOptions = function (_canvas, options) {
      options.unshift({
        content: "Open Label Editor",
        callback: () => {
          const editor = new LabelEditor(this);
          editor.open();
        },
      });
    };

    // ── Double-click → open editor ───────────────────────
    nodeType.prototype.onDblClick = function (_e, _pos) {
      const editor = new LabelEditor(this);
      editor.open();
      return true;
    };
  },
});

// ─── Patch: Nodes 2.0 rendering ──────────────────────────
// Nodes 2.0 does not automatically call onDrawForeground for custom nodes.
// This patch ensures the label is rendered correctly in both legacy and Nodes 2.0 mode.
if (typeof LGraphCanvas !== "undefined") {
  const oldDrawNode = LGraphCanvas.prototype.drawNode;
  LGraphCanvas.prototype.drawNode = function (node, ctx) {
    if (node.type === "LinuxTechLabLabel") {
      node.bgcolor = "transparent";
      node.color = "transparent";
      const r = oldDrawNode.apply(this, arguments);
      ctx.save();
      node.onDrawForeground(ctx);
      ctx.restore();
      return r;
    }
    return oldDrawNode.apply(this, arguments);
  };
}
