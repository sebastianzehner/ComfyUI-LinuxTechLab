from comfy_api.latest import io

LinuxTechLabData = io.Custom("LINUXTECHLAB_DATA")


class LinuxTechLabVueReferenceNode(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_VueReferenceNode",
            display_name="LinuxTechLab Vue Reference Node",
            category="LinuxTechLab",
            description="V3 reference node — demonstrates Nodes 2.0 schema patterns.",
            inputs=[
                io.Image.Input("image"),
                io.Int.Input("count", default=1, min=0, max=100),
                io.String.Input("prompt", multiline=True),
                io.Combo.Input("mode", options=["option1", "option2"]),
                io.Mask.Input("mask", optional=True),
                LinuxTechLabData.Input("linuxtechlab_data", optional=True),
            ],
            outputs=[
                io.Image.Output(display_name="result"),
                LinuxTechLabData.Output(display_name="linuxtechlab_data"),
            ],
        )

    @classmethod
    def execute(cls, image, count, prompt, mode, mask=None) -> io.NodeOutput:
        result = 1.0 - image  # example: invert
        return io.NodeOutput(result)
