from comfy_api.latest import io


class LinuxTechLabLabel(io.ComfyNode):
    """Annotation label — pure UI node, no image processing."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Label",
            display_name="Label",
            category="LinuxTechLab",
            is_output_node=True,
            inputs=[
                io.String.Input(
                    "label_json",
                    default="{}",
                    socketless=True,
                    advanced=True,
                ),
            ],
            outputs=[],
        )

    @classmethod
    def execute(cls, label_json: str) -> io.NodeOutput:
        return io.NodeOutput()
