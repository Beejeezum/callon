# Task 09 — Hardening and Controlled Production Pilot

## Required gates

- product name/domain/trademark review;
- lawyer-approved terms, privacy, waiver, moderation, prohibited categories, retention;
- independent application/RLS/security review;
- production Supabase/Netlify/provider accounts and least-privilege access;
- migration rehearsal and rollback/forward-fix plan;
- backup/PITR restore drill;
- encryption-key rotation drill;
- account recovery/abuse/support drill;
- load/performance/accessibility/browser test evidence;
- incident contacts, alert routing, status page/process;
- data-processing agreements and vendor inventory;
- controlled invite list and pilot support plan.

## Acceptance

All P0 release gates in `docs/16_TESTING_QA_AND_RELEASE.md` are green, human approvals are recorded, production secrets never enter git, and the launch is limited to the approved Circle(s).

Codex must not self-approve this task.
