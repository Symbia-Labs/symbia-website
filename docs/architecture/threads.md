# Threads (UI ↔ API contract)

- **Thread** = one user interaction context for chat/popouts. Carry: `thread_id`, `actor_profile` (role/constraints), optional `mission_id`, `anchor` (UI surface), `history` (message snippets), and `context_refs` (logs/docs if attached).
- **Payload shape** (client → `/chat`):
  ```json
  {
    "message": "latest user text",
    "thread": {
      "thread_id": "thread-<uuid>",
      "anchor": "dashboard",
      "mission_id": "mission.optional",
      "actor_profile": { "role": "user", "constraints": [] },
      "history": [{ "role": "user", "content": "..." }]
    },
    "context": {
      "surface": "dashboard",
      "anchor": "info",
      "history": [{ "role": "system", "content": "..." }]
    }
  }
  ```
- **Server handling**: `/chat` currently treats `thread` as optional; it must not break if present. History/context are used for grounding; provider choice is unchanged.
- **Reflection/trace**: log `thread_id`, `anchor`, and `mission_id` in `payload` when available (planned: interpreter to propagate into reflection worker).
- **Offline mode**: if no provider is configured, `/chat` returns an offline reply (“Local chat not configured. Context logged only.”) so the UI shows a graceful state instead of an error.
- **Missions per thread**: `/threads/start` creates `~/.symbia-seed/missions/<thread>.yaml` by extending the OEP/GKS template; `/threads/stop` stops and marks the thread; `/threads/list` lists threads.

Implementation status:
- UI (`daemon/web/js/app.js`) sends the thread block with `thread_id`, anchor, and history; falls back to offline when providers are missing.
- API accepts extra fields without schema errors; reflection worker already ingests payloads and will carry thread metadata once interpreter wiring is added.
