# Task 08 — One-to-One WhatsApp Assistant (P1, Disabled by Default)

## Preconditions

P0 sharing loop works; Meta business setup, privacy text, opt-in, templates, and costs approved.

## Work

Implement verified Meta webhooks, idempotent receipts, quick acknowledgement, async processing, identity linking, one-to-one forwarded-text/image/voice draft capture, explicit confirmation, canonical Ask creation, and returned share link. Respect customer-service windows/templates/opt-out. Never attempt to read or join an existing consumer HOA group.

## Acceptance

Signature and replay tests pass; duplicate webhook cannot duplicate Ask/message; raw payload retention is minimized/encrypted; opt-out works; web/manual flow remains complete.
