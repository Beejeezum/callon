# Data Dictionary and Retention Starting Point

This is an engineering starting point, not a final legal retention policy. Privacy/legal review must approve production durations.

| Data class | Examples | Storage | P0 starting retention | Deletion/expiry behavior |
|---|---|---|---|---|
| Account identity | profile id, display name, locale | public RLS schema | account life + approved grace | anonymize/delete when allowed |
| Verified contact | encrypted phone/email + keyed hash | private schema | account life + recovery/legal grace | cryptographic erasure + row removal |
| Circle membership | role/status/history | public RLS schema | Circle/account life | preserve minimum moderation/audit history |
| Ask/Need | title, timing, general area | public RLS schema | active + 24 months pilot default | archive; later anonymize per approved policy |
| Share link / scoped guest grant | token hash, Ask/Profile scope, expiry, access count | private schema | Ask expiry + short security grace | revoke/expire automatically; delete after abuse/debug window |
| Offer/Commitment | contribution and accepted snapshot | public RLS schema | 24 months after close | preserve dispute window; strip optional media earlier |
| Exact location | encrypted pickup/return location | private schema | close + 30 days default | scheduled deletion; retain only if incident/legal hold |
| Messages | participant coordination | public RLS schema | close + 12 months default | purge attachments first; incident hold overrides |
| Loan/LoanEvent | custody state and factual history | public RLS schema | 36 months default | append-only until approved expiry/anonymization |
| Resource/Hint | optional item memory/category willingness | public RLS schema | until owner removes/pauses; reconfirm every 6 months | owner delete; remove stale hints |
| Incident/evidence | report, evidence metadata/files | public/private/storage | case close + approved legal/safety period | restricted hold then secure deletion |
| Audit/security | action ids, safe metadata, request ids | private schema | 12–24 months | no plaintext PII; expire in batches |
| Outbox/jobs | delivery payload/status | private schema | 30–90 days after terminal state | delete/minimize payload after reconciliation |
| Analytics | allowlisted product events | PostHog | shortest useful pilot period | no free text/contact/location/token/message data |
| Error logs | stack, release, redacted context | Sentry | 30–90 days | scrub before ingestion; delete incident exports |
| AI drafts P1 | encrypted input, structured draft | private schema | hours/days, not indefinite | auto-expire unless converted; no training use assumption |
| WhatsApp payload P1 | receipt id, redacted metadata, optional ciphertext | private schema | minimum needed for replay/support | delete raw payload promptly |

Every retention job requires dry-run counts, bounded batches, audit outcome, incident/legal-hold exclusion, and restore implications.
