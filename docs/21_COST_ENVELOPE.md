# Pilot Cost Envelope and Scaling Triggers

Pricing changes frequently. Verify current provider pricing before purchase. This document describes cost classes and control points rather than promising exact totals.

## 1. Lean pilot envelope

Expected paid categories:

- domain/email mailboxes;
- Netlify team/project if collaboration/protection features require it;
- Supabase production paid plan and optional compute/PITR;
- Resend beyond free/testing volume;
- Twilio/SMS OTP per send plus phone/provider fees;
- Sentry/PostHog when free allowances are exceeded;
- legal/trademark/insurance review;
- optional security review.

A small one-to-three Circle pilot should generally remain low hundreds of dollars per month in infrastructure, excluding professional legal/security/insurance work and unusually high OTP/AI traffic. Treat this as a planning range, not a quote.

## 2. Largest variable costs

1. SMS OTP abuse or repeated login sends.
2. Database compute/backups/PITR.
3. Image/file storage and egress if uploads are uncontrolled.
4. Email/WhatsApp notification volume.
5. AI transcription/extraction in P1.
6. Error/session-replay/analytics volume.

## 3. Cost controls

- geographic and velocity limits for OTP;
- session longevity appropriate to risk so users do not reverify constantly;
- image compression, MIME/size limits, retention cleanup;
- digest low-priority notifications;
- bounded overdue reminders;
- AI feature flag, token caps, spend alerts, and deterministic fallback;
- no session replay in P0 by default;
- database query/index review before scaling compute;
- provider budget alerts and monthly owner review.

## 4. Scaling triggers

Do not add infrastructure on vanity user counts. Review when:

- notification queue age exceeds target;
- database connection/CPU/query latency is sustained;
- public share traffic creates material server cost;
- one Circle produces thousands of active objects;
- realtime messaging expectations exceed polling/revalidation;
- operator incident queue becomes unmanageable;
- OTP fraud/spam causes material spend;
- product expands to multiple countries/legal regimes.

## 5. People costs

Budget human review for:

- product/security engineer review of RLS and migrations;
- legal/trademark/privacy/terms;
- insurance/risk consultation;
- moderator/support time;
- accessibility testing;
- incident response and backup drills.

These are not optional merely because Codex writes most implementation code.
