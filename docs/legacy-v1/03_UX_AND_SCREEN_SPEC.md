# UX and Screen Specification

## 1. Experience rules

1. First value before profile completion.
2. Mobile web first; no installation gate.
3. The shared Ask explains the need before explaining the product.
4. One primary action per screen.
5. Details appear only when necessary.
6. Declines remain private.
7. No infinite feed; home prioritizes obligations and actionable needs.
8. Human language: Ask, Offer, Plan, Borrowed item, Return, Thanks.
9. Avoid marketplace language such as listing, order, seller, buyer, rating, checkout fee, or transaction value.
10. AI suggestions are visibly editable drafts.

## 2. Primary navigation

Authenticated member mobile tabs:

- `Home`
- `Asks`
- center `+` action
- `Inbox`
- `Me`

Desktop uses the same destinations in a restrained top or side navigation. Admin tools are separated from the member experience.

## 3. Screen inventory

### S01 — Shared Ask page

**Audience:** signed-out visitor, verified guest, or member arriving from WhatsApp.

**Goal:** understand the need and contribute in under one minute.

**Required content:**

- Call On identity, subtle.
- Circle name.
- Requester first name and optional general neighbor context.
- Ask title and plain-language summary.
- Needed-by time.
- General area only; never exact address.
- Need lines with requested, covered, and remaining quantities.
- Ask state.
- Privacy note: exact coordination details appear only after acceptance.

**Primary CTA:** `I can help`.

**Secondary:** `Share` if Ask is open; `How this works`.

**States:** open, partially covered, covered, expired, cancelled, completed, link invalid, guest access revoked.

**Do not show:** other active Asks, Circle member directory, saved inventory, phone/email, exact address, public lender names by default.

### S02 — Contribution chooser

Options, filtered to the Need:

- `I can lend it`
- `I can give it`
- `I can help`
- `I know how`
- `I have another idea`

Each choice includes one short explanatory line. The visitor may return without submitting. No penalty or public signal.

### S03 — Offer details

Ask only fields relevant to the contribution:

- Item/help description.
- Quantity.
- Availability or timing.
- Conditions or constraints, optional.
- Photo, optional.
- For moderate-risk physical item: included components and known issue disclosure.

An unlisted item is valid. Never redirect to “create a listing” first.

### S04 — Minimal identity verification

Shown only after contribution details are ready.

Required:

- First name.
- Phone OTP preferred or email fallback.
- 18+ confirmation.
- Agreement to Circle and transaction rules.

Optional after success, not during this step:

- Last name.
- Photo.
- Exact address.
- Biography.
- Inventory.

### S05 — Offer submitted

Show:

- Offer summary.
- Ask owner response pending.
- Private withdrawal action.
- Link to return later.
- Optional Circle join request only after Offer exists.

### S06 — Create Ask: natural-language entry

Header: `What are you trying to do or find?`

Textarea placeholder:

> “Hosting a backyard birthday Saturday. Looking for two folding tables, a big cooler, and maybe a pop-up shade tent. Setup is around 10 AM.”

Supporting shortcuts:

- Borrow something.
- Host an event.
- Ask for guidance.
- Offer something.

Primary CTA: `Review my Ask`.

Manual fallback: `Skip the smart draft`.

### S07 — Review structured draft

Editable sections:

- Title.
- Ask type.
- Summary.
- Need lines and quantities.
- Needed-by date/time.
- Expiry.
- General location.
- Audience/Circle.
- Risk flag or prohibited-category block.

AI confidence is not displayed as a mysterious score. Low-confidence fields are highlighted with a simple prompt such as `Check this date`.

Primary CTA: `Publish Ask`.

### S08 — Share Ask

Show the canonical Ask preview and actions:

- `Share to WhatsApp`
- `Share…` native share sheet
- `Copy link`

Prefilled copy should state what remains, date, Circle, and URL. It must not include exact address or private names.

### S09 — Member home

Order:

1. Items requiring action now.
2. Member’s active Asks.
3. Needs the member may be able to help with.
4. Recently completed Circle outcomes.
5. Optional prompt to make an Ask.

Never sort by controversy, comment count, or generic engagement.

### S10 — Ask owner detail

Show:

- Status and coverage.
- Needs and accepted quantities.
- Active Offers.
- Accepted Plans.
- Timeline.
- Edit/cancel/complete actions.
- Share current remaining needs.

Material edits after Offers require a warning and affected-party notification.

### S11 — Offers list/detail

Each Offer shows:

- Contributor first name.
- Contribution type.
- Quantity and item/help description.
- Availability and conditions.
- Existing Resource only when contributor explicitly linked it.
- Accept, decline, or message after acceptance according to policy.

The owner may accept multiple Offers until quantity is covered. Prevent accidental over-acceptance.

### S12 — Plan/private coordination

Parties: requester and accepted contributor; moderator only after scoped incident escalation.

Show:

- Accepted contribution.
- Date/time.
- Pickup/meeting location.
- Private messages.
- Next required action.
- Cancel/withdraw rules.

Exact location is permitted here, not on the shared Ask.

### S13 — Active Loan

Show:

- Item description and owner/borrower.
- Handoff state.
- Due time with timezone.
- Pickup/return arrangement.
- Included components if applicable.
- Timeline of custody events.
- `Request extension`, `Mark returned`, `Report a problem`.

### S14 — Return confirmation

Borrower: `I returned it`.

Owner receives:

- `Confirm return`
- `Report a problem`

Return confirmation closes custody. An issue creates a private incident and preserves the Loan timeline.

### S15 — Completion and thanks

Show outcome, contributors, and a lightweight celebration. Offer:

- Send private thanks.
- Share completion card to WhatsApp.
- Save the offered item privately for future matching.
- Answer one optional relationship question: `Did this help you meet or reconnect with a neighbor?`

No confetti loop, streak, score, or competitive badge.

### S16 — Progressive Resource save

Prompt after successful item contribution:

> Save this item so future requests are easier?

Options:

- `Yes — people may ask me privately`
- `Keep it private for me`
- `Not now`

Only ask additional details when needed. Default visibility is `matching only`, not Circle-wide browsing.

### S17 — Incident report

Categories:

- Late/non-return.
- Missing part.
- Damage.
- Unsafe item.
- Unwanted contact or harassment.
- Other.

Evidence is private. Do not create a public post. Explain who can view the report and what happens next.

### S18 — Admin console

Admin may manage:

- Membership requests and suspensions.
- Circle rules and risk limits.
- Flagged Asks/Resources.
- Incident queue with scoped access.
- Pilot health metrics.
- Audit access records.

Admin does not receive a general ability to read private Plan conversations or see all exact addresses.

## 4. Required cross-screen states

Every data surface must intentionally design:

- Loading/skeleton.
- Empty state with one useful action.
- Recoverable validation error.
- Network retry.
- Permission denied.
- Expired/revoked link.
- Suspended membership.
- Deleted/cancelled object.
- Concurrent update conflict.
- Offline or poor-network behavior for form drafts where practical.

## 5. Essential microcopy

- Create: `Make an Ask`
- Shared page CTA: `I can help`
- Offer accepted: `You’re connected. Coordinate the details privately.`
- Handoff: `Mark as picked up`
- Borrower return: `I returned it`
- Owner closure: `Confirm return`
- Extension: `Ask for more time`
- Private decline: `Not this time`
- Empty offers: `No offers yet. Share the Ask so the right neighbors see it.`
- Inventory prompt: `Save this item for easier future asks?`
- Privacy: `Exact pickup details are shared only after an offer is accepted.`
