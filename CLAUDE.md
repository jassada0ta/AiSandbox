# AiSandbox

npm-workspaces monorepo holding four projects, developed with a spec-driven
flow. **Read `docs/how-to-spec-drive.md` before starting a feature.**

## Projects

| Path                       | What it is                                     | Language                |
| -------------------------- | ---------------------------------------------- | ----------------------- |
| `apps/SandboxApi`          | Strapi 5 backend — REST, GraphQL, admin panel  | JavaScript (no TS)      |
| `apps/SandboxSpaApp`       | React + Vite SPA, deployed to `/app`           | JavaScript + JSX        |
| `apps/SandboxPrototypeWeb` | Vite vanilla host for prototype HTML pages     | JavaScript              |
| `apps/SandboxE2eTest`      | Playwright end-to-end suite                    | JavaScript              |

**JavaScript everywhere.** No project uses TypeScript, and none should start.

## Commands

```bash
npm install                # installs all four workspaces
npm run setup              # generates apps/SandboxApi/.env (safe to re-run)
npm run dev                # all three apps: api :1337, spa :5173, proto :5174
npm run build              # SPA → SandboxApi/public/app, then proto, then Strapi
npm run start              # Strapi, serving the API and the built SPA at /app
npm run lint
npm run test:e2e           # builds first, then all Playwright projects
npm run spec:new -- "Feature name"
npm run spec:check
```

Workspaces are addressed by path, not name: `npm run build --workspace apps/SandboxApi`.

Narrow the e2e loop with `npm run test --workspace apps/SandboxE2eTest -- --project=api`
(or `spa`, `prototype`).

## How the pieces connect

- **SandboxSpaApp builds into SandboxApi.** Its Vite config sets
  `base: '/app/'` and `outDir` to `../SandboxApi/public/app`. Strapi serves that
  folder at `/app`; `src/middlewares/spa-fallback.js` (registered directly above
  `strapi::public`) rewrites extension-less GETs to `index.html` so client-side
  routes survive a refresh. Changing either side without the other breaks the
  deployment — `tests/spa/deployment.spec.js` is what catches it.
- **API calls use relative URLs.** In production the SPA shares Strapi's origin;
  in dev its Vite proxy forwards `/api`, `/graphql` and `/uploads` to port 1337.
  So no code path differs between dev and production, and
  `VITE_API_BASE_URL` stays empty.
- **Prototypes are discovered, not registered.** Any `.html` file under
  `apps/SandboxPrototypeWeb/prototypes/` is picked up by `prototypes.js`, which
  feeds both `rollupOptions.input` and the `virtual:prototype-manifest` module
  the entry page renders. Never add a link to the entry page by hand.
- **The e2e suite tests the built system**, not the dev servers: `strapi start`
  serving the built SPA, and `vite preview` for the prototype host.

## Working on a feature

Follow the five stages in `docs/how-to-spec-drive.md`. Slash commands:
`/spec-new`, `/spec-plan`, `/spec-tasks`, `/spec-build`, `/spec-verify`,
`/spec-status`.

One stage at a time, with a review between each. `specs/0001-monorepo-foundation/`
is the worked example.

Requirement IDs (`REQ-1`, `AC-1`, `T001`) are permanent — retire, never
renumber. Commit messages reference the task: `T004: add SPA fallback middleware`.

Small changes — a typo, a dependency bump, a one-line fix — do not need a spec.
The test: if two reasonable people could implement your one-sentence
description differently, write the spec.

## Conventions

- Give anything a test will target a `data-testid`, and expose state as a
  `data-*` attribute rather than making tests match display text.
- Strapi middleware order in `config/middlewares.js` is load-bearing.
- `.env` files are git-ignored and hold real secrets. `.env.example` is the
  committed documentation; update it when you add a variable.
- Prototype pages are self-contained: `<title>` and
  `<meta name="description">` feed the index, `/prototype.css` provides the
  shared chrome.
- Never commit `apps/SandboxApi/public/app/` — it is build output.

## Gotchas

- **`create-strapi-app` writes `DATABASE_FILENAME=` empty**, which points sqlite
  at a directory and kills the boot with "unable to open database file".
  `scripts/ensure-env.mjs` repairs it and creates `apps/SandboxApi/.tmp/`. Run
  `npm run setup` when the API will not start.
- **React 18 (Strapi admin) and React 19 (SPA) coexist** under npm hoisting. If
  the admin build breaks after a dependency change, re-run `npm install` at the
  root.
- **`E2E_CHROMIUM_EXECUTABLE`** points Playwright at a Chromium the machine
  already provides, for images that do not ship the build `playwright install`
  would fetch.
- **All dev servers use `strictPort`**, so a port clash fails loudly instead of
  drifting to another port and breaking the test base URLs.
