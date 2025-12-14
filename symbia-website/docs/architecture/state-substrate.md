# State Substrate

The **State Substrate** is the foundational persistence layer of Symbia — the minimal continuous structure that allows an LLM to behave like a stable cognitive system rather than a stateless prediction engine.

It is the layer that maintains:
- identity-coherent state,
- cross‑interaction memory,
- temporal continuity,
- constraints,
- semantic grounding,
- and interaction history.

This document defines the conceptual model, data structures, and requirements for the State Substrate.

---

## 1. Purpose

LLMs do not retain state.  
Every message is a fresh invocation with no durable memory.

The State Substrate provides:
1. **A persistent state graph** that survives across all sessions and modalities.  
2. **Temporal traceability** — the ability to reason over time.  
3. **Stable commitments** — constraints, preferences, and agreements the agent must honor.  
4. **Contextual continuity** — accumulated understanding that guides interpretation.

The substrate is **not** a database, cache, or vector store.  
It is a **semantic fabric** that supports cognition-like behavior.

---

## 2. Core Components

### 2.1. Identity Anchor
A stable root node tying all state to a specific user/agent.

Fields:
- `identity_id` (UUID)
- `registered_modalities` (chat, sms, voice, api)
- `signature_traits` (cognitive, behavioral)
- `consent_scope`
- `symbikey_reference`

Purpose:  
Ensures every state update attaches to a persistent "self".

---

### 2.2. Temporal Ledger
A time-indexed sequence of durable updates.

The ledger stores:
- contextual inferences,
- preference changes,
- commitments made,
- corrections,
- retractions,
- contradictions,
- "breakpoints" explicitly created by the user,
- emotional/tonal shifts (if consented),
- system‑detected drifts.

Format:
```
{
  timestamp: ISO8601,
  event_type: "preference_update" | "insight" | "correction" | "boundary" | "drift",
  data: { ...semantic payload... }
}
```

The ledger is immutable; only appended.

---

### 2.3. Working State Map
A compact, queryable "active state" generated from the ledger.

Categories:
- **Profile State**
  - personality
  - voice/cadence preferences
  - cognitive style (e.g., synthesizer)
  - risk tolerance
  - expressiveness vs conciseness
  - automation vs collaboration preference

- **Contextual State**
  - current session intent
  - active project
  - inferred short-term goals

- **Constraint State**
  - must / must‑not behaviors
  - interrupt handling rules
  - drift correction thresholds
  - over‑rotation sensitivity

- **Relational State**
  - ongoing collaborators (humans or agents)
  - project-specific identities
  - multi-modal mappings (chat ↔ sms ↔ email)

Updated continuously from the ledger.

---

### 2.4. Semantic Memory Store
A structured store of:
- canonical knowledge the user has declared ("this is important"),
- persistent preferences,
- important distinctions (e.g., “don’t overrotate,” “avoid AI-slop tone,” “Brian’s canonical voice model”),
- named breakpoints,
- canonical documents or schemas referenced often.

This is **not** RAG.  
This is curated, high‑semantic memory.

---

## 3. Update Rules

### 3.1. Append Only
All changes—explicit or inferred—enter via the temporal ledger.

### 3.2. Confidence Grading
Every update carries a confidence weight:
- explicit statements = 1.0  
- corrections = 1.2 (override)
- inferred patterns = 0.3–0.7  
- system‑detected drifts = 0.5  

### 3.3. Contradiction Resolution
If contradictory updates occur:
- explicit > inferred  
- newer > older (unless overwritten explicitly)  
- project‑local > global  

A contradiction triggers:
1. state reconciliation,
2. a "clarification needed" prompt (unless user opts out),
3. or silent resolution if confidence difference > threshold.

---

## 4. Queries

The substrate must support:
- **pull queries** (LLM requests state fragments)
- **push queries** (substrate injects relevant state automatically)
- **temporal queries** (“what changed between X and Y?”)
- **drift detection queries** (“has the model deviated from voice constraints?”)
- **profile queries** (“which traits are stable? which are recent?”)

---

## 5. Persistence Requirements

The substrate must persist across:
- sessions
- devices
- modalities
- model versions
- agent instantiations

It must be:
- encrypted at rest,
- decryptable only with the symbikey,
- exportable & portable,
- user‑ownable (user holds the master key),
- versioned.

---

## 6. Extensibility

The substrate is designed to support future layers:
- Embodied cognition (biometric integrations)
- Collaborative cognition (multi-user shared substrate spaces)
- Symbikey-based distributed identity
- Multi-agent continuity
- Local compute augmentation (edge substrate)

---

## 7. Summary

The State Substrate is the minimal layer required to convert a prediction engine into something capable of:
- stable identity
- memory over time
- coherent behavior
- bounded autonomy
- long-horizon collaboration
- user-centered cognition

Without the substrate, Symbia would behave like any other stateless agent.  
With it, Symbia becomes a persistent cognitive partner.