# Feature Implementation Prompt Template

Implement only this task: `[path to one numbered task file]`.

Before editing:

1. Read `AGENTS.md` and the task completely.
2. Identify the relevant PRD requirement IDs.
3. Inspect existing migrations, contracts, services, and tests.
4. Return a concise implementation checklist and predicted files.

During implementation:

- Change contracts first when state/payload changes.
- Put business rules in domain services, not components.
- Add RLS and hostile tests with every table/policy.
- Use transactions and idempotency for multi-row state changes.
- Implement mobile loading/empty/error/permission states.
- Add analytics/audit events only from allowlisted payloads.

Before completion, run all relevant checks and return:

- Acceptance checklist with pass/fail.
- Files changed.
- Migrations created.
- Authorization/RLS behavior.
- Tests and exact command results.
- Mobile and desktop screenshots for UI work.
- Documentation/decision updates.
- Remaining risks.

Do not start the next task.
