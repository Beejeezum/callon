# Security, Privacy, Safety, and Abuse Controls

## 1. Threat model

Protect against:

- cross-Circle data access;
- forwarded shared links;
- account takeover/OTP abuse;
- exact-location exposure;
- inventory-based burglary targeting;
- malicious or careless item use;
- harassment in private coordination;
- non-return/damage conflict;
- commercial spam;
- admin overreach;
- webhook/provider replay;
- secret leakage;
- unsafe AI inference;
- accidental logging/analytics capture of private content.

## 2. Data classification

### Public-safe

- product marketing;
- sanitized Ask projection available through a valid link;
- Circle display name/general area as configured.

### Circle-confidential

- Circle Ask list;
- member display context;
- Circle-visible Resources;
- aggregate community outcomes.

### Party-private

- Offers;
- Commitments;
- private messages;
- schedules;
- condition notes;
- Loan events.

### Highly sensitive

- phone/email;
- exact pickup location/instructions;
- incident narrative/evidence;
- auth/session/provider tokens;
- encryption/signing keys;
- raw webhook payloads.

## 3. Exact-location controls

- never collect on public Ask form;
- warn when public description appears to contain an address;
- collect only after acceptance;
- encrypt server-side with versioned key;
- expose only to accepted parties through an authorized server DTO;
- do not include in email subject/preview, analytics, logs, OG metadata, or audit payload;
- delete/expire when no longer operationally needed;
- audit elevated access.

## 4. Inventory privacy

- default Resource visibility is private or match-only;
- category hints are private;
- community browse is explicit opt-in;
- no replacement values or inventory totals on profiles;
- no public map;
- no vacation/unavailable-until date that signals an empty home;
- use `not currently available` rather than exposing travel schedule.

## 5. Prohibited P0 categories

At minimum block:

- firearms, ammunition, weapon components, and other regulated weapons;
- explosives/fireworks;
- controlled substances, prescription medicines, alcohol/nicotine sales;
- dangerous chemicals/poisons;
- heavy industrial machinery;
- vehicles/vehicle operation as a lending transaction;
- child car seats/critical safety equipment where condition/history is material;
- medical devices requiring professional oversight;
- high-voltage/electrical panel work;
- gas-line, structural, roofing, or other high-risk unlicensed labor;
- surveillance/spyware or unlawful access tools;
- recalled or known-defective items;
- anything illegal in the relevant jurisdiction.

Legal counsel and insurer must review the final list before launch.

## 6. Risk-adaptive friction

### Low

Examples: cooler, table, serving tray, board game.  
Flow: schedule → handoff → return.

### Moderate

Examples: ladder, drill, projector, pressure washer.  
Flow: terms acknowledgement, included components/condition, optional photo, handoff, return.

### High/prohibited

Blocked in P0 or requires a later legal/insurance product design. Do not allow a disclaimer to substitute for policy.

## 7. Logging and observability

Use structured logs with:

- request ID;
- safe object ID;
- environment;
- operation and result/error class;
- duration.

Redact:

- authorization/cookies;
- contact;
- exact location;
- messages/free text;
- tokenized links;
- incident/evidence;
- full webhook payload;
- provider credentials.

## 8. Moderator access

- incidents are assigned;
- access grant has scope, reason, start/end, and audit;
- Circle admin does not automatically inherit evidence/message access;
- platform operator uses a separate protected route and step-up auth;
- no “impersonate user” in P0;
- emergency access is rare, time-bounded, and reviewed.

## 9. Incident response classes

- **P0 Security:** active data exposure, auth bypass, secret compromise, credible physical threat.
- **P1 Major:** broad workflow outage, repeated cross-party notification leak, payment-like loss if later introduced.
- **P2 Operational:** isolated provider/job failure, individual dispute, recoverable data issue.

Runbooks define containment, communication, evidence preservation, recovery, and retrospective.

## 10. Privacy operations

Support:

- data access/export;
- correction;
- account deletion/pseudonymization;
- consent/terms version history;
- notification opt-out;
- channel opt-in/opt-out;
- retention schedule;
- vendor inventory/subprocessors;
- breach-response process.

Do not promise a legal compliance regime until counsel confirms applicability and implementation.

## 11. Security release gates

Before production pilot:

- human RLS review and hostile tests;
- dependency/security scan;
- secret scan;
- auth/OTP abuse test;
- share-link scope test;
- exact-location trace through code/logs/analytics;
- storage policy test;
- webhook signature/replay test;
- backup/restore drill;
- incident runbook tabletop;
- privacy/terms/prohibited-category legal review.
