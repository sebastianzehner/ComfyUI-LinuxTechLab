# Prompt Generator

Turn a rough idea into a fully structured, model-specific prompt using a local LLM (e.g. Qwen) served through [llama-swap](https://github.com/mostlygeek/llama-swap). Choose the prompting guide that matches your target checkpoint — Z-Image, FLUX.2, or LTX-2.3 — and the node writes the prompt in that model's expected style, then frees the LLM's VRAM automatically so your sampler has full room to run.

![Prompt Generator](LinuxTechLab_PromtGenerator/prompt_generator.webp)

## Inputs

| Input              | Description                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `idea`             | Your rough, unstructured description of what you want to generate.                                               |
| `guide`            | Which target model's prompting conventions to follow. See **Guides** below.                                      |
| `llama_swap_url`   | Base URL of your llama-swap instance, **without** the `/v1` suffix (e.g. `http://127.0.0.1:12434`).              |
| `model_name`       | Model id exactly as configured in llama-swap (e.g. `qwen3.6-27B`).                                               |
| `temperature`      | Sampling temperature for the LLM. Advanced input.                                                                |
| `max_tokens`       | Token budget for the response. Advanced input. Acts as a safety net if thinking mode isn't fully disabled.       |
| `disable_thinking` | Skips the model's internal reasoning phase for a faster, shorter response. See **Thinking Mode** below.          |
| `unload_after`     | Unloads the LLM from VRAM via llama-swap right after generating, so a downstream sampler node gets the full GPU. |
| `timeout_seconds`  | Advanced input. How long to wait for llama-swap before failing.                                                  |

## Outputs

| Output       | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `prompt`     | The generated prompt, ready to connect to `CLIPTextEncode` or similar. |
| `guide_used` | The display name of the guide that was applied, for quick reference.   |

## Guides

| Guide                      | Target model | Style                                                                                                      |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Z-Image (Photorealism)** | Z-Image      | Exactly four sentences: subject+context, lighting/time, camera/composition, film stock/grade.              |
| **FLUX.2**                 | FLUX.2       | Flowing natural language, most important element first, built around Subject/Action/Style/Context.         |
| **LTX-2.3 (Video)**        | LTX-2.3      | A single long paragraph in present tense: shot, scene, action sequence, character, camera movement, audio. |

New guides can be added by editing `promt_guides.py` — no other code changes are needed, they appear in the `guide` dropdown automatically.

## Thinking Mode

Some LLMs (Qwen3-style models in particular) run an internal "reasoning" pass before producing visible output, which costs extra time and tokens. `disable_thinking` sends both the legacy `/no_think` request suffix and the `chat_template_kwargs: {"enable_thinking": false}` API override, since the former alone is not reliably honored on newer builds. If the output is ever empty, check the ComfyUI console — the node logs `finish_reason`, `completion_tokens`, and whether `reasoning_content` was populated, which tells you exactly whether thinking mode was actually skipped.

## VRAM / llama-swap Notes

- `unload_after` calls llama-swap's unload endpoint after generation completes. It never raises on failure — a failed unload just leaves the model resident, it won't break your graph.
- If you're running llama-swap and ComfyUI on the same GPU, remember ComfyUI itself reserves some VRAM even when idle, so your effective budget for the LLM is a bit lower than the card's total.
- `model_name` must match the model id/alias as configured in llama-swap's `config.yaml` exactly — not the underlying `.gguf` filename.
- Need to trigger an unload at a different point in the graph than right after generation? See the separate **llama-swap: Unload Model** node.
