# SandboxPrototypeWeb

A home for prototype HTML pages. Vite, vanilla JavaScript. The entry page lists
every prototype it finds, so adding one is a single file and nothing else.

Run it from the repo root:

```bash
npm run dev:proto     # http://localhost:5174
npm run build:proto   # dist/, one page per prototype
```

## Adding a prototype

Drop an `.html` file into `prototypes/`. That is the whole task — no config to
edit, no link to add.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="What this prototype explores." />
    <link rel="stylesheet" href="/prototype.css" />
    <title>Checkout flow v1</title>
  </head>
  <body>
    <div class="prototype-shell">
      <a class="prototype-back" href="/">&larr; All prototypes</a>
      <h1>Checkout flow v1</h1>
    </div>
  </body>
</html>
```

Conventions and what the index reads from each file:
[`prototypes/README.md`](prototypes/README.md).

## How the index works

`prototypes.js` scans `prototypes/**/*.html` and reads each file's title,
description and folder. That one scan feeds two things:

- **`rollupOptions.input`** in `vite.config.js`, so every prototype is its own
  build entry and `prototypes/foo.html` is served at `/prototypes/foo.html` in
  both dev and the build.
- **`virtual:prototype-manifest`**, a virtual module from
  `vite-plugin-prototype-manifest.js` that `src/main.js` imports to render the
  links. The plugin watches the folder, so adding a file refreshes the list
  without restarting the dev server.

The entry page groups by subfolder, shows a count, and filters as you type.

## Layout

```
prototypes/           the pages; subfolders become groups on the index
public/prototype.css  shared chrome, linked directly by prototype files
src/main.js           renders the index from the manifest
src/style.css         styling for the index only
prototypes.js         the scanner
vite-plugin-prototype-manifest.js
```

`public/prototype.css` lives in `public/` so a prototype can pull it in with a
plain `<link>` and stay a self-contained, copy-pasteable file.

## Testing

`apps/SandboxE2eTest/tests/prototype/index.spec.js` asserts that the count
matches the rendered links, that every link resolves to a real page, that
subfolders group, and that filtering works. So a prototype that is listed but
not built fails the suite.
