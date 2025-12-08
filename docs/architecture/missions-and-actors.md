# Missions & Actors (Conceptual Draft)

This document captures the emerging conceptual model for how Symbia will coordinate work across multiple reasoning engines, tools, or “LLM personas,” without committing to an implementation. It preserves the thread for future design.

---

## 1. Actor Taxonomy

Symbia distinguishes Actors by functional role, not personality:

### 1.1 Observers
- Watch external signals (logs, UI events, browser context, code changes).
- Produce structured observations.
- Never mutate state directly.

### 1.2 Interpreters
- Convert observations into meaning.
- Detect contradictions, drift, or missing context.
- Attach priorities, severity, or confidence weights.

### 1.3 Processors
- Apply transformations (summaries, diffs, structural rewrite suggestions).
- Prepare data for execution.

### 1.4 Executors (Workers)
- Perform irreversible actions (writes, mutations, commands).
- Change system state or artifacts.
- Must be constrained by order and priority semantics.

---

## 2. Mission Structure

A Mission defines a multi-step collaborative task between Actors.

### 2.1 Order
A deterministic sequence:

steps:
  - interpret
  - validate
  - execute
  - verify

### 2.2 Priority
Priority resolves conflicts or race conditions:
- competing outputs
- contradictory deltas
- simultaneous updates

Example priorities:
observer=30, interpreter=50, processor=70, executor=100

### 2.3 Validations
Each step may define validation rules:
- schema checks
- consistency checks
- contextual integrity
- identity/memory constraints

---

## 3. Mission Lifecycle

1. Initiate
2. Resolve Roles
3. Run Ordered Steps
4. Resolve Conflicts (priority)
5. Emit Logs (events, diffs, traces)
6. Completion callback

---

## 4. How Missions Fit Into the Seed

Missions are:
- Declarative JSON/YAML files
- Executed by the Seed Supervisor
- Logged via markdown + cognitive trace
- Compatible with swapping ChatGPT or Codex as runtime Actors

ChatGPT desktop app = interpretation + synthesis.
Codex = execution + code work.
External agents = observers/processors.

---

## 5. Future Directions

- Cross-seed distributed missions
- Subkeys-scoped multi-agent collaboration
- TSDB-backed mission timelines
- Actor scoring (latency, reliability)
- Self-optimizing mission templates

---

## Status
Concept-only draft capturing current design thread.