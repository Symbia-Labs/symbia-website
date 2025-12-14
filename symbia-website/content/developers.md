# Developers
- Eyebrow: Developers
- H2: Build on a local, observable execution layer.
- Boot flow: `./scripts/seed.sh start` -> API on 127.0.0.1:8123; Observer UI on 9000.
- Core endpoints: /health, /status, /event, /trace, /log/stream (SSE), /project/file, /edit, /threads/* for sessioned work.
- Missions map canon -> abstraction -> artifact; log with /event or /trace; replay via /log/stream.
- Deterministic identity via Genesis/Symbia Key; probabilistic epistemics via OEP. All logs fsync locally.
- Multi-surface governance: API, Observer UI, CLI, and docs viewer all render governed artifacts with the same lineage and obligations envelope.
