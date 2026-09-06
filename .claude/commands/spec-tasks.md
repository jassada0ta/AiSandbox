---
description: Stage 3 — break a plan into an ordered, test-first task list
argument-hint: <spec id, e.g. 0002>
allowed-tools: Bash(npm run spec:check*), Read, Write, Edit, Glob, Grep
---

Start stage 3 (Break down) for spec **$ARGUMENTS**.

1. Read `specs/$ARGUMENTS*/spec.md` and `plan.md`. If there is no plan, stop and
   point the user at `/spec-plan $ARGUMENTS`.

2. Write `tasks.md` as the build order:

   - One task = one commit-sized change that leaves the repo working. If a task
     needs "and" to describe it, split it.
   - Every task names the app, the requirement or criterion it serves, and a
     _Done when_ that is a command someone can run.
   - **Tests come before the code they cover.** Pair them: the task that adds a
     failing test, then the task that makes it pass. For the test task, _Done
     when_ is "it fails for the right reason" — not merely that it fails.
   - Order so the repo is never broken between tasks. Schema before the API
     that reads it, API before the UI that calls it.
   - Keep the _Verification_ checklist (`lint`, `build`, `test:e2e`,
     acceptance criteria, status) intact.

3. Cross-check against the plan's coverage table. Every `Must` requirement
   needs at least one task. Say so if one has none rather than inventing a task
   for it.

4. Set the spec's status to `In progress`, then run `npm run spec:check -- $ARGUMENTS`.

Stop after the task list. Show the user the ordered tasks and ask them to
review before `/spec-build $ARGUMENTS`.

Do not start implementing.
