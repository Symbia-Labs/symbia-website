# Logging Subsystem

The logging subsystem makes Symbia’s cognition inspectable, auditable, and replayable. It captures human-readable traces for operators and machine-readable artifacts for external LLMs or downstream analytics—without relying on access to Git history.

---

## 1. Goals
- **Continuity & replay:** Reconstruct what happened, when, and why (inputs, outputs, diffs, tool calls).
- **Auditability & compliance:** Enforce consent boundaries and produce exportable evidence of system behavior.
- **Semantic observability:** Preserve meaning (not just bytes) so external LLMs can summarize, critique, or coach.
- **Operational hygiene:** Clear rotation/retention rules; separation between public logs and internal/raw traces.

---

## 2. Principles
1. **Human-readable first, LLM-friendly always:** Each entry is plain text with structured prefixes (timestamp, path, shortstat) plus trimmed diffs or payloads.  
2. **Separation of concerns:** Public logs for user-facing visibility; internal logs for raw traces, patches, and event pings.  
3. **Least access:** No hidden dependencies (e.g., Git) required for interpretation; logs stand alone.  
4. **Consent-forward:** Capture only what the user has permitted; redact or skip sensitive surfaces.  
5. **Deterministic rotation:** Size/time-based rotation to avoid unbounded growth; backups kept adjacent.

---

## 3. Layout (filesystem)
- `logs/markdown-changes.log` — human-readable ledger of markdown saves with shortstat + trimmed patch.  
- `logs/internal/markdown-trace.log` — mirrored trace (same content as above) for downstream ingestion.  
- `logs/internal/markdown-events.log` — lightweight “event fired” pings to validate watcher health.  
- `logs/sync-log.md`, `logs/checkpoints.md`, etc. — human-authored sync points; also captured by watcher.  
- `codex/session/chat/transcript.md` — manual conversation snippets (appended via script).  
- Future channels (planned): `logs/tools.log`, `logs/audit.log`, `logs/alerts.log`, `logs/state-delta.log`.

Rotation/backup rules (current ad hoc): `*.bak` created when regenerating. Future: `*.log.*` rotation by size/date.

---

## 4. Event Types & Schemas (plain text)

### 4.1. Content Change (Markdown)
```
[YYYY-MM-DD HH:MM:SS] <relative/path> :: <shortstat or reason>
<trimmed unified diff (colorless, head -c 4000)>
---
```
Interpretation notes:
- Shortstat aligns with Git’s `--shortstat` semantics.
- Diff is relative to HEAD when tracked, else no-index vs /dev/null for untracked files.
- External LLM can summarize or classify without Git.

### 4.2. Event Ping (Watcher Health)
```
[YYYY-MM-DD HH:MM:SS] <relative/path> :: event fired
```
Used to confirm the watcher fired even if diff is empty.

### 4.3. Conversation Snippet (Manual)
```
[YYYY-MM-DD HH:MM:SS] codex conversation
<pasted text>
---
```
Written by `scripts/update_conversation_log.py`.

### 4.4. (Planned) Tool Invocation
```
[timestamp] TOOL :: <tool_name> :: status=<ok|error> :: inputs=<summary> :: outputs=<summary>
<optional payload excerpt>
---
```

### 4.5. (Planned) Audit Event
```
[timestamp] AUDIT :: <surface> :: actor=<user|agent> :: action=<action> :: result=<allow|deny|error> :: reason=<text>
```

---

## 5. Capture Pathways
- **VS Code watcher (current):** File & Folder Watcher extension hooks `onFileChange` for `*.md`, writes shortstat + patch to `logs/markdown-changes.log` and `logs/internal/markdown-trace.log`; health pings to `logs/internal/markdown-events.log`.  
- **Manual transcript appends (current):** `python scripts/update_conversation_log.py "<text>"` writes to `codex/session/chat/transcript.md`.  
- **Planned automation:**  
  - Tasks to append chat transcripts from surfaces that expose APIs.  
  - Tooling hooks to log tool calls and results.  
  - State substrate deltas pushed to `logs/state-delta.log`.

---

## 6. Operational Considerations
- **Rotation:** Add size-based rotation (e.g., 5 MB) with numeric suffixes, keep N=5 generations; mirror for `/internal`.  
- **Redaction:** Provide a redact list to drop secrets/PHI from diffs; fallback to “redacted” marker.  
- **Backpressure:** If write fails, emit a health alert to the status bar and `markdown-events.log`.  
- **Portability:** Logs must be interpretable offline; avoid external references (no Git required).  
- **Consent & scope:** Default to logging workspace artifacts; optionally exclude sensitive folders via matcher.

---

## 7. Consumption Patterns (for external LLMs)
- **Summarization:** Ingest `markdown-changes.log` or `markdown-trace.log` as a rolling window; summarize by file, time, or change magnitude.  
- **Drift detection:** Flag high-churn files or repeated reversions in short intervals.  
- **Event correlation:** Pair `markdown-events.log` with trace logs to diagnose missed writes.  
- **Conversation grounding:** Use `codex/session/chat/transcript.md` to align system behavior with operator intent.

---

## 8. Roadmap
1. Add rotation and retention policy (size/time-based).  
2. Add tool invocation logging (`logs/tools.log`).  
3. Add audit surface (`logs/audit.log`) for consent/boundary checks.  
4. Add state-delta snapshots (`logs/state-delta.log`) keyed to State Substrate revisions.  
5. Add configurable redaction rules.  
6. Add VS Code task to append chat transcripts automatically when prompted.  
7. Add health checks (watcher heartbeat) and alerts if writes fail.

---

## 9. Current Status (Nov 30 2025)
- Markdown watcher active; shortstat + trimmed diffs written to `logs/markdown-changes.log` and `logs/internal/markdown-trace.log`.  
- Event pings written to `logs/internal/markdown-events.log`.  
- Manual conversation logging available via `scripts/update_conversation_log.py`.  
- Rotation/redaction/audit/tool logs pending.  
- All logs are plain text, human-readable, LLM-friendly, and portable without Git.
