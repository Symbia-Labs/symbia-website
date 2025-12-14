# Symbia Seed (OEP/GKS foundations)

Seed is bound by the Open Epistemic Protocol (OEP) and Genesis Key Specification (GKS):
- **OEP**: explicit uncertainty; provenance on all claims; no fabricated awareness; hypotheses labeled.
- **GKS**: structural substrate—identity, continuity, constraint-sets, lineage—and the Observer→Interpreter→Processor→Actor (O→I→P→A) pipeline.

Purpose
-------
Local execution substrate that exposes safe, structured endpoints. Everything is local, deterministic, fsync’d, and tied to genesis/install identity and lineage.

Process Model
-------------
- FastAPI app (`core/app.py`) serves HTTP on 127.0.0.1.
- Lineage: `logs/cognitive-trace.log` (trace) + `logs/reflection/events.ndjson` (reflection).
- Filesystem scope bounded by config; persistence/broker optional.

Module Layout (selected)
------------------------
- `core/app.py` — endpoints: status (with genesis time, server time), identity snapshot (prefs/constraints hashes), persistence, workers, chat, telemetry, log stream, edit/file.
- `extensions/persistence/manager.py` — loads vector/graph/timeseries stores (stub by default).
- `broker/` — dummy broker; MQTT placeholder.
- `util/` — fsync, atomic write, tracing helpers.
- `workers/` — supervisor + relay/status workers (Interpreter/Service lanes); lifecycle/status surface.
- `governance.py` — mode/crypto/audit helpers (creative/autonomous/restricted), canonical JSON + HMAC-SHA3-512 fingerprints, allowance checks for fs/net/shell/tools/keys/artifacts, audit-failure policy lookup.

Persistence and Providers
-------------------------
- Env overrides: `SYMBIA_VECTOR_PROVIDER`, `SYMBIA_GRAPH_PROVIDER`, `SYMBIA_TIMESERIES_PROVIDER`, `SYMBIA_BROKER_BACKEND`.
- `/persistence/status` reports vector/graph/timeseries stores and broker.

Identity, Continuity, Constraints, Lineage
------------------------------------------
- Install/genesis: `keys/install.json` (t0_iso, install_id) and local/user keys (fingerprints).
- `/status`: age from genesis/install; version `alpha1-<t0_iso>`; server_time_ms for skew.
- `/identity/snapshot`: identity_id, traits, roles, preferences/constraints + SHA-256 hashes (constraint-sets), install/local/user blobs.
- Lineage: trace + reflection logs; UI swimlanes grouped by O→I→P→A + Identity/Continuity.
- Governance/crypto surface: `/governance/config` returns active mode, modes table, audit behavior, snapshot retention, crypto primitives (ed25519 signatures, sha256 envelope hash, HMAC-SHA3-512 fingerprints labeled `SYMKEY_DERIVATION_V1`).
- Key derivation: `core/keys.py` now generates ed25519 keypairs for local/user, fingerprints via HMAC-SHA3-512 over canonical JSON bound to genesis/install/policy; private keys live under state dir. Set `SYMBIA_STRICT_GENESIS=1` to enforce genesis signature at derivation time (raises on failure).

Trace and Events
----------------
- `/event`, `/trace` append to cognitive trace; `/log/stream` streams it.
- `/ui/telemetry` appends UI/continuity events (e.g., `web.ui`, `continuity.time`).
- Markdown logs: `logs/markdown-events.log`, `logs/markdown-changes.log`.
- OpenAPI: `docs/architecture/openapi.yaml`.
- Threads: `/threads/start|stop|list` manage per-popout sessions; thread missions live in the state dir (`~/.symbia-seed/missions/<thread>.yaml`).
- Chat: `/chat` accepts `thread` (id/anchor/history) and `context` (topic, system_prompt, Symbia metadata). Subkeys/OpenAI/Ollama/Anthropic supported; offline fallback when unconfigured.

File Operations
---------------
- `GET /list?prefix=...`
- `GET /project/file?path=...`
- `POST /edit/file` (atomic overwrite + markdown/trace logging); legacy `POST /edit`.

Terminal and Snapshots
----------------------
- `POST /terminal/exec` runs safe-command whitelist and logs output.
- `GET /project/snapshot` returns file mtimes.

Workers and Execution Model
---------------------------
- Default workers: relay (Interpreter) and status (Service) from config; supervisor reports running PIDs.
- Plugins/roles map to O→I→P→A; Actors should be the only irreversible role (future).

Configuration
-------------
- Base: `core/config.yaml` (repo_root/paths).
- System: `core/config/system.yaml` (host/port, CORS, safe commands, persistence, extensions/providers).
- User: `core/config/user.yaml` (UI/relay prefs; optional).
- Merged via `util/settings.py`, env can override (e.g., `SYMBIA_*`, `OPENAI_API_KEY`, `CHAT_PROVIDER_*`).
- Identity (design only): see `docs/architecture/symbia-key.md` for the proposed Symbia Key model; not implemented yet.
- Key-aware supervisor (design scaffold): `system.yaml` carries a placeholder `key` section to capture path/fingerprint/roles; `/admin/key` surfaces metadata only (no secrets). Not enforced yet.

Operational Notes
-----------------
- Default repo root: `/path/to/symbia` unless overridden by `config.yaml`.
- Runtime is under `daemon/` (API, workers, extensions, web, keys, logs); optional helpers live in `scripts/`.
- All trace writes fsync to disk before returning.
- No external databases are required in this phase; stubs keep interfaces stable for future integrations (Chroma/Neo4j/QuestDB/MQTT).
- Use `/edit/file` for all writes to enforce atomic replace + logging.

MCP Server Adapter
------------------
- A JSON-RPC MCP bridge (`python -m seed.mcp_server`) exposes a minimal tool surface mapped to existing Seed endpoints; it does not expand filesystem or shell access.
- Tools: `symbia.get_status`, `symbia.run_mission`, `symbia.get_mission`, `symbia.query_state`, `symbia.inspect_trace`; each call logs `kind=mcp.call` into the cognitive trace.
- Symbikeys are required for all tools except `get_status`; allowlists via `SYMBIA_ALLOWED_SYMBIKEYS`/`SYMBIA_ALLOWED_SYMBIKEYS_FILE`, defaults via `SYMBIA_MCP_SYMBIKEY` or `SYMBIKEY`.
- Configuration, schemas, and client examples live in `docs/integrations/mcp_server.md`.
