# SandboxE2eTest

Playwright end-to-end tests across the other three projects.

The suite runs against the **deployed** shape of the system, not the dev
servers: Strapi serving the built SPA, and `vite preview` serving the built
prototype host. That is deliberate — testing dev servers would leave the `/app`
deployment contract, the thing most likely to break, unproven.

## Running

From the repo root:

```bash
npm run e2e:install   # once, to download Chromium
npm run test:e2e      # builds everything first, then runs all 15 tests
npm run test:e2e:ui   # Playwright UI mode
```

Playwright starts and stops both servers itself. To narrow the loop:

```bash
npm run test --workspace apps/SandboxE2eTest -- --project=api
npm run test --workspace apps/SandboxE2eTest -- --project=spa
npm run test --workspace apps/SandboxE2eTest -- --project=prototype
npm run test --workspace apps/SandboxE2eTest -- --headed --debug
npm run report --workspace apps/SandboxE2eTest
```

Note that `npm run test` in this workspace skips the root's `pretest:e2e`
build — run it after `npm run build` if you changed the apps.

## Projects

| Project     | Base URL                | Tests                                                                |
| ----------- | ----------------------- | -------------------------------------------------------------------- |
| `api`       | `http://localhost:1337` | Health, admin panel, GraphQL schema and error handling — no browser  |
| `spa`       | `http://localhost:1337` | SandboxSpaApp at `/app`: mount, asset base path, route fallback, GraphQL reach |
| `prototype` | `http://localhost:4174` | The prototype index: count, links resolve, grouping, filtering       |

`spa` points at the API base URL because that is where the SPA is served from.
`api` uses Playwright's `request` fixture and needs no browser at all.

## Writing tests

- Target `data-testid` hooks, and assert state from `data-*` attributes rather
  than display text.
- Keep assertions valid against a **stock** Strapi install. Nothing here needs
  seeded content, which is why the suite has no fixtures. If you need content,
  create it in the test and clean it up.
- New spec files go in `tests/api/`, `tests/spa/` or `tests/prototype/` — the
  folder is what assigns the Playwright project.

## Environment

| Variable                   | Default                 | For                                                  |
| -------------------------- | ----------------------- | ---------------------------------------------------- |
| `E2E_API_BASE_URL`         | `http://localhost:1337` | Testing an API on another host or port               |
| `E2E_PROTOTYPE_BASE_URL`   | `http://localhost:4174` | Same, for the prototype host                         |
| `E2E_CHROMIUM_EXECUTABLE`  | unset                   | Use a Chromium the machine already provides          |
| `CI`                       | unset                   | Adds retries, one worker, and disables server reuse  |

`E2E_CHROMIUM_EXECUTABLE` exists for CI images and sandboxes that ship a
Chromium other than the build `playwright install` would fetch. Leave it unset
and everything behaves normally.
