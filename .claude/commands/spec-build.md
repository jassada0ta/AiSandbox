---
description: Stage 4 — work a spec's task list in order, ticking as you go
argument-hint: <spec id, e.g. 0002> [task id, e.g. T003]
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

Start stage 4 (Implement) for spec **$ARGUMENTS**.

1. Read the spec, plan and tasks. Start at the first unticked task, or the task
   ID given in the arguments.

2. For each task, in order:

   - Read the surrounding code before changing it. Match the conventions
     already there — this repo is JavaScript throughout, no TypeScript.
   - Make the change, and only that task's change. Do not fold in the next
     task, and do not "while I'm here" anything.
   - Run the narrowest check that proves it: a single Playwright project
     (`npm run test --workspace apps/SandboxE2eTest -- --project=api`) beats
     the whole suite while iterating.
   - Tick the box in `tasks.md`.
   - Commit, with the task ID in the message: `T004: add SPA fallback middleware`.

3. When a task adds a test, confirm it fails **for the intended reason** before
   writing the implementation. A test failing on a typo has proved nothing.

4. When reality diverges from the plan:

   - The **plan** is wrong → fix `plan.md` in the same commit as the code.
   - A **requirement** is wrong → stop, tell the user, and go back to the spec.
     Never let the code quietly redefine what was asked for.

   Either way, record what you learned in `tasks.md` under _Notes_. Bugs found
   in tooling, a linter rule deliberately disabled, an ambiguity resolved — the
   notes in `specs/0001-monorepo-foundation/tasks.md` show the level of detail
   worth keeping.

5. Report honestly. A failing test gets reported with its output; a skipped
   task gets called out as skipped.

When every task is ticked, hand over to `/spec-verify $ARGUMENTS`.
