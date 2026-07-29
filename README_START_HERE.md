# Call On — Production Handoff v2

This repository is the production-planning and implementation handoff for **Call On**, a private, request-first neighborhood coordination application.

The canonical product loop is:

```text
Create Ask → Share Ask → Receive private Offer → Accept → Coordinate → Handoff → Return/Complete → Remember optionally
```

The repository contains both:

1. the working **Paseos pilot application** under `apps/web`; and
2. the production architecture, SQL migrations, security rules, tasks, runbooks, and Codex instructions required to operate it as a controlled pilot.

## Canonical visual direction

Use:

- `visuals/00_CANONICAL_UI_DIRECTION.png`
- `visuals/canonical-screen-crops/`
- `docs/05_DESIGN_SYSTEM.md`
- `docs/06_SCREEN_REQUIREMENTS.md`

The selected direction is the warm, mobile-first board with a greeting-led home, structured multi-need Ask, prominent WhatsApp sharing, private Offer review, private coordination, a lightweight completion moment, and post-success item memory.

Do **not** copy exploratory mistakes from the board: public stars, exact addresses before acceptance, inventory as the home-page center, or a numerical trust score.

## Read in this order

1. `AGENTS.md`
2. `docs/00_EXECUTIVE_DECISIONS.md`
3. `docs/02_P0_BUILD_CONTRACT.md`
4. `docs/03_SERVICE_ACCOUNTS_AND_ENVIRONMENTS.md`
5. `docs/04_UX_INFORMATION_ARCHITECTURE.md`
6. `docs/05_DESIGN_SYSTEM.md`
7. `docs/07_DOMAIN_MODEL_AND_STATE_MACHINES.md`
8. `docs/08_DATABASE_SCHEMA_AND_RLS.md`
9. `docs/15_SECURITY_PRIVACY_AND_SAFETY.md`
10. `docs/18_ROADMAP_AND_TASK_SEQUENCE.md`
11. `docs/25_PASEOS_PILOT_MEMBERSHIP_ADMIN_AND_LAUNCH.md`

The complete original PRD is preserved at `docs/01_FULL_PRD.md`.

## Repository map

```text
apps/web/                  Next.js App Router frontend/full-stack scaffold
packages/contracts/        Zod schemas, enums, and domain-event contracts
supabase/migrations/       ordered PostgreSQL schema, transactions, and RLS
supabase/tests/            hostile authorization test fixtures
docs/                      authoritative product/technical specifications
tasks/                     Codex execution packets in build order
runbooks/                  operational and incident procedures
prompts/                   reusable Codex review/implementation prompts
visuals/                   canonical board, crops, alternates, contact sheets
design/assets/             source design assets
prototype/interactive/     earlier static behavior reference only
```

## Local start after dependencies are available

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Mock mode does not require Supabase. The frontend routes and happy path should render with synthetic data.

For real local persistence:

```bash
supabase start
supabase db reset
pnpm dev
```

## What the application implements

- greeting-led Circle home;
- finite, non-engagement-ranked activity;
- progressive three-step Ask creation;
- multi-Need Ask;
- scoped shared Ask page;
- unlisted Offer submission;
- private Offer review;
- acceptance and exact-location boundary;
- private coordination;
- physical Loan handoff, extension, return, and confirmation states;
- optional post-return Resource memory;
- activity, inbox, profile, admin-boundary, and design-system routes;
- provider and API seams for Supabase, email, analytics, error monitoring, AI, and WhatsApp.

The Paseos-specific release also includes a branded public welcome page, real
email OTP joining, immediate invite membership, operator-controlled Circle
provisioning, a browsable member library, an optional quick-add item wizard,
revocable launch links, and role administration.

## What remains human-gated

The deterministic product and database paths are implemented and tested.
Production still requires the account owner to configure the DreamCraftLabs
Netlify environment, hosted Supabase Auth email delivery, abuse controls,
monitoring, backups, legal policy, and launch approval. Codex must stop at the
human gates in `AGENTS.md`.

## Codex entry points

- **Controlled:** paste `CODEX_START_PROMPT.md`; Codex completes Task 00 only.
- **Sequential autonomous implementation:** paste `CODEX_AUTONOMOUS_BUILD_PROMPT.md`; Codex may proceed through tasks with mandatory checkpoints and must stop at human gates.

Do not give Codex a one-line “build this app” prompt. The repository instructions are the control system.

## Netlify deployment

This monorepo is ready to import into Netlify from GitHub:

```text
Repository: Beejeezum/callon
Netlify team: DreamCraftLabs
Netlify project: callonapp
Base directory: leave unset (repository root)
Package directory: apps/web
Build command: pnpm --filter @call-on/web build
Publish directory: apps/web/.next
```

Netlify reads the root `netlify.toml`, uses the pinned Node/pnpm toolchain, and
applies its maintained OpenNext adapter automatically. The mock-mode deployment
requires no secrets. Set `NEXT_PUBLIC_APP_URL` to the final Netlify URL so shared
Ask metadata uses the deployed origin.
