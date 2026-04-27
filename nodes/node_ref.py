class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False


any_type = AnyType("*")


class FlexibleOptionalInputType(dict):
    def __init__(self, type):
        self.type = type

    def __getitem__(self, key):
        return (self.type,)

    def __contains__(self, key):
        return True


class LinuxTechLabReferenceNode:
    @classmethod
    def INPUT_TYPES(self):
        return {
            "required": {},
            "optional": FlexibleOptionalInputType(any_type),
        }

    CATEGORY = "LinuxTechLab"

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output",)
    FUNCTION = "dom_func"
    DESCRIPTION = "Example to create test dom HTML object in nodes"
    OUTPUT_NODE = True

    def dom_func(self, **kwargs):
        counter = 0
        for key, value in kwargs.items():
            if key == "CounterWidget":
                print(key, value)
                counter = str(value["count"]) or "0"
                text = value["text"] or ""
        return (str(text + " " + counter),)


from comfy_api.latest import io

LinuxTechLabData = io.Custom("LINUXTECHLAB_DATA")


class LinuxTechLabVueReferenceNode(io.ComfyNode):

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_VueReferenceNode",  # unique, use a prefix!
            display_name="LinuxTechLab Vue Reference Node",
            category="LinuxTechLab",
            description="new LinuxTechLab Vue Reference Node compatible with Nodes 2.0",
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


NODE_CLASS_MAPPINGS = {
    "LinuxTechLabReferenceNode": LinuxTechLabReferenceNode,
    "LinuxTechLab_VueReferenceNode": LinuxTechLabVueReferenceNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LinuxTechLabReferenceNode": "Reference Node",
    "LinuxTechLab_VueReferenceNode": "LinuxTechLab Vue Reference Node",
}
