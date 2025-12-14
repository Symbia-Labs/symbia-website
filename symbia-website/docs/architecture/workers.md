# Workers & Supervisor (API/CLI surface)

## Lifecycle
- Supervisor: `python3 -m core.workers.run_supervisor` (started by `./scripts/seed.sh boot`) launches workers defined in `daemon/core/config/system.yaml` under `workers`.
- Worker entries support `enabled`, `module`, `type`, and optional `env`; new generic worker base lives at `core/workers/base_worker.py` with pipeline hooks in `core/workers/pipeline.py`.
- Reflection worker scaffold (disabled by default): `workers.reflection` → `core.workers.reflection_worker` (uses the generic base).

## API (for UI integration)
- `GET /workers/status` — running workers with `running`, `pid`, `log`, `type`, `started_at`.
- `GET /status` — includes `workers_summary` (total enabled vs running) and `persistence_summary`.
- Logs: supervisor at `logs/symbia-seed.supervisor.log`; worker logs follow `logs/symbia-seed.<name>.log`.

## CLI / Process control
- `./scripts/seed.sh boot|reboot|stop|status|logs` — start/stop/show pids, tail logs.
- Manual: `env PYTHONPATH=daemon python3 -m core.workers.run_supervisor` (expects `system.yaml` workers config).
- Enable/disable workers via `daemon/core/config/system.yaml` (`workers` section); restart required.

## Extension points (for future UI wiring)
- Sources/Interpreters/Sinks are pluggable via the generic pipeline (see `core/workers/pipeline.py`).
- Reflection worker now sits on the generic base: tails trace, can classify with a local LLM (`OLLAMA_ENDPOINT`/`OLLAMA_MODEL`), attaches Symbia Key context, and will apply redaction/throttling and publish a bounded buffer for UI. It uses a plug-in (`reflection.llm.plugin`) with a bundled heuristic default.
- UI can poll `GET /workers/status` and show per-worker log links or health badges; supervisor log provides startup/error context.
- Default enabled workers (current seed): `status`, `reflection`. Relay/gateway workers are optional and disabled by default; chat/Subkeys run inline via the API.
