# Code/Doc Alignment Review — symbia-seed (2025-12-08)

## Run log
- `./scripts/seed.sh reboot` → api pid 7565, supervisor 7570, http 7575
- `./scripts/seed.sh status` → api/supervisor/http all running
- `curl -s http://127.0.0.1:8123/health` → `{ok: true, version: "0.2", uptime_seconds: 13}`
- `curl -s http://127.0.0.1:8123/status` → port 8123, version `alpha1-2025-12-08T16:32:47Z`, workers_summary `{total:7,running:7}`, persistence_summary `{vector:ok,graph:ok,timeseries:ok}`, `genesis_verify.ok=false (reason: missing genesis)`
- `curl -s http://127.0.0.1:8123/persistence/status` → vector/graph/timeseries enabled+ok; broker dummy backend subscribers 0
- `curl -s http://127.0.0.1:8123/workers/status` → status/reflection/llm/pid_monitor/socket_monitor/log_tail/policy_monitor all running with log paths under `~/.symbia-seed/logs/`
- `curl -s http://127.0.0.1:8123/trace/tail` → count 14, includes `service.status`, `continuity.time` skew, `web.ui` loads
- `curl -s http://127.0.0.1:8123/events/latest` → `{detail: "Not Found"}`
- `curl -s http://127.0.0.1:8123/time` → `{detail:"Not Found"}404`; `/time/check` same
- `curl -s http://127.0.0.1:8123/docs/index` → 40 markdown files under `docs/`
- `curl -s "http://127.0.0.1:8123/docs/file?path=docs/architecture/seed/cli.md"` → returned current CLI doc content
- `curl -s -X POST http://127.0.0.1:8123/chat -d '{"message":"hello from alignment","context":{"surface":"cli"}}'` → provider `subkeys`, reply string with OpenAI raw payload included
- `curl -s -X POST http://127.0.0.1:8123/threads/start ...` → thread `thread-cca827e0` running with mission path under `~/.symbia-seed/missions/`; `/threads/list` shows the thread; `/threads/stop` marks stopped
- `curl -s -X POST http://127.0.0.1:8123/edit/file -d '{"path":"logs/doc-alignment-sample.txt","content":"sample note"}'` → `{status: "ok", bytes: 11}`
- `curl -s http://127.0.0.1:8123/logs/index` → lists logs under `~/.symbia-seed/logs/` (api/http/worker logs, cognitive-trace.log, reflection/events.ndjson, status markdown)
- `curl -s "http://127.0.0.1:8123/logs/file?path=symbia-seed.status.log" | head` → shows worker stack traces from status aggregator (AttributeError on summarize)
- CLI help: `./scripts/seed.sh --help` (boot|reboot|stop|status|logs|wipe|inspect), `./scripts/symbia.sh --help` (start/stop/restart/service/bundle-logs/export-logs), `python3 daemon/symbia.py -h` (status|observer|shell|llm|key)
- Tests: `pytest` → 25 passed, 0 failed (DeprecationWarning on FastAPI on_event)

## Findings
- [medium][api/docs] `/events/latest` is documented but not implemented; calling returns 404. Updated `docs/architecture/quickstart.md` to point to `/trace/tail` and `/reflection/events` instead. Evidence: `curl -s http://127.0.0.1:8123/events/latest -> {"detail":"Not Found"}`.
- [medium][api/docs] Telemetry docs referenced `/time` and `/time/check`, which do not exist; only UI telemetry produces time skew entries. Updated quickstart and reflection docs accordingly. Evidence: `/time` and `/time/check` both return 404.
- [medium][api/docs] Chat/logs doc listed POST `/logs/index` and `/logs/search` which are absent; actual surface is GET `/logs/index`, `/logs/file`, and trace/reflection tails. Updated `docs/architecture/seed/chat.md` with the live routes and offline chat fallback.
- [medium][cli/docs] CLI doc omitted `llm` helpers and described key verification as PEM-based. Updated `docs/architecture/seed/cli.md` to include `llm enqueue/setup-llamacpp` and note sshsig verification via `genesis.pub`.
- [high][config/docs] Genesis verification is not enforced on startup despite previous wording. `/status.genesis_verify.ok=false` while API continues serving. Documented the current behavior in `docs/architecture/seed/security.md`; opened backlog to enforce failure on mismatch.

## Actions taken
- Updated quickstart, chat, CLI, and security docs to match current endpoints, CLI surface, log locations, and genesis verification behavior.
- Captured live endpoint responses and CLI help to anchor doc examples to defaults (host `127.0.0.1`, port `8123`, state dir `~/.symbia-seed`).

## Remaining gaps / backlog
- Genesis verification enforcement still absent; see `docs/backlog/code_doc_alignment.md` for repro and proposed action.
- Status worker log shows AttributeError stack traces; behavior not assessed in this review.
