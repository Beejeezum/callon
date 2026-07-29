# Paseos Pilot Design QA

## Comparison target

- Source visual truth:
  `visuals/00_CANONICAL_UI_DIRECTION.png`
- Additional real brand asset:
  `apps/web/public/assets/paseos-entrance.png`
- Implementation URL:
  `http://localhost:3000/`
- Intended viewports:
  mobile `390 × 844` CSS pixels at density 1; desktop `1440 × 1024` CSS pixels
  at density 1
- State:
  signed-out Paseos welcome and verified member home

## Evidence

- Source visual opened and reviewed: yes.
- Supplied Paseos entrance asset opened and reviewed: yes.
- Implementation rendered by the automated browser suite: yes; 18 journeys
  passed across mobile and desktop Chromium.
- Browser-rendered comparison screenshot: unavailable. The in-app browser
  rejected the local URL under its URL security policy, so a same-viewport
  implementation capture could not be produced in the required comparison
  surface.
- Console evidence: the automated browser journey suite completed without a
  reported application exception; a dedicated in-app-browser console review is
  still pending.

The source board and implementation screenshot could not be placed together in
one comparison input because the required implementation screenshot is absent.
No visual-fidelity pass is claimed from code or test results alone.

## Required fidelity surfaces

- Fonts and typography: pending screenshot comparison.
- Spacing and layout rhythm: pending screenshot comparison.
- Colors and visual tokens: the implementation uses the canonical warm ivory,
  green, violet, and amber token family; visible fidelity remains pending.
- Image quality and asset fidelity: the real supplied Paseos entrance image is
  used as a raster asset; crop, sharpness, and responsive treatment remain
  pending screenshot comparison.
- Copy and content: implemented for the Paseos pilot and verified through DOM
  journey assertions; visual wrapping remains pending.

## Findings

- [P1] Browser-rendered comparison evidence is missing.
  - Location: signed-out welcome, member home, join, library, and quick-add
    screens.
  - Evidence: the source board is available, but no valid same-viewport
    implementation screenshot could be captured in the selected browser.
  - Impact: typography, image crop, responsive rhythm, and above-the-fold
    balance cannot be accepted visually.
  - Fix: deploy the branch to the approved DreamCraftLabs `callonapp` HTTPS
    preview, capture mobile and desktop states, compare them with the canonical
    board in one input, fix any P0/P1/P2 differences, and repeat.

## Interaction evidence

The automated browser suite verified:

- email OTP sign-in and instant invite joining;
- scoped guest Offer without Circle membership;
- private Offer acceptance and encrypted pickup details;
- checkout, extension, return, and optional item memory;
- admin invite, restriction, restoration, and role boundaries;
- quick-add Resource creation and member library discovery;
- restricted/suspended creation guards; and
- cross-role private-surface isolation.

## Comparison history

### Pass 1 — 2026-07-29

- Earlier finding: none; this was the first Paseos-specific pass.
- Fixes made before capture: implemented the real entrance image, Paseos
  welcome/join branding, mobile-first library and item wizard, restricted-state
  CTA removal, and responsive navigation.
- Post-fix evidence: functional browser journeys passed, but visual comparison
  remained blocked by the local-URL browser policy.

## Implementation checklist

- Create the HTTPS branch preview in DreamCraftLabs `callonapp`.
- Capture signed-out welcome and signed-in home at mobile and desktop
  viewports.
- Capture join, library, and quick-add focused regions.
- Compare source and implementation together.
- Fix and recapture every P0/P1/P2 visual difference.

## Follow-up polish

- Evaluate the entrance-image crop on shorter iPhone viewports.
- Check display-font optical weight and long-name wrapping.
- Verify safe-area spacing around the persistent mobile navigation.

final result: blocked
