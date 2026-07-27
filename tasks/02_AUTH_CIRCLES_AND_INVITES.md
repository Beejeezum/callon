# Task 02 — Auth, Circles, Invitations, and Scoped Guests

## Goal

Implement passwordless identity and the tenant boundary without forcing early profile completion.

## Work

- official Supabase SSR cookie flow and session refresh;
- phone OTP primary, email fallback, mock provider locally;
- Turnstile and IP/contact/device rate-limit primitives on public auth endpoints;
- profile/private contact creation with encrypted contact fields and normalized hashes;
- Circle membership state machine and roles;
- revocable, hashed, expiring invitation tokens;
- shared-Ask guest draft → verify → pending/active membership conversion;
- account recovery and contact-change step-up design;
- audit all membership/admin changes;
- hostile tests: cross-Circle, suspended user, forged role, expired invite, replay, enumeration.

## Acceptance

No raw contact data in exposed schema/logs; sessions work server-side; revoked/expired invites fail safely; admins cannot self-escalate; guest contribution path does not reveal Circle browsing.

## Human gate

Do not enable production OTP or create provider accounts. Return dashboard/DNS/template steps.
