"""
LinuxTechLabPromptGenerator: sends an idea + a selected prompting-guide
system prompt to Qwen (served via llama-swap, OpenAI-compatible endpoint)
and returns a ready-to-use image/video prompt. Optionally unloads the model
from VRAM afterwards so a following sampler node has the full GPU free.

For manual/standalone VRAM unloading elsewhere in the graph, see
llama_swap_unload.py (LinuxTechLabLlamaSwapUnload).
"""

import json
import urllib.error
import urllib.request

from comfy_api.latest import io

from .prompt_guides import get_guide_choices, get_guide_label, get_system_prompt


def _post_json(url: str, payload: dict, timeout: float) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _unload_model(base_url: str, model: str, timeout: float = 10.0) -> bool:
    """
    Ask llama-swap to unload a specific model, freeing its VRAM.
    Tries the versioned API endpoint first, falls back to the legacy one.
    Never raises — VRAM freeing is best-effort so it can't break the graph.
    """
    base_url = base_url.rstrip("/")
    endpoints = [
        (f"{base_url}/api/models/unload/{model}", "POST"),
        (f"{base_url}/unload/{model}", "GET"),
    ]
    for url, method in endpoints:
        try:
            req = urllib.request.Request(url, method=method)
            with urllib.request.urlopen(req, timeout=timeout):
                return True
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            continue
    return False


class LinuxTechLabPromptGenerator(io.ComfyNode):
    """
    Turns a rough idea into a model-specific, well-structured prompt by
    calling a local Qwen instance (served through llama-swap) with a system
    prompt tailored to the chosen target image/video model.
    """

    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id="LinuxTechLabPromptGenerator",
            display_name="Prompt Generator",
            category="LinuxTechLab",
            description=(
                "Generates a structured image/video prompt from a rough idea, "
                "using a local Qwen model via llama-swap and a chosen "
                "prompting-guide template."
            ),
            inputs=[
                io.String.Input(
                    "idea",
                    multiline=True,
                    default="",
                    placeholder="Rough description of what you want to generate...",
                    tooltip="Your unstructured idea. Qwen expands this into a full prompt.",
                ),
                io.Combo.Input(
                    "guide",
                    options=get_guide_choices(),
                    default=get_guide_choices()[0],
                    tooltip="Which target model's prompting conventions to follow.",
                ),
                io.String.Input(
                    "llama_swap_url",
                    default="http://127.0.0.1:12434",
                    tooltip="Base URL of your llama-swap instance (no /v1 suffix — that's added internally).",
                ),
                io.String.Input(
                    "model_name",
                    default="qwen3.6-27B-text",
                    tooltip="Model id exactly as configured in llama-swap (e.g. 'qwen3.6-27B').",
                ),
                io.Int.Input(
                    "seed",
                    default=-1,
                    min=-1,
                    max=0xFFFFFFFFFFFFFFFF,
                    step=1,
                    control_after_generate=True,
                    tooltip=(
                        "Fixes the LLM's sampling seed for reproducible output. "
                        "-1 = random seed every run (llama-server picks its own)."
                    ),
                ),
                io.Float.Input(
                    "temperature",
                    default=0.7,
                    min=0.0,
                    max=2.0,
                    step=0.05,
                    advanced=True,
                ),
                io.Int.Input(
                    "max_tokens",
                    default=2000,
                    min=32,
                    max=8192,
                    step=8,
                    tooltip=(
                        "If Qwen still runs in 'thinking' mode despite "
                        "disable_thinking, this budget must cover the internal "
                        "reasoning tokens plus the final answer, or the response "
                        "gets cut off before any visible text."
                    ),
                    advanced=True,
                ),
                io.Boolean.Input(
                    "disable_thinking",
                    default=True,
                    tooltip=(
                        "Appends '/no_think' to the request, which Qwen3-style "
                        "models use to skip the verbose internal reasoning phase. "
                        "Turn off if your model doesn't support this switch."
                    ),
                ),
                io.Boolean.Input(
                    "unload_after",
                    default=True,
                    tooltip=(
                        "Unload Qwen from VRAM via llama-swap right after "
                        "generating, so a downstream sampler has full VRAM."
                    ),
                ),
                io.Int.Input(
                    "timeout_seconds",
                    default=120,
                    min=5,
                    max=600,
                    advanced=True,
                ),
            ],
            outputs=[
                io.String.Output("prompt"),
                io.String.Output("guide_used"),
            ],
        )

    @classmethod
    def execute(
        cls,
        idea,
        guide,
        llama_swap_url,
        model_name,
        seed,
        temperature,
        max_tokens,
        disable_thinking,
        unload_after,
        timeout_seconds,
    ):
        if not idea.strip():
            raise ValueError("QwenPromptGenerator: 'idea' input is empty.")

        system_prompt = get_system_prompt(guide)
        user_message = idea.strip()
        if disable_thinking:
            user_message += " /no_think"
        url = llama_swap_url.rstrip("/") + "/v1/chat/completions"

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if disable_thinking:
            # /no_think alone is unreliable on newer Qwen builds; this
            # request-level override is honored directly by llama.cpp's
            # chat template regardless of server-side flags.
            payload["chat_template_kwargs"] = {"enable_thinking": False}
        if seed is not None and seed >= 0:
            payload["seed"] = seed

        try:
            result = _post_json(url, payload, timeout=float(timeout_seconds))
        except urllib.error.URLError as e:
            raise RuntimeError(
                f"QwenPromptGenerator: could not reach llama-swap at {url} ({e}). "
                "Is llama-swap running and is the URL correct?"
            ) from e

        try:
            choice = result["choices"][0]
            message = choice["message"]
            generated = (message.get("content") or "").strip()
            finish_reason = choice.get("finish_reason")
        except (KeyError, IndexError, TypeError) as e:
            raise RuntimeError(
                f"QwenPromptGenerator: unexpected response from llama-swap: {result}"
            ) from e

        # Strip a leading <think>...</think> block some Qwen configs still emit
        # even when content follows it.
        if "<think>" in generated:
            end = generated.find("</think>")
            if end != -1:
                generated = generated[end + len("</think>") :].strip()

        usage = result.get("usage", {})
        reasoning_seen = bool((message.get("reasoning_content") or "").strip())
        print(
            f"[LinuxTechLab] finish_reason={finish_reason} "
            f"prompt_tokens={usage.get('prompt_tokens')} "
            f"completion_tokens={usage.get('completion_tokens')} "
            f"reasoning_content_present={reasoning_seen} "
            f"disable_thinking={disable_thinking} "
            f"seed={seed if (seed is not None and seed >= 0) else 'random'}"
        )

        if not generated:
            # Common cause: the model spent its whole max_tokens budget on
            # internal "thinking" and never reached the visible answer.
            reasoning = (message.get("reasoning_content") or "").strip()
            hint = ""
            if finish_reason == "length":
                hint = (
                    " finish_reason was 'length' — max_tokens was exhausted "
                    "during thinking mode before any answer text was produced. "
                    "Try: (1) confirm 'disable_thinking' is enabled, (2) if your "
                    "llama.cpp/llama-swap build ignores the '/no_think' switch, "
                    "add a server-side flag instead (llama.cpp's "
                    "'--reasoning-budget 0' fully disables reasoning), or "
                    "(3) raise 'max_tokens' further as a fallback."
                )
            raise RuntimeError(
                "QwenPromptGenerator: model returned an empty prompt."
                + hint
                + (f" reasoning_content was: {reasoning[:300]}" if reasoning else "")
            )

        if unload_after:
            _unload_model(llama_swap_url, model_name)

        return io.NodeOutput(generated, get_guide_label(guide))
