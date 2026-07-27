# AI Assistance Specification

## 1. Principle

AI reduces input friction. It does not decide trust, safety, access, liability, moderation, or dispute outcomes.

P0 works without AI. AI is P1 behind a feature flag.

## 2. Approved P1 use cases

- Convert text or transcript into an editable Ask draft.
- Suggest Need lines and quantities.
- Classify a likely category/risk flag for deterministic review.
- Suggest missing low-risk supplies for a project.
- Summarize Ask coverage using authoritative database state.
- Translate user-entered copy with confirmation.
- Suggest a plain-language title or share message.

## 3. Prohibited AI uses

- trust/reliability scoring;
- moderation suspension without human review;
- dispute or damage adjudication;
- safety certification or professional-work authorization;
- ownership inference;
- exact replacement-value determination;
- publishing, accepting, messaging, or sharing without confirmation;
- extracting/storing exact locations from public text without explicit handling;
- training on user content without separate policy/consent.

## 4. Input minimization

Send only what is needed. Redact or omit:

- phone/email;
- exact address;
- share token;
- private message history;
- incident evidence;
- authentication data;
- unrelated profile/household context.

Voice notes are transcribed, normalized, and the raw file follows a short retention policy.

## 5. Structured output

Use the schema in `schemas/ai-ask-draft.schema.json`. Require strict JSON/schema output. Expected fields:

```text
title
context
starts_at / needed_by (nullable + confidence)
general_location (nullable)
needs[] { kind, title, quantity, unit, category_hint, notes, confidence }
clarifying_questions[]
risk_flags[]
```

The model does not choose database IDs or final policy outcomes.

## 6. Confidence behavior

- High confidence: prefill and highlight for confirmation.
- Medium: prefill with a visible review cue.
- Low: leave blank or ask one question.
- Conflicting date/location: do not guess.
- Risk flag: deterministic policy service decides whether publication is blocked.

## 7. Provider integration

Use a server-only provider adapter. Default implementation uses OpenAI Responses API and structured outputs. Pin model/configuration in environment/decision log rather than hardcoding assumptions throughout the app.

Required controls:

- timeout;
- bounded retries;
- input/output token caps;
- safe logging with content disabled/redacted;
- spend alerts;
- schema validation after response;
- deterministic fallback to manual form;
- feature flag and kill switch.

## 8. Prompt contract

System intent:

```text
Extract an editable community Ask draft. Do not infer ownership, exact address,
trustworthiness, professional qualification, or safety. Preserve uncertainty.
Return only the supplied schema. Flag potentially prohibited/high-risk categories.
```

## 9. Evaluation set

Create at least 100 synthetic/de-identified examples covering:

- simple one-item Ask;
- multi-Need party/event;
- time/help request;
- advice request;
- vague date;
- mixed give/lend;
- negation;
- colloquial/typo-heavy text;
- Spanish/English mixture if pilot needs it;
- dangerous/prohibited item;
- exact-address leakage;
- no real Ask;
- voice transcription artifacts.

Measure exact field accuracy, quantity/date accuracy, correction rate, unsafe inference, and failure-to-abstain.

## 10. Human confirmation

The user sees the draft in normal editable controls. Publication requires a deliberate confirmation. Never use wording that implies AI-confirmed facts.
