import json
import os

import folder_paths
import numpy as np
import torch
from PIL import Image

from .node_ref import any_type


class LinuxTechLabShowText:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"source": (any_type, {})}}

    RETURN_TYPES = ()
    FUNCTION = "show"
    OUTPUT_NODE = True
    CATEGORY = "LinuxTechLab"

    def show(self, source):
        try:
            import torch

            if isinstance(source, torch.Tensor):
                text = (
                    f"Tensor  shape={tuple(source.shape)}"
                    f"  dtype={source.dtype}"
                    f"  min={source.min().item():.4f}"
                    f"  max={source.max().item():.4f}"
                )
            elif isinstance(source, dict) and "samples" in source:
                s = source["samples"]
                text = f"Latent  shape={tuple(s.shape)}"
            else:
                text = str(source)
        except Exception:
            text = str(source)
        return {"ui": {"text": [text]}}


NODE_CLASS_MAPPINGS = {
    "LinuxTechLabShowText": LinuxTechLabShowText,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LinuxTechLabShowText": "Show Text",
}
