# ACT-R Mapping

(Stub)
# ACT-R Mapping  
How Symbia Aligns With the ACT-R Cognitive Architecture

This document maps Symbia’s cognitive model to ACT-R (Adaptive Control of Thought–Rational), a foundational cognitive science framework for modeling human cognition. The goal is not to replicate ACT‑R, but to align Symbia’s execution‑layer primitives with well-established cognitive functions.

---

## 1. Overview

ACT-R models cognition as multiple specialized modules coordinated by a central production system.  
Symbia’s architecture mirrors this structure at the systems level:

- **Identity Graph ↔ Declarative Memory**
- **Continuity Engine ↔ Working Memory / Buffers**
- **State Machine ↔ Procedural Memory (Production Rules)**
- **Interaction Protocols ↔ Perceptual / Motor Modules**
- **Constraint Model ↔ Conflict Resolution / Control Parameters**

Symbia is not a cognitive model, but a cognitive *execution layer*.  
This mapping clarifies where Symbia enforces behavior that LLMs cannot maintain on their own.

---

## 2. ACT-R → Symbia Mapping Table

| ACT-R Component | Function | Symbia Equivalent | Notes |
|-----------------|----------|------------------|-------|
| **Declarative Memory** | Stores facts & experiences | **Identity Graph** | Long-lived, structured, queryable; persists across sessions and devices |
| **Working Memory / Buffers** | Active task context | **Continuity Engine** | Holds evolving context, short-term but persistent across turns |
| **Procedural Memory (Productions)** | Rules controlling behavior | **State Machine** | Explicit execution flow; constraints enforce predictable action |
| **Perceptual Modules** | Interpret external input | **Input Pipelines** | Normalizes user messages, metadata, context, and sensor data |
| **Motor Modules** | Generate actions | **Tool & System Integrations** | Deterministic, supervised execution with auditability |
| **Conflict Resolution** | Selects next rule | **Constraint + Safety Model** | Defines priorities, overrides, and guardrails |
| **Learning Mechanisms** | Adapts memory and production utility | **Adaptive Identity Graph + Trace Learning** | Continuous refinement of user model and reasoning traces |

---

## 3. Why ACT‑R Matters for Symbia

ACT-R demonstrates that cognition emerges from **multiple persistent memory systems**, not a stateless predictive loop.

Symbia embraces three validated principles:

### 3.1 Cognition requires persistent declarative memory  
LLMs cannot store durable semantic knowledge about a user or workflow.  
Symbia’s **Identity Graph** solves this.

### 3.2 Cognition requires active, stable buffers  
Context windows approximate a buffer but reset constantly.  
Symbia’s **Continuity Engine** maintains evolving task-state.

### 3.3 Cognition requires rule-based constraints  
LLMs “guess” their next action.  
Symbia’s **State Machine** makes action selection deterministic.

---

## 4. Architectural Alignment

### ACT-R:  
Information moves between modules through *buffers*; productions fire when buffer patterns match.

### Symbia:  
- The Continuity Engine acts as the buffer substrate.  
- The State Machine provides production-rule equivalents.  
- The Constraint Model resolves conflicts and ensures guardrails.  
- The Identity Graph provides long-lived patterns and referential grounding.

Together these replicate the *control structure* of ACT-R—without reinventing the cognitive science.

---

## 5. Extensions Beyond ACT-R

Symbia expands where ACT-R is limited:

- **Multi-Agent Coordination**  
  ACT-R models one mind; Symbia models networks of cognitive actors.

- **Cross-Device Synchronization**  
  Buffers and declarative memory persist across interfaces, apps, and sessions.

- **LLM-Driven Perception**  
  Input interpretation is richer than classical perceptual modules.

- **C-OATH Identity Layer**  
  Adds security, consent, and identity portability absent in ACT-R.

---

## 6. What This Enables

This mapping allows Symbia to:

- Ground each user interaction in cognitive science  
- Provide explainable and auditable reasoning  
- Build long-horizon plans  
- Maintain a stable sense of “self” across tasks  
- Enable multi-agent distributed cognition  
- Offer a familiar framework for academic collaborators

---

## 7. Status

This is the **v0.1 canonical version** of the ACT‑R mapping.  
Updates will follow as the architecture matures.