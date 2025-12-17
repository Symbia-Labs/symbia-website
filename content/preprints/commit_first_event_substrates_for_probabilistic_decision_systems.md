---
title: Commit-First Event Substrates for Probabilistic Decision Systems
date: 2025-01-04
authors: Brian Gilmore
status: Preprint
tags: execution safety, probabilistic systems, event substrates
summary: How a commit-first event substrate (CEB) binds authority, time, and action before probabilistic systems run so we can replay, audit, and govern what happened.
---

# Commit‑First Event Substrates for Probabilistic Decision Systems

**Brian Gilmore**\
Symbia Labs\
Email: [brian@symbia-labs.com](mailto\:brian@symbia-labs.com)\
Google Scholar: [https://scholar.google.com/citations?user=hdqq7DUAAAAJ&hl=en](https://scholar.google.com/citations?user=hdqq7DUAAAAJ\&hl=en)\
LinkedIn: [https://www.linkedin.com/company/symbia-labs/](https://www.linkedin.com/company/symbia-labs/)\
X (Twitter): https\://x.com/Symbia\_labs

---

## Abstract

Modern probabilistic decision systems increasingly rely on inference‑time retrieval (e.g., RAG, CAG, long‑context prompting) to compensate for missing durable state. This practice introduces significant latency, token cost, and operational complexity, while obscuring accountability and failure modes. We argue that these costs are architectural rather than algorithmic: meaning is repeatedly reconstructed at inference time because it is never committed beforehand.

We present a **commit‑first event substrate**, a missing execution‑layer abstraction that records authoritative facts once, prior to inference, and supplies probabilistic and deterministic evaluators with minimal, cryptographically auditable abstractions. We describe the design and reference implementation of this substrate—the Canonical Event Bus (CEB)—including an append‑only, hash‑chained event log; rebuildable, non‑authoritative projections; adversarial decision evaluation; deterministic arbitration; explicit escalation to retrieval; and a separated control plane.

Through a proof‑of‑concept implementation and scale testing, we demonstrate low‑latency decisioning, elimination of hidden retrieval from the hot path, and post‑hoc auditability of system behavior. Our results suggest that commit‑first architectures can materially reduce inference‑time overhead in probabilistic systems while improving operational clarity and accountability.

---

## 1. Introduction

Probabilistic systems such as large language models are now routinely embedded in production decision loops: access control, alerting, workflow orchestration, safety gating, and agentic task execution. Despite rapid model improvements, the surrounding system architectures have converged on a costly pattern: repeatedly retrieving raw data at inference time to recover missing context.

Retrieval‑augmented generation and its variants are effective compensatory techniques, but they introduce first‑order costs—latency, token usage, infrastructure complexity—and second‑order costs: opaque failure modes, difficulty auditing decisions, and blurred responsibility boundaries. These costs scale with query frequency and corpus size rather than with the intrinsic complexity of decisions.

This paper asks a different question: **can meaning be committed once, before inference, such that most decisions never require raw data again?** We argue that answering this question requires a new execution‑layer abstraction, not better prompts or larger models.

Our contributions are:

1. We identify inference‑time retrieval as a symptom of a missing execution‑layer substrate.
2. We define the invariants of a commit‑first event substrate suitable for probabilistic systems.
3. We present CEB, a reference implementation embodying these invariants.
4. We evaluate CEB under load, demonstrating correctness, auditability, and performance characteristics.

---

## 2. Background and Motivation

### 2.1 Probabilistic Workers and Inference‑Time Cost

Probabilistic workers sample from distributions conditioned on provided context. They are fast and flexible, but epistemically fragile: they do not retain durable state across invocations. As a result, modern systems push state reconstruction into inference by retrieving documents, logs, or embeddings.

### 2.2 The Limits of Retrieval‑First Architectures

Retrieval‑first systems require models to infer authority, recency, relevance, and consistency inside the forward pass. Empirically, this leads to over‑contextualization, degraded accuracy ("lost in the middle"), and brittle prompt engineering. More importantly, retrieval‑first architectures obscure accountability: it is difficult to reconstruct what the system *knew* at decision time.

### 2.3 A Missing Layer

Traditional system primitives—write‑ahead logs, event sourcing, databases, and distributed ledgers—approximate parts of the needed functionality but collapse fact recording, state construction, and interpretation into a single substrate. None are designed to serve probabilistic decisioning directly.

---

## 3. Commit‑First Event Substrates

### 3.1 Definition

A commit‑first event substrate is an append‑only, identity‑bound, cryptographically auditable log whose purpose is to determine what is allowed to become part of a system’s history. Events are immutable envelopes containing identity, monotonic time, type, policy tags, and cryptographic hashes. Payloads are optional and external.

### 3.2 Invariants

The substrate enforces the following invariants:

- **Append‑only**: history cannot be rewritten.
- **Authority‑bound**: every event is signed by an attested writer.
- **Non‑derivative**: events are not recomputed from state.
- **Payload‑agnostic**: meaning is not embedded in storage.
- **Audit‑first**: integrity can be verified post‑hoc.

If the log can be deleted after projection, the substrate has failed.

---

## 4. Reference Implementation: Canonical Event Bus (CEB)

CEB is a reference implementation of the a commit‑first event substrate. It is presented as an instance of the abstraction, not the abstraction itself.

### 4.1 Event Envelopes

CEB events are serialized in canonical JSON, hash‑chained across segments, and validated at ingestion for schema conformance, size limits, and clock monotonicity.

### 4.2 Segmented Log and Integrity

The event log is segmented for durability and concurrency. Each segment participates in a continuous hash chain. A boot‑time audit verifies integrity and identifies corruption without halting the system.

---

## 5. Projections and Derived Views

Projections are rebuildable, non-authoritative views derived from the canonical event log. Their role is to transform an unbounded, append-only history into bounded abstractions that are admissible for decision-making.

### 5.1 Projection as Deterministic Abstraction

Formally, let the canonical event log be an ordered sequence E = \<e1, e2, …, en>. A projection P is defined as a deterministic function:

P = F(E1..k)

where E1..k is a prefix of the log and F is total, deterministic, and side-effect free. This constraint ensures that projections are reproducible, auditable, and invariant under replay.

Projections deliberately discard information. They are not summaries of meaning, but constraints on admissible action. Typical projections reduce the event stream to bounded state such as:

- the most recent event per key (recency),
- counters or accumulators,
- sliding windows over event counts or rates,
- boolean or enumerated policy flags.

### 5.2 Canonical Ordering and Incremental Reduction

Because the event log imposes a canonical total order, projections need not reason about causal ambiguity or concurrency. The projection function operates over a linearized history, allowing incremental reduction of the form:

Pk = F(Pk‑1, ek)

This permits efficient streaming computation and ensures that projection updates are monotonic with respect to log growth.

### 5.3 Keyed Access and Partitioned Projections

CEB projections are defined over explicit keys (e.g., subject, resource, policy domain), inducing a partition of the event stream into independent logical substreams. Formally, let K be a key space and let π\_k(E) denote the subsequence of events in E whose key equals k. Projections are typically evaluated per key:

P(k) = F(π\_k(E))

This structure enables constant-time access to decision-relevant state for a given key and prevents unrelated events from polluting the decision surface. Keyed access also bounds projection size and update cost, making decision latency independent of total log length.

### 5.4 Lattice-Structured Abstractions and Controlled Traversal

Many projections naturally form a partially ordered set under refinement. For example, boolean flags, counters, and windowed rates can be ordered by informational content or restrictiveness. We model this as a lattice (L, ≤), where lower elements represent coarser, more permissive abstractions and higher elements represent stricter or more informative ones.

Decision evaluation proceeds by traversing this lattice only as far as required to establish admissibility. Crucially, traversal is bounded and monotonic: the system may move upward (toward stricter constraints) but never downward or laterally into unrelated abstractions. This prevents unbounded search and avoids the combinatorial explosion typical of graph- or retrieval-based reasoning.

### 5.5 What Projections Encode (and What They Do Not)

Projections encode sufficiency, not explanation. They answer questions such as:

- Has a condition been satisfied?
- Is a threshold crossed?
- Has an authority asserted or revoked something?

They explicitly do not encode semantics, narratives, or latent meaning. Any ambiguity or insufficiency is surfaced as missing or stale projection state, triggering escalation rather than inference.

### 5.6 Intuition for Probabilistic Evaluators

From the perspective of a probabilistic evaluator, projections act as a low-entropy conditioning surface. Instead of conditioning on large, noisy corpora, the evaluator conditions on a small set of canonical facts and constraints. This reduces variance in downstream inference and shifts uncertainty from what happened to whether the available facts are sufficient to act.

Conceptually, this can be viewed as restricting the hypothesis space considered by the evaluator to those consistent with P. If uncertainty remains high under this restriction, the correct behavior is escalation rather than further generation.

### 5.7 Reconstitution, Searching, and Filtering

CEB projections replace three common inference-time operations—reconstitution, searching, and filtering—with deterministic, precomputed abstractions.

**Reconstitution.** In retrieval-first systems, models reconstruct the relevant state of the world by aggregating documents, logs, or memories at inference time. In CEB, reconstitution occurs once at commit and projection time: the system deterministically reduces the event stream into bounded state (e.g., latest grant, current counter, active flag). At decision time, no reassembly of history is required; the relevant state already exists as canon-derived projection.

**Searching.** Retrieval-based systems search over large corpora to locate potentially relevant information. CEB eliminates general search by enforcing keyed access: decisions are scoped to specific keys, and projections expose constant-time access to the relevant slice of state. This transforms an unbounded search problem into a direct lookup.

**Filtering.** Filtering is often performed implicitly by models or heuristics to discard irrelevant context after retrieval. In CEB, filtering is structural: only events admitted under authority and reduced by the projection function are visible to the decision arena. Irrelevant or superseded information is excluded by construction rather than filtered probabilistically.

Together, these shifts move work from inference-time heuristics into execution-time structure. For probabilistic evaluators, this means they no longer infer state by searching and filtering raw history, but instead operate over a constrained, canonical abstraction where uncertainty reflects genuine insufficiency rather than missing or mis-ranked information.

### 5.8 Staleness as an Explicit Dimension

Each projection carries an associated freshness bound. Let tp denote the time at which a projection was last updated and t the current evaluation time. If t − tp exceeds a configured bound Δ, the projection is considered stale and inadmissible for decisioning. This converts temporal uncertainty into a first-class control signal rather than an implicit modeling error.

A projection supervisor monitors lag and staleness and forces fail-closed behavior when bounds are exceeded.

## 6. Decision Arena and Adversarial Evaluation

### 6.1 Decision Arena

Decisions are made in a short‑lived, in‑memory arena that consumes projections only. The arena holds no durable state and never accesses raw payloads.

### 6.2 Evaluators

- **Deterministic evaluators** enforce rules, policies, and invariants.
- **Probabilistic evaluators** propose actions with calibrated confidence.

Evaluators are epistemically adversarial: independently optimized and non‑cooperative. This matters because decision failures in practice rarely arise from individual evaluators being incorrect, but from uncertainty or constraint violations being smoothed away through cooperation or averaging. By design, deterministic evaluators may block action even when probabilistic confidence is high, and probabilistic evaluators may force escalation even when no explicit rule is violated. Disagreement is therefore treated as a first‑class signal of insufficiency rather than a condition to be resolved internally, yielding decisions that are predictable, auditable, and conservatively correct by construction.

### 6.3 Deterministic Arbiter

A deterministic arbiter resolves evaluator outputs according to fixed policy: timeouts result in abstention; mixed signals follow explicit defaults; insufficient evidence triggers escalation.

This matters because, without a single, explicit arbitration point, decision systems tend to drift toward implicit negotiation between components. In such systems, confidence, heuristics, or partial agreement can silently override hard constraints, making it unclear why an action was ultimately allowed or blocked. The arbiter exists to prevent this collapse.

By centralizing resolution in a deterministic component, CEB ensures that the same inputs always yield the same outcome, independent of execution timing, evaluator ordering, or internal heuristics. For system builders, this provides a stable contract: changing behavior requires changing policy, not tuning models or inference parameters. For operators, it guarantees that every action, refusal, or escalation can be traced to an explicit rule rather than an emergent interaction.

In effect, the arbiter turns decisioning from a probabilistic negotiation into a governed execution step. Uncertainty is not resolved by additional reasoning, but by escalation. This preserves fail-closed behavior and makes termination an intentional outcome rather than an accidental one.

### 6.4 Grounded Use Cases

The Decision Arena simplifies and accelerates decision‑making in scenarios where the primary challenge is not reasoning over large corpora, but determining whether action is admissible given known facts.

**Access control and revocation.** In systems that manage credentials, permissions, or service access, decisions often depend on a small set of authoritative facts: issuance, revocation, and recent usage. With CEB, these facts are committed once and projected into minimal views (e.g., last‑revocation‑sequence, active‑grant flags). The Decision Arena can then allow or deny access without retrieval or interpretation, and automatically escalate only if projections are stale. This reduces latency and eliminates ambiguity about which version of policy or revocation state applied at decision time.

**Operational gating and automation.** Infrastructure workflows such as deployments, rollbacks, or incident response typically require checking whether prerequisite conditions have been satisfied (approvals granted, incidents cleared, thresholds crossed). These prerequisites can be expressed as committed events and simple projections. The Decision Arena evaluates admissibility directly against these projections, allowing automation to proceed immediately when conditions are met and fail closed when they are not. This avoids re‑parsing logs or tickets at inference time and makes every automated action auditable.

**Rate‑limited or policy‑bounded actions.** Many systems enforce limits such as quotas, cooldowns, or safety thresholds. These limits are naturally represented as counters or windows derived from committed events. By evaluating these projections directly, the Decision Arena can decide whether an action is allowed without reconstructing history or context. This simplifies enforcement logic, reduces processing overhead, and ensures that violations or escalations are triggered deterministically and consistently.

---

## 7. Retrieval as Explicit Escalation

Retrieval is treated as a loser’s bracket rather than a default execution path. It is invoked only when the available canonical abstractions are insufficient to establish admissibility, and each invocation is logged with explicit reason codes and quotas.

This matters because retrieval-first systems conflate uncertainty with opportunity: when facts are missing or ambiguous, the system attempts to reason harder by pulling in more context. In practice, this pushes cost, latency, and complexity into the most time-sensitive part of execution, while making it difficult to determine whether additional information actually changed the decision outcome.

By making retrieval an explicit escalation, CEB reverses this bias. The system must first demonstrate that action cannot be justified from committed facts and their projections alone. Only then is retrieval permitted, and its use is treated as an exceptional event rather than routine behavior. For system builders, this provides a clear accounting of when and why inference-time context reconstruction is required. For operators, it ensures that retrieval is attributable to specific insufficiencies rather than being silently absorbed into normal execution.

Most importantly, explicit escalation preserves fail-closed semantics. When abstractions are incomplete or stale, the system stops instead of speculating. Retrieval becomes a controlled extension of execution, not an implicit attempt to mask missing canon. This removes retrieval from the hot path and makes its impact on correctness, latency, and auditability directly observable.

---

## 8. Control Plane Separation

CEB is exposed via an application operations plane distinct from system operations and configuration planes. Capability‑scoped routing ensures that only authorized actors can append events or read projections.

---

## 9. Evaluation

### 9.1 Methodology

We implemented CEB as part of a local execution substrate and evaluated it using a synthetic load harness that appends events, updates projections, and issues decisions under varying load.

### 9.2 Results

We report results from a series of structured tests designed to exercise the core invariants of CEB and its extended execution-layer components. These tests include (i) integrity audits over segmented event logs using full hash-chain verification, (ii) projection rebuild tests in which all derived state is deleted and recomputed from the authoritative log, and (iii) failure-injection scenarios that deliberately induce projection staleness, log truncation, and segment rotation. For each scenario, we record whether the system fails closed, escalates appropriately, and preserves auditability. Representative audit artifacts include complete `events.ndjson` log segments, derived head summaries (sequence number, last hash, last timestamp), and explicit escalation records annotated with reason codes. Together, these tests demonstrate that observed system behavior matches the formal integrity, rebuildability, and escalation properties described in Sections 9.3–9.5.

Under sequential and moderate concurrent load, CEB sustained approximately 2,000 events per second on commodity hardware, with sub-10 ms p95 ingest latency and sub-10 ms p95 decision latency. Retrieval escalation occurred only under deliberately induced projection staleness. Hash-chain audits passed under segment rotation and rebuild.

### 9.3 Cryptographic Integrity Checks (Log Audit)

CEB’s primary correctness property is **tamper evidence** of the committed event history. Each committed event envelope includes a cryptographic digest `hash` and a backward pointer `prev_hash` forming a one-dimensional hash chain. Let `E_i` denote the i-th committed event in commit order (equivalently, increasing `seq`). Define a canonical serialization operator `canon(·)` that produces a unique byte string for any event map under a fixed key ordering and encoding.

Define the event digest as:

- `h_i = H(canon(E_i with the hash field omitted))`, where `H` is a cryptographic hash function (e.g., SHA-256).
- Chain constraint: `E_i.prev_hash = h_{i-1}` for all `i > 1`.

**Audit algorithm.** Given an ordered stream of events, verify:

1. **Canonical hash recomputation:** recompute `h_i` and confirm `h_i == E_i.hash`.
2. **Chain continuity:** confirm `E_i.prev_hash == h_{i-1}` for all `i>1`.
3. **Commit order monotonicity:** confirm `E_i.seq` is strictly increasing (or contiguous if policy requires).
4. **Timestamp monotonicity (policy):** confirm non-decreasing `E_i.ts` (or bounded skew per configuration).

**Security argument.** Under standard assumptions of collision resistance and second-preimage resistance of `H`, an adversary who modifies, deletes, or reorders any committed event will (except with negligible probability) cause the audit to fail at the first modified position. This reduces integrity verification to a single linear pass over the committed history.

**Operational representation.** A compact head summary can be stored as derived state containing the last committed sequence number, last hash, and last timestamp, enabling quick consistency checks and incremental verification; e.g., a derived head may record fields such as `seq`, `last_hash`, and `last_ts`. fileciteturn5file5

### 9.4 Projection Correctness Checks (Rebuildability and Consistency)

Projections are explicitly **non-authoritative** and must be rebuildable from the authoritative log. A projection `P` is correct if it equals the output of a deterministic function `F` applied to a prefix of the event stream: `P = F(E_1..E_k)`.

We validate projection correctness via:

- **Rebuild test:** delete projection artifacts and rebuild from the event log; the rebuilt projection must match a clean recomputation of `F` over the log prefix.
- **Event-reference consistency:** each projection entry that claims a latest event reference (e.g., `seq`, `ts`, `type`, `hash`) must correspond to an actual committed event with identical values.

For example, the *recency* projection stores for each key the latest `(seq, ts, type, hash, payload_ref)` tuple (illustrated by entries that include `seq`, `ts`, `type`, `hash`, and `payload_ref`). fileciteturn5file10

### 9.5 Escalation Semantics (Fail-Closed Under Staleness)

Decisions are made from projections under explicit freshness constraints. Let `age(P)` denote projection staleness at decision time (e.g., `now - P.updated_at`). If `age(P)` exceeds its configured bound, the system must fail closed by refusing to act on potentially stale abstractions.

Formally, for a decision request `D` evaluated at time `t`:

- If `age(P) <= Δ` (freshness threshold), proceed to evaluator arbitration.
- Else, emit an **escalation event** with a reason code (e.g., `projection_stale`) and do not execute irreversible effects.

This rule makes staleness a first-class, auditable cause of retrieval/escalation rather than an implicit source of incorrect actions.

## 10. Auditability and Failure Handling

Auditability in CEB is not an auxiliary feature but a consequence of its execution model. Because facts are admitted under authority, fixed in canonical order, and made immutable, every downstream decision can be reconstructed from first principles. Post-hoc analysis does not rely on probabilistic explanations, sampled logs, or inferred intent, but on replaying the exact canonical history and the deterministic projections derived from it.

This matters operationally because many system failures are only diagnosable after the fact, under partial information and time pressure. In retrieval-first or inference-heavy architectures, it is often unclear whether an incorrect action resulted from missing data, stale context, heuristic overrides, or model behavior. CEB avoids this ambiguity by ensuring that every action, refusal, or escalation corresponds to an explicit state of canon and a specific evaluation rule.

Failure handling follows the same principle. When projections are stale, incomplete, or inconsistent, CEB does not attempt to compensate by reasoning harder or broadening context. Instead, it fails closed and emits an explicit escalation event. This makes failure a visible and auditable outcome rather than an implicit degradation of correctness. Operators can distinguish between failures caused by insufficient information and failures caused by violated constraints, and can respond accordingly.

Together, these properties make failure modes predictable and bounded. The system either acts with traceable justification or stops with an explicit reason. This sharply reduces the class of silent or emergent failures and enables independent verification of system behavior without access to internal model state.

---

## 11. Discussion

### 11.1 When Commit-First Is Sufficient

Commit-first abstractions are sufficient in decision contexts where the admissibility of an action can be determined from a finite set of authoritative facts and monotone constraints, rather than from semantic interpretation or open-ended reasoning. Formally, let E be the canonical event sequence and let P = F(E\_{1..k}) be a projection derived from a finite prefix of E. If the decision predicate D(P) is total and deterministic—i.e., for all admissible projections P, D(P) ∈ {ALLOW, DENY, ESCALATE}—then the system can decide without retrieval.

In practice, this class includes decisions based on existence, order, and threshold properties: whether a credential has been issued and not revoked, whether an approval occurred after a given checkpoint, whether a counter or rate exceeds a policy bound, or whether a prerequisite event has been observed. These properties are computable from projections that are bounded in size and updated incrementally, making decision cost independent of the total history length.

For non-specialist readers, the intuition is simple: when the question is "has the system already seen enough to act?", not "what does this information mean?", committing facts once and projecting them forward is sufficient. Additional context does not change the answer; it only adds cost. In these cases, commit-first execution replaces repeated interpretation with a fixed check against established canon, yielding faster, cheaper, and more predictable behavior.

Commit-first abstractions suffice for existence checks, authority validation, temporal ordering, threshold enforcement, and gating decisions.

### 11.2 When Retrieval Is Required

Semantic interpretation, explanation, and creative synthesis require raw data and are explicitly routed to slower paths.

### 11.3 Limitations

CEB introduces upfront ingestion cost and requires careful schema and projection design. It does not eliminate retrieval universally.

### 11.4 Reference Implementation and Extensions

An open-source implementation of the core CEB primitives is available and intentionally minimal, focusing on the canonical event log, hash-chained integrity, and rebuildable projections. The system evaluated in this work extends those core primitives with additional execution-layer components, including policy-driven decision arenas, staleness supervision, explicit escalation semantics, and operational control-plane separation. The results reported here therefore reflect the behavior of an extended CEB-based system rather than the minimal core alone.

We view this separation as a feature rather than a limitation. By keeping the core primitives small and opinionated, CEB is intended to support a variety of extensions and testing harnesses. We explicitly encourage independent implementations and extensions that explore alternative designs, threat models, and operational trade-offs, particularly with respect to security, privacy, and reliability.

### 11.5 Scope and Non-Claims

This work does not propose a new learning algorithm, model architecture, or consensus protocol. We do not claim to eliminate retrieval or to provide a universal memory system for probabilistic models. Instead, we isolate an execution-layer abstraction that commits facts prior to inference and makes retrieval an explicit escalation path. The contribution is architectural: clarifying a boundary between fact commitment, decisioning, and interpretation that materially affects cost, auditability, and failure behavior.

## 12. Related Work

**Tamper-evident audit logs and transparency systems.** Prior work on secure and tamper-evident logging establishes append-only, cryptographically verifiable histories using hash chains or Merkle-tree–based structures. Examples include secure audit logs for forensics and compliance, and public transparency logs such as Certificate Transparency and modern software supply-chain transparency systems. These systems share integrity primitives with our approach, but typically position logs as post-hoc evidence rather than as execution-layer substrates that gate decision-making.

**Event sourcing and write-ahead logging.** Event sourcing and WALs record sequences of events to recover or maintain system state. While these approaches preserve ordering and durability, they generally subordinate the log to a state machine and do not treat events as first-class, authoritative facts for probabilistic decisioning.

**Retrieval-augmented generation and ML systems.** Retrieval-augmented architectures compensate for stateless inference by reconstructing context at decision time. Our work is complementary: we reframe retrieval as an explicit escalation path by committing meaning before inference, thereby reducing reliance on inference-time reconstruction.

**Distributed ledgers.** Blockchains and related systems provide strong immutability guarantees via consensus. CEB adopts similar integrity discipline without global consensus, targeting local-first execution substrates rather than adversarial networks.

## 13. Conclusion

Commit‑first event substrates reframe probabilistic systems from retrieval‑centric to commitment‑centric. By recording meaning before inference and enforcing adversarial sufficiency testing, such substrates reduce inference‑time cost while improving accountability.

### Plain‑English Example: Improving Local LLM Decisions with OLLAMA

Consider a local deployment using OLLAMA to run a language model that assists with operational decisions, such as whether to execute an administrative action, approve a workflow step, or respond to an incident. In a retrieval‑first setup, the model is repeatedly prompted with logs, configuration files, and recent history so it can reconstruct the current state of the system. This reconstruction step is expensive, brittle, and error‑prone: the model must search, filter, and interpret raw text on every invocation, and small differences in retrieved context can change outcomes.

With CEB, the same system offloads canon collection to the execution layer. Authoritative events—such as approvals, revocations, threshold crossings, or prior actions—are committed once to the canonical log and reduced into simple projections (e.g., "latest approval", "current error rate", "revocation active"). When OLLAMA is invoked, the model no longer needs to infer state from raw logs. Instead, it conditions on a small, explicit set of canonical facts provided by the projections.

For the model, this changes the task from reconstructing history to deciding whether the available facts are sufficient to act. More importantly, CEB acts as an execution boundary that limits the model’s agency to canonical, admissible facts. Authority, ordering, and immutability are enforced outside the model, preventing it from reasoning over revoked, stale, or unauthorized state. When canonical information is insufficient, the model is not asked to compensate through additional reasoning; instead, escalation is enforced. This shifts failure modes from speculative inference to explicit refusal or escalation, aligning probabilistic reasoning with the domains where it is appropriate and reliable. If they are, the model can proceed with high confidence and low variance. If they are not, the correct response is escalation rather than speculation. For operators, this yields faster responses, lower compute cost, and clearer explanations of why an action was taken or refused. In effect, CEB shifts work that models are poor at—searching, filtering, and reconciling history—into deterministic infrastructure, allowing local probabilistic systems like OLLAMA to focus on judgment rather than reconstruction. CEB demonstrates the feasibility and benefits of this approach.

---

*Draft for journal submission; subject to revision.*
