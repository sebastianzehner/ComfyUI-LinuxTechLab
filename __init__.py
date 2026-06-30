import os

from comfy_api.latest import ComfyExtension, io

from . import server_routes  # side-effect import for route registration
from .nodes.crop import LinuxTechLabCrop
from .nodes.crop_video import LinuxTechLabCropVideo
from .nodes.editor_3d import LinuxTechLab3D
from .nodes.image_composer import LinuxTechLabImageComposer
from .nodes.label import LinuxTechLabLabel
from .nodes.math_operator import LinuxTechLabMathOperator
from .nodes.note import LinuxTechLabNote
from .nodes.paint import LinuxTechLabPaint
from .nodes.preview import LinuxTechLabPreview
from .nodes.resolution import LinuxTechLabResolution
from .nodes.seed_generator import LinuxTechLabSeedGenerator

V3_NODES = [
    LinuxTechLab3D,
    LinuxTechLabCrop,
    LinuxTechLabCropVideo,
    LinuxTechLabImageComposer,
    LinuxTechLabLabel,
    LinuxTechLabMathOperator,
    LinuxTechLabNote,
    LinuxTechLabPaint,
    LinuxTechLabPreview,
    LinuxTechLabResolution,
    LinuxTechLabSeedGenerator,
]

# development mode — set to True to load reference/test nodes
dev_mode = False

if dev_mode:
    from .nodes.node_ref import LinuxTechLabVueReferenceNode

    V3_NODES.append(LinuxTechLabVueReferenceNode)


class LinuxTechLabExtension(ComfyExtension):
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return V3_NODES


async def comfy_entrypoint() -> LinuxTechLabExtension:
    return LinuxTechLabExtension()


WEB_DIRECTORY = "./web"
__all__ = ["comfy_entrypoint", "WEB_DIRECTORY"]


def display_linuxtechlab_log_startup():
    version = "Unknown"
    try:
        import toml

        toml_path = os.path.join(os.path.dirname(__file__), "pyproject.toml")
        with open(toml_path, "r", encoding="utf-8") as f:
            version = toml.load(f).get("project", {}).get("version", "Unknown")
    except Exception:
        pass

    CLR_BLUE = "\033[38;2;137;180;250m"
    CLR_WHITE_BOLD = "\033[1;37m"
    CLR_GREY = "\033[0;37m"
    CLR_RESET = "\033[0m"

    print(
        f"{CLR_BLUE}[LinuxTechLab]{CLR_WHITE_BOLD} v{version}"
        f"{CLR_GREY} | {CLR_RESET}"
        f"{CLR_BLUE}{len(V3_NODES)} nodes{CLR_RESET} Loaded"
    )


display_linuxtechlab_log_startup()
