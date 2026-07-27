# AGENTS.md — Call On Production Build Contract

These instructions are mandatory for every coding agent operating in this repository.

## 1. Mission

Build a secure, mobile-first, private web application for a controlled neighborhood pilot. The product must make a concrete Ask easier to create, share, fulfill, coordinate, and close than handling the same exchange entirely inside a group chat.

The product is **request-first**. Persistent inventory is optional and emerges after real help. WhatsApp is a distribution surface, not the source of truth or required runtime.

## 2. Required preflight

Before editing code, read:

1. `README_START_HERE.md`
2. `docs/00_EXECUTIVE_DECISIONS.md`
3. `docs/02_P0_BUILD_CONTRACT.md`
4. `docs/03_SERVICE_ACCOUNTS_AND_ENVIRONMENTS.md`
5. `docs/04_UX_INFORMATION_ARCHITECTURE.md`
6. `docs/05_DESIGN_SYSTEM.md`
7. `docs/07_DOMAIN_MODEL_AND_STATE_MACHINES.md`
8. `docs/08_DATABASE_SCHEMA_AND_RLS.md`
9. `docs/15_SECURITY_PRIVACY_AND_SAFETY.md`
10. the relevant numbered file in `tasks/`

Run:

```bash
python3 scripts/verify_bundle.py
```

Return a concise preflight covering scope, architecture, database migration order, auth/session plan, RLS-test plan, first vertical slice, and true blockers.

## 3. Source precedence

When information conflicts:

1. `AGENTS.md`
2. `docs/00_EXECUTIVE_DECISIONS.md`
3. `docs/02_P0_BUILD_CONTRACT.md`
4. the relevant specialized document
5. `docs/01_FULL_PRD.md`
6. canonical visual crops
7. runnable/static prototypes
8. alternate design boards

Record material resolutions in `docs/20_IMPLEMENTATION_DECISIONS.md`. Never silently widen scope.

## 4. Exact P0 outcome

A first-time person can open a scoped WhatsApp-shared Ask without installation, understand what remains, offer an unlisted item/time/knowledge/alternative, verify identity only when the offer becomes actionable, coordinate privately after acceptance, complete a physical custody loop when relevant, and optionally remember the resource afterward.

Required P0:

- private Circles and scoped invitations;
- passwordless OTP identity;
- safe shared Ask projection;
- one or multiple Need lines;
- lend/give/help/advice/recommendation/alternative modes;
- private Offers and partial quantities;
- transactional Offer acceptance;
- private conversation/logistics;
- Loan handoff, extension, overdue, return, confirmation, incident link;
- progressive Resource memory;
- email/reminders, analytics, errors, audit, moderation, and operational health.

Explicitly excluded:

- payments, deposits, fees, tips, insurance, or commercial rental;
- public marketplace, public inventory map, or cross-community discovery;
- engagement-ranked social feed, anonymous posting, politics/crime chatter;
- public ratings, trust scores, generosity rankings, or contribution quotas;
- native mobile apps;
- direct access to an existing consumer WhatsApp group;
- AI publication, dispute resolution, trust judgment, or safety certification;
- high-risk/prohibited lending categories;
- microservices, GraphQL, a second API server, or a second source-of-truth database.

## 5. Stack

Use current supported security-patched versions and official documentation.

- monorepo: pnpm workspaces;
- runtime: current supported Node.js LTS;
- web/full-stack: Next.js App Router, React, strict TypeScript;
- UI: CSS custom properties and scoped component CSS; add Tailwind only if it demonstrably reduces complexity rather than duplicating the existing token system;
- icons: Phosphor;
- contracts/validation: Zod in `packages/contracts`;
- database/auth/storage: Supabase PostgreSQL/Auth/private Storage;
- hosting: Netlify with the maintained OpenNext adapter;
- tests: Vitest, Playwright, PostgreSQL/pgTAP RLS tests;
- email: adapter, initial provider Resend;
- OTP: Supabase-supported SMS provider, initial default Twilio, with email fallback;
- abuse defense: Cloudflare Turnstile plus server rate limits;
- analytics: PostHog adapter with privacy filtering;
- monitoring: Sentry adapter;
- P1 AI: OpenAI Responses API with strict structured output;
- P1 WhatsApp: Meta Cloud API, one-to-one assistant only.

Do not substitute Firebase, Prisma, MongoDB, a custom auth system, Redux, Kubernetes, or microservices without an approved architecture decision.

## 6. Required architecture

```text
UI
→ validated Server Action or Route Handler
→ authenticated/scoped actor resolution
→ domain service
→ SECURITY DEFINER transaction RPC or tightly scoped SQL transaction
→ audit + outbox in the same transaction
→ idempotent worker
→ provider adapter
```

Rules:

- UI code never performs authoritative mutations directly against tables;
- use `auth.uid()` at the database boundary; do not trust a client-supplied actor id;
- state transitions and quantity calculations occur under locks;
- exact location/contact/token/evidence/job data stays in `private` schema;
- every exposed table has RLS enabled and hostile tests;
- service-role secrets never enter client bundles;
- sensitive logs are redacted by construction;
- external provider failure cannot corrupt core state;
- all state-changing HTTP/RPC operations are idempotent;
- Loan/audit history is append-only.

## 7. Product invariants

1. A user can offer an unlisted item.
2. Inventory setup is never required to contribute.
3. Exact address appears only after acceptance and only to accepted parties.
4. Personal resources are never auto-booked.
5. Declining is private and consequence-free.
6. Ask creation remains the dominant action.
7. There is no open-ended engagement feed.
8. There are no public star ratings or numerical trust scores.
9. Advice/help can complete without a Loan.
10. Completed custody records survive Ask archival/cancellation.
11. WhatsApp and AI are optional adapters; web/manual paths remain complete.
12. AI output is always a draft requiring confirmation.

## 8. UX invariants

- Design at 390 px first, then responsive desktop.
- Canonical visual source: `visuals/00_CANONICAL_UI_DIRECTION.png` and its crops.
- Shared Ask primary action: **I can help**.
- Ask creation begins with natural language and progressively reveals details.
- First value in under 60 seconds; no mandatory profile/inventory tour.
- Minimum 44×44 px targets; WCAG 2.2 AA target; 200% text zoom.
- No critical information conveyed only through color.
- Every stateful screen covers loading, empty, success, recoverable error, permission denied, and expired/revoked state.
- Do not use modal chains for the core mobile journey.
- Copy is human and concrete, never gamified or shame-inducing.

## 9. Database/RLS obligations

Every migration that adds or changes a domain table must include:

- constraints and indexes;
- RLS enable/force statements;
- explicit least-privilege policies;
- cross-Circle, non-party, suspended-user, and shared-token tests;
- rollback/forward-fix notes;
- generated TypeScript database types after validation.

Critical concurrency tests:

- two requesters cannot accept overlapping reservations for one saved resource;
- two acceptance attempts cannot overfill a Need;
- replayed idempotency key returns the original result;
- same idempotency key with a different payload is rejected;
- return confirmation cannot happen before return-marked state;
- a moderator cannot read private messages/evidence without a scoped grant.

## 10. External accounts

Agents may generate setup instructions, configuration, and code. Agents must not create production external accounts, accept legal terms, purchase services, configure billing, publish DNS, apply production migrations, or enable real messaging without explicit human action.

Use `docs/03_SERVICE_ACCOUNTS_AND_ENVIRONMENTS.md` as the checklist. Never place secrets in source control or issue text.

## 11. Execution loop

For each numbered task:

1. restate acceptance criteria;
2. inspect relevant code/docs/migrations;
3. implement the smallest complete vertical slice;
4. update contracts before consumers;
5. implement migrations, RLS, and tests together;
6. run format, lint, typecheck, unit, SQL/RLS, browser, build, and applicable security checks;
7. capture UI screenshots and compare to canonical crops;
8. update `BUILD_STATUS.md` and decision log;
9. report files changed, commands/tests, evidence, blockers, and residual risk.

Never claim a check ran if it did not. A build success is not authorization proof. A health endpoint is not visual verification.

## 12. Definition of done

A feature is done only when it has:

- typed contract and validation;
- server authorization and RLS;
- transaction/idempotency behavior where relevant;
- all core UI states and accessibility review;
- analytics event where specified;
- audit/outbox behavior for sensitive changes;
- unit/integration/E2E/security tests;
- documentation and runbook update;
- successful production build;
- browser-rendered evidence for UI changes.

## 13. Human stop gates

Stop for explicit human review before:

1. adopting the production name or domain;
2. publishing terms, waiver, privacy, moderation, retention, or prohibited-item policies;
3. applying production migrations or rotating production keys;
4. enabling production OTP/email/WhatsApp delivery;
5. storing/decrypting exact production locations;
6. granting support/moderator access to private data;
7. launching beyond the controlled pilot;
8. adding money, insurance, high-risk categories, public discovery, or public reputation.
