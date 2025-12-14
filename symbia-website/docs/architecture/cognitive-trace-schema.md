# Cognitive Trace Schema (draft)

Purpose
-------
Define the structured traces Symbia emits for cognition, personas, and markdown changes.

Logs (current)
--------------
- `logs/cognitive-trace.log` — JSONL events (`event`, `file`, `mode/cmd`, `timestamp`).
- `logs/markdown-changes.log` — shortstat + trimmed diff lines.
- `logs/internal/markdown-trace.log` — detailed diff with timestamps.
- `logs/internal/markdown-events.log` — event pings for markdown writes.
- `logs/checkpoints.md` — human-readable milestones/breakpoints.
- `logs/cognitive/persona-deltas.log` — planned: persona changes with timestamp + summary.

Event shape (guideline)
-----------------------
```json
{
  "timestamp": "2025-12-02T03:00:00Z",
  "event": "edit|trace|terminal|persona_delta|worker",
  "file": "docs/... (optional)",
  "mode": "overwrite|append (optional)",
  "cmd": "git-status (optional)",
  "summary": "shortstat or message",
  "diff": "trimmed diff (optional)",
  "meta": { "worker": "observer|interpreter|actor", "persona": "hash/version" }
}
```

Principles
----------
- Append-only, fsync on write.
- LLM-friendly (JSONL or lightweight text) and partitionable by thread/session when threads land.
- No global locks; keep entries small and frequent.
- Link persona changes (persona-deltas) to downstream outputs for auditability.

Planned extensions
------------------
- Threaded traces under `logs/cognitive/trace-*.log` (DAW-style per session).
- Richer worker events (spawn/kill/heartbeat) and persistence/provider load/unload events.
- Cross-references between checkpoints and trace segments.
