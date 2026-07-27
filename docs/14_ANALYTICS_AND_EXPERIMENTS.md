# Analytics, Metrics, and Experiments

## 1. North-star family

Do not use daily active users as the primary success metric. Measure whether trusted communities resolve real Needs.

Primary:

```text
completed assists per activated Circle per 30 days
```

Supporting:

- Ask Offer rate;
- median time to first useful Offer;
- Ask completion rate;
- Offer-to-Commitment conversion;
- Loan return-confirmation rate;
- unresolved incident rate;
- second Ask rate;
- second contribution rate;
- percent reporting they met/helped a neighbor they did not know;
- Resources saved after successful lend;
- active contributor concentration/burnout.

## 2. Activation definitions

### Member activation

A member publishes an Ask, submits an Offer, or completes an accepted Commitment. Account creation alone is not activation.

### Circle activation

A Circle completes at least three assists involving at least five distinct households/members within 30 days.

### Liquidity

Percent of eligible published Need lines receiving at least one useful Offer before deadline.

## 3. Event taxonomy

Use past-tense product events with versioned properties:

```text
circle_joined
ask_draft_started
ask_published
ask_share_opened
ask_shared
need_viewed
offer_draft_started
identity_verified
offer_submitted
offer_accepted
offer_declined
commitment_message_sent
location_shared
loan_handoff_confirmed
loan_extension_requested
loan_extension_resolved
loan_return_marked
loan_return_confirmed
resource_save_prompt_shown
resource_saved
resource_matching_paused
incident_reported
notification_delivered
```

## 4. Allowed properties

- event schema version;
- environment;
- object IDs as pseudonymous UUIDs when needed;
- Circle ID or cohort ID;
- Ask/Need type;
- category/risk class;
- quantity bucket;
- time-to-action;
- state before/after;
- channel (`web`, `whatsapp_share`, later assistant);
- member tenure bucket;
- guest/member status.

## 5. Prohibited analytics data

Never capture:

- phone/email;
- exact address/location instructions;
- message body;
- Ask free text unless separately de-identified and reviewed;
- Offer conditions/free text;
- image/file contents;
- share token;
- OTP/auth token;
- incident narrative/evidence;
- provider webhook payload;
- secret or environment variable.

## 6. Funnels

### Requester

```text
ask_draft_started
→ ask_published
→ ask_shared
→ offer_submitted
→ offer_accepted
→ commitment/loan completed
```

### Contributor

```text
ask_share_opened
→ offer_draft_started
→ identity_verified
→ offer_submitted
→ offer_accepted
→ commitment/loan completed
→ resource_saved (optional)
```

## 7. Experiments

Only run experiments that improve clarity or reduce friction without manipulating social pressure.

Approved early tests:

- one-sentence Ask first vs structured first;
- share copy variations;
- order of contribution types;
- timing of optional Resource-save prompt;
- neutral factual-history visibility;
- reminder timing within safe bounds.

Disallowed:

- fake scarcity;
- streaks;
- public rankings;
- guilt-based decline language;
- hiding privacy details;
- default opt-in to public inventory;
- deliberately increasing notification pressure.

Every experiment has hypothesis, primary metric, guardrail, sample boundary, duration, and rollback flag.
