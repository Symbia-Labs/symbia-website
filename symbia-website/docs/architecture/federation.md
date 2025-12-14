# Federation: Seed-to-Seed Collaboration

## Goals
- Treat each Seed as a first-class peer: self-contained, policy-enforcing, local-first.
- Enable Seeds to exchange events/frames/plans in a controlled, auditable way.
- Preserve locality of state; no shared mutable state across Seeds.
- Keep Processor deterministic and local; only Actors execute irreversible effects.

## Event Envelope
```
SeedEvent {
  id: string
  source_seed: string
  target_seeds: [string] | "*"
  type: string              # e.g., intent, plan-request, state-summary
  payload: object
  policy: object            # optional ACL/policy hint
  reversible: boolean       # irreversible = actor-only domain
  signature: string         # optional; for auth/integrity
  timestamp: ISO8601
}
```

## Transport
- Preferred: MQTT with mutual auth (mTLS) and topic ACLs.
- Topics: `seed/{id}/events`, `seed/{id}/logs`, `seed/{id}/collab`.
- Alternative: HTTPS (SSE/Webhooks) with signed tokens.

## Roles & Auth
- Each Seed has an identity (keypair or cert) and role map.
- Remote seeds are treated as principals; ACLs per topic/event type.
- Observers/Interpreters can be mapped to roles (treated like users).

## Pipeline (Local Spine)
```
Observer.capture() -> Event
Interpreter.normalize(Event) -> SemanticFrame
Processor.evaluate(SemanticFrame, State) -> Plan    # deterministic, no I/O
Actor.execute(Plan) -> Effect                       # irreversible allowed here
```
- Processor stays minimal: policy/context/memory only; no generative I/O.
- Actors enforce reversibility flags; irreversible effects are logged locally.

## Cross-Seed Handling
- Inbound events from other Seeds enter via federation router:
  - Validate auth/ACLs, rate limits, reversible flags.
  - Route into Interpreter → Processor → Actor as allowed.
- Outbound events:
  - Processor/Actor emit `SeedEvent` (e.g., request-plan, share-state).
  - Policy-first: default deny for remote actor effects unless explicitly allowed.

## State & Logs
- Each Seed retains its own cognitive-trace/logs.
- Sharing is via explicit export events (summaries, not raw state) unless permitted.
- No shared mutable state; consistency via event exchange.

## Plugin Boundaries
- Observer plugins: may subscribe to remote streams (read-only).
- Interpreter plugins: normalize remote intents/frames.
- Processor plugins: policy/context/memory only (deterministic).
- Actor plugins: execute locally authorized plans; may refuse remote requests.
- All plugins declare `worker`, `reversible`, `metadata` for enforcement.

## Discovery & Routing
- Minimal: static list of peer Seeds and credentials.
- Optional hub/gateway for discovery and routing; event envelope unchanged.
- Federation router mediates remote events into the local spine.

## Safety & Trust
- Mutual auth (mTLS or signed tokens) for broker/HTTP.
- Topic/event ACLs per remote seed; rate limits/quotas.
- Reversibility flag enforced: irreversible = actor-only domain, local policy.

## UI/Observability
- Expose `SeedEvent` ingress/egress in observability stream.
- Allow admin view of connected Seeds, ACLs, and recent cross-seed events.

