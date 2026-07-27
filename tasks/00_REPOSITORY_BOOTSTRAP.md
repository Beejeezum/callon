# Task 00 — Repository Bootstrap and Proof of Build

## Goal

Turn the supplied scaffold into a reproducible, security-patched workspace that can be built locally and in CI.

## Work

1. Verify Node/pnpm versions against current official support and security releases; change pins only with rationale.
2. Run `pnpm install`; commit `pnpm-lock.yaml`.
3. Correct all TypeScript, lint, React, Next.js, accessibility, and build errors in the existing scaffold.
4. Do not replace the scaffold wholesale or discard canonical screens.
5. Configure GitHub Actions for install, format-check, lint, typecheck, unit, build, migration lint, database tests, and Playwright smoke.
6. Start local Supabase; apply the complete migration chain from an empty database.
7. Correct SQL syntax/order/function/RLS issues discovered by execution. Never reduce isolation to pass.
8. Generate Supabase TypeScript types and add them under `apps/web/src/types/database.ts`.
9. Ensure mock mode works with no provider secrets.
10. Verify `/api/health`, root, `/asks/new`, `/share/oakridge-birthday-demo`, and the complete mock happy path in a browser.

## Acceptance

- clean install from an empty cache;
- committed lockfile;
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass;
- `supabase db reset` and `supabase test db` pass;
- Playwright mobile and desktop smoke pass;
- no client bundle contains server-only secret names/values;
- no route logs PII or exact-location data;
- `BUILD_STATUS.md` and decision log updated.

## Stop conditions

Stop if a current dependency requires a materially different architecture, if migration repair changes documented privacy semantics, or if local Supabase cannot reproduce the expected security boundary.
