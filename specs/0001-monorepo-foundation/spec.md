# Spec: Monorepo foundation

| Field   | Value                                                          |
| ------- | -------------------------------------------------------------- |
| ID      | `0001-monorepo-foundation`                                     |
| Status  | Shipped                                                        |
| Owner   | jassada                                                        |
| Apps    | SandboxApi, SandboxSpaApp, SandboxPrototypeWeb, SandboxE2eTest  |
| Created | 2026-09-06                                                     |
| Updated | 2026-09-06                                                     |

## 1. Problem

The four AiSandbox projects — a Strapi backend, a React SPA, a prototype host
and an e2e suite — had no shared home. Without one, each project would carry
its own toolchain, the SPA's deployment target inside Strapi would be tribal
knowledge, and there would be no single command that proves the pieces still
fit together.

## 2. Outcome

One repository holds all four projects. A fresh clone reaches a running,
end-to-end-tested system with `npm install`, `npm run build` and
`npm run test:e2e`. Features are added through the spec-driven flow described
in `docs/how-to-spec-drive.md`.

## 3. Users and scenarios

### Scenario 1: A developer clones the repo

- **Given** a machine with Node 20+ and nothing else set up
- **When** they run `npm install` then `npm run dev`
- **Then** the Strapi API, the SPA and the prototype host all start, with the
  Strapi `.env` generated for them

### Scenario 2: A developer deploys the SPA

- **Given** a change to SandboxSpaApp
- **When** they run `npm run build`
- **Then** the SPA is written to `apps/SandboxApi/public/app` and Strapi serves
  it at `/app`, including on a hard refresh of a client-side route

### Scenario 3: A designer adds a prototype

- **Given** a new `.html` file dropped into
  `apps/SandboxPrototypeWeb/prototypes/`
- **When** they open the prototype host's entry page
- **Then** the new file is listed and links to a working page, with no config
  file edited and no link added by hand

### Scenario 4: A developer starts a feature

- **Given** a feature idea
- **When** they run `npm run spec:new -- "Feature name"`
- **Then** they get a spec, plan and tasks file to fill in, and
  `npm run spec:check` tells them what is still missing

## 4. Requirements

| ID     | Requirement                                                                                                         | Priority |
| ------ | ------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-1  | The repo MUST hold all four projects under one dependency install, with one script per project for dev and build.     | Must     |
| REQ-2  | SandboxApi MUST be a JavaScript Strapi 5 application exposing REST and a GraphQL endpoint at `/graphql`.              | Must     |
| REQ-3  | SandboxSpaApp MUST be a React + Vite JavaScript app whose build output lands in `SandboxApi/public/app`.              | Must     |
| REQ-4  | SandboxApi MUST serve that build at `/app`, including client-side routes on a direct request.                         | Must     |
| REQ-5  | SandboxPrototypeWeb MUST list every `.html` file under `prototypes/` on its entry page, with no manual registration.  | Must     |
| REQ-6  | SandboxE2eTest MUST be a Playwright project covering the API, the deployed SPA and the prototype entry page.           | Must     |
| REQ-7  | The repo MUST provide spec, plan and task templates plus a checker that gates a spec against its status.               | Must     |
| REQ-8  | A fresh clone SHOULD reach a running API without hand-editing environment files.                                       | Should   |
| REQ-9  | The flow SHOULD be documented well enough for a newcomer to follow it unaided.                                         | Should   |

## 5. Acceptance criteria

| ID    | Proves | Check                                                                                        |
| ----- | ------ | -------------------------------------------------------------------------------------------- |
| AC-1  | REQ-1  | `npm install` at the root installs all four projects; `npm run build` builds all three apps.  |
| AC-2  | REQ-2  | `POST /graphql` with an introspection query returns a schema whose root query type is `Query`. |
| AC-3  | REQ-3  | `npm run build:spa` writes `index.html` and hashed assets into `SandboxApi/public/app`.        |
| AC-4  | REQ-4  | `GET /app/` renders the SPA and every JS/CSS request it makes sits under `/app/`.              |
| AC-5  | REQ-4  | `GET /app/some/client-side/route` returns 200 and renders the SPA shell.                       |
| AC-6  | REQ-5  | The entry page's prototype count equals the number of rendered links, and each link returns 200. |
| AC-7  | REQ-5  | A prototype in a subfolder appears under a group heading named after that folder.               |
| AC-8  | REQ-6  | `npm run test:e2e` runs the `api`, `spa` and `prototype` projects and passes.                   |
| AC-9  | REQ-7  | `npm run spec:new` scaffolds a spec folder and `npm run spec:check` exits non-zero on a gap.    |
| AC-10 | REQ-8  | `npm run setup` creates a valid `apps/SandboxApi/.env` and the sqlite folder on a clean clone.  |
| AC-11 | REQ-9  | `docs/how-to-spec-drive.md` covers every stage of the flow with the commands to run.            |

## 6. Out of scope

- Authentication, authorisation and content modelling beyond the Strapi defaults
- Deployment to any hosted environment (only the local build and run are covered)
- A shared UI component library between SandboxSpaApp and SandboxPrototypeWeb
- Client-side routing inside SandboxSpaApp; the SPA fallback exists for it, but
  no router is installed yet
- Any database other than sqlite

## 7. Open questions

| Question                                                       | Owner   | Needed by | Answer                                                                                                       |
| -------------------------------------------------------------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| Which package manager should the workspace use?                 | jassada | plan      | npm workspaces — already present with Node, and Strapi's admin build works under it.                          |
| Does "graphic plug-in" mean the GraphQL plugin?                 | jassada | plan      | Yes — `@strapi/plugin-graphql`. Strapi ships no plugin by that other name.                                     |
| Should prototype pages be listed by hand or discovered?         | jassada | plan      | Discovered by scanning `prototypes/`, so adding a file is the whole task.                                      |
| Does the e2e suite test the built SPA or the Vite dev server?   | jassada | plan      | The built SPA served by Strapi, since that is the deployment target the spec cares about.                       |

## 8. Data and contracts

**Repository layout**

```
apps/SandboxApi           Strapi 5, JavaScript, sqlite by default
apps/SandboxSpaApp        React 19 + Vite, base /app/, builds into SandboxApi/public/app
apps/SandboxPrototypeWeb  Vite vanilla, one build entry per prototype HTML file
apps/SandboxE2eTest       Playwright, projects: api | spa | prototype
docs/                     How-to guides
specs/                    One folder per feature, plus templates/
scripts/                  setup and spec tooling
```

**HTTP surface of SandboxApi (port 1337)**

| Path       | Serves                                       |
| ---------- | -------------------------------------------- |
| `/api/*`   | Strapi REST                                   |
| `/graphql` | GraphQL (queries, mutations, introspection)   |
| `/admin`   | Strapi admin panel                            |
| `/app/*`   | SandboxSpaApp, with index.html fallback       |
| `/uploads` | Media library files                           |
| `/_health` | 204 when up                                   |

**Prototype manifest entry** — what the entry page renders per file:

```js
{
  id: 'prototypes/examples/api-fetch',
  file: 'prototypes/examples/api-fetch.html',
  url: '/prototypes/examples/api-fetch.html',
  group: 'examples',        // subfolder, '' for top level
  title: '…',               // <title>, else first <h1>, else filename
  description: '…',         // <meta name="description">
  updatedAt: '2026-09-06T…' // file mtime
}
```
