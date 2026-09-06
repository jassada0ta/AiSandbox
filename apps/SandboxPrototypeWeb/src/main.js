import prototypes from 'virtual:prototype-manifest'
import './style.css'

const app = document.querySelector('#app')

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  )

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const groupLabel = (group) => (group === '' ? 'Ungrouped' : group)

function groupPrototypes(items) {
  const groups = new Map()

  for (const item of items) {
    const key = groupLabel(item.group)

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push(item)
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === 'Ungrouped') return -1
    if (b === 'Ungrouped') return 1
    return a.localeCompare(b)
  })
}

function renderCard(item) {
  return `
    <li class="prototype" data-testid="prototype-item">
      <a class="prototype__link" href="${escapeHtml(item.url)}" data-testid="prototype-link">
        ${escapeHtml(item.title)}
      </a>
      ${item.description ? `<p class="prototype__description">${escapeHtml(item.description)}</p>` : ''}
      <p class="prototype__meta">
        <code>${escapeHtml(item.file)}</code>
        <span aria-hidden="true">·</span>
        <span>updated ${escapeHtml(formatDate(item.updatedAt))}</span>
      </p>
    </li>
  `
}

function renderList(items) {
  if (items.length === 0) {
    return `<p class="empty" data-testid="prototype-empty">No prototypes match.</p>`
  }

  return groupPrototypes(items)
    .map(
      ([group, groupItems]) => `
        <section class="group" data-testid="prototype-group" data-group="${escapeHtml(group)}">
          <h2 class="group__title">${escapeHtml(group)}</h2>
          <ul class="prototypes">${groupItems.map(renderCard).join('')}</ul>
        </section>
      `,
    )
    .join('')
}

app.innerHTML = `
  <main class="shell">
    <header class="shell__header">
      <p class="eyebrow">AiSandbox</p>
      <h1 data-testid="app-title">SandboxPrototypeWeb</h1>
      <p class="lede">
        Every <code>.html</code> file under <code>prototypes/</code> is listed here
        automatically. Drop a new file in and it shows up.
      </p>
      <p class="count">
        <strong data-testid="prototype-count">${prototypes.length}</strong>
        prototype${prototypes.length === 1 ? '' : 's'}
      </p>
      <input
        type="search"
        id="filter"
        class="filter"
        placeholder="Filter by name, path or description…"
        aria-label="Filter prototypes"
        data-testid="prototype-filter"
      />
    </header>
    <div id="results">${renderList(prototypes)}</div>
  </main>
`

const results = document.querySelector('#results')

document.querySelector('#filter').addEventListener('input', (event) => {
  const term = event.target.value.trim().toLowerCase()

  const matches = term
    ? prototypes.filter((item) =>
        [item.title, item.file, item.description, item.group]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
    : prototypes

  results.innerHTML = renderList(matches)
})
