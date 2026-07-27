# Call On — P0 Clickable Prototype

> **Reference only.** This folder is not the production application and must not be deployed as the pilot. The authoritative production target is `apps/web`, Vercel, and the root v2 documentation. Netlify notes below describe an optional way to inspect this static artifact only.

A mobile-first, browser-based prototype for a private, request-first neighborhood sharing network.

The prototype implements the P0 loop with realistic fake data:

```text
Create an Ask
→ review an AI-structured draft
→ share into a WhatsApp-style group
→ open the shared Ask without an account wall
→ offer an unlisted item or another kind of help
→ verify identity only when submitting
→ accept an Offer
→ coordinate privately
→ confirm handoff
→ extend or return the item
→ save the item only after successful use
→ share a completion/thank-you card
```

## Open the prototype

### Easiest

Open [`standalone.html`](./standalone.html). It contains the CSS and JavaScript inline and can be opened directly without a build step.

### Local server

From this folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/#/home
```

### Netlify

The folder is ready for a static Netlify deployment:

1. Put this folder in a GitHub repository.
2. Connect the repository in Netlify.
3. Leave the build command empty.
4. Set the publish directory to `.`.

`netlify.toml` already provides the single-page-app redirect.

## Prototype map

A small ✦ control appears on authenticated screens. It opens a map of the principal prototype routes.

Direct routes:

| Flow | Route |
|---|---|
| Member dashboard | `#/home` |
| Natural-language Ask composer | `#/create` |
| Shared WhatsApp Ask | `#/ask/ladder?visitor=1` |
| First-time contribution | `#/contribute/ladder` |
| Offer inbox | `#/owner/offers` |
| Private plan | `#/plan/ladder` |
| Handoff | `#/handoff/ladder` |
| Active loan | `#/loan/ladder` |
| Progressive item memory | `#/save-resource` |
| Completion card | `#/complete` |
| Resource Hints and quiet mode | `#/hints` |
| Incident report | `#/incident` |
| Pilot admin console | `#/admin` |

The prototype stores demo state in browser `localStorage`. Use **Prototype map → Reset demo** to restore the initial state.

## Files

```text
index.html                 Deployable static entry point
standalone.html            Self-contained version for direct opening
styles.css                 Responsive visual system and components
app.js                     Hash router, fake data, state and interactions
manifest.webmanifest       PWA metadata
netlify.toml               Static deployment configuration
assets/                    Logo and Open Graph preview

docs/PRD.md                Full implementation-grade PRD
docs/UX-SPEC.md            Screen-by-screen interaction specification
docs/PRD-TRACEABILITY.md   Requirements-to-prototype map
docs/PRODUCTION-PATH.md    Recommended migration to the production stack

tests/smoke.py             Playwright critical-flow smoke test
tests/screenshots/         Mobile and desktop visual checkpoints
```

## Prototype limitations

This is a deterministic clickable prototype, not the production pilot. It intentionally has:

- Fake identities and data.
- No Supabase database or authentication.
- No real one-time-code delivery.
- No real WhatsApp Business integration.
- No transactional notification provider.
- No production moderation, evidence storage or legal terms.
- No server-side authorization or Row Level Security.

The prototype is designed to validate vocabulary, activation, interaction sequence, privacy perception and emotional tone before production engineering begins.

## Validation completed

`tests/smoke.py` verifies:

- Rendering across principal mobile screens.
- The first-time contributor flow through offer submission.
- The requester flow through draft and share.
- Desktop dashboard and admin rendering.
- Absence of browser console/page errors during those flows.

Run:

```bash
python tests/smoke.py
```
