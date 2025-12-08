# Symbia Seed MCP Server Adapter

This adapter exposes a minimal, governed MCP surface over the existing Seed HTTP API without changing execution-layer semantics. It speaks JSON-RPC 2.0 (Model Context Protocol tool surface) over stdio and registers only the five Symbia tools.

## Running
- Install Seed dependencies, then start the MCP server:
  - `python -m seed.mcp_server` (reads newline-delimited JSON-RPC on stdin, writes responses to stdout).
- Configure the Seed API endpoint:
  - `SEED_API_URL` (default `http://127.0.0.1:8123`).
- Symbikey handling:
  - `SYMBIA_MCP_SYMBIKEY` or `SYMBIKEY` supplies a default when the caller omits one.
  - `SYMBIA_ALLOWED_SYMBIKEYS` (comma-separated) or `SYMBIA_ALLOWED_SYMBIKEYS_FILE` enforces an allowlist before forwarding calls.
- Trace logging: every MCP call is recorded as `kind=mcp.call` in `~/.symbia-seed/logs/cognitive-trace.log` (respects `SYMBIA_STATE_DIR` and `SYMBIA_ALLOW_IN_REPO_STATE`).

## Tools and Seed Endpoint Mapping

| MCP tool                | Seed endpoint          | Notes                                   |
| ----------------------- | ---------------------- | --------------------------------------- |
| `symbia.get_status`     | `GET /status`          | Optional `include_capabilities/limits`. |
| `symbia.run_mission`    | `POST /missions/run`   | Requires `symbikey`; supports sync/TTL. |
| `symbia.get_mission`    | `GET /missions/{id}`   | Requires `symbikey`; optional result/children. |
| `symbia.query_state`    | `POST /state/query`    | Requires `symbikey`; optional limit/provenance. |
| `symbia.inspect_trace`  | `GET /traces/{id}`     | Requires `symbikey`; can filter by mission. |

No filesystem, shell, or arbitrary HTTP tools are exposed over MCP.

## JSON-RPC Surface

- `initialize` → `{ protocolVersion, capabilities, serverInfo }`
- `tools/list` → `{ tools, next_cursor }` (returns only the tools above).
- `tools/call` → executes the named tool with `arguments`; errors propagate as JSON-RPC errors with Seed HTTP status (if available) in `error.data.status_code`.

All tools except `symbia.get_status` must include `symbikey` in `arguments`. If the symbikey is an object, `entitlements` will be validated against tool requirements when present; allowlists apply either way.

### Example (run mission)

```json
{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{
  "name":"symbia.run_mission",
  "arguments":{
    "symbikey":"user-key-123",
    "mission_spec":{"task":"summarize docs"},
    "sync":true
  }
}}
```

### Error handling
- Missing or disallowed symbikey → JSON-RPC error `code=-32001`.
- Seed API failures → `code=-32002` with HTTP status in `error.data.status_code`.
- Invalid params → `code=-32600/-32001` depending on the violation.

## Testing

`pytest tests/test_mcp_server.py` covers:
- Tool registration and JSON-RPC routing.
- Symbikey allowlist enforcement.
- Mapping to Seed client calls.
- Error propagation and invalid schema handling.
