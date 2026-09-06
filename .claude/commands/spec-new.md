---
description: Stage 1 — scaffold a spec folder and fill in spec.md for a new feature
argument-hint: <feature name>
allowed-tools: Bash(npm run spec:new*), Bash(npm run spec:check*), Read, Write, Edit, Glob, Grep
---

Start stage 1 (Specify) of the spec-driven flow for: **$ARGUMENTS**

Read `docs/how-to-spec-drive.md` and `specs/0001-monorepo-foundation/spec.md`
first if they are not already in context — the second one is the worked example
of the standard to hit.

1. Scaffold the folder:

   ```bash
   npm run spec:new -- "$ARGUMENTS"
   ```

   Pass `--apps` if you already know which projects are involved.

2. Fill in `spec.md`. It answers **what** and **why**, never **how**. No file
   paths, no library names, no schema DDL — those belong in the plan.

   - Requirements get stable IDs and MUST/SHOULD wording. Each one must be
     falsifiable: someone should be able to disagree with it.
   - Every acceptance criterion names the requirement it proves and is
     concrete enough to picture as a Playwright assertion. If you cannot,
     the requirement is still too vague.
   - Fill _Out of scope_ with the things a reader would reasonably assume are
     included but are not.

3. Ask the user about anything genuinely ambiguous rather than guessing. Put
   each one in the open-questions table with _Needed by: plan_. Record the
   answers there as they come — the table is the decision log, not a scratchpad.

4. Run `npm run spec:check -- <id>` and fix what it reports.

Leave the status at `Draft` and stop. Summarise the requirements and the open
questions, and ask the user to review. Approval is theirs to give: once they
agree, set the status to `Approved` and they can run `/spec-plan <id>`.

Do not write a plan, and do not write code.
