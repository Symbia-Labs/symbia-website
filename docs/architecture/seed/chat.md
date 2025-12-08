# Seed Chat + Log Context (OEP/GKS aware)

## Endpoints
- `POST /chat` — relay chat to Subkeys/OpenAI/Anthropic/Ollama with UI/dashboard context and coglog tail injected.
  - Payload: `message` (string), optional `context` object (free-form) for UI metadata/history/help text.
  - Chat uses gateway/provider settings from `daemon/core/config/user.yaml`; env overrides supported for other providers (`OPENAI_*`, `ANTHROPIC_*`, `OLLAMA_*`).
  - Provider order: Subkeys gateway (if url+key), OpenAI-compatible (if base/key), Anthropic (if `ANTHROPIC_API_KEY`), Ollama (if `OLLAMA_*`), otherwise offline fallback returns `"Local chat not configured. Context logged only."`
  - Reflection/trace: `chat.dashboard` events with message, reply, context, provider.
- `POST /ui/telemetry` — append UI events (e.g., `web.ui`, `continuity.time`) into the cognitive trace for swimlane display.
- `GET /logs/index` — list log files under `${SYMBIA_STATE_DIR}/logs`.
- `GET /logs/file?path=...` — read a log file from `${SYMBIA_STATE_DIR}/logs`.
- `GET /trace/tail` / `GET /reflection/events` — tails for cognitive trace and reflection ledger (used by UI chat context).
- `GET /identity/snapshot` — returns install/local/user key metadata, preferences/constraints + hashes (SHA-256).

## Notes
- OEP alignment: chat context is explicit (surface/anchor/history), no hidden memory; provenance is preserved via trace/reflection events; uncertainty should be surfaced in prompts/system text.
- GKS alignment: identity/continuity via install keys; constraint-sets via prefs/constraints (hashed); lineage via trace/reflection; pipeline roles visible in swimlane groupings.
- Dashboard chat now sends anchor/history + coglog context, and records `web.ui` and `continuity.time` telemetry for swimlanes.
- Preferences/constraints are hashed (SHA-256) and exposed via `identity/snapshot`; hashes appear in the Identity tile.
- Requires gateway/provider keys in `daemon/core/config/user.yaml` (demo Subkeys token included) or provider env overrides (`OPENAI_API_KEY`, etc.). Without configured providers the offline reply is returned but requests are still logged.
- Telemetry: swimlanes render newest-first; UI/continuity telemetry appears under Web UI and Continuity lanes.
