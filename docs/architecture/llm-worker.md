# Generic LLM Worker (pipeline-based)

## Purpose
- Processes queued LLM jobs using the generic Source→Interpreter→Sink pipeline.
- Provider plug-in is configurable (llama-cpp provider by default; Ollama optional; echo fallback if unavailable).
- Results are stored in state (`llm_results.ndjson`) and logged to reflection.

## How it works
- Queue: `~/.symbia-seed/llm_jobs.ndjson` (one JSON job per line).
- Worker: `core.workers.llm_worker` (enabled by default).
- Config (system.yaml):
  ```yaml
  workers:
    llm:
      enabled: true
      module: "core.workers.llm_worker"
      type: "actor"
      llm:
        plugin: "plugins.actors.llm.provider.llamacpp:Provider"  # default
        config:
          model_path: ""  # defaults to ~/.symbia-seed/models/system/symbia.gguf or LLAMA_CPP_MODEL_PATH
          n_ctx: 4096
          temperature: 0.2
  ```
- Plug-ins: see `daemon/plugins/actors/llm/provider/` (llama-cpp default, Ollama optional; echo fallback if none).
  - llama-cpp requires a GGUF model file. Place a seed model in the repo at `models/system/symbia.gguf`; on first run it will be copied to `~/.symbia-seed/models/system/symbia.gguf` (and `models/user/symbia.gguf`). Or download via CLI: `python3 daemon/symbia.py llm setup-llamacpp --model-url <URL>`.

## Enqueueing jobs (manual)
- Append a line to `~/.symbia-seed/llm_jobs.ndjson`:
  ```json
  {"job_id": "job-1", "prompt": "hello", "provider": "llama-cpp", "context": {"role": "demo"}}
  ```
- Worker consumes the queue, calls the provider, writes to `~/.symbia-seed/logs/llm_results.ndjson`, and logs reflection events (`llm.complete`).

## Notes
- Enabled by default; can be turned off via `workers.llm.enabled: false` if you do not want background processing.
- Provider plug-in interface: `complete(prompt, context) -> {provider, reply, raw}`.
- REST enqueue: `POST /llm/jobs` or CLI `symbia llm enqueue --prompt "..."`
- This is separate from `/chat` (which is synchronous); use it for queued/asynchronous LLM tasks.
