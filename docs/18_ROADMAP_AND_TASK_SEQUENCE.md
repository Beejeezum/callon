# Roadmap and Codex Task Sequence

## Phase 0 — Foundation

### Task 00 Repository bootstrap

- resolve/pin current dependencies;
- commit lockfile;
- Next.js App Router scaffold;
- environment parser;
- provider adapters and mock mode;
- CI and repository checks;
- design tokens/primitives;
- local Supabase configuration.

Exit: clean install, build, tests, and local mock app.

## Phase 1 — Visual shell and mock journey

### Task 01 Design system and app shell

- canonical components;
- responsive navigation;
- home, shared Ask, Ask wizard, Offer, Commitment, Loan, activity, inbox, profile;
- synthetic mock repository;
- full clickable happy path;
- visual/accessibility baseline.

Exit: browser-tested frontend matching canonical direction.

## Phase 2 — Identity and tenant boundary

### Task 02 Auth, Circles, invitations

- Supabase SSR Auth;
- profiles/private contacts;
- Circle membership/invites;
- guest draft and conversion;
- Turnstile/rate limits;
- RLS and hostile tests.

Exit: real local/staging auth and isolation.

## Phase 3 — Demand and distribution

### Task 03 Asks, Needs, share links

- tables/migrations;
- creation/publish/archive;
- safe share projection;
- OG metadata/share actions;
- image upload;
- coverage calculations;
- tests/analytics/audit/outbox.

Exit: member can publish and new visitor can safely view.

## Phase 4 — Supply and commitment

### Task 04 Offers and Commitments

- unlisted Offer;
- verification boundary;
- private Offer inbox;
- transactional acceptance;
- private conversation and logistics;
- no competing Offer leakage;
- tests.

Exit: Offer-to-Commitment loop works under concurrency.

## Phase 5 — Custody and memory

### Task 05 Loans and Resources

- handoff;
- reminders/extension/overdue;
- mark/confirm return;
- LoanEvents;
- save Resource/hints;
- activity history;
- incident link.

Exit: full physical lend loop closes.

## Phase 6 — Pilot operations

### Task 06 Notifications, admin, analytics, safety

- outbox/jobs/cron;
- Resend adapter;
- admin/incident controls;
- PostHog/Sentry adapters;
- security/privacy redaction;
- operational dashboards/runbooks;
- pilot seed and release gates.

Exit: controlled staging pilot candidate.

## Phase 7 — AI drafting, P1

### Task 07

- OpenAI adapter;
- strict schema;
- editor confirmation;
- evaluation suite;
- privacy/spend controls;
- kill switch.

## Phase 8 — WhatsApp assistant, P1

### Task 08

- Meta webhook;
- one-to-one draft flow;
- identity linking;
- templates/opt-in;
- webhook replay tests;
- human escalation.

## Phase 9 — Hardening and production pilot

### Task 09

- external security review/RLS review;
- legal/naming gates;
- backup restore;
- provider production configuration;
- load/performance checks;
- production release and observability.

## Codex execution rules

- Work one task at a time unless the autonomous prompt explicitly allows sequential tasks.
- Read visual crop and specialized docs before changing the screen/domain.
- Never skip migrations/RLS/tests to make UI appear functional.
- Use mock mode until account secrets are supplied through environment configuration.
- Do not apply production migrations or create external accounts.
- Stop at human gates and output an exact checklist.
- Record decisions, commands, files changed, test evidence, and residual risk after each task.
