# Symbia CLI (alpha1, OEP/GKS aligned)

Entry: `python3 daemon/symbia.py` from the repo root (`/path/to/symbia-seed`).
Default API: `SEED_API_URL` (defaults to `http://127.0.0.1:8123`).
State dir: `~/.symbia-seed-<install_id>` by default (auto-named; pointer at `~/.symbia-seed-current`). Set `SYMBIA_STATE_DIR` to override or `SEED_AUTO_STATE=0` to force the legacy `~/.symbia-seed`.

Commands:
- `status` — GET `/health` (ok/version/uptime).
- `observer` — open `http://localhost:9000/` (local UI).
- `shell` — minimal chat REPL via `/chat` (requires gateway/provider key); UI/dashboard also uses `/chat` with anchor/history and coglog context.
- `key inspect` — show genesis key metadata and sha256.
- `key verify` — check genesis key sha256 against the pinned hash and (if present) verify `genesis.sig` with `genesis.pub` (OpenSSH sshsig via `ssh-keygen -Y verify`).
- `llm enqueue "<prompt>"` — POST `/llm/jobs` with a generated job_id (default provider `ollama`; set via API config).
- `llm setup-llamacpp --model-url <http(s)://...> [--model-path <dest>]` — download a GGUF model to use with the llama-cpp provider (`LLAMA_CPP_MODEL_URL/LLAMA_CPP_MODEL_PATH` envs also respected).

Notes:
- The chat REPL is intentionally thin; it logs via the `/chat` path (Subkeys/OpenAI/etc. based on config).
- Genesis key ships in `daemon/keys/genesis.json` for the demo; on first run it is copied into your state dir (`~/.symbia-seed/keys` by default). A real installer should fetch+verify a signed key.
- LLM helpers expect the API to be running on `SEED_API_URL`; model download helper does not need the API running but requires a reachable URL.
- OEP: CLI must not assume hidden state; all prompts/answers should surface uncertainty and provenance where applicable.
- GKS: identity/continuity come from genesis/install keys; constraint-sets and lineage are enforced by the API/logging.
- For other API calls (list/cat/edit), use the HTTP endpoints directly or the existing `core/cli.py` module if needed.***
