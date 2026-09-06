# Plan: <FEATURE NAME>

| Field | Value                 |
| ----- | --------------------- |
| Spec  | `./spec.md`           |
| Status | Draft                |
| Updated | <YYYY-MM-DD>        |

## 1. Approach

The chosen design in a few paragraphs. Enough that a reader can predict which
files change and why.

## 2. Alternatives considered

| Option           | Why not                        |
| ---------------- | ------------------------------ |
| <other approach> | <the trade-off that ruled it out> |

## 3. Changes by app

Only list the apps this feature touches; delete the rest.

### SandboxApi (Strapi, JavaScript)

- Content types: <name and fields, or "none">
- Routes / controllers / services: <what changes>
- GraphQL: <resolvers or shadow-CRUD types affected>
- Permissions: <which roles get which actions>
- Migration or seed data: <needed, or "none">

### SandboxSpaApp (React + Vite)

- Routes / screens: <what changes>
- API calls: <REST and GraphQL used>
- State and data loading: <approach>
- `data-testid` hooks the e2e suite will use: <list them here>

### SandboxPrototypeWeb (Vite vanilla)

- Prototype pages to add under `prototypes/`: <filenames>
- What each one is exploring: <question the prototype answers>

### SandboxE2eTest (Playwright)

- New or changed specs: <paths under `tests/`>
- Which project they belong to: api / spa / prototype
- Fixtures or seed data required: <what and how>

## 4. Requirement coverage

Every `Must` requirement in the spec needs at least one row.

| Requirement | Where it is built | Where it is proven |
| ----------- | ----------------- | ------------------ |
| REQ-1       | <app + file>      | <test file + name> |
| REQ-2       | <app + file>      | <test file + name> |

## 5. Risks

| Risk        | Mitigation |
| ----------- | ---------- |
| <what could go wrong> | <what we do about it> |

## 6. Rollout

How this reaches a running system: build order, env vars to set, Strapi
permissions to flip, anything that must happen by hand.
