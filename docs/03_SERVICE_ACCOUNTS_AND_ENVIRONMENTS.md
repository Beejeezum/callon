# Service Accounts, Ownership, and Environment Setup

This is the exact external-account map. Create accounts under a company-controlled email domain and shared organization, not a founder’s personal login. Store recovery codes and emergency credentials in an approved password manager.

## 1. Ownership model

Minimum human roles:

- **Business owner:** billing and legal authority.
- **Technical owner:** architecture, production changes, incident lead.
- **Backup owner:** account recovery and business continuity.
- **Developer:** day-to-day code access without billing or organization ownership.
- **Moderator lead:** product moderation tools only; no infrastructure access.

Every critical organization must have at least two human owners. Do not share one credential.

## 2. Required P0 accounts

| Service | Organization/project | Environments | Required purpose | Sensitive values |
|---|---|---|---|---|
| GitHub | company org + private repo | all | source, PRs, Actions, branch protection | deploy/app tokens only if required |
| Netlify | company team + web project | deploy previews/staging/production | Next.js hosting, functions, scheduled jobs | environment variables, deploy hooks |
| Supabase | company org; staging and production projects | staging/prod; CLI local | PostgreSQL, Auth, Storage | publishable and server secret keys, DB URLs |
| Resend | company account + verified sending domain | staging/prod | transactional email and custom SMTP | API keys, webhook secret |
| Twilio | company account/subaccount | staging/prod | SMS OTP provider | SID/token/provider configuration |
| Cloudflare | company account + domain zone | staging/prod | DNS, Turnstile, optional WAF/rate rules | Turnstile secret, API token if automated |
| PostHog | company org/projects | staging/prod | analytics and flags | project keys, personal API key for admin only |
| Sentry | company org/project | staging/prod | errors, traces, releases | DSN, auth token for source maps |
| Password manager | company vault | all | human secrets, recovery codes | vault access |

P1 adds OpenAI and Meta Business/WhatsApp.

## 3. GitHub setup

Create:

```text
Organization: <company>
Repository: call-on (private)
Default branch: main
Staging branch: staging (optional but recommended for pilot)
```

Enable:

- two-factor authentication requirement for organization members;
- branch protection/ruleset on `main`;
- pull request required;
- at least one approval from a human owner for migrations, auth, RLS, security, or legal files;
- required checks: typecheck, lint, unit, database, Playwright smoke, build;
- no force pushes or deletion of `main`;
- Dependabot/security alerts;
- secret scanning and push protection where available;
- `CODEOWNERS` for `supabase/`, auth, security, and deployment files.

Do not put provider secrets in GitHub repository variables unless a specific Action requires them. Prefer OIDC/provider integrations or scoped environment secrets.

## 4. Netlify setup

Create one company team and one project initially:

```text
Project: call-on-web
Framework: Next.js
Base directory: unset (repository root)
Package directory: apps/web
Production branch: main
Preview branches: all non-main branches
Staging domain: staging.<domain> mapped to staging branch or a custom environment
Production domain: app.<domain> or <domain>
```

Environment mapping:

| Netlify deploy context | Data/services |
|---|---|
| Local development | local Supabase or explicitly pulled nonproduction values |
| Deploy Preview | staging Supabase; mock/allowlisted provider destinations |
| Branch deploy/staging | staging Supabase and staging provider keys |
| Production | production Supabase and production provider keys |

Protect preview deployments when they expose realistic member data. Do not use production data in previews.

Configure:

- a Netlify Scheduled Function that invokes the bounded notification worker;
- environment variables from `.env.example`;
- Sentry source-map upload token as a build secret;
- production deploy authorization restricted to reviewed `main` merges;
- deployment retention appropriate for incident review;
- log drains only if they are scrubbed of private fields.

## 5. Supabase setup

Create a company organization and two independent projects:

```text
call-on-staging
call-on-production
```

Local development uses the Supabase CLI and committed migrations/seed data.

For each hosted project:

- choose the same primary region near the pilot population;
- enable Auth providers deliberately; disable unused providers;
- configure site URL and explicit redirect allowlist;
- configure custom SMTP before production;
- create private Storage buckets from migration/setup script;
- enable network restrictions or access controls where practical;
- review organization roles and remove stale members;
- configure database backups; production must be on a paid plan before pilot;
- schedule a restore drill before expanding the pilot;
- never manually modify production schema outside reviewed migrations.

Recommended buckets:

```text
ask-media          private
resource-media     private
incident-evidence  private, stricter access and retention
avatars            private or deliberately public-transformed; no original contact metadata
```

## 6. Authentication delivery

### Phone

Configure a supported SMS provider in Supabase Auth. Twilio is the default recommendation for the pilot because it is broadly supported and operationally familiar. Use separate staging and production credentials/subaccounts where possible.

Controls:

- geographic allowlist matching pilot countries;
- per-IP, per-contact, and per-device attempt limits;
- Turnstile before sending OTP on public surfaces;
- generic responses that do not reveal account existence;
- spend alerts and hard limits;
- test destinations in staging;
- alert on unusual send volume or failure rate.

### Email

Verify a product domain in Resend. Recommended senders:

```text
Call On <hello@<domain>>
Call On Security <security@<domain>>
Call On Support <support@<domain>>
```

Configure SPF, DKIM, and DMARC. Use separate API keys for staging and production. Staging must send only to an allowlist or clearly mark messages as test.

## 7. Cloudflare

Use Cloudflare for DNS even if Netlify hosts the application. Create Turnstile widgets for staging and production.

Minimum DNS/email records:

- Netlify application domain;
- Resend SPF/DKIM records;
- DMARC policy beginning in monitor mode, then tighten;
- support/security mailboxes or forwarding;
- optional status subdomain.

Turnstile verification is server-side and mandatory; a client success token alone is not proof.

## 8. Analytics and monitoring

### PostHog

Create separate staging and production projects or enforce an environment property at ingestion. Recommended region should match privacy/legal needs.

- disable automatic full-text capture;
- do not record message bodies, phone/email, addresses, share tokens, or incident evidence;
- mask sensitive DOM fields if session replay is ever enabled;
- start without session replay in P0 unless explicitly reviewed.

### Sentry

Create web/server projects or one Next.js project with environments.

- scrub request bodies and headers;
- denylist auth cookies, tokens, phone/email, address fields, messages, and webhook payloads;
- upload source maps privately;
- alert on error-rate regression, cron failure, auth/provider errors, and webhook signature failures.

## 9. P1 accounts

### OpenAI

Create a company organization/project and restricted project API key. Store only server-side. Set spend alerts. AI logs must not include exact location, contact details, private messages, or incident content. Use the Responses API with a strict schema and explicit human confirmation.

### Meta / WhatsApp

Create:

- Meta Business Portfolio;
- Meta developer app;
- WhatsApp Business Account;
- dedicated test number, then production number;
- webhook endpoint and verification secret;
- approved message templates only for permitted proactive notifications;
- privacy policy and support/escalation route.

The P1 assistant is one-to-one. It does not silently read an existing HOA group. A user forwards or messages the assistant, confirms the draft, and manually shares the resulting Ask link.

## 10. Environment-variable ownership

| Variable class | Local | Preview/staging | Production |
|---|---|---|---|
| public app URL/key | `.env.local` | Netlify env | Netlify env |
| database migration URL | local CLI | CI/staging secret | restricted release secret; no routine developer access |
| Supabase server secret | mock/local | Netlify server only | Netlify server only |
| encryption/signing secrets | generated local value | unique staging | unique production; backed up securely |
| provider API keys | mock/test | staging keys | production keys |
| webhook secrets | local fixture | unique staging | unique production |

Rotate immediately if a secret appears in logs, screenshots, a prompt, issue, or commit.

## 11. Account setup order

1. Clear working ownership and choose company email domain.
2. GitHub organization and private repository.
3. Password-manager vault and recovery contacts.
4. Netlify team/project.
5. Supabase staging project; local CLI remains default for development.
6. Resend staging domain/key.
7. PostHog and Sentry staging projects.
8. Cloudflare DNS and Turnstile staging.
9. Twilio test configuration.
10. Build and security test in staging.
11. Supabase production project and backup plan.
12. Production provider keys/domains.
13. OpenAI and Meta only when P1 tasks begin.

## 12. Human setup checklist

A template is available in `runbooks/ACCOUNT_SETUP_CHECKLIST.md`. Record the owner, backup owner, billing contact, environment, creation date, recovery location, and last access review for every service. Never record the secret value itself in the checklist.
