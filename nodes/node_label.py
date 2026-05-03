class LinuxTechLabLabel:
    """Annotation label — pure UI node, no image processing."""

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "label_json": (
                    "STRING",
                    {
                        "default": "{}",
                        "hidden": True,
                    },
                ),
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "noop"
    OUTPUT_NODE = True
    CATEGORY = "LinuxTechLab"

    def noop(self, label_json):
        return {}


NODE_CLASS_MAPPINGS = {
    "LinuxTechLabLabel": LinuxTechLabLabel,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "LinuxTechLabLabel": "Label LinuxTechLab",
}
