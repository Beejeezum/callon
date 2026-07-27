# API, Server Actions, and Domain Services

## 1. Interface strategy

Use Next.js Server Actions for authenticated UI mutations and Route Handlers for external webhooks, cron, health, share projections that require an endpoint, and provider callbacks. Business rules live in domain services, not page components.

```text
apps/web/src/server/domains/<domain>/
  service.ts
  repository.ts
  policy.ts
  events.ts
  errors.ts
```

Shared input/output contracts live in `packages/contracts`.

## 2. Standard mutation envelope

Every state-changing operation receives:

```ts
{
  idempotencyKey: string;
  input: ValidatedInput;
}
```

Standard result:

```ts
type MutationResult<T> =
  | { ok: true; data: T; requestId: string }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string,string[]> }; requestId: string };
```

Do not return raw database/provider errors to the client.

## 3. Core domain operations

### `createAskDraft`

Actor: active member.  
Input: Circle, description, date/time, general location, Need drafts.  
Output: draft Ask ID.  
Rules: category validation, no exact-address field, quantity validation.

### `publishAsk`

Actor: Ask owner.  
Input: Ask ID, terms/policy confirmation.  
Transaction: validate draft, set open/published, create/rotate ShareLink, append audit/outbox.  
Output: Ask summary + raw share token only once to the server response.

### `submitOffer`

Actor: verified member or permitted scoped guest.  
Input: share/Ask scope, Need, offer type, quantity, item/resource, timing, conditions.  
Rules: contributor != owner; remaining Need; allowed contribution/risk; identity verified; no exact address.  
Output: own Offer summary.

### `acceptOffer`

Actor: Ask owner.  
Input: Offer ID, accepted quantity, timing, optional private logistics request.  
Transaction:

1. lock Offer and Need;
2. verify Offered/current version;
3. verify remaining quantity;
4. mark Offer accepted;
5. increment committed quantity and update Need/Ask status;
6. create Commitment + Conversation;
7. create Loan only for lend;
8. append audit/outbox;
9. commit.

Output: Commitment ID and next step.

### `declineOffer`

Actor: Ask owner.  
Private status change; optional internal reason category. Do not notify with shaming language or expose a rating impact.

### `sendCommitmentMessage`

Actor: participant.  
Input: text/image.  
Rules: active participation, content/size limits, no blocked user condition; audit only metadata, not body.

### `setExactLocation`

Actor: relevant party.  
Input: normalized location text and optional instructions.  
Server encrypts, stores private record, and links it to Commitment. Plaintext is never in analytics/logs.

### `confirmHandoff`

Actor: borrower/requester or both according to policy.  
Rules: pending handoff; schedules valid; moderate-risk acknowledgements complete.  
Transaction: Loan checked_out, event, Commitment active/in-progress, reminders scheduled through outbox.

### `requestExtension` / `respondToExtension`

Actor: borrower / lender.  
Rules: checked out; requested due date in future; no concurrent open request.  
Output: updated status/due date.

### `markReturned`

Actor: borrower.  
Rules: checked_out/overdue/extension state.  
Transaction: return_marked event and lender notification.

### `confirmReturn`

Actor: lender.  
Rules: return_marked.  
Transaction: Loan returned, Commitment fulfilled, Need completed quantity increment, Ask completion recalculation, audit/outbox.

### `saveResourceFromLoan`

Actor: lender.  
Rules: returned Loan; owner is lender; only safe fields copied.  
Output: saved Resource with visibility/willingness.

### `reportIncident`

Actor: party/member.  
Input: object, category, description, evidence metadata.  
Rules: rate limits; evidence private; urgent classes trigger operator alert.

## 4. Query services

Use explicit DTOs/projections:

```text
getHomeDashboard
getCircleAskList
getAskDetailForMember
getSharedAskProjection
getOfferInboxForOwner
getOfferDetailForAuthorizedParty
getCommitmentDetail
getLoanDetail
getMyActivity
getInbox
getResourceOwnerDetail
getAdminOverview
```

Never serialize database rows wholesale. Select named columns and map them to contracts.

## 5. Route handlers

```text
GET  /api/health
GET  /api/share/[token]/image       optional dynamic OG image later
POST /api/cron/notifications
POST /api/webhooks/resend
GET  /api/webhooks/whatsapp         P1 verification
POST /api/webhooks/whatsapp         P1 events
POST /api/ai/draft-ask              P1
```

Webhook rules:

- verify signature before parsing/trusting payload;
- persist provider event ID in `webhook_receipts`;
- return success for safe duplicate;
- process asynchronously when possible;
- redact logs;
- bound payload size;
- reject stale timestamps where provider supports it.

## 6. Error taxonomy

```text
AUTH_REQUIRED
VERIFICATION_REQUIRED
MEMBERSHIP_REQUIRED
MEMBERSHIP_RESTRICTED
NOT_AUTHORIZED
NOT_FOUND
INVALID_STATE
VALIDATION_FAILED
PROHIBITED_CATEGORY
QUANTITY_UNAVAILABLE
CONFLICT_RETRY
TOKEN_EXPIRED
TOKEN_REVOKED
RATE_LIMITED
PROVIDER_UNAVAILABLE
INTERNAL_ERROR
```

UI maps codes to humane next steps. Do not expose whether an unrelated private object exists.

## 7. Rate limits

Implement durable/server limits for:

- shared-link fetch anomalies;
- OTP send/verify;
- Offer submit;
- message send and attachment upload;
- share-link rotation;
- incident/report submit;
- AI draft endpoint;
- webhook failures.

Use IP/device/contact hashes with rotation and privacy review. Do not rely exclusively on hosting-instance memory.

## 8. Provider abstraction

Interfaces:

```ts
interface EmailProvider { send(message: EmailMessage): Promise<ProviderReceipt> }
interface SmsProvider { /* normally delegated through Supabase Auth */ }
interface AnalyticsProvider { capture(event: SafeAnalyticsEvent): void }
interface ErrorReporter { capture(error: unknown, context: SafeContext): void }
interface AiDraftProvider { draftAsk(input: SafeDraftInput): Promise<AskDraft> }
interface ChannelProvider { sendTemplate(...): Promise<ProviderReceipt> }
```

Mock adapters are the default in local and CI.
