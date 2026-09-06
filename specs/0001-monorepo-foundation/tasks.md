# Tasks: Monorepo foundation

| Field   | Value       |
| ------- | ----------- |
| Spec    | `./spec.md` |
| Plan    | `./plan.md` |
| Updated | 2026-09-06  |

## Tasks

| ID   | Task                                                                        | App                 | Proves      | Done when                                              |
| ---- | --------------------------------------------------------------------------- | ------------------- | ----------- | ------------------------------------------------------ |
| T001 | Add root `package.json` with npm workspaces, `.gitignore`, `.nvmrc`          | root                | REQ-1       | `npm install` installs all four workspaces              |
| T002 | Scaffold Strapi with `create-strapi-app@5 --js`, sqlite, no example          | SandboxApi          | REQ-2       | `npm run build:api` succeeds                            |
| T003 | Add `@strapi/plugin-graphql` and configure it in `config/plugins.js`         | SandboxApi          | REQ-2       | `POST /graphql` introspection returns a schema           |
| T004 | Add `spa-fallback` middleware above `strapi::public`                         | SandboxApi          | REQ-4       | `/app/any/route` serves index.html                       |
| T005 | Scaffold the React SPA with `create-vite --template react`                   | SandboxSpaApp       | REQ-3       | `npm run dev:spa` serves the app                         |
| T006 | Point the SPA build at `../SandboxApi/public/app` with `base: '/app/'`        | SandboxSpaApp       | REQ-3       | `npm run build:spa` writes into the Strapi public folder |
| T007 | Add the API client and a backend-status home screen with testid hooks         | SandboxSpaApp       | REQ-2       | The page reports the GraphQL root type                   |
| T008 | Scaffold the prototype host with `create-vite --template vanilla`             | SandboxPrototypeWeb | REQ-5       | `npm run dev:proto` serves the entry page                |
| T009 | Add the prototype scanner, the manifest plugin and multi-page build inputs     | SandboxPrototypeWeb | REQ-5       | Each prototype builds to its own page                    |
| T010 | Render the grouped, filterable index from the manifest                        | SandboxPrototypeWeb | REQ-5       | The entry page lists every prototype file                |
| T011 | Add two sample prototypes, one nested, plus shared CSS and conventions        | SandboxPrototypeWeb | REQ-5       | Grouping is visible on the index                         |
| T012 | Set up Playwright with two web servers and api/spa/prototype projects          | SandboxE2eTest      | REQ-6       | `npm run test:e2e` boots both servers                    |
| T013 | Write the API specs (health, admin, GraphQL schema and error handling)         | SandboxE2eTest      | AC-2        | 5 api tests pass                                         |
| T014 | Write the SPA deployment specs (mount, asset base, fallback, GraphQL reach)     | SandboxE2eTest      | AC-4, AC-5  | 5 spa tests pass                                         |
| T015 | Write the prototype index specs (count, links resolve, grouping, filtering)     | SandboxE2eTest      | AC-6, AC-7  | 5 prototype tests pass                                   |
| T016 | Add `scripts/ensure-env.mjs` and wire it into `dev` and `test:e2e`             | root                | REQ-8       | A clone with no `.env` boots the API                     |
| T017 | Add the spec, plan and tasks templates                                        | root                | REQ-7       | `specs/templates/` holds all three                       |
| T018 | Add `scripts/new-spec.mjs` and `scripts/check-specs.mjs`                      | root                | REQ-7, AC-9 | `npm run spec:check` passes on this spec                 |
| T019 | Write this spec, plan and task list as the worked example                     | root                | REQ-9       | `npm run spec:check` reports no errors                   |
| T020 | Write `docs/how-to-spec-drive.md`                                             | root                | REQ-9, AC-11 | A newcomer can run the flow from it                     |
| T021 | Write `docs/manual-repo-setup-guide.md`                                       | root                | REQ-9       | The repo can be rebuilt from scratch by following it     |
| T022 | Add `CLAUDE.md` and the `.claude/commands` slash commands for the flow         | root                | REQ-9       | `/spec-new` and friends are available                    |
| T023 | Add the CI workflow running spec check, lint, build and e2e                    | root                | REQ-1       | The workflow file covers all four steps                  |

## Checklist

- [x] T001 — Root workspace configuration
- [x] T002 — Strapi scaffold
- [x] T003 — GraphQL plugin
- [x] T004 — SPA fallback middleware
- [x] T005 — React SPA scaffold
- [x] T006 — SPA build into `SandboxApi/public/app`
- [x] T007 — API client and backend-status screen
- [x] T008 — Prototype host scaffold
- [x] T009 — Prototype scanner, manifest plugin, multi-page build
- [x] T010 — Grouped, filterable index
- [x] T011 — Sample prototypes and shared CSS
- [x] T012 — Playwright configuration
- [x] T013 — API specs
- [x] T014 — SPA deployment specs
- [x] T015 — Prototype index specs
- [x] T016 — `ensure-env` setup script
- [x] T017 — Spec, plan and tasks templates
- [x] T018 — `spec:new` and `spec:check`
- [x] T019 — This worked example
- [x] T020 — `docs/how-to-spec-drive.md`
- [x] T021 — `docs/manual-repo-setup-guide.md`
- [x] T022 — `CLAUDE.md` and slash commands
- [x] T023 — CI workflow

## Verification

- [x] `npm run lint` — clean
- [x] `npm run build` — SPA, prototype host and Strapi admin all build
- [x] `npm run test:e2e` — 15 passed (5 api, 5 spa, 5 prototype)
- [x] `npm run spec:check` — no errors
- [x] Every acceptance criterion is covered by a named test or a stated check
- [x] Spec status moved to `Shipped`

## Notes

- **The scaffold's `.env` is broken for sqlite.** `create-strapi-app` writes
  `DATABASE_FILENAME=` with no value, and `config/database.js` joins that onto
  the project root — so sqlite is handed a directory and Strapi dies with
  "unable to open database file". `scripts/ensure-env.mjs` repairs the value and
  creates the folder, which sqlite will not do itself. Found by T012 failing to
  boot the API.
- **"Graphic plug-in" was read as the GraphQL plugin.** Strapi publishes no
  plugin under any similar name, and a GraphQL endpoint is what a backend for
  three other projects needs. Recorded as an answered question in the spec.
- **`oxlint`'s `react/set-state-in-effect` fires on the backend probe.** The
  effect is the "synchronizing with an external system" case the rule documents
  as legitimate, and every `setState` in the probe happens after an `await`. The
  effect carries a one-line disable with that reasoning instead of the state
  being restructured around the linter.
- **Playwright's bundled Chromium is not always the one on the machine.**
  `E2E_CHROMIUM_EXECUTABLE` lets a sandbox or CI image point at its own binary
  rather than pinning the Playwright version to whatever the image ships.
- **React 18 (Strapi admin) and React 19 (the SPA) coexist.** npm nests one of
  them; the Strapi admin build was verified after a full workspace install
  rather than assumed to work.
