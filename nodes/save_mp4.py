import os
import shutil
import subprocess
import sys
import threading
import uuid
import wave

import comfy.model_management
import folder_paths
import numpy as np
import torch
from comfy_api.latest import io


def _resolve_ffmpeg():
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    on_path = shutil.which("ffmpeg")
    if on_path:
        return on_path
    raise RuntimeError(
        "[LinuxTechLab] Save Mp4 — ffmpeg binary not found.\n"
        "   Install one of:\n"
        "     pip install imageio-ffmpeg     (recommended, no system install)\n"
        "     https://ffmpeg.org/download.html  (system-wide)\n"
    )


_COUNTER_LOCK = threading.Lock()


def _next_mp4_counter(folder, prefix):
    if not os.path.isdir(folder):
        return 1
    pat = prefix + "_"
    max_n = 0
    for f in os.listdir(folder):
        if not f.startswith(pat) or not f.endswith(".mp4"):
            continue
        middle = f[len(pat) : -len(".mp4")]
        try:
            n = int(middle)
        except ValueError:
            continue
        if n > max_n:
            max_n = n
    return max_n + 1


def _write_wav_pcm16(path, waveform, sample_rate):
    if waveform.dim() == 3:
        waveform = waveform[0]
    n_ch = int(waveform.shape[0])
    if n_ch == 0:
        raise ValueError("[LinuxTechLab] Save Mp4 — audio waveform has 0 channels.")
    samples = waveform.detach().cpu().numpy()
    samples = np.clip(samples, -1.0, 1.0)
    samples = (samples * 32767.0).astype(np.int16)
    interleaved = samples.T.tobytes()
    with wave.open(path, "wb") as f:
        f.setnchannels(n_ch)
        f.setsampwidth(2)
        f.setframerate(int(sample_rate))
        f.writeframes(interleaved)


class LinuxTechLabSaveMp4(io.ComfyNode):
    """Encode an IMAGE batch (and optional AUDIO) to a single H.264 mp4."""

    _CRF = 19
    _PIX_FMT = "yuv420p"

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_SaveMp4",
            display_name="Save MP4",
            category="LinuxTechLab",
            is_output_node=True,
            inputs=[
                io.Image.Input(
                    "video_frames",
                    tooltip="Frame batch to encode. Wire Audio React LinuxTechLab's video_frames output here.",
                ),
                io.Float.Input(
                    "fps",
                    default=24.0,
                    min=1.0,
                    max=120.0,
                    step=1.0,
                    tooltip="Output frame rate. Wire Audio React LinuxTechLab's fps output here so it always matches what produced the frames.",
                ),
                io.String.Input(
                    "filename_prefix",
                    default="Video",
                    tooltip="Filename stem. The node appends a 5-digit counter and .mp4 (e.g. Video_00001.mp4).",
                ),
                io.Combo.Input(
                    "save_mode",
                    options=["save", "preview"],
                    default="save",
                    tooltip="save: write to ComfyUI's output/ folder. preview: write to ComfyUI's temp/ folder, auto-cleared on restart.",
                ),
                io.Boolean.Input(
                    "trim_to_audio",
                    default=True,
                    tooltip="When audio is connected, end the video at the audio's length. Off = keep all video frames even if longer than audio.",
                ),
                io.Audio.Input(
                    "audio",
                    optional=True,
                    tooltip="Optional audio track to mux into the mp4 as AAC 192k.",
                ),
            ],
            outputs=[],
        )

    @classmethod
    def execute(
        cls, video_frames, fps, filename_prefix, save_mode, trim_to_audio, audio=None
    ) -> io.NodeOutput:
        if video_frames is None or video_frames.shape[0] == 0:
            raise ValueError(
                "[LinuxTechLab] Save Mp4 — input video_frames batch is empty."
            )

        ffmpeg_path = _resolve_ffmpeg()
        crf = cls._CRF
        pix_fmt = cls._PIX_FMT
        fps_int = max(1, int(round(float(fps))))

        frames = video_frames
        n_frames, H, W, _ = frames.shape

        if pix_fmt == "yuv420p" and (W % 2 != 0 or H % 2 != 0):
            raise ValueError(
                f"[LinuxTechLab] Save Mp4 — encoder requires even width and "
                f"height, got {W}x{H}. Resize input frames to even dimensions."
            )

        if save_mode == "preview":
            out_dir = folder_paths.get_temp_directory()
            file_type = "temp"
        else:
            out_dir = folder_paths.get_output_directory()
            file_type = "output"

        full_folder, fname, _ignored, subfolder, _ = folder_paths.get_save_image_path(
            filename_prefix,
            out_dir,
            W,
            H,
        )
        os.makedirs(full_folder, exist_ok=True)

        with _COUNTER_LOCK:
            counter = _next_mp4_counter(full_folder, fname)
            out_filename = f"{fname}_{counter:05d}.mp4"
            out_path = os.path.join(full_folder, out_filename)
            try:
                fd = os.open(out_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                os.close(fd)
            except FileExistsError:
                counter += 1
                out_filename = f"{fname}_{counter:05d}.mp4"
                out_path = os.path.join(full_folder, out_filename)

        temp_audio_path = None
        if (
            audio is not None
            and audio.get("waveform") is not None
            and audio["waveform"].numel() > 0
        ):
            temp_audio_path = os.path.join(
                folder_paths.get_temp_directory(),
                f"linuxtechlab_save_mp4_{uuid.uuid4().hex}.wav",
            )
            os.makedirs(os.path.dirname(temp_audio_path), exist_ok=True)
            _write_wav_pcm16(temp_audio_path, audio["waveform"], audio["sample_rate"])

        cmd = [
            ffmpeg_path,
            "-y",
            "-loglevel",
            "error",
            "-f",
            "rawvideo",
            "-vcodec",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{W}x{H}",
            "-r",
            str(fps_int),
            "-i",
            "-",
        ]
        if temp_audio_path is not None:
            cmd += ["-i", temp_audio_path]
        cmd += [
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            str(crf),
            "-pix_fmt",
            pix_fmt,
        ]
        if temp_audio_path is not None:
            cmd += ["-c:a", "aac", "-b:a", "192k"]
            if trim_to_audio:
                cmd += ["-shortest"]
        cmd += [out_path]

        print(
            f"[LinuxTechLab] Save Mp4 [{save_mode}] — writing {n_frames} frames @ {fps_int}fps "
            f"({W}x{H}, crf={crf}, {pix_fmt}"
            f"{', +audio' if temp_audio_path else ''}) -> {out_filename}"
        )

        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
        )
        stderr_chunks = []

        def _drain(pipe):
            try:
                for chunk in iter(lambda: pipe.read(4096), b""):
                    stderr_chunks.append(chunk)
            except Exception:
                pass

        drain_thread = threading.Thread(target=_drain, args=(proc.stderr,), daemon=True)
        drain_thread.start()

        try:
            for i in range(n_frames):
                comfy.model_management.throw_exception_if_processing_interrupted()
                frame_u8 = (frames[i].clamp(0.0, 1.0).cpu().numpy() * 255.0).astype(
                    np.uint8
                )
                proc.stdin.write(frame_u8.tobytes())
            proc.stdin.close()
            proc.wait()
            drain_thread.join()
            if proc.returncode != 0:
                stderr = b"".join(stderr_chunks).decode("utf-8", errors="replace")
                raise RuntimeError(
                    f"[LinuxTechLab] Save Mp4 — ffmpeg failed (exit {proc.returncode}):\n{stderr}"
                )
        finally:
            try:
                if proc.stdin and not proc.stdin.closed:
                    proc.stdin.close()
            except OSError:
                pass
            if proc.poll() is None:
                proc.kill()
                proc.wait()
            if drain_thread.is_alive():
                drain_thread.join(timeout=2)
            if temp_audio_path is not None and os.path.exists(temp_audio_path):
                try:
                    os.remove(temp_audio_path)
                except OSError:
                    pass

        if save_mode == "preview":
            print(f"[LinuxTechLab] Save Mp4 — preview written to temp/: {out_path}")
        else:
            print(f"[LinuxTechLab] Save Mp4 — saved {out_path}")

        entry = {
            "filename": out_filename,
            "subfolder": subfolder,
            "type": file_type,
            "format": "video/mp4",
        }
        return io.NodeOutput(ui={"images": [entry], "linuxtechlab_videos": [entry]})
