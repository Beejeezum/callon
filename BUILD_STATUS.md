# Build Status

**Handoff version:** 2.2 Paseos pilot

**Verified:** 2026-07-29

**Status:** The deterministic P0 application is deployed at
`https://callonapp.netlify.app`, connected to hosted Supabase, and has passed a
real two-account Paseos rehearsal. Broad WhatsApp launch remains gated on a
dedicated SMTP sender and policy approval.

## Implementation status

| Area | Status | Evidence |
|---|---|---|
| Repository and toolchain | Complete | Node 24, pnpm 11, strict TypeScript, frozen lockfile, GitHub Actions, Netlify configuration |
| Authentication | Production verified | Hosted Supabase email OTP, first/last-name capture, SSR sessions, private-route guards; branded numeric-code template is active |
| Public onboarding | Production verified | Paseos welcome, public 60-second guide, invitation-first signup, contextual privacy copy |
| Circles and membership | Production verified | Bruce bootstrapped as the first Paseos administrator; a second verified account joined from a scoped invitation |
| Asks and Needs | Production verified | A real hosted Ask was created and published through the three-step flow |
| Offers | Production verified | A second account submitted an unlisted item Offer privately |
| Commitments | Production verified | The requester accepted the Offer and received a participant-only coordination record |
| Loans | Production verified | Handoff, borrower return, and lender confirmation completed against hosted data |
| Progressive resources | Production verified | Post-return item memory and Circle-visible library path are implemented and covered by browser tests |
| Notifications | Implemented; provider-gated | Transactional outbox, quiet hours, bounded worker, retry/dead-letter, mock and Resend adapters |
| Admin and safety | Complete for P0 | Membership moderation, incident summaries, no default access to messages/location/evidence |
| AI drafting | Deferred P1 | Route seam remains disabled by default |
| WhatsApp assistant | Deferred P1 | Webhook seam remains disabled by default; ordinary share-to-WhatsApp remains available |

## Verification evidence

- `supabase db reset` — migrations `001` through `013` apply cleanly from an
  empty local PostgreSQL database.
- `pnpm db:lint` — no schema errors.
- `pnpm db:test` — **109 of 109** pgTAP assertions pass.
- `pnpm typecheck`, `pnpm lint`, and `pnpm test` — pass.
- Shared contracts — 2 tests pass.
- Web unit/component checks — 3 tests pass.
- `pnpm build` — Next.js 16.2.12 production build passes for all application
  and API routes.
- `pnpm check:client-bundle` — no server-only secret identifiers found in the
  browser bundle.
- `pnpm format:check` — all tracked source and documentation are formatted.
- Playwright real-data suite — **20 of 20** journeys pass across mobile and
  desktop Chromium.
- Hosted Supabase — migrations `001` through `013` are applied to production.
- Production health endpoint — `ready: true`; Supabase, backend authorization,
  share-token protection, location encryption, cron authentication, and P1
  feature gates all pass.
- Live Paseos rehearsal — first-admin bootstrap, invitation acceptance, Ask,
  private Offer, acceptance, handoff, borrower return, and lender confirmation
  completed against production.
- Hosted Auth email template — configured to deliver a numeric OTP matching the
  application UI.
- Browser/PWA identity — the Call On favicon is explicitly linked in page
  metadata, renders cleanly at 16 px and 32 px, and the signed-out web-app
  manifest resolves without an authentication redirect.
- Boca Raton scheduling — Ask, commitment, return, and extension times are
  stored and rendered as `America/New_York`; summer, winter, round-trip, and DST
  gap tests pass.
- Automated accessibility — representative journeys have zero serious or
  critical WCAG A/AA violations.
- Notification endpoint — unauthorized request returns `401`; authorized mock
  batches drain to zero pending jobs with no failures.
- Product Design QA — public welcome, guide, invitation signup, email
  verification, sign-in, first member home, and responsive desktop states pass
  against the canonical visual direction. The current audit and accepted
  screenshots are in `design/audits/2026-07-29-onboarding/`.

The detailed role and journey evidence is in
`docs/24_P0_JOURNEY_QA_MATRIX.md`.

## Environment boundary

Local development and CI use isolated Supabase stacks and mock providers.
Production uses the DreamCraftLabs Netlify `callonapp` project and the hosted
Supabase project connected to `Beejeezum/callon`. Production secrets are
limited to Netlify's production deploy context; previews intentionally run in
demo mode without production data access.

The earlier `callon-neighbors`/Letterhead-linked project is not an approved
deployment target and is not used by this repository.

## Remaining human gates

- Configure a dedicated SMTP sender before distributing the invitation to the
  full WhatsApp group. Supabase's built-in sender is intentionally
  rate-limited and is suitable only for a tightly controlled proof.
- Revoke the two-use rehearsal invitation and archive the clearly labeled
  synthetic Ask before issuing the real pilot invitation.
- Approve legal, privacy, prohibited-item, safety, and incident-response policy.
- Review production RLS and exact-location key custody with a qualified security
  reviewer.
- Run backup/restore and production migration rehearsals.
- Configure redacted error monitoring before widening the pilot.
- Start with an eight-neighbor cohort, observe deliverability and the first
  three real exchanges, then decide whether to post to the full group.
