# Identity key update quickstart

Fast path for attaching a user symbikey payload to an identity envelope and re-signing it via `/identity/update`.

## Prereqs
- API running (`./scripts/seed.sh boot`) with genesis keys present in `${STATE_DIR}/keys/` (`genesis.pub.pem`, `genesis-private.pem`).
- A valid envelope JSON that already passes schema checks (see `docs/identity/updating.md` for requirements).
- Symbikey payload text (plaintext, not base64).

## One-shot call
```bash
ENVELOPE=path/to/envelope.json   # input envelope
SYMBIKEY=path/to/symbikey.txt    # plaintext symbikey payload
API=${SEED_API_URL:-http://127.0.0.1:8123}

curl -s -X POST "$API/identity/update" \
  -H "Content-Type: application/json" \
  -d @"<(jq -n \
      --argjson env "$(cat "$ENVELOPE")" \
      --arg symbikey "$(cat "$SYMBIKEY")" \
      '{envelope:$env, symbikey_payload:$symbikey}')"
```
- Response: canonical envelope JSON with `Content-Disposition` filename like `org.personal...<timestamp>.<hash8>.identity-core.symkey`.
- Audit: trace event recorded in `logs/cognitive-trace.log` with requester, fingerprints, and envelope hash.

## What happens
- Verifies `derivation_proof.parent_fingerprint_hash` against local genesis.
- Verifies incoming signature using genesis pubkey, then re-signs with genesis private key.
- Computes symbikey fingerprint, updates filename `hash8`, refreshes timestamps, and returns the signed envelope.

## Health checks & debugging
- Validation errors: HTTP 422 with pydantic errors; signature or parent hash mismatch: HTTP 400.
- Missing keys: HTTP 500 with `missing_genesis` or `missing_private_key`.
- Run tests: `pytest tests/test_identity_update.py -k happy` (uses fixture envelopes).

For deeper behavior and guardrails, see `docs/identity/updating.md`.
