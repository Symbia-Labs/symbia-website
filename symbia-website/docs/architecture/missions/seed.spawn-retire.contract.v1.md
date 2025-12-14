# Mission: seed.spawn-retire.contract.v1 (2025-12-10.A)

Owner: symbia  
Priority: highest  
Objective: canonical, cryptographically and epistemically secure spawn/retire contract for child seeds (workers), with signed manifests, signed Last Wills, strict TTL, constraint inheritance, OEP/GKS alignment, supervisor/runtime/governance wiring, and adversarial tests.

## Canonical schemas

### Spawn Manifest — `manifest_version=seed.spawn.v1`
- `seed_id` (string) — child seed id.  
- `parent_seed_id` (string) — spawning seed id.  
- `anchor_id` (string) — concept/mission anchor.  
- `mode` (`ephemeral|durable`) — runtime profile.  
- `role` (string) — narrow task/role (e.g., `docs.indexer`).  
- `info_budget` — `{ scope: on-topic|exploratory, notes: string }`.  
- `constraints` — `{ anchor_hash: sha256, parent_hash: sha256, policy_hash: sha256, extra: [strings] }`.  
- `capabilities` — `{ fs: [strings], net: [strings], shell: [strings], providers: [strings] }`. Default deny outside these lists.  
- `handoff_channel` (`trace|concept_inbox`) — primary Last Will delivery path.  
- `ttl` — `{ created_at: ISO8601, expires_at: ISO8601 (> created_at) }`. Hard bound; extensions require a new manifest/signature.  
- `lineage` — `{ install_id: string, genesis_fingerprint: string, parent_key_fingerprint: string }`.  
- `key_binding` — `{ child_key_fingerprint: string, key_role: string }` (e.g., `seed_ephemeral`).  
- `oep` — `{ version: string, policy_profile: string }`.  
- `mission_id` (string) — mission this seed fulfills.  
- `actor_id` (string) — principal/tenant on whose behalf this seed acts.  
- `policy` — `{ confidentiality: string, redact: [strings] }`.  
- `resource_limits` — `{ max_tokens: int, max_calls: int, max_wallclock_seconds: int }`.  
- `runtime_context` — `{ host_id: string, namespace: string }`.  
- `signature` — `{ signer: symbikey:fingerprint (parent), algo: ed25519, payload_hash: sha256(canonical manifest), sig: base64 }`. Signature covers the canonicalized manifest minus `signature`.

### Last Will — `manifest_version=seed.retire.v1`
- `seed_id`, `parent_seed_id`, `anchor_id`, `mode`.  
- `manifest_hash` — sha256 of canonical spawn manifest.  
- `status` (`retired|expired|failed`).  
- `retired_at` (ISO8601).  
- `summary` (string).  
- `deltas` (array) — each `{ epistemic_type: "retrieved|inferred|hypothesis|unknown", confidence: 0–1, content: string, provenance: string, support: [strings] }`.  
- `open_questions` (array of strings).  
- `governance` — `{ violations: [strings], unknowns_disclosed: bool, oep_compliant: bool }`.  
- `artifacts` — each `{ path: string, sha256: string, encrypted_to: symbikey:fingerprint, channel: "trace|concept_inbox" }`.  
- `heartbeat_last` (ISO8601).  
- `lineage` — `{ install_id: string, genesis_fingerprint: string, child_key_fingerprint: string }`.  
- `reconstitution` — `{ reconstituted_from_seed_id: string|null }`.  
- `signature` — `{ signer: symbikey:fingerprint (child), algo: ed25519, payload_hash: sha256(canonical last will), sig: base64 }`. Signature covers canonicalized Last Will minus `signature`.

### Canonicalization and signing
- Use the existing canonical JSON function from governance/fingerprint logic (sorted keys, stable formatting).  
- `payload_hash = sha256(canonical_json_without_signature_block)`.  
- Sign `payload_hash` with ed25519 from `daemon/core/keys.py`.  
- Spawn: signer must equal `parent_key_fingerprint`; retire: signer must equal `child_key_fingerprint`.  
- Store manifests in `~/.symbia-seed/missions/<seed_id>.json`; Last Wills in `~/.symbia-seed/missions/<seed_id>.last_will.json` (configurable via state dir/config). Runtime layout: parent state dir now carries `children/seed-<short>-<role>-<anchor>[-tmp]/` with `manifest.json`, `last_will.json`, `meta.json`, `logs/`, `artifacts/`, `inbox/`.

## Enforcement wiring

### Supervisor (spawn + TTL)
- Load manifest (disk/payload), validate schema/required fields.  
- Canonicalize, recompute `payload_hash`, verify against embedded hash; verify signature using `parent_key_fingerprint`.  
- Verify `genesis_fingerprint` and `install_id` match local Seed.  
- Enforce TTL: reject expired manifests; no in-place TTL edits. Watchdog tracks `expires_at`, terminates and marks `expired` on breach.  
- Enforce capability ceilings (e.g., net/shell allowed per system policy); reject if manifest asks beyond local policy.  
- Inject `capabilities`, `constraints`, `oep`, `resource_limits`, `key_binding` into runtime context; initialize heartbeat_seq and trace sequence.  
- Refuse spawn on invalid signature, wrong signer role, genesis mismatch, TTL invalid, or missing fields.

### Runtime/governance (per-call + heartbeats)
- Default deny: fs/net/shell/providers must match allowlists on each call via governance checks.  
- Constraints: runtime carries `constraints.anchor_hash|parent_hash|policy_hash` + `oep.policy_profile`; governance blocks drift or violation.  
- Heartbeats: emit `{ seed_id, parent_seed_id, heartbeat_seq, last_event_seq, constraints.*, ttl.expires_at }`. Supervisor validates hashes; anchor/policy hash drift → pause/retire; parent_hash change → immediate retire/fail. Gaps/out-of-order heartbeats logged for audit.

## Retire, crash, reconstitution

### Normal retire
- Child gathers summary, deltas, open_questions, governance status, artifact metadata (hash every artifact; write only to mission dir or allowed anchor inbox).  
- Build Last Will, canonicalize, sign with `child_key_fingerprint`, include `manifest_hash` + lineage.  
- Parent loads Last Will, validates schema, recomputes `payload_hash`, verifies signature, ensures `manifest_hash` matches spawn manifest, checks TTL/retired_at, verifies artifact hashes.  
- Append retire event (sequence-numbered) to trace/reflection with `manifest_hash` + Last Will hash; apply deltas only after verification.

### Crash and forensics
- No Last Will → mark `failed`; no state updates.  
- Optionally spawn a read-only forensic seed: manifest references crashed `seed_id` + `manifest_hash`, capabilities limited to read-only, writes only its own Last Will with `epistemic_type=forensic_insight`.

### Reconstitution
- To resume, require verified prior spawn manifest + Last Will.  
- New spawn manifest includes lineage link (`reconstituted_from_seed_id` in Last Will) and hashes of prior manifest/Last Will.  
- Treat as fresh spawn; no hidden mutable state sharing. Branching allowed; each child declares lineage.

## Telemetry and audit
- Sequence-numbered events for spawn/heartbeat/retire in `logs/cognitive-trace.log` + reflection.
- Include `manifest_hash`, `last_will_hash`, signer fingerprints, decision codes (accept/reject with reason).
- Metrics: counts of spawn rejects (signature/ttl/capability), retire rejects (signature/hash), heartbeat drift alerts.

## API and runtime hooks (implemented)
- `/seeds/spawn/verify` — validate a `seed.spawn.v1` manifest (signature, TTL, genesis/install, capabilities). Logs reflection event `spawn.verify`.
- `/seeds/heartbeat/verify` — validate heartbeat against manifest constraints + expected sequence. Logs `heartbeat.verify`.
- `/seeds/retire/ingest` — validate a `seed.retire.v1` Last Will against its manifest (signature, hashes, TTL; optional artifact hash check) before ingestion. Logs `retire.verify`.
- Supervisor: accepts optional `spawn_manifest` per worker in config; verifies before launch and stops workers when TTL expires, logging `spawn.accept|spawn.reject|retire.ttl`.

## Config snippet (example)
```yaml
workers:
  llm:
    enabled: true
    module: "core.workers.llm_worker"
    type: "actor"
    spawn_manifest: "missions/llm.spawn.json"  # path relative to repo root or absolute
```
`spawn_manifest` must point to a parent-signed `seed.spawn.v1`; supervisor refuses to launch if missing/invalid.
When accepted, supervisor writes child state under `STATE_DIR/children/seed-<short>-<role>-<anchor>[-tmp]/manifest.json` and keeps `meta.json` updated on stop/ttl.

## Test plan (high-level cases)
- Happy path: valid manifest → spawn → heartbeats → valid Last Will → applied deltas.
- TTL expiry: short TTL; watchdog kills; post-expiry Last Will rejected/flagged.
- Capability enforcement: attempt out-of-allowlist actions blocked; changing capabilities requires new manifest.
- Tampered manifest: mutate field without resigning → spawn rejected; wrong genesis/install → rejected.
- Tampered Last Will: mutate content or manifest_hash → retire rejected.  
- Hash mismatch: change anchor_hash/policy_hash in heartbeat → pause/retire; change parent_hash → immediate fail.  
- Wrong signer: manifest signed by non-parent → reject; Last Will signed by non-child → reject.
- Forensic flow: crash → no state updates; forensic seed read-only; its Last Will accepted/logged.
- Reconstitution flow: prior manifest + Last Will required; new seed links lineage; no implicit state reuse.
- Test harness note: pytest uses FastAPI’s in-process TestClient, so log lines show `http://testserver/...` for spawn/retire/heartbeat endpoints; they exercise the real handlers, just without a bound port.
