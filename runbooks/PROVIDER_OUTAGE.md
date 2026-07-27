# Provider Outage

## Principle

Core domain writes succeed or fail independently of email, analytics, monitoring, AI, or WhatsApp. Notifications are produced through the transactional outbox and retried idempotently.

## Response

1. Identify provider and scope; disable the adapter/feature flag if harmful.
2. Keep web/manual paths visible.
3. Do not repeatedly replay unknown-status sends without idempotency evidence.
4. Pause jobs when provider responses are ambiguous; preserve queue records.
5. Communicate only through an approved alternate channel.
6. Recover in bounded batches; watch duplicate rate and provider limits.
7. Reconcile sent/failed/dead-letter rows and document impact.

AI and WhatsApp outages must never block manual Ask creation or normal web sharing.
