# Analytics, Observability, and Notifications

## 1. North-star and guardrails

North-star: completed neighbor assists per activated Circle per 30 days.

Guardrails:

- Incident rate.
- Unresolved overdue rate.
- Unwanted matching/notification rate.
- Cross-Circle authorization failures.
- Top-contributor concentration and quiet-mode activation.
- Ask link → Offer conversion.
- On-time return rate.

## 2. Required events

Use `snake_case`. Every event includes a safe anonymous/session ID, user ID when authenticated, Circle ID, app version, platform, timezone, and source channel where permitted.

Do not include raw Ask text, exact address, phone, email, private message, item serial number, or incident evidence.

Core events:

- `circle_invite_opened`
- `circle_join_requested`
- `ask_create_started`
- `ask_draft_generated`
- `ask_draft_edited`
- `ask_published`
- `ask_share_clicked`
- `shared_ask_viewed`
- `contribution_type_selected`
- `identity_verification_started`
- `identity_verified`
- `offer_submitted`
- `offer_accepted`
- `offer_declined`
- `plan_opened`
- `loan_handoff_confirmed`
- `loan_extension_requested`
- `loan_return_marked`
- `loan_return_confirmed`
- `ask_completed`
- `resource_save_prompt_shown`
- `resource_saved`
- `incident_opened`
- `notification_opt_out`

## 3. Funnel definitions

### Requester

`ask_create_started → ask_published → ask_share_clicked → offer_submitted → offer_accepted → ask_completed`

### Contributor

`shared_ask_viewed → contribution_type_selected → identity_verified → offer_submitted → offer_accepted → contribution_completed`

### Circle activation

A Circle is activated when it has at least three completed assists involving at least five distinct adults within 30 days, subject to pilot review.

## 4. Notifications

P0 channels: in-app and transactional email/SMS according to identity and consent. WhatsApp outbound reminders belong to P1 and provider rules.

Essential triggers:

- New Offer to owner.
- Offer accepted/declined/withdrawn.
- Plan logistics update.
- Handoff reminder.
- Due tomorrow.
- Due today.
- Overdue reminder with bounded cadence.
- Extension request/decision.
- Return marked/confirmed.
- Incident update.

Rules:

- Avoid duplicate delivery through idempotency keys.
- Cap overdue reminders; do not shame publicly.
- Quiet mode suppresses nonessential matching and community prompts, not active custody reminders.
- Every nonessential notification has an easy preference control.

## 5. Application observability

Capture:

- Server errors and traces with PII scrubbing.
- Domain operation latency/error rate.
- Auth and OTP provider health.
- Outbox age and retry count.
- Notification delivery status.
- RLS-denied requests as aggregate security signals without leaking payloads.
- Web Vitals and shared Ask performance.

Never log raw private message bodies, access tokens, OTPs, exact addresses, or incident attachments.
