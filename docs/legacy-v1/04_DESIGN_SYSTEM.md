# Design System — P0 Default

The design should feel neighborly, capable, calm, and lightly playful. It must not resemble a rental marketplace, HOA management portal, or enterprise dashboard for ordinary members.

## 1. Visual source hierarchy

1. Use `visuals/prototype-screenshots/` as the primary behavior and tone reference.
2. Use `visuals/03-lean-mobile-flow-spec-board.png` for clean mobile information hierarchy.
3. Use `visuals/01-flow-first-mobile-ux-board.png` for flow completeness and friendly status moments.
4. Use the admin/dashboard section of visual 02 only for administrative surfaces.
5. Do not combine every card, metric, icon, illustration, and feature from the boards into one interface.

## 2. Tokens

Use these as initial CSS variables. They may be adjusted slightly for WCAG contrast but should remain semantically stable.

```css
:root {
  --color-ink: #17241d;
  --color-ink-soft: #425048;
  --color-muted: #69746d;
  --color-paper: #f5f1e8;
  --color-paper-deep: #ebe4d7;
  --color-surface: #fffdf8;
  --color-surface-strong: #ffffff;
  --color-line: #d8d1c5;
  --color-line-strong: #bfb7aa;
  --color-primary: #22543d;
  --color-primary-hover: #2f6c50;
  --color-primary-soft: #dceade;
  --color-primary-pale: #edf5ee;
  --color-accent: #e97552;
  --color-accent-strong: #b84b2e;
  --color-accent-soft: #f8daca;
  --color-warning: #c38a2d;
  --color-warning-soft: #f5e6bd;
  --color-info: #356a8a;
  --color-info-soft: #dcebf3;
  --color-danger: #a43d3d;
  --color-danger-soft: #f7dfdc;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 26px;
  --radius-xl: 34px;
}
```

## 3. Typography

- Use one highly readable sans-serif family available through the project or system stack.
- Default body: 16px, line-height 1.45–1.55.
- Small text: minimum 13px; avoid essential content below 14px.
- Mobile display: 32–40px with tight line-height.
- Section heading: 22–28px.
- Keep long text under approximately 65 characters per line.
- Use sentence case. Avoid all-caps except tiny labels where accessibility remains strong.

## 4. Layout

- Mobile baseline: 390×844 viewport.
- Content width on member desktop: 1120px maximum.
- Main mobile content padding: 16px; 20–24px on larger phones.
- Sticky header only when it preserves context.
- Bottom navigation respects safe-area insets.
- Use spacing and grouping before borders or shadows.
- Avoid card-inside-card patterns.
- A list of Needs should read as one grouped surface with row separation.
- Reserve strong green filled surfaces for the current obligation or primary outcome.

## 5. Components

Required primitives:

- Primary, secondary, quiet, destructive buttons.
- Text input, textarea, date/time, select, checkbox, radio, OTP.
- Need row with coverage meter.
- Ask summary header.
- Offer row and offer detail.
- Status pill with icon/text.
- Timeline/event row.
- Bottom sheet or full-screen mobile disclosure.
- Toast and inline error.
- Empty state.
- Confirmation dialog for destructive actions only.
- Private-message composer.

Buttons:

- Minimum height 48px for primary mobile actions.
- Minimum tap target 44×44px.
- Disabled state must remain readable.
- Loading state preserves width and announces progress.

## 6. Icons and imagery

- Use simple line icons with text labels for important actions.
- Do not rely on decorative illustrations to explain core workflows.
- Use item photos only when supplied or useful for identification.
- Avoid stock photography of idealized neighborhoods in the application itself.
- Completion may use a small heart, spark, or community mark; keep it restrained.

## 7. Motion

- 150–250ms transitions for disclosure and state changes.
- Respect `prefers-reduced-motion`.
- No looping celebration or attention animation.
- Use motion to confirm state, not manufacture engagement.

## 8. Accessibility

- WCAG 2.2 AA target.
- Visible focus states.
- Logical heading hierarchy.
- Form errors associated with fields.
- Live regions for async status only where useful.
- Color is never the sole state indicator.
- Touch and keyboard access for every operation.
- Test screen-reader labels for icon-only controls.
