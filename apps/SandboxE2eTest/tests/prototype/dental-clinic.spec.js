import { expect, test } from '@playwright/test'

/**
 * Covers the dental clinic prototype's main patient flows end to end:
 * register, browse services, book with a dentist, manage the appointment, and
 * chat. Assertions read `data-testid` and `data-*` state rather than layout or
 * copy, which a design exploration is expected to churn.
 *
 * State lives in localStorage, so each test clears it and reloads to get the
 * seeded demo data back.
 */
const PROTOTYPE = '/prototypes/proto-dental-clinic.html'

const DEMO = { email: 'demo@brightsmile.test', password: 'demo1234' }

/** Fills the registration form. Fields not passed get a valid default. */
async function register(page, overrides = {}) {
  const patient = {
    first: 'Riley',
    last: 'Marsh',
    dob: '1988-11-02',
    email: `riley.${Date.now()}@example.com`,
    phone: '0433 221 100',
    password: 'brush1234',
    confirm: 'brush1234',
    ...overrides,
  }

  await page.getByTestId('reg-first').fill(patient.first)
  await page.getByTestId('reg-last').fill(patient.last)
  await page.getByTestId('reg-dob').fill(patient.dob)
  await page.getByTestId('reg-email').fill(patient.email)
  await page.getByTestId('reg-phone').fill(patient.phone)
  await page.getByTestId('reg-password').fill(patient.password)
  await page.getByTestId('reg-password2').fill(patient.confirm)
  await page.getByTestId('reg-consent').check()
  await page.getByTestId('register-submit').click()

  return patient
}

async function signInAsDemo(page) {
  await page.goto(`${PROTOTYPE}#/login`)
  await page.getByTestId('fill-demo').click()
  await page.getByTestId('login-submit').click()
  await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'true')
}

/** Walks steps 1–3 of the wizard, leaving the review step on screen. */
async function fillWizard(page, { service = 'svc-checkup' } = {}) {
  await page.locator(`[data-testid="service-option"][data-service="${service}"]`).click()
  await page.getByTestId('wizard-next').click()

  await page.getByTestId('dentist-option').first().click()
  await page.getByTestId('wizard-next').click()

  await page.getByTestId('date-strip').getByTestId('date-option').first().click()
  await page.getByTestId('slot-area').getByTestId('slot-option').first().click()
  await page.getByTestId('wizard-next').click()

  await expect(page.locator('[data-testid="booking-step"][data-step="4"]')).toHaveAttribute(
    'data-active',
    'true',
  )
}

test.beforeEach(async ({ page }) => {
  await page.goto(PROTOTYPE)
  // A previous test's patients and bookings must not leak into this one.
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-route', 'home')
})

test.describe('dental clinic prototype — page contract', () => {
  test('carries the heading, description and back link the index needs', async ({ page }) => {
    await expect(page).toHaveTitle('Dental Clinic')
    await expect(page.locator('h1')).toHaveText('Dental Clinic')

    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toContain('prototype')

    await expect(page.getByTestId('back-to-index')).toHaveAttribute('href', '/')
  })

  test('styles itself from the vendored Bootstrap, not a CDN', async ({ page }) => {
    const urls = await page.evaluate(() => [
      ...[...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')),
      ...[...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')),
    ])

    expect(urls.some((url) => url.startsWith('/vendor/bootstrap-5.3.3/'))).toBe(true)
    expect(urls.some((url) => /^https?:/.test(url))).toBe(false)

    // Bootstrap's JS has to be live, or the modals and toasts do nothing.
    expect(await page.evaluate(() => typeof window.bootstrap?.Modal)).toBe('function')
  })
})

test.describe('dental clinic prototype — browse services', () => {
  test('lists every treatment, then narrows it by search and category', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/services`)

    // Scoped to the services page: the home page carries its own service cards.
    const cards = page.getByTestId('service-grid').getByTestId('service-card')
    const total = await cards.count()
    expect(total).toBeGreaterThan(6)

    await page.getByTestId('service-search').fill('whiten')
    await expect(cards).toHaveCount(1)

    await page.getByTestId('service-search').fill('')
    await page.locator('[data-action="filter-service"][data-cat="Surgical"]').click()
    const surgical = await cards.count()
    expect(surgical).toBeGreaterThan(0)
    expect(surgical).toBeLessThan(total)

    await page.getByTestId('service-search').fill('no-such-treatment')
    await expect(page.getByTestId('service-empty')).toBeVisible()
  })

  test('a treatment detail opens and books straight into the wizard', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/services`)

    await page.locator('[data-testid="service-details"][data-id="svc-implant"]').click()
    await expect(page.getByTestId('service-modal-body')).toContainText('titanium')

    await page.getByTestId('service-modal-book').click()

    await expect(page.locator('body')).toHaveAttribute('data-route', 'book')
    // The treatment is already chosen, so the wizard opens on the dentist step.
    await expect(page.locator('[data-testid="booking-step"][data-step="2"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    await expect(
      page.locator('[data-testid="service-option"][data-service="svc-implant"]'),
    ).toHaveAttribute('data-selected', 'true')
  })
})

test.describe('dental clinic prototype — register a patient', () => {
  test('rejects an incomplete form and mismatched passwords', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/register`)

    await page.getByTestId('register-submit').click()
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')

    await register(page, { confirm: 'something-else' })
    await expect(page.getByTestId('reg-password2-feedback')).toContainText('do not match')
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
  })

  test('creates the record and signs the patient in', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/register`)

    const patient = await register(page)

    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'true')
    await expect(page.locator('body')).toHaveAttribute('data-patient', patient.email)
    await expect(page.getByTestId('patient-name')).toHaveText(patient.first)
  })

  test('refuses an email that is already registered', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/register`)
    await register(page, { email: DEMO.email })

    await expect(page.getByTestId('reg-email-feedback')).toContainText('already registered')
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
  })
})

test.describe('dental clinic prototype — book a schedule', () => {
  test('books a treatment with a dentist and lists it under appointments', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/book`)

    await fillWizard(page)

    await page.getByTestId('agree-policy').check()
    await page.getByTestId('wizard-next').click()

    await expect(page.locator('body')).toHaveAttribute('data-route', 'booked')
    const reference = await page.getByTestId('booking-reference').textContent()
    expect(reference).toMatch(/^BS-\d{4}$/)

    await page.goto(`${PROTOTYPE}#/appointments`)
    await expect(page.locator(`[data-testid="appt-card"][data-ref="${reference}"]`)).toBeVisible()
  })

  test('will not confirm until the cancellation policy is acknowledged', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/book`)

    await fillWizard(page)
    await page.getByTestId('wizard-next').click()

    await expect(page.locator('body')).toHaveAttribute('data-route', 'book')
  })

  test('holds the draft through sign-in when booking while signed out', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/book`)

    await fillWizard(page)
    await expect(page.getByTestId('book-patient-box')).toContainText('patient record')

    await page.getByTestId('agree-policy').check()
    await page.getByTestId('wizard-next').click()

    // Gated, not lost: sign in and the review step comes back with the slot.
    await expect(page.locator('body')).toHaveAttribute('data-route', 'login')
    await expect(page.getByTestId('login-prompt')).toBeVisible()

    await page.getByTestId('fill-demo').click()
    await page.getByTestId('login-submit').click()

    await expect(page.locator('body')).toHaveAttribute('data-route', 'book')
    await expect(page.locator('[data-testid="booking-step"][data-step="4"]')).toHaveAttribute(
      'data-active',
      'true',
    )

    await page.getByTestId('agree-policy').check()
    await page.getByTestId('wizard-next').click()
    await expect(page.getByTestId('booking-reference')).toBeVisible()
  })

  test('offers only slots that are free, and never a past one', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/book`)

    await page.getByTestId('service-option').first().click()
    await page.getByTestId('wizard-next').click()
    await page.getByTestId('dentist-option').first().click()
    await page.getByTestId('wizard-next').click()

    const firstDate = page.getByTestId('date-strip').getByTestId('date-option').first()
    const free = Number(await firstDate.getAttribute('data-free'))
    expect(free).toBeGreaterThan(0)

    await firstDate.click()
    await expect(page.getByTestId('slot-area').getByTestId('slot-option')).toHaveCount(free)
  })
})

test.describe('dental clinic prototype — manage appointments', () => {
  test('reschedules an upcoming appointment onto another free slot', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/appointments`)

    const card = page.getByTestId('appt-card').first()
    const before = {
      date: await card.getAttribute('data-date'),
      time: await card.getAttribute('data-time'),
    }

    await page.getByTestId('appt-reschedule').first().click()
    await page.getByTestId('reschedule-dates').getByTestId('date-option').nth(1).click()
    await page.getByTestId('reschedule-slots').getByTestId('slot-option').first().click()
    await page.getByTestId('reschedule-save').click()

    const after = page.getByTestId('appt-card').first()
    await expect(after).toHaveAttribute('data-status', 'upcoming')
    expect([
      await after.getAttribute('data-date'),
      await after.getAttribute('data-time'),
    ]).not.toEqual([before.date, before.time])
  })

  test('cancels an appointment and moves it to the cancelled tab', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/appointments`)

    const upcoming = Number(await page.locator('body').getAttribute('data-upcoming'))
    expect(upcoming).toBeGreaterThan(0)

    await page.getByTestId('appt-cancel').first().click()
    await page.getByTestId('cancel-reason').selectOption('Schedule conflict')
    await page.getByTestId('cancel-confirm').click()

    await expect(page.locator('body')).toHaveAttribute('data-upcoming', String(upcoming - 1))
    await expect(page.locator('body')).toHaveAttribute('data-cancelled', '1')
    await expect(page.locator('[data-testid="appt-card"][data-status="cancelled"]')).toBeVisible()

    await page.locator('[data-appt-tab="upcoming"]').click()
    await expect(page.getByTestId('appt-count-upcoming')).toHaveText(String(upcoming - 1))
  })

  test('keeps a past visit out of the upcoming list', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/appointments`)

    await expect(page.getByTestId('appt-count-past')).toHaveText('1')
    await page.locator('[data-appt-tab="past"]').click()
    await expect(page.locator('[data-testid="appt-card"][data-status="past"]')).toBeVisible()
  })
})

test.describe('dental clinic prototype — chat with a dentist', () => {
  test('sends a message and gets a reply from the dentist', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/chat`)

    const mine = page.locator('[data-testid="chat-message"][data-from="me"]')
    const theirs = page.locator('[data-testid="chat-message"][data-from="them"]')
    const repliesBefore = await theirs.count()

    await page.getByTestId('chat-input').fill('I have a bad toothache on the lower left.')
    await page.getByTestId('chat-send').click()

    await expect(mine.last()).toContainText('toothache')
    await expect(theirs).toHaveCount(repliesBefore + 1)
    // The reply is keyword-aware, not a canned acknowledgement.
    await expect(theirs.last()).toContainText(/salty water|swelling|emergency/i)
  })

  test('a quick reply asks about pricing and gets the price list', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/chat`)

    await page.getByTestId('chat-quick-reply').filter({ hasText: 'whitening cost' }).click()

    await expect(page.locator('[data-testid="chat-message"][data-from="them"]').last()).toContainText(
      '$449',
    )
  })

  test('switches between one conversation per dentist', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/chat`)

    const threads = page.getByTestId('chat-thread')
    expect(await threads.count()).toBeGreaterThan(1)

    const target = page.locator('[data-testid="chat-thread"][data-dentist="dr-patel"]')
    await target.click()

    await expect(target).toHaveAttribute('data-active', 'true')
    await expect(page.getByTestId('chat-header-name')).toContainText('Patel')
    // A fresh thread starts empty rather than showing another dentist's history.
    await expect(page.getByTestId('chat-message')).toHaveCount(0)
  })

  test('requires sign-in before messaging', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/chat`)

    await expect(page.locator('body')).toHaveAttribute('data-route', 'login')
    await expect(page.getByTestId('login-prompt')).toBeVisible()
  })
})

test.describe('dental clinic prototype — account', () => {
  test('rejects a wrong password', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/login`)

    await page.getByTestId('login-email').fill(DEMO.email)
    await page.getByTestId('login-password').fill('not-the-password')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toBeVisible()
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
  })

  test('saves a profile edit across a reload', async ({ page }) => {
    await signInAsDemo(page)
    await page.goto(`${PROTOTYPE}#/profile`)

    await page.getByTestId('profile-phone').fill('0400 111 222')
    await page.getByTestId('profile-save').click()

    await page.reload()
    await expect(page.getByTestId('profile-phone')).toHaveValue('0400 111 222')
  })

  test('signing out clears the session and gates the private pages', async ({ page }) => {
    await signInAsDemo(page)

    await page.getByTestId('auth-area').getByRole('button').click()
    await page.getByTestId('logout').click()

    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')

    await page.goto(`${PROTOTYPE}#/appointments`)
    await expect(page.locator('body')).toHaveAttribute('data-route', 'login')
  })

  test('resetting the demo data restores the seeded patient', async ({ page }) => {
    await page.goto(`${PROTOTYPE}#/register`)
    await register(page)
    await expect(page.locator('body')).toHaveAttribute('data-patients', '2')

    page.on('dialog', (dialog) => dialog.accept())
    await page.getByTestId('reset-demo').click()

    await expect(page.locator('body')).toHaveAttribute('data-patients', '1')
    await expect(page.locator('body')).toHaveAttribute('data-signed-in', 'false')
  })
})
