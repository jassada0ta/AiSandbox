# AiSandbox

A monorepo holding four projects, developed with a spec-driven flow.

| Project                                                | What it is                                                                | Stack                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------ |
| [`apps/SandboxApi`](apps/SandboxApi)                   | Strapi 5 backend for everything else — REST, GraphQL, admin panel         | Strapi 5, JavaScript, sqlite |
| [`apps/SandboxSpaApp`](apps/SandboxSpaApp)             | Single page app, deployed into `SandboxApi/public/app` and served at `/app` | React 19 + Vite, JavaScript |
| [`apps/SandboxPrototypeWeb`](apps/SandboxPrototypeWeb) | Host for prototype HTML pages, with a self-updating index                 | Vite vanilla, JavaScript |
| [`apps/SandboxE2eTest`](apps/SandboxE2eTest)           | End-to-end tests across all three                                        | Playwright               |

## Quick start

```bash
npm install          # installs all four projects
npm run setup        # generates apps/SandboxApi/.env
npm run dev          # api :1337, spa :5173, prototypes :5174
```

Open <http://localhost:1337/admin> and create the admin user on first run.

To run the way it deploys — Strapi serving the built SPA:

```bash
npm run build
npm run start        # http://localhost:1337/app/
```

And to prove it all fits together:

```bash
npm run test:e2e     # builds, boots the servers, runs 15 tests
```

Full walkthrough, including building the repo from scratch:
[`docs/manual-repo-setup-guide.md`](docs/manual-repo-setup-guide.md).

## How the pieces fit

```
                    apps/SandboxApi  (Strapi, :1337)
                    ├── /api/*      REST
                    ├── /graphql    GraphQL
                    ├── /admin      admin panel
                    └── /app/*  ◄── apps/SandboxSpaApp builds here
                                    (public/app, base '/app/')

                    apps/SandboxPrototypeWeb  (:5174)
                    └── /           index of every prototypes/*.html

                    apps/SandboxE2eTest
                    └── tests the built system: api | spa | prototype
```

The SPA has no deploy step of its own: `npm run build:spa` writes straight into
`SandboxApi/public/app`, and Strapi serves it from there. The prototype host
needs no registration step: drop an `.html` file into `prototypes/` and it
appears on the entry page.

## Development

```bash
npm run dev              # everything
npm run dev:api          # Strapi only
npm run dev:spa          # SPA only, proxying the API
npm run dev:proto        # prototype host only

npm run lint
npm run build            # SPA → public/app, then prototypes, then Strapi admin
npm run test:e2e         # all Playwright projects
npm run test --workspace apps/SandboxE2eTest -- --project=api
```

Workspaces are addressed by path: `npm run build --workspace apps/SandboxApi`.

## Adding a feature

Features go through five stages — specify, plan, break down, implement, verify
— with the artefacts committed alongside the code:

```bash
npm run spec:new -- "Article publishing"    # scaffolds specs/0002-article-publishing/
npm run spec:check                          # gates each spec against its status
```

Read [`docs/how-to-spec-drive.md`](docs/how-to-spec-drive.md) first.
[`specs/0001-monorepo-foundation/`](specs/0001-monorepo-foundation) is this
repo's own setup written up as a worked example.

Using Claude Code? `/spec-new`, `/spec-plan`, `/spec-tasks`, `/spec-build`,
`/spec-verify` and `/spec-status` map onto the stages, one at a time.

## Adding a prototype

Drop an `.html` file into `apps/SandboxPrototypeWeb/prototypes/`. It appears on
the entry page with its `<title>` as the link text and its
`<meta name="description">` as the blurb; a subfolder becomes a group heading.
See [`prototypes/README.md`](apps/SandboxPrototypeWeb/prototypes/README.md).

## Documentation

| Document                                                             | Covers                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| [`docs/how-to-spec-drive.md`](docs/how-to-spec-drive.md)             | The spec-driven flow, stage by stage                      |
| [`docs/manual-repo-setup-guide.md`](docs/manual-repo-setup-guide.md) | Building the monorepo and every project by hand           |
| [`CLAUDE.md`](CLAUDE.md)                                             | Repo conventions and gotchas, for Claude Code and for you |
| [`specs/README.md`](specs/README.md)                                 | What lives in `specs/`                                    |

## Requirements

Node 20–26 (22 tested) and npm 10+. Everything else installs from the lockfile.
Playwright needs its browser once: `npm run e2e:install`.
