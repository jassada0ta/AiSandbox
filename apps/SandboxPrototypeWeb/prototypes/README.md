# Prototypes

Drop a `.html` file in this folder (or a subfolder) and it appears on the entry
page automatically — no config to edit, no link to add.

How the entry page reads a file:

| Shown on the index | Comes from                                                   |
| ------------------ | ------------------------------------------------------------ |
| Link text          | `<title>`, else the first `<h1>`, else the filename           |
| Description        | `<meta name="description" content="…">`                       |
| Group heading      | The subfolder name (files directly here show as _Ungrouped_)  |
| Updated date       | The file's modification time                                  |

Conventions worth keeping:

- Give every file a `<title>` and a `<meta name="description">`.
- Link back with `<a class="prototype-back" href="/">← All prototypes</a>`.
- Pull in the shared chrome with
  `<link rel="stylesheet" href="/prototype.css" />`.
- Use kebab-case filenames, and add a suffix when you iterate
  (`checkout-flow-v2.html`) so earlier versions stay comparable.

Each file is built as its own page, so `prototypes/foo/bar.html` is served at
`/prototypes/foo/bar.html` in both `npm run dev` and the production build.
