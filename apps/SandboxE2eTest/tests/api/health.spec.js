import { expect, test } from '@playwright/test'

test.describe('SandboxApi health', () => {
  test('responds on the health endpoint', async ({ request }) => {
    const response = await request.get('/_health')
    expect(response.status()).toBe(204)
  })

  test('serves the admin panel entry point', async ({ request }) => {
    const response = await request.get('/admin')
    expect(response.ok()).toBeTruthy()
    expect(await response.text()).toContain('<div id="strapi">')
  })
})
