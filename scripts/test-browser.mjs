import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserTest() {
  console.log('--- STARTING EMBER OUTPOST BROWSER QA TEST (FULL SUITE) ---');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[CONSOLE ${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.toString()}`);
  });

  console.log('1. Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  console.log('2. Waiting for Phaser canvas & BootScene transition...');
  await page.waitForSelector('canvas', { timeout: 10000 });
  
  // Wait 3.5s for loading bar to complete and OutpostScene to render
  await new Promise(r => setTimeout(r, 3500));

  // Initial World Screenshot
  const initialPath = path.join(SCREENSHOT_DIR, 'outpost_initial.png');
  await page.screenshot({ path: initialPath });
  console.log(`✓ Initial Outpost screenshot saved to: ${initialPath}`);

  // Test Movement: Walk East toward Production Hub
  console.log('3. Simulating WASD walking movement (Right/Down)...');
  await page.keyboard.down('KeyD');
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.up('KeyD');
  await new Promise(r => setTimeout(r, 200));

  // Walking Screenshot
  const walkingPath = path.join(SCREENSHOT_DIR, 'outpost_walking.png');
  await page.screenshot({ path: walkingPath });
  console.log(`✓ Movement screenshot saved to: ${walkingPath}`);

  // Test Interaction: Press 'E' near building
  console.log('4. Simulating Contextual Interaction (E Key)...');
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 600));

  const modalPath = path.join(SCREENSHOT_DIR, 'outpost_modal.png');
  await page.screenshot({ path: modalPath });
  console.log(`✓ Interaction modal screenshot saved to: ${modalPath}`);

  // Close modal via Escape
  console.log('5. Closing modal via Escape key...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Test Settings: Click settings button [⚙] in top right (around x: 1240, y: 20)
  console.log('6. Opening System Settings...');
  await page.mouse.click(1240, 20);
  await new Promise(r => setTimeout(r, 600));

  const settingsPath = path.join(SCREENSHOT_DIR, 'outpost_settings.png');
  await page.screenshot({ path: settingsPath });
  console.log(`✓ Settings screenshot saved to: ${settingsPath}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Test Mobile Viewport (iPhone SE / Standard Mobile: 375 x 667)
  console.log('7. Testing Mobile Responsive Viewport (375x667)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500));

  const mobilePath = path.join(SCREENSHOT_DIR, 'outpost_mobile.png');
  await mobilePage.screenshot({ path: mobilePath });
  console.log(`✓ Mobile viewport screenshot saved to: ${mobilePath}`);
  await mobilePage.close();

  await browser.close();

  console.log('\n--- BROWSER TEST RESULTS ---');
  console.log(`Total Console Messages: ${consoleLogs.length}`);
  console.log(`Total Page Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.error('Errors encountered:');
    errors.forEach(e => console.error('  ', e));
    process.exit(1);
  } else {
    console.log('✓ PASS: All browser test assertions and screenshots completed with zero errors!');
  }
}

runBrowserTest().catch(err => {
  console.error('Fatal Test Script Error:', err);
  process.exit(1);
});
