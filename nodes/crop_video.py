"""
LinuxTechLab Crop Video Node
"""

import json
import os
import shutil
import subprocess
import tempfile
import time

import folder_paths
import yaml
from comfy_api.latest import io
from server import PromptServer

# ──────────────────────────────────────────────────────────────────────────────
# FFmpeg helpers
# ──────────────────────────────────────────────────────────────────────────────


def find_ffmpeg() -> str:
    f = shutil.which("ffmpeg")
    if f:
        return f
    for c in ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"]:
        if os.path.isfile(c):
            return c
    raise RuntimeError("ffmpeg not found.")


def find_ffprobe() -> str:
    f = shutil.which("ffprobe")
    if f:
        return f
    for c in ["/usr/bin/ffprobe", "/usr/local/bin/ffprobe"]:
        if os.path.isfile(c):
            return c
    raise RuntimeError("ffprobe not found.")


def get_video_info(path: str) -> dict:
    cmd = [
        find_ffprobe(),
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_streams",
        "-show_format",
        path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {r.stderr}")
    data = json.loads(r.stdout)
    info = {"width": 0, "height": 0, "duration": 0.0, "fps": 0.0, "codec": "unknown"}
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            info["width"] = int(s.get("width", 0))
            info["height"] = int(s.get("height", 0))
            info["codec"] = s.get("codec_name", "unknown")
            try:
                n, d = s.get("r_frame_rate", "0/1").split("/")
                info["fps"] = round(float(n) / float(d), 3)
            except Exception:
                pass
            info["duration"] = float(
                s.get("duration", data.get("format", {}).get("duration", 0))
            )
            break
    return info


def run_ffmpeg(cmd: list, description: str = "FFmpeg") -> None:
    full = [find_ffmpeg(), "-y"] + cmd
    print(f"[LinuxTechLab] {description}")
    print(f"[LinuxTechLab] CMD: {' '.join(full)}")
    r = subprocess.run(full, capture_output=True, text=True, timeout=600)
    if r.returncode != 0:
        raise RuntimeError(f"{description} failed (code {r.returncode}):\n{r.stderr}")


def calc_crop_width(src_h: int, ratio_w: int, ratio_h: int) -> int:
    w = (src_h * ratio_w) / ratio_h
    return int(w) if int(w) % 2 == 0 else int(w) - 1


# ──────────────────────────────────────────────────────────────────────────────
# Video file scanner
# ──────────────────────────────────────────────────────────────────────────────

VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".mkv",
    ".avi",
    ".webm",
    ".m4v",
    ".mts",
    ".m2ts",
    ".ts",
    ".flv",
    ".wmv",
    ".mpg",
    ".mpeg",
}

_NODE_DIR = os.path.dirname(os.path.abspath(__file__))
_CONFIG_PATH = os.path.join(_NODE_DIR, "video_tools.yaml")
_video_path_map: dict = {}
_video_list_cache: list = []
_ffmpeg_version_cache: str = ""


def _load_config() -> dict:
    if not os.path.isfile(_CONFIG_PATH):
        return {}
    try:
        with open(_CONFIG_PATH) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"[LinuxTechLab] Could not read video_tools.yaml: {e}")
        return {}


def _get_search_dirs() -> list:
    cfg = _load_config()
    yaml_paths = [
        os.path.expanduser(p)
        for p in cfg.get("video_paths", [])
        if os.path.isdir(os.path.expanduser(p))
    ]
    if yaml_paths:
        return yaml_paths
    return [
        d
        for d in [
            folder_paths.get_input_directory(),
            folder_paths.get_output_directory(),
        ]
        if os.path.isdir(d)
    ]


def _scan_videos() -> list:
    global _video_path_map
    _video_path_map = {}
    found, seen = [], set()
    for base in _get_search_dirs():
        base = base.rstrip(os.sep)
        for root, _, files in os.walk(base):
            for fname in sorted(files):
                if os.path.splitext(fname)[1].lower() not in VIDEO_EXTENSIONS:
                    continue
                full = os.path.join(root, fname)
                if full in seen:
                    continue
                seen.add(full)
                rel = os.path.relpath(full, base)
                if rel in _video_path_map:
                    rel = full
                _video_path_map[rel] = full
                found.append(rel)
    found.sort(key=lambda p: (os.path.dirname(p), os.path.basename(p).lower()))
    return found if found else ["[no videos found]"]


def get_video_list(refresh: bool = False) -> list:
    global _video_list_cache
    if not _video_list_cache or refresh:
        _video_list_cache = _scan_videos()
    return _video_list_cache


def resolve_video_path(rel: str) -> str:
    if not rel or rel == "[no videos found]":
        return rel
    if os.path.isabs(rel) and os.path.isfile(rel):
        return rel
    if rel in _video_path_map:
        return _video_path_map[rel]
    for base in _get_search_dirs():
        c = os.path.join(base, rel)
        if os.path.isfile(c):
            return c
    return rel


def _get_ffmpeg_version() -> str:  # exported to server_routes.py
    global _ffmpeg_version_cache
    if _ffmpeg_version_cache:
        return _ffmpeg_version_cache
    try:
        r = subprocess.run(
            [find_ffmpeg(), "-version"], capture_output=True, text=True, timeout=10
        )
        parts = r.stdout.splitlines()[0].split()
        _ffmpeg_version_cache = f"ffmpeg {parts[2]}" if len(parts) >= 3 else "ffmpeg"
    except Exception:
        _ffmpeg_version_cache = "ffmpeg not found"
    return _ffmpeg_version_cache


def _make_video_output(output_path: str):
    from comfy_api.latest._input_impl.video_types import VideoFromFile

    return VideoFromFile(output_path)


def _resolve_input_path(video_path: str, video_input) -> str:
    if video_input is not None:
        print(f"[LinuxTechLab] VIDEO input type: {type(video_input).__name__}")
        if hasattr(video_input, "_VideoFromFile__file"):
            return str(video_input._VideoFromFile__file)
        if isinstance(video_input, dict):
            return (
                video_input.get("path")
                or video_input.get("video_path")
                or video_input.get("filename")
                or ""
            )
        if hasattr(video_input, "path"):
            return str(video_input.path)
        raise ValueError(
            f"Could not extract path from VIDEO input (type: {type(video_input)})"
        )
    return resolve_video_path(video_path)


def _notify_frontend(
    video_path, src_w, src_h, src_dur, fps, crop_w, crop_h, crop_x, crop_y
):
    try:
        PromptServer.instance.send_sync(
            "linuxtechlab.video_resolved",
            {
                "video_path": video_path,
                "src_width": src_w,
                "src_height": src_h,
                "duration": src_dur,
                "fps": fps,
                "crop_w": crop_w,
                "crop_h": crop_h,
                "crop_x": crop_x,
                "crop_y": crop_y,
            },
        )
    except Exception:
        pass


# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

CROP_PRESETS = {
    "1:1": (1, 1),
    "16:9": (16, 9),
    "9:16": (9, 16),
    "2:1": (2, 1),
    "3:2": (3, 2),
    "2:3": (2, 3),
    "4:3": (4, 3),
    "3:4": (3, 4),
    "4:5": (4, 5),
    "Custom": None,
}

CODEC_OPTIONS = [
    "libx264",
    "libx265",
    "h264_nvenc  (NVIDIA GPU)",
    "hevc_nvenc  (NVIDIA GPU)",
    "libvpx-vp9",
]
AUDIO_OPTIONS = ["copy  (no re-encode)", "aac 192k", "aac 320k", "strip audio"]
PRESET_OPTIONS = ["ultrafast", "superfast", "fast", "medium", "slow"]


# ──────────────────────────────────────────────────────────────────────────────
# LinuxTechLabCropVideo Node
# ──────────────────────────────────────────────────────────────────────────────


class LinuxTechLabCropVideo(io.ComfyNode):

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_CropVideo",
            display_name="Crop Video",
            category="LinuxTechLab",
            description="Crop video clips with FFmpeg.",
            is_output_node=False,
            not_idempotent=True,
            inputs=[
                io.Combo.Input("video_path", options=get_video_list()),
                io.Combo.Input(
                    "aspect_ratio",
                    options=list(CROP_PRESETS.keys()),
                    default="9:16",
                ),
                io.Int.Input(
                    "crop_x_offset",
                    default=0,
                    min=0,
                    max=7680,
                    step=2,
                    optional=True,
                    advanced=True,
                ),
                io.Int.Input(
                    "crop_y_offset",
                    default=0,
                    min=0,
                    max=4320,
                    step=2,
                    optional=True,
                    advanced=True,
                ),
                io.Combo.Input(
                    "video_codec",
                    options=CODEC_OPTIONS,
                    default="libx264",
                    advanced=True,
                ),
                io.Boolean.Input("lossless", default=False, advanced=True),
                io.Int.Input(
                    "crf_quality",
                    default=18,
                    min=0,
                    max=51,
                    step=1,
                    display_mode=io.NumberDisplay.slider,
                    advanced=True,
                ),
                io.Combo.Input(
                    "preset", options=PRESET_OPTIONS, default="medium", advanced=True
                ),
                io.Combo.Input(
                    "audio",
                    options=AUDIO_OPTIONS,
                    default="copy  (no re-encode)",
                    advanced=True,
                ),
                io.Custom("VIDEO").Input("video_input", optional=True),
                io.Int.Input(
                    "custom_width",
                    default=608,
                    min=2,
                    max=7680,
                    step=2,
                    optional=True,
                    force_input=True,
                    tooltip="Crop width (Custom mode only) – connect from another node",
                ),
                io.Int.Input(
                    "custom_height",
                    default=1080,
                    min=2,
                    max=4320,
                    step=2,
                    optional=True,
                    force_input=True,
                    tooltip="Crop height (Custom mode only) – connect from another node",
                ),
                io.Float.Input(
                    "start_time_sec",
                    default=0.0,
                    min=0.0,
                    max=86400.0,
                    step=0.1,
                    optional=True,
                    advanced=True,
                ),
                io.Float.Input(
                    "end_time_sec",
                    default=0.0,
                    min=0.0,
                    max=86400.0,
                    step=0.1,
                    optional=True,
                    advanced=True,
                ),
            ],
            outputs=[
                io.Custom("VIDEO").Output(display_name="video"),
                io.String.Output(display_name="video_info"),
                io.Int.Output(display_name="crop_width"),
                io.Int.Output(display_name="crop_height"),
                io.Float.Output(display_name="duration_sec"),
            ],
        )

    @classmethod
    def execute(  # type: ignore[override]
        cls,
        video_path,
        aspect_ratio,
        video_codec,
        lossless,
        crf_quality,
        preset,
        audio,
        crop_x_offset=0,
        crop_y_offset=0,
        video_input=None,
        custom_width=960,
        custom_height=1088,
        start_time_sec=0.0,
        end_time_sec=0.0,
    ) -> io.NodeOutput:

        resolved = _resolve_input_path(video_path, video_input)
        if not resolved or not os.path.isfile(resolved):
            raise FileNotFoundError(f"Video not found: {resolved}")

        info = get_video_info(resolved)
        src_w = info["width"]
        src_h = info["height"]
        src_dur = info["duration"]

        if aspect_ratio == "Custom":
            crop_w = (
                int(custom_width) if custom_width % 2 == 0 else int(custom_width) - 1
            )
            crop_h = (
                int(custom_height) if custom_height % 2 == 0 else int(custom_height) - 1
            )
            crop_w = min(crop_w, src_w - (src_w % 2))
            crop_h = min(crop_h, src_h - (src_h % 2))
        else:
            rw, rh = CROP_PRESETS[aspect_ratio]
            crop_w = calc_crop_width(src_h, rw, rh)
            crop_h = src_h
            if crop_w > src_w:
                crop_w = src_w - (src_w % 2)
                crop_h = int((crop_w * rh) / rw)
                crop_h = crop_h if crop_h % 2 == 0 else crop_h - 1
            if crop_h > src_h:
                crop_h = src_h - (src_h % 2)
                crop_w = calc_crop_width(src_h, rw, rh)

        max_x = max(0, src_w - crop_w)
        max_y = max(0, src_h - crop_h)
        crop_x = min(crop_x_offset, max_x)
        crop_y = (
            (max_y // 2) - ((max_y // 2) % 2)
            if (crop_y_offset == 0 and max_y > 0)
            else min(crop_y_offset, max_y)
        )

        tmp = tempfile.NamedTemporaryFile(
            suffix=".mp4", prefix="ffmpeg_crop_", delete=False
        )
        tmp.close()

        cmd = []
        if start_time_sec > 0:
            cmd += ["-ss", str(start_time_sec)]
        cmd += ["-i", resolved]
        if end_time_sec > 0 and end_time_sec > start_time_sec:
            cmd += ["-t", str(end_time_sec - start_time_sec)]
        cmd += ["-vf", f"crop={crop_w}:{crop_h}:{crop_x}:{crop_y}"]

        codec = video_codec.split()[0]
        cmd += ["-c:v", codec]
        if codec in ("libx264", "libx265"):
            cmd += (
                ["-crf", "0", "-preset", preset]
                if lossless
                else ["-crf", str(crf_quality), "-preset", preset]
            )
        elif codec in ("h264_nvenc", "hevc_nvenc"):
            if lossless:
                cmd += ["-preset", "lossless"]
            else:
                nvenc = {
                    "ultrafast": "p1",
                    "superfast": "p2",
                    "fast": "p4",
                    "medium": "p5",
                    "slow": "p7",
                }
                cmd += ["-preset", nvenc.get(preset, "p5"), "-cq", str(crf_quality)]
        elif codec == "libvpx-vp9":
            cmd += (
                ["-lossless", "1"]
                if lossless
                else ["-crf", str(crf_quality), "-b:v", "0"]
            )

        am = audio.split()[0]
        if am == "copy":
            cmd += ["-c:a", "copy"]
        elif am == "aac":
            cmd += [
                "-c:a",
                "aac",
                "-b:a",
                audio.split()[1] if len(audio.split()) > 1 else "192k",
            ]
        elif am == "strip":
            cmd += ["-an"]
        cmd += [tmp.name]

        run_ffmpeg(cmd, f"Crop Video in {crop_w}×{crop_h} @ x={crop_x} y={crop_y}")

        eff_dur = (
            (min(src_dur, end_time_sec) - start_time_sec)
            if end_time_sec > 0
            else src_dur
        )
        ql = "lossless" if lossless else f"CRF {crf_quality}"
        video_info = (
            f"[FFmpeg] Source: {src_w}×{src_h} | {info['fps']} fps | {src_dur:.1f}s | {info['codec']}\n"
            f"[FFmpeg] Crop:   {crop_w}×{crop_h} ({aspect_ratio.split()[0]}) @ X={crop_x} Y={crop_y}\n"
            f"[FFmpeg] Codec:  {codec}  {ql}  |  audio: {audio.split('(')[0].strip()}"
        )
        print(f"[LinuxTechLab] Crop Video Done!\n{video_info}")

        _notify_frontend(
            resolved,
            src_w,
            src_h,
            src_dur,
            info.get("fps", 0.0),
            crop_w,
            crop_h,
            crop_x,
            crop_y,
        )

        return io.NodeOutput(
            _make_video_output(tmp.name), video_info, crop_w, crop_h, eff_dur
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs):
        return time.time()
