# P0 Build Contract — Release 1 Closed Pilot

This document is the exact implementation boundary for the first production build. It narrows the full PRD into a buildable release.

## 1. Release objective

Ship a mobile-first private web app for one HOA Circle that supports the complete Ask → Offer → Plan → Loan/Help → Completion loop and can be shared into WhatsApp without requiring app installation.

## 2. Required user journeys

### Journey A — Requester creates and shares a quick Ask

1. Authenticated active member taps `Make an Ask`.
2. Composer starts with a single natural-language textarea.
3. User enters: “Need a six-foot ladder Saturday morning to hang lights.”
4. System produces a reviewable draft with title, date/time, one Need, quantity, location granularity, and risk class.
5. User can edit every inferred field or skip AI and enter manually.
6. User publishes.
7. System creates canonical Ask URL and privacy-safe social preview.
8. User shares through native share sheet or WhatsApp deep link.

Acceptance target: median creation-to-share time under 60 seconds in pilot usability sessions.

### Journey B — First-time contributor from WhatsApp

1. Visitor opens scoped Ask link.
2. Page shows Circle name, requester first name, summary, timing, general location, remaining quantity, and contribution choices.
3. Page does not show exact address, phone, private inventory, other Circle content, or private contributor identities.
4. Visitor taps `I can help` and selects lend/give/help/know how/alternative.
5. Visitor supplies only contribution-specific details.
6. Identity verification occurs after contribution intent, not before.
7. Offer is submitted and owner is notified.
8. Visitor receives confirmation and a route to their Offer/Plan.

### Journey C — Requester accepts and coordinates

1. Owner sees all active Offers grouped under the relevant Need.
2. Owner may accept one or more Offers up to the requested quantity.
3. Acceptance creates a Commitment/Plan and private logistics conversation.
4. Exact pickup location may be shared only inside the accepted Plan.
5. A declined Offer is private.
6. Material Ask changes notify affected contributors.

### Journey D — Physical Loan

1. Accepted lend Offer can create a Loan.
2. Parties confirm expected handoff and due time.
3. Low-risk items require lightweight handoff; moderate-risk items can require included-parts confirmation and optional condition photo.
4. Lender or borrower marks handoff.
5. Loan becomes `checked_out`.
6. Borrower can request extension; lender accepts or declines.
7. Borrower marks returned.
8. Lender confirms return or reports issue.
9. Loan closes through append-only Loan Events.
10. User may save the item for future private matching.

### Journey E — Non-physical help

Advice, knowledge, volunteer help, and alternatives can be accepted and completed without creating a Loan. Completion still records the contribution and permits a private thank-you.

### Journey F — Multi-Need event

An Event Ask can contain several Need lines with requested and covered quantities. Contributors claim only one or more specific Needs. The Ask owner can share a current “what remains” status.

## 3. P0 features

### Identity and Circle

- Passwordless phone OTP preferred; email OTP/magic-link fallback.
- Minimal profile: first name, verified contact, 18+ confirmation.
- Circle membership states: pending, active, suspended, left, rejected.
- Roles: member, moderator, Circle admin, platform admin.
- Revocable Circle invitation links.
- Scoped Ask guest access.

### Asks

- Ask types: quick need, project, event, offer.
- Natural-language composer and manual fallback.
- One or many Needs.
- Categories: item, material, volunteer help, advice, skill, alternative.
- Timing/expiry required.
- States: draft, open, partially covered, covered, in progress, completed, cancelled, expired.
- Edit, cancel, complete, reopen under documented rules.
- Share URL, WhatsApp deep link, native share, social preview.

### Offers and Plans

- Contribution types: lend, give, help, know how, alternative.
- Unlisted item allowed.
- Partial quantity allowed.
- Timing/conditions allowed.
- Offer states: offered, accepted, declined, withdrawn, expired.
- Accepted Offers become Commitments/Plans.
- Private Plan logistics and messages.

### Loans

- Handoff, due date, extension, overdue, return marked, return confirmed, issue.
- Immutable event history.
- Risk-adaptive handoff.
- No fee, deposit, payment, or insurance behavior.

### Progressive memory

- Post-completion “save this item?” prompt.
- Resource visibility: private, private matching only, Circle-visible.
- Resource Hints: broad categories a member is comfortable being asked about.
- Quiet mode and staleness controls.

### Safety and operations

- Prohibited category enforcement.
- Private incident reporting.
- Scoped moderator queue.
- Admin membership management.
- Audit events.
- Essential notifications.
- Privacy-filtered analytics.

## 4. Explicit P0 exclusions

- WhatsApp Business inbound assistant.
- Automatic reading or joining of an existing group.
- Proactive matching notifications.
- Searchable item catalog as the default home experience.
- Multi-Circle participation.
- Public or cross-community discovery.
- Payments, deposits, insurance, fees, tips, or reimbursements.
- Native iOS/Android applications.
- Public reviews, ratings, scores, badges, or leaderboards.
- Contractor marketplace or commercial solicitation.
- General discussion feed.
- High-risk equipment or licensed work.

## 5. P0 release gate

Do not call the release pilot-ready until all items in `docs/10_TESTING_SECURITY_AND_RELEASE_GATES.md` pass, including hostile cross-Circle authorization tests and the complete mobile Playwright flow.
