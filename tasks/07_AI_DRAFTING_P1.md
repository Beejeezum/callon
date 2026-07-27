# Task 07 — AI-Assisted Ask Drafting (P1, Disabled by Default)

## Preconditions

P0 pilot metrics justify lower-friction drafting; privacy/spend/evaluation plans approved by a human.

## Work

Use OpenAI Responses API through an adapter with strict structured output matching `schemas/ai-ask-draft.schema.json`. Accept text first; voice/image later. Treat output as untrusted draft. Show source-to-field confirmation. Apply moderation/prohibited-risk rules deterministically after extraction. Redact inputs, minimize retention, enforce budgets/timeouts, and keep manual fallback complete.

## Acceptance

Evaluation set passes extraction thresholds; no autonomous publish/mutation; prompt injection cannot bypass policy; feature flag/kill switch works; provider outage falls back cleanly.
