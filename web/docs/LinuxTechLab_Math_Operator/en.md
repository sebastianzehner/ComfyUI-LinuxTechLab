# Math Operator

A simple math operator node to perform basic arithmetic operations.

This node allows you to perform fundamental mathematical calculations between two floating-point numbers using four different operation modes.

## Inputs

| Input       | Type  | Description                          |
| ----------- | ----- | ------------------------------------ |
| `a`         | Float | The first operand.                   |
| `b`         | Float | The second operand.                  |
| `operation` | Combo | The arithmetic operation to perform. |

## Outputs

| Output   | Type  | Description                               |
| -------- | ----- | ----------------------------------------- |
| `result` | Float | The result of the mathematical operation. |

## Operations

| Operation    | Logic        | Description                                                                          |
| ------------ | ------------ | ------------------------------------------------------------------------------------- |
| **add**      | `a + b`      | Returns the sum of `a` and `b`.                                                      |
| **subtract** | `a - b`      | Returns the difference between `a` and `b`.                                          |
| **multiply** | `a * b`      | Returns the product of `a` and `b`.                                                  |
| **divide**   | `a / b`      | Returns the quotient of `a` and `b`. If `b` is `0`, returns `0.0` to prevent errors. |

## Tips

- Use this node to adjust parameters like strength, scale, or thresholds dynamically within your workflow.
- It is useful for creating mathematical relationships between different workflow values.
