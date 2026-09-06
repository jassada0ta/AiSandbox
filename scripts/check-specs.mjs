#!/usr/bin/env node
/**
 * Gate for the spec-driven flow. Checks that every spec folder is internally
 * consistent, and that the checks tighten as a spec moves through its statuses.
 *
 *   npm run spec:check              # all specs
 *   npm run spec:check -- 0001      # one spec, matched by id prefix or slug
 *
 * Exits non-zero when a spec has errors, so it can run in CI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const specsDir = path.join(repoRoot, 'specs')

// Each status implies everything the earlier ones require.
const STATUSES = ['draft', 'approved', 'in progress', 'shipped']

const filter = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))[0]

const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null)

/**
 * Strips fenced blocks and inline code spans, so HTML mentioned as an example
 * (`<title>`, `<meta …>`) is not mistaken for an unfilled placeholder.
 */
const withoutCode = (text) =>
  text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')

function fieldValue(text, label) {
  const match = text.match(new RegExp(`^\\|\\s*${label}\\s*\\|\\s*([^|]+?)\\s*\\|`, 'mi'))
  if (!match) return null
  // Trim a trailing HTML comment used for inline hints.
  return match[1].replace(/<!--[\s\S]*?-->/g, '').trim()
}

function tableIds(text, prefix, columns = 1) {
  const pattern = new RegExp(
    `^\\|\\s*(${prefix}-\\d+)\\s*\\|${'\\s*([^|]*?)\\s*\\|'.repeat(columns)}`,
    'gmi',
  )

  return [...text.matchAll(pattern)].map((match) => ({
    id: match[1].toUpperCase(),
    cells: match.slice(2).map((cell) => (cell || '').trim()),
  }))
}

/** Template placeholders such as `<what is unclear>` that were never filled in. */
function placeholders(text) {
  const found = withoutCode(text).match(/<[a-z][^<>\n]{2,60}>/g) || []
  return [...new Set(found)]
}

function openQuestions(text) {
  const section = text.split(/^##\s*7\..*$/m)[1]
  if (!section) return []

  return section
    .split('\n')
    .filter((line) => /^\|/.test(line))
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 6)
    .filter((cells) => !/^-+$/.test(cells[1]) && cells[1] && cells[1] !== 'Question')
    .map((cells) => ({ question: cells[1], neededBy: cells[3], answer: cells[4] }))
    .filter((row) => !row.answer)
}

function checkSpec(dirName) {
  const dir = path.join(specsDir, dirName)
  const errors = []
  const warnings = []

  const spec = read(path.join(dir, 'spec.md'))

  if (!spec) {
    return { dirName, errors: ['spec.md is missing'], warnings, status: 'unknown' }
  }

  const plan = read(path.join(dir, 'plan.md'))
  const tasks = read(path.join(dir, 'tasks.md'))

  const rawStatus = fieldValue(spec, 'Status') || ''
  const status = rawStatus.toLowerCase()
  const stage = STATUSES.indexOf(status)

  if (stage === -1) {
    errors.push(
      `Status "${rawStatus || '(missing)'}" is not one of: ${STATUSES.join(', ')}`,
    )
  }

  // --- Always ----------------------------------------------------------------
  const requirements = tableIds(spec, 'REQ', 2)
  const criteria = tableIds(spec, 'AC', 2)

  if (requirements.length === 0) {
    errors.push('No REQ-* rows found in the requirements table')
  }

  const requirementIds = new Set(requirements.map((row) => row.id))

  for (const ac of criteria) {
    const referenced = (ac.cells[0].match(/REQ-\d+/gi) || []).map((id) => id.toUpperCase())

    if (referenced.length === 0) {
      errors.push(`${ac.id} does not say which requirement it proves`)
    }

    for (const id of referenced) {
      if (!requirementIds.has(id)) {
        errors.push(`${ac.id} references ${id}, which is not in the requirements table`)
      }
    }
  }

  const duplicates = requirements
    .map((row) => row.id)
    .filter((id, index, all) => all.indexOf(id) !== index)

  for (const id of new Set(duplicates)) {
    errors.push(`${id} is defined more than once`)
  }

  // --- Approved and beyond ---------------------------------------------------
  if (stage >= STATUSES.indexOf('approved')) {
    if (criteria.length === 0) {
      errors.push('An approved spec needs at least one AC-* acceptance criterion')
    }

    const leftovers = placeholders(spec)
    if (leftovers.length > 0) {
      errors.push(`spec.md still has template placeholders: ${leftovers.join(', ')}`)
    }

    const blocking = openQuestions(spec).filter(
      (row) => !/build|implement/i.test(row.neededBy),
    )
    if (blocking.length > 0) {
      errors.push(
        `Unanswered question needed before planning: "${blocking[0].question}"`,
      )
    }
  }

  // --- In progress and beyond ------------------------------------------------
  if (stage >= STATUSES.indexOf('in progress')) {
    if (!plan) {
      errors.push('plan.md is missing')
    }

    if (!tasks) {
      errors.push('tasks.md is missing')
    }

    if (plan) {
      const musts = requirements.filter((row) => /must/i.test(row.cells[1]))

      for (const must of musts) {
        if (!new RegExp(must.id, 'i').test(plan)) {
          errors.push(`${must.id} is a Must but the plan never covers it`)
        }
      }

      const planLeftovers = placeholders(plan)
      if (planLeftovers.length > 0) {
        warnings.push(`plan.md still has placeholders: ${planLeftovers.join(', ')}`)
      }
    }

    if (tasks && !/^- \[[ x]\]/m.test(tasks)) {
      warnings.push('tasks.md has no checklist items')
    }
  }

  // --- Shipped ---------------------------------------------------------------
  if (status === 'shipped') {
    const unanswered = openQuestions(spec)
    if (unanswered.length > 0) {
      errors.push(`Shipped but question still open: "${unanswered[0].question}"`)
    }

    if (tasks) {
      const unchecked = (tasks.match(/^- \[ \]/gm) || []).length
      if (unchecked > 0) {
        errors.push(`Shipped but ${unchecked} task(s) are still unchecked`)
      }
    }
  }

  return { dirName, status: rawStatus || 'unknown', errors, warnings }
}

if (!fs.existsSync(specsDir)) {
  console.error('No specs/ folder found.')
  process.exit(1)
}

const specDirs = fs
  .readdirSync(specsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{4}-/.test(entry.name))
  .map((entry) => entry.name)
  .filter((name) => !filter || name.startsWith(filter) || name.includes(filter))
  .sort()

if (specDirs.length === 0) {
  console.log(
    filter
      ? `No spec folder matches "${filter}".`
      : 'No specs yet. Create one with `npm run spec:new -- "Feature name"`.',
  )
  process.exit(filter ? 1 : 0)
}

let failed = 0

for (const dirName of specDirs) {
  const result = checkSpec(dirName)
  const symbol = result.errors.length > 0 ? '✗' : '✓'

  console.log(`${symbol} ${dirName} [${result.status}]`)

  for (const error of result.errors) {
    console.log(`    error:   ${error}`)
  }

  for (const warning of result.warnings) {
    console.log(`    warning: ${warning}`)
  }

  if (result.errors.length > 0) {
    failed += 1
  }
}

console.log(
  `\n${specDirs.length} spec(s) checked, ${failed} with errors.`,
)

process.exit(failed > 0 ? 1 : 0)
