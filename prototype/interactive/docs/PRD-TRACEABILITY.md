# PRD Traceability — P0 Prototype

This document maps the implementation-grade PRD to the clickable prototype. “Demonstrated” means the interaction is executable with fake data. “Specified” means the UX is represented or documented but requires production services. “Out of P0” means intentionally deferred by the PRD.

## 1. Core MVP acceptance criteria

| PRD acceptance criterion | Prototype route/behavior | Status |
|---|---|---|
| Create a one-Need Ask from ordinary language and publish in under 60 seconds | `#/create` → `#/draft` → `#/share`; sample ladder prompt and deterministic extraction | Demonstrated |
| First-time user opens WhatsApp-shared link and submits an Offer without installing | `#/ask/ladder?visitor=1` → `#/contribute/ladder` → `#/offer-details/ladder` → `#/verify/ladder` → `#/offer-sent/ladder` | Demonstrated |
| An unlisted item can be offered | Offer details accept free-text “Six-foot fiberglass ladder”; no inventory step | Demonstrated |
| Ask owner accepts an Offer and forms a private Plan | `#/owner/offers` → accept Janet → `#/plan/ladder` | Demonstrated |
| Physical item can be handed off, extended, returned and confirmed | `#/handoff/ladder` → `#/loan/ladder` → `#/extension/ladder` / `#/return/ladder` → simulated owner confirmation | Demonstrated |
| Event contains several Needs and displays live coverage | Birthday draft and `#/status/birthday`; visitor view `#/ask/birthday?visitor=1` | Demonstrated |
| Advice/help completes without a Loan | `#/ask/sprinkler?visitor=1` and contribution type **I know how** | Interaction demonstrated; completion state specified |
| Completed item can be saved match-only without full listing | `#/save-resource` | Demonstrated |

## 2. Privacy and safety acceptance criteria

| PRD acceptance criterion | Prototype evidence | Status |
|---|---|---|
| Shared links expose no exact address, contact details, private Resources or other Circle content | Public shared-Ask shell contains only scoped Ask context | Demonstrated visually; production authorization required |
| Cross-Circle authorization tests pass | Tenant model documented in PRD and production path | Specified; requires database/RLS |
| Circle admins cannot query unrelated private messages or exact locations | Admin UI repeatedly states and respects scoped-access model; private thread separate | Demonstrated conceptually; production RLS required |
| R3 categories are blocked | Rules and safety copy represent prohibited categories | Specified; deterministic production policy required |
| Elevated-risk handoff requires disclosure/acknowledgment | `#/handoff/ladder` | Demonstrated |
| Incident evidence is private and scoped | `#/incident`; Admin Reports tab requires assignment | Demonstrated conceptually |
| Users can block, report, pause matching and leave a Circle | Report `#/incident`, quiet mode `#/hints`, leave Circle in `#/settings`; blocked-members entry represented | Demonstrated/specification mix |

## 3. Reliability acceptance criteria

| PRD acceptance criterion | Prototype/production handling | Status |
|---|---|---|
| Offer acceptance is atomic and idempotent | Single accept interaction is demonstrated; transactional requirement documented | Production implementation required |
| Reminder jobs retry safely | Notification strategy and production path specify outbox/provider abstraction | Production implementation required |
| AI failure falls back to manual fields | Composer includes **Skip the smart draft** and deterministic manual draft path | Demonstrated |
| WhatsApp share failure has copy-link fallback | `#/share` includes **Copy link** | Demonstrated |
| Error monitoring and audit events are operational | Audit UI represented; production stack specified | Production implementation required |
| Database backups configured | PRD/production requirement | Production implementation required |

## 4. Quality acceptance criteria

| PRD acceptance criterion | Evidence | Status |
|---|---|---|
| Critical Playwright flows pass on mobile viewports | `tests/smoke.py`; screenshots in `tests/screenshots/` | Demonstrated |
| WCAG 2.2 AA has no known critical blockers | Semantic HTML, keyboard card links, labels, contrast-oriented tokens, reduced motion | Partial; formal review still required |
| Analytics events match definitions and omit prohibited PII | Event dictionary specified in PRD and UX spec; not emitted in static prototype | Production implementation required |
| Legal/privacy documents approved | Explicitly outside prototype | Human/legal gate |
| Named operator can respond to pilot issues | Pilot operation requirement in PRD | Human/operations gate |

## 5. P0 Release 0 screen inventory

| Release 0 requirement | Prototype route |
|---|---|
| Shared Ask page | `#/ask/ladder?visitor=1` |
| Quick Ask composer | `#/create` with ladder sample |
| Event Ask composer | `#/create` default birthday sample |
| Contribution chooser | `#/contribute/ladder` |
| Offer confirmation | `#/offer-sent/ladder` |
| Plan details | `#/plan/ladder` |
| Handoff and return | `#/handoff/ladder`, `#/loan/ladder`, `#/return/ladder` |
| Home dashboard | `#/home` |
| Resource-save prompt | `#/save-resource` |
| Incident flow | `#/incident` |
| Basic admin queue | `#/admin`, Reports tab |

## 6. P0 member screen inventory

| PRD screen | Prototype location | Coverage |
|---|---|---|
| Shared Ask landing | `#/ask/ladder?visitor=1` | Full |
| Contribution chooser | `#/contribute/ladder` | Full |
| Offer details | `#/offer-details/ladder` | Full |
| Minimal identity verification | `#/verify/ladder` | Full simulation |
| Offer submitted confirmation | `#/offer-sent/ladder` | Full |
| Natural-language composer | `#/create` | Full |
| Draft review and edit | `#/draft` | Full prototype behavior |
| Multi-Need editor | Within `#/draft` | Add/remove/quantity/edit demonstrated |
| Publish/share screen | `#/share` | Full simulation |
| Ask status and coverage | `#/status/birthday` | Full |
| Offer inbox | `#/owner/offers` | Full simulation |
| Commitment/Plan details | `#/plan/ladder` | Full |
| Private coordination thread | `#/messages/ladder` | Full fake-data interaction |
| Handoff confirmation | `#/handoff/ladder` | Full |
| Active Loan page | `#/loan/ladder` | Full |
| Extension request | `#/extension/ladder` | Full simulation |
| Return confirmation | `#/return/ladder` | Full simulation |
| Issue report | `#/incident` | Full simulation |
| Completion and thank-you | `#/complete` | Full |
| Resource-save prompt | `#/save-resource` | Full |
| Home dashboard | `#/home` | Full |
| My Asks | `#/asks` plus status page | Partial; dedicated owned filter specified |
| My commitments and borrowed items | `#/mine` | Full core representation |
| Resource Hints and quiet mode | `#/hints` | Full |
| Saved item detail/edit | Represented inside `#/mine` | Screen specified, detail edit deferred |
| Circle join/request | Post-Offer invitation plus Admin Membership tab | Partial |
| Profile and notification preferences | `#/settings` | Full prototype representation |
| Circle rules and privacy | `#/circle/rules` | Full |

## 7. P0 admin screen inventory

| PRD screen | Prototype location | Coverage |
|---|---|---|
| Pending memberships | `#/admin`, Membership | Full prototype |
| Member detail with scoped fields | Membership cards + UX specification | Partial |
| Invite links | `#/admin`, Invite links | Full prototype |
| Reported-content queue | Incident/report architecture | Partial |
| Incident list | `#/admin`, Reports | Full prototype |
| Incident review | Assignment/scoped-access concept | Partial |
| Circle settings and prohibited categories | `#/circle/rules` + PRD | Specified |
| Audit log summary | `#/admin`, Audit log | Full prototype |
| Aggregate pilot health | `#/admin`, Overview | Full prototype |

## 8. Growth and activation thesis coverage

| Product thesis | Prototype behavior |
|---|---|
| Viral unit is the Ask, not the invitation | Shared Ask is the primary logged-out entry |
| No inventory cold-start | Composer begins with demand; Offer can be unlisted |
| Help is onboarding | Identity appears after contribution details |
| WhatsApp remains attention layer | Share screen and WhatsApp-style preview |
| Completion drives social proof | Completion card with aggregate gratitude |
| Inventory emerges from success | Resource-save prompt after confirmed return |
| Retention without feed addiction | Home is an obligations/opportunities dashboard |
| Protect generous members | Private matching, quiet mode and private declines |

## 9. Intentionally deferred from P0

- Real passwordless authentication.
- Supabase schema and RLS.
- Transactional email/SMS/WhatsApp delivery.
- One-to-one WhatsApp assistant webhooks and Flows.
- Voice/image AI extraction.
- Real Open Graph image rendering.
- Multi-Circle switcher.
- Searchable saved-item library.
- Direct booking of Circle-owned assets.
- Payments, deposits, insurance or rental fees.
- Production incident evidence storage.
- Legal documents and live safety operations.
