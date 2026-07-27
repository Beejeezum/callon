# Legacy Prototype Production Notes

> **Superseded by the repository-root v2 architecture.** Use `docs/00_EXECUTIVE_DECISIONS.md`, `docs/03_SERVICE_ACCOUNTS_AND_ENVIRONMENTS.md`, and `docs/17_DEPLOYMENT_AND_OPERATIONS.md`. This file is retained only to explain how the earlier static prototype was intended to evolve.

The P0 prototype is intentionally static. The production pilot should retain its interaction model while moving the deterministic domain logic into the stack defined in the PRD.

## Recommended stack

```text
GitHub
Next.js App Router + TypeScript
Supabase PostgreSQL + Auth + Storage
PostgreSQL Row Level Security
Vercel
Zod validation
Vitest + database policy tests + Playwright
Provider-abstracted notifications
Sentry-style error monitoring
PostHog-style product analytics
Meta WhatsApp Cloud API in Release 1.1
```

## Migration order

1. **Port the design system and route shells.** Move visual tokens and reusable components from `styles.css` into typed React primitives without redesigning the flows.
2. **Implement identity and Circle tenancy.** Passwordless identity, invite links, membership states and database-level Circle isolation come before social functionality.
3. **Implement Asks and Needs.** Preserve the one-field composer and mandatory human review. Store AI output as a draft, never as a published fact.
4. **Implement Offers and Commitments atomically.** An unlisted item must remain valid input. Offer acceptance must be idempotent and protect quantities from over-fulfillment.
5. **Implement Loans as a state machine plus event ledger.** Handoff, extension, return, confirmation and incident states must retain append-only events.
6. **Implement progressive resource memory.** Create a saved Resource only after explicit post-transaction consent. Keep match-only visibility separate from Circle-visible inventory.
7. **Add notifications through an outbox.** Business logic creates jobs; providers deliver WhatsApp, email, SMS or push without owning the domain state.
8. **Add moderation and audit boundaries.** Private messages and exact locations are inaccessible to routine Circle administration. Incident-scoped access is assigned and audited.
9. **Add share previews.** Generate canonical Open Graph cards from server-rendered Ask state. Do not depend on the group-chat preview for meaning.
10. **Add the one-to-one WhatsApp assistant only after the web loop works.** WhatsApp is a channel adapter; the web record remains authoritative.

## Prototype code that should not move directly into production

- `localStorage` state.
- Client-only authorization assumptions.
- Simulated OTP and instant approval behavior.
- Hash-route identity context.
- Inline fake trust history.
- Client-generated share links.
- Direct UI mutation without transactional server services.

## Production service boundaries

```text
UI / Route Handlers
    ↓
Validated Commands
    ↓
Domain Services
    ├── AskService
    ├── OfferService
    ├── CommitmentService
    ├── LoanService
    ├── ResourceMemoryService
    ├── IncidentService
    └── NotificationService
    ↓
PostgreSQL transaction + outbox event
    ↓
Provider workers / analytics / audit log
```

## Human review gates

Production launch should require explicit review of:

- RLS and cross-Circle hostile tests.
- OTP abuse and account-recovery paths.
- Share-link data exposure.
- Risk classifications and prohibited categories.
- Incident evidence access.
- Data retention and deletion.
- Legal terms, privacy notice and pilot operating rules.
- Accessibility against WCAG 2.2 AA.
- Backup restoration, not merely backup configuration.
