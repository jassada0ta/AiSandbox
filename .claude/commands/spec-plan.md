---
description: Stage 2 — turn an approved spec into a technical plan
argument-hint: <spec id, e.g. 0002>
allowed-tools: Bash(npm run spec:check*), Read, Write, Edit, Glob, Grep
---

Start stage 2 (Plan) for spec **$ARGUMENTS**.

1. Read `specs/$ARGUMENTS*/spec.md` in full. If its status is still `Draft`,
   stop and tell the user what is missing — an unapproved spec is not ready to
   plan against.

2. Read the code you intend to change before proposing changes to it. Also read
   `specs/0001-monorepo-foundation/plan.md`, which sets the standard for these.

3. Write `plan.md`:

   - **Approach** as prose, specific enough that a reader can predict which
     files change and why.
   - **Alternatives considered**, with the trade-off that ruled each one out.
     This table is the most valuable part of the file six months from now.
   - **Changes by app** — only the apps this feature touches; delete the rest.
     Name the `data-testid` hooks the SPA will expose and which Playwright
     project (`api`, `spa`, `prototype`) each new test belongs to.
   - **Requirement coverage** — a row for every `Must` requirement, saying
     where it is built and where it is proven. `spec:check` enforces this once
     the spec is `In progress`.
   - **Risks** and **Rollout**.

4. Respect the monorepo's split: data and rules in SandboxApi, durable screens
   in SandboxSpaApp, throwaway UI exploration in SandboxPrototypeWeb, proof in
   SandboxE2eTest. If a design question is still open, plan a prototype page
   first — it is cheap and reviewable in a browser.

5. If planning reveals that a requirement is wrong, incomplete or
   contradictory, say so and go back to the spec. Do not paper over it in the
   plan.

Stop after the plan. Summarise the approach, the trade-offs and any spec gaps
found, and ask the user to review before `/spec-tasks $ARGUMENTS`.

Do not write code.
