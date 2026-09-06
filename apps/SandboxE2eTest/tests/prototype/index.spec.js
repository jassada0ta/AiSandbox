import { expect, test } from '@playwright/test'

test.describe('SandboxPrototypeWeb entry page', () => {
  test('lists every prototype it found', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('app-title')).toHaveText('SandboxPrototypeWeb')

    const links = page.getByTestId('prototype-link')
    const linkCount = await links.count()

    expect(linkCount).toBeGreaterThan(0)

    // The headline count and the rendered list must agree.
    await expect(page.getByTestId('prototype-count')).toHaveText(String(linkCount))
  })

  test('every listed link resolves to a real page', async ({ page, request }) => {
    await page.goto('/')

    const hrefs = await page.getByTestId('prototype-link').evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')),
    )

    expect(hrefs.length).toBeGreaterThan(0)

    for (const href of hrefs) {
      expect(href).toMatch(/^\/prototypes\/.*\.html$/)

      const response = await request.get(href)
      expect(response.status(), `${href} should be served`).toBe(200)
    }
  })

  test('navigating to a prototype and back works', async ({ page }) => {
    await page.goto('/')

    const firstLink = page.getByTestId('prototype-link').first()
    const title = (await firstLink.textContent()).trim()

    await firstLink.click()

    await expect(page).toHaveURL(/\/prototypes\/.*\.html$/)
    await expect(page.locator('h1')).toHaveText(title)

    await page.getByRole('link', { name: /All prototypes/i }).click()
    await expect(page.getByTestId('app-title')).toBeVisible()
  })

  test('groups nested prototypes by folder', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('prototype-group')).not.toHaveCount(0)
    await expect(
      page.locator('[data-testid="prototype-group"][data-group="examples"]'),
    ).toBeVisible()
  })

  test('filters the list as you type', async ({ page }) => {
    await page.goto('/')

    const total = await page.getByTestId('prototype-item').count()

    await page.getByTestId('prototype-filter').fill('welcome')
    await expect(page.getByTestId('prototype-item')).toHaveCount(1)

    await page.getByTestId('prototype-filter').fill('no-such-prototype-anywhere')
    await expect(page.getByTestId('prototype-empty')).toBeVisible()

    await page.getByTestId('prototype-filter').fill('')
    await expect(page.getByTestId('prototype-item')).toHaveCount(total)
  })
})
