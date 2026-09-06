# How to use the spec-driven flow in this monorepo

Every feature in AiSandbox goes through the same five stages. The rule behind
all of them is short:

> **Agree on what and why before deciding how, and decide how before writing
> code.**

The artefacts live in Git next to the code, so the reasoning behind a change is
reviewable, and a spec that no longer matches the code is a bug in the spec.

- [The five stages](#the-five-stages)
- [Stage 1 — Specify](#stage-1--specify)
- [Stage 2 — Plan](#stage-2--plan)
- [Stage 3 — Break into tasks](#stage-3--break-into-tasks)
- [Stage 4 — Implement](#stage-4--implement)
- [Stage 5 — Verify and ship](#stage-5--verify-and-ship)
- [Worked example](#worked-example)
- [Working with Claude Code](#working-with-claude-code)
- [Command reference](#command-reference)
- [Conventions](#conventions)
- [FAQ](#faq)

## The five stages

| Stage         | You produce  | Gate to pass                                              | Status becomes |
| ------------- | ------------ | --------------------------------------------------------- | -------------- |
| 1. Specify    | `spec.md`    | Requirements are testable; no question blocks planning     | `Approved`     |
| 2. Plan       | `plan.md`    | Every `Must` requirement has a home and a proof            | —              |
| 3. Break down | `tasks.md`   | Each task is commit-sized and names what it proves         | `In progress`  |
| 4. Implement  | code + tests | Tasks ticked; the e2e suite covers the acceptance criteria | —              |
| 5. Verify     | a green run  | `lint`, `build`, `test:e2e` and `spec:check` all pass      | `Shipped`      |

Each feature gets one folder:

```
specs/
├── templates/                    # spec.md, plan.md, tasks.md — the blank forms
├── 0001-monorepo-foundation/     # the worked example: this repo's own setup
│   ├── spec.md                   # what and why       (no implementation)
│   ├── plan.md                   # how                (no code)
│   └── tasks.md                  # in what order      (the build log)
└── 0002-your-feature/
```

The numeric prefix is assigned for you and never reused.

## Stage 1 — Specify

```bash
npm run spec:new -- "Article publishing" --apps SandboxApi,SandboxSpaApp
```

This creates `specs/0002-article-publishing/` with all three files pre-filled
with today's date and the feature name. Now fill in `spec.md`.

**The spec answers what and why. It never answers how.** No file paths, no
library choices, no schema DDL. If you catch yourself writing "add a Koa
middleware", that belongs in the plan.

Two sections carry the weight:

**Requirements** get stable IDs and MUST/SHOULD wording:

```markdown
| ID    | Requirement                                                          | Priority |
| ----- | -------------------------------------------------------------------- | -------- |
| REQ-1 | An editor MUST be able to publish an article and see it go live.      | Must     |
| REQ-2 | Readers MUST only see published articles.                             | Must     |
| REQ-3 | The SPA SHOULD show a draft badge on unpublished articles.            | Should   |
```

`REQ-1` is now this feature's permanent handle. The plan references it, the
tasks reference it, the test name references it. **Never renumber one** — if a
requirement dies, mark it retired and leave the ID sitting there.

**Acceptance criteria** turn each requirement into something a machine can
check:

```markdown
| ID   | Proves | Check                                                                  |
| ---- | ------ | ---------------------------------------------------------------------- |
| AC-1 | REQ-1  | Publishing in the admin makes the article appear in `GET /api/articles`. |
| AC-2 | REQ-2  | An unpublished article is absent from the public list response.          |
```

A criterion you cannot picture as a Playwright assertion is not specific
enough yet. That is the signal to keep writing, not to move on.

Then settle the **open questions**. Anything with _Needed by: plan_ blocks
approval — answer it in the table, or move the whole topic into _Out of scope_.
This is where you ask the person who wants the feature, not where you guess.

Run the gate and set the status to `Approved`:

```bash
npm run spec:check -- 0002
```

At `Approved` the checker stops being lenient: it rejects leftover template
placeholders like `<what is unclear>`, demands at least one acceptance
criterion, and rejects unanswered planning questions.

## Stage 2 — Plan

Now decide how, in `plan.md`.

Write the approach as prose first — enough that a reader can predict which
files will change. Then list what you did **not** choose and why; six months
later that table is the most valuable part of the file.

Fill in only the apps the feature touches and delete the rest. Two habits pay
off immediately:

- **Name the `data-testid` hooks** the SPA will expose. Deciding them here
  means the e2e tests can be written before the UI exists.
- **Say which Playwright project** each new test belongs to — `api`, `spa` or
  `prototype`.

The coverage table is the part the checker enforces:

```markdown
| Requirement | Where it is built                        | Where it is proven                         |
| ----------- | ---------------------------------------- | ------------------------------------------ |
| REQ-1       | `apps/SandboxApi/src/api/article/`        | `tests/api/article.spec.js` — "publishing…" |
| REQ-2       | Strapi `publishedAt` filter in the service | `tests/api/article.spec.js` — "drafts…"     |
```

Every `Must` requirement needs a row. `spec:check` fails the spec once it is
`In progress` if the plan never mentions one, which catches the classic failure
of a requirement quietly evaporating between spec and code.

### Where things go in this monorepo

| The feature needs…                       | It goes in                                                            |
| ---------------------------------------- | --------------------------------------------------------------------- |
| Stored data, business rules, permissions | `apps/SandboxApi` — content types, controllers, services, policies    |
| A REST or GraphQL surface                | `apps/SandboxApi`; GraphQL is generated by shadow CRUD unless extended |
| A screen a user comes back to             | `apps/SandboxSpaApp`, served at `/app`                                |
| A throwaway exploration of a UI idea      | `apps/SandboxPrototypeWeb/prototypes/` — one HTML file                 |
| Proof that any of it works                | `apps/SandboxE2eTest`                                                 |

If a design question is open, prototype it first. A file in
`prototypes/` is cheap, it appears on the entry page automatically, and it can
be reviewed in a browser before anything lands in the SPA. Reference the
prototype from the plan and delete it once the real screen ships.

## Stage 3 — Break into tasks

`tasks.md` is the build order. One task = one commit-sized change that leaves
the repo working.

**Tests come before the code they cover.** Write the task that adds a failing
test, then the task that makes it pass:

```markdown
| ID   | Task                                      | App            | Proves | Done when                        |
| ---- | ----------------------------------------- | -------------- | ------ | -------------------------------- |
| T001 | Add the `article` content type and fields | SandboxApi     | REQ-1  | `npm run build:api` succeeds      |
| T002 | Add a spec asserting drafts are hidden    | SandboxE2eTest | AC-2   | It fails for the right reason     |
| T003 | Filter unpublished articles in the service | SandboxApi     | REQ-2  | T002 passes                       |
```

"Fails for the right reason" is doing real work in that table. A test that
fails because of a typo in the URL has proved nothing about REQ-2.

Set the spec's status to `In progress` and start building.

## Stage 4 — Implement

Work the list top to bottom. For each task:

1. Make the change.
2. Run the narrowest check that proves it — `npm run test:api --workspace apps/SandboxE2eTest`
   beats the full suite while you iterate.
3. Tick the box in `tasks.md`.
4. Commit, mentioning the task ID.

Two things will happen, and both are normal:

**The plan turns out to be wrong.** Fix the plan in the same commit as the
code. A plan that describes a design nobody built is worse than no plan.

**A requirement turns out to be wrong.** Stop and go back to Stage 1. Change
`spec.md`, get it re-agreed, then continue. Do not let the code silently
redefine what was asked for — that is the one habit this whole flow exists to
prevent.

Record anything surprising in `tasks.md` under _Notes_. The notes in
`0001-monorepo-foundation/tasks.md` are a good example of what is worth
keeping: the scaffold bug that broke sqlite, why a linter rule was disabled,
why one word in the original request was read the way it was.

## Stage 5 — Verify and ship

```bash
npm run lint
npm run build
npm run test:e2e
npm run spec:check
```

Then walk the spec's acceptance criteria one at a time and name the test that
proves each one. A criterion with no test is not done, however finished the
code looks.

Set the status to `Shipped`. The checker now insists that every question is
answered and every task ticked, so a spec cannot claim to be shipped while its
own list says otherwise.

## Worked example

`specs/0001-monorepo-foundation/` is the setup of this monorepo written up as a
real spec — the same one the four projects were built from. Read it before
writing your first spec. Worth noticing:

- Requirements say what must be true (`the build output lands in
  SandboxApi/public/app`), not how (`set Vite's outDir`). The how is in the
  plan.
- The open questions table records the decisions that were genuinely ambiguous
  — including how "graphic plug-in" in the original request was read — with the
  answers, not the deliberation.
- Every `Must` requirement traces to a named Playwright test in the coverage
  table.
- The notes capture the two bugs found during the build, so the next person
  does not rediscover them.

## Working with Claude Code

The flow works the same whether a person or Claude is writing. Slash commands
map onto the stages:

| Command                     | Stage | What it does                                            |
| --------------------------- | ----- | ------------------------------------------------------- |
| `/spec-new <feature name>`  | 1     | Scaffolds the folder and interviews you to fill `spec.md` |
| `/spec-plan <id>`           | 2     | Reads the spec, writes `plan.md`, flags gaps             |
| `/spec-tasks <id>`          | 3     | Turns the plan into an ordered, test-first task list      |
| `/spec-build <id>`          | 4     | Works the tasks in order, ticking as it goes             |
| `/spec-verify <id>`         | 5     | Runs the checks and audits acceptance-criteria coverage   |

Run them in order and review the output of each stage before moving to the
next. The value is in the review: an agent that writes the spec, the plan and
the code with no one reading the spec has only automated the guessing.

Ask for one stage at a time. "Implement article publishing" invites a large
diff built on unstated assumptions; `/spec-new article publishing` produces a
document you can argue with in two minutes.

## Command reference

```bash
# Specs
npm run spec:new -- "Feature name"                 # scaffold a spec folder
npm run spec:new -- "Feature name" --apps SandboxApi,SandboxSpaApp
npm run spec:new -- "Feature name" --owner alex
npm run spec:check                                 # check every spec
npm run spec:check -- 0002                         # check one

# Development
npm run setup            # generate apps/SandboxApi/.env (safe to re-run)
npm run dev              # all three apps at once
npm run dev:api          # Strapi on :1337
npm run dev:spa          # SPA on :5173, proxying the API
npm run dev:proto        # prototype host on :5174

# Build and run
npm run build            # SPA → SandboxApi/public/app, then proto, then Strapi
npm run start            # Strapi, serving the API and the built SPA at /app

# Verify
npm run lint
npm run test:e2e         # builds first, then runs all Playwright projects
npm run test:e2e:ui      # Playwright UI mode
npm run test --workspace apps/SandboxE2eTest -- --project=api
```

## Conventions

**Statuses** move in one direction: `Draft` → `Approved` → `In progress` →
`Shipped`. Going backwards is fine and means the spec was wrong; say so in the
notes.

**IDs** are permanent. `REQ-3` means the same thing forever, including in
commit messages and test names. Retire, never renumber.

**Commits** reference the task: `T004: add SPA fallback middleware`. The spec
folder and the commit history then tell the same story.

**Branches** are named after the spec folder: `0002-article-publishing`.

**Small changes** — a typo, a dependency bump, a one-line fix — do not need a
spec. The test: if you cannot state the change as a requirement someone might
disagree with, just make it. If two reasonable people could implement your
sentence differently, write the spec.

## FAQ

**Do I really need a spec for a prototype?**
No. That is what `apps/SandboxPrototypeWeb` is for — explore in a plain HTML
file, then write the spec once you know what you want to build.

**The spec and the code disagree. Which wins?**
The spec, until someone changes it. If the code is right, update the spec in
the same commit and note why.

**Can I skip the plan for something small?**
If a task list is obvious enough that a plan would restate it, note that in
`plan.md` under _Approach_ in two sentences and move on. Do not delete the
file — `spec:check` expects it once the spec is `In progress`, and the next
person will look for it.

**How do I test a Strapi change without seeding content?**
Prefer assertions that hold against a stock install — introspection, status
codes, permission errors. When you do need content, create it in the test with
`request.post` and clean it up, and say so in the plan under _Fixtures_.

**`spec:check` fails on something I disagree with.**
It only checks structure — placeholders, missing IDs, uncovered requirements,
unticked tasks. If it is wrong about your spec, fix `scripts/check-specs.mjs`
and say why in the commit. It is a couple of hundred lines of Node with no dependencies.

---

See also: [`manual-repo-setup-guide.md`](./manual-repo-setup-guide.md) — how to
build this monorepo and every project in it from scratch, by hand.
