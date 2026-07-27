# Deployment Runbook

## Preview

Every pull request creates a Vercel Preview with mock providers and a non-production database branch/project. Run CI and Playwright. Never connect previews to production Supabase.

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
