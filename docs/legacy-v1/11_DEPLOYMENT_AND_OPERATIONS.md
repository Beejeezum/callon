# Deployment and Operations

## 1. Environments

Use separate Supabase and Netlify environments:

- Local.
- Preview/test.
- Staging.
- Production pilot.

Never point preview branches at the production database. Never use production service-role credentials locally.

## 2. GitHub workflow

- Protect `main`.
- Work in feature branches.
- Require pull request and green checks.
- Generate Netlify preview deploys for UI changes.
- Require review for migrations and security-sensitive files.
- Do not let an agent push directly to production.

Suggested CODEOWNERS review areas:

- `/supabase/migrations/`
- `/supabase/tests/`
- `/apps/web/src/server/auth/`
- `/apps/web/src/server/permissions/`
- incident and exact-location features.

## 3. Netlify

Use the current supported Next.js/OpenNext adapter. Do not pin an obsolete adapter without a documented reason. Keep provider-specific scheduled/background functions behind internal job interfaces.

Required settings:

- Build command from root workspace.
- Correct Next.js base directory for `apps/web`.
- Environment variables scoped per environment.
- Preview deploy protection if pilot data may be reachable.
- Security headers.
- Redirect/callback routes for Supabase Auth.

## 4. Supabase migrations

- One ordered migration per coherent schema/policy change.
- Migrations committed before generated types.
- Validate locally and in staging.
- Include rollback/forward-fix note for risky changes.
- Agent may generate migration files but may not apply production migrations.
- Regenerate typed database definitions after migration.

## 5. Secrets

See `.env.example`.

Rules:

- Never commit real secrets.
- Public Supabase publishable key may be exposed only as designed; service-role key is server-only.
- Provider webhook secrets and AI keys are server-only.
- Use Netlify/Supabase secret management.
- Rotate leaked or test-shared credentials immediately.

## 6. Jobs

Use outbox + worker pattern. Worker responsibilities:

- Notification dispatch.
- Ask expiry.
- Overdue transition/reminders.
- Stale Resource Hint suppression.
- Social preview generation if asynchronous.
- Data retention/deletion jobs.

Jobs use idempotency keys and bounded retries with dead-letter visibility.

## 7. Pilot operations

Define before launch:

- Named pilot operator.
- Incident response contact.
- Ability to suspend a Circle or disable new activity.
- Status communication method.
- Daily review of failed jobs and open incidents.
- Backup cadence and restore test.
- Data deletion request workflow.
- Prohibited-item escalation.
