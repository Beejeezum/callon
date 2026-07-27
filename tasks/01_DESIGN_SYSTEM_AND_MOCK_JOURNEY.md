# Task 01 — Canonical Design System and Mock Journey

## Goal

Make the supplied mock-mode journey visually faithful, accessible, responsive, and complete before persistence adds complexity.

## Required screens

Home, Ask wizard, Ask detail, shared Ask, Offer form/success, private Offers list, Offer detail, acceptance, private coordination, Loan active/extension/return/confirmation, Resource memory, activity, inbox, profile, admin boundary, auth/join, design-system reference.

## Work

- compare each screen to the matching crop under `visuals/canonical-screen-crops/`;
- preserve warm off-white/white surfaces, green actions, violet need cues, amber events, and the canonical density;
- correct exploratory public ratings/address/trust mistakes;
- implement loading, empty, error, expired/revoked, permission-denied, and offline-friendly copy states;
- ensure all controls and core route transitions work with synthetic data;
- add component tests and Playwright happy path;
- test 390px, 768px, 1024px, 1440px, 200% zoom, keyboard-only, and reduced motion;
- add browser screenshots and `design-qa.md` with final result `passed`.

## Acceptance

No P0/P1/P2 visual or usability discrepancies; WCAG 2.2 AA automated baseline plus manual keyboard/zoom evidence; finite home experience; first Ask draft in under 60 seconds in usability rehearsal.
