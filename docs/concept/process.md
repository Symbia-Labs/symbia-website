# Process

This document describes how Symbia turns its premise into a working system using existing tools: Git, VS Code, LLMs (ChatGPT/Codex), and logs.

At this stage, Symbia is less a single binary and more a **coordination pattern** across these components.

---

## 1. Git as Temporal Backbone

Git provides:

- A **time-ordered event stream** of changes (commits, diffs, branches).
- The ability to reconstruct any prior state of the workspace.
- A natural place to attach semantic meaning to changes (messages, tags).

Symbia treats Git as the **chronological backbone** of cognition:

- Every meaningful edit (docs, code, notes) becomes part of a time series.
- Breakthroughs, decisions, and checkpoints can be aligned to commits.
- The system can “rewind and replay” a cognitive trajectory, not just files.

In effect, Git is the low-level **cognitive trace store**.

---

## 2. VS Code as Spatial Workspace

VS Code provides:

- A structured **file and folder hierarchy** (projects, docs, logs, mvp/).
- A rich UI where the user naturally organizes their work.
- Extension hooks (and Git integration) for automation and instrumentation.

Symbia uses VS Code as the **spatial map** of the user’s thinking:

- Directories like `docs/`, `mvp/`, `notes/`, and `logs/` act as cognitive regions.
- Files (whitepapers, specs, logs) are containers for different layers of abstraction.
- The project tree becomes the externalized “mind map” of Symbia’s understanding.

The combination of Git + VS Code gives us **time × structure**.

---

## 3. LLMs as Local Reasoning Engines

LLMs (ChatGPT, Codex, etc.) provide localized, stateless reasoning:

- Generating text, code, and structure.
- Refactoring, summarizing, and transforming content.
- Acting as “reasoning accelerators” on demand.

On their own, they:

- Do not remember prior sessions reliably.
- Have no durable identity beyond prompt scaffolding.
- Cannot coordinate across tools without additional structure.

Symbia’s stance:

- **LLMs are interchangeable engines**, not the center of the system.
- The core value is in how we **constrain and contextualize** them:
  - Which files they see.
  - Which logs they read and write.
  - How their outputs are anchored to the time-structured workspace.

---

## 4. Logs as Cognitive Traces

The `/logs` directory (e.g. `/logs/internal`, `markdown-changes.log`, `breakthroughs.md`) functions as a **higher-order trace**:

- `markdown-changes.log` → Lightweight record of what changed, when.
- `breakthroughs.md` → Human/AI-curated log of key conceptual jumps.
- `decisions.md` → Explicit documentation of commitments.
- `open-questions.md` → Running list of unresolved points.

These logs form the **semantic layer** on top of raw Git history:

- Git tells us *what changed* and *when*.
- Logs tell us *what it meant* and *why it mattered*.

Symbia’s cognitive model can be reconstructed from the combination.

---

## 5. Coordination Pattern (Current State)

Right now, the “Symbia process” looks like:

1. **User works in VS Code**  
   Editing docs, code, specs, notes.

2. **LLM assists on demand**  
   Generating drafts, refactors, summaries, and structured docs.

3. **Git & logs capture the trace**  
   - Every save/commit becomes part of the historical record.  
   - Logs capture breakthroughs, decisions, and questions.

4. **Symbia interprets the trace** (conceptually)  
   - Identifies patterns, themes, and shifts in the work.  
   - Maintains a notion of current focus and priorities.

5. **Future state**  
   - Symbia will directly read/write these traces,  
     not just rely on the user to mediate them.

---

## 6. Persona Mirroring

- Persona config lives in `docs/identity/persona.md`; no hardcoded personality.
- Changes to persona should log to `logs/cognitive/persona-deltas.log` for auditability.
- Workers read persona before acting to mirror tone, cadence, constraints, and formatting preferences.
- Drift/over-rotation detection compares outputs against persona preferences and logs deltas.

---

## 7. What This Buys Us

This process layer gives Symbia:

- A **time-resolved view** of cognition (via Git).
- A **structured spatial map** of concepts and artifacts (via VS Code).
- A set of **reasoning engines** it can call into as needed (LLMs).
- A set of **semantic overlays** (logs) to interpret what matters.
- A **persona-aware voice** that stays aligned with the operator while remaining auditable.

This is how Symbia moves from “stateless chat” to **persistent, beholder-centric cognition** without reinventing the entire stack from scratch.
