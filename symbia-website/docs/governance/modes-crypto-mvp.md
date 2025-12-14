# Modes + Crypto MVP (mission: symbia.seed.modes_crypto_mvp.001)

This document captures the governance/crypto parameters wired into the Seed MVP for mode-aware enforcement, audit behavior, and snapshot retention.

## Crypto primitives
- Signatures: ed25519 via `cryptography`.
- Hashes: sha256 for envelopes and fingerprints.
- Fingerprints: HMAC-SHA3-512 over RFC8785-style canonical JSON, label `SYMKEY_DERIVATION_V1`.

## Modes (creative | autonomous | restricted)
- Creative: unrestricted LLM/tools; FS read/write rooted at `project/`; net outbound allow_nonprod; shell disabled unless explicitly flagged; derive session-only keys; artifacts allowed nonportable; audit not required.
- Autonomous: LLM allowed; tools mission_governed; FS read/write rooted at `project/`; net outbound allowlist; shell allowlist only; derive actor keys; artifacts projection_only; audit required with blocking surfaces (fs_write, net_mutating, shell, key_mgmt).
- Restricted: LLM read_only; tools read_only; FS read-only; net read_only_allowlist; shell disabled; no key derivation; artifact writes disabled; audit required and blocks all surfaces.

## Audit behavior on failure
- Creative: warn.
- Autonomous: block fs_write, net_mutating, shell, key_mgmt; warn otherwise.
- Restricted: block and mark degraded.

## Snapshot retention
- Per-identity max: 50; per-mission max: 10; minimum retention: 7 days; pinning allowed.

## Access
- Config lives under `governance` in `daemon/core/config/system.yaml` and is exposed at `/governance/config`.
- Helper APIs: see `core/governance.py` for canonical JSON, fingerprinting, mode checks, and audit policy lookup.
