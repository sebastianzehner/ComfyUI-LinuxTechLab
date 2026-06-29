# Note

A rich-text annotation tool to leave detailed, visually engaging notes directly
on your ComfyUI canvas.

The Note node goes far beyond simple text. It allows you to create structured,
informative, and well-formatted content to document your workflows, provide
instructions, or include quick access to external resources.

![Note Example](LinuxTechLab_Note/note_example.webp)

## How to Use

1. **Add the Node:** Place a `Note` node in your workflow.
2. **Open the Editor:** You have two ways to edit the content:
    - **Right-click** on the `Note` node and select **"Open Note Editor"**.
    - **Hover** over the node and click the **"Edit"** button that appears.

The editor provides a full toolbar for rich-text editing, allowing you to easily format your content.

![Note Editor](LinuxTechLab_Note/note_editor.webp)

1. **Create Content:** Use the editor's toolbar to add formatting, symbols, buttons, and links.
2. **Save:** Your changes are automatically applied to the node on the canvas.

## Features

The Note editor supports a wide range of rich-text and interactive elements:

- **Text Formatting:** Headings (H1-H3), paragraphs, bold, italics, and lists (ordered/unordered).
- **Advanced Layouts:** Tables and code blocks for organized technical data.
- **Interactive Elements:**
  - **Buttons:** Create clickable buttons that can trigger actions or serve as clear call-to-actions.
  - **Links:** Embed hyperlinks to external websites, documentation, or models.
  - **Symbols:** Insert icons and symbols to enhance visual cues.

## Use Cases

- **Workflow Documentation:** Explain complex parts of your workflow, provide step-by-step instructions, or describe the logic behind specific node setups.
- **Resource Hub:** Include direct download links to models, LoRAs, or custom nodes used in the workflow.
- **Prompting Tips:** Leave helpful hints and best practices for getting the most out of specific prompts or settings.
- **Issue Reporting:** Add a quick way for users to report issues or provide feedback via integrated links.

## Inputs

| Input       | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `note_json` | Internal state containing the note's configuration and content. Visible under **Advanced Inputs**. |

> **Technical Note:** You might see a `note_dom` input in the ComfyUI information panel. This is a specialized frontend-only widget used exclusively for rendering the visual note on the canvas. All actual configuration and data are managed via the `note_json` input.

## Outputs

This node has no outputs.
