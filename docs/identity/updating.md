# Identity envelope update recommendations

This note outlines how to attach the provided `symbia_identity` envelope to a supplied user symbikey payload and re-sign it for
distribution via the implemented `POST /identity/update` endpoint.

## Where to integrate
- **Endpoint surface**: implemented in `daemon/core/app.py` as `POST /identity/update`, next to the governance/config handlers.
  The handler expects `{"envelope": <dict>, "symbikey_payload": <str>}` and returns the canonicalized envelope JSON with
  `Content-Disposition` set to the finalized filename.
- **Key material**: the endpoint loads the genesis public/private keys from `${STATE_DIR}/keys/` (e.g., `genesis.pub.pem` and
  `genesis-private.pem`). Network-supplied signing keys are rejected.

## Recommended flow
1. **Parse + lint envelope**: the endpoint parses the JSON document into `SymbiaIdentityEnvelope` and enforces
   `metadata.schema == "symbikey.identity-envelope.v1"` plus size/placeholder checks for latent fingerprints and signatures.
2. **Derivation proof verification**:
   - Requires `derivation_proof.algorithm == "symbia-gks-derivation-v1"`.
   - Verifies `parent_fingerprint_hash` matches a SHA-256 hash of the local genesis fingerprint.
   - Verifies the submitted `derivation_proof.signature` using the genesis public key over the canonical envelope minus the
     signature field.
3. **Attach provided symbikey text**: the plaintext symbikey payload is fingerprinted (SHA-256) but never embedded. The first
   eight hex characters (`hash8`) update `filename_metadata.parsed.hash8`, and the full fingerprint is recorded as
   `derivation_proof.symbikey_fingerprint`.
4. **Re-sign the envelope**: the canonicalized envelope (with updated hash8) is signed using the genesis private key and the
   resulting base64 signature is stored in `derivation_proof.signature`. `metadata.updated_at` and the filename timestamp are
   refreshed to the current `time_ns`.
5. **Audit trail**: each request appends a trace event with requester, symbikey fingerprint, parent fingerprint hash, envelope
   hash, and success/failure reason.
6. **Response**: returns canonical JSON for the envelope with a `Content-Disposition` filename such as
   `org.personal.bmg-t0.v1.<timestamp_ns>.<hash8>.identity-core.symkey`.

## Validation helpers to add
- **Canonical fingerprinting**: governance canonical JSON is used for envelope hashing/signing to guarantee deterministic
  fingerprints for identical logical content.
- **Latency guardrails**: `latent_fingerprint.bytes` is limited to 4 KiB (base64-decoded) and placeholders are rejected.
- **Strong typing**: `SymbiaIdentityEnvelope` enforces required sections (`metadata`, `filename_metadata`, `derivation_proof`,
  `user_parameters`, `system_parameters`, `latent_fingerprint`).

## Sample acceptance criteria
- Posting the sample envelope plus the symbikey text returns a signed envelope with a matching `hash8`, validated derivation
  proof, and an audit event recorded.
- Submissions with mismatched parent fingerprint or schema name are rejected with a 4xx and audited.
