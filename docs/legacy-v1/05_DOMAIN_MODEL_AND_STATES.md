# Domain Model and State Machines

## 1. Core relationship

```text
Circle
  ├── Memberships
  ├── Asks
  │     ├── Need lines
  │     ├── Offers
  │     │     └── accepted Commitment / Plan
  │     │            └── optional Loan
  │     └── completion outcome
  ├── Resource Hints
  ├── saved Resources
  └── Incidents / audit events
```

## 2. Objects

### Profile

One verified adult identity. Minimal global attributes only. Circle-specific context belongs on Membership.

### Circle

Private tenant/community. All meaningful product data is scoped by `circle_id`.

### Membership

Joins Profile to Circle with role, status, optional neighbor context, quiet mode, and moderation restrictions.

### Ask

The central demand or offer object. Types: quick need, project, event, offer. An Ask owns one or more Need lines.

### Need

A specific item, material, volunteer, advice, skill, or alternative requirement with quantity and fulfillment state.

### Offer

A proposed contribution to one Need. The item may be freeform; `resource_id` is optional.

### Commitment / Plan

Created when an Offer is accepted. It freezes the accepted quantity, conditions, and parties. It contains private logistics and may create a Loan.

### Resource Hint

Private willingness metadata, e.g. “comfortable being asked about party gear.” It is not a claim that a particular item exists or is available.

### Resource

An optional saved item confirmed by its owner. It is not directly bookable in P0.

### Loan

Custody record for a physical lend Commitment. It has append-only Loan Events.

### Incident

Private issue report linked to the relevant Circle, Ask, Commitment, Loan, or Message.

## 3. State machines

### Ask

```text
draft
  → open
open
  → partially_covered
  → covered
  → cancelled
  → expired
partially_covered
  → covered
  → open
  → cancelled
  → expired
covered
  → in_progress
  → partially_covered   when an accepted commitment is cancelled
  → completed           for nonphysical work already finished
  → cancelled           only with affected-party handling
in_progress
  → completed
  → partially_covered   only when a commitment fails and more help is required
completed
  → reopened            only by owner within policy; completed Loans remain immutable
cancelled / expired
  → reopened            only under explicit owner action and policy
```

Ask status is derived from Need coverage and active Commitments where possible; avoid arbitrary UI-only state changes.

### Need

```text
open → partially_covered → covered → completed
open/partially_covered → waived
covered → partially_covered when accepted quantity is cancelled
```

Maintain `quantity_requested`, `quantity_committed`, and `quantity_completed`. Do not infer all three from one counter.

### Offer

```text
offered
  → accepted
  → declined
  → withdrawn
  → expired
accepted
  → cancelled through Commitment rules, not by rewriting Offer history
```

An accepted Offer is immutable as a historical proposal; subsequent lifecycle belongs to Commitment.

### Commitment / Plan

```text
active
  → fulfilled
  → cancelled_by_requester
  → cancelled_by_contributor
  → issue_open
issue_open
  → fulfilled
  → cancelled
```

### Loan

```text
pending_handoff
  → checked_out
  → cancelled
checked_out
  → extension_requested
  → overdue
  → return_marked
  → issue_open
extension_requested
  → checked_out      if denied
  → checked_out      with updated due time if accepted
  → overdue          if due passes
return_marked
  → returned
  → issue_open
issue_open
  → returned
  → unresolved_closed by moderator policy
returned = terminal custody state
```

Every transition appends a Loan Event with actor, timestamp, prior state, new state, and safe metadata.

## 4. Invariants

- Owner and contributor must be authorized within the same Circle or scoped guest context.
- Accepted quantities cannot exceed remaining quantity without explicit override and audit.
- Ask owner cannot accept their own Offer unless a household-collaboration feature is introduced later.
- A Loan has exactly one lender and one borrower.
- A Loan exists only for `lend` contribution type.
- A Resource owner and Loan lender must match unless a later delegated-household feature exists.
- An exact address is private Plan data, not Ask data.
- Deleting a user-facing Ask never cascades away completed custody or audit history.
- Prohibited categories cannot move from draft to open.
- Suspended members cannot create or accept new activity, but retain access needed to resolve existing custody or incidents under policy.
