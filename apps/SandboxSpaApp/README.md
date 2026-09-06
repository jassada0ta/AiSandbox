# SandboxSpaApp

The AiSandbox single page app. React 19 + Vite, JavaScript. It is served by
SandboxApi from that project's `public/app` folder.

Run it from the repo root:

```bash
npm run dev:spa      # http://localhost:5173/app/
npm run build:spa    # writes into ../SandboxApi/public/app
npm run lint
```

The dev URL includes `/app/` because `base` is set — the same path it has in
production.

## Deployment

There is no deploy step. `vite build` writes straight into
`../SandboxApi/public/app`, and Strapi serves it at `/app`. Three settings in
`vite.config.js` make that work:

| Setting                                      | Why                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `base: '/app/'`                              | Asset URLs resolve when the page is served from `/app`               |
| `build.outDir` → `../SandboxApi/public/app`  | The build *is* the deployment                                        |
| `emptyOutDir: true`                          | Lets Vite clear a folder outside its root, so stale assets go away   |

Strapi's side of the contract is a fallback middleware that serves
`index.html` for client-side routes. Both halves are asserted by
`apps/SandboxE2eTest/tests/spa/deployment.spec.js` — run it after touching
either.

## Talking to the API

`src/api/client.js` wraps `fetch` with `restRequest`, `graphqlRequest` and
`checkGraphqlConnection`.

URLs are **relative**, in both dev and production. In production the SPA shares
Strapi's origin; in dev Vite proxies `/api`, `/graphql` and `/uploads` to port
1337. So no request path differs between the two, and `VITE_API_BASE_URL` stays
empty — set it only when the API lives on another origin.

Copy `.env.example` to `.env.local` to override anything.

## Testing hooks

Anything the e2e suite targets carries a `data-testid`, and state is exposed as
a `data-*` attribute rather than making tests match display text:

| Hook              | On                                                     |
| ----------------- | ------------------------------------------------------ |
| `app-title`       | The page heading                                       |
| `backend-status`  | The status badge; `data-status` is `checking`/`online`/`offline` |
| `backend-detail`  | The status message                                     |
| `retry-backend`   | The re-check button                                    |

Decide these in the plan, so the tests can be written before the UI exists.

## Notes

- No router is installed yet. The Strapi-side fallback already supports one, so
  adding `react-router` needs no server change.
- `oxlint` runs via `npm run lint`. The one disable in `src/App.jsx` is
  explained inline.
