# SandboxApi

The Strapi 5 backend for AiSandbox. JavaScript, sqlite by default, with the
GraphQL plugin enabled. It also serves SandboxSpaApp.

Run it from the repo root:

```bash
npm run setup      # generates .env with fresh secrets (safe to re-run)
npm run dev:api    # strapi develop, with the admin panel rebuilt on change
npm run build:api  # builds the admin panel
npm run start      # strapi start — also serves the built SPA at /app
```

On first run, open <http://localhost:1337/admin> and create the admin user.

## What it serves

| Path       | Serves                                                      |
| ---------- | ----------------------------------------------------------- |
| `/api/*`   | REST                                                        |
| `/graphql` | GraphQL — queries, mutations, introspection, playground in dev |
| `/admin`   | Admin panel                                                 |
| `/app/*`   | SandboxSpaApp, built into `public/app`                      |
| `/uploads` | Media library files                                         |
| `/_health` | 204 when up                                                 |

## GraphQL

`@strapi/plugin-graphql`, configured in `config/plugins.js`. `shadowCRUD` is on,
so every content type you add in the admin gets queries and mutations with no
resolver written. Depth and amount limits bound how far a single query can
traverse relations.

```bash
curl -s http://localhost:1337/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

The playground is on in development. To expose it elsewhere, set
`GRAPHQL_PLAYGROUND_ALWAYS=true` — deliberately.

## Serving the SPA

SandboxSpaApp's Vite build writes into `public/app`, which Strapi serves
statically at `/app`. `src/middlewares/spa-fallback.js` rewrites extension-less
GETs under `/app` to `/app/index.html`, so a client-side route survives a hard
refresh.

It is registered in `config/middlewares.js` **directly above**
`strapi::public`. That order is load-bearing: the middleware rewrites
`ctx.path` and the static server, running next, serves whatever it is handed.

`public/app/` is build output and git-ignored. Never commit it.

## Environment

`.env` is git-ignored and holds real secrets; `.env.example` is the committed
documentation. `npm run setup` generates `.env`, fills the secrets with random
values, and creates the `.tmp/` folder sqlite needs.

> The Strapi scaffold writes `DATABASE_FILENAME=` with no value, which points
> sqlite at a directory and fails the boot with "unable to open database file".
> `npm run setup` repairs that. Run it if the API will not start.

To use Postgres or MySQL instead, set `DATABASE_CLIENT` and the matching
`DATABASE_*` variables — see `config/database.js`.

## Adding a content type

Use the Content-Type Builder in the admin panel during development; it writes
the schema files into `src/api/`. Commit those. Then set the public role's
permissions in Settings → Users & Permissions if the SPA needs to read it
without authenticating.

Before adding one, write the spec: see
[`docs/how-to-spec-drive.md`](../../docs/how-to-spec-drive.md).
