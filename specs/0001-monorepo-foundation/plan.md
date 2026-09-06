# Plan: Monorepo foundation

| Field   | Value        |
| ------- | ------------ |
| Spec    | `./spec.md`  |
| Status  | Shipped      |
| Updated | 2026-09-06   |

## 1. Approach

Use **npm workspaces** with every project under `apps/`. npm ships with Node,
so a clone needs no extra tooling, and Strapi's admin build works under npm's
hoisting (verified — see task T009). The root `package.json` owns the
cross-project scripts; each workspace keeps its own dev and build scripts so it
can still be run on its own.

The deployment coupling between the SPA and the API is expressed entirely in the
SPA's Vite config: `base: '/app/'` plus `build.outDir` pointing at
`../SandboxApi/public/app`. Nothing in Strapi has to know the SPA exists beyond
one middleware, and nothing in the SPA has to know how Strapi serves it. Strapi's
`strapi::public` middleware can only serve files that exist, so a small
`global::spa-fallback` middleware rewrites extension-less GETs under `/app` to
`/app/index.html`, which makes hard refreshes on client-side routes work
(REQ-4).

The prototype host discovers pages instead of registering them. One module scans
`prototypes/**/*.html` and is used twice: at config time to build
`rollupOptions.input`, so each file becomes its own page, and through a virtual
module (`virtual:prototype-manifest`) that the entry page imports to render the
links (REQ-5). Metadata comes out of each file's own `<title>` and
`<meta name="description">`, so a prototype stays a single self-contained file.

The e2e suite runs against the built, deployed shape rather than dev servers:
Playwright's `webServer` boots `strapi start` (which serves the SPA) and
`vite preview` for the prototype host, and three Playwright projects split the
tests by target (REQ-6).

The spec flow is plain Markdown plus two small Node scripts — no framework, no
new dependency. `scripts/check-specs.mjs` tightens its checks as a spec's status
advances, so a Draft is not punished for being incomplete while a Shipped spec
cannot have unanswered questions or unticked tasks (REQ-7).

## 2. Alternatives considered

| Option                                            | Why not                                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| pnpm or Yarn workspaces                           | Better hoisting, but needs a separate install step before the repo works. npm's hoisting proved sufficient. |
| Nx or Turborepo                                   | Task graph and caching are not worth the config surface for four projects.                                  |
| Keep projects at the repo root, no `apps/` folder | Root would mix project folders with `docs/`, `specs/` and `scripts/`.                                       |
| Copy the SPA build into `public/app` with a script | An extra moving part that can be skipped. Vite writing there directly cannot be forgotten.                 |
| Serve the SPA from a separate web server           | The spec asks for it inside Strapi's `public/app`.                                                          |
| List prototypes in a JSON index file               | Every new prototype becomes two edits, and the index drifts.                                                |
| `import.meta.glob` for the prototype list          | Resolves at module load in the entry page, but the build still needs the file list for its inputs. One scanner used by both is simpler. |
| Run e2e against the Vite dev servers               | Faster, but would not prove the `/app` deployment contract, which is the point of REQ-4.                    |
| GitHub's spec-kit / a spec framework               | Heavier than the flow needs; Markdown plus two scripts is auditable and has no upgrade path to maintain.     |

## 3. Changes by app

### SandboxApi (Strapi, JavaScript)

- Scaffolded with `create-strapi-app@5 --js`, sqlite, no example content.
- `@strapi/plugin-graphql` added and configured in `config/plugins.js`
  (endpoint `/graphql`, shadow CRUD on, depth limit 10, playground and
  introspection behind env vars) — REQ-2.
- `src/middlewares/spa-fallback.js` added and registered in
  `config/middlewares.js` directly above `strapi::public` — REQ-4.
- `.env.example` rewritten to document the sqlite and GraphQL variables.
- Content types: none. This spec is the foundation only.
- Permissions: unchanged Strapi defaults.

### SandboxSpaApp (React + Vite)

- Scaffolded with `create-vite --template react`.
- `vite.config.js`: `base: '/app/'`, `build.outDir` →
  `../SandboxApi/public/app`, `emptyOutDir: true`, and a dev proxy sending
  `/api`, `/graphql` and `/uploads` to port 1337 so request paths match
  production — REQ-3.
- `src/api/client.js`: REST and GraphQL helpers over `fetch`, with
  `VITE_API_BASE_URL` empty by default so URLs stay relative.
- `src/App.jsx`: replaced the Vite demo with a page that probes `/graphql` and
  reports whether the backend is reachable — a real target for the e2e suite.
- `data-testid` hooks: `app-title`, `backend-status` (plus a `data-status`
  attribute), `backend-detail`, `retry-backend`.

### SandboxPrototypeWeb (Vite vanilla)

- Scaffolded with `create-vite --template vanilla`.
- `prototypes.js`: scans `prototypes/**/*.html` and reads title, description
  and group from each file.
- `vite-plugin-prototype-manifest.js`: serves that list as
  `virtual:prototype-manifest` and full-reloads dev when a file is added or
  removed.
- `vite.config.js`: one `rollupOptions.input` entry per prototype file.
- `src/main.js`: renders the grouped, filterable index — REQ-5.
- `public/prototype.css`: shared chrome so a prototype file stays short.
- Prototype pages added: `prototypes/welcome.html` and
  `prototypes/examples/api-fetch.html` (the second one also proves grouping).
- `prototypes/README.md`: the conventions for adding a page.

### SandboxE2eTest (Playwright)

- `playwright.config.js`: two `webServer` entries (`strapi start`,
  `vite preview`) and three projects — `api`, `spa`, `prototype` — split by
  `testMatch`. `E2E_CHROMIUM_EXECUTABLE` overrides the browser binary for
  sandboxes that ship their own Chromium.
- `tests/api/health.spec.js`, `tests/api/graphql.spec.js`,
  `tests/spa/deployment.spec.js`, `tests/prototype/index.spec.js` — REQ-6.
- Fixtures: none. Every assertion holds against a stock Strapi install, so the
  suite needs no seeded content.

### Root and tooling

- `package.json`: workspaces plus `dev`, `build`, `test:e2e`, `lint`, `setup`,
  `spec:new`, `spec:check`. `pretest:e2e` builds first so the suite always runs
  against fresh output — REQ-1.
- `scripts/ensure-env.mjs`: generates `apps/SandboxApi/.env`, repairs the empty
  `DATABASE_FILENAME` the scaffold writes, and creates the sqlite folder — REQ-8.
- `scripts/new-spec.mjs`, `scripts/check-specs.mjs`, `specs/templates/` — REQ-7.
- `docs/how-to-spec-drive.md`, `docs/manual-repo-setup-guide.md`, `CLAUDE.md`,
  `.claude/commands/` — REQ-9.
- `.github/workflows/ci.yml`: spec check, lint, build, e2e.

## 4. Requirement coverage

| Requirement | Where it is built                                              | Where it is proven                                                        |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| REQ-1       | `package.json` workspaces and scripts                           | `.github/workflows/ci.yml` runs `npm ci` then `npm run build`              |
| REQ-2       | `apps/SandboxApi/config/plugins.js`                             | `tests/api/graphql.spec.js` — all three tests                              |
| REQ-3       | `apps/SandboxSpaApp/vite.config.js`                             | `tests/spa/deployment.spec.js` — "loads its assets from the /app base path" |
| REQ-4       | `apps/SandboxApi/src/middlewares/spa-fallback.js`               | `tests/spa/deployment.spec.js` — "falls back to index.html…"                |
| REQ-5       | `apps/SandboxPrototypeWeb/prototypes.js` + the manifest plugin  | `tests/prototype/index.spec.js` — all five tests                            |
| REQ-6       | `apps/SandboxE2eTest/playwright.config.js`                      | `npm run test:e2e` reports 15 passing tests across three projects          |
| REQ-7       | `scripts/check-specs.mjs`, `specs/templates/`                   | `npm run spec:check` passes on this spec                                   |
| REQ-8       | `scripts/ensure-env.mjs`                                        | `tests/api/health.spec.js` — the API only boots if setup worked            |
| REQ-9       | `docs/how-to-spec-drive.md`                                     | Reviewed by hand; this spec is its worked example                          |

## 5. Risks

| Risk                                                                     | Mitigation                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| npm hoisting breaks Strapi's admin build (React 18 vs the SPA's React 19) | Verified `npm run build:api` end to end after installing all workspaces; CI builds it every run.   |
| `emptyOutDir` points outside the SPA package and could delete real files  | It targets a build-only folder that is git-ignored; nothing else is ever written there.            |
| The e2e suite is slow because it builds everything first                   | Acceptable at this size; per-project scripts (`test:api`, `test:spa`) exist for a tight loop.      |
| `spec:check` becomes a box-ticking exercise                                | It only checks structure. Review still decides whether requirements are the right ones.            |
| Prototype filenames collide with the entry page's routes                    | Prototypes live under `/prototypes/`; the entry page owns `/` only.                                |

## 6. Rollout

1. `npm install` at the repo root.
2. `npm run setup` — writes `apps/SandboxApi/.env` with generated secrets and
   creates `apps/SandboxApi/.tmp/`. Safe to re-run; it never overwrites secrets.
3. `npm run build` — SPA into `SandboxApi/public/app`, then the prototype host,
   then the Strapi admin panel. This order matters: the SPA must be built before
   anything serves `/app`.
4. `npm run start` — Strapi on 1337, serving the API, the admin panel and `/app`.
5. First run only: open `http://localhost:1337/admin` and create the admin user.
6. `npm run test:e2e` to confirm the whole chain.

Nothing needs to be done by hand beyond step 5. No Strapi permissions have to be
flipped, because no test depends on public content access.
