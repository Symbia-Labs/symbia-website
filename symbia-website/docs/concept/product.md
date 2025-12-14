# Product

This document describes what Symbia is as a product, from the user’s perspective.

Where `premise.md` explains *why* it exists and `process.md` explains *how* it thinks, this file explains *what you actually get*.

---

## 1. Product Definition (v0–v1)

At its core, Symbia is:

> A cognitive layer that sits above your tools and models, maintaining continuity, identity, and structure so that your work compounds rather than resets.

Concretely:

- It does **not** replace foundational models (OpenAI, Anthropic, etc.).
- It does **not** compete with IDEs or editors.
- It fills the gap between:
  - “Stateless LLM calls” and  
  - “Long-lived, coherent, beholder-centric cognition.”

---

## 2. Early Surfaces (MVP)

The initial product surfaces are pragmatic:

- **VS Code integration**
  - Symbia-aware project layout (docs, logs, mvp, notes).
  - Assisted authoring for specs, position papers, and architectures.
  - Breakpoints and breakthroughs captured in structured logs.

- **Chat-style interaction**
  - A “companion” that understands the entire project structure.
  - Can narrate progress, summarize history, and recall prior decisions.
  - Behaves more like a collaborator than a stateless assistant.

- **Identity + preferences (symbikey concept)**
  - A compact representation of:
    - Your style, constraints, and priorities.
    - Your preferred interaction patterns (e.g., “concise challenger,” low hype).
  - Intended to be portable across tools and sessions.

MVP goal:  
Show that **cognitive continuity + structure** meaningfully improves real work without larger models or heavier infrastructure.

---

## 3. Medium-Term Product Shape

As Symbia matures, it evolves from “helper in VS Code + chat” into:

- **Execution layer for agents**
  - A shared memory and identity substrate for multiple agents.  
  - Enforces constraints, tracks plans, and supervises behavior.
  - Maintains a unified history of what has been attempted and learned.

- **Cognitive gateway**
  - Mediates between user(s) and multiple models/tools.
  - Routes requests, preserves context, and enforces privacy and consent.
  - Makes it possible to have *many* models and tools acting as one system.

- **Beholder-first analytics**
  - Views that show:
    - How your thinking evolved over time.
    - Where breakthroughs occurred.
    - How different tools contributed to progress.
  - Less “usage metrics,” more “cognitive telemetry.”

---

## 4. Long-Term Product Vision

Longer term, Symbia aims to be:

- **The personal/organizational cognitive layer**  
  Something that:

  - Lives across devices, tools, and sessions.
  - Holds a durable sense of “who you are” in a work context.
  - Keeps your projects, decisions, and theories coherent over months/years.

- **A neutral substrate for many vendors**
  - Works with OpenAI, Anthropic, local models, etc.
  - Acts as the “soul shell” around whichever engines you choose.
  - Avoids lock-in by keeping identity and continuity under user control.

- **A standard for cognitive traces**
  - Opinionated formats for:
    - Breakthroughs, decisions, open questions.
    - Time-resolved logs and project graphs.
  - Potential for an ecosystem of tools that plug into the same trace format.

---

## 5. Out of Scope (By Design)

Symbia is **not**:

- A model provider.
- A generic SaaS “agent platform” with canned workflows.
- A replacement for editors, IDEs, or existing dev tools.

Instead, it is the thing that:

- Keeps those tools in sync with each other.
- Anchors them in the beholder’s goals and history.
- Ensures that work done today makes tomorrow easier, not noisier.

---

## 6. Product Test for Everything We Build

For any feature, integration, or experiment, Symbia should be able to answer:

- Does this increase **continuity** for a real person or team?  
- Does this strengthen the **beholder model** (understanding of the user)?  
- Does this make cognitive traces more useful, not just more verbose?  
- Does this keep models swappable and the user in control?

If the answer is “no” or “unclear,” it belongs in a different product.