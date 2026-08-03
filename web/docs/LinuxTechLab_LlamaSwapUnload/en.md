# llama-swap: Unload Model

A small standalone utility node for unloading a [llama-swap](https://github.com/mostlygeek/llama-swap) model on demand. Use it when you want to control the exact point in your graph where VRAM gets freed, instead of relying on the **Prompt Generator**'s built-in `unload_after` switch — for example, if you're not using the Prompt Generator at all but still want to unload an LLM before a sampler runs.

![llama-swap Unload](LinuxTechLab_LlamaSwapUnload/llama_swap_unload.webp)

## Inputs

| Input            | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `passthrough`    | Any value. Wire your existing graph output through this input.        |
| `llama_swap_url` | Base URL of your llama-swap instance (e.g. `http://127.0.0.1:12434`). |
| `model_name`     | Model id to unload, exactly as configured in llama-swap.              |

## Outputs

| Output        | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `passthrough` | The same value received on the `passthrough` input, unchanged. |
| `unloaded`    | `True` if the unload call succeeded, `False` otherwise.        |

## How It Works

The node calls llama-swap's model-unload endpoint for `model_name` and immediately passes `passthrough` onward unchanged. Because ComfyUI executes nodes in dependency order, wiring your prompt (or any other value) into `passthrough` guarantees the unload happens exactly at that point in the graph — no earlier, no later.

The call never raises an exception on failure; a failed unload just leaves the model resident in VRAM and reports `unloaded = False`, so it won't break the rest of your workflow.

## Tips

- Wire this node between a prompt-generation step and your `CLIPTextEncode` node if you want the unload to happen at a specific point rather than immediately after generation.
- Check the `unloaded` output if you're debugging: if it comes back `False`, verify that `llama_swap_url` and `model_name` match your llama-swap config exactly, and that llama-swap is actually running and reachable.
- If you only ever unload right after generating a prompt, you likely don't need this node — the **Prompt Generator**'s built-in `unload_after` switch covers that case with one fewer node on the canvas.
