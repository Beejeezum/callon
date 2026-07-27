# API, Domain Services, and Events

## 1. Boundary

Prefer Next.js Server Actions for authenticated form mutations and Route Handlers for public/shared endpoints, webhooks, file callbacks, and provider integrations. Both must call domain services; neither should contain core business logic.

## 2. Service operations

### Circle

- `createCircle(input, actor)`
- `createCircleInvite(circleId, rules, actor)`
- `joinCircleWithInvite(token, identity, actor)`
- `approveMembership(membershipId, actor)`
- `suspendMembership(membershipId, reason, actor)`
- `setQuietMode(membershipId, window, actor)`

### Ask

- `createAskDraft(input, actor)`
- `publishAsk(askId, expectedVersion, actor)`
- `editAsk(askId, patch, expectedVersion, actor)`
- `cancelAsk(askId, reason, actor)`
- `completeAsk(askId, actor)`
- `reopenAsk(askId, actor)`
- `rotateShareToken(askId, actor)`
- `getPublicAskProjection(shareToken)`

### Offer and Plan

- `submitOffer(needId, input, actorOrVerifiedGuest)`
- `withdrawOffer(offerId, actor)`
- `acceptOffer(offerId, quantity, expectedNeedVersion, actor)`
- `declineOffer(offerId, actor)`
- `cancelCommitment(commitmentId, reason, actor)`
- `completeCommitment(commitmentId, actor)`

`acceptOffer` is transactional: lock Need, verify state and remaining quantity, mark Offer accepted, create Commitment, update committed quantity, append audit/outbox events.

### Loan

- `createLoanFromCommitment(commitmentId, terms, actor)`
- `confirmHandoff(loanId, condition, components, actor)`
- `requestExtension(loanId, proposedDueAt, actor)`
- `respondToExtension(loanId, decision, actor)`
- `markReturned(loanId, actor)`
- `confirmReturn(loanId, returnCondition, actor)`
- `openLoanIssue(loanId, input, actor)`

Every operation writes a Loan Event in the same transaction.

### Resource memory

- `saveResourceFromCompletedOffer(offerId, input, actor)`
- `createResourceHint(input, actor)`
- `updateResourceVisibility(resourceId, visibility, actor)`
- `archiveResource(resourceId, actor)`

### Incident

- `reportIncident(subjectType, subjectId, input, actor)`
- `assignIncident(incidentId, moderator, actor)`
- `recordIncidentAction(incidentId, action, actor)`
- `closeIncident(incidentId, resolution, actor)`

## 3. Input handling

- All public/server action inputs use Zod contracts from `packages/contracts`.
- Reject unknown fields for sensitive mutations.
- Normalize dates to UTC with retained IANA timezone.
- Strip/limit text and file metadata before logging.
- Use server-generated actor IDs and Circle IDs.
- Return stable error codes, not raw database messages.

Suggested error codes:

- `AUTH_REQUIRED`
- `MEMBERSHIP_REQUIRED`
- `MEMBERSHIP_SUSPENDED`
- `NOT_AUTHORIZED`
- `SHARE_LINK_INVALID`
- `STATE_CONFLICT`
- `QUANTITY_UNAVAILABLE`
- `CATEGORY_PROHIBITED`
- `VALIDATION_FAILED`
- `RATE_LIMITED`
- `PROVIDER_UNAVAILABLE`

## 4. Domain/outbox events

Write events in the same transaction as authoritative state:

- `circle.created`
- `membership.requested`
- `membership.approved`
- `ask.published`
- `ask.updated`
- `ask.completed`
- `offer.submitted`
- `offer.accepted`
- `offer.declined`
- `commitment.cancelled`
- `loan.checked_out`
- `loan.extension_requested`
- `loan.extension_accepted`
- `loan.overdue`
- `loan.return_marked`
- `loan.return_confirmed`
- `incident.opened`
- `resource.saved`

Workers claim outbox rows with locking, perform side effects idempotently, then mark completion. Do not send notifications directly from the browser request without an outbox record.
