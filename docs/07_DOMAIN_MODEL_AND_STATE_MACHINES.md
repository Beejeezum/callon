# Domain Model and State Machines

## 1. Aggregate map

```text
Profile
  └── Membership ── Circle
                       ├── Ask
                       │    ├── Need
                       │    ├── Offer ── optional Resource
                       │    │    └── Commitment
                       │    │          ├── Conversation / Messages
                       │    │          └── optional Loan / LoanEvents
                       │    └── ShareLink
                       ├── ResourceHint
                       ├── Resource
                       ├── Incident
                       └── Audit / Outbox / NotificationJobs
```

## 2. Entity responsibilities

### Profile

Global minimal identity linked one-to-one with `auth.users`. Contains display-safe fields only. Contact details live in `private.profile_contacts`.

### Circle

Private tenant and policy boundary. Holds join policy, enabled feature flags, safety configuration, and default terms version.

### Membership

Profile-to-Circle relationship with role, status, display context, quiet mode, and restrictions. Authorization is based on this object, not user-editable profile metadata.

### Ask

The central request/project/event. It owns Need lines, publication, share version, and aggregate status. It does not contain exact address.

### Need

A quantifiable request. Tracks requested, committed, and completed quantities separately.

### Offer

A contributor’s proposal to satisfy one Need. `resource_id` is optional. An Offer remains a historical proposal after acceptance; accepted lifecycle proceeds through Commitment.

### Commitment

Immutable snapshot of an accepted contribution plus its active coordination lifecycle. Contains private schedule references and conversation.

### Loan

Physical custody ledger for `lend` Commitments only. State transitions append Loan Events.

### Resource Hint

Private category-level willingness; not proof of ownership or availability.

### Resource

Optional owner-confirmed reusable item. Personal Resource remains request-to-confirm in P0.

### Share Link

Opaque scoped capability that resolves to one sanitized Ask projection. Stored hashed; revocable and versioned.

### Incident

Private issue workflow; evidence and elevated access are more restricted than normal domain data.

### Audit Event

Append-only record of sensitive state changes and access. Not user-editable.

### Outbox Event

Reliable asynchronous work created in the same transaction as domain state.

## 3. State enums

### Membership

```text
invited → pending → active → restricted → suspended → left
```

Transitions are explicit; `left` and `suspended` do not erase historical obligations.

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
  → open
  → covered
  → cancelled
  → expired
covered
  → in_progress
  → partially_covered   when a Commitment fails
  → completed           for completed nonphysical help
in_progress
  → completed
  → partially_covered   if help fails and Need reopens
completed/cancelled/expired
  → reopened            explicit owner action + policy + audit
```

Prefer deriving `open/partially_covered/covered` from Need totals. Persist status for queryability, but recalculate transactionally.

### Need

```text
open → partially_covered → covered → completed
open/partially_covered/covered → waived
covered → partially_covered when accepted quantity is cancelled
```

Invariants:

```text
0 <= quantity_completed <= quantity_committed <= quantity_requested
```

An owner may intentionally accept overage only through an explicit override field and audit; omit this from P0 UI.

### Offer

```text
draft → offered
offered → accepted | declined | withdrawn | expired
accepted = terminal Offer state; lifecycle continues in Commitment
```

### Commitment

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

A physical lend Commitment creates exactly one Loan. Advice/help/give may complete directly.

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
  → checked_out (denied)
  → checked_out with new due_at (approved)
  → overdue
return_marked
  → returned
  → issue_open
issue_open
  → returned
  → unresolved_closed
returned = terminal custody state
```

### Resource

```text
active ↔ paused
active/paused → archived
```

Visibility:

```text
private
match_only
circle_visible
```

Willingness:

```text
happy_to_be_asked
project_only
usually_weekends
ask_each_time
not_lending_now
```

### Incident

```text
reported → triaged → assigned → waiting_on_party → resolved | closed_no_action
reported/triaged/assigned → urgent_security
```

## 4. Core invariants

- Every tenant-scoped row has `circle_id` directly, even when derivable.
- Actor and affected objects must share the same Circle unless a valid scoped guest token is involved.
- Ask owner cannot submit an Offer to their own Need in P0.
- Offer contributor may not inspect competing Offers.
- Acceptance cannot exceed remaining quantity under concurrent requests.
- Acceptance snapshots terms and creates Commitment atomically.
- Exact location is not stored on Ask, Need, Offer, or public Profile.
- Loan has one lender and one borrower.
- Resource owner must equal lender when a Resource is referenced.
- Advice/help/give do not create Loan.
- Completed Loan Events and Audit Events are never cascade-deleted with an Ask.
- Suspended users retain narrow access required to return items or answer an incident.
- Prohibited category cannot publish even if client validation is bypassed.
- Provider retries cannot duplicate a domain transition or outbound notification.

## 5. Concurrency strategy

Use database functions/transactions and row locks for:

- Offer acceptance and Need quantity update;
- handoff confirmation;
- extension response;
- return confirmation;
- membership role/status changes;
- share-token rotation;
- notification-job claiming.

Each mutation accepts an idempotency key scoped to actor + operation. Persist result and return the prior result on safe replay.

## 6. Deletion and retention semantics

- User-visible objects are archived/withdrawn rather than hard-deleted when obligations or audit history exist.
- Account deletion pseudonymizes display fields after legal/operational retention rules are applied.
- Contact and exact-location data is deleted earlier than ledger facts where feasible.
- Incident evidence follows a separate retention schedule.
- Analytics identifiers are disconnected/pseudonymized on deletion request.
