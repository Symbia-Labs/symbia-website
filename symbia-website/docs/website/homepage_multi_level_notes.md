# Homepage multi-level copy rationale

## Levels
- **Level 1 (neighbor)**: Plain language, no acronyms, focus on “memory, receipts, proof.” Short sentences.
- **Level 2 (frontier enthusiast)**: Light jargon with brief explanation; stakes and continuity emphasized.
- **Level 3 (practitioner)**: Current-strength copy; execution-layer framing, APIs, traces, canon->abstraction->artifact.
- **Level 4 (conference speaker)**: Architectural vocabulary (GKS/OEP, canon, policy routing); concise, not academic.
- **Level 5 (conference contrarian)**: Explicit assumptions/tradeoffs; GKS/OEP terms; falsifiability and constraints surfaced.

## Section notes
- **Hero (all three audiences)**: L1-2 avoid acronyms; L3 keeps current stance; L4-5 surface GKS/OEP, policy-bound routing, provenance.
- **Why Symbia**: L1-2 “black box/no proof”; L3 continuity gap; L4-5 explicitly contrast transports vs. substrate and mention epistemic contracts.
- **Who We Are**: L1-2 mission/vision in plain terms; L3 execution layer; L4-5 substrate/identity/epistemic framing with values.
- **Symbia Seed**: L1-2 “local version” language; L3 canonical runtime; L4-5 add GKS/OEP, SSE traces, deterministic writes.
- **What you can do**: L1-2 “guides vs. run with us”; L3-5 map to open specs vs. full runtime.
- **Docs & API**: L1-2 highlight viewer and explorer; L3-5 enumerate key endpoints and artifacts.
- **Continuity primitives**: L1-2 “building blocks”; L3-5 identity/epistemics/governed routing articulated.
- **Early surfaces**: L1-2 “don’t lose the thread”; L3-5 surface canon/routing/artifact integrity and lineage.
- **Pillars**: L1-2 “stay you, stay explainable”; L3-5 map to identity/epistemics/execution/observability.
- **Process**: L1-2 “boot, log, replay”; L3-5 add endpoints, genesis/identity, SSE traces, constraints/drift.
- **Developers**: L1-2 “run locally, see everything”; L3-5 add endpoints, governance, deterministic writes, identity snapshots.
- **Under the hood**: L1-2 “rules and records”; L3-5 OEP/trace/identity/continuity primitives with increasing explicitness.

## Implementation notes
- Canonical content stored in `content/homepage_multi_level.yaml` (and JSON for runtime use).
- Runtime pulls `content/homepage_multi_level.json`; level is selected via existing level overlay/pills.
- DOM elements are mapped with `data-copy` attributes to section/field; defaults to level 3 if unset.
