# Executive Product and Architecture Decisions

**Status:** authoritative for Production Handoff v2  
**Date:** 2026-07-26  
**Working title:** Call On; not legally cleared

## 1. Product thesis

Call On is a private, request-first coordination utility for trusted communities. A member creates a concrete **Ask**, shares it into a communication channel where neighbors already pay attention, receives private **Offers**, accepts one or more **Commitments**, coordinates the handoff or help, and closes the loop.

The app does not ask a new user to inventory their possessions. Persistent inventory is an optional memory layer that emerges after successful exchanges.

## 2. Canonical experience

```text
Need occurs
→ create a structured Ask in under 60 seconds
→ share a link into WhatsApp or another channel
→ neighbor opens the Ask without installing an app
→ neighbor offers an item, time, knowledge, a gift, or an alternative
→ identity is verified before the Offer becomes actionable
→ Ask owner privately accepts or declines
→ accepted parties coordinate logistics
→ physical lend creates a Loan ledger
→ both parties confirm return or completion
→ contributor may save the item/category for future private matching
```

## 3. Canonical visual direction

Use `visuals/00_CANONICAL_UI_DIRECTION.png` and the crops under `visuals/canonical-screen-crops/`.

Preserve:

- warm off-white canvas and bright white working surfaces;
- green actions, violet need/help cues, amber event cues;
- greeting-led mobile home;
- structured multi-need Ask;
- prominent WhatsApp sharing;
- private Offer review and coordination;
- lightweight celebration when an exchange closes;
- progressive item memory after successful help.

Correct these exploratory artifacts from the board:

- never reveal an exact address before an Offer is accepted;
- remove public stars and numerical trust scores;
- do not make the inventory or an “Offering” feed the primary surface;
- replace “community trust” rankings with factual, private reliability history;
- split Ask creation into progressive steps on small screens rather than displaying an overloaded form.

## 4. P0 scope

P0 proves one loop in one private community:

1. invitation or link-based Circle entry;
2. minimal identity and membership;
3. Ask creation with one or more Need lines;
4. secure public projection/share link;
5. WhatsApp/native sharing;
6. private Offer submission;
7. Offer acceptance and Commitment creation;
8. private messages and pickup details;
9. Loan handoff, due date, extension, return, and confirmation;
10. optional Resource saving after success;
11. transactional email/reminders;
12. basic moderator and incident tools;
13. analytics, audit, error monitoring, and operational health.

## 5. Explicit P0 exclusions

Do not add:

- payments, deposits, fees, tips, insurance, or commercial rentals;
- public communities or cross-community search;
- an engagement-ranked social feed;
- public item maps, public ownership lists, or exact-location browsing;
- public ratings, leaderboards, social-credit systems, contribution quotas, or opaque trust scores;
- native iOS/Android applications;
- direct bot access to an existing consumer WhatsApp group;
- AI dispute resolution, AI safety certification, or autonomous publication;
- professional-services marketplace or contractor lead generation;
- hazardous/high-risk lending categories;
- a separate API server, GraphQL layer, microservices, or second primary database.

## 6. Production stack decision

| Layer | Decision | Reason |
|---|---|---|
| Source control | GitHub private repository | standard pull-request workflow and Codex compatibility |
| Web/full-stack | Next.js App Router + strict TypeScript | one deployable, server and client boundaries, share-page metadata |
| Hosting | Netlify | maintained OpenNext support, Git previews, environment separation, scheduled functions |
| Database | Supabase PostgreSQL | relational integrity, transactions, RLS, managed operations |
| Authentication | Supabase Auth | phone/email OTP, cookie-backed SSR, database integration |
| Files | private Supabase Storage buckets | RLS-integrated media and evidence access |
| Email | Resend behind an adapter | transactional delivery, domain control, idempotency support |
| Phone OTP | supported Supabase SMS provider; default Twilio | pragmatic verified identity path |
| Abuse defense | Cloudflare Turnstile + server rate limits | protect public Ask and OTP surfaces |
| Analytics | PostHog adapter | events, funnels, flags, privacy controls |
| Monitoring | Sentry adapter | browser/server errors, traces, release correlation |
| AI, P1 | OpenAI Responses API with strict structured output | draft extraction only |
| WhatsApp, P1 | Meta WhatsApp Cloud API one-to-one assistant | capture and share sidecar, not group replacement |

## 7. Architectural boundaries

```text
Browser / share visitor
  → Next.js page, Server Action, or Route Handler
  → Zod validation and authenticated/scoped actor resolution
  → domain service
  → database function/transaction
  → audit event + outbox event in the same transaction
  → background notification worker
  → email / WhatsApp / analytics provider adapter
```

Rules:

- core writes are transactional;
- exact location and contact data never travel through generic client queries;
- RLS protects every exposed table;
- server code enforces state transitions in addition to RLS;
- providers are adapters, not domain dependencies;
- web use works without AI or WhatsApp;
- Loan and audit history is append-only;
- all state-changing HTTP operations support idempotency.

## 8. Environment decision

Use four environments:

- **local:** Supabase CLI/local stack, synthetic fixtures, mock providers;
- **test/CI:** ephemeral database/container, no external providers;
- **staging:** separate Supabase project, staging domain, provider sandboxes/test destinations;
- **production:** separate Supabase project, production domain, least-privilege secrets, backups and alerting.

Production and staging must never share a database, storage bucket, signing secret, encryption key, or webhook secret.

## 9. Identity decision

A visitor may view a scoped shared Ask and draft an Offer before creating a full profile. Before the Offer can be submitted for acceptance, the user must verify a phone number or email. Membership rules then determine whether the Offer is accepted as a Circle member, an approved guest, or is held for owner/moderator approval.

No password is required in P0. Account recovery and contact changes require step-up verification and audited flows.

## 10. Privacy decision

- The shared page exposes one explicit Ask projection only.
- Exact pickup location appears only after Offer acceptance and only to the two accepted parties.
- Contact fields live in an unexposed schema.
- Private Offers are visible only to their contributor and the Ask owner.
- Competing Offers are not visible to one another.
- Circle admins do not automatically read private messages or incident evidence.
- “Happy to be asked” category hints are private matching data by default.

## 11. Human gates

Codex must stop for human approval before:

1. adopting a production name;
2. publishing terms, waivers, privacy policy, or prohibited-category policy;
3. applying the production database migration;
4. enabling production auth/OTP delivery;
5. enabling exact-location storage;
6. opening WhatsApp templates or proactive messaging;
7. enabling payments or insurance in any later phase;
8. launching beyond the controlled pilot.
