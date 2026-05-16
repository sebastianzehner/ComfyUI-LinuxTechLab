import json
import random

from comfy_api.latest import io

DEFAULT_STATE = {
    "seed": 42,
    "locked": False,
    "step": 1,
    "mode": "manual",
    "history": [],
}


class LinuxTechLabSeedGenerator(io.ComfyNode):
    """Seed Generator — generate, lock, increment/decrement seeds with
    history. Operation mode defines post-run behavior. Lock overrides
    all modes and freezes the seed. State is managed by the JS frontend
    and injected via seed_json."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_SeedGenerator",
            display_name="Seed Generator",
            category="LinuxTechLab",
            inputs=[
                io.String.Input(
                    "seed_json",
                    default=json.dumps(DEFAULT_STATE),
                    socketless=True,
                    advanced=True,
                ),
            ],
            outputs=[
                io.Int.Output(display_name="seed"),
            ],
        )

    @classmethod
    def execute(cls, seed_json: str) -> io.NodeOutput:
        try:
            state = json.loads(seed_json or "{}")
        except Exception:
            state = {}

        locked = state.get("locked", False)
        seed = state.get("seed", 0)
        mode = state.get("mode", "manual")
        step = state.get("step", 1)

        if not locked:
            if mode == "random":
                seed = random.randint(0, 2**32 - 1)
            elif mode == "increment":
                seed = max(0, min(2**32 - 1, int(seed) + int(step)))
            elif mode == "decrement":
                seed = max(0, min(2**32 - 1, int(seed) - int(step)))
            # manual: seed stays as-is

        return io.NodeOutput(
            int(seed),
            ui={"ltl_seed": [int(seed)]},
        )
