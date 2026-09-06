#!/usr/bin/env node
/**
 * Prepares SandboxApi so it can boot on a fresh clone:
 *
 * 1. Creates `apps/SandboxApi/.env` from `.env.example`, filling the Strapi
 *    secrets with random values. An existing `.env` keeps its secrets.
 * 2. Repairs an empty `DATABASE_FILENAME` — `config/database.js` joins it onto
 *    the project root, so an empty value points sqlite at a directory and
 *    Strapi fails with "unable to open database file".
 * 3. Creates the folder that holds the sqlite file, which sqlite will not do
 *    itself.
 *
 * Run via `npm run setup` at the repo root; `npm run dev` and `npm run test:e2e`
 * call it for you.
 */
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const apiDir = path.join(repoRoot, 'apps', 'SandboxApi')
const envPath = path.join(apiDir, '.env')
const examplePath = path.join(apiDir, '.env.example')

const DEFAULT_SQLITE_FILE = '.tmp/data.db'

const secret = () => randomBytes(16).toString('base64')

const readEnvValue = (contents, key) => {
  const match = contents.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null
}

if (!fs.existsSync(examplePath)) {
  console.error('apps/SandboxApi/.env.example is missing; cannot prepare the API.')
  process.exit(1)
}

let contents

if (fs.existsSync(envPath)) {
  contents = fs.readFileSync(envPath, 'utf8')
  console.log('apps/SandboxApi/.env exists — keeping its secrets.')
} else {
  contents = fs
    .readFileSync(examplePath, 'utf8')
    .replace(/^APP_KEYS=.*$/m, `APP_KEYS="${secret()},${secret()}"`)
    .replace(/^(\w+)=tobemodified$/gm, (_line, key) => `${key}=${secret()}`)

  console.log('Created apps/SandboxApi/.env with freshly generated secrets.')
}

// The scaffold writes `DATABASE_FILENAME=` with no value; give sqlite a real path.
if (!readEnvValue(contents, 'DATABASE_FILENAME')) {
  contents = /^DATABASE_FILENAME=/m.test(contents)
    ? contents.replace(/^DATABASE_FILENAME=.*$/m, `DATABASE_FILENAME=${DEFAULT_SQLITE_FILE}`)
    : `${contents.replace(/\n*$/, '\n')}DATABASE_FILENAME=${DEFAULT_SQLITE_FILE}\n`

  console.log(`Set DATABASE_FILENAME=${DEFAULT_SQLITE_FILE}.`)
}

fs.writeFileSync(envPath, contents, { mode: 0o600 })

// sqlite will not create the directory holding its database file.
if ((readEnvValue(contents, 'DATABASE_CLIENT') || 'sqlite') === 'sqlite') {
  const sqliteDir = path.dirname(
    path.join(apiDir, readEnvValue(contents, 'DATABASE_FILENAME') || DEFAULT_SQLITE_FILE),
  )

  fs.mkdirSync(sqliteDir, { recursive: true })
  console.log(`Ready: ${path.relative(repoRoot, sqliteDir)}/`)
}
