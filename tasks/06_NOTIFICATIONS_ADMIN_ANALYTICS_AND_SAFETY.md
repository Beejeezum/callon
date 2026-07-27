# Task 06 — Pilot Operations

## Goal

Make P0 operable, observable, and safe enough for a controlled staging pilot.

## Work

- transactional outbox → bounded claim worker → provider adapter;
- email templates, preferences, quiet hours, retry/backoff/dead letter, duplicate protection;
- reminders for offer/acceptance/handoff/due/overdue/return/incident only;
- Resend adapter, PostHog adapter with allowlisted properties, Sentry redaction;
- admin membership/report screens with scoped evidence grants and audit;
- prohibited-category enforcement and private incident flow;
- rate limits and abuse monitoring;
- health/readiness and operational metrics;
- runbook exercises for provider outage, security incident, account recovery, key rotation, restore;
- pilot analytics funnel and retention minimization.

## Acceptance

Provider retry cannot duplicate user-visible notifications; no PII in analytics/errors; admins cannot browse private data; alerting and runbooks are executable; staging exit checklist complete.
