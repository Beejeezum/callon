# Database Schema, Transactions, and Row Level Security

## 1. Database decision

Use one managed PostgreSQL database per environment through Supabase. PostgreSQL is the domain source of truth. Do not put authoritative product state in Vercel KV, browser storage, PostHog, WhatsApp, or email-provider metadata.

## 2. Schema separation

### `public`

Tables that may be accessed through Supabase APIs under strict RLS:

```text
profiles
circles
circle_memberships
circle_invites
categories
asks
ask_needs
offers
commitments
resources
resource_hints
resource_components
conversations
conversation_participants
messages
loans
loan_events
incidents
notification_preferences
```

### `private`

Server-only tables; revoke `anon` and `authenticated` schema access:

```text
profile_contacts
exact_locations
share_links
ask_guest_grants
incident_evidence
moderator_access_grants
notification_jobs
outbox_events
audit_events
idempotency_records
inbound_channel_messages
ai_drafts
webhook_receipts
```

## 3. Core columns

All tenant rows use UUID primary keys, `circle_id`, `created_at timestamptz`, and where mutable `updated_at timestamptz` plus `version integer`.

### Profiles

```text
profiles
- id uuid PK references auth.users on delete restrict
- display_name text
- avatar_path text nullable
- locale text
- timezone text
- status profile_status
- created_at, updated_at

private.profile_contacts
- profile_id uuid PK
- phone_e164_ciphertext bytea nullable
- phone_hash text nullable unique
- email_ciphertext bytea nullable
- email_hash text nullable unique
- verified_phone_at, verified_email_at
- key_version integer
```

Do not expose raw contact data through generated APIs.

### Circle and membership

```text
circles
- id, name, slug unique, description
- join_policy
- general_area
- settings jsonb validated by service/schema
- current_terms_version
- status

circle_memberships
- id, circle_id, profile_id
- role, status
- neighbor_context text nullable
- joined_at, restricted_at, suspended_at
- unique(circle_id, profile_id)
```

### Ask and Need

```text
asks
- id, circle_id, created_by
- ask_type
- title, description
- general_location text
- starts_at, needed_by, expires_at
- status
- cover_image_path nullable
- share_version integer default 1
- published_at, completed_at, archived_at
- version

ask_needs
- id, circle_id, ask_id
- kind
- title, description
- category_id nullable
- quantity_requested numeric(10,2)
- quantity_committed numeric(10,2) default 0
- quantity_completed numeric(10,2) default 0
- unit text nullable
- risk_level
- status
- sort_order
- check constraints for nonnegative ordered quantities
```

### Offer and Commitment

```text
offers
- id, circle_id, ask_id, need_id
- contributor_profile_id
- resource_id nullable
- offer_type
- freeform_item_name nullable
- description
- quantity
- available_from, available_until
- conditions text nullable
- image_path nullable
- status
- submitted_at, withdrawn_at, decided_at
- version

commitments
- id, circle_id, ask_id, need_id, offer_id unique
- requester_profile_id
- contributor_profile_id
- contribution_type
- quantity
- summary_snapshot jsonb
- terms_version
- status
- starts_at, due_at
- conversation_id unique
- exact_location_id nullable references private.exact_locations
- accepted_at, fulfilled_at, cancelled_at
- version
```

`summary_snapshot` stores accepted, non-sensitive historical values; do not place contact or exact address inside it.

### Location

```text
private.exact_locations
- id, circle_id
- owner_profile_id
- ciphertext bytea
- nonce bytea
- key_version integer
- location_kind
- created_at, expires_at, deleted_at
```

Encrypt in application server code with an authenticated-encryption algorithm and versioned key. Database operators can still access ciphertext; document the threat boundary. Do not log plaintext.

### Resource

```text
resources
- id, circle_id, owner_profile_id
- title, description, category_id
- image_path
- visibility
- willingness
- status
- usual_terms text nullable
- last_confirmed_at
- source_offer_id nullable
- source_loan_id nullable
- version

resource_hints
- id, circle_id, profile_id, category_id
- willingness
- visibility default match_only
- source
- last_confirmed_at
- unique(circle_id, profile_id, category_id)

resource_components
- id, circle_id, resource_id
- name, quantity, required_for_return
```

### Conversation and messages

```text
conversations
- id, circle_id
- status
- created_at, updated_at, version

conversation_participants
- conversation_id, profile_id
- participant_role
- created_at
- PK(conversation_id, profile_id)

messages
- id, circle_id, conversation_id, sender_profile_id
- body text
- attachment_path nullable
- sent_at, edited_at, deleted_at
```

P0 does not implement arbitrary direct messaging; each conversation is object-scoped.

### Loan and events

```text
loans
- id, circle_id, commitment_id unique
- lender_profile_id, borrower_profile_id
- status
- checked_out_at, due_at, return_marked_at, returned_at
- extension_requested_at nullable
- proposed_due_at nullable
- version

loan_events
- id bigserial/uuid
- circle_id, loan_id
- actor_profile_id nullable
- event_type
- metadata jsonb containing safe, non-sensitive event context
- created_at
```

Block UPDATE/DELETE on `loan_events` for application roles.

## 4. Private operational tables

### Share links

```text
private.share_links
- id, circle_id, ask_id
- token_hash text unique
- token_version
- expires_at, revoked_at
- created_by, created_at, last_accessed_at, access_count

private.ask_guest_grants
- id, ask_id, circle_id, profile_id
- share_link_id nullable
- status, expires_at, revoked_at
- unique(ask_id, profile_id)
```

Tokens are at least 128 bits of cryptographic entropy. Store hash + pepper, not raw token. Resolve server-side and return an explicit DTO.

### Outbox and notifications

```text
private.outbox_events
- id uuid
- aggregate_type, aggregate_id
- event_type
- payload jsonb (safe internal IDs, no plaintext address/contact)
- occurred_at
- processed_at nullable
- attempts
- last_error_class nullable

private.notification_jobs
- id, circle_id nullable, profile_id nullable
- channel, template_key
- payload jsonb (minimal and includes an idempotency key)
- scheduled_for, status
- attempts, locked_at, locked_by, sent_at
- provider_message_id, last_error_code
- unique(channel, template_key, payload.idempotency_key)
```

### Audit

```text
private.audit_events
- id uuid
- circle_id nullable, actor_profile_id nullable
- action
- target_type, target_id nullable
- metadata jsonb containing no plaintext secrets
- request_id nullable
- created_at
```

No plaintext message, address, contact, token, or evidence in audit metadata.

## 5. Indexes

Minimum indexes:

- all foreign keys used in policies;
- `(circle_id, status, created_at desc)` on Asks, Offers, Commitments, Loans;
- `(ask_id, status)` on Needs and Offers;
- `(contributor_profile_id, status, created_at desc)` Offers;
- `(requester_profile_id, status)` and `(contributor_profile_id, status)` Commitments;
- `(borrower_profile_id, status, due_at)` and `(lender_profile_id, status, due_at)` Loans;
- `(conversation_id, created_at)` Messages;
- partial index for due NotificationJobs;
- unique idempotency scope key;
- GIN/trigram only for approved non-sensitive Ask/Resource search fields.

Never index ciphertext as plaintext. Use normalized keyed hashes only for exact contact deduplication.

## 6. Database functions/RPCs

Implement reviewed `security invoker` or carefully constrained `security definer` functions:

```text
create_ask
publish_ask
submit_offer
accept_offer
withdraw_offer
cancel_commitment
confirm_handoff
request_extension
respond_to_extension
mark_returned
confirm_return
save_resource_from_loan
report_incident
rotate_share_link
claim_notification_jobs
```

For any `security definer` function:

- set a fixed `search_path`;
- qualify every object;
- validate `auth.uid()`/actor;
- grant execute only to intended role;
- add authorization tests;
- do not accept arbitrary SQL identifiers.

## 7. RLS policy principles

- Enable RLS in the same migration that creates each public table.
- No permissive “authenticated can select all Circle data” shortcut for private objects.
- Membership checks use a stable helper function and indexed fields.
- Role/status cannot be derived from user-editable `raw_user_meta_data`.
- Views exposed to clients must be `security_invoker` or server-only.
- Service-role/secret key is server-only and never used as a convenience browser client.

## 8. RLS matrix

### Broad Circle-readable

- Circle metadata for active members and restricted members finishing existing obligations;
- public-safe member display projection, not contacts;
- open Asks and Need lines for members allowed to read the Circle;
- Circle-visible Resources explicitly opted in.

New Asks and general Offers require an active membership. A verified non-member may receive a short-lived `private.ask_guest_grants` row for one specific shared Ask; a pending Circle membership by itself is never enough.

### Owner/party-private

- Offer: contributor and Ask owner only;
- Commitment: requester and contributor only;
- Conversation/Message: participants only;
- Loan: lender and borrower only;
- Resource: owner only unless explicitly Circle-visible;
- Resource Hint: owner only; matching occurs server-side;
- Incident: reporter/subject only as policy permits plus assigned moderator.

### Server-only

- contacts;
- exact locations;
- raw share links;
- evidence;
- audit/outbox/jobs;
- inbound WhatsApp payloads;
- AI drafts containing unconfirmed text.

## 9. Hostile authorization tests

At minimum:

1. Circle A member cannot read/write any Circle B row.
2. Valid Ask A share token cannot fetch Ask B.
3. Revoked/expired token resolves to no data.
4. Contributor sees only their Offer, not competing Offers.
5. Ask owner may decide Offers only for their Ask.
6. Circle admin cannot read Commitment messages by default.
7. User cannot promote own role or restore suspended membership.
8. User cannot reference another user’s Resource in an Offer.
9. User cannot confirm a handoff/return for an unrelated Loan.
10. Public client cannot insert LoanEvent, AuditEvent, OutboxEvent, or NotificationJob.
11. Storage access is denied across Circle/object/participant boundaries.
12. Suspended member cannot create new Ask/Offer but can complete an active return.
13. Exact-location table is not accessible to `anon` or `authenticated` API roles.
14. Share projection contains no hidden sensitive columns.
15. Replayed idempotency key returns same result, not duplicate Commitment/Loan.

## 10. Migration order and rules

Current fresh-install order:

1. `202607260001_extensions_types.sql`
2. `202607260002_core_tables.sql`
3. `202607260003_helpers_transactions.sql`
4. `202607260004_rls.sql`
5. `202607260005_storage.sql`
6. `202607260006_seed_categories.sql`
7. `202607260007_hardening_scoped_guests.sql`

Migration 007 intentionally adds scoped guest grants, cross-Circle consistency foreign keys, Auth bootstrap, ownership-validation triggers, public policy wrappers, and column-level privileges that force authoritative state changes through reviewed RPCs. Codex must execute the full chain against local Supabase and correct any incompatibility before adding feature migrations.

- Ordered timestamp/sequence migrations under `supabase/migrations/`.
- Every migration is forward-only and reviewed.
- Data backfills are separate from schema changes when risky.
- Production migration occurs through controlled CI/manual release step, never from an AI agent with unrestricted credentials.
- Take/verify backup before destructive migration.
- Add rollback/mitigation notes to each release, even when SQL rollback is unsafe.
