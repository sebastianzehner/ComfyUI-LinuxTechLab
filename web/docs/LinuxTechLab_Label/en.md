# Label

A visual design element used to add annotations and labels directly to the ComfyUI canvas.

The `Label` node allows you to create beautiful, customizable text labels to organize your workflows, highlight specific sections, or add descriptive notes. It is a purely aesthetic node and does not affect the processing of images or latent data.

![Label Editor](LinuxTechLab_Label/label_editor.webp)

## How to Use

1.  **Add the Node:** Place a `Label` node in your workflow.
2.  **Open the Editor:** Right-click on the `Label` node and select **"Open Label Editor"** from the context menu.
3.  **Customize:** In the Label Editor, you can configure the following:
    *   **Text:** The content of the label.
    *   **Color:** Choose from a variety of colors to match your theme.
    *   **Font:** Select the desired typeface.
    *   **Size:** Adjust the text size for better visibility.
4.  **Save:** Once you are satisfied with your design, save the settings. The label will then be rendered on the canvas.

## Inputs

| Input       | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `label_json` | Internal state containing the label configuration. Visible under **Advanced Inputs**. |

## Outputs

This node has no outputs.

## Examples

Below is an example of how a label can be used to clearly mark a section of your workflow:

![Label Example](LinuxTechLab_Label/label_example.webp)

You can also use multiple labels with different colors to distinguish between different stages or categories:

![Multi-label Example](LinuxTechLab_Label/label_multi_example.webp)

## Tips

- Use different colors to categorize different parts of your workflow (e.g., green for inputs, blue for processing, red for outputs).
- Combine multiple labels to create headers or sections within complex workflows.
- Keep labels concise to maintain a clean workspace.
