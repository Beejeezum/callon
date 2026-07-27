# Design System — Canonical Direction

## 1. Source of truth

Primary board: `visuals/00_CANONICAL_UI_DIRECTION.png`  
Crops: `visuals/canonical-screen-crops/`  
Machine-readable tokens: `design/tokens.json` and `apps/web/src/app/globals.css`

The system is warm, clear, optimistic, and operational. It should not look like a rental marketplace, HOA portal, or generic enterprise dashboard.

## 2. Brand posture

- **Friendly without childishness.** Small moments of play are allowed in completion states.
- **Private and trustworthy.** Surfaces are calm and specific; avoid aggressive growth mechanics.
- **Action-oriented.** Every screen makes the next real-world step obvious.
- **Neighborly, not corporate.** Use plain language and human-scale imagery.

## 3. Color tokens

Canonical production tokens:

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FAF9F6` | app background |
| `surface` | `#FFFFFF` | forms and working panels |
| `ink` | `#0F172A` | primary text |
| `ink-muted` | `#64748B` | secondary text |
| `line` | `#E7E5E0` | subtle boundaries |
| `green-700` | `#166534` | strong text/state |
| `green-600` | `#168A34` | primary actions |
| `green-100` | `#DCF5E2` | success/help tint |
| `green-50` | `#F0FAF2` | subtle positive surface |
| `violet-600` | `#7C54ED` | Need/coordination accent |
| `violet-100` | `#EEE8FF` | Need chip background |
| `amber-500` | `#F59E0B` | event/highlight accent |
| `amber-100` | `#FEF3C7` | event chip background |
| `red-600` | `#DC2626` | destructive/incident only |
| `red-50` | `#FEF2F2` | error surface |
| `slate-900` | `#0F172A` | icon/near-black |
| `slate-500` | `#64748B` | muted icons |

Do not use violet for every heading merely because the board labels screens in violet. Those labels are presentation annotations, not in-product chrome.

## 4. Typography

Default: `Inter`, loaded through Next.js font optimization or a local/system fallback.

| Style | Size / line-height | Weight | Use |
|---|---|---:|---|
| Display | 32/38 mobile, 40/48 desktop | 700 | rare landing or completion moment |
| H1 | 26/32 | 650–700 | page title/greeting |
| H2 | 20/27 | 650 | section title |
| H3 | 17/24 | 650 | card/object title |
| Body | 15/23 | 400 | standard copy |
| Body strong | 15/23 | 600 | labels and summaries |
| Small | 13/19 | 400/500 | metadata |
| Caption | 12/17 | 500 | status and helper text |

- Default body is 15–16 px; never shrink core content to make a mockup fit.
- Use tabular numerals for quantities and due-time counters where helpful.
- Limit long text lines to roughly 65 characters.
- Avoid all caps except compact status labels; include letter spacing when used.

## 5. Spacing

4 px base grid.

```text
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
```

Mobile page padding: 16 px.  
Desktop page padding: 24–32 px.  
Section gap: 24–32 px.  
Row gap: 12–16 px.

## 6. Radius and elevation

```text
radius-sm: 10px
radius-md: 14px
radius-lg: 18px
radius-xl: 24px
radius-pill: 999px
```

Use borders and spacing before shadows. Default card shadow is nearly invisible:

```css
box-shadow: 0 1px 2px rgb(15 23 42 / 0.04),
            0 8px 24px rgb(15 23 42 / 0.045);
```

No nested floating-card stacks unless each object is genuinely independent.

## 7. Buttons

### Primary

- green fill, white text;
- 48 px standard height;
- 14 px radius;
- full width on mobile at decision points;
- concise verb phrase.

### Secondary

- white or transparent surface;
- green or ink border/text;
- same height as paired primary where practical.

### Tertiary

- text/icon action without container;
- not used for destructive actions.

### Destructive

- red text or red fill only after explicit confirmation;
- never adjacent to the primary action without separation.

Every button has hover, focus-visible, active, disabled, pending, success/error response states.

## 8. Form controls

- 48 px minimum field height;
- persistent visible labels; placeholder is supplementary;
- 14 px radius;
- error text below the field;
- helper/privacy text near the relevant field;
- use segmented controls for small exclusive sets;
- use checkboxes for multi-select help types;
- do not make users type dates when a reliable date picker is available.

## 9. Object patterns

### Ask card

Contains type/status chip, title, date, concise description, Need coverage, human contributors, and one clear action. It is not a general discussion card.

### Need row

Icon, label, quantity/coverage, contributor state, and optional Offer action. Use both icon/text and state marker.

### Offer row

Avatar, name, concise contribution, time, and factual history. Only Ask owner and contributor see it.

### Commitment card

Item/help summary, parties, next action, pickup/return schedule. Private logistics appear only here after acceptance.

### Saved Resource row

Image/icon, plain label, saved date/status. Availability language is `happy to be asked`, `paused`, or `Circle visible`; never guaranteed availability.

## 10. Iconography

Use Phosphor Icons with rounded line weight matching the board. Standard size 20–22 px, 24 px for navigation, 16–18 px for compact metadata. Do not substitute emoji for functional icons. Celebratory imagery may be a raster asset in completion states.

## 11. Imagery

- Use real or generated object photography where it reduces uncertainty: tables, ladder, cooler, pressure washer.
- Never imply an exact location through exterior-home photography on public pages.
- Strip EXIF/location metadata from uploads.
- Use square/4:3 crops, object centered, neutral background.
- Avatars are optional; initials fallback must be polished.
- Do not use stock imagery merely to fill white space.

## 12. Motion

- 120–220 ms for controls and sheets;
- small progress transitions;
- a single completion animation or confetti asset;
- obey `prefers-reduced-motion`;
- no pulsing notifications, streaks, or engagement animation.

## 13. Accessibility

- WCAG 2.2 AA target;
- green/white combinations must pass contrast for the actual token use;
- focus ring token: 3 px green/violet with 2 px offset;
- icon-only controls require accessible names;
- status is announced and represented by more than color;
- preserve 200% zoom and text reflow;
- no essential action depends on drag/swipe.

## 14. Canonical copy examples

```text
Create an Ask
What do you need help with?
Add another need
Share to WhatsApp
I can help
Accept this offer
Exact pickup details are shared only after you accept.
Request an extension
Mark as returned
Confirm return
Save for future matches?
Not this time
```

## 15. Design-system governance

- Add tokens before adding one-off values.
- Add a component only after the second real use; avoid premature component factories.
- Storybook is optional for P0; the `/design-system` internal route can document primitives.
- Every component supports light mode only in P0; do not add dark mode before the core loop is proven.
- Visual changes must be compared against canonical crops and recorded in `docs/20_IMPLEMENTATION_DECISIONS.md` when material.
