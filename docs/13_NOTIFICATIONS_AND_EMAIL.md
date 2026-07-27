# Notifications, Email, and Scheduled Work

## 1. Principle

Notifications support real commitments; they do not manufacture engagement. The database/outbox determines what should happen. Providers deliver it.

## 2. Channels

P0:

- in-app notification;
- transactional email;
- SMS only for authentication.

P1:

- opted-in WhatsApp templates.

Do not send marketing pushes in the transactional system.

## 3. Event-to-notification map

| Domain event | Recipient | Timing | Default channel |
|---|---|---|---|
| Ask published | owner | immediate confirmation | in-app/email |
| Offer submitted | Ask owner | immediate, digest if many | in-app/email |
| Offer accepted | contributor | immediate | in-app/email |
| Offer declined | contributor | optional neutral update | in-app/email |
| Commitment message | other participant | immediate or digest | in-app/email preference |
| Pickup due | both | 24h and/or 2h | in-app/email |
| Loan checked out | both | immediate receipt | in-app/email |
| Return due | borrower | 24h; due time | in-app/email |
| Overdue | borrower, then lender | bounded cadence | in-app/email |
| Extension requested | lender | immediate | in-app/email |
| Extension response | borrower | immediate | in-app/email |
| Return marked | lender | immediate | in-app/email |
| Return confirmed | both | immediate completion | in-app/email |
| Incident update | involved party | immediate | email/in-app |

## 4. Reminder cadence

Default physical Loan cadence:

- pickup reminder 24 hours before if scheduled more than 24 hours away;
- due reminder 24 hours before;
- due reminder at due time;
- overdue reminder after 24 hours;
- second overdue reminder after 72 hours;
- then stop automated interpersonal pressure and offer private escalation.

Do not repeatedly shame users or broadcast overdue status to the Circle.

## 5. Outbox flow

```text
domain transaction
→ insert outbox event
→ worker expands recipient/preferences/templates
→ create deduplicated notification jobs
→ worker claims jobs with SKIP LOCKED
→ provider send with idempotency key
→ record receipt or categorized failure
→ retry transient failures with backoff
→ dead-letter/alert after threshold
```

## 6. Cron

A Netlify Scheduled Function invokes the notification worker every 5–15 minutes for P0. The worker claims a bounded batch and must be safe when two invocations overlap. Scheduled Functions run only on published deploys and have a 30-second execution limit, so long work is split into idempotent batches.

Longer-term, Supabase cron/queue or a dedicated worker may replace it, but do not add infrastructure before load requires it.

## 7. Email templates

Templates live in source control with versioned keys:

```text
offer_received.v1
offer_accepted.v1
pickup_reminder.v1
loan_checked_out.v1
return_due.v1
overdue_private.v1
extension_requested.v1
return_confirmed.v1
incident_update.v1
security_contact_changed.v1
```

Email content contains a safe object summary and a signed/app link. Avoid exact address in email previews; direct users to the authenticated Commitment.

## 8. Preferences

Users may configure:

- commitment messages immediate/digest;
- reminder email on/off where legally/product safe;
- quiet hours;
- optional community matching prompts;
- WhatsApp opt-in in P1.

Critical custody/security messages cannot be fully disabled while an obligation is active, but channel/cadence should be respectful.

## 9. Deliverability and security

- SPF/DKIM/DMARC;
- separate staging key and recipient allowlist;
- webhook signature verification;
- bounce/complaint suppression;
- no secret tokens in log URLs;
- links expire or require auth;
- idempotency key per logical send;
- alert on spike in sends, bounces, complaints, or failures.
