# Deployment and Operations

## 1. Deployment topology

```text
GitHub private repo
  ├── PR branch → Vercel Preview → staging Supabase/providers
  ├── staging branch/domain → staging Supabase/providers
  └── main → Vercel Production → production Supabase/providers
```

For stronger isolation, create separate Vercel staging and production projects. The critical requirement is separate data and secrets.

## 2. Build configuration

Vercel project root: `apps/web`.  
Package manager: pnpm workspace.  
Install from repository root if Vercel workspace detection requires it; document final setting in decision log.

Commands:

```text
install: pnpm install --frozen-lockfile
build: pnpm --filter @call-on/web build
unit: pnpm test
E2E: pnpm test:e2e
```

Task 00 resolves current stable dependencies and commits `pnpm-lock.yaml`.

## 3. Database deployment

- migrations committed and immutable after release;
- CI resets a fresh database from zero;
- staging applied automatically only after review;
- production apply requires human approval and restricted credentials;
- schema drift check scheduled;
- no dashboard-only changes.

## 4. Scheduled jobs

P0 cron invokes a server route to:

- claim due outbox/notification jobs;
- expire Asks/Offers/share links;
- mark Loans overdue;
- schedule bounded reminders;
- clean expired drafts/tokens;
- emit health metrics.

Each job uses locks/idempotency and a batch limit. Long processing continues through repeated invocations rather than exceeding function time.

## 5. Monitoring

Dashboards/alerts:

- Vercel request error rate/latency;
- Sentry new/regressed errors;
- Supabase DB CPU/connections/storage/query latency;
- Auth OTP send/failure/abuse spend;
- notification queue age/failure/dead letter;
- Resend bounce/complaint;
- webhook signature failures/replay volume;
- share-page 4xx/5xx anomaly;
- incident/security alerts.

## 6. Health endpoint

`GET /api/health` returns a minimal status without secrets or private data:

```json
{
  "status": "ok",
  "version": "git-sha",
  "environment": "staging",
  "checks": { "database": "ok", "queue": "ok" }
}
```

Detailed diagnostics remain authenticated/server-only. Avoid turning health into a database load amplifier.

## 7. Backups and recovery

Before pilot:

- production Supabase paid backups enabled;
- decide whether PITR is justified by pilot risk/cost;
- export encryption-key inventory and recovery procedure securely;
- test restore into a new project;
- verify Auth references, functions, RLS, and storage behavior after restore;
- document RTO/RPO assumptions;
- note that database backup and object storage backup are distinct concerns.

## 8. Feature flags/kill switches

Required flags:

```text
PUBLIC_ASKS_ENABLED
NEW_OFFERS_ENABLED
NEW_LOANS_ENABLED
EXACT_LOCATION_ENABLED
EMAIL_NOTIFICATIONS_ENABLED
AI_DRAFTING_ENABLED
WHATSAPP_ASSISTANT_ENABLED
```

Security/operator can disable risky entry points without taking down return/incident access.

## 9. Support operations

Provide:

- support and security mailbox;
- incident escalation roster;
- member-facing status/update templates;
- documented account recovery;
- moderator guide;
- refund/payment process not applicable in P0;
- export/deletion workflow;
- provider outage fallbacks.

## 10. Operational runbooks

Included under `runbooks/`:

- account setup;
- deploy/release;
- database restore;
- security incident;
- provider outage;
- lost/stolen item dispute;
- account recovery;
- key rotation.

## 11. Pilot rollout

- start with one Circle and named moderator;
- seed three to five low-risk example Asks only if real and transparent;
- onboard a small contributor cohort through real requests, not inventory homework;
- weekly review of unresolved Needs, notification noise, incidents, and contributor concentration;
- publish fixes rapidly through preview/staging;
- do not add more Circles until the first has repeated successful exchanges.
