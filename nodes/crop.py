import json
import os

import folder_paths
import numpy as np
import torch
from comfy_api.latest import io
from PIL import Image


class LinuxTechLabCrop(io.ComfyNode):

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Crop",
            display_name="Image Crop",
            category="LinuxTechLab",
            is_output_node=True,
            inputs=[
                io.Custom("CROP_WIDGET").Input("CropWidget", optional=True),
                io.Image.Input("image", optional=True),
            ],
            outputs=[
                io.Image.Output(display_name="image"),
                io.Int.Output(display_name="width"),
                io.Int.Output(display_name="height"),
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs):
        crop_data = kwargs.get("CropWidget")
        if not crop_data:
            return ""
        try:
            crop_json = (
                crop_data.get("crop_json", "{}")
                if isinstance(crop_data, dict)
                else str(crop_data)
            )
            meta = json.loads(crop_json)
            rect_key = f"{meta.get('crop_x','')}-{meta.get('crop_y','')}-{meta.get('crop_w','')}-{meta.get('crop_h','')}"
            if kwargs.get("image") is not None:
                return rect_key
            composite_path = meta.get("composite_path", "")
            if composite_path:
                input_dir = folder_paths.get_input_directory()
                full_path = os.path.join(input_dir, composite_path)
                if os.path.exists(full_path):
                    return f"{os.path.getmtime(full_path)}:{rect_key}"
        except Exception:
            pass
        return str(crop_data)

    @classmethod
    def execute(cls, CropWidget=None, image=None, **kwargs) -> io.NodeOutput:
        empty_image = torch.ones((1, 1024, 1024, 3), dtype=torch.float32)

        if not CropWidget and image is None:
            return io.NodeOutput(empty_image, 1024, 1024)

        meta = {}
        if CropWidget:
            crop_json = (
                CropWidget.get("crop_json", "{}")
                if isinstance(CropWidget, dict)
                else str(CropWidget)
            )
            if crop_json and crop_json.strip() not in ("", "{}"):
                try:
                    parsed = json.loads(crop_json)
                    if isinstance(parsed, dict):
                        meta = parsed
                except Exception as e:
                    print(f"[LinuxTechLabCrop] crop_json parse error: {e}")

        if isinstance(image, torch.Tensor):
            try:
                w, h, cropped = cls._crop_tensor(image, meta)
                return io.NodeOutput(cropped, w, h)
            except Exception as e:
                print(f"[LinuxTechLabCrop] upstream crop error: {e}")

        result, w, h = cls._load_disk_composite(meta, empty_image)
        return io.NodeOutput(result, w, h)

    @classmethod
    def _crop_tensor(cls, tensor, meta):
        if tensor.dim() != 4 or tensor.shape[0] == 0:
            if tensor.dim() >= 3:
                return (int(tensor.shape[-2]), int(tensor.shape[-3]), tensor)
            return (0, 0, tensor)

        b, h, w, c = tensor.shape

        if not meta or meta.get("crop_w") in (None, 0):
            return (int(w), int(h), tensor)

        crop_x = float(meta.get("crop_x", 0))
        crop_y = float(meta.get("crop_y", 0))
        crop_w = float(meta.get("crop_w", w))
        crop_h = float(meta.get("crop_h", h))
        orig_w = float(meta.get("original_w", w))
        orig_h = float(meta.get("original_h", h))

        if orig_w > 0 and orig_h > 0 and (orig_w != w or orig_h != h):
            sx = w / orig_w
            sy = h / orig_h
            crop_x *= sx
            crop_y *= sy
            crop_w *= sx
            crop_h *= sy

        x0 = max(0, int(round(crop_x)))
        y0 = max(0, int(round(crop_y)))
        x1 = min(w, int(round(crop_x + crop_w)))
        y1 = min(h, int(round(crop_y + crop_h)))

        if x1 <= x0 or y1 <= y0:
            print(
                f"[LinuxTechLabCrop] degenerate rect ({x0},{y0},{x1},{y1}) for {w}x{h} — passing through"
            )
            return (int(w), int(h), tensor)

        cropped = tensor[:, y0:y1, x0:x1, :].contiguous()
        return (int(x1 - x0), int(y1 - y0), cropped)

    @classmethod
    def _load_disk_composite(cls, meta, empty_image):
        doc_w = int(meta.get("doc_w", 1024))
        doc_h = int(meta.get("doc_h", 1024))

        composite_path = meta.get("composite_path", "")
        if not composite_path:
            arr = np.ones((doc_h, doc_w, 3), dtype=np.float32)
            return (torch.from_numpy(arr)[None,], doc_w, doc_h)

        input_dir = os.path.realpath(folder_paths.get_input_directory())
        full_path = os.path.realpath(os.path.join(input_dir, composite_path))

        if not full_path.startswith(input_dir + os.sep):
            print(
                "[LinuxTechLabCrop] Security: composite_path escapes input directory, blocked."
            )
            return (empty_image, doc_w, doc_h)

        if not os.path.exists(full_path):
            return (empty_image, doc_w, doc_h)

        try:
            img = Image.open(full_path).convert("RGB")
            arr = np.array(img).astype(np.float32) / 255.0
            return (torch.from_numpy(arr)[None,], doc_w, doc_h)
        except Exception as e:
            print(f"[LinuxTechLabCrop] Load error: {e}")
            return (empty_image, 1024, 1024)
