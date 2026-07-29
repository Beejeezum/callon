# Implementation Decision Log

Codex and human engineers append material decisions here. Do not silently drift from the product contract.

## ADR-001 — Ask is primary

**Decision:** The central object is Ask with Need lines. Resource inventory is optional and secondary.  
**Reason:** demand creates immediate value and naturally recruits supply.  
**Consequence:** first-run and navigation optimize for Ask/contribution, not catalog completion.

## ADR-002 — One Next.js application

**Decision:** Use one App Router deployment for pages, server mutations, webhooks, and cron endpoints.  
**Reason:** minimizes operational complexity for pilot.  
**Rejected:** separate API, microservices, GraphQL.

## ADR-003 — Vercel over Netlify for production recommendation

**Status:** superseded by ADR-016.
**Decision:** Vercel was the original default host.
**Reason:** direct Next.js integration, Git previews, environments, and cron reduce adapter risk.  
**Note:** Next.js remains portable; provider-specific code is isolated.

## ADR-004 — Supabase PostgreSQL and RLS

**Decision:** one relational source of truth with database-level tenant/party policies.  
**Reason:** the model is highly relational and authorization-sensitive.  
**Rejected:** Firebase/document database; browser-only authorization.

## ADR-005 — Private schema for sensitive/operational data

**Decision:** contacts, exact locations, tokens, evidence, outbox, audit, and provider payloads are unexposed.  
**Reason:** RLS alone does not justify broad API exposure of highly sensitive columns.

## ADR-006 — Phone/email OTP, no password P0

**Decision:** verified contact at commitment boundary using Supabase Auth.  
**Reason:** low friction and suitable for share-link conversion.  
**Risk:** OTP abuse/cost requires Turnstile and rate limits.

## ADR-007 — Outbox-driven notifications

**Decision:** domain transaction writes outbox; worker expands/sends jobs.  
**Reason:** provider delivery cannot be part of the critical database transaction and retries must not duplicate state.

## ADR-008 — WhatsApp is sidecar

**Decision:** P0 shares links; P1 private assistant drafts and returns links.  
**Reason:** users retain existing group; Call On provides structure/ledger.  
**Rejected:** replacing WhatsApp or silently reading consumer groups.

## ADR-009 — AI is draft-only P1

**Decision:** strict structured drafts with user confirmation.  
**Reason:** input friction is suitable; trust/safety decisions are not.

## ADR-010 — Factual history, no ratings

**Decision:** display only accurate facts such as completed shares/no unresolved returns, with privacy policy.  
**Reason:** avoids retaliation, popularity dynamics, and opaque scoring.

## ADR-011 — Working name not cleared

**Decision:** centralize branding and treat Call On as codename.  
**Reason:** similar existing uses create a legal/market-confusion gate.

## ADR-012 — Node 24 and pnpm 11 bootstrap

**Date:** 2026-07-26  
**Status:** accepted  
**Decision:** Pin Node 24.18.0 in `.nvmrc` and pnpm 11.17.0 in `packageManager`.  
**Context:** The host default was end-of-life Node 16. Next.js 16 requires a current Node runtime, and pnpm 11's dependency lifecycle/supply-chain controls require Node 22 or newer.  
**Consequences:** Local and CI installs use the same supported toolchain. Contributors must activate `.nvmrc` before running workspace commands.  
**Security/privacy impact:** Current runtime security support and deterministic dependency installation are mandatory release gates.  
**Files/PR:** `.nvmrc`, `package.json`, `.github/workflows/ci.yml`.

## ADR-013 — Explicit dependency build and vulnerability remediation

**Date:** 2026-07-26  
**Status:** accepted  
**Decision:** Allow native install scripts only for `esbuild`, `sharp`, and `unrs-resolver`; enable strict dependency builds; override vulnerable transitive versions of `sharp`, `postcss`, and `brace-expansion`; patch `minimatch@3.1.5` for the `brace-expansion@5` CommonJS named export.  
**Context:** The first generated lockfile contained high-severity transitive advisories. A direct ESLint 10 upgrade was rejected because current Next.js React lint plugins are not compatible; ESLint 9.39.5 is the latest compatible line.  
**Consequences:** `pnpm audit --audit-level high` and peer checks pass. The small minimatch compatibility patch must be removed when the dependency tree natively supports the secure brace-expansion release.  
**Security/privacy impact:** Removes known high-severity dependency findings without disabling install-script controls or weakening tests.  
**Files/PR:** `pnpm-workspace.yaml`, `patches/minimatch@3.1.5.patch`, `pnpm-lock.yaml`, workspace package manifests.

## ADR-014 — Server environment contract is physically separate

**Date:** 2026-07-26  
**Status:** accepted  
**Decision:** Browser code may import only `public-env.ts`; service-role, cron, AI, and WhatsApp values live in `server-env.ts`, which imports `server-only`.  
**Context:** A shared environment module named server secrets while also being imported by the browser Supabase client. Even without values, that violated the Task 00 client-bundle acceptance boundary.  
**Consequences:** New server variables must be added only to the server contract. Client bundles are scanned for server-only identifiers after production builds.  
**Security/privacy impact:** Prevents accidental bundling of privileged configuration and makes review failures immediate.  
**Files/PR:** `apps/web/src/lib/public-env.ts`, `apps/web/src/lib/server-env.ts`, API route and Supabase client imports.

## ADR-015 — Local Supabase excludes Vector

**Date:** 2026-07-26  
**Status:** accepted  
**Decision:** Run the local stack with `supabase start -x vector`.  
**Context:** Supabase Vector is not required for migrations or RLS tests and cannot mount the Colima Docker socket through the current macOS virtualization path. All database, Auth, Storage, API, and test services run without it.  
**Consequences:** Local and CI database gates avoid an unrelated log-shipping dependency. Production observability remains a separate provider/configuration decision.  
**Security/privacy impact:** No authorization semantics change; migrations, Storage policies, and hostile database tests execute against the real local stack.  
**Files/PR:** `package.json`, `supabase/config.toml`.

## ADR-016 — Netlify is the deployment platform

**Date:** July 26, 2026.

**Status:** Accepted.
**Decision:** Deploy the Next.js monorepo through Netlify with the maintained
OpenNext adapter, Git-based deploy previews, and Netlify Scheduled Functions for
the later notification worker.
**Context:** The product owner already operates a Netlify account and explicitly
selected it for the public pilot. Current Netlify documentation lists full
support for Next.js App Router, Server Actions, Route Handlers, streaming,
image optimization, and modern Next.js releases.
**Alternatives:** Retain Vercel; deploy a static-only export; introduce a second
application server.
**Consequences:** Keep the monorepo base at repository root, set the Netlify
package directory to `apps/web`, and use the committed root `netlify.toml`.
Provider-specific scheduling stays isolated from domain services. The public
mock deployment needs no secrets; staging/production data environments remain
separate human gates.
**Security/privacy impact:** Deploy previews remain mock or staging-only and
must never receive production Supabase or provider credentials.
**Files/PR:** `netlify.toml`, deployment documentation, health metadata.

## ADR-017 — Paseos is invite-first; Circle provisioning is operator-controlled

**Date:** 2026-07-29
**Status:** accepted
**Decision:** A verified Paseos launch invite grants immediate active membership.
Verified guests may contribute only to the shared Ask. Ordinary authenticated
users cannot self-provision a Circle; approved communities are created through
the service-role-only `provision_circle` transaction.
**Context:** The Paseos pilot needs an easy WhatsApp join path without making
the community or member inventory public. Open Circle creation would also
bypass moderation ownership, launch readiness, and tenant provisioning review.
**Alternatives:** Open signup with later Circle selection; public Ask creation;
automatic address verification; administrator approval for every Paseos join.
**Consequences:** Signup captures first name, last name, and verified email.
Street address is deferred to an accepted transaction. The Paseos administrator
can revoke launch links, moderate memberships, and appoint moderators. A future
community application workflow creates no data-plane Circle before operator
approval.
**Security/privacy impact:** Invite secrets are hashed, guest grants are
Ask-scoped, exact addresses remain party-private, and arbitrary authenticated
Circle creation is revoked at the database privilege boundary.
**Files/PR:** `docs/25_PASEOS_PILOT_MEMBERSHIP_ADMIN_AND_LAUNCH.md`,
`supabase/migrations/202607290013_paseos_membership_library_admin.sql`,
Paseos auth/admin/library routes.

## ADR-018 — Progressive disclosure across welcome, guide, and signup

**Date:** 2026-07-29
**Status:** accepted
**Decision:** The public welcome page makes the core promise and routes detailed
education to a separate public 60-second guide. Invitation signup collects only
first name, last name, and verified email in two short steps. Address and
inventory details remain deferred until a real transaction or voluntary item
listing makes them useful.
**Context:** The original welcome and signup surfaces each repeated the product
model, privacy rules, and onboarding explanation. That created avoidable reading
before a neighbor could understand or join the Paseos pilot.
**Alternatives:** Keep the full walkthrough on the landing page; require a
multi-screen product tour before signup; ask new members to add an address or
inventory during onboarding.
**Consequences:** `/guide` is a stable WhatsApp-shareable explanation. The
welcome page, invitation form, verification step, and first member home each
serve one primary job.
**Security/privacy impact:** No authorization or persistence change. The
interface explicitly preserves email privacy and confirms that exact pickup
details and inventory are not required at signup.
**Files/PR:** `apps/web/src/app/guide`,
`apps/web/src/components/call-on-guide.tsx`,
`apps/web/src/components/paseos-landing.tsx`,
`apps/web/src/components/auth-form.tsx`,
`design/audits/2026-07-29-onboarding`.

## ADR-019 — Paseos pilot library is items-only

**Date:** 2026-07-29
**Status:** accepted
**Decision:** Remove the separate service-referral directory from the Paseos
pilot. The library contains only optional, neighbor-added items. Help, advice,
and recommendations remain available as contributions to a concrete Ask.
**Context:** A Services tab introduced a second product model, additional
validation work, and more information than a first-time neighbor needs. The
pilot should teach one loop: create an Ask, receive offers, and track any item
that needs to come back.
**Alternatives:** Keep Services alongside Items; hide Services behind a feature
flag; keep a static list of local referrals.
**Consequences:** `/library` has one search-and-browse experience for items.
Service-directory source and UI code are removed. Reintroducing referrals later
requires a separately scoped product and trust review.
**Security/privacy impact:** The pilot no longer ships third-party contact
details or unverified service claims, reducing privacy, maintenance, and
reputation risk.
**Files/PR:** `apps/web/src/app/library/page.tsx`,
`apps/web/src/components/library-view.tsx`, `apps/web/src/app/globals.css`.

## ADR template

```md
## ADR-0XX — Title

**Date:** YYYY-MM-DD  
**Status:** proposed | accepted | superseded  
**Decision:**  
**Context:**  
**Alternatives:**  
**Consequences:**  
**Security/privacy impact:**  
**Files/PR:**
```
