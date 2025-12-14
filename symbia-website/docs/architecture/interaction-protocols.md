

## Key Topic Schema & Subscription Model
All live key data is expressed under:
  symbia/keys/<key-id>/

Fields map directly from YAML to retained broker topics. Example:
  traits/empathy → symbia/keys/human-01/traits/empathy
  constraints/max_token → symbia/keys/actor-web/constraints/max_token

Subscribers include:
- actor workers
- observers
- mission runners
- cognitive trace logic

Key updates republish modified fields; subscribers adapt without restart.
