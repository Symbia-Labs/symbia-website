# Genesis Security Model (alpha1)

Purpose:
- Prove provenance of the root identity file (`$SYMBIA_STATE_DIR/keys/genesis.json`, default `~/.symbia-seed/keys/genesis.json`) and block tampering.
- Derive local/system/user keys only from a verified genesis.

Mechanism:
- Signed genesis: `${STATE_DIR}/keys/genesis.json` + `${STATE_DIR}/keys/genesis.sig` (sshsig) + `${STATE_DIR}/keys/genesis.pub` (OpenSSH pubkey). If missing on first run, the daemon copies the shipped `daemon/keys/*` into `${STATE_DIR}/keys/`.
- Verification uses `ssh-keygen -Y verify` on startup; the result surfaces in `/status.genesis_verify` and `python3 daemon/symbia.py key verify`. Current alpha builds log failures but do not block startup.
- CLI `python3 daemon/symbia.py key verify` reports sha256 and signature status.
- Strict mode: set `SYMBIA_STRICT_GENESIS=1` to fail key derivation if verification fails (raises).

Operational steps:
- Private key stays with the author (e.g., `~/.ssh/symbia-genesis`, perms 600 or hardware token). Never commit it.
- Ship only `genesis.json`, `genesis.sig`, `genesis.pub`.
- Sign with: `ssh-keygen -Y sign -f ~/.ssh/symbia-genesis -n symbia -I symbia-genesis $SYMBIA_STATE_DIR/keys/genesis.json`.
- Verify with: `python3 daemon/symbia.py key verify`.

Trust outcomes:
- Supply-chain: detects modified genesis before runtime.
- Identity integrity: derived keys are anchored to the verified genesis; tampering fails startup.
- IP/authorship: signature ties genesis to the author’s key; fingerprints can be displayed to users.
- Copy protection: builds or forks without your signed genesis fail verification, making it clear when code is reissued without your provenance; any redistributed genesis must either carry your signature or expose that it was altered.

Rotation/remediation:
- Issue a new pubkey + signature; distribute with the release.
- If a key is compromised, refuse old keys and require the new pubkey/signature at startup.
- Enforcement note: startup currently continues even if verification fails (e.g., missing genesis). Treat `/status.genesis_verify.ok=false` as a security warning until enforcement is enabled.
- Derivation note: local/user keys are ed25519 pairs generated locally; fingerprints use HMAC-SHA3-512 over canonical JSON (label `SYMKEY_DERIVATION_V1`) bound to genesis/install/policy hashes. Private PEMs are stored under `${STATE_DIR}/keys/` with 0600 perms.

## Portability and updates
- Genesis updates: any change to `genesis.json` must be re-signed; ship `genesis.json` + `genesis.sig` + `genesis.pub` together. Update the pinned hash in code/docs. Startup verification blocks mismatched or stale files.
- Derived keys: system/user/symbikeys are deterministic from verified genesis + install id. After a new signed genesis is accepted, you can re-derive deterministically or version derivation by epoch to make the transition explicit.
- Symbikey portability: treat private halves as secrets; store them in OS keychain/secure enclave or on hardware. If you export/import a symbikey bundle, sign the bundle and verify on import against the active genesis. Never commit private material.
- Plain-text JSON: identity JSON is public metadata (like a certificate). Integrity and provenance come from signatures; secrecy comes from file permissions or encrypted storage for any private parts.

## Deriving and verifying the first keys
1) Verify genesis hash and signature: `python3 daemon/symbia.py key verify` (must show both OK).
2) Derive install/local/user keys: run any keys entrypoint, e.g.:
   ```bash
   python3 - <<'PY'
   from core.keys import ensure_keys, _read_json, INSTALL_PATH, LOCAL_PATH, USER_PATH
   ensure_keys()
   print(_read_json(INSTALL_PATH))
   print(_read_json(LOCAL_PATH))
   print(_read_json(USER_PATH))
   PY
   ```
   This writes `${STATE_DIR}/keys/install.json`, `${STATE_DIR}/keys/local.json`, `${STATE_DIR}/keys/user.json` after verifying genesis.
3) Inspect: `python3 daemon/symbia.py key inspect` lists genesis metadata and derived key paths.
4) Enforce strict genesis during derivation: `SYMBIA_STRICT_GENESIS=1 python3 - <<'PY' ... PY` (raises if `verify_genesis_signature` fails).

## User data protection (policy)
- Repo hygiene: the repo carries only genesis/signature/public assets; no user data is ever committed. User data stays local on the installed machine.
- Default local-only: context/log indexing is local; no data leaves the machine unless explicitly enabled.
- Storage location: user data should live in a user-owned path (e.g., `~/.symbia/…`) with restrictive perms; avoid storing private data in the repo tree.
- Integrity: genesis verification guards identity; sign any exported user bundles so imports can verify provenance.
- Confidentiality (to implement): encrypt at rest for context/log stores using a key derived from the user symbikey + passphrase (keychain/secure enclave), and offer a “privacy mode” that logs only metadata.
- Access control (to implement): gate private-data endpoints with a local auth token derived from the user key; separate networked components from data-processing workers.
- Redaction: minimize payload logging; prefer summaries over raw inputs. Offer secure deletion and key rotation with re-encryption.

## Roadmap for user data security
### Storage layout
- Move sensitive artifacts (context DB, secure logs) under `~/.symbia/` (0700). Keep the repo clean of user data. Non-sensitive telemetry can remain in the workspace if desired.

### Encryption at rest (phase 1)
- Derive a data key from the user symbikey + passphrase; wrap it and store only the wrapped key. Keep the plaintext data key in memory only.
- Encrypt the context store (FTS/SQLite) and “secure logs.” For plaintext logs, append encrypted lines instead.
- Store the passphrase in OS keychain/secure enclave if available; otherwise prompt on start.

### Privacy mode
- Default to metadata-only logging (no payloads). Require explicit enablement for full payload logging.
- Expose mode in UI/CLI and allow toggling; persist locally (not in repo).

### Access control
- Require a local auth token derived from the user key for endpoints that return private data.
- Isolate networked components (e.g., model relay) from data-processing workers; deny network by default to data workers.

### Export/import
- Exports: encrypt to the user key and sign the bundle; include the active genesis fingerprint.
- Imports: verify signature, decrypt, and re-encrypt to the local key; refuse mismatched genesis/keys.

### Rotation/erasure
- Support key rotation with re-encryption of at-rest data.
- Provide secure deletion for context/log stores on user request.

### User-selected monitoring
- Monitoring inputs are user-configured in `config/user.yaml` (`monitoring.logs`, `monitoring.globs`, `monitoring.pids`, `monitoring.ports`).
- Only configured sources are ingested into the context index; defaults remain local-only.
- Monitoring results surface in telemetry (`monitor` lane) and stay local; privacy mode governs payload handling.
