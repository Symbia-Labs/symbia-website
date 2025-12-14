# Credibility
- Eyebrow: Credibility
- H2: Real artifacts, not mockups.
- Swagger/OpenAPI: assets/openapi.yaml (info.version 0.2) powers api.html. Key endpoints: /health, /status, /event, /trace, /log/stream, /project/file, /edit.
- Trace excerpt (cognitive-trace-schema): `{"timestamp":"2025-12-02T03:00:00Z","event":"trace","summary":"mission.run","meta":{"worker":"supervisor","mission":"demo.mission"}}`
- Demo flow: `./scripts/seed.sh start` -> POST /event or /trace to log canon -> GET /log/stream to watch SSE -> Observer UI shows canon -> abstraction -> artifact.
- GKS/OEP showcase: Genesis Key fingerprints + Symbia Key constraints surface in /status and identity snapshots; OEP claims keep probabilistic reasoning explicit.
- OEP obligations envelope (example): obligations (cite_sources, mark_hypotheses); refusals (missing_provenance, user_constraints_violation); epistemic_types (claim, hypothesis, observation, refusal); envelope includes sha256 evidence hash + genesis_key_fingerprint lineage.
