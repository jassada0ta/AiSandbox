import { expect, test } from '@playwright/test'

/**
 * Covers the condo juristic management prototype's main flows on both sides of
 * the building: a resident paying, reporting, booking, collecting and voting,
 * and the management office billing, dispatching, approving and publishing.
 *
 * Assertions read `data-testid` and `data-*` state rather than display text,
 * which matters twice over here: the page renders in Thai or English, so any
 * test that matched copy would only pass in one language.
 *
 * State lives in localStorage, so each test clears it and reloads to get the
 * seeded demo data back.
 */
const PROTOTYPE = '/prototypes/proto-condo-mgmt.html'

/** The seeded resident holds this unit. */
const UNIT = 'A-1103'

async function fresh(page) {
  await page.goto(PROTOTYPE)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-view', 'home')
}

/** Hash routing: assigning the hash is a same-document navigation. */
async function go(page, route) {
  await page.evaluate((r) => {
    window.location.hash = '#/' + r
  }, route)
  await expect(page.locator('body')).toHaveAttribute('data-view', route)
}

async function asResident(page) {
  await page.getByTestId('home-enter-resident').click()
  await expect(page.locator('body')).toHaveAttribute('data-role', 'resident')
}

async function asOffice(page) {
  await page.getByTestId('home-enter-juristic').click()
  await expect(page.locator('body')).toHaveAttribute('data-role', 'juristic')
}

async function signOut(page) {
  await page.getByTestId('user-menu').click()
  await page.getByTestId('sign-out').click()
  await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
}

/** Sign out of the resident account and back in as the office, or vice versa. */
async function switchTo(page, role) {
  await signOut(page)
  if (role === 'juristic') await asOffice(page)
  else await asResident(page)
}

const slipFile = {
  name: 'slip-kbank.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from('not-a-real-slip'),
}

test.describe('language', () => {
  test('switches between Thai and English and remembers the choice', async ({ page }) => {
    await fresh(page)

    // English is the document's authored default.
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('back-to-index')).toContainText('All prototypes')

    await page.getByTestId('lang-th').click()
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'th')
    await expect(page.locator('html')).toHaveAttribute('lang', 'th')
    await expect(page.getByTestId('back-to-index')).toContainText('ต้นแบบทั้งหมด')

    // The choice survives a reload.
    await page.reload()
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'th')

    await page.getByTestId('lang-en').click()
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'en')
  })

  test('translates the signed-in navigation both ways', async ({ page }) => {
    await fresh(page)
    await asResident(page)

    await expect(page.getByTestId('nav-bills')).toContainText('Invoices')
    await expect(page.getByTestId('nav-requests')).toContainText('Repairs')

    await page.getByTestId('lang-th').click()
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'th')
    await expect(page.getByTestId('nav-bills')).toContainText('ใบแจ้งหนี้')
    await expect(page.getByTestId('nav-requests')).toContainText('แจ้งซ่อม')
  })

  test('keeps what you have typed when the language changes', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'requests')

    await page.getByTestId('new-request').click()
    await page.getByTestId('req-spot').fill('Kitchen sink')
    await page.getByTestId('req-detail').fill('The tap drips overnight.')

    await page.getByTestId('modal-lang-th').click()
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'th')

    // The dialog re-rendered in Thai around the values already entered.
    await expect(page.getByTestId('req-spot')).toHaveValue('Kitchen sink')
    await expect(page.getByTestId('req-detail')).toHaveValue('The tap drips overnight.')
  })

  test('an explicit choice outranks the account preference', async ({ page }) => {
    await fresh(page)

    // The office demo account prefers Thai, so signing straight in follows it.
    await asOffice(page)
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'th')

    await signOut(page)
    await page.getByTestId('lang-en').click()
    await asOffice(page)
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'en')
  })
})

test.describe('access', () => {
  test('sends a signed-out visitor to sign in', async ({ page }) => {
    await fresh(page)
    await page.evaluate(() => {
      window.location.hash = '#/bills'
    })
    await expect(page.locator('body')).toHaveAttribute('data-view', 'login')
  })

  test('keeps each role out of the other role pages', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await expect(page.locator('body')).toHaveAttribute('data-unit', UNIT)

    // An office URL bounces a resident back to their own home.
    await page.evaluate(() => {
      window.location.hash = '#/abills'
    })
    await expect(page.locator('body')).toHaveAttribute('data-view', 'dash')

    await switchTo(page, 'juristic')
    await page.evaluate(() => {
      window.location.hash = '#/bills'
    })
    await expect(page.locator('body')).toHaveAttribute('data-view', 'adash')
  })

  test('signs in with the email and password on screen', async ({ page }) => {
    await fresh(page)
    await go(page, 'login')

    await page.getByTestId('login-email').fill('resident@river.test')
    await page.getByTestId('login-password').fill('wrong-password')
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toBeVisible()

    await page.getByTestId('fill-resident').click()
    await page.getByTestId('login-submit').click()
    await expect(page.locator('body')).toHaveAttribute('data-role', 'resident')
  })

  test('registers a unit with the code the office issued', async ({ page }) => {
    await fresh(page)
    await go(page, 'register')

    await page.getByTestId('reg-unit').selectOption('A-0508')
    await page.getByTestId('reg-name').fill('Napat Thongchai')
    await page.getByTestId('reg-phone').fill('081 555 2211')
    await page.getByTestId('reg-email').fill('napat@example.test')
    await page.getByTestId('reg-password').fill('river12345')
    await page.getByTestId('reg-password2').fill('river12345')
    await page.getByTestId('reg-consent').check()

    // The wrong verification code is refused.
    await page.getByTestId('reg-code').fill('RV0000')
    await page.getByTestId('register-submit').click()
    await expect(page.getByTestId('register-error')).toBeVisible()
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')

    // The hint names the code for the selected unit.
    await expect(page.getByTestId('reg-code-help')).toContainText('RV0508')
    await page.getByTestId('reg-code').fill('RV0508')
    await page.getByTestId('register-submit').click()

    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'true')
    await expect(page.locator('body')).toHaveAttribute('data-unit', 'A-0508')
  })
})

test.describe('invoices and payment', () => {
  test('pays an overdue invoice by card and keeps the receipt', async ({ page }) => {
    await fresh(page)
    await asResident(page)

    // The seeded unit starts in arrears, which is what makes this reachable.
    await expect(page.locator('body')).toHaveAttribute('data-arrears', 'true')
    await go(page, 'bills')

    const overdue = page.locator('[data-testid="bill-row"][data-status="overdue"]').first()
    await expect(overdue).toBeVisible()
    const invoiceId = await overdue.getAttribute('data-invoice')
    await overdue.getByTestId('pay-invoice').click()

    await page.getByTestId('pay-method-card').click()
    await page.getByTestId('pay-card-no').fill('4111 1111 1111 1111')
    await page.getByTestId('pay-card-name').fill('K SIRIWAN')
    await page.getByTestId('pay-card-exp').fill('09/29')
    await page.getByTestId('pay-card-cvc').fill('123')
    await page.getByTestId('pay-confirm').click()

    // A card payment is settled by the gateway, so it needs no verification.
    await page.getByTestId('tab-bills-all').click()
    const row = page.locator(`[data-testid="bill-row"][data-invoice="${invoiceId}"]`)
    await expect(row).toHaveAttribute('data-status', 'paid')
    await expect(page.locator('body')).toHaveAttribute('data-arrears', 'false')

    await row.getByTestId('open-receipt').click()
    await expect(page.getByTestId('receipt-sheet')).toBeVisible()
    await expect(page.getByTestId('receipt-no')).not.toBeEmpty()
    await expect(page.getByTestId('receipt-total')).toContainText('฿')
  })

  test('submits a transfer slip that the office verifies', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'bills')

    const unpaid = page.locator('[data-testid="bill-row"][data-status="unpaid"]').first()
    const invoiceId = await unpaid.getAttribute('data-invoice')
    await unpaid.getByTestId('pay-invoice').click()

    // Transfer is the default method; the slip is required.
    await page.getByTestId('pay-confirm').click()
    await expect(page.getByTestId('modal-body')).toBeVisible()

    await page.getByTestId('pay-slip').setInputFiles(slipFile)
    await expect(page.getByTestId('slip-name')).toContainText('slip-kbank.jpg')
    await page.getByTestId('pay-confirm').click()

    const row = page.locator(`[data-testid="bill-row"][data-invoice="${invoiceId}"]`)
    await expect(row).toHaveAttribute('data-status', 'pending')

    await switchTo(page, 'juristic')
    await go(page, 'abills')

    const queued = page.locator(`[data-testid="abill-row"][data-invoice="${invoiceId}"]`)
    await expect(queued).toHaveAttribute('data-status', 'pending')
    await queued.getByTestId('verify-payment').click()
    await expect(page.getByTestId('verify-slip-name')).toContainText('slip-kbank.jpg')
    await page.getByTestId('approve-payment').click()
    await page.getByTestId('tab-abills-all').click()
    await expect(queued).toHaveAttribute('data-status', 'paid')

    // And the resident sees the receipt the office issued.
    await switchTo(page, 'resident')
    await go(page, 'bills')
    await page.getByTestId('tab-bills-paid').click()
    await expect(page.locator(`[data-testid="bill-row"][data-invoice="${invoiceId}"]`)).toHaveAttribute(
      'data-status',
      'paid',
    )
  })

  test('the office can reject a payment it cannot match', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'bills')

    const unpaid = page.locator('[data-testid="bill-row"][data-status="unpaid"]').first()
    const invoiceId = await unpaid.getAttribute('data-invoice')
    await unpaid.getByTestId('pay-invoice').click()
    await page.getByTestId('pay-slip').setInputFiles(slipFile)
    await page.getByTestId('pay-confirm').click()

    await switchTo(page, 'juristic')
    await go(page, 'abills')
    await page.locator(`[data-testid="abill-row"][data-invoice="${invoiceId}"]`).getByTestId('verify-payment').click()
    await page.getByTestId('reject-payment').click()
    await page.getByTestId('reason-text').fill('The slip amount does not match the invoice.')
    await page.getByTestId('reason-submit').click()

    // It goes back to the resident to pay again, with the reason attached.
    await switchTo(page, 'resident')
    await go(page, 'bills')
    const row = page.locator(`[data-testid="bill-row"][data-invoice="${invoiceId}"]`)
    await expect(row).toHaveAttribute('data-status', /unpaid|overdue/)
    await row.getByTestId('view-invoice').click()
    await expect(page.getByTestId('invoice-rejected-note')).toContainText('does not match')
  })

  test('pays every outstanding invoice in one go', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'bills')

    const open = await page.locator('[data-testid="bill-row"][data-status="unpaid"]').count()
    const overdue = await page.locator('[data-testid="bill-row"][data-status="overdue"]').count()
    expect(open + overdue).toBeGreaterThan(1)

    await page.getByTestId('pay-all').click()
    await expect(page.getByTestId('pay-multi-note')).toBeVisible()
    await page.getByTestId('pay-method-promptpay').click()
    await expect(page.getByTestId('qr')).toBeVisible()
    await page.getByTestId('pay-confirm').click()

    await expect(page.locator('body')).toHaveAttribute('data-outstanding', '0.00')
    await expect(page.getByTestId('pay-all')).toHaveCount(0)
  })

  test('runs a billing period for every occupied unit', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'abills')

    await page.getByTestId('tab-abills-unpaid').click()
    const before = await page.locator('[data-testid="abill-row"]').count()

    await page.getByTestId('billing-run').click()
    await expect(page.getByTestId('run-preview')).toBeVisible()
    await page.getByTestId('run-submit').click()

    // Twelve of the fourteen units are occupied; the two vacant ones are not billed.
    await expect(page.locator('[data-testid="abill-row"]')).toHaveCount(before + 12)

    // The same period cannot be issued twice.
    await page.getByTestId('billing-run').click()
    await page.getByTestId('run-submit').click()
    await expect(page.locator('[data-testid="abill-row"]')).toHaveCount(before + 12)
  })

  test('records a payment taken at the counter', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'abills')

    await page.getByTestId('record-cash').click()
    const invoiceId = await page.getByTestId('cash-invoice').locator('option').nth(1).getAttribute('value')
    await page.getByTestId('cash-invoice').selectOption(invoiceId)
    await page.getByTestId('cash-method').selectOption('cash')
    await page.getByTestId('cash-submit').click()

    await page.getByTestId('tab-abills-paid').click()
    await expect(page.locator(`[data-testid="abill-row"][data-invoice="${invoiceId}"]`)).toHaveAttribute(
      'data-status',
      'paid',
    )
  })
})

test.describe('repairs and complaints', () => {
  test('walks a repair from report to closed and rated', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'requests')

    await page.getByTestId('new-request').click()
    await page.getByTestId('req-kind-repair').click()
    await page.getByTestId('req-category').selectOption('plumbing')
    await page.getByTestId('req-priority').selectOption('high')
    await page.getByTestId('req-spot').fill('Guest bathroom basin')
    await page.getByTestId('req-detail').fill('The basin drains very slowly and smells.')
    await page.getByTestId('req-contact').fill('081 234 5678')
    await page.getByTestId('req-submit').click()

    const card = page.locator('[data-testid="request-card"][data-status="new"]').first()
    await expect(card).toBeVisible()
    const ref = await card.getAttribute('data-ref')

    // The office picks it up.
    await switchTo(page, 'juristic')
    await go(page, 'arequests')
    await page.getByTestId('tab-arequests-all').click()
    const row = page.locator(`[data-testid="arequest-row"][data-ref="${ref}"]`)
    await expect(row).toHaveAttribute('data-status', 'new')

    await row.getByTestId('assign-request').click()
    await page.getByTestId('asg-tech').selectOption('tech-wirat')
    await page.getByTestId('asg-note').fill('Please bring a drain snake.')
    await page.getByTestId('assign-submit').click()
    await expect(row).toHaveAttribute('data-status', 'assigned')

    await row.getByTestId('start-request').click()
    await expect(row).toHaveAttribute('data-status', 'inprogress')

    await row.getByTestId('finish-request').click()
    await page.getByTestId('fin-note').fill('Cleared the trap and refitted the seal.')
    await page.getByTestId('finish-submit').click()
    await expect(row).toHaveAttribute('data-status', 'done')

    // Back to the resident to confirm and rate, which closes it.
    await switchTo(page, 'resident')
    await go(page, 'requests')
    const mine = page.locator(`[data-testid="request-card"][data-ref="${ref}"]`)
    await expect(mine).toHaveAttribute('data-status', 'done')

    await mine.getByTestId('confirm-request').click()
    await page.getByTestId('rate-4').click()
    await page.getByTestId('rate-feedback').fill('Quick and tidy, thank you.')
    await page.getByTestId('rate-submit').click()

    await page.getByTestId('tab-requests-closed').click()
    await expect(page.locator(`[data-testid="request-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'closed',
    )
  })

  test('records a complaint and its progress', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'requests')

    await page.getByTestId('new-request').click()
    await page.getByTestId('req-kind-complaint').click()
    // Switching kind re-lists the categories with the complaint ones.
    await page.getByTestId('req-category').selectOption('noise')
    await page.getByTestId('req-where-common').check()
    await page.getByTestId('req-spot').fill('Pool deck')
    await page.getByTestId('req-detail').fill('Loud music from the pool deck after 22:00.')
    await page.getByTestId('req-contact').fill('081 234 5678')
    await page.getByTestId('req-submit').click()

    const card = page.locator('[data-testid="request-card"][data-status="new"]').first()
    const ref = await card.getAttribute('data-ref')
    await card.getByTestId('open-request').click()

    // One timeline entry so far, and a comment adds to it.
    await expect(page.getByTestId('request-timeline').locator('li')).toHaveCount(1)
    await page.getByTestId('req-comment').fill('It happened again last night.')
    await page.getByTestId('add-comment').click()
    await expect(page.getByTestId('request-timeline').locator('li')).toHaveCount(2)
    await page.getByTestId('modal-close').click()

    // A resident can withdraw a request the office has not started.
    await page.locator(`[data-testid="request-card"][data-ref="${ref}"]`).getByTestId('open-request').click()
    await page.getByTestId('withdraw-request').click()
    await page.getByTestId('confirm-yes').click()
    await page.getByTestId('tab-requests-closed').click()
    await expect(page.locator(`[data-testid="request-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'rejected',
    )
  })
})

test.describe('facilities', () => {
  test('books a facility that the office approves, raising the fee invoice', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'facilities')

    // Step 1: the function room, which carries a fee.
    await page.getByTestId('facility-fn').click()
    await expect(page.getByTestId('booking-slots')).toBeVisible()

    // Step 2: the first day and slot still free.
    await page.locator('[data-testid^="day-"]:not([disabled])').first().click()
    await page.locator('[data-testid^="slot-"]:not([disabled])').first().click()
    await page.getByTestId('wizard-next').click()

    // Step 3: review and confirm.
    await expect(page.getByTestId('booking-review')).toBeVisible()
    await expect(page.getByTestId('review-fee')).toContainText('฿')
    await page.getByTestId('bk-guests').fill('20')
    await page.getByTestId('bk-note').fill('Family dinner.')

    // The unit already holds seeded bookings, so identify the new one by
    // which reference appeared rather than by its position in the list.
    const refsBefore = await page
      .locator('[data-testid="booking-card"]')
      .evaluateAll((cards) => cards.map((c) => c.dataset.ref))
    await page.getByTestId('bk-submit').click()
    await page.getByTestId('tab-facilities-all').click()
    const refsAfter = await page
      .locator('[data-testid="booking-card"]')
      .evaluateAll((cards) => cards.map((c) => c.dataset.ref))
    const ref = refsAfter.find((r) => !refsBefore.includes(r))
    expect(ref).toBeTruthy()
    await expect(page.locator(`[data-testid="booking-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'pending',
    )

    await switchTo(page, 'juristic')
    await go(page, 'abookings')
    const queued = page.locator(`[data-testid="abooking-card"][data-ref="${ref}"]`)
    await queued.getByTestId('approve-booking').click()
    // Approving moves it out of the "awaiting approval" tab.
    await page.getByTestId('tab-abookings-all').click()
    await expect(queued).toHaveAttribute('data-status', 'approved')

    // Approving a chargeable booking bills the fee to the unit.
    await switchTo(page, 'resident')
    await go(page, 'facilities')
    const mine = page.locator(`[data-testid="booking-card"][data-ref="${ref}"]`)
    await expect(mine).toHaveAttribute('data-status', 'approved')
    await mine.getByTestId('open-booking').click()
    await expect(page.getByTestId('booking-fee-note')).toBeVisible()
  })

  test('the office can decline a booking with a reason', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'abookings')

    const pending = page.locator('[data-testid="abooking-card"][data-status="pending"]').first()
    const ref = await pending.getAttribute('data-ref')
    await pending.getByTestId('decline-booking').click()
    await page.getByTestId('reason-text').fill('The room is reserved for the general meeting.')
    await page.getByTestId('reason-submit').click()

    await page.getByTestId('tab-abookings-all').click()
    await expect(page.locator(`[data-testid="abooking-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'rejected',
    )
  })

  test('a resident can cancel their own booking', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'facilities')

    const card = page.locator('[data-testid="booking-card"][data-status="approved"]').first()
    const ref = await card.getAttribute('data-ref')
    await card.getByTestId('open-booking').click()
    await page.getByTestId('cancel-booking').click()
    await page.getByTestId('confirm-yes').click()

    await page.getByTestId('tab-facilities-all').click()
    await expect(page.locator(`[data-testid="booking-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'cancelled',
    )
  })

  test('a taken slot cannot be booked twice', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'facilities')

    await page.getByTestId('facility-fn').click()
    await page.locator('[data-testid^="day-"]:not([disabled])').first().click()
    const slot = page.locator('[data-testid^="slot-"]:not([disabled])').first()
    const slotId = await slot.getAttribute('data-testid')
    await slot.click()
    await page.getByTestId('wizard-next').click()
    await page.getByTestId('bk-submit').click()

    // The same slot is now held, so the picker offers it disabled.
    await page.getByTestId('facility-fn').click()
    await page.locator('[data-testid^="day-"]:not([disabled])').first().click()
    await expect(page.getByTestId(slotId)).toBeDisabled()
  })
})

test.describe('parcels, visitors and announcements', () => {
  test('logs a parcel at the desk that the resident then collects', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'aparcels')

    await page.getByTestId('log-parcel').click()
    await page.getByTestId('pc-unit').selectOption(UNIT)
    await page.getByTestId('pc-carrier').selectOption('Flash Express')
    await page.getByTestId('pc-type').selectOption('box')
    await page.getByTestId('pc-shelf').fill('C-12')
    await page.getByTestId('pc-submit').click()

    const logged = page.locator('[data-testid="aparcel-row"][data-status="waiting"]').first()
    const ref = await logged.getAttribute('data-ref')

    await switchTo(page, 'resident')
    await go(page, 'parcels')
    const card = page.locator(`[data-testid="parcel-card"][data-ref="${ref}"]`)
    await expect(card).toHaveAttribute('data-status', 'waiting')

    await card.getByTestId('pick-parcel').click()
    await page.getByTestId('confirm-yes').click()
    await page.getByTestId('tab-parcels-picked').click()
    await expect(page.locator(`[data-testid="parcel-card"][data-ref="${ref}"]`)).toHaveAttribute(
      'data-status',
      'picked',
    )
  })

  test('issues a visitor pass that the gate checks in and out', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'visitors')

    await page.getByTestId('new-visitor').click()
    await page.getByTestId('vis-name').fill('Ananda Wong')
    await page.getByTestId('vis-phone').fill('089 222 3344')
    await page.getByTestId('vis-purpose').selectOption('guest')
    await page.getByTestId('vis-plate').fill('7กท 2244 กรุงเทพมหานคร')
    await page.getByTestId('vis-persons').fill('2')
    await page.getByTestId('vis-submit').click()

    // The pass, with its code and QR, opens straight away.
    await expect(page.getByTestId('qr')).toBeVisible()
    const code = (await page.getByTestId('pass-code').textContent()).trim()
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
    await page.getByTestId('modal-close').click()

    await switchTo(page, 'juristic')
    await go(page, 'avisitors')
    const row = page.locator(`[data-testid="avisitor-row"][data-code="${code}"]`)
    await expect(row).toHaveAttribute('data-status', 'expected')
    await row.getByTestId('check-in').click()
    await expect(row).toHaveAttribute('data-status', 'in')
    await row.getByTestId('check-out').click()
    await expect(row).toHaveAttribute('data-status', 'out')
  })

  test('publishes a bilingual announcement the resident reads in either language', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'anews')

    await page.getByTestId('compose-news').click()
    await page.getByTestId('nw-cat').selectOption('maintenance')
    await page.getByTestId('nw-pin').check()
    await page.getByTestId('nw-title-th').fill('ทดสอบล้างถังเก็บน้ำ')
    await page.getByTestId('nw-title-en').fill('Water tank cleaning test notice')
    await page.getByTestId('nw-body-th').fill('จะมีการล้างถังเก็บน้ำในวันเสาร์นี้')
    await page.getByTestId('nw-body-en').fill('The water tanks will be cleaned this Saturday.')
    await page.getByTestId('nw-publish').click()

    await expect(page.locator('[data-testid="anews-card"]').first()).toContainText('Water tank cleaning test notice')

    await switchTo(page, 'resident')
    await go(page, 'news')

    // Pinned, so it leads the list, and it is unread.
    const card = page.locator('[data-testid="news-card"]').first()
    await expect(card).toHaveAttribute('data-unread', 'true')
    await expect(card).toContainText('Water tank cleaning test notice')

    // The same record, read in the other language.
    await page.getByTestId('lang-th').click()
    await expect(page.locator('[data-testid="news-card"]').first()).toContainText('ทดสอบล้างถังเก็บน้ำ')

    await page.locator('[data-testid="news-card"]').first().getByTestId('open-news').click()
    await expect(page.getByTestId('modal-body')).toContainText('จะมีการล้างถังเก็บน้ำ')
    await page.getByTestId('modal-close').click()
    await expect(page.locator('[data-testid="news-card"]').first()).toHaveAttribute('data-unread', 'false')
  })

  test('marks every announcement read at once', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'news')

    await expect(page.locator('[data-testid="news-card"][data-unread="true"]')).not.toHaveCount(0)
    await page.getByTestId('mark-all-read').click()
    await expect(page.locator('[data-testid="news-card"][data-unread="true"]')).toHaveCount(0)
    await expect(page.locator('body')).toHaveAttribute('data-unread-news', '0')
  })

  test('lists and filters the document library', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'docs')

    const all = await page.locator('[data-testid="doc-row"]').count()
    expect(all).toBeGreaterThan(0)

    await page.getByTestId('doc-search').fill('proxy')
    await expect(page.locator('[data-testid="doc-row"]')).toHaveCount(1)

    // The search reads both languages of every title.
    await page.getByTestId('doc-search').fill('งบการเงิน')
    await expect(page.locator('[data-testid="doc-row"]')).toHaveCount(1)

    await page.getByTestId('doc-search').fill('')
    await expect(page.locator('[data-testid="doc-row"]')).toHaveCount(all)
  })
})

test.describe('resolutions and voting', () => {
  test('a unit in arrears must settle up before it can vote', async ({ page }) => {
    await fresh(page)
    await asResident(page)
    await go(page, 'vote')

    // The regulations bar a unit in arrears, so the ballot is withheld.
    await expect(page.getByTestId('vote-blocked')).toBeVisible()
    await expect(page.getByTestId('ballot')).toHaveCount(0)

    await page.getByTestId('vote-go-pay').click()
    await expect(page.locator('body')).toHaveAttribute('data-view', 'bills')

    const overdue = page.locator('[data-testid="bill-row"][data-status="overdue"]').first()
    await overdue.getByTestId('pay-invoice').click()
    await page.getByTestId('pay-method-promptpay').click()
    await page.getByTestId('pay-confirm').click()
    await expect(page.locator('body')).toHaveAttribute('data-arrears', 'false')

    await go(page, 'vote')
    await expect(page.getByTestId('vote-blocked')).toHaveCount(0)
    await expect(page.getByTestId('ballot')).toBeVisible()
  })

  test('casts a vote weighted by the ownership ratio', async ({ page }) => {
    await fresh(page)
    await asResident(page)

    // Clear the arrears first, since a unit in arrears may not vote.
    await go(page, 'bills')
    await page.getByTestId('pay-all').click()
    await page.getByTestId('pay-method-promptpay').click()
    await page.getByTestId('pay-confirm').click()

    await go(page, 'vote')
    const poll = page.locator('[data-testid="poll-card"][data-status="open"]').first()
    await expect(poll.getByTestId('my-vote')).toContainText(/not voted|ยังไม่ได้ลงคะแนน/i)

    const before = await poll.getByTestId('poll-turnout').textContent()
    await poll.getByTestId('ballot-o2').check()
    await poll.getByTestId('cast-vote').click()
    await expect(page.getByTestId('vote-choice')).toBeVisible()
    await page.getByTestId('vote-submit').click()

    // The tally moves by this unit's share, not by one unit in n.
    await expect(poll.getByTestId('poll-turnout')).not.toHaveText(before)
    await expect(poll.getByTestId('my-vote')).not.toContainText(/not voted|ยังไม่ได้ลงคะแนน/i)
    await expect(poll.locator('[data-testid="tally-row"][data-option="o2"]')).toBeVisible()
  })

  test('the office opens a bilingual resolution and closes the voting', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'avote')

    await page.getByTestId('compose-poll').click()
    await page.getByTestId('pl-q-th').fill('เห็นชอบให้ติดตั้งกล้องวงจรปิดเพิ่ม 12 จุด')
    await page.getByTestId('pl-q-en').fill('Install 12 additional CCTV cameras')
    await page.getByTestId('pl-opt-th-1').fill('เห็นชอบ')
    await page.getByTestId('pl-opt-en-1').fill('Approve')

    // Two options are the minimum for a resolution.
    await page.getByTestId('pl-submit').click()
    await expect(page.getByTestId('modal-body')).toBeVisible()

    await page.getByTestId('pl-opt-th-2').fill('ไม่เห็นชอบ')
    await page.getByTestId('pl-opt-en-2').fill('Reject')
    await page.getByTestId('pl-submit').click()

    const created = page.locator('[data-testid="apoll-card"]').first()
    await expect(created).toHaveAttribute('data-status', 'open')
    await expect(created).toContainText('ติดตั้งกล้องวงจรปิด')
    const pollId = await created.getAttribute('data-poll')

    await created.getByTestId('close-poll').click()
    await page.getByTestId('confirm-yes').click()
    // Closing re-sorts the list, so find it by id rather than by position.
    await expect(page.locator(`[data-testid="apoll-card"][data-poll="${pollId}"]`)).toHaveAttribute(
      'data-status',
      'closed',
    )
  })
})

test.describe('management overview', () => {
  test('the queues on the dashboard link to the work', async ({ page }) => {
    await fresh(page)
    await asOffice(page)

    await expect(page.getByTestId('kpi-collection')).toBeVisible()
    await expect(page.getByTestId('kpi-outstanding-value')).toContainText('฿')
    await expect(page.getByTestId('office-queues')).toBeVisible()

    await page.getByTestId('queue-arequests').click()
    await expect(page.locator('body')).toHaveAttribute('data-view', 'arequests')
  })

  test('searches the unit register and opens a unit', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'aunits')

    const all = await page.locator('[data-testid="unit-row"]').count()
    expect(all).toBe(14)

    await page.getByTestId('unit-search').fill(UNIT)
    await expect(page.locator('[data-testid="unit-row"]')).toHaveCount(1)

    await page.getByTestId('open-unit').click()
    await expect(page.getByTestId('unit-balance')).toContainText('฿')
    await page.getByTestId('modal-close').click()

    await page.getByTestId('unit-search').fill('')
    await page.getByTestId('unit-arrears-only').check()
    const arrears = await page.locator('[data-testid="unit-row"]').count()
    expect(arrears).toBeGreaterThan(0)
    expect(arrears).toBeLessThan(all)
  })

  test('reports respond to the billing period picked', async ({ page }) => {
    await fresh(page)
    await asOffice(page)
    await go(page, 'areports')

    await expect(page.getByTestId('rep-income-value')).toContainText('฿')
    await expect(page.getByTestId('rep-expense-value')).toContainText('฿')
    await expect(page.getByTestId('aging-chart')).toBeVisible()

    const first = await page.getByTestId('rep-collection-value').textContent()
    const options = await page.getByTestId('report-period').locator('option').all()
    await page.getByTestId('report-period').selectOption(await options[2].getAttribute('value'))
    await expect(page.getByTestId('rep-collection-value')).not.toHaveText(first)
  })
})

test('resets back to the seeded demo data', async ({ page }) => {
  await fresh(page)
  await asResident(page)
  await go(page, 'bills')

  await page.getByTestId('pay-all').click()
  await page.getByTestId('pay-method-promptpay').click()
  await page.getByTestId('pay-confirm').click()
  await expect(page.locator('body')).toHaveAttribute('data-outstanding', '0.00')

  await page.getByTestId('reset-demo').click()
  await page.getByTestId('confirm-yes').click()

  await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
  await asResident(page)
  await expect(page.locator('body')).toHaveAttribute('data-arrears', 'true')
})
