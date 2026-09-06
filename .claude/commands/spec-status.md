---
description: Show where every spec stands in the flow
allowed-tools: Bash(npm run spec:check*), Bash(git log*), Bash(git status*), Read, Glob, Grep
---

Report the state of the spec-driven flow across the repo.

1. Run `npm run spec:check` and capture the result.

2. For each folder in `specs/` matching `NNNN-*`, read the spec's front matter
   table and its `tasks.md` checklist, then build one table:

   | Spec | Status | Tasks done | Apps | Blocking issue |
   | ---- | ------ | ---------- | ---- | -------------- |

   _Blocking issue_ is whatever the checker reported, or an unanswered question
   whose _Needed by_ has already passed, or nothing.

3. Call out anything stuck: a spec `In progress` with no ticked tasks, a spec
   `Approved` with no plan, a spec whose questions are unanswered past the stage
   that needed them.

4. Name the next action for each spec that is not `Shipped` — which slash
   command moves it forward.

Keep it to the table plus a few lines. Do not change any files.
