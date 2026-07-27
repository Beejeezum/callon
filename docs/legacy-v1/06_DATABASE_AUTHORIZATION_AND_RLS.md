# Database, Authorization, and RLS Specification

## 1. Database principles

- PostgreSQL is the source of truth.
- Every domain table carries `circle_id` directly unless it is truly global.
- Use UUID primary keys and `timestamptz`.
- Use database constraints for state-independent invariants.
- Use transactions for multi-row state changes.
- Use an outbox table for reliable side effects.
- Use soft archival for user-visible objects when ledger history exists.
- Do not use JSON blobs in place of relational core objects.

See `schemas/database-blueprint.sql` for the initial table contract. Convert it into ordered migrations; do not apply it as one unreviewed production script.

## 2. Session and identity

- Supabase Auth provides verified user identity.
- `profiles.id` references `auth.users.id`.
- Use cookie-backed SSR sessions in Next.js according to current official Supabase guidance.
- Do not trust a user ID supplied by the client; derive it from the verified session.
- Phone OTP is preferred. Email OTP/magic link is fallback.
- Do not expose whether a phone/email belongs to another Circle member.

## 3. Roles

- `member`
- `moderator`
- `circle_admin`
- `platform_admin`

Platform administrator privileges should be implemented through server-only paths and audited. Do not encode a universal `is_admin` flag in public client claims without careful review.

## 4. Authorization matrix

| Action | Scoped guest | Active member | Ask owner | Offer contributor | Moderator | Circle admin |
|---|---:|---:|---:|---:|---:|---:|
| View one shared Ask | Yes, valid token | Yes | Yes | Yes | Yes | Yes |
| Browse Circle Asks | No | Yes | Yes | Yes | Yes | Yes |
| Create Ask | No | Yes | Yes | Yes | Yes | Yes |
| Submit Offer to shared Ask | Yes, after verification | Yes | Yes* | Yes | Yes | Yes |
| View all Offers on Ask | No | No | Yes | Own only | Scoped incident only | No by default |
| Accept/decline Offer | No | No | Yes | No | No | No |
| View Plan logistics | No | Party only | Party | Party | Incident-scoped | No by default |
| Edit saved Resource | No | Owner only | Owner only | Owner only | Moderation restriction only | No by default |
| Confirm Loan handoff/return | No | Party only | Party if involved | Party if involved | Incident-scoped | No |
| Suspend membership | No | No | No | No | Yes where permitted | Yes |
| View incident evidence | No | Reporter/subject as policy allows | Linked party | Linked party | Assigned/scoped | Not automatically |

`*` Ask owner offering to their own Ask should be blocked in P0.

## 5. Shared Ask token

A shared URL grants read access only to one Ask’s public projection. Recommended implementation:

- Opaque, high-entropy token stored hashed or as a signed token with revocation/version support.
- Ask stores `share_version` and `share_revoked_at`.
- Public query returns an explicit projection/view, not raw table rows.
- Token does not reveal sequential IDs.
- Token grants no access to other Circle data.
- Offer submission still requires verified identity before final commit.

## 6. Required RLS policy categories

For each exposed table, define and test:

- SELECT own/Circle/scoped rows.
- INSERT actor-bound rows.
- UPDATE only permitted fields and rows.
- DELETE disabled or restricted; prefer archival/domain operations.

Minimum hostile tests:

1. Member of Circle A cannot select Circle B Ask, Need, Offer, Plan, Loan, Resource, Message, Incident, or audit row.
2. Guest token for Ask A cannot access Ask B in the same Circle.
3. Contributor cannot view competing private Offer details.
4. Circle admin cannot read private Plan messages by default.
5. User cannot promote their Membership role.
6. User cannot mutate another member’s Resource.
7. Suspended member cannot create a new Ask or Offer.
8. Browser client cannot insert an audit event with a forged actor.
9. Storage path for Circle A cannot be read from Circle B.
10. An expired/revoked share token no longer returns the projection.

## 7. Server-side checks

RLS is necessary but not sufficient. Domain services must also check:

- Current state permits transition.
- Requested quantity remains available.
- Actor is the required party.
- Category/risk policy permits action.
- Terms version is current.
- Request is idempotent.
- Concurrent transition has not already occurred.

Use database transactions and row locks for Offer acceptance, quantity commitment, handoff, extension, and return confirmation.

## 8. Storage

Buckets should be private. Suggested path pattern:

```text
circle/{circle_uuid}/ask/{ask_uuid}/{random_uuid}.{ext}
circle/{circle_uuid}/loan/{loan_uuid}/{random_uuid}.{ext}
circle/{circle_uuid}/incident/{incident_uuid}/{random_uuid}.{ext}
```

Never put names, phone numbers, addresses, or original sensitive filenames in object paths. Signed URLs should be short-lived. Incident evidence requires stricter policies and access audit.
