from comfy_api.latest import io


class LinuxTechLabMathOperator(io.ComfyNode):
    """
    A simple math operator node to demonstrate Nodes 2.0 V3 schema.
    Supports Addition, Subtraction, Multiplication, and Division.
    """

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="LinuxTechLab_Math_Operator",
            display_name="Math Operator",
            category="LinuxTechLab",
            description="Performs basic arithmetic operations.",
            inputs=[
                io.Float.Input("a", default=0.0),
                io.Float.Input("b", default=0.0),
                io.Combo.Input(
                    "operation",
                    options=["add", "subtract", "multiply", "divide"],
                    default="add",
                ),
            ],
            outputs=[io.Float.Output()],
        )

    @classmethod
    def execute(cls, a: float, b: float, operation: str) -> io.NodeOutput:
        if operation == "add":
            result = a + b
        elif operation == "subtract":
            result = a - b
        elif operation == "multiply":
            result = a * b
        elif operation == "divide":
            result = a / b if b != 0 else 0.0
        else:
            result = 0.0

        return io.NodeOutput(result)
