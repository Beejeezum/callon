# Key Rotation

Covers location/contact encryption keys, share-token pepper, webhook secrets, Supabase keys, provider keys, and Netlify secrets.

- Maintain versioned application encryption keys; ciphertext records include `key_version`.
- Deploy code capable of reading old and new versions before re-encryption.
- Write new data with the new key; re-encrypt in bounded, auditable batches.
- Verify counts and decryptability using synthetic records; never log plaintext.
- Retire old keys only after backup/restore and rollback windows are resolved.
- Token pepper rotation invalidates or version-rotates share links by documented decision.
- Rotate immediately after suspected exposure.
