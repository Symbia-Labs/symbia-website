## Actor Architecture (Draft)

Actors in the Rust Seed will run as supervised tasks driven by:
- missions (ordered + priority)
- key-derived entitlements
- embedded broker messaging

Each actor subscribes to relevant broker topics and publishes:
- events
- trace deltas
- validation callbacks

Supervisor enforces lifecycle, restart strategy, and safety floor.
