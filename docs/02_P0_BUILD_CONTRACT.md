# P0 Build Contract

This document defines the exact production-pilot boundary. A feature is not P0 merely because it is easy to add.

## 1. Success condition

A pilot member can complete the following without administrator intervention:

```text
create Ask → share Ask → receive Offer → accept Offer → coordinate → hand off → return/complete → close
```

For a first-time helper, the path from shared link to a submitted Offer must require no app installation and no inventory setup.

## 2. Personas

### Requester

A verified Circle member who needs an item, material, time, skill, advice, or alternative.

### Contributor

A Circle member or permitted verified guest who responds to a specific Need. The contributor may use an unlisted item.

### Circle moderator

Handles membership, prohibited content, reports, and scoped incident review. Moderators are not omniscient community administrators.

### Circle administrator

Manages Circle settings and moderator assignment. Does not automatically receive private-message access.

### Platform operator

Server-only operational role for support, security, and data operations. Every elevated action is audited.

## 3. P0 functional requirements

### Circle and membership

- Create a Circle from an operator/admin path.
- Join through a revocable invitation or approved shared-Ask path.
- Membership states: invited, pending, active, restricted, suspended, left.
- Roles: member, moderator, circle_admin.
- A suspended member cannot start new activity but can resolve active custody or incidents.

### Ask

- Draft from a short natural-language description without AI.
- Add one or more Need lines.
- Need kinds: lend item, give item/material, time/help, advice/knowledge, recommendation, alternative.
- Add quantity, due window, general location, optional image, and optional context.
- Publish only after policy validation and owner confirmation.
- Create a revocable scoped share link.
- Display coverage per Need and overall Ask.
- Expire automatically after the event/deadline plus grace period.

### Shared Ask

- Server-rendered metadata for WhatsApp/social previews.
- Display Circle name, Ask owner display name, general location only, schedule, Needs, and coverage.
- Primary action: `I can help`.
- No roster, exact address, phone, email, private Offers, or possession map.
- Share token may be revoked and rotated.

### Offer

- Select contribution type and Need.
- Allow an unlisted item description.
- Capture quantity, availability, conditions, optional image, and message.
- Verify identity before final submission.
- Contributor can edit/withdraw while Offered.
- Ask owner can accept, decline, or ask a private clarification.
- No public decline reason or reputation impact.

### Commitment

- Acceptance atomically creates a Commitment and updates Need committed quantity.
- Snapshot accepted quantity, contribution type, timing, conditions, and terms version.
- Create a private two-party conversation.
- Reveal private logistics only to accepted parties.
- Allow either party to cancel with a reason category and notification.

### Loan

Only `lend` Commitments create a Loan.

- pending_handoff;
- confirm handoff/check-out;
- due date;
- request/respond to extension;
- overdue state;
- borrower marks returned;
- lender confirms return or reports an issue;
- append-only events;
- optional before/after notes and moderate-risk photos;
- terminal returned state cannot be rewritten.

### Progressive resource memory

After a successful physical lend:

- ask the owner whether to remember the item;
- allow one-tap private matching, Circle visibility, or do not save;
- prefill safe details from the completed Offer;
- allow later enrichment and pausing;
- never make a saved personal item directly bookable.

### Messaging and notifications

- one private conversation per Commitment;
- plain text plus safe image attachment in P0;
- immediate email for material state changes;
- scheduled pickup/due/overdue reminders;
- in-app notification inbox;
- bounded retries and idempotent delivery;
- user notification preferences and quiet hours.

### Safety and moderation

- prohibit unsupported categories at draft and publish boundaries;
- report Ask, Offer, Message, Commitment, Loan, or member;
- private incident workflow;
- moderator access requires assignment/scope and produces an audit event;
- restriction/suspension controls;
- no public dispute threads.

### Admin/operations

- Circle members and statuses;
- active Asks, Commitments, Loans, and overdue items;
- incidents awaiting review;
- provider health and failed notification jobs;
- immutable audit search for authorized platform operators;
- no generic “view all private conversations” control.

## 4. P0 routes

```text
/                         authenticated home or public landing decision
/guide                    public 60-second product and privacy guide
/login                    OTP/magic-link entry
/auth/callback            provider callback
/join/[token]             invitation acceptance
/share/[token]            scoped shared Ask
/asks/new                 Ask wizard
/asks/[askId]             Ask owner/member detail
/asks/[askId]/offers      Ask-owner Offer inbox
/offers/[offerId]         Offer detail for authorized party
/commitments/[id]         accepted plan and private coordination
/loans/[id]               custody timeline and actions
/activity                 My Asks, Offers, Loans, Saved Items
/inbox                    conversations and notifications
/resources/[id]           saved Resource owner view
/profile                   profile, membership, preferences
/admin                     scoped Circle/operator tools
```

## 5. Performance requirements

- Mobile-first at 390 × 844 CSS px.
- Shared Ask server response target: p75 under 600 ms from supported region after warm-up.
- Primary page interaction target: INP under 200 ms on representative mobile hardware.
- LCP target: under 2.5 seconds on a typical 4G profile.
- Avoid loading analytics, messaging, admin, or AI code on public/shared routes unless needed.
- Optimize uploaded images before display; reject excessive file sizes server-side.

These are pilot targets, not contractual SLAs. Measure them in staging and production.

## 6. Accessibility requirements

- WCAG 2.2 AA target.
- Full keyboard operation.
- Visible focus.
- Minimum 44 × 44 px hit target; primary buttons generally 48 px high.
- Form errors associated with fields and announced appropriately.
- Color never carries state alone.
- Reduced-motion support.
- Screen-reader checks for Ask wizard, Offer submission, acceptance, and return.

## 7. Definition of done for each feature

A feature is done only when it has:

1. approved state transitions and authorization matrix;
2. Zod/server validation;
3. database migration and RLS policies where applicable;
4. hostile cross-Circle tests;
5. domain unit/integration tests;
6. Playwright happy path and key failure state;
7. analytics event with no private payload;
8. audit/outbox behavior where material;
9. loading, empty, error, success, and retry states;
10. responsive and accessibility review;
11. documentation and decision-log update;
12. no production secret or manual dashboard dependency hidden from the setup guide.

## 8. Pilot exit criteria

Run at least 30 real Asks across one to three controlled Circles. Proceed only if:

- at least 60% receive a useful Offer;
- median time to first useful Offer is under 12 hours;
- at least 50% of published Asks reach completed/closed;
- at least 90% of physical Loans close without unresolved issue;
- at least 30% of contributors participate again within 60 days;
- incident rate remains operationally manageable;
- members report that the product reduces awkwardness versus chat-only coordination;
- no critical authorization or privacy incident occurs.

Do not optimize for daily active use. Optimize for successful assists per active Circle and recall at the next real need.
