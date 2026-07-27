# Testing, Design QA, Security QA, and Release Gates

## 1. Test pyramid

### Static

- TypeScript strict;
- ESLint;
- formatting check;
- dependency audit/license review;
- secret scan;
- SQL lint where available.

### Unit

- state-transition guards;
- quantity/coverage calculations;
- share projection mapper;
- category/risk policy;
- notification scheduling;
- analytics redaction;
- encryption wrapper contract;
- AI schema parser.

### Integration/domain

- create/publish Ask;
- submit/withdraw Offer;
- concurrent Offer acceptance;
- Commitment creation;
- Loan lifecycle;
- extension race;
- return completion updates Need/Ask;
- outbox created atomically;
- idempotency replay;
- suspended-member narrow access.

### Database/RLS

Use pgTAP/SQL tests with multiple JWT contexts. Every table/policy change adds cross-Circle and wrong-party tests.

### End-to-end

Playwright:

1. invite/join/login;
2. create multi-Need Ask;
3. open shared link as new visitor;
4. submit unlisted-item Offer with verification fixture;
5. requester accepts;
6. private coordination/location;
7. handoff;
8. extension variant;
9. return/confirm;
10. save Resource;
11. incident/report variant;
12. revoked link and authorization failures.

## 2. Mock/provider strategy

CI must not require live SMS, email, OpenAI, or WhatsApp.

- local fake OTP adapter or Supabase test configuration;
- email sink/recording adapter;
- fake analytics/error reporter;
- AI fixture adapter;
- WhatsApp fixture webhook and outbound recorder;
- deterministic time via clock abstraction for reminders.

Run a separate staging-provider smoke suite before release.

## 3. Design QA

Compare implementation against:

- `visuals/00_CANONICAL_UI_DIRECTION.png`;
- screen crops;
- this design system and screen requirements.

Required viewports:

- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 1440 × 1024.

Check:

- typography and wrapping;
- spacing and density;
- token fidelity;
- images/icons;
- copy;
- focus, keyboard, touch;
- loading/empty/error/success;
- no private data in wrong state;
- no unsafe visual artifact copied from concept board.

Store screenshots and `design-qa.md` for meaningful visual releases.

## 4. Accessibility QA

- axe automated checks on core routes;
- manual keyboard pass;
- VoiceOver Safari/iOS or equivalent mobile screen-reader pass;
- text zoom to 200%;
- reduced motion;
- contrast measurement;
- form-error announcements;
- dynamic status announcements;
- touch-target check.

Automated success is not sufficient.

## 5. Performance QA

Test shared Ask and authenticated home under representative mobile network/device profiles. Monitor JS bundle by route. Public share page must not import admin, analytics-heavy, message composer, or AI bundles unnecessarily.

Budgets to start:

- public share route first-load JS under 140 KB compressed where practical;
- no unoptimized multi-megabyte hero upload;
- database queries bounded/paginated;
- no N+1 Offer/message queries;
- p95 domain mutation under 1.5 seconds excluding provider delivery.

## 6. CI checks

Required on pull requests:

```text
repo structure
format/lint
typecheck
unit/integration
database migration reset
database/RLS tests
build
Playwright smoke
secret scan
```

Migration/auth/security changes require CODEOWNER review.

## 7. Release sequence

1. Merge reviewed PR.
2. Preview deployment checks.
3. Promote/merge to staging.
4. Apply staging migration.
5. Run full E2E + provider smoke + design QA.
6. Review migration plan and backup.
7. Human approval.
8. Apply production migration.
9. Deploy production.
10. Run production-safe smoke.
11. Watch errors/jobs/provider dashboards.
12. Record release and rollback/mitigation status.

## 8. Production gate checklist

Must be green:

- legal/naming status appropriate for pilot;
- production domain/TLS;
- Auth redirect allowlist;
- RLS tests and human review;
- private Storage policies;
- exact-location encryption/key backup;
- backup/restore rehearsal;
- provider sender/OTP restrictions;
- error/analytics redaction;
- cron/job alerting;
- support/security contact;
- incident runbook;
- feature flags/kill switches;
- pilot roster and communication plan.

## 9. Rollback philosophy

Application deploy may roll back quickly. Database migrations may not. Prefer backward-compatible expand/migrate/contract changes. For destructive issues, define a forward mitigation and data restore decision rather than pretending every migration has a trivial reverse SQL script.
