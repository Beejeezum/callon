# Call On Production Kit — Manifest

Generated: `2026-07-27T02:12:37+00:00`

- Handoff version: **2.0**
- Files represented: **261** (generated manifest/checksum files excluded from their own hash set)
- Payload size represented: **20,010,835 bytes**

## Start here

1. `README_START_HERE.md`
2. `AGENTS.md`
3. `CODEX_START_PROMPT.md` or `CODEX_AUTONOMOUS_BUILD_PROMPT.md`
4. `docs/00_EXECUTIVE_DECISIONS.md`
5. `docs/02_P0_BUILD_CONTRACT.md`
6. `visuals/00_CANONICAL_UI_DIRECTION.png`

## Top-level inventory

| Path | Files |
|---|---:|
| `.env.example` | 1 |
| `.github` | 4 |
| `.gitignore` | 1 |
| `.nvmrc` | 1 |
| `.prettierignore` | 1 |
| `AGENTS.md` | 1 |
| `BUILD_STATUS.md` | 1 |
| `CODEX_AUTONOMOUS_BUILD_PROMPT.md` | 1 |
| `CODEX_START_PROMPT.md` | 1 |
| `README_START_HERE.md` | 1 |
| `apps` | 80 |
| `artifacts` | 6 |
| `design` | 9 |
| `docs` | 38 |
| `netlify.toml` | 1 |
| `package.json` | 1 |
| `packages` | 7 |
| `patches` | 1 |
| `pnpm-lock.yaml` | 1 |
| `pnpm-workspace.yaml` | 1 |
| `prompts` | 4 |
| `prototype` | 26 |
| `runbooks` | 11 |
| `schemas` | 2 |
| `scripts` | 7 |
| `supabase` | 11 |
| `tasks` | 11 |
| `visuals` | 31 |

## Critical implementation assets

- `apps/web/` — Next.js App Router mock-mode production scaffold.
- `packages/contracts/` — shared Zod/domain contracts.
- `supabase/migrations/` — ordered PostgreSQL schema, transaction RPCs, RLS, storage, seed, and hardening.
- `supabase/tests/` — hostile tenant/authorization tests to execute and expand.
- `docs/22_PRODUCTION_ARCHITECTURE_MAP.md` — runtime, trust-boundary, environment, and ER diagrams.
- `runbooks/` — account setup, deployment, backup, key rotation, privacy, moderation, and incident response.
- `prototype/interactive/standalone.html` — static behavior reference only; not production code.

## Verification

```bash
python3 scripts/check_repo_structure.py
python3 scripts/delivery_audit.py
python3 scripts/verify_bundle.py
python3 scripts/generate_manifest.py
```

`SHA256SUMS.txt` contains checksums for every delivered file except itself, including these generated manifests.
