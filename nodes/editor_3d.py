import json
import os

import folder_paths
import numpy as np
import torch
from comfy_api.latest import io
from PIL import Image


class LinuxTechLab3D(io.ComfyNode):

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_3D",
            display_name="3D Builder",
            category="LinuxTechLab",
            description="3D Builder — create 3D scenes with shapes, materials, and lighting",
            is_output_node=True,
            inputs=[
                io.Custom("SCENE_WIDGET").Input("SceneWidget", optional=True),
            ],
            outputs=[
                io.Image.Output(display_name="image"),
                io.Int.Output(display_name="width"),
                io.Int.Output(display_name="height"),
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs):
        scene_data = kwargs.get("SceneWidget")
        if not scene_data:
            return ""
        try:
            scene_json = scene_data.get("scene_json", "{}")
            meta = json.loads(scene_json)
            composite_path = meta.get("composite_path", "")
            if composite_path:
                input_dir = folder_paths.get_input_directory()
                full_path = os.path.join(input_dir, composite_path)
                if os.path.exists(full_path):
                    return os.path.getmtime(full_path)
        except Exception:
            pass
        return str(scene_data)

    @classmethod
    def execute(cls, SceneWidget=None, **kwargs) -> io.NodeOutput:
        empty_image = torch.zeros((1, 1024, 1024, 3), dtype=torch.float32)

        if not SceneWidget:
            return io.NodeOutput(empty_image, 1024, 1024)

        scene_json = (
            SceneWidget.get("scene_json", "{}")
            if isinstance(SceneWidget, dict)
            else str(SceneWidget)
        )

        if not scene_json or scene_json.strip() in ("", "{}"):
            return io.NodeOutput(empty_image, 1024, 1024)

        try:
            meta = json.loads(scene_json)
            if not isinstance(meta, dict):
                return io.NodeOutput(empty_image, 1024, 1024)

            doc_w = int(meta.get("doc_w", 1024))
            doc_h = int(meta.get("doc_h", 1024))
            composite_path = meta.get("composite_path", "")

            if not composite_path:
                arr = np.zeros((doc_h, doc_w, 3), dtype=np.float32)
                return io.NodeOutput(torch.from_numpy(arr)[None,], doc_w, doc_h)

            input_dir = os.path.realpath(folder_paths.get_input_directory())
            full_path = os.path.realpath(os.path.join(input_dir, composite_path))

            if not full_path.startswith(input_dir + os.sep):
                print(
                    "[LinuxTechLab3D] Security: composite_path escapes input directory, blocked."
                )
                return io.NodeOutput(empty_image, doc_w, doc_h)

            if not os.path.exists(full_path):
                return io.NodeOutput(empty_image, doc_w, doc_h)

            img = Image.open(full_path).convert("RGB")
            arr = np.array(img).astype(np.float32) / 255.0
            return io.NodeOutput(torch.from_numpy(arr)[None,], doc_w, doc_h)

        except Exception as e:
            print(f"[LinuxTechLab3D] Load error: {e}")
            return io.NodeOutput(empty_image, 1024, 1024)
