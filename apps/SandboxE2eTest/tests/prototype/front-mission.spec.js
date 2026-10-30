import { expect, test } from '@playwright/test'

/**
 * Smoke coverage for the isometric rig-tactics prototype. A fixed seed keeps
 * the map and deployment identical between runs; battle cut-ins are switched
 * off so an enemy phase resolves in a couple of seconds.
 */
const PROTOTYPE = '/prototypes/my-front-mission-proto.html?seed=7'

test.beforeEach(async ({ page }) => {
  await page.goto(PROTOTYPE)
  await expect(page.locator('body')).toHaveAttribute('data-boot', 'title', { timeout: 20_000 })
  await page.getByTestId('start').click()
  await expect(page.locator('body')).toHaveAttribute('data-boot', 'ready')
})

test('generates a 512x512 map of grassland, badland and water', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-map-size', '512')
  const counts = await page.evaluate(() => window.__rig.terrainCounts())

  expect(counts.grass + counts.badland + counts.water).toBe(512 * 512)
  expect(counts.grass).toBeGreaterThan(0)
  expect(counts.badland).toBeGreaterThan(0)
  expect(counts.water).toBeGreaterThan(0)
  await expect(page.getByTestId('minimap')).toBeVisible()
})

test('selecting a rig opens the command menu and shows its move range', async ({ page }) => {
  const pos = await page.evaluate(() => window.__rig.unitScreen('p1'))
  await page.mouse.click(pos.x, pos.y - 4)

  await expect(page.getByTestId('command-menu')).toBeVisible()
  await expect(page.getByTestId('unit-panel')).toHaveAttribute('data-unit', 'p1')

  await page.getByTestId('cmd-move').click()
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'move')
})

test('ending the phase runs the enemy turn and starts turn 2', async ({ page }) => {
  // Five enemy rigs pan, walk and fight in sequence; software-rendered CI
  // browsers run that well below 60 fps.
  test.setTimeout(90_000)
  await page.getByTestId('toggle-battle-anim').uncheck()
  await page.getByTestId('end-phase').click()

  await expect(page.getByTestId('phase')).toHaveText('ENEMY PHASE')
  await expect(page.getByTestId('turn')).toHaveText('2', { timeout: 60_000 })
  await expect(page.locator('body')).toHaveAttribute('data-phase', 'player')
})
