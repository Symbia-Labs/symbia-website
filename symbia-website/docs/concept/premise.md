# Premise

Symbia starts from a different assumption than most of today’s AI tooling.

The core premise is that **intelligence is always relative to a beholder** (a person, team, or organization) and their goals, not a property of a model in isolation. What matters is not how “smart” a single response looks, but how coherent the overall behavior is over time for that specific beholder.

This gives us three foundational ideas.

---

## 1. The Beholder Model

AGI is in the eye of the beholder.

For any given person:

- **Usefulness** = how well the system tracks *their* goals, constraints, preferences, and history.
- **Trust** = how well the system behaves consistently with *their* expectations.
- **Intelligence** (as perceived) = how well the system uses context over time to reduce friction and increase clarity for *them*.

Symbia treats the user’s cognitive state, not the model weights, as the primary thing to preserve and optimize.

---

## 2. Cognitive Cohesion

Most current AI interactions are “brilliant in bursts, incoherent in aggregate.”

Large models can produce individually impressive answers, but:

- They forget prior reasoning steps.
- They lack a stable notion of “self” or role.
- They do not maintain a unified narrative of the work.
- They cannot reliably connect today’s answer to last week’s context.

Symbia is anchored on **cognitive cohesion**:

- Preserving the “train of thought” over time.
- Maintaining continuity across tools and artifacts.
- Making each new interaction part of a growing, coherent whole.

---

## 3. Continuity Over Scale

Today’s ecosystem is anchored to the idea that *scale* is the main lever:

> Bigger models + more data + more compute → more intelligence.

Symbia assumes that beyond a certain capability floor, the scarce resource is not model size but **continuity**:

- Who is this conversation for?
- What has already been decided?
- What has been tried and failed?
- How do we reconcile new information with old assumptions?
- How do we keep the system aligned with the same beholder over time?

A moderately powerful model inside a strong continuity architecture is more valuable than the strongest model with no memory, no identity, and no structure.

---

## 4. What Symbia Optimizes For

Given this premise, Symbia optimizes for:

- **Personal continuity**  
  A stable sense of “you” across sessions, tools, and artifacts.

- **Structural memory**  
  Breakpoints, logs, decisions, and breakthroughs captured in a way that can be revisited, reused, and audited.

- **Context-efficient cognition**  
  Using the *minimum* necessary context to reason well, not re-deriving the same understanding over and over.

- **Beholder-centric evaluation**  
  Measuring success by how well the system serves this specific beholder’s goals, not by generic benchmark scores.

This premise layer is what justifies the rest of Symbia’s architecture and product decisions.