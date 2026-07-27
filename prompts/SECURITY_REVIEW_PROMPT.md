# Security Review Prompt

Audit the current implementation against `AGENTS.md`, `docs/08_DATABASE_SCHEMA_AND_RLS.md`, and `docs/16_TESTING_QA_AND_RELEASE.md`.

Assume a malicious authenticated member, a malicious scoped guest, a suspended member with an old session, and a curious Circle admin.

Review:

- Cross-Circle isolation.
- Shared-link scoping and revocation.
- Role escalation.
- Offer and Plan privacy.
- Exact-address exposure.
- Resource ownership exposure.
- Private messages and incident evidence.
- Storage policies and signed URLs.
- Service-role leakage.
- Client-controlled IDs/roles/Circle IDs.
- State-transition races and quantity overcommit.
- Idempotency and replay.
- Logs/analytics PII.
- Auth callback/session/cookie behavior.
- File upload validation.
- Outbox/job privilege boundaries.

Return findings by severity with exact file/line references, exploit path, affected data, and specific remediation. Add a regression test for every confirmed vulnerability. Do not weaken requirements to make tests pass.
