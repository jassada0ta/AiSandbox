import { expect, test } from '@playwright/test'

/**
 * These tests assert the deployment contract between SandboxSpaApp and
 * SandboxApi: the SPA build lands in `SandboxApi/public/app` and Strapi serves
 * it from `/app`.
 */
test.describe('SandboxSpaApp served from SandboxApi/public/app', () => {
  test('loads at /app', async ({ page }) => {
    await page.goto('/app/')

    await expect(page.getByTestId('app-title')).toHaveText('SandboxSpaApp')
    await expect(page).toHaveTitle(/SandboxSpaApp/)
  })

  test('loads its assets from the /app base path', async ({ page }) => {
    const assetRequests = []

    page.on('response', (response) => {
      const { pathname } = new URL(response.url())

      if (/\.(js|css)$/.test(pathname)) {
        assetRequests.push({ pathname, status: response.status() })
      }
    })

    await page.goto('/app/')
    await expect(page.getByTestId('app-title')).toBeVisible()

    expect(assetRequests.length).toBeGreaterThan(0)

    for (const asset of assetRequests) {
      expect(asset.pathname, `${asset.pathname} should sit under /app/`).toMatch(
        /^\/app\//,
      )
      expect(asset.status, `${asset.pathname} should load`).toBeLessThan(400)
    }
  })

  test('falls back to index.html for client-side routes', async ({ page }) => {
    const response = await page.goto('/app/some/client-side/route')

    expect(response.status()).toBe(200)
    await expect(page.getByTestId('app-title')).toBeVisible()
  })

  test('reaches the GraphQL backend from the browser', async ({ page }) => {
    await page.goto('/app/')

    const status = page.getByTestId('backend-status')
    await expect(status).toHaveAttribute('data-status', 'online')
    await expect(page.getByTestId('backend-detail')).toContainText('Query')
  })

  test('re-checks the backend on demand', async ({ page }) => {
    await page.goto('/app/')
    await expect(page.getByTestId('backend-status')).toHaveAttribute(
      'data-status',
      'online',
    )

    const graphqlCall = page.waitForResponse(
      (response) =>
        response.url().includes('/graphql') && response.request().method() === 'POST',
    )

    await page.getByTestId('retry-backend').click()
    await graphqlCall

    await expect(page.getByTestId('backend-status')).toHaveAttribute(
      'data-status',
      'online',
    )
  })
})
