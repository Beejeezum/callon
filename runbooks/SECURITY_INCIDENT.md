# Security Incident

## Immediate containment

- Assign incident commander and log timestamps.
- Revoke/rotate compromised credentials and sessions.
- Disable affected routes/provider adapters or put Circle(s) in restricted mode.
- Preserve logs, audit events, webhook receipts, and relevant database snapshots.
- Avoid querying/exporting more personal data than investigation requires.

## Triage

Determine affected environments, users/Circles, data classes, time window, attack path, and whether exact location/contact/evidence was exposed. Treat shared-token enumeration, RLS bypass, service-role leakage, unauthorized moderator access, and message/location disclosure as high severity.

## Recovery

Patch with tests reproducing the exploit; independently review RLS; rotate keys; invalidate share/invite tokens as needed; restore only from trusted data; monitor recurrence.

Legal/privacy counsel determines notification obligations. Codex does not decide breach notification.
