# Production Architecture Map

## Runtime

```mermaid
flowchart LR
  U[Member / shared-link visitor] --> V[Vercel edge + Next.js App Router]
  V --> SA[Server Actions / Route Handlers]
  SA --> A[Actor + token scope resolution]
  A --> Z[Zod contracts]
  Z --> D[Domain service]
  D --> RPC[Supabase PostgreSQL transaction RPC]
  RPC --> P[(public schema + RLS)]
  RPC --> X[(private schema)]
  RPC --> O[Audit + outbox]
  O --> C[Vercel cron / worker]
  C --> E[Resend adapter]
  C --> W[WhatsApp adapter P1]
  SA --> S[Private Supabase Storage]
  V --> PH[PostHog allowlisted events]
  V --> SE[Sentry redacted errors]
  SA --> AI[OpenAI draft adapter P1]
```

Core state remains in PostgreSQL. Provider metadata is never authoritative.

## Trust boundary

```text
Public browser:
  scoped share token, safe Ask projection, Offer draft

Authenticated member browser:
  RLS-safe member views; never service-role access

Next.js server:
  session/token validation, encryption/decryption, provider calls,
  service-role only for narrowly reviewed server-mediated operations

PostgreSQL public schema:
  RLS-protected domain data

PostgreSQL private schema:
  encrypted contact/location, token hashes, evidence metadata,
  outbox/jobs/audit/idempotency/webhook receipts/AI drafts

External providers:
  minimum destination/template/event data only
```

## Environment topology

```mermaid
flowchart TB
  subgraph Local
    LW[Next dev] --> LS[(Supabase CLI)]
    LW --> LM[Mock providers]
  end
  subgraph Staging
    SV[Vercel staging] --> SS[(Supabase staging)]
    SV --> SP[Sandbox / allowlisted providers]
  end
  subgraph Production
    PV[Vercel production] --> PS[(Supabase production)]
    PV --> PP[Production providers]
  end
```

There is no shared database, storage bucket, encryption key, signing secret, webhook secret, or unrestricted provider destination between staging and production.

## Database relationships

```mermaid
erDiagram
  PROFILES ||--o{ CIRCLE_MEMBERSHIPS : joins
  CIRCLES ||--o{ CIRCLE_MEMBERSHIPS : contains
  CIRCLES ||--o{ ASKS : owns
  ASKS ||--o{ SHARE_LINKS : exposes_safe_projection
  SHARE_LINKS ||--o{ ASK_GUEST_GRANTS : verifies_scoped_guest
  PROFILES ||--o{ ASK_GUEST_GRANTS : receives
  ASKS ||--|{ ASK_NEEDS : requests
  ASK_NEEDS ||--o{ OFFERS : receives
  PROFILES ||--o{ OFFERS : contributes
  RESOURCES ||--o{ OFFERS : optional_source
  OFFERS ||--o| COMMITMENTS : accepted_as
  COMMITMENTS ||--|| CONVERSATIONS : creates
  COMMITMENTS }o--o| EXACT_LOCATIONS : reveals_after_acceptance
  CONVERSATIONS ||--o{ MESSAGES : contains
  COMMITMENTS ||--o| LOANS : physical_lend
  LOANS ||--|{ LOAN_EVENTS : records
  LOANS ||--o{ INCIDENTS : may_trigger
  LOANS ||--o{ RESOURCES : may_remember
```

## Primary data ownership

| Record | Owner/control | Visibility |
|---|---|---|
| Ask | requester | Circle members; scoped public projection via token |
| Share link / guest grant | requester/system | server-only token resolution; one verified guest may be scoped to one Ask |
| Need | Ask owner | same as Ask projection, without private response data |
| Offer | contributor can withdraw; requester decides | contributor + requester only |
| Commitment | requester + contributor | accepted parties only |
| Exact location | location owner | accepted parties through server-mediated decrypt |
| Conversation/message | participants | participants; scoped moderator only with audited grant |
| Loan | lender + borrower | parties only |
| Loan event | append-only | parties and scoped support workflow |
| Resource hint | resource owner | owner/system private matching only by default |
| Incident/evidence | reporter/subject/scoped moderator | private and audited |

## Failure behavior

- Database failure: mutation fails; do not pretend success.
- Email/WhatsApp failure: domain write remains committed; outbox retries.
- Analytics/Sentry failure: never blocks user action.
- AI failure: manual form remains complete.
- Share-token failure/expiry: safe unavailable state; no Circle fallback.
- Worker replay: idempotency prevents duplicate messages/state.
