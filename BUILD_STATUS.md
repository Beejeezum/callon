# Build Status

**Handoff version:** 2.0  
**Prepared:** 2026-07-26  
**Status:** Task 00 and the Netlify deployment adaptation are verified locally.
The GitHub repository is initialized with `main`, and the deployment adaptation
is ready for its review branch. Feature implementation has not started.

| Task | Status | Evidence / blocker |
|---|---|---|
| 00 Repository bootstrap | Complete locally | Node 24.18.0, pnpm 11.17.0, frozen lockfile, clean dependency audit/peers, production build, migration reset/lint, 47 database assertions, generated database types, six Playwright checks, and production-mode screenshots pass. Remote GitHub Actions remain human-gated because no external repository/account was created. |
| 01 Design system + mock journey | Verified scaffold | Canonical board, crops, tokens, responsive Next routes/components, and static reference are present. Production-mode mobile/desktop screenshots are under `artifacts/task-00/screenshots/`; visual QA corrected the mobile navigation cascade and replaced the unusable draft logo asset in the application with a clean vector mark. |
| 02 Auth + Circles | Planned/scaffolded | Supabase SSR seams, Auth profile bootstrap trigger, Circle/invite model, account runbook, and RLS blueprint supplied. Real OTP/provider configuration is human-owned. |
| 03 Asks + share links | Planned/scaffolded | UI, safe share projection contract, token/private-table model, scoped guest grant, transaction RPC, and tests supplied. Server persistence and token resolver pending. |
| 04 Offers + Commitments | Planned/scaffolded | UI, unlisted Offer contract, private party projection, transactional acceptance, quantity locking, tenant consistency, and resource/location validation supplied. Runtime concurrency proof pending. |
| 05 Loans + Resources | Planned/scaffolded | UI/state model, append-only events, overlap protection, progressive resource memory, and transaction blueprint supplied. Real reminders/persistence pending. |
| 06 Pilot operations | Planned | provider adapters, outbox/job schema, account map, admin boundary, analytics, privacy/safety docs, and operational runbooks supplied. |
| 07 AI drafting P1 | Deferred | schema, adapter/route seam, and safety rules supplied; disabled by default. |
| 08 WhatsApp assistant P1 | Deferred | webhook skeleton and one-to-one assistant specification supplied; disabled by default. |
| 09 Hardening/pilot launch | Human-gated | naming/domain, legal policy, external security review, production providers, key custody, migration approval, and restore drill. |

## Task 00 verification completed locally

- `python3 scripts/verify_bundle.py` — passed (`BUNDLE_OK`).
- Toolchain — Node 24.18.0 and pnpm 11.17.0 via `.nvmrc` and `packageManager`.
- `pnpm install` — passed with the committed lockfile and explicit native build allowlist.
- `pnpm audit --audit-level high` — no known vulnerabilities.
- `pnpm peers check` — no peer dependency issues.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` — passed.
- Unit/component contracts — 5 tests passed.
- `pnpm build` — Next.js 16.2.12 production build passed for all application/API routes.
- `netlify build --offline --filter @call-on/web` — Netlify Runtime v5.15.12
  completed the OpenNext build, server-function bundle, and middleware edge
  bundle from the committed `netlify.toml`.
- `supabase db reset` — migrations `001` through `007` applied from an empty PostgreSQL 17 database.
- `supabase db lint --level warning` — no schema errors.
- `supabase test db` — 47 assertions passed across tenant isolation, scoped guests, factual profile visibility, audited commands, idempotency mismatch/replay, competing Offers, private coordination, unauthorized Loan transitions, and the handoff-to-return lifecycle.
- `apps/web/src/types/database.ts` — generated from the executed local database.
- `pnpm test:e2e` — six tests passed in mobile Chromium and desktop Chromium.
- `/api/health` — returned a production-mode healthy response.
- Client build scan — no server-only secret identifier was present in `apps/web/.next/static`.
- Route/log audit — no route logs contact information or exact-location values; mock analytics/error logs retain only allowlisted names/classification.
- Production-mode screenshots — six files captured at `390 × 844` and `1440 × 1024` under `artifacts/task-00/screenshots/`.

## Repository and hosting status

- Target repository: `https://github.com/Beejeezum/callon` (currently public).
- Local `origin` points to that repository.
- The verified Task 00 commit is published on `main`; GitHub Actions can now run
  the supplied CI workflow remotely.
- Netlify is now the accepted host (ADR-016). The public mock deployment
  requires no Supabase or messaging secrets.
- Root Netlify settings are committed in `netlify.toml`; when importing the
  repository, leave Base directory unset and select `apps/web` as Package
  directory.

## Infrastructure cleanup

The local Supabase stack was tested through a dedicated Colima/Docker runtime. After evidence was captured:

- only the Call On Supabase containers, volumes, and 14 downloaded Supabase images were removed;
- the Colima virtual disk was trimmed from roughly 10 GB to 1.5 GB and stopped;
- the Homebrew Docker/Colima tooling remains installed and reproducible;
- the next `colima start` plus `pnpm db:start` will re-download the pinned Supabase images.

No production external account, cloud database, provider credential, domain, message, or migration was created.

## Verification inherited from the handoff

- `python3 scripts/check_repo_structure.py` — passed.
- `python3 scripts/delivery_audit.py` — passed; 7 migrations and 12 required application route entries found.
- `python3 scripts/verify_bundle.py` — passed; required files, JSON, PNG signatures, migration ordering, and common secret patterns checked.
- TypeScript/TSX parser pass using the locally available TypeScript compiler — 66 source files, 0 parse diagnostics.
- `prototype/interactive/tests/route_audit.py` — 30 routes, no overflow/control/error failures.
- `prototype/interactive/tests/smoke.py` — full static reference happy path passed with no browser console or page errors.

## Remaining review gates

- Review and merge the Netlify deployment PR, then inspect the first remote
  GitHub Actions and Netlify build evidence.
- Human approval is still required for external service accounts, production secrets, legal/safety policy, exact-location key custody, production migrations, real OTP/email/WhatsApp activation, and launch.
- The current Next.js application is a verified mock-mode scaffold. Tasks 02 onward must replace mock projections with reviewed persistence without changing the privacy contract.
- The static prototype under `prototype/interactive/` remains behavioral reference only.
