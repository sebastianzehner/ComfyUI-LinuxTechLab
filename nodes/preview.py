import os
import uuid

import folder_paths
import numpy as np
from comfy_api.latest import io, ui
from PIL import Image

from ._save_helpers import _build_pnginfo, _safe_prefix


def _tensor_to_pil(tensor):
    """Convert a HxWxC float [0,1] tensor frame to a PIL.Image."""
    arr = (tensor.cpu().numpy() * 255.0).clip(0, 255).astype(np.uint8)
    return Image.fromarray(arr)


class LinuxTechLabPreview(io.ComfyNode):
    """Preview an image (or batch) inline in the node body, with buttons for
    Save-to-Disk and Save-to-Output. The image is also exposed on the output
    edge.
    Modes:
      preview (default): all batch frames are written to ComfyUI's temp/
        directory and shown in the node strip; nothing is saved permanently.
      save:              all batch frames are saved to output/ with embedded
        workflow metadata, exactly like the native SaveImage node, AND still
        shown in the strip preview.
    """

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Preview",
            display_name="Preview Image",
            category="LinuxTechLab",
            is_output_node=True,
            inputs=[
                io.Image.Input("image"),
                io.String.Input("filename_prefix", default="img"),
                io.Combo.Input(
                    "save_mode", options=["preview", "save"], default="preview"
                ),
            ],
            outputs=[
                io.Image.Output(display_name="image"),
            ],
            hidden=[io.Hidden.prompt, io.Hidden.extra_pnginfo],
        )

    @classmethod
    def execute(cls, image, filename_prefix, save_mode) -> io.NodeOutput:
        prefix = _safe_prefix(filename_prefix) or "Preview"
        results = []

        if save_mode == "save":
            output_dir = folder_paths.get_output_directory()
            full_folder, name, counter, subfolder, _ = folder_paths.get_save_image_path(
                prefix, output_dir, image.shape[2], image.shape[1]
            )
            os.makedirs(full_folder, exist_ok=True)
            for i, tensor in enumerate(image):
                pil = _tensor_to_pil(tensor)
                pnginfo = _build_pnginfo(
                    prompt=cls.hidden.prompt,
                    extra_pnginfo=cls.hidden.extra_pnginfo,
                )
                fname = f"{name}_{counter + i:05}_.png"
                pil.save(os.path.join(full_folder, fname), "PNG", pnginfo=pnginfo)
                results.append(
                    {"filename": fname, "subfolder": subfolder, "type": "output"}
                )
        else:
            temp_dir = folder_paths.get_temp_directory()
            os.makedirs(temp_dir, exist_ok=True)
            for tensor in image:
                pil = _tensor_to_pil(tensor)
                fname = f"linuxtechlab_preview_{uuid.uuid4().hex}.png"
                pil.save(os.path.join(temp_dir, fname), "PNG")
                results.append({"filename": fname, "subfolder": "", "type": "temp"})

        return io.NodeOutput(image, ui={"linuxtechlab_preview_frames": results})
