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
- Give the page one `<h1>` matching the `<title>`. If the design has no room
  for a visible heading, use `class="visually-hidden"` —
  `tests/prototype/index.spec.js` checks this, and screen readers need it.
- Link back with `<a class="prototype-back" href="/">← All prototypes</a>`.
- Pull in the shared chrome with
  `<link rel="stylesheet" href="/prototype.css" />`.
- Use kebab-case filenames, and add a suffix when you iterate
  (`checkout-flow-v2.html`) so earlier versions stay comparable.

## Using a CSS framework

Bootstrap 5.3.3 is vendored under `public/vendor/` so a prototype can use it
without a network round trip:

```html
<link href="/vendor/bootstrap-5.3.3/bootstrap.min.css" rel="stylesheet" />
<script src="/vendor/bootstrap-5.3.3/bootstrap.bundle.min.js"></script>
```

It is served locally rather than from a CDN on purpose: CI and sandboxed
environments have no guaranteed outbound access, and a prototype that only
renders on a good network is not much use in a review. `proto-marketplace.html`
is the worked example.

Phaser 4.2.1 is vendored the same way, for prototypes that need a game loop or
a canvas renderer:

```html
<script src="/vendor/phaser-4.2.1/phaser.min.js"></script>
```

If a prototype is asked for with CDN links, keep them — but fall back to the
vendored copy so the page still renders offline and in CI.
`my-city-building-game-proto.html` shows both halves of that pattern.

A framework-styled page owns its whole layout, so skip `/prototype.css` when
you use one — its body padding and colour tokens fight Bootstrap's reboot. Keep
the back link.

Each file is built as its own page, so `prototypes/foo/bar.html` is served at
`/prototypes/foo/bar.html` in both `npm run dev` and the production build.
