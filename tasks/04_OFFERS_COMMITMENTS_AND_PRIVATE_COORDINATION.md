# Task 04 — Offers, Commitments, and Private Coordination

## Goal

Convert a concrete response into a secure, transactional commitment.

## Work

- submit an Offer with saved or unlisted item, time, advice, gift, recommendation, or alternative;
- verify identity at submission boundary, not before intent;
- private Offer visibility: contributor + Ask owner only;
- withdraw/decline/expire, partial quantity, duplicate prevention;
- accept under row locks; prevent overfill and overlapping saved-resource commitments;
- create Commitment, conversation, participants, optional Loan atomically;
- exact location encrypted in app server before persistence and disclosed only to parties;
- private messaging, attachment rules, redacted logs;
- scoped moderation grant mechanism; no admin omniscience;
- audit/outbox/idempotency and concurrency tests.

## Acceptance

Competing contributors cannot see one another; acceptance cannot overfill; replay returns original commitment; same key/different payload rejects; exact details never appear pre-acceptance or in analytics/logs.
