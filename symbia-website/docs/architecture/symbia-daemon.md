Symbia Daemon — /edit/file
==========================

Purpose
-------
`POST /edit/file` is the preferred write path for documentation updates. It accepts plain text bodies (no nested `edit` payloads, no escaped newlines) and performs a safe, atomic replace inside the workspace root.

Endpoint
--------
- **POST `/edit/file`**
- Body:
```json
{
  "path": "docs/positioning.md",
  "content": "Full text of the file..."
}
```
- Response:
```json
{"status":"ok","bytes":1234}
```

Behavior
--------
- Paths must be relative to the workspace; absolute paths and `..` traversal are rejected.
- Intermediate directories are created automatically.
- Writes are atomic: temp file -> fsync -> `os.replace` into place (macOS-safe).
- Byte count is returned using UTF-8 encoding of the provided content.
- Existing `/edit` and `/write` endpoints remain unchanged.

Logging
-------
Each write appends fsync’d entries to:
- `logs/markdown-events.log` — `[2025-12-01T14:05:03Z] EDIT_FILE path=docs/foo.md bytes=1234`
- `logs/internal/markdown-trace.log` — includes shortstat + trimmed diff
- `logs/markdown-changes.log` — append-only ledger with the same trace lines

Example (curl)
--------------
```bash
curl -X POST http://127.0.0.1:8123/edit/file \
  -H "Content-Type: application/json" \
  -d '{"path":"docs/test.md","content":"Hello world"}'
```

Design Notes
------------
- **Shell ergonomics:** eliminate giant JSON blobs and quoting hassles when pasting multi-line text from terminals.
- **Stability:** atomic writes + fsync keep doc updates durable even on reload or crash; directory creation removes a class of errors.
- **LLM integration:** simple schema makes it easy for tool-augmented LLMs to stream docs directly without lossy escaping.
- **Hot reload:** works with `uvicorn --reload` (no extra state is cached outside of the workspace tree).
