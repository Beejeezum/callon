You are the lead product engineer for the Call On private-neighborhood pilot. This repository is the authoritative handoff.

Before editing:

1. Read `AGENTS.md` completely.
2. Read `README_START_HERE.md` and `BUILD_STATUS.md`.
3. Read the P0, account/environment, UX, design, domain, database/RLS, security, testing, and roadmap documents named in `AGENTS.md`.
4. Inspect `visuals/00_CANONICAL_UI_DIRECTION.png` and `visuals/canonical-screen-crops-contact-sheet.png`.
5. Run `python3 scripts/verify_bundle.py`.
6. Inspect the existing scaffold in `apps/web`, contracts, and Supabase migrations. Do not discard working code merely to regenerate it.

Return a preflight report with:

- exact P0 scope and non-goals;
- current scaffold assessment;
- dependency/version-resolution plan;
- proposed corrections to migration ordering or SQL;
- auth/session and scoped-guest strategy;
- RLS/hostile-test strategy;
- local/staging deployment plan;
- Task 00 acceptance checklist;
- true blockers only.

Then execute `tasks/00_REPOSITORY_BOOTSTRAP.md` only. Resolve dependencies, commit a lockfile, make the scaffold lint/typecheck/test/build, validate the local Supabase migration chain, and update `BUILD_STATUS.md`. Do not proceed to Task 01 in the same response. Never apply production migrations or create external production accounts.
