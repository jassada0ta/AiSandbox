---
description: Stage 5 — run the checks and audit acceptance-criteria coverage before shipping
argument-hint: <spec id, e.g. 0002>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

Start stage 5 (Verify) for spec **$ARGUMENTS**.

1. Run all four, from the repo root, and report the real output of each:

   ```bash
   npm run lint
   npm run build
   npm run test:e2e
   npm run spec:check
   ```

2. Audit the acceptance criteria. Walk `spec.md` one criterion at a time and
   name the test that proves it — file plus test name. Do not accept "the code
   does this"; a criterion with no test is not done, however finished the code
   looks. List any that are uncovered and write the missing tests.

3. Check the requirement coverage table in `plan.md` still matches reality.
   File paths and test names drift during a build; fix the table.

4. Confirm every task in `tasks.md` is ticked and the _Notes_ section records
   anything a future reader would want to know.

5. Only when all of the above holds, set the spec's status to `Shipped` and
   re-run `npm run spec:check -- $ARGUMENTS`. At `Shipped` the checker also
   demands that every open question is answered and every task ticked.

Report what passed and what did not, plainly. If something is failing, say so
with its output and stop — do not set the status to `Shipped` to tidy up the
paperwork.
