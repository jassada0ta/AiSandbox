import fs from 'node:fs'
import path from 'node:path'

export const PROTOTYPES_DIR = 'prototypes'

const readTag = (html, pattern) => {
  const match = html.match(pattern)
  return match ? match[1].trim().replace(/\s+/g, ' ') : ''
}

const toTitleCase = (slug) =>
  slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')

function describe(rootDir, absolutePath) {
  const relativePath = path.relative(rootDir, absolutePath).split(path.sep).join('/')
  const html = fs.readFileSync(absolutePath, 'utf8')
  const slug = path.basename(absolutePath, '.html')
  const group = path
    .relative(path.join(rootDir, PROTOTYPES_DIR), path.dirname(absolutePath))
    .split(path.sep)
    .join('/')

  return {
    // Rollup input key; also the output path minus the extension.
    id: relativePath.replace(/\.html$/, ''),
    file: relativePath,
    url: `/${relativePath}`,
    group: group || '',
    title:
      readTag(html, /<title>([\s\S]*?)<\/title>/i) ||
      readTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      toTitleCase(slug),
    description: readTag(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    updatedAt: fs.statSync(absolutePath).mtime.toISOString(),
  }
}

/**
 * Every `*.html` file under `prototypes/`, sorted by path. Nested folders
 * become groups on the entry page.
 */
export function listPrototypes(rootDir) {
  const baseDir = path.join(rootDir, PROTOTYPES_DIR)

  if (!fs.existsSync(baseDir)) {
    return []
  }

  const found = []

  const walk = (currentDir) => {
    const entries = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        walk(absolutePath)
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        found.push(describe(rootDir, absolutePath))
      }
    }
  }

  walk(baseDir)

  return found.sort((a, b) => a.file.localeCompare(b.file))
}
