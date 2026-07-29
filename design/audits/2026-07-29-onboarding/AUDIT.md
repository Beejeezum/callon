# Paseos Onboarding, Signup, and Guide Audit

**Date:** 2026-07-29  
**Viewport:** 390 × 844 mobile, with a desktop responsive spot check  
**Scope:** public welcome, member sign-in, invitation signup, email verification,
first member home, and the public how-it-works guide

## User goal

A Paseos neighbor opening a WhatsApp link should understand the idea quickly,
join with minimal personal information, and know exactly what happens next.
Bruce also needs one polished public page he can share before launch to explain
the full concept without turning signup into a product tour.

## What was already working

- The Paseos entrance photo and warm ivory/green visual language feel local and
  neighborly rather than institutional.
- The verified-email model is clear and avoids password friction.
- Exact-address and inventory deferral are already sound privacy decisions.
- The authenticated home correctly prioritizes a concrete Ask over profile or
  catalog completion.
- WhatsApp remains the community conversation surface while Call On owns the
  structured checklist and private handoff.

## Main friction found

1. **The public welcome page was doing three jobs at once.** It pitched the
   concept, taught the whole flow, and explained privacy before the visitor had
   chosen to learn more.
2. **Invitation signup repeated context.** The Paseos brand card, long headline,
   paragraph, form helper, and privacy card all restated the same promise.
3. **The verification step repeated too much of step one.** It needed to answer
   only “where is my code?” and “what do I do now?”
4. **Education had no durable share target.** The original walkthrough was
   embedded in the landing page instead of existing as a clean one-page guide.
5. **A reference image contained baked-in mockup text below the photograph.**
   The guide initially exposed that text at narrow widths; the displayed crop
   now deliberately excludes it.

## Changes made

1. Reduced the public welcome page to one promise, one short explanation, and
   two choices: **See how it works** or **Member sign in**.
2. Moved all detailed education to the public `/guide` route.
3. Reframed invitation signup as a two-step flow:
   - Step 1: first name, last name, email.
   - Step 2: enter the one-time code.
4. Shortened field help and privacy language while keeping the important
   reassurance: no address and no item list at signup.
5. Added a guide link to signup, sign-in, and the member home so the explanation
   remains easy to find without blocking the main task.
6. Added a complete five-step guide, a real birthday-party example, privacy
   boundaries, and native share/copy behavior.
7. Simplified the verified-invitation confirmation and the authenticated
   no-community edge state.

## Accessibility and content review

- Each auth field retains a persistent visible label.
- The two signup steps use both ordinal text and unique headings.
- Primary actions use verbs that match the immediate result.
- The public guide uses landmarks, ordered steps, semantic headings, descriptive
  image alternatives, and existing accessible button/link components.
- No essential meaning depends only on color; “Covered” and “Still needed” are
  written explicitly.
- Exact address, email, and inventory expectations are disclosed in context,
  not hidden in legal copy.

## Resulting journey

1. A neighbor opens Bruce’s private Paseos link from WhatsApp.
2. They see the Paseos identity and add only their name and email.
3. They enter a one-time code and receive immediate membership.
4. The member home leads with creating an Ask, browsing existing items, or
   reading the quick guide.
5. An Ask becomes one WhatsApp-friendly link.
6. Neighbors offer privately; an accepted offer opens pickup, return, and
   reminder details.
7. Item saving remains optional and happens only when useful.

## Product health

**Healthy for the Paseos pilot, pending production provider and policy gates.**

The public-to-member path is now materially lighter and the guide carries the
educational burden without compromising the core conversion flow. Remaining
launch risk is operational—real OTP/email setup, production RLS review, legal
policy, and deploy configuration—not unresolved first-screen UX.

## Evidence

### Before

- `01-public-welcome.jpg`
- `02-member-sign-in.jpg`
- `03-invite-signup.jpg`
- `04-email-verification.jpg`
- `05-first-member-home.jpg`

### Accepted direction

- `06-updated-public-welcome.jpg`
- `07-guide-top.jpg`
- `08-guide-steps.jpg`
- `09-guide-example.jpg`
- `10-updated-member-sign-in.jpg`
- `11-updated-invite-signup.jpg`
- `12-updated-email-verification.jpg`
