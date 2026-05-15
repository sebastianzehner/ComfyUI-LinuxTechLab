# nodes/node_audio_studio.py
"""AudioReact LinuxTechLab -- audio-reactive image-to-video with a live editor.

Effect math lives in the shared engine (_audio_react_engine.py). This
node ships a fullscreen browser editor with WebGL preview as the only
config surface (no on-canvas widgets). The editor saves to a hidden
`studio_json` input via Pattern #9 (extension-scope app.graphToPrompt
injection).

Source resolution at exec time:
- image: optional upstream IMAGE input. If unwired, loaded from disk at
  input/linuxtechlab/audio_studio/<node_id>/image.<ext>.
- audio: same dual-source pattern. Disk-stored audio is always WAV
  (browser converts before upload -- see js/audio_studio/audio_analysis.mjs).
"""

from __future__ import annotations

import json
import wave
from pathlib import Path

import folder_paths
import numpy as np
import torch
from comfy_api.latest import io
from PIL import Image

from ._audio_react_engine import generate_video, params_from_dict, validate_params

LINUXTECHLAB_INPUT_ROOT = Path(folder_paths.get_input_directory()) / "linuxtechlab"


def _migrate_cfg(cfg: dict) -> dict:
    version = cfg.get("schema_version", 1)
    cfg["schema_version"] = version
    return cfg


def _load_inline_image(rel_path: str) -> torch.Tensor:
    abs_path = LINUXTECHLAB_INPUT_ROOT / rel_path
    if not abs_path.exists():
        raise ValueError(
            f"[LinuxTechLab] AudioReact -- inline image missing at {abs_path}. "
            f"Re-open the editor and re-pick the image."
        )
    arr = np.array(Image.open(abs_path).convert("RGB"), dtype=np.float32) / 255.0
    return torch.from_numpy(arr).unsqueeze(0)


def _load_inline_audio(rel_path: str) -> dict:
    abs_path = LINUXTECHLAB_INPUT_ROOT / rel_path
    if not abs_path.exists():
        raise ValueError(
            f"[LinuxTechLab] AudioReact -- inline audio missing at {abs_path}. "
            f"Re-open the editor and re-pick the audio."
        )
    with wave.open(str(abs_path), "rb") as wf:
        sample_rate = wf.getframerate()
        n_channels = wf.getnchannels()
        sample_width = wf.getsampwidth()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)
    if sample_width == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sample_width == 4:
        data = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
    elif sample_width == 1:
        data = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    else:
        raise ValueError(
            f"[LinuxTechLab] AudioReact -- unsupported WAV sample width "
            f"{sample_width} bytes. Re-encode to 16-bit PCM WAV."
        )
    if n_channels > 1:
        data = data.reshape(-1, n_channels).T
    else:
        data = data.reshape(1, -1)
    waveform = torch.from_numpy(data).unsqueeze(0)
    return {"waveform": waveform, "sample_rate": sample_rate}


class LinuxTechLabAudioStudio(io.ComfyNode):
    """Audio-reactive image-to-video. Config stored in node.properties,
    surfaced via a fullscreen JS editor."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_AudioStudio",
            display_name="AudioReact",
            category="LinuxTechLab",
            inputs=[
                io.Image.Input(
                    "image",
                    optional=True,
                    tooltip="Optional upstream image. If wired, used as the source. "
                    "If unwired, the editor's inline-loaded image is used.",
                ),
                io.Audio.Input(
                    "audio",
                    optional=True,
                    tooltip="Optional upstream audio. Same dual-source pattern as image.",
                ),
                io.String.Input(
                    "studio_json", default="{}", advanced=True, socketless=True
                ),
            ],
            outputs=[
                io.Image.Output(display_name="video_frames"),
                io.Audio.Output(display_name="audio"),
                io.Float.Output(display_name="fps"),
            ],
        )

    @classmethod
    def execute(cls, studio_json="{}", image=None, audio=None) -> io.NodeOutput:
        try:
            cfg = json.loads(studio_json or "{}")
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"[LinuxTechLab] AudioReact -- could not parse studio_json: {exc}. "
                f"Open the editor and re-save."
            ) from exc
        cfg = _migrate_cfg(cfg)
        params = params_from_dict(cfg)

        if cfg.get("image_force_inline") and cfg.get("image_path"):
            image = _load_inline_image(cfg["image_path"])
        elif image is None:
            if cfg.get("image_path"):
                image = _load_inline_image(cfg["image_path"])
            else:
                raise ValueError(
                    "[LinuxTechLab] AudioReact -- no image source. Wire an "
                    "IMAGE input or open the editor and load an inline image."
                )

        if cfg.get("audio_force_inline") and cfg.get("audio_path"):
            audio = _load_inline_audio(cfg["audio_path"])
        elif audio is None:
            if cfg.get("audio_path"):
                audio = _load_inline_audio(cfg["audio_path"])
            else:
                raise ValueError(
                    "[LinuxTechLab] AudioReact -- no audio source. Wire an "
                    "AUDIO input or open the editor and load an inline audio."
                )

        for diag in validate_params(params):
            print(f"[LinuxTechLab] AudioReact -- {diag}")
        frames = generate_video(image, audio, params)
        return io.NodeOutput(frames, audio, float(params.fps))
