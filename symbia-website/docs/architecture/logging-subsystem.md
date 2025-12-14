## Logging Subsystem (updates)

- **Reflection (primary audit):** `logs/reflection/events.ndjson`. All API/workers and contract flows now emit via a unified `log_event` helper; fields: `ts, source, worker, mission, op, status` (+ optional `path, notes, seed_id, payload_hash`).
- **Contract ledger:** `logs/contract-events.log` receives the same events for spawn/heartbeat/retire verification (append-only, JSON per line).
- **Docs/Logs APIs:** routes `/docs/index`, `/docs/file`, `/logs/index`, `/logs/file` are mounted via dedicated routers (`daemon/core/routers`), not inline in `app.py`.
- **Thread registry:** handled via `daemon/core/threads_util.py` (start/stop/list) and emits `thread.start/stop` reflection events through `log_event`.
- **Startup:** genesis verify and `seed.start` events are logged through FastAPI lifespan, avoiding deprecated startup hooks.
