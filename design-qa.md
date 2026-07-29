# Paseos Pilot Design QA

## Comparison target

- Source visual truth:
  `visuals/00_CANONICAL_UI_DIRECTION.png`
- Focused source home:
  `visuals/canonical-screen-crops/02-home.png`
- Real Paseos brand asset:
  `apps/web/public/assets/paseos-entrance.png`
- Verified implementation:
  `https://deploy-preview-10--callonapp.netlify.app`
- States:
  signed-out Paseos welcome, preview member home, and member sign-in

## Capture and normalization

| Artifact | Pixels / CSS viewport | Density | Notes |
|---|---:|---:|---|
| Source home crop | 275 × 602 px | source raster | Includes the source phone frame |
| Mobile implementation | 390 × 844 px | 1 | Browser viewport capture |
| Normalized home comparison | 590 × 648 px | 1 | Implementation downsampled to 275 × 595; source left at 275 × 602 |
| Desktop implementation | 1440 × 1024 px | 1 | Browser viewport capture |
| Supplied entrance image | 543 × 287 px | source raster | Rendered responsively with the original asset |

Primary evidence:

- `artifacts/design-qa/home-comparison-pass2.png`
- `artifacts/design-qa/paseos-demo-mobile-clean.png`
- `artifacts/design-qa/paseos-demo-desktop.png`
- `artifacts/design-qa/paseos-landing-mobile.png`
- `artifacts/design-qa/paseos-landing-desktop-loaded.png`
- `artifacts/design-qa/paseos-login-mobile.png`

The source home is a signed-in activity state; the public `/demo` capture is an
explicit preview state and therefore includes a sample-data notice. The
comparison judges visual language and member-home structure without treating
that required notice as drift.

## Full-view comparison

The Paseos implementation preserves the canonical warm ivory surface, soft
green primary actions, violet need state, amber event state, rounded restrained
cards, compact filter chips, persistent mobile action, and calm non-feed
hierarchy. The preview intentionally adds a stronger Ask-first introduction and
library CTA before the activity list. This is consistent with the P0 product
contract and still keeps the first concrete Ask visible above the mobile fold.

Desktop expands into the documented rail-and-content layout without stretching
the mobile cards or losing the primary action. The welcome page uses the real
Paseos entrance image at both breakpoints; the image is neither recreated nor
replaced with code art.

## Focused comparison

- Typography: display text uses the same heavy, friendly, slightly tight
  hierarchy as the reference. Small UI labels remain readable and do not
  truncate at 390 px.
- Spacing and rhythm: headers, chips, cards, and bottom navigation align to a
  consistent compact rhythm. Mobile safe-area controls remain visible.
- Color: green, ivory, violet, and amber tokens map cleanly to the source and
  maintain usable contrast.
- Images: the real entrance image remains sharp after the optimized image load.
  Birthday and pressure-washer imagery load correctly in both responsive
  layouts.
- Copy: Paseos, Boca Raton, privacy boundaries, instant invitation membership,
  and Bruce attribution are clear without making the product feel like an HOA
  administrative tool.
- Sign-in: name/email expectations and the deferred-address promise are
  visually prominent and easy to scan.

No additional crop comparison was required for icons because the
implementation uses the established Phosphor icon library consistently with the
source, with no custom SVG or CSS-art substitution.

## Findings

No actionable P0, P1, or P2 visual differences remain.

### Accepted intentional differences

- The preview notice is present only in sample mode.
- The member home gives “Create an Ask” and “Browse the library” more
  above-the-fold emphasis than the exploratory source board.
- The desktop rail is an intentional responsive extension; the source board was
  mobile-only.

## Comparison history

### Pass 1 — local preview

- Result: blocked because the selected in-app browser’s URL policy rejected the
  local URL, preventing required visual evidence.
- Functional evidence still passed: 18 mobile/desktop browser journeys.

### Pass 2 — DreamCraftLabs HTTPS preview

- Earlier blocker resolved by the approved `callonapp` branch deploy.
- Initial screenshots were recaptured after optimized images reported complete;
  the first unloaded capture was discarded as capture timing, not a product
  defect.
- The Netlify preview toolbar was closed before the clean mobile evidence.
- Source and implementation were combined in
  `home-comparison-pass2.png`.
- Post-comparison result: no P0/P1/P2 fix was required.

## Interaction and console evidence

The automated browser suite verified 18/18 journeys across mobile and desktop:

- email OTP sign-in and instant invite joining;
- scoped guest Offer without Circle membership;
- private Offer acceptance and encrypted pickup details;
- checkout, extension, return, and optional item memory;
- admin invite, restriction, restoration, and role boundaries;
- quick-add Resource creation and member library discovery;
- restricted/suspended creation guards; and
- cross-role private-surface isolation.

The HTTPS preview produced no application-origin console error during the
review. A Google identity error originated from the authenticated Netlify
dashboard shell, not the deployed Call On origin.

## Follow-up polish

- P3: after the pilot has real activity, consider shortening the sample-mode
  notice so more than one Ask card appears above the smallest phone fold.

final result: passed
