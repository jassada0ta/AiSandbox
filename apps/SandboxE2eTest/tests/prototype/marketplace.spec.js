import { expect, test } from '@playwright/test'

/**
 * Covers the marketplace prototype's main flows end to end. The prototype is a
 * design exploration, so these tests deliberately assert behaviour a reviewer
 * would click through — not layout details, which are expected to churn.
 *
 * State is in-memory, so each test starts from a fresh page load.
 */
const PROTOTYPE = '/prototypes/proto-marketplace.html'

/** A product with both colour and size variations, one of them sold out. */
const VARIANT_PRODUCT = 'p8'

test.beforeEach(async ({ page }) => {
  await page.goto(PROTOTYPE)
  await expect(page.getByTestId('mkt-header')).toBeVisible()
})

test.describe('marketplace prototype — browse', () => {
  test('lists categories and a product grid on the home page', async ({ page }) => {
    await expect(page.getByTestId('category-tile')).toHaveCount(6)
    await expect(page.getByTestId('product-card').first()).toBeVisible()
  })

  test('the flash sale countdown is running', async ({ page }) => {
    const countdown = page.getByTestId('flash-countdown')
    const first = await countdown.textContent()

    await expect(countdown).not.toHaveText(first, { timeout: 5000 })
  })

  test('load more reveals the rest of the catalogue', async ({ page }) => {
    const before = await page.getByTestId('product-card').count()

    await page.getByTestId('load-more').click()

    expect(await page.getByTestId('product-card').count()).toBeGreaterThan(before)
  })
})

test.describe('marketplace prototype — search and filter', () => {
  test('searching from the header puts the term in the URL', async ({ page }) => {
    await page.getByTestId('mkt-search-input').fill('shoes')
    await page.getByTestId('mkt-search-submit').click()

    await expect(page).toHaveURL(/#\/search\?q=shoes$/)
    await expect(page.getByTestId('search-result-count')).toContainText('1 product')
  })

  test('typing offers suggestions that jump to a product', async ({ page }) => {
    await page.getByTestId('mkt-search-input').pressSequentially('coffee', { delay: 20 })

    const suggestion = page.getByTestId('mkt-search-suggestion').first()
    await expect(suggestion).toBeVisible()

    await suggestion.click()

    await expect(page.getByTestId('pdp-title')).toContainText('Coffee')
  })

  test('category, price and rating filters narrow the results', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/search`)

    const count = page.getByTestId('search-result-count')
    const total = Number((await count.textContent()).match(/\d+/)[0])

    await page.locator('[data-testid="filter-category"][data-category="electronics"]').check()
    const byCategory = Number((await count.textContent()).match(/\d+/)[0])
    expect(byCategory).toBeLessThan(total)

    await page.getByTestId('filter-price-min').fill('1000')
    await page.getByTestId('filter-price-max').fill('3000')
    await page.getByTestId('filter-price-apply').click()
    const byPrice = Number((await count.textContent()).match(/\d+/)[0])
    expect(byPrice).toBeLessThan(byCategory)

    await page.getByTestId('clear-filters').click()
    await expect(count).toContainText(String(total))
  })

  test('sorting by price orders the grid ascending', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/search`)
    await page.getByTestId('sort-select').selectOption('price-asc')

    const prices = (await page.getByTestId('product-card-price').allTextContents()).map((text) =>
      Number(text.replace(/\D/g, '')),
    )

    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  test('the mobile filter drawer opens without duplicating element ids', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${PROTOTYPE}#/search`)

    await page.getByTestId('open-filters').click()
    await expect(page.locator('#filterDrawer.show')).toBeVisible()

    // The panel renders twice (sidebar + drawer), so its ids must stay unique
    // or each drawer label would drive the hidden sidebar control.
    const duplicateIds = await page.evaluate(() => {
      const seen = new Set()
      const duplicates = new Set()

      for (const element of document.querySelectorAll('[id]')) {
        if (seen.has(element.id)) duplicates.add(element.id)
        else seen.add(element.id)
      }

      return [...duplicates]
    })

    expect(duplicateIds).toEqual([])
  })
})

test.describe('marketplace prototype — product detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/product/${VARIANT_PRODUCT}`)
  })

  test('refuses to add to cart until every variation is chosen', async ({ page }) => {
    await page.getByTestId('pdp-add-to-cart').click()

    await expect(page.getByTestId('toast').first()).toContainText(/colour/i)
    await expect(page.getByTestId('mkt-cart-badge')).toBeHidden()
  })

  test('marks a sold-out size as unavailable', async ({ page }) => {
    await expect(page.locator('[data-testid="pdp-size-option"][disabled]')).not.toHaveCount(0)
  })

  test('adds to the cart once colour, size and quantity are set', async ({ page }) => {
    await page.getByTestId('pdp-colour-option').first().click()
    await page.locator('[data-testid="pdp-size-option"]:not([disabled])').first().click()
    await page.getByTestId('pdp-qty-inc').click()

    await expect(page.getByTestId('pdp-qty')).toHaveText('2')

    await page.getByTestId('pdp-add-to-cart').click()

    await expect(page.getByTestId('mkt-cart-badge')).toHaveText('2')
  })

  test('switches the gallery image from a thumbnail', async ({ page }) => {
    const image = page.getByTestId('pdp-image')
    const before = await image.getAttribute('src')

    await page.getByTestId('pdp-thumb').nth(2).click()

    expect(await image.getAttribute('src')).not.toBe(before)
  })

  test('a submitted review appears at the top of the list', async ({ page }) => {
    const reviews = page.getByTestId('pdp-review-item')
    const before = await reviews.count()

    await page.getByTestId('pdp-write-review').click()
    await page.getByTestId('review-text').fill('Comfortable and true to size.')
    await page.getByTestId('review-submit').click()

    await expect(reviews).toHaveCount(before + 1)
    await expect(reviews.first()).toContainText('true to size')
  })

  test('saves to the wishlist and shows it on the wishlist page', async ({ page }) => {
    await page.getByTestId('pdp-wishlist').click()

    await expect(page.getByTestId('mkt-wishlist-badge')).toHaveText('1')

    await page.getByTestId('mkt-wishlist-link').click()

    await expect(page.getByTestId('wishlist-view')).toBeVisible()
    await expect(page.getByTestId('product-card')).toHaveCount(1)
  })
})

test.describe('marketplace prototype — cart', () => {
  /** Puts one no-variation product in the cart and lands on the cart page. */
  const fillCart = async (page) => {
    await page.goto(`${PROTOTYPE}#/search?category=grocery`)
    await page.getByTestId('product-card-add').first().click()
    await expect(page.getByTestId('mkt-cart-badge')).toHaveText('1')
    await page.getByTestId('mkt-cart-link').click()
    await expect(page.getByTestId('cart-view')).toBeVisible()
  }

  test('starts empty', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/cart`)
    await expect(page.getByTestId('cart-empty')).toBeVisible()
  })

  test('changing the quantity updates the line and the total', async ({ page }) => {
    await fillCart(page)

    const total = page.getByTestId('summary-total')
    const before = await total.textContent()

    await page.getByTestId('cart-item-inc').first().click()

    await expect(page.getByTestId('cart-item-qty').first()).toHaveText('2')
    await expect(total).not.toHaveText(before)
  })

  test('rejects an unknown voucher with a reason', async ({ page }) => {
    await fillCart(page)

    await page.getByTestId('cart-voucher-input').fill('NOPE123')
    await page.getByTestId('cart-apply-voucher').click()

    await expect(page.getByTestId('cart-voucher-error')).toContainText('not a valid code')
  })

  test('rejects a voucher below its minimum spend', async ({ page }) => {
    // p21 is the ฿320 rice, comfortably under LAZ50's ฿500 minimum.
    await page.goto(`${PROTOTYPE}#/search?category=grocery`)
    await page
      .locator('[data-testid="product-card"][data-product="p21"]')
      .getByTestId('product-card-add')
      .click()
    await page.getByTestId('mkt-cart-link').click()
    await expect(page.getByTestId('cart-view')).toBeVisible()

    await page.getByTestId('cart-voucher-input').fill('LAZ50')
    await page.getByTestId('cart-apply-voucher').click()

    await expect(page.getByTestId('cart-voucher-error')).toContainText('minimum spend')
  })

  test('applies a percentage voucher and reduces the total', async ({ page }) => {
    await fillCart(page)

    const total = page.getByTestId('summary-total')
    const before = Number((await total.textContent()).replace(/\D/g, ''))

    await page.getByTestId('cart-voucher-input').fill('SAVE10')
    await page.getByTestId('cart-apply-voucher').click()

    await expect(page.getByTestId('cart-voucher-applied')).toHaveText('SAVE10')
    expect(Number((await total.textContent()).replace(/\D/g, ''))).toBeLessThan(before)
  })

  test('deselecting every item disables checkout', async ({ page }) => {
    await fillCart(page)

    await page.getByTestId('cart-item-select').first().uncheck()

    await expect(page.getByTestId('cart-checkout')).toBeDisabled()
  })

  test('removing the last item empties the cart', async ({ page }) => {
    await fillCart(page)

    await page.getByTestId('cart-item-remove').first().click()

    await expect(page.getByTestId('cart-empty')).toBeVisible()
    await expect(page.getByTestId('mkt-cart-badge')).toBeHidden()
  })
})

test.describe('marketplace prototype — checkout and orders', () => {
  /** Cart → login → checkout, which is the gate every purchase goes through. */
  const reachCheckout = async (page) => {
    await page.goto(`${PROTOTYPE}#/search?category=grocery`)
    await page.getByTestId('product-card-add').first().click()
    await page.getByTestId('mkt-cart-link').click()

    await page.getByTestId('cart-checkout').click()

    // Checkout is gated behind login.
    await expect(page.locator('#loginModal.show')).toBeVisible()
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('mkt-account-label')).toContainText('Alex')

    await page.getByTestId('cart-checkout').click()
    await expect(page.getByTestId('checkout-view')).toBeVisible()
  }

  test('checkout is gated behind login', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/search?category=grocery`)
    await page.getByTestId('product-card-add').first().click()
    await page.getByTestId('mkt-cart-link').click()

    await page.getByTestId('cart-checkout').click()

    await expect(page.locator('#loginModal.show')).toBeVisible()
    await expect(page.getByTestId('checkout-view')).toHaveCount(0)
  })

  test('a new address is saved and becomes the delivery address', async ({ page }) => {
    await reachCheckout(page)

    await page.getByTestId('checkout-add-address').click()
    await page.getByTestId('addr-name').fill('Alex Chan')
    await page.getByTestId('addr-phone').fill('089 999 1111')
    await page.getByTestId('addr-line').fill('55/1 Rama IX Road')
    await page.getByTestId('addr-city').fill('Chiang Mai')
    await page.getByTestId('addr-post').fill('50200')
    await page.getByTestId('addr-save').click()

    await expect(page.getByTestId('checkout-address-summary')).toContainText('Chiang Mai')
  })

  test('choosing express shipping raises the total', async ({ page }) => {
    await reachCheckout(page)

    const total = page.getByTestId('summary-total')
    const before = Number((await total.textContent()).replace(/\D/g, ''))

    await page.locator('[data-testid="checkout-shipping"][data-shipping="express"]').check()

    expect(Number((await total.textContent()).replace(/\D/g, ''))).toBeGreaterThan(before)
  })

  test('incomplete card details block the order', async ({ page }) => {
    await reachCheckout(page)

    await page.locator('[data-testid="checkout-payment"][data-payment="card"]').check()
    await expect(page.getByTestId('checkout-card-fields')).toBeVisible()

    await page.getByTestId('card-number').fill('411')
    await page.getByTestId('checkout-place-order').click()

    await expect(page.getByTestId('checkout-error')).toContainText(/card details/i)
    await expect(page.getByTestId('order-success-view')).toHaveCount(0)
  })

  test('places an order and tracks it through to completed', async ({ page }) => {
    await reachCheckout(page)

    await page.getByTestId('checkout-place-order').click()

    await expect(page.getByTestId('order-success-view')).toBeVisible()
    await expect(page.getByTestId('order-success-id')).toContainText(/^MP-/)

    // Ordered items leave the cart.
    await expect(page.getByTestId('mkt-cart-badge')).toBeHidden()

    await page.getByTestId('order-success-track').click()
    await expect(page.getByTestId('order-status')).toHaveText('To ship')

    await page.getByTestId('order-advance').click()
    await expect(page.getByTestId('order-status')).toHaveText('Shipping')

    await page.getByTestId('order-advance').click()
    await expect(page.getByTestId('order-status')).toHaveText('To receive')

    await page.getByTestId('order-confirm-receipt').click()
    await expect(page.getByTestId('order-status')).toHaveText('Completed')

    // A delivered item can be reviewed.
    await expect(page.getByTestId('order-item-review').first()).toBeVisible()
  })

  test('an order can be cancelled before it ships', async ({ page }) => {
    await reachCheckout(page)
    await page.getByTestId('checkout-place-order').click()
    await page.getByTestId('order-success-track').click()

    await page.getByTestId('order-cancel').click()

    await expect(page.getByTestId('order-status')).toHaveText('Cancelled')
  })

  test('buy again puts the order back in the cart', async ({ page }) => {
    await reachCheckout(page)
    await page.getByTestId('checkout-place-order').click()
    await page.getByTestId('order-success-track').click()
    await page.getByTestId('order-cancel').click()

    await page.getByTestId('order-reorder').click()

    await expect(page.getByTestId('cart-view')).toBeVisible()
    await expect(page.getByTestId('cart-item')).not.toHaveCount(0)
  })

  test('the orders list filters by status tab', async ({ page }) => {
    await reachCheckout(page)
    await page.getByTestId('checkout-place-order').click()

    await page.goto(`${PROTOTYPE}#/orders`)

    await page.getByTestId('orders-tab').filter({ hasText: 'To ship' }).click()
    await expect(page.getByTestId('order-row')).toHaveCount(1)

    await page.getByTestId('orders-tab').filter({ hasText: 'Cancelled' }).click()
    await expect(page.getByTestId('orders-empty')).toBeVisible()
  })
})
