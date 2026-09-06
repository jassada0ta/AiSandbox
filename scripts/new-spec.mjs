#!/usr/bin/env node
/**
 * Scaffolds a new spec folder from the templates in `specs/templates`.
 *
 *   npm run spec:new -- "Article publishing"
 *   npm run spec:new -- "Article publishing" --apps SandboxApi,SandboxSpaApp
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const specsDir = path.join(repoRoot, 'specs')
const templatesDir = path.join(specsDir, 'templates')
const TEMPLATES = ['spec.md', 'plan.md', 'tasks.md']

function parseArgs(argv) {
  const positional = []
  const flags = {}

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1] ?? ''
      i += 1
    } else {
      positional.push(argv[i])
    }
  }

  return { name: positional.join(' ').trim(), flags }
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function nextId() {
  const existing = fs
    .readdirSync(specsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}-/.test(entry.name))
    .map((entry) => Number(entry.name.slice(0, 4)))

  const highest = existing.length > 0 ? Math.max(...existing) : 0

  return String(highest + 1).padStart(4, '0')
}

const { name, flags } = parseArgs(process.argv.slice(2))

if (!name) {
  console.error('Usage: npm run spec:new -- "Feature name" [--apps SandboxApi,SandboxSpaApp]')
  process.exit(1)
}

const slug = slugify(name)

if (!slug) {
  console.error(`Cannot derive a folder name from "${name}".`)
  process.exit(1)
}

const id = `${nextId()}-${slug}`
const targetDir = path.join(specsDir, id)

if (fs.existsSync(targetDir)) {
  console.error(`${path.relative(repoRoot, targetDir)} already exists.`)
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)
const owner = flags.owner || process.env.USER || process.env.USERNAME || '<name>'
const apps = flags.apps ? flags.apps.split(',').map((a) => a.trim()).join(', ') : null

fs.mkdirSync(targetDir, { recursive: true })

for (const template of TEMPLATES) {
  let contents = fs.readFileSync(path.join(templatesDir, template), 'utf8')

  contents = contents
    .replace(/<FEATURE NAME>/g, name)
    .replace(/`<NNNN-feature-slug>`/g, `\`${id}\``)
    .replace(/<YYYY-MM-DD>/g, today)
    .replace(/<name>/g, owner)

  if (apps) {
    contents = contents.replace(
      /<SandboxApi \/ SandboxSpaApp \/ SandboxPrototypeWeb>/,
      apps,
    )
  }

  fs.writeFileSync(path.join(targetDir, template), contents)
}

const relative = path.relative(repoRoot, targetDir)

console.log(`Created ${relative}/`)
for (const template of TEMPLATES) {
  console.log(`  ${relative}/${template}`)
}
console.log('\nNext: fill in spec.md, then run `npm run spec:check`.')
