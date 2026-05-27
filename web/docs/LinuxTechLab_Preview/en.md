# Preview Image

A versatile image preview tool that allows you to inspect images directly within the node on your canvas, with options for temporary preview or permanent saving.

The `Preview Image` node is designed to provide immediate visual feedback during your workflow, offering two distinct modes to suit your needs.

![Preview Example](LinuxTechLab_Preview/preview_example.webp)

## How to Use

1.  **Add the Node:** Place a `Preview Image` node in your workflow.
2.  **Connect Input:** Connect an `image` output from another node to the `image` input of this node.
3.  **Configure Mode:** Use the `save_mode` dropdown to choose between `preview` or `save`.
4.  **Set Prefix:** (Optional) Define a `filename_prefix` to organize your saved images.
5.  **Interact with Buttons:** Use the **"Save to Disk"** or **"Save to Output"** buttons directly on the node to manage your files.
6.  **Inspect Images:** Click on any image in the preview strip to view it in full size. The cursor will change to a **magnifying glass** when hovering over an image.

## Modes

| Mode        | Behavior                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **preview** | Images are displayed in a strip within the node. They are stored in the ComfyUI `temp/` directory and are **not** saved permanently.                                             |
| **save**    | Images are displayed in a strip within the node **AND** are saved permanently to the `output/` directory with embedded workflow metadata, just like the native `SaveImage` node. |

## Inputs

| Input             | Type   | Description                                                  |
| ----------------- | ------ | ------------------------------------------------------------ |
| `image`           | Image  | The image or batch of images to be previewed.                |
| `filename_prefix` | String | The prefix used for filenames when in `save` mode.           |
| `save_mode`       | Combo  | Select between `preview` (temporary) and `save` (permanent). |

## Outputs

| Output  | Type  | Description                                    |
| ------- | ----- | ---------------------------------------------- |
| `image` | Image | The original image(s) passed through the node. |

## Keyboard Shortcuts

When the image is open in the fullscreen overlay:

- **Arrow Left:** Navigate to the previous image.
- **Arrow Right:** Navigate to the next image.
- **Escape (Esc):** Close the overlay.

## Tips

- Use **preview** mode for rapid iterations where you don't want to clutter your `output/` folder.
- Use **save** mode when you have found a result you like and want to keep it with all its metadata for later use.
- The node can handle batches of images, displaying them as a scrollable strip within the node body.
