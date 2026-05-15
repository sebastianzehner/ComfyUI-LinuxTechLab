from comfy_api.latest import io


class LinuxTechLabNote(io.ComfyNode):
    """Rich annotation note — pure UI node, no image processing."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Note",
            display_name="Note",
            category="LinuxTechLab",
            is_output_node=True,
            inputs=[
                io.String.Input(
                    "note_json",
                    # NOTE: keep in sync with js/note/index.js DEFAULT_CFG.
                    # backgroundColor is INTENTIONALLY omitted — fresh
                    # notes get an `undefined` bg so renderContent
                    # doesn't override ComfyUI's native right-click
                    # Colors menu. parseCfg migrates the legacy
                    # "transparent" / "#111111" values on load.
                    default='{"version":1,"content":"","buttonColor":"#89b4fa","lineColor":"#89b4fa","width":420,"height":320}',
                    socketless=True,
                    advanced=True,
                ),
            ],
            outputs=[],
        )

    @classmethod
    def execute(cls, note_json: str) -> io.NodeOutput:
        return io.NodeOutput()
