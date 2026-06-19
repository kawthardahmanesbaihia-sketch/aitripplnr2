import { chromium } from 'playwright'

const COUNTRY = {
  name: "France",
  code: "FR",
  matchPercentage: 92,
  image: "",
  tags: ["culture", "food"],
  climate: "temperate",
  vibe: "cosmopolitan",
  city: "Paris",
  activities: ["Culture", "Food"],
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const logs = []
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('[RUNTIME:')) {
      logs.push(`[Browser][${msg.type()}] ${text}`)
    }
  })
  page.on('pageerror', err => {
    logs.push(`[Browser][pageerror] ${err.message}`)
  })

  // Set sessionStorage before navigation
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
  await page.evaluate((country) => {
    sessionStorage.setItem('selectedCountry', JSON.stringify(country))
    sessionStorage.setItem('selectedBudget', 'mid-range')
    sessionStorage.setItem('analysisResults', JSON.stringify({ countries: [country], summary: 'France travel analysis' }))
  }, COUNTRY)

  // Navigate to destination page
  console.log('[Script] Navigating to /destination/France ...')
  await page.goto('http://localhost:3000/destination/France', { waitUntil: 'networkidle', timeout: 90000 })

  // Wait a bit for async data fetching + setDestination to complete
  await page.waitForTimeout(5000)

  // Print logs so far (should include [RUNTIME:page] entries)
  console.log('[Script] === Logs after page load ===')
  logs.forEach(l => console.log(l))
  logs.length = 0

  // Click the Activities tab
  console.log('[Script] Clicking Activities tab...')
  const actTab = page.locator('button, [role="tab"]').filter({ hasText: /activities/i }).first()
  const tabFound = await actTab.count()
  if (tabFound > 0) {
    await actTab.click()
    await page.waitForTimeout(2000)
    console.log('[Script] === Logs after Activities tab click ===')
    logs.forEach(l => console.log(l))
  } else {
    console.log('[Script] Activities tab not found — trying text content scan')
    const allButtons = await page.locator('button').allTextContents()
    console.log('[Script] Buttons found:', JSON.stringify(allButtons.slice(0, 20)))
    logs.forEach(l => console.log(l))
  }

  await browser.close()
})()
