# Subkeys Gateway Actor

## Purpose
- Runs as a worker (`workers.subkeys_gateway`) that periodically pings the Subkeys chat-compatible gateway and logs reflection events. Keeps the gateway configuration portable and monitored.

## Config (system/user)
- `workers.subkeys_gateway.enabled`: true/false
- `workers.subkeys_gateway.module`: `core.workers.subkeys_gateway`
- Chat gateway (shared with `/chat`):
  - `chat.gateway.url`: Subkeys endpoint (e.g., `https://openai-uu4vjcf.subkey.dev`)
  - `chat.gateway.key`: Subkeys API key (prefer env in production)
  - `chat.provider.name`: `openai`
  - `chat.provider.base`: set to the Subkeys base URL (e.g., `https://openai-uu4vjcf.subkey.dev/v1`)
  - `chat.provider.model`: model name (e.g., `gpt-4o-mini`)
- LLM provider defaults: see `llm_providers` in `system.yaml` / `user.yaml`.

## Behavior
- Heartbeat every ~30s: sends a minimal `chat/completions` request (`ping` prompt) to the configured gateway.
- Logs reflection events under `worker=seed.gateway.subkeys`, `mission=gateway.subkeys`, with status ok/error and notes.
- No repo writes; only state dir logs (`~/.symbia-seed/logs/reflection/events.ndjson`).

## CLI/API touchpoints
- Worker visibility: `GET /workers/status` shows `subkeys_gateway` running with pid/log path.
- Logs: `~/.symbia-seed/logs/symbia-seed.subkeys_gateway.log` (supervisor-managed log).
- Chat continues to use `/chat` with the configured gateway; this actor just monitors connectivity.
