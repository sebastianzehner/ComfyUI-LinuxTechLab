"""
LinuxTechLabLlamaSwapUnload: standalone pass-through node that unloads a
llama-swap model on demand. Useful if you want to control the VRAM-unload
timing explicitly at a specific point in the graph, rather than relying on
LinuxTechLabPromptGenerator's built-in `unload_after` switch.
"""

import urllib.error
import urllib.request

from comfy_api.latest import io


def _unload_model(base_url: str, model: str, timeout: float = 10.0) -> bool:
    """
    Ask llama-swap to unload a specific model, freeing its VRAM.
    Tries the versioned API endpoint first, falls back to the legacy one.
    Never raises — VRAM freeing is best-effort so it can't break the graph.
    """
    base_url = base_url.rstrip("/")
    endpoints = [
        (f"{base_url}/api/models/unload/{model}", "POST"),
        (f"{base_url}/unload/{model}", "GET"),
    ]
    for url, method in endpoints:
        try:
            req = urllib.request.Request(url, method=method)
            with urllib.request.urlopen(req, timeout=timeout):
                return True
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            continue
    return False


class LinuxTechLabLlamaSwapUnload(io.ComfyNode):
    """
    Standalone utility node: unloads a model from llama-swap on demand.
    Wire 'passthrough' to whatever should happen before the unload (e.g. a
    generated prompt), and connect the output onward so execution order is
    respected without changing the value.
    """

    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id="LinuxTechLabLlamaSwapUnload",
            display_name="llama-swap: Unload Model",
            category="LinuxTechLab",
            description="Frees VRAM by unloading a model from llama-swap.",
            inputs=[
                io.AnyType.Input(
                    "passthrough",
                    tooltip="Any value; passed through unchanged after unloading.",
                ),
                io.String.Input("llama_swap_url", default="http://127.0.0.1:12434"),
                io.String.Input("model_name", default="qwen3.6-27B"),
            ],
            outputs=[
                io.AnyType.Output("passthrough"),
                io.Boolean.Output("unloaded"),
            ],
        )

    @classmethod
    def execute(cls, passthrough, llama_swap_url, model_name):
        ok = _unload_model(llama_swap_url, model_name)
        return io.NodeOutput(passthrough, ok)
