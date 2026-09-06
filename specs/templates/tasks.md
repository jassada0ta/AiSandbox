# Tasks: <FEATURE NAME>

| Field   | Value        |
| ------- | ------------ |
| Spec    | `./spec.md`  |
| Plan    | `./plan.md`  |
| Updated | <YYYY-MM-DD> |

Rules for this list:

- One task = one commit-sized change that leaves the repo working.
- Every task names the requirement it serves and the files it touches.
- Tests come before the implementation they cover (`T00x` red → `T00y` green).
- Tick a box only when the checks in the task's _Done when_ column actually pass.

## Tasks

| ID   | Task                          | App        | Proves | Done when                        |
| ---- | ----------------------------- | ---------- | ------ | -------------------------------- |
| T001 | <what to do>                  | SandboxApi | REQ-1  | <command that passes>            |
| T002 | <what to do>                  | SandboxE2eTest | AC-1 | <test fails for the right reason> |
| T003 | <what to do>                  | SandboxSpaApp | REQ-1 | <T002 now passes>                |

## Checklist

- [ ] T001 — <task>
- [ ] T002 — <task>
- [ ] T003 — <task>

## Verification

Run before calling the feature done:

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] Every acceptance criterion in the spec is ticked off by a named test
- [ ] Spec status moved to `Shipped`

## Notes

Decisions taken during the build that the plan did not anticipate. If a note
here contradicts the spec, update the spec — the spec is the source of truth.
