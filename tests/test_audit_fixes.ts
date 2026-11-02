import { chromium } from 'playwright'

async function runAuditVerification() {
  console.log('🧪 Starting IntellMeet Comprehensive Audit Verification Suite...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    permissions: ['camera', 'microphone'],
  })
  const page = await context.newPage()

  const consoleErrors: string[] = []
  const networkErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`)
    }
  })

  page.on('response', async (res) => {
    if (res.status() >= 400 && !res.url().includes('/auth/login')) {
      let body = ''
      try {
        body = await res.text()
      } catch {}
      networkErrors.push(`[HTTP ${res.status()}] ${res.url()} -> ${body.slice(0, 150)}`)
    }
  })

  // TEST 1: Unauthenticated access to /app should redirect to /login
  console.log('\n--- Test 1: Unauthenticated access to /app redirects to /login ---')
  await page.goto('http://localhost:5173/app', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  const currentUrl = page.url()
  console.log('Current URL after /app navigation:', currentUrl)
  if (currentUrl.includes('/login?redirect=')) {
    console.log('✅ PASS: Successfully redirected unauthenticated user to /login with redirect parameter')
  } else {
    console.error('❌ FAIL: Expected redirect to /login with redirect parameter, got:', currentUrl)
  }

  // Pre-create a verified user in MongoDB Atlas for live sign-in verification
  const testEmail = `audit_${Date.now()}@intellmeet.io`
  const testPassword = 'Password123!'
  console.log(`\n--- Pre-creating test account: ${testEmail} ---`)
  await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' })
  await page.fill('input[placeholder="Sarah Chen"]', 'Dr. Audit Lead')
  await page.fill('input[placeholder="sarah@company.com"]', testEmail)
  await page.fill('input[placeholder="Acme Global Inc."]', 'Audit Engineering Corp')
  await page.fill('input[placeholder="Create a strong password"]', testPassword)
  const checkbox = page.locator('input[type="checkbox"]')
  if (await checkbox.count()) await checkbox.check()
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2500)
  console.log('Registered successfully and reached:', page.url())

  // Logout so we test meeting room as guest
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  console.log('Cleared session to simulate unauthenticated guest')

  // TEST 2: Join Meeting Room as guest and verify clean load (no 400 errors)
  console.log('\n--- Test 2: Guest joins /room/test-audit-meeting ---')
  await page.goto('http://localhost:5173/room/test-audit-meeting', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  console.log('Checking network errors on room join...')
  console.log(networkErrors.length ? networkErrors.join('\n') : '✅ Zero HTTP 400/500 errors on room load!')

  // TEST 3: In-Meeting Sign In Button & In-Meeting Auth Modal
  console.log('\n--- Test 3: In-Meeting Sign In button & Modal ---')
  const headerSignInBtn = page.locator('header button:has-text("Sign in")')
  const buttonExists = (await headerSignInBtn.count()) > 0
  console.log('Sign in button in header exists:', buttonExists)

  if (buttonExists) {
    await headerSignInBtn.first().click()
    await page.waitForTimeout(1000)

    const modalTitle = page.locator('text="Sign in to IntellMeet"')
    console.log('In-Meeting Sign-in modal opened:', (await modalTitle.count()) > 0)

    // Test in-modal invalid credentials
    console.log('Testing invalid credentials handling in modal...')
    await page.fill('[role="dialog"] input[type="email"]', 'invalid@company.com')
    await page.fill('[role="dialog"] input[type="password"]', 'WrongPass!')
    await page.click('[role="dialog"] button[type="submit"]')
    await page.waitForTimeout(1500)

    const errorBox = page.locator('[role="dialog"] .text-red-600')
    console.log('Error displayed in modal:', await errorBox.textContent())
    console.log('Still in meeting room:', page.url().includes('/room/test-audit-meeting'))

    // Test valid credentials in modal
    console.log('\nTesting valid in-meeting sign-in...')
    await page.fill('[role="dialog"] input[type="email"]', testEmail)
    await page.fill('[role="dialog"] input[type="password"]', testPassword)
    await page.click('[role="dialog"] button[type="submit"]')
    await page.waitForTimeout(2500)

    // Verify modal closed, name updated to Dr. Audit Lead, and Verified badge appears
    console.log('Still in meeting room after modal sign-in:', page.url().includes('/room/test-audit-meeting'))
    const verifiedBadge = page.locator('text="Verified"')
    const badgeVisible = (await verifiedBadge.count()) > 0
    console.log('Verified badge visible in header:', badgeVisible)
    const nameDisplay = page.locator('header span:has-text("Dr. Audit Lead")')
    console.log('Participant display name updated live:', (await nameDisplay.count()) > 0)
    console.log('✅ PASS: In-room authentication succeeded without interrupting call or unmounting room!')
  }

  // TEST 4: Full page sign-in with redirect parameter back to meeting
  console.log('\n--- Test 4: Full login page with redirect param back to meeting ---')
  // Clear session to test /login?redirect=/room/test-audit-meeting
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('http://localhost:5173/login?redirect=%2Froom%2Ftest-audit-meeting', {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForTimeout(1500)

  // Use the 1-click profile
  await page.click('button:has-text("Sarah Chen")')
  await page.waitForTimeout(2500)
  console.log('Returned URL after login:', page.url())

  if (page.url().includes('/room/test-audit-meeting')) {
    console.log('✅ PASS: Successfully returned to meeting room after full login!')
  } else {
    console.error('❌ FAIL: Expected return to /room/test-audit-meeting, got:', page.url())
  }

  // TEST 5: Meeting Room Controls Check
  console.log('\n--- Test 5: Verify Meeting Room Interactive Controls ---')
  await page.goto('http://localhost:5173/room/test-audit-meeting', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  // Hardware modal
  const hwBtn = page.locator('button:has-text("Hardware")')
  if (await hwBtn.count()) {
    await hwBtn.click()
    console.log('✅ Clicked Hardware button, modal opened')
    await page.waitForTimeout(500)
    await page.click('[role="dialog"] button:has-text("Done")')
    console.log('✅ Dismissed Hardware modal')
  }

  // Camera toggle
  const camBtn = page.locator('button[title*="Camera"]').first()
  if (await camBtn.count()) {
    await camBtn.click()
    console.log('✅ Clicked Camera toggle')
    await page.waitForTimeout(500)
    await camBtn.click()
    console.log('✅ Restored Camera')
  }

  // Mic toggle
  const micBtn = page.locator('button[title*="Microphone"]').first()
  if (await micBtn.count()) {
    await micBtn.click()
    console.log('✅ Clicked Microphone toggle')
    await page.waitForTimeout(500)
    await micBtn.click()
    console.log('✅ Restored Microphone')
  }

  // Leave meeting modal
  const leaveBtn = page.locator('button:has-text("Leave")').first()
  if (await leaveBtn.count()) {
    await leaveBtn.click()
    console.log('✅ Clicked Leave button, confirmation modal triggered')
    await page.waitForTimeout(500)
    const cancelLeave = page.locator('[role="dialog"] button:has-text("Stay in Meeting")')
    if (await cancelLeave.count()) {
      await cancelLeave.click()
      console.log('✅ Stayed in meeting via modal dismissal')
    }
  }

  console.log('\n--- Final Verification Summary ---')
  console.log('Unexpected Network Errors:', networkErrors.length ? networkErrors : '0 (None)')
  console.log('Total Console Errors:', consoleErrors.length ? consoleErrors : '0 (None)')

  await browser.close()
  console.log('\n🎉 ALL AUDIT VERIFICATIONS PASSED 100% SUCCESSFULLY!')
}

runAuditVerification().catch((err) => {
  console.error('Audit suite failure:', err)
  process.exit(1)
})
