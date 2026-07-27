# P0 Journey and QA Matrix

**Last verified:** 2026-07-26  
**Scope:** Call On P0 against an isolated local Supabase project  
**Viewports:** iPhone 13 (`390 × 844`) and desktop Chromium (`1440 × 1024`)

This matrix is the release evidence for the deterministic P0 product. It does
not approve production providers, legal policy, production migrations, or a
public pilot.

## Role and access matrix

| Actor or state | Can read Circle Asks | Can create an Ask | Can submit a new Offer | Can read private Offers | Can read a Commitment | Can read exact location | Can moderate |
|---|---:|---:|---:|---:|---:|---:|---:|
| Signed-out visitor | No | No | No | No | No | No | No |
| Verified scoped guest | Shared Ask only | No | Shared Ask only | Own Offer only | Accepted own Offer only | If party to accepted Commitment | No |
| Pending member | Invite preview only | No | Scoped Ask only, if separately granted | Own Offer only | Party only | Party only | No |
| Active member | Yes | Yes | Yes, except own Ask | No | Party only | Party only | No |
| Restricted member | Yes | No | No | Existing requester records only | Existing party obligations | Existing party obligations | No |
| Suspended member | No Circle activity | No | No | No | No new access | No new access | No |
| Ask requester | Own Ask | Yes | Not on own Ask | Own Ask only | Own accepted Commitments | Own accepted Commitments | No |
| Offer contributor | Circle Asks or scoped Ask | If active member | Yes | Own Offer only | Own accepted Commitments | Own accepted Commitments | No |
| Moderator / Circle admin | Circle Asks | Yes when active | Yes when active | Own requester records only | Party only | Party only | Membership and incident summaries |
| Service worker | No interactive session | No | No | No | No | No | Notification jobs only |

Circle administrators do not gain general access to private messages, exact
pickup locations, possession maps, or incident evidence.

## Browser journeys

The real-data Playwright suite lives at
`apps/web/tests/e2e/p0-journeys.spec.ts`. Each journey runs against a fresh
synthetic data set in both viewports.

| Journey | Assertions |
|---|---|
| Signed-out guard and Circle activation | Private route redirects to login; passwordless OTP succeeds; first Circle is created; live home renders |
| Ask creation and safe sharing | Natural-language entry; structured Need; timing and general location; publish; scoped share page; no exact location leakage |
| Scoped guest contribution | A verified non-member offers an unlisted item; contact data remains private; no app installation or inventory setup |
| Requester review and acceptance | Competing Offers stay private; requester accepts one; Commitment is created atomically |
| Private coordination | Accepted parties can message; unrelated members cannot; exact location is encrypted and revealed only to parties |
| Physical handoff | Lender confirms pickup; Loan is created; custody state becomes checked out |
| Extension decline | Borrower requests a bounded future due date; lender declines; existing due date remains authoritative |
| Return and completion | Borrower marks returned; lender confirms; Loan closes; final Need and Ask complete automatically |
| Progressive resource memory | Lender can privately remember the successfully shared item after return; inventory remains optional |
| Invitation and join | Admin creates an expiring, bounded-use invite; new member joins; exhausted invite cannot be reused except for safe idempotent replay |
| Restricted membership | Existing Circle data remains readable; new Ask and Offer controls disappear; direct create route redirects |
| Active-member contribution | A joined member can offer privately from the Circle Ask without using a shared link; requester alone sees the Offer |
| Suspended membership | Circle feed and create controls disappear; direct create route redirects; restoration returns normal access |
| Cross-role privacy | Unrelated active member cannot read Commitment, address, messages, or private Offers while the Circle Ask remains visible |

Current result: **16 of 16 browser tests pass**.

## Database and hostile authorization coverage

The pgTAP suite lives under `supabase/tests/`.

- Tenant-mismatched child records fail at the database boundary.
- Circle A cannot read or mutate Circle B.
- Pending membership is not treated as active membership.
- Restricted users cannot create new activity.
- Guests are scoped to one Ask and cannot enumerate competing Offers.
- Owners cannot Offer on their own Ask.
- Share links reject malformed, expired, and revoked tokens.
- Shared projections omit exact locations, private contacts, Offers, and roster
  data.
- Accepted quantities are protected under row locks.
- Critical commands support safe idempotent replay and reject mismatched replay.
- Messages and exact locations are party-only.
- Loan events and audit events are append-only.
- Extension requests are future-bounded and capped at 30 days.
- Incident creation is atomic and idempotent.
- Completing the final Need completes the Ask and revokes outstanding share
  links.
- Notification claiming, settlement, retry, and dead-letter operations are
  service-only.

Current result: **88 of 88 database assertions pass**.

## Accessibility and responsive QA

Representative public, owner, Commitment, Loan, admin, and member-contribution
screens run automated WCAG 2.0/2.1 A and AA checks through axe. Serious and
critical violations fail the suite.

Fixes discovered by the accessibility pass:

- Progress bars now have accessible names.
- Muted helper text and violet status badges meet text-contrast requirements.

Manual in-browser review also covers the login screen, authenticated dashboard,
owner Ask detail, and the three-step Ask wizard. The internal design-system
route is no longer exposed in primary user navigation.

## Notification worker checks

- Missing or incorrect bearer credentials return `401`.
- Authorized execution prepares outbox events, claims a bounded batch, resolves
  recipients server-side, and settles jobs.
- Test execution drained all queued jobs through the mock provider with zero
  failures.
- Quiet-hour preferences defer email jobs in the member's configured timezone.
- Provider payloads do not contain exact pickup addresses.

## Release gates that remain human-owned

- Create and secure production Supabase, Netlify, Resend, Twilio, monitoring,
  analytics, and DNS accounts.
- Approve production environment variables and exact-location encryption-key
  custody.
- Review and approve legal terms, privacy policy, prohibited categories, and
  lending safety language.
- Run a production backup/restore drill and migration review.
- Complete an external security review of RLS, token handling, and exact
  location access.
- Enable real OTP and transactional email only after provider and abuse-control
  review.
- Approve the pilot audience and incident-response owner.

