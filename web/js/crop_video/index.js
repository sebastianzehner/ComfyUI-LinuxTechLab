// ============================================================
// LinuxTechLab Video Crop Node — Entry Point
// ============================================================

import { app } from "/scripts/app.js";
import { getTheme } from "../theme/palette.mjs";

const C = getTheme();

// ─── Layout ────────────────────────────────────────────────────────────────────
const CROP_RATIOS = {
  "1:1": [1, 1],
  "16:9": [16, 9],
  "9:16": [9, 16],
  "2:1": [2, 1],
  "3:2": [3, 2],
  "2:3": [2, 3],
  "4:3": [4, 3],
  "3:4": [3, 4],
  "4:5": [4, 5],
  Custom: null,
};
const CONTROLS_H = 36; // play button + time readout row
const SCRUBBER_H = 28; // main scrubber bar
const INOUT_H = 36; // IN / OUT controls row
const FIXED_H = CONTROLS_H + SCRUBBER_H + INOUT_H; // non-video UI height
const MIN_VIDEO_H = 160;
const DEFAULT_VIDEO_H = 260;

function calcCropWidth(srcH, rw, rh) {
  let w = Math.floor((srcH * rw) / rh);
  return w % 2 === 0 ? w : w - 1;
}
function setSliderMax(widget, max) {
  if (!widget?.options) return;
  widget.options.max = max;
  if (widget.value > max) widget.value = Math.round(max * 10) / 10;
}
function fmt(t) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, "0");
  return m > 0 ? `${m}:${s}` : `${t.toFixed(1)}s`;
}
function getActivePath(node) {
  const idx = node.inputs?.findIndex((i) => i.name === "video_input");
  if (idx >= 0 && node.inputs[idx].link != null) return { path: null, fromSocket: true };
  const val = node.widgets?.find((w) => w.name === "video_path")?.value || "";
  if (!val || val === "[no videos found]") return { path: "", fromSocket: false };
  // val is a relative path – Python resolves it to full path via _video_path_map
  // For the video element we need the full path via serve_video, so pass as-is
  // (serve_video endpoint now also accepts relative paths and resolves them)
  return { path: val, fromSocket: false };
}

// ─── Main extension ────────────────────────────────────────────────────────────
app.registerExtension({
  name: "LinuxTechLab.CropVideo",

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "LinuxTechLab_CropVideo") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) onNodeCreated.apply(this, arguments);
      this.size = [350, 600];
      const node = this;
      const wgt = (name) => node.widgets?.find((w) => w.name === name);
      const getV = (name) => Number(wgt(name)?.value) || 0;
      function setV(name, v) {
        const w = wgt(name);
        if (!w) return;
        v = Math.max(w.options?.min ?? 0, Math.min(w.options?.max ?? 1e9, Math.round(v * 10) / 10));
        w.value = v;
        if (w.callback) w.callback(v);
      }

      // ── Root container – flex column so video fills remaining space ─
      const root = document.createElement("div");
      root.style.cssText = `width:100%;background:${C.background};border-radius:8px;overflow:hidden;display:flex;flex-direction:column;font-family:monospace;`;

      // ── Video wrapper (grows to fill available height) ────────────
      const videoWrap = document.createElement("div");
      videoWrap.style.cssText = `position:relative;flex:1;min-height:${MIN_VIDEO_H}px;background:#000;overflow:hidden;`;
      root.appendChild(videoWrap);

      // ── Video element ─────────────────────────────────────────────
      const video = document.createElement("video");
      video.style.cssText = `width:100%;height:100%;object-fit:contain;display:block;`;
      video.preload = "metadata";
      videoWrap.appendChild(video);

      // ── Crop overlay ──────────────────────────────────────────────
      const cropCvs = document.createElement("canvas");
      cropCvs.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;`;
      videoWrap.appendChild(cropCvs);

      // ── Crop info bar ─────────────────────────────────────────────
      const infoBar = document.createElement("div");
      infoBar.style.cssText = `position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:${C.subtext};font-size:10px;padding:3px 8px;pointer-events:none;`;
      videoWrap.appendChild(infoBar);

      // ── Controls row (play + time) ────────────────────────────────
      const ctrlRow = document.createElement("div");
      ctrlRow.style.cssText = `display:flex;align-items:center;gap:10px;height:${CONTROLS_H}px;padding:0 10px;background:${C.background_dark};border-top:1px solid ${C.surface};`;
      root.appendChild(ctrlRow);

      const playBtn = document.createElement("button");
      playBtn.style.cssText = `background:none;border:none;cursor:pointer;color:${C.blue};font-size:14px;padding:0;line-height:1;display:flex;align-items:center;`;
      playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      ctrlRow.appendChild(playBtn);

      const loopBtn = document.createElement("button");
      loopBtn.title = "Loop playback";
      loopBtn.style.cssText = `background:none;border:none;cursor:pointer;color:${C.overlay};padding:0;line-height:1;display:flex;align-items:center;transition:color 0.15s;`;
      loopBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;
      let loopActive = false;
      loopBtn.addEventListener("click", () => {
        loopActive = !loopActive;
        loopBtn.style.color = loopActive ? C.blue : C.overlay;
        loopBtn.style.filter = loopActive ? `drop-shadow(0 0 4px ${C.blue})` : "";
      });
      ctrlRow.appendChild(loopBtn);

      const timeLabel = document.createElement("span");
      timeLabel.style.cssText = `color:${C.text};font-size:11px;min-width:60px;`;
      timeLabel.textContent = "0.0s";
      ctrlRow.appendChild(timeLabel);

      const durLabel = document.createElement("span");
      durLabel.style.cssText = `color:${C.overlay};font-size:11px;`;
      durLabel.textContent = "";
      ctrlRow.appendChild(durLabel);

      // spacer
      const sp = document.createElement("div");
      sp.style.flex = "1";
      ctrlRow.appendChild(sp);

      // ── ffmpeg version badge ──────────────────────────────────────
      const verBadge = document.createElement("div");
      verBadge.style.cssText = `top:6px;right:8px;background:${C.background_darkest};color:${C.blue};font-size:9.5px;padding:2px 7px;border-radius:3px;pointer-events:none;`;
      ctrlRow.appendChild(verBadge);

      // ── Scrubber row ──────────────────────────────────────────────
      const scrubRow = document.createElement("div");
      scrubRow.style.cssText = `position:relative;height:${SCRUBBER_H}px;background:${C.background_darkest};padding:0 12px;display:flex;align-items:center;cursor:pointer;user-select:none;`;
      root.appendChild(scrubRow);

      // Track
      const track = document.createElement("div");
      track.style.cssText = `position:relative;flex:1;height:4px;background:${C.surface};border-radius:2px;`;
      scrubRow.appendChild(track);

      // Active fill (blue)
      const fill = document.createElement("div");
      fill.style.cssText = `position:absolute;left:0;top:0;height:100%;background:${C.blue};border-radius:2px;width:0%;pointer-events:none;`;
      track.appendChild(fill);

      // Cursor circle
      const cursor = document.createElement("div");
      cursor.style.cssText = `position:absolute;top:50%;width:12px;height:12px;background:${C.text};border-radius:50%;transform:translate(-50%,-50%);left:0%;pointer-events:none;box-shadow:0 0 0 2px ${C.blue};`;
      track.appendChild(cursor);

      // ── IN / OUT row ──────────────────────────────────────────────
      const inoutRow = document.createElement("div");
      inoutRow.style.cssText = `display:flex;align-items:center;gap:6px;height:${INOUT_H}px;padding:0 10px;background:${C.background_dark};border-top:1px solid ${C.surface};`;
      root.appendChild(inoutRow);

      function mkBadge(label, color) {
        const b = document.createElement("span");
        b.style.cssText = `font-size:9px;font-weight:600;letter-spacing:0.05em;color:${color};background:${color}22;border:1px solid ${color}55;border-radius:3px;padding:1px 5px;flex-shrink:0;`;
        b.textContent = label;
        return b;
      }
      function mkTimeBtn(label, onClick) {
        const b = document.createElement("button");
        b.style.cssText = `background:${C.surface};border:none;color:${C.text};font-size:10px;font-family:monospace;padding:3px 8px;border-radius:4px;cursor:pointer;`;
        b.textContent = label;
        b.addEventListener("click", onClick);
        return b;
      }
      function mkTimeDisplay(color) {
        const d = document.createElement("span");
        d.style.cssText = `color:${color};font-size:11px;min-width:46px;text-align:center;`;
        d.textContent = "0.0s";
        return d;
      }

      inoutRow.appendChild(mkBadge("IN", C.green));
      const inSetBtn = mkTimeBtn("Set", () => {
        setV("start_time_sec", video.currentTime);
        updateInOut();
      });
      const inClrBtn = mkTimeBtn("Clear", () => {
        setV("start_time_sec", 0);
        updateInOut();
      });
      const inDisplay = mkTimeDisplay(C.green);
      inoutRow.appendChild(inSetBtn);
      inoutRow.appendChild(inDisplay);
      inoutRow.appendChild(inClrBtn);

      const divider = document.createElement("div");
      divider.style.cssText = `flex:1;height:1px;background:${C.surface};margin:0 4px;`;
      inoutRow.appendChild(divider);

      inoutRow.appendChild(mkBadge("OUT", C.red));
      const outSetBtn = mkTimeBtn("Set", () => {
        setV("end_time_sec", video.currentTime);
        updateInOut();
      });
      const outClrBtn = mkTimeBtn("Clear", () => {
        setV("end_time_sec", 0);
        updateInOut();
      });
      const outDisplay = mkTimeDisplay(C.red);
      inoutRow.appendChild(outSetBtn);
      inoutRow.appendChild(outDisplay);
      inoutRow.appendChild(outClrBtn);

      // DOM widget – height adapts to node size
      node.addDOMWidget("_player", "player", root, {
        getMinHeight: () => MIN_VIDEO_H + FIXED_H + 4,
        getMaxHeight: () => 9999,
        serialize: false,
      });

      // ── State ─────────────────────────────────────────────────────
      let srcWidth = 0,
        srcHeight = 0,
        duration = 0,
        currentPath = "";
      let isPlaying = false,
        rafId = null;
      let scrubDragging = false;
      let cropDragging = false,
        cropStartX = 0,
        cropStartVal = 0;

      // ── ffmpeg version ─────────────────────────────────────────────
      fetch("/linuxtechlab/api/video/ffmpeg_version")
        .then((r) => r.json())
        .then((d) => {
          verBadge.textContent = d.version || "";
        })
        .catch(() => {});

      // ── Load video ────────────────────────────────────────────────
      function loadVideo(path) {
        if (!path || path === currentPath) return;
        currentPath = path;
        video.src = `/linuxtechlab/api/video/serve?path=${encodeURIComponent(path)}`;
        video.load();
      }

      video.addEventListener("loadedmetadata", () => {
        duration = video.duration;
        srcWidth = video.videoWidth;
        srcHeight = video.videoHeight;
        const maxT = Math.floor(duration * 10) / 10;
        setSliderMax(wgt("start_time_sec"), maxT);
        setSliderMax(wgt("end_time_sec"), maxT);
        durLabel.textContent = ` / ${fmt(duration)}`;
        video.currentTime = Math.min(getV("start_time_sec") || 0, duration);
        updateInOut();
        drawCrop();
        app.graph.setDirtyCanvas(true, false);
      });

      video.addEventListener("seeked", () => {
        drawCrop();
        updateScrubber();
      });
      video.addEventListener("timeupdate", () => {
        if (isPlaying) {
          updateScrubber();
        }
      });
      video.addEventListener("ended", () => {
        if (loopActive) {
          const inT = getV("start_time_sec");
          video.currentTime = inT;
          video.play();
        } else {
          stopPlay();
        }
      });

      // ── Play / Pause ──────────────────────────────────────────────
      const PLAY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      const PAUSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

      function stopPlay() {
        video.pause();
        isPlaying = false;
        playBtn.innerHTML = PLAY_ICON;
        cancelAnimationFrame(rafId);
        updateScrubber();
      }

      playBtn.addEventListener("click", () => {
        if (!video.src || !duration) return;
        if (isPlaying) {
          stopPlay();
          return;
        }
        const inT = getV("start_time_sec"),
          outT = getV("end_time_sec");
        if (outT > 0 && video.currentTime >= outT) video.currentTime = inT;
        video.play();
        isPlaying = true;
        playBtn.innerHTML = PAUSE_ICON;
        function loop() {
          if (!isPlaying) return;
          const out = getV("end_time_sec");
          if (out > 0 && video.currentTime >= out) {
            if (loopActive) {
              video.currentTime = getV("start_time_sec");
            } else {
              video.currentTime = out;
              stopPlay();
              return;
            }
          }
          updateScrubber();
          rafId = requestAnimationFrame(loop);
        }
        loop();
      });

      // ── Scrubber update ───────────────────────────────────────────
      function updateScrubber() {
        if (!duration) return;
        const t = video.currentTime;
        const pct = (t / duration) * 100;
        fill.style.width = pct + "%";
        cursor.style.left = pct + "%";
        timeLabel.textContent = fmt(t);
      }

      function updateInOut() {
        const inT = getV("start_time_sec");
        const outT = getV("end_time_sec");
        inDisplay.textContent = fmt(inT);
        outDisplay.textContent = outT > 0 ? fmt(outT) : "–";
      }

      // ── Scrubber drag ─────────────────────────────────────────────
      function scrubToX(clientX) {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const t = pct * duration;
        if (isPlaying) stopPlay();
        video.currentTime = t;
        updateScrubber();
      }

      scrubRow.addEventListener("mousedown", (e) => {
        if (!duration) return;
        scrubDragging = true;
        scrubToX(e.clientX);
        e.preventDefault();
      });

      // ── Crop drag on video ────────────────────────────────────────
      let cropStartY = 0,
        cropStartValY = 0;
      videoWrap.addEventListener("mousedown", (e) => {
        if (!srcWidth) return;
        cropDragging = true;
        cropStartX = e.clientX;
        cropStartY = e.clientY;
        cropStartVal = getV("crop_x_offset");

        // Effective Y: if widget is 0, use displayed center position
        const arKey2 = wgt("aspect_ratio")?.value || Object.keys(CROP_RATIOS)[0];
        let cropH2start;
        if (arKey2 === "Custom") {
          cropH2start = node._lastCropH || srcHeight;
        } else {
          const [rw2, rh2] = CROP_RATIOS[arKey2] || [9, 16];
          cropH2start = srcHeight;
        }
        const rawY = getV("crop_y_offset");
        cropStartValY = rawY === 0 && cropH2start < srcHeight ? Math.round((srcHeight - cropH2start) / 2) : rawY;

        videoWrap.style.cursor = "move";
        e.preventDefault();
      });

      // ── Global mouse events ───────────────────────────────────────
      window.addEventListener("mousemove", (e) => {
        if (scrubDragging) scrubToX(e.clientX);

        if (cropDragging && srcWidth) {
          const dispW = videoWrap.clientWidth || root.clientWidth || 400;
          const dispH = videoWrap.clientHeight || DEFAULT_VIDEO_H;
          const scale = Math.min(dispW / srcWidth, dispH / srcHeight);
          const arKey = wgt("aspect_ratio")?.value || Object.keys(CROP_RATIOS)[0];

          // X drag
          const deltaX = (e.clientX - cropStartX) / scale;
          let cropW, cropH2;
          if (arKey === "Custom") {
            cropW = node._lastCropW || 608;
            cropH2 = node._lastCropH || 1080;
          } else {
            const [rw, rh] = CROP_RATIOS[arKey] || [9, 16];
            cropW = calcCropWidth(srcHeight, rw, rh);
            cropH2 = srcHeight;
            if (cropW > srcWidth) {
              cropW = srcWidth - (srcWidth % 2);
              cropH2 = Math.floor((cropW * rh) / rw);
              if (cropH2 % 2 !== 0) cropH2 -= 1;
            }
            if (cropH2 > srcHeight) {
              cropH2 = srcHeight - (srcHeight % 2);
              cropW = calcCropWidth(srcHeight, rw, rh);
            }
          }
          const maxX = Math.max(0, srcWidth - cropW);
          let newX = Math.round((cropStartVal + deltaX) / 2) * 2;
          newX = Math.max(0, Math.min(newX, maxX));
          setV("crop_x_offset", newX);

          // Y drag (only when crop height < source height)
          if (cropH2 < srcHeight) {
            const deltaY = (e.clientY - cropStartY) / scale;
            const maxY = Math.max(0, srcHeight - cropH2);
            let newY = Math.round((cropStartValY + deltaY) / 2) * 2;
            newY = Math.max(0, Math.min(newY, maxY));
            setV("crop_y_offset", newY);
          }

          drawCrop();
          app.graph.setDirtyCanvas(true, false);
        }
      });

      window.addEventListener("mouseup", () => {
        if (scrubDragging) {
          scrubDragging = false;
        }
        if (cropDragging) {
          cropDragging = false;
          videoWrap.style.cursor = "";
          drawCrop();
        }
      });

      // ── Crop overlay ──────────────────────────────────────────────
      function drawCrop() {
        const dpr = window.devicePixelRatio || 1;
        const dispW = videoWrap.clientWidth || root.clientWidth || 400;
        const dispH = videoWrap.clientHeight || DEFAULT_VIDEO_H;
        const needW = dispW * dpr;
        const needH = dispH * dpr;
        // Only reset canvas buffer if size changed (avoids triggering video repaint)
        if (cropCvs.width !== needW || cropCvs.height !== needH) {
          cropCvs.width = needW;
          cropCvs.height = needH;
        }
        const ctx = cropCvs.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, dispW, dispH);
        if (!srcWidth || !srcHeight) return;

        const scale = Math.min(dispW / srcWidth, dispH / srcHeight);
        const imgW = srcWidth * scale;
        const imgH = srcHeight * scale;
        const offX = (dispW - imgW) / 2;
        const offY = (dispH - imgH) / 2;

        const arKey = wgt("aspect_ratio")?.value || Object.keys(CROP_RATIOS)[0];
        let cropW, cropH2;
        if (arKey === "Custom") {
          // custom_width/height are optional input sockets – not widgets.
          // Use values cached from the last execution (onExecuted),
          // or fall back to defaults until the first run.
          cropW = node._lastCropW || 608;
          cropH2 = node._lastCropH || 1080;
          // ensure even
          cropW = cropW % 2 === 0 ? cropW : cropW - 1;
          cropH2 = cropH2 % 2 === 0 ? cropH2 : cropH2 - 1;
        } else {
          const [rw, rh] = CROP_RATIOS[arKey] || [9, 16];
          cropW = calcCropWidth(srcHeight, rw, rh);
          cropH2 = srcHeight;
          if (cropW > srcWidth) {
            cropW = srcWidth - (srcWidth % 2);
            cropH2 = Math.floor((cropW * rh) / rw);
            if (cropH2 % 2 !== 0) cropH2 -= 1;
          }
          if (cropH2 > srcHeight) {
            cropH2 = srcHeight - (srcHeight % 2);
            cropW = calcCropWidth(srcHeight, rw, rh);
          }
        }
        const cropX = getV("crop_x_offset");
        const cropY = getV("crop_y_offset");
        const clampX = Math.max(0, Math.min(cropX, srcWidth - cropW));
        // cropY=0 means top, not center. Center is just the default start value.
        const clampY = Math.max(0, Math.min(cropY, srcHeight - cropH2));

        const rx = offX + clampX * scale;
        const rw2 = cropW * scale;

        const rh2 = cropH2 * scale;
        const ry = offY + clampY * scale;

        // Dim outside (left, right, top, bottom)
        ctx.fillStyle = "rgba(0,0,0,0.52)";
        ctx.fillRect(offX, offY, rx - offX, imgH); // left
        ctx.fillRect(rx + rw2, offY, offX + imgW - (rx + rw2), imgH); // right
        ctx.fillRect(rx, offY, rw2, ry - offY); // top
        ctx.fillRect(rx, ry + rh2, rw2, offY + imgH - (ry + rh2)); // bottom

        // Border
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = cropDragging ? 2.5 : 1.5;
        ctx.strokeRect(rx, ry, rw2, rh2);

        // Handles
        const H = 10;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = C.text;
        [
          [rx, ry],
          [rx + rw2, ry],
          [rx, ry + rh2],
          [rx + rw2, ry + rh2],
        ].forEach(([cx, cy], i) => {
          const [sx, sy] = [
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1],
          ][i];
          ctx.beginPath();
          ctx.moveTo(cx, cy + sy * H);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + sx * H, cy);
          ctx.stroke();
        });

        const sizeLabel = arKey === "Custom" ? `${cropW}×${cropH2} (custom)` : `${cropW}×${cropH2}`;
        const yInfo = cropH2 < srcHeight ? `  Y=${clampY}` : "";
        infoBar.textContent = `${srcWidth}×${srcHeight}  >>  crop ${sizeLabel}  @  X=${clampX}${yInfo}  (max ${srcWidth - cropW})`;
      }

      // ── VIDEO socket event ────────────────────────────────────────
      function onVideoResolved(e) {
        const d = e.detail;
        if (!d?.video_path) return;
        loadVideo(d.video_path);
        // crop_w/h only present after actual execution, not on initial load
        if (d.crop_w > 0) {
          node._lastCropW = d.crop_w;
          requestAnimationFrame(() => drawCrop());
        }
        if (d.crop_h > 0) {
          node._lastCropH = d.crop_h;
        }
      }
      app.api.addEventListener("linuxtechlab.video_resolved", onVideoResolved);
      const origRemoved = node.onRemoved;
      node.onRemoved = function () {
        app.api.removeEventListener("linuxtechlab.video_resolved", onVideoResolved);
        app.api.removeEventListener("executed", onGraphExecuted);
        if (origRemoved) origRemoved.call(this);
      };

      // ── Widget visibility ─────────────────────────────────────────
      // Keep ALL widgets in node.widgets so ComfyUI serializes their values.
      // Hide visually via computeSize→[0,-4] + draw→no-op.

      function updateWidgetVisibility() {
        const vidIdx = node.inputs?.findIndex((i) => i.name === "video_input");
        const linked = vidIdx >= 0 && node.inputs[vidIdx]?.link != null;

        // Internal widgets: hide via V3 hidden flag
        ["crop_x_offset", "crop_y_offset", "start_time_sec", "end_time_sec"].forEach((name) => hideW(name));

        // video_path: standard hidden flag
        const vpw = wgt("video_path");
        if (vpw) vpw.hidden = !!linked;

        app.graph.setDirtyCanvas(true, true);
      }

      // Hide widgets visually; keep in node.widgets so values are serialized
      function hideW(name) {
        const w = wgt(name);
        if (!w) return;
        w.hidden = true;
      }
      function hideCropOffsetWidgets() {
        hideW("crop_x_offset");
        hideW("crop_y_offset");
      }

      function hookWidgets() {
        const pw = wgt("video_path");
        if (pw) {
          const orig = pw.callback;
          pw.callback = function (...a) {
            if (orig) orig.apply(this, a);
            const { path } = getActivePath(node);
            if (path && path !== "[no videos found]") loadVideo(path);
          };
        }
        const aw = wgt("aspect_ratio");
        if (aw) {
          const orig = aw.callback;
          aw.callback = function (...a) {
            if (orig) orig.apply(this, a);
            // Clear cached Custom dims when switching to a fixed ratio
            if (aw.value !== "Custom") {
              node._lastCropW = null;
              node._lastCropH = null;
            }
            // In V3, the callback fires after the value is committed
            drawCrop();
          };
        }
      }

      // After node executes, read actual crop dimensions from the output
      // (crop_width and crop_height are returned as outputs 3+4)
      // onExecuted is only called for OUTPUT_NODE=True nodes.
      // Instead listen to the global "executed" API event and match by node id.
      function onGraphExecuted(event) {
        const detail = event.detail;
        if (!detail?.output) return;
        // detail is { node_id: "50", output: { crop_width: [1344], ... } }
        if (String(detail.node_id ?? detail.prompt_id) !== String(node.id) && !detail.output) return;

        // Try to find our node's output in the event
        const nodeId = String(node.id);
        const output = detail.output?.[nodeId] ?? detail.output;
        if (!output) return;

        const tryGet = (key) => {
          const v = output[key];
          if (v == null) return null;
          if (Array.isArray(v)) {
            const inner = v[0];
            return Array.isArray(inner) ? Number(inner[0]) : Number(inner);
          }
          return Number(v);
        };

        const cw = tryGet("crop_width");
        const ch = tryGet("crop_height");
        if (cw && cw > 0) node._lastCropW = cw;
        if (ch && ch > 0) node._lastCropH = ch;

        // Fallback: parse video_info string "Crop:   1344×768"
        if (!(cw > 0) || !(ch > 0)) {
          const info = String(output.video_info?.[0] ?? output.video_info ?? "");
          const m = info.match(/\[FFmpeg\] Crop:\s*(\d+)[x×](\d+)/);
          if (m) {
            node._lastCropW = Number(m[1]);
            node._lastCropH = Number(m[2]);
          }
        }

        requestAnimationFrame(() => drawCrop());
      }

      // linuxtechlab.video_resolved is the primary source of crop dims after execution
      app.api.addEventListener("executed", onGraphExecuted);
      // Primary source of crop dims is now linuxtechlab.video_resolved above

      const origConn = node.onConnectionsChange;
      node.onConnectionsChange = function (...a) {
        if (origConn) origConn.apply(this, a);
        const { path } = getActivePath(node);
        if (path) loadVideo(path);
        updateWidgetVisibility();
        app.graph.setDirtyCanvas(true, true);
      };

      node.onResize = () => {
        // Let the browser reflow first, then redraw
        requestAnimationFrame(() => drawCrop());
      };

      requestAnimationFrame(() => {
        hideCropOffsetWidgets();
        hookWidgets();
        updateWidgetVisibility();
        // Ensure sensible default node width
        if (node.size[0] < 420) {
          node.size[0] = 420;
          app.graph.setDirtyCanvas(true, true);
        }
        const { path } = getActivePath(node);
        if (path) loadVideo(path);
      });
    };
  },
});
