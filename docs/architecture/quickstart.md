# Symbia Seed Quickstart (alpha1, OEP/GKS aligned)

## OEP/GKS framing (read first)
- **OEP (Open Epistemic Protocol)**: explicit uncertainty, provenance on every claim, no fabricated awareness, hypotheses labeled. Seed surfaces telemetry and context without inventing hidden state.
- **GKS (Genesis Key Specification)**: structural substrate—identity, continuity, constraint-sets, lineage—and the Observer → Interpreter → Processor → Actor (O→I→P→A) pipeline. All services/lanes map to these roles.
- **Primitives surfaced in Seed**: genesis install time (identity/continuity), constraint hashes (preferences/constraints), lineage (trace + reflection logs), and pipeline groupings in the UI.

This outlines the minimal steps to bring up the Seed (API, supervisor, workers, UI) in a single terminal and the run-order to keep components aligned.

## Prerequisites
- Python 3.9+
- `pip install -r daemon/core/requirements.txt`
- Open ports: 8123 (API) and 9000 (UI)
- State dir: defaults to `~/.symbia-seed-<install_id>` (auto-derived; pointer at `~/.symbia-seed-current`). Override with `SYMBIA_STATE_DIR` or disable auto-naming with `SEED_AUTO_STATE=0`.
- On first run, any shipped demo keys in `daemon/keys/*` are copied into the state dir (`~/.symbia-seed-*/keys` by default).
- Optional portable install: run `./daemon/symbia-installer.sh` to copy into your chosen install path with first-run prompts + hooks; state defaults to `~/.symbia-seed` (override `SYMBIA_STATE_DIR`).
- Governance helpers live in `daemon/core/governance.py` (modes/crypto/audit); active config is exposed at `/governance/config`.

## One-command boot (recommended)
From the repo root:
```bash
./scripts/seed.sh boot
# Uses chat gateway defaults from daemon/core/config/user.yaml
# Starts: API (8123), supervisor/relay workers, web UI (http://localhost:9000/)
# Launch 5 concurrent instances on rotating ports with isolated state dirs:
./scripts/symbia start --5
  # api ports: 18123-18127, ui ports: 19001-19005
  # state dirs: ~/symbia-seed-multi/<timestamp>/instance1..N
# Stop all multi-instance seeds under the default pool:
./scripts/symbia stop --all
```

Control commands:
```bash
./scripts/seed.sh status   # show pids
./scripts/seed.sh stop     # stop api/supervisor/http
./scripts/seed.sh logs     # tail seed logs
./scripts/seed.sh reboot   # stop + boot
SEED_AUTO_STATE=0 ./scripts/seed.sh boot  # keep legacy ~/.symbia-seed naming
./scripts/seed.sh wipe     # stop + remove state dir (~/.symbia-seed by default)
./scripts/seed.sh inspect  # dump inspection metadata (paths, state, install)
./scripts/startup-hooks.sh --force  # rerun first-boot hooks
```

## Manual run (if you prefer explicit processes)
```bash
cd daemon
env PYTHONPATH=. uvicorn core.app:app --host 127.0.0.1 --port 8123
env PYTHONPATH=. python3 -m core.workers.run_supervisor
python3 -m http.server 9000 --directory web
```

## Sequence of operations (what starts, in order)
1) **API** (`core.app:app`) — serves `/health`, `/status`, `/persistence/status`, `/workers/status`, `/trace/tail`, `/reflection/events`, `/docs/*`, `/logs/*`, `/ui/telemetry`, `/openapi.yaml`.
2) **Supervisor** (`core.workers.run_supervisor`) — launches configured workers (e.g., relay/openai) and tracks status.
3) **Workers** — interpreter/relay or other configured workers; report to `/workers/status`.
4) **Web UI** (http server on 9000) — dashboard at `/`, links to Swagger UI and Docs/Logs Viewer.

## Status checks
```bash
curl -s http://127.0.0.1:8123/health
curl -s http://127.0.0.1:8123/status
curl -s http://127.0.0.1:8123/persistence/status
curl -s http://127.0.0.1:8123/workers/status
curl -s http://127.0.0.1:8123/trace/tail?limit=10
curl -s http://127.0.0.1:8123/reflection/events?limit=10
curl -s http://127.0.0.1:8123/governance/config | jq
```

## Logs
- API: `~/.symbia-seed/logs/symbia-seed.api.log` (or `${SYMBIA_STATE_DIR}/logs`)
- Supervisor/workers: `${SYMBIA_STATE_DIR}/logs/symbia-seed.supervisor.log`
- Cognitive trace: `${SYMBIA_STATE_DIR}/logs/cognitive-trace.log` (append + fsync)
- Reflection events: `${SYMBIA_STATE_DIR}/logs/reflection/events.ndjson` (all contract/docs/log actions use a unified `log_event` helper)
- Contract ledger: `${SYMBIA_STATE_DIR}/logs/contract-events.log` (spawn/heartbeat/retire verification)

## Useful URLs
- Dashboard/observer (serve `../symbia-seed-web` locally or set `SYMBIA_WEB_DIR`): `http://localhost:9000/`
- Swagger UI: `http://127.0.0.1:8123/docs/swagger`
- OpenAPI YAML: `http://127.0.0.1:8123/openapi.yaml`
- Health: `http://127.0.0.1:8123/health`
- Docs Viewer (web UI): `http://localhost:9000/docs.html`
- Logs Viewer (web UI): `http://localhost:9000/logs.html`
- API docs/logs routes are also directly available: `/docs/index`, `/docs/file?path=...`, `/logs/index`, `/logs/file?path=...`

## MCP Adapter (Model Context Protocol)
- Start the MCP bridge over stdio: `python -m seed.mcp_server` (respects `SEED_API_URL`).
- Provide a symbikey via `SYMBIA_MCP_SYMBIKEY` or per-call `arguments.symbikey`; enforce allowlists with `SYMBIA_ALLOWED_SYMBIKEYS`.
- Exposed tools: `symbia.get_status`, `symbia.run_mission`, `symbia.get_mission`, `symbia.query_state`, `symbia.inspect_trace`.
- See `docs/integrations/mcp_server.md` for full tool schemas, error codes, and client examples (e.g., VS Code MCP, CLI).

## Telemetry/Introspection
- `/health` — ok/version/uptime
- `/status` — service status + trace stats + install/genesis time (age, version alpha1-<t0_iso>, server_time_ms, genesis_verify)
- `/ui/telemetry` — append dashboard/UI events to the cognitive trace (used by swimlanes)
- `/trace/tail` — cognitive trace tail (chat, telemetry, edits, missions)
- `/reflection/events` — reflection tail (doc/mission lifecycle events)
- `/logs/index` + `/logs/file?path=...` — list and read logs under `${SYMBIA_STATE_DIR}/logs`
- Dashboard shows Service Telemetry (Observer/Interpreter/Processor/Actor/Editor/Terminal/System/Time) and Cognitive Telemetry (Decisions/Evaluations/Checkpoints/Breakthroughs/Reflection/Events) using in-memory tails.

## Keys and genesis (alpha1)
- Genesis assets live in `${SYMBIA_STATE_DIR}/keys/` (`genesis.json`, `.sig`, `.pub`). On first run, shipped demo keys copy from `daemon/keys/` if missing.
- Verification: `python3 daemon/symbia.py key verify` (sshsig via `ssh-keygen -Y verify`); strict mode via `SYMBIA_STRICT_GENESIS=1` raises on failure during key derivation.
- Derived keys: `core/keys.py` now generates ed25519 keypairs for local/user; fingerprints use HMAC-SHA3-512 over canonical JSON bound to genesis/install/policy (label `SYMKEY_DERIVATION_V1`). Private PEMs stay under `${SYMBIA_STATE_DIR}/keys/` with 0600 perms; public PEM/OpenSSH are embedded in `local.json`/`user.json`.
