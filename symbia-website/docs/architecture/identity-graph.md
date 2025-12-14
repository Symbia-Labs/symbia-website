
# Identity Graph

The Symbia Identity Graph defines how a user’s cognitive profile, preferences, constraints, roles, and interaction history are represented as a structured, typed multigraph.  
It is the backbone of continuity, personalization, and cross-surface coherence.

---

## 1. Purpose

The identity graph exists to:

- preserve long‑horizon context  
- enable adaptive behavior across interfaces  
- support drift detection  
- enforce constraints and boundaries  
- allow safe, user-controlled expansion of identity over time  
- maintain a stable “self model” for the agent

Symbia does not embed identity inside prompts or sessions — identity lives here, as an explicit, inspectable structure.

---

## 2. Identity Graph Structure

Identity is represented as a directed, typed multigraph:

```
[User Node] ←→ [Self Model Node] ←→ [Role Nodes]
      ↓                 ↓                ↓
[Preferences]     [Constraints]     [Contexts]
      ↓                 ↓                ↓
   [Traits]        [Boundaries]     [Surfaces]
```

Each node type is defined below.

---

## 2.1 User Node

The root of the identity graph.

### Attributes
- declared name (optional)
- stable user‑id (hash)
- creation timestamp
- consent ledger reference
- symbikey seed reference

### Edges
- `HAS_SELF_MODEL` → Self Model Node  
- `HAS_ROLE` → one or more Role Nodes  
- `HAS_PREFERENCE` → Preference Nodes  
- `HAS_CONSTRAINT` → Constraint Nodes  

---

## 2.2 Self Model Node

Symbia’s model of “who the user is becoming” based on cumulative interaction.

### Attributes
- cognitive tendencies  
- reasoning style  
- communication style  
- drift score (calculated)
- confidence (per dimension)
- pattern embeddings (opaque, non-reversible)

### Edges
- `INFLUENCES` → Preference Nodes  
- `MODIFIES` → Role Nodes  
- `DETECTS_DRIFT` → Boundaries  

The self-model improves with exposure but never expands without explicit user consent.

---

## 2.3 Role Nodes

Roles represent *situational identity fragments* — who the user is in a particular context.

Examples:  
- “Builder”  
- “Founder”  
- “Researcher”  
- “Strategist”  
- “Explorer”  

### Attributes
- role name  
- activation conditions  
- confidence score  
- example triggers  
- recent interactions  

### Edges
- `ACTIVE_IN` → Context Nodes  
- `USES` → Preference Nodes  
- `RESPECTS` → Constraint Nodes  

---

## 2.4 Preference Nodes

Preferences represent stable or semi-stable user tendencies.

### Types
- communication  
- cognitive  
- stylistic  
- strategic  
- pacing  
- collaboration  

### Attributes
- value  
- strength  
- volatility index  

### Edges
- `DERIVED_FROM` → Interactions  
- `MODIFIED_BY` → Self Model Node  

---

## 2.5 Constraint Nodes

Constraints impose rules the system must obey.

### Types
- safety  
- boundaries  
- tone control  
- refusal conditions  
- red/amber/green zones  

### Attributes
- strictness  
- inheritance scope  
- interaction-level overrides  

### Edges
- `ENFORCES` → Surfaces  
- `LIMITS` → Role Nodes  

---

## 2.6 Context Nodes

Context Nodes model the environments where interactions occur.

### Examples
- “VC conversation prep”
- “Personal reflection”
- “Technical architecture”
- “Spec writing mode”

### Attributes
- context name  
- semantic embedding  
- recency score  
- horizon (short/medium/long)  

### Edges
- `HAS_SURFACE` → Surfaces  
- `ACTIVATES_ROLE` → Role Nodes  

---

## 2.7 Trait Nodes

Traits reflect *stable identity characteristics* discovered over time.

Examples  
- “Synthesizer”  
- “Concise challenger”  
- “High-context thinker”  
- “Systemic pattern matcher”  

### Attributes
- trait name  
- evidence count  
- confidence  
- drift factor  

### Edges
- `INFORMS` → Self Model Node  
- `MODERATES` → Preferences  

---

## 2.8 Boundary Nodes

Boundaries define what *must not drift too far*.

Examples:  
- avoid hype language  
- avoid over-rotation  
- avoid performative tone  
- maintain analytical balance  

### Attributes
- boundary definition  
- tolerance  
- detection method  
- enforcement strategy  

### Edges
- `WATCHES` → Self Model Node  

---

## 2.9 Surface Nodes

Surfaces represent *where* Symbia interacts with the user.

Examples:  
- SMS  
- VS Code plugin  
- Chrome extension  
- Web chat  
- Mobile app  

### Attributes
- modality  
- latency budget  
- display constraints  
- verbosity settings  

### Edges
- `USES_PREFERENCES` → Preferences  
- `ENFORCES_CONSTRAINTS` → Constraints  

---

## 3. Graph Operations

### 3.1 Expansion
New nodes may be added only with explicit user approval:
- new roles  
- new preferences  
- new contexts  
- new traits  

### 3.2 Compression
The graph compresses stale or low-confidence nodes automatically.

### 3.3 Drift Detection
Compare:
- last-stable self-model  
- current vector of traits/preferences  
- contextual deltas  

Raises drift alerts to the constraint layer.

### 3.4 Serialization
Graph can serialize to:
- JSON (internal)
- Symbikey capsule (portable)
- Signed incremental patches  

### 3.5 Privacy
All identity content:
- encrypted client-side  
- decrypted only when needed  
- never used for training  
- never shared without explicit consent  

---

## 4. Example (Simplified)

```
User
 ├── Self Model
 │     ├── Traits: Synthesizer, Challenger
 │     ├── Drift Score: 0.08
 │     └── Pattern Embedding: hash(…)
 │
 ├── Roles
 │     ├── Founder
 │     └── Researcher
 │
 ├── Preferences
 │     ├── Tone: neutral/precise
 │     ├── Pacing: fast iteration
 │     └── Structure: low-fluff, high-signal
 │
 ├── Constraints
 │     ├── No hype
 │     ├── Clarity > enthusiasm
 │     └── Avoid over-rotation
 │
 └── Contexts
       ├── VC-prep
       └── Architecture-design
```

---

## 5. Status

This identity graph is a living specification.  
Future updates:  
- richer edge semantics  
- temporal weighting  
- context inheritance  
- multi-surface synchronization logic  