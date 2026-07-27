# Testing, Security, and Release Gates

## 1. Required commands

The production repository must expose root scripts equivalent to:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm test:rls
pnpm test:e2e
pnpm build
```

CI runs all applicable commands on pull requests. Production deploy requires green checks.

## 2. Unit tests

At minimum:

- Ask status derivation.
- Need quantity calculation.
- Offer acceptance quantity rules.
- State transition guards.
- Due/overdue calculations across timezones.
- Notification scheduling and deduplication.
- Share-copy privacy filtering.
- AI schema validation and low-confidence handling.
- Risk category rules.

## 3. Database tests

- Constraints reject invalid quantities and timestamps.
- Unique active Membership per Circle/user.
- Loan can only reference lend Commitment.
- Loan Event append behavior.
- Transaction rollback on partial Offer acceptance failure.
- Concurrent acceptance cannot overcommit Need quantity.
- Outbox event written atomically.
- Completed Loan history is not cascaded away.

## 4. RLS/hostile tests

Mandatory tests listed in `docs/06_DATABASE_AUTHORIZATION_AND_RLS.md` must pass. Add a test for every new table or policy. A table without RLS tests cannot merge.

## 5. Integration tests

- Sign in and join Circle.
- Publish Ask and retrieve public projection.
- Guest verifies identity and submits unlisted Offer.
- Owner accepts Offer and Plan is created.
- Exact location remains hidden until Plan access.
- Physical Commitment creates Loan.
- Handoff, extension, return, and confirmation append expected events.
- Resource save creates match-only visibility by default.
- Incident assignment grants scoped access and creates audit events.
- Notification jobs are idempotent.

## 6. Playwright journeys

### E2E-01 — Complete ladder flow, mobile

1. Owner signs in.
2. Creates one-Need Ask from natural language.
3. Reviews and publishes.
4. Captures shared URL.
5. New browser context opens URL as guest.
6. Guest chooses lend and enters unlisted ladder.
7. Guest verifies using test identity.
8. Owner accepts.
9. Both view private Plan.
10. Handoff confirmed.
11. Extension requested and accepted.
12. Borrower marks returned.
13. Owner confirms.
14. Contributor saves Resource as match-only.
15. Ask completes.

### E2E-02 — Multi-Need event

Create event, accept partial quantities from several contributors, show remaining quantity, waive one Need, and complete.

### E2E-03 — Advice only

Offer knowledge, accept, complete without Loan, send thanks.

### E2E-04 — Authorization

Attempt Circle B access, Offer spying, Plan message access, role escalation, and revoked share link.

### E2E-05 — Incident

Open issue from Loan, verify private evidence and scoped moderator access, close with audit trail.

## 7. Accessibility QA

- Keyboard-only complete core flows.
- Screen-reader labels for forms and status.
- Focus order and focus restoration.
- 200% zoom.
- Reduced motion.
- Contrast.
- Error summaries and inline field associations.
- 44px tap targets.

## 8. Performance gates

On a representative mobile connection:

- Shared Ask meaningful content should render quickly and not require a large authenticated bundle.
- Avoid loading admin, inbox, or full Circle data on the shared page.
- Optimize images and social preview generation.
- Track Core Web Vitals; investigate regressions before pilot.

## 9. Human review gates

Mandatory human review for:

- Auth/session/account recovery.
- RLS and grants.
- Service-role usage.
- Exact-location data.
- Incident evidence access.
- Prohibited categories.
- Legal copy and agreements.
- Retention/deletion.
- WhatsApp consent/templates.
- Production migrations.

## 10. Pilot-ready checklist

Release only when:

- All tests above pass.
- Mobile complete flow works against non-mock staging data.
- No cross-Circle data exposure in hostile testing.
- Shared links reveal only public projection.
- App works without AI and without WhatsApp Business API.
- Notifications are bounded and deduplicated.
- Admin cannot casually browse private messages/evidence.
- Backup and restore procedure is documented and exercised in staging.
- Privacy, prohibited category, and incident policies are approved.
- Support owner and emergency disable path are defined.
