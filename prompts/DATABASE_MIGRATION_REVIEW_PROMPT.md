# Database Migration and RLS Review Prompt

Review the complete Supabase migration chain and tests against `AGENTS.md`, `docs/07_DOMAIN_MODEL_AND_STATE_MACHINES.md`, `docs/08_DATABASE_SCHEMA_AND_RLS.md`, and `docs/15_SECURITY_PRIVACY_AND_SAFETY.md`.

Execute from an empty local database and from a realistic previous snapshot. Do not review SQL by inspection alone.

Test as:

- anonymous shared-link visitor;
- active member in Circle A;
- active member in Circle B;
- pending scoped guest;
- restricted/suspended/left member;
- Ask owner;
- competing contributors;
- accepted requester and contributor;
- Circle moderator/admin;
- service worker role.

Specifically attack cross-Circle reads/writes, profile enumeration, private Offers, conversations, exact locations, token hashes, evidence, storage paths, role escalation, idempotency replay, quantity overfill, overlapping resources, illegal Loan transitions, and SECURITY DEFINER search-path/input problems.

Return P0–P3 findings with reproducible SQL, affected policy/function, exploit impact, remediation, and a committed regression test. Do not grant broader access as a shortcut.
