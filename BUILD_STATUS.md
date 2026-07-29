# Build Status

**Handoff version:** 2.2 Paseos pilot

**Verified:** 2026-07-29

**Status:** The deterministic P0 application is implemented and verified
locally. Production service activation and pilot launch remain human-gated.

## Implementation status

| Area | Status | Evidence |
|---|---|---|
| Repository and toolchain | Complete | Node 24, pnpm 11, strict TypeScript, frozen lockfile, GitHub Actions, Netlify configuration |
| Authentication | Complete locally | Passwordless verified email OTP, first/last-name capture, callback handling, SSR session refresh, private-route guards |
| Circles and membership | Complete locally | Paseos instant-join invite, scoped guest grants, active/restricted/suspended states, operator-only Circle provisioning, admin controls |
| Asks and Needs | Complete locally | Three-step creation, deterministic validation, publish, safe share links, owner/member-specific views |
| Offers | Complete locally | Scoped guest and active-member contribution, unlisted items, private requester review, decline/withdraw foundations |
| Commitments | Complete locally | Transactional acceptance, private messages, encrypted exact location, participant-only projection |
| Loans | Complete locally | Handoff, custody, extensions, return, confirmation, append-only events, incident reporting |
| Progressive resources | Complete locally | Optional private memory, quick-add wizard, Circle-visible browsing, owner settings |
| Notifications | Complete locally | Transactional outbox, quiet hours, bounded worker, retry/dead-letter, mock and Resend adapters |
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
- Playwright real-data suite — **18 of 18** journeys pass across mobile and
  desktop Chromium.
- Automated accessibility — representative journeys have zero serious or
  critical WCAG A/AA violations.
- Notification endpoint — unauthorized request returns `401`; authorized mock
  batches drain to zero pending jobs with no failures.
- Product Design QA — Paseos welcome, preview home, sign-in, and responsive
  desktop states pass against the canonical visual direction on the approved
  DreamCraftLabs HTTPS branch preview; evidence is in `design-qa.md`.

The detailed role and journey evidence is in
`docs/24_P0_JOURNEY_QA_MATRIX.md`.

## Environment boundary

Local development uses an isolated local Supabase stack and mock email
delivery. No production database, provider credential, domain, message, legal
policy, or migration was created or approved by Codex.

The approved Netlify target is the **DreamCraftLabs** team project
`callonapp`. The earlier `callon-neighbors`/Letterhead-linked project is not an
approved deployment target. A branch deploy may use local/staging Supabase
values; production data and provider credentials must not be exposed to
untrusted deploy previews.

## Remaining human gates

- Disconnect the GitHub repository from every non-DreamCraftLabs Netlify site,
  then verify a branch deploy in DreamCraftLabs `callonapp`.
- Review and merge the implementation pull request only after remote CI and the
  correct Netlify preview pass.
- Create production service accounts and approve secret ownership.
- Approve legal, privacy, prohibited-item, safety, and incident-response policy.
- Review production RLS and exact-location key custody with a qualified security
  reviewer.
- Run backup/restore and production migration rehearsals.
- Enable real OTP, transactional email, analytics, monitoring, and WhatsApp
  only after provider and abuse-control review.
- Approve the pilot cohort and launch date.
