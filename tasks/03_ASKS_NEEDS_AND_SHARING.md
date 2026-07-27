# Task 03 — Asks, Needs, Media, and Safe Sharing

## Goal

Persist demand and distribute one safe projection into WhatsApp or native sharing.

## Work

- implement validated Ask draft/create/edit/publish/cancel/expire/archive services;
- one-to-many Need lines, risk/category validation, quantity and coverage calculations;
- private image upload with EXIF stripping, MIME inspection, size limits, generated variants;
- cryptographically random share token, only hash persisted, rotation/revocation/versioning;
- server-only safe share projection; no raw table access for anonymous visitors;
- OG metadata and image without exact location/contact/roster/private Offers;
- WhatsApp/native/copy share controls and analytics;
- expiry job and stale-resource-safe behavior;
- audit/outbox/idempotency and tests.

## Acceptance

A member publishes; a signed-out visitor sees one scoped Ask; revoked/expired/tampered tokens fail; no anonymous Circle enumeration; shared page remains fast and useful without JavaScript.
