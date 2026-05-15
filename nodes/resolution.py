"""Resolution LinuxTechLab — outputs width + height ints chosen via the JS UI."""

import json

from comfy_api.latest import io

DEFAULT_STATE = {
    "mode": "preset",
    "ratio": "1:1",
    "w": 1024,
    "h": 1024,
    "custom_w": 1024,
    "custom_h": 1024,
    "custom_ratio_w": 4,
    "custom_ratio_h": 3,
    "snap": 16,
}


def _clamp(n: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, n))


class LinuxTechLabResolution(io.ComfyNode):

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Resolution",
            display_name="Resolution",
            category="LinuxTechLab",
            inputs=[
                io.String.Input(
                    "ResolutionState",
                    default=json.dumps(DEFAULT_STATE),
                    socketless=True,
                    advanced=True,
                ),
            ],
            outputs=[
                io.Int.Output(display_name="width"),
                io.Int.Output(display_name="height"),
            ],
        )

    @classmethod
    def execute(cls, ResolutionState: str) -> io.NodeOutput:
        try:
            state = json.loads(ResolutionState)
            w = int(state.get("w", 1024))
            h = int(state.get("h", 1024))
        except Exception:
            print("[LinuxTechLabResolution] Malformed state, falling back to 1024x1024")
            w, h = 1024, 1024
        w = _clamp(w, 64, 16384)
        h = _clamp(h, 64, 16384)
        return io.NodeOutput(w, h)
