# Specs

One folder per feature. The flow that produces them is documented in
[`../docs/how-to-spec-drive.md`](../docs/how-to-spec-drive.md) — read that
first.

```
specs/
├── templates/                 # the blank forms; spec:new copies these
├── 0001-monorepo-foundation/  # worked example: this repo's own setup
│   ├── spec.md                # what and why      (no implementation)
│   ├── plan.md                # how               (no code)
│   └── tasks.md               # in what order     (the build log)
└── NNNN-your-feature/
```

## Commands

```bash
npm run spec:new -- "Feature name"                            # scaffold a folder
npm run spec:new -- "Feature name" --apps SandboxApi --owner alex
npm run spec:check                                            # check every spec
npm run spec:check -- 0002                                    # check one
```

The numeric prefix is assigned by `spec:new` and never reused.

## Statuses

A spec moves `Draft` → `Approved` → `In progress` → `Shipped`, and
`spec:check` gets stricter at each step:

| At          | The checker also requires                                             |
| ----------- | --------------------------------------------------------------------- |
| Any status  | REQ-\* rows exist, IDs are unique, every AC names a real requirement   |
| Approved    | No template placeholders left, at least one AC, no open planning question |
| In progress | `plan.md` and `tasks.md` exist, and every `Must` is covered by the plan |
| Shipped     | Every question answered and every task ticked                          |

Moving a status backwards is fine — it means the spec was wrong. Say so in the
task notes.

## Rules that keep these useful

- **The spec never says how.** File paths, libraries and schemas belong in the
  plan.
- **IDs are permanent.** `REQ-3` means the same thing forever, including in
  test names and commit messages. Retire one, never renumber it.
- **Acceptance criteria are testable.** If you cannot picture it as a
  Playwright assertion, the requirement is still too vague.
- **The spec wins over the code** until someone changes the spec. If the code is
  right, update the spec in the same commit and note why.
