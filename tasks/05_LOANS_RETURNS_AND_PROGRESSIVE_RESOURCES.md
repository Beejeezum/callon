# Task 05 — Loan Custody, Return, and Progressive Resource Memory

## Goal

Close physical custody reliably while keeping inventory optional.

## Work

- Loan creation only for physical lend commitments;
- handoff confirmation, due date, reminders, extension request/decision, overdue, mark returned, lender confirmation, dispute;
- append-only LoanEvents and immutable accepted snapshots;
- component checklist and optional condition photos for moderate-risk items;
- post-success Resource save with private/match-only/circle visibility;
- Resource Hint category willingness, quiet mode, frequency caps, stale confirmation;
- activity/history and factual reliability summaries;
- no scores, stars, required reciprocity, or automatic booking;
- state/concurrency/RLS/browser tests.

## Acceptance

Illegal transitions reject; history survives archive/cancel; owner remains in control; saving takes one choice and optional enrichment; unresolved issue is factual/private, not a public punishment.
