# Account and Access Setup

## Ownership model

Use company-controlled email aliases, not a founder's personal identity, for GitHub organization, Vercel, Supabase, Cloudflare, Resend, Twilio, Sentry, PostHog, OpenAI, and Meta. Require MFA. Keep two human owners for recovery; use least-privilege member roles for daily work.

## Environment order

1. Create GitHub private repository and branch protection.
2. Create separate Supabase **staging** and **production** projects.
3. Create Vercel project connected to GitHub; map Preview/Staging/Production variables separately.
4. Configure DNS through Cloudflare only after name/domain approval.
5. Verify sending subdomain in Resend; use a dedicated transactional sender.
6. Configure Supabase phone provider and email SMTP only in staging first.
7. Create Sentry and PostHog staging projects; establish property allowlists before ingestion.
8. Create Turnstile widgets per environment.
9. Defer OpenAI/Meta production credentials until P1 is approved.

## Secret rules

- Store secrets in provider/Vercel encrypted environment settings.
- Never paste secrets into Codex prompts, issues, chat, screenshots, or committed `.env` files.
- Rotate after accidental disclosure; deleting a message is not remediation.
- Production and staging never share secrets, encryption keys, webhook tokens, or databases.

## Required access review

Quarterly and after every team change: enumerate users, roles, MFA, API keys, service accounts, SSH keys, GitHub Apps, webhooks, and billing admins. Remove unused access and record the review.
