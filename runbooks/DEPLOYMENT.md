# Deployment Runbook

## Approved Netlify target

Use only DreamCraftLabs project `callonapp`:
`https://app.netlify.com/projects/callonapp/overview`.

Before pushing a release candidate, disconnect `Beejeezum/callon` from
Letterhead, `callon-neighbors`, and any automatically named legacy site. A pull
request check from one of those projects is not valid release evidence.

## Preview

Every pull request creates a Netlify Deploy Preview with mock providers or a
non-production database branch/project. Run CI and Playwright. Never expose
production data, unrestricted email recipients, or production provider secrets
to a deploy preview.

## Staging

1. Merge approved code to staging branch/environment.
2. Apply migrations to staging from a clean rehearsal and an upgraded snapshot.
3. Run smoke, RLS, concurrency, accessibility, and provider-sandbox tests.
4. Verify error/analytics redaction and notification idempotency.
5. Record migration versions and commit SHA.

## Production

Human-only gate:

1. Confirm approvals and maintenance owner.
2. Verify current backup/PITR and successful recent restore drill.
3. Apply forward-only migration with captured output.
4. Deploy the exact approved commit.
5. Run read-only health checks, one synthetic auth, one synthetic Ask loop, and notification test destination.
6. Monitor errors, database locks, auth failures, jobs, and user reports for at least 60 minutes.

Rollback application code independently where possible. Database rollback defaults to forward fix; destructive reverse migrations require explicit reviewed procedure.
