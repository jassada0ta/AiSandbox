import { expect, test } from '@playwright/test'

/**
 * Smoke coverage for the isometric job-class tactics prototype. A fixed seed
 * keeps the map and deployment identical between runs; "Fast" shortens every
 * animation so enemy turns resolve quickly on software-rendered CI browsers.
 */
const PROTOTYPE = '/prototypes/my-fft-demo.html?seed=7'

async function waitForAllyTurn(page) {
  await expect(page.locator('body')).toHaveAttribute('data-side', 'ally', { timeout: 60_000 })
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'menu', { timeout: 60_000 })
}

test.beforeEach(async ({ page }) => {
  await page.goto(PROTOTYPE)
  await expect(page.locator('body')).toHaveAttribute('data-boot', 'title', { timeout: 20_000 })
  await page.getByTestId('start').click()
  await expect(page.locator('body')).toHaveAttribute('data-boot', 'ready')
  await page.getByTestId('toggle-fast').check()
})

test('generates a 512x512 height map of grassland, badland and water', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-map-size', '512')
  const counts = await page.evaluate(() => window.__fft.terrainCounts())

  expect(counts.grass + counts.badland + counts.water).toBe(512 * 512)
  expect(counts.grass).toBeGreaterThan(0)
  expect(counts.badland).toBeGreaterThan(0)
  expect(counts.water).toBeGreaterThan(0)

  const { lo, hi } = await page.evaluate(() => window.__fft.heightRange())
  expect(hi - lo).toBeGreaterThan(4)
  await expect(page.getByTestId('minimap')).toBeVisible()
  await expect(page.getByTestId('turn-order').locator('li')).not.toHaveCount(0)
})

test('an ally turn offers Move / Act / Wait and moving spends the move', async ({ page }) => {
  test.setTimeout(90_000)
  await waitForAllyTurn(page)
  const active = await page.evaluate(() => window.__fft.active())
  await expect(page.getByTestId('unit-panel')).toHaveAttribute('data-unit', active.id)

  await page.getByTestId('cmd-move').click()
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'move')

  // Pick a reachable tile whose top face is not hidden behind a taller one.
  const target = await page.evaluate(() => {
    const a = window.__fft.active()
    for (const t of window.__fft.reach()) {
      if (t.tx === a.tx && t.ty === a.ty) continue
      const s = window.__fft.tileScreen(t.tx, t.ty)
      const p = window.__fft.pick(s.x, s.y)
      if (p && p.tx === t.tx && p.ty === t.ty && s.y > 120 && s.y < innerHeight - 200) return { ...t, ...s }
    }
    return null
  })
  expect(target).not.toBeNull()
  await page.mouse.move(target.x, target.y)
  await page.mouse.click(target.x, target.y)

  await expect(page.locator('body')).toHaveAttribute('data-mode', 'menu')
  await expect(page.getByTestId('cmd-move')).toBeDisabled()
  const moved = await page.evaluate(() => window.__fft.active())
  expect([moved.tx, moved.ty]).toEqual([target.tx, target.ty])
})

test('waiting asks for a facing, then the clock moves on to the next turn', async ({ page }) => {
  test.setTimeout(90_000)
  await waitForAllyTurn(page)
  const first = await page.evaluate(() => window.__fft.active().id)

  await page.getByTestId('cmd-wait').click()
  await expect(page.getByTestId('facing-panel')).toBeVisible()
  await page.getByTestId('face-ne').click()
  await page.getByTestId('face-confirm').click()

  await expect(page.locator('body')).not.toHaveAttribute('data-active', first, { timeout: 60_000 })
  const tick = await page.getByTestId('clock').textContent()
  expect(tick).toMatch(/Tick \d+/)
})

test('rotating the camera keeps the active unit pickable', async ({ page }) => {
  test.setTimeout(90_000)
  await waitForAllyTurn(page)
  await page.getByTestId('rotate-right').click()
  await expect(page.locator('body')).toHaveAttribute('data-rot', '1')
  await page.getByTestId('center-active').click()
  await page.waitForTimeout(600)
  const ok = await page.evaluate(() => {
    const a = window.__fft.active()
    const s = window.__fft.tileScreen(a.tx, a.ty)
    const p = window.__fft.pick(s.x, s.y)
    return !!p && Math.abs(p.tx - a.tx) + Math.abs(p.ty - a.ty) <= 1
  })
  expect(ok).toBe(true)
})
