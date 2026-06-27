# Crop Video

Crop a video to a specific aspect ratio or custom resolution using FFmpeg.
Includes a live video preview with a draggable crop overlay, a timeline
scrubber, and IN/OUT trim controls.

![Crop Video Node](LinuxTechLab_CropVideo/crop_video.webp)

## Inputs

| Input           | Type  | Description                                                                          |
| --------------- | ----- | ------------------------------------------------------------------------------------ |
| `video_path`    | Combo | Select a source video from the scanned folders.                                      |
| `aspect_ratio`  | Combo | The target crop ratio. Choose a preset or `Custom` to set width and height manually. |
| `video_input`   | VIDEO | Optional. Connect a Load Video node. When connected, `video_path` is ignored.        |
| `custom_width`  | Int   | Crop width in pixels. Only used when `aspect_ratio` is set to `Custom`.              |
| `custom_height` | Int   | Crop height in pixels. Only used when `aspect_ratio` is set to `Custom`.             |

### Advanced Inputs

| Input            | Type    | Description                                                                                                   |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `video_codec`    | Combo   | The video encoder to use for the output file.                                                                 |
| `lossless`       | Boolean | Enable lossless encoding. Sets CRF 0 for x264/x265, lossless preset for NVENC.                                |
| `crf_quality`    | Int     | Constant Rate Factor quality. Lower is better. `18` is visually lossless. Ignored when `lossless` is enabled. |
| `preset`         | Combo   | Encoding speed vs. file size tradeoff.                                                                        |
| `audio`          | Combo   | How to handle the audio stream.                                                                               |
| `crop_x_offset`  | Int     | Horizontal position of the crop window. Controlled by dragging in the preview.                                |
| `crop_y_offset`  | Int     | Vertical position of the crop window. Controlled by dragging in the preview.                                  |
| `start_time_sec` | Float   | Trim start time in seconds. Set via the IN marker in the timeline.                                            |
| `end_time_sec`   | Float   | Trim end time in seconds. Set via the OUT marker in the timeline. `0` means full video.                       |

## Outputs

| Output         | Type   | Description                                                       |
| -------------- | ------ | ----------------------------------------------------------------- |
| `video`        | VIDEO  | The cropped video. Connect to a Save Video or Preview Video node. |
| `video_info`   | String | A summary of the source and crop parameters.                      |
| `crop_width`   | Int    | The actual width of the cropped output in pixels.                 |
| `crop_height`  | Int    | The actual height of the cropped output in pixels.                |
| `duration_sec` | Float  | The duration of the output video in seconds.                      |

## Aspect Ratio Presets

| Preset   | Ratio | Common Use                                      |
| -------- | ----- | ----------------------------------------------- |
| `1:1`    | 1:1   | Square – Instagram feed                         |
| `9:16`   | 9:16  | Portrait – Reels, TikTok, Shorts                |
| `4:5`    | 4:5   | Portrait – Instagram                            |
| `16:9`   | 16:9  | Landscape – YouTube, widescreen                 |
| `3:4`    | 3:4   | Portrait – iPad                                 |
| `2:3`    | 2:3   | Classic portrait                                |
| `Custom` | —     | Set `custom_width` and `custom_height` manually |

## Video Codecs

| Codec        | Description                                        |
| ------------ | -------------------------------------------------- |
| `libx264`    | H.264 software encoding. Best compatibility.       |
| `libx265`    | H.265 software encoding. Smaller files, slower.    |
| `h264_nvenc` | H.264 NVIDIA GPU encoding. Requires an NVIDIA GPU. |
| `hevc_nvenc` | H.265 NVIDIA GPU encoding. Requires an NVIDIA GPU. |
| `libvpx-vp9` | VP9 software encoding. For WebM output.            |

## Audio Options

| Option                | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `copy (no re-encode)` | Passes the audio stream through without re-encoding. Lossless and fast. |
| `aac 192k`            | Re-encodes audio to AAC at 192 kbps.                                    |
| `aac 320k`            | Re-encodes audio to AAC at 320 kbps.                                    |
| `strip audio`         | Removes the audio track from the output.                                |

## Preview Controls

The node embeds a live video player with interactive controls:

- **Drag on the video** to reposition the crop window horizontally and vertically.
- **Scrubber** – drag the timeline bar to seek through the video.
- **▶ / ⏸** – play or pause the video.
- **🔁** – toggle loop playback within the IN/OUT range.
- **IN Set / Clear** – set or clear the trim start point at the current
  playback position.
- **OUT Set / Clear** – set or clear the trim end point at the current
  playback position.

## Video Folder Configuration

By default the node scans `ComfyUI/input/` and `ComfyUI/output/` for video
files. To scan custom folders instead, create a `video_tools.yaml` file in the
node directory:

```yaml
video_paths:
  - ~/Videos
  - /mnt/footage
```

When paths are defined here, the default ComfyUI folders are ignored.

## Tips

- The node processes the video as soon as any node is connected to one of its
  outputs and the workflow is executed. To save the result permanently, connect
  a **Save Video** node to the `video` output.
- For fast cropping without quality loss, use `copy (no re-encode)` for audio
  and `lossless` mode for video.
- When using `Custom` aspect ratio, connect `custom_width` and `custom_height`
  from a **Resolution** node to set the crop size dynamically.
- If the source video is narrower than the requested crop width (e.g. cropping
  a 9:16 video to 4:3), the crop is automatically clamped to fit within the
  source dimensions.
