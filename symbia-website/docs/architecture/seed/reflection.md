# Seed Reflection Log (lineage per GKS, epistemics per OEP)

The reflection log is the append-only, source-of-truth continuity ledger for Seed workers (Atlas Codex, local tools, daemons). Events are written to `${SYMBIA_STATE_DIR}/logs/reflection/events.ndjson` (default `~/.symbia-seed/logs/reflection/events.ndjson`) as newline-delimited JSON.

## Event schema
- `ts` (int, ns)
- `source` (str) — subsystem (e.g., `seed`, `atlas`, `daemon`)
- `worker` (str) — process or script (e.g., `seed.api`, `seed.sh`, `seed.supervisor`)
- `mission` (str) — mission or task identifier
- `op` (str) — action (`mission.start`, `mission.update`, `mission.complete`, `doc.write`, `error`, etc.)
- `status` (str) — `ok` or `error`
- `path` (optional, str) — file path for doc/file ops
- `notes` (optional, str) — free-form detail
> OEP/GKS: reflection is lineage (structural, append-only). It must not carry unverifiable knowledge; it captures provenance, constraints, and execution roles.

## Writing events
Use the shared utility at `helpers/reflection.py` (daemon runtime) so events land in the state dir, not the repo:

```python
from helpers.reflection import write_event

write_event({
    "source": "seed",
    "worker": "seed.api",
    "mission": "example.mission",
    "op": "mission.update",
    "status": "ok",
    "notes": "heartbeat",
})
```

The helper creates `logs/reflection/events.ndjson` if missing and fsyncs each append. It raises on missing required fields but is wrapped defensively in callers.

## Where events are emitted now
- Seed API startup logs `seed.start` (`mission=seed.boot`).
- `/edit` and `/edit/file` append `doc.write` events (defaults to `mission.unknown`; override via headers `X-Mission`/`X-Worker`/`X-Source` or payload fields `mission`, `worker`, `source`).
- `scripts/seed.sh` logs mission start/updates/completion around boot and component launches.
- `core.workers.run_supervisor` logs mission lifecycle for worker supervision.
- UI telemetry (`/ui/telemetry`) emits `continuity.time` skew warnings when the dashboard detects local clock drift.
- `/ui/telemetry` appends UI/dashboard events (e.g., `web.ui` load, `continuity.time` skew) into the cognitive trace/reflection stream for swimlanes.

Markdown logs remain unchanged; reflection NDJSON is the canonical continuity file.

## API ingestion (cognitive trace)
Use `/trace` to append “decisions”, “breakthroughs”, “status updates”, etc. into the cognitive trace (`${SYMBIA_STATE_DIR}/logs/cognitive-trace.log`). Example:
```bash
curl -s -X POST http://127.0.0.1:8123/trace \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {"source": "service", "type": "decision", "message": "approved plan", "metadata": {"mission": "demo.mission"}},
      {"source": "service", "type": "breakthrough", "message": "resolved dependency", "metadata": {"note": "seed bootstrap"}},
      {"source": "service", "type": "status", "message": "boot complete", "metadata": {"port": 8123}}
    ]
  }'
```
These write to the state dir (not the repo) by default. Use headers `X-Mission`/`X-Worker`/`X-Source` on edit routes if you need to tag file edits consistently.

## Planned inspection/interpretation pipeline (LLM + Symbia Key)
- **Sources**: cognitive trace tail, API audit hooks, worker lifecycle, file/edit ops, time skew, broker/system events.
- **Enrichment**: load system/user Symbia Key data (install/local/user blobs, constraint hashes, persona/role/fingerprint) and attach lightweight identity context to each candidate event.
- **Interpret** (local LLM): classify severity (`debug|info|warn|error`), category (`trace|audit|system|chat|worker`), claim_class/access (OEP: observable/public/intrinsic/hypothesis/forbidden + access=true/false), and produce a short normalized `notes` summary; drop/redact disallowed content.
  - Local-only by default (e.g., OLLAMA: `OLLAMA_ENDPOINT`, `OLLAMA_MODEL`); no networked inference unless explicitly configured.
  - Prompt must forbid fabricated awareness and require explicit uncertainty labels.
- **Persist**: append enriched records to reflection NDJSON with rotation/backpressure; maintain a bounded in-memory buffer for UI/API.
- **Publish**: `/reflection/events` should read from the buffer first (with a disk fallback) for the web UI; `/workers/status` should expose reflection worker health/lag.
- **Govern**: throttle noisy sources, reject oversize payloads, and honor allowlists/denylists for paths/sources.
- **Metrics**: counters (ingested, dropped, rotated), lag to tail, last error time; surface via `/status` and worker telemetry.

### Data attached from Symbia Key (draft)
- `identity_id`, `fingerprint`, `role` (from user/local key data if present)
- `preferences_hash`, `constraints_hash` (already exposed by `/identity/snapshot`)
- `key_id` or `install_id` to tie reflection entries to a specific install lineage
- Optional persona/trait labels when present (must be explicit and sourced from key data only)

### LLM plug-in model
- Plug-in path (config): `reflection.llm.plugin` (e.g., `plugins.actors.llm.reflection.ollama:Plugin` or blank for heuristic).
- Heuristic plugin (default): rule-based labels (severity/category/claim_class) with no network use.
- Ollama plugin: local endpoint/model only; respects `OLLAMA_ENDPOINT`/`OLLAMA_MODEL` or config overrides; returns structured labels.
- No writes to the repo: all reflection outputs remain under the state dir (`~/.symbia-seed/...`).
- CLI/docs/OpenAPI: reflection worker is started by supervisor; status surfaces via `/workers/status` and `/status` (workers_summary). OpenAPI already includes worker/status endpoints; CLI uses `./scripts/seed.sh` (`status|logs`) to inspect worker state/logs.

### Threads and reflection
- UI sends `thread` metadata to `/chat` (see `docs/architecture/threads.md`). These fields are accepted today and will be propagated into reflection payloads (planned: interpreter adds `thread_id`, `anchor`, `mission_id` into reflection events).
- Offline chat mode returns a safe reply (“Local chat not configured. Context logged only.”) so the UI popout never errors when providers are absent; context still logs to trace/reflection.
