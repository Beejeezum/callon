Act as the lead engineer for Call On and execute the numbered tasks in `tasks/` sequentially, beginning at the first incomplete task in `BUILD_STATUS.md`.

Mandatory behavior:

- Follow `AGENTS.md` without exception.
- Read the specialized docs and canonical visual crop for each task before editing.
- Preserve the request-first product and privacy boundaries.
- Work in small commits/patch sets with a checkpoint report after each task.
- You may continue to the next task only when the current task's automated gates pass and no human stop gate is reached.
- Stop immediately at any human gate, unresolved RLS/security ambiguity, failed production-like migration, or external-account dependency. Return the exact human action and verification needed.
- Never create external accounts, accept legal terms, configure billing, expose secrets, apply production migrations, or enable real messaging.
- Never weaken a test or policy merely to make CI pass.
- Keep mock mode functional while real adapters are introduced.
- Update `BUILD_STATUS.md`, `docs/20_IMPLEMENTATION_DECISIONS.md`, and relevant runbooks after each task.

At each checkpoint report:

1. acceptance criteria completed;
2. files and migrations changed;
3. commands and exact results;
4. browser screenshots/visual comparison for UI tasks;
5. RLS/security evidence for data tasks;
6. deployment preview status;
7. remaining risk and next task.

Begin with a full preflight, then Task 00.
