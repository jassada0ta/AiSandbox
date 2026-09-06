import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

/**
 * The suite runs against the deployed shape of the monorepo:
 *
 * - SandboxApi is started with `strapi start`, which also serves the built
 *   SandboxSpaApp from `public/app`.
 * - SandboxPrototypeWeb is served by `vite preview` from its own build.
 *
 * So run `npm run build` at the repo root first, or just use the root script
 * `npm run test:e2e`, which builds and then calls this suite.
 */
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:1337'
const PROTOTYPE_BASE_URL =
  process.env.E2E_PROTOTYPE_BASE_URL || 'http://localhost:4174'

const isCI = !!process.env.CI

/**
 * Escape hatch for sandboxes and CI images that ship their own Chromium
 * instead of the build `playwright install` would download. Leave unset to use
 * Playwright's own browser.
 */
const chromium = process.env.E2E_CHROMIUM_EXECUTABLE
const browser = chromium
  ? { ...devices['Desktop Chrome'], launchOptions: { executablePath: chromium } }
  : devices['Desktop Chrome']

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.js/,
      use: { baseURL: API_BASE_URL },
    },
    {
      name: 'spa',
      testMatch: /tests\/spa\/.*\.spec\.js/,
      use: { ...browser, baseURL: API_BASE_URL },
    },
    {
      name: 'prototype',
      testMatch: /tests\/prototype\/.*\.spec\.js/,
      use: { ...browser, baseURL: PROTOTYPE_BASE_URL },
    },
  ],

  webServer: [
    {
      // Serves the REST + GraphQL API and the built SPA under /app.
      command: 'npm run start --workspace apps/SandboxApi',
      cwd: repoRoot,
      url: `${API_BASE_URL}/_health`,
      reuseExistingServer: !isCI,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run preview --workspace apps/SandboxPrototypeWeb',
      cwd: repoRoot,
      url: `${PROTOTYPE_BASE_URL}/`,
      reuseExistingServer: !isCI,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
})
