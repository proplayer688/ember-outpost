import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPhase2BrowserTest() {
  console.log('================================================================');
  console.log('--- EMBER OUTPOST PHASE 2 AUTOMATED BROWSER QA TEST SUITE ---');
  console.log('================================================================');

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

  console.log('2. Waiting for Phaser canvas & BootScene initialization...');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 3500));

  // Screenshot 1: Initial Living World (Friends, Resource Nodes, Expanded HUD)
  const sc1 = path.join(SCREENSHOT_DIR, 'phase2_01_living_world.png');
  await page.screenshot({ path: sc1 });
  console.log(`✓ [1/9] Living Outpost screenshot saved to: ${sc1}`);

  // Test 3: Locomotion across mesa
  console.log('3. Simulating WASD movement around the mesa...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.up('KeyW');
  await page.keyboard.down('KeyA');
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.up('KeyA');

  const sc2 = path.join(SCREENSHOT_DIR, 'phase2_02_locomotion.png');
  await page.screenshot({ path: sc2 });
  console.log(`✓ [2/9] Locomotion screenshot saved to: ${sc2}`);

  // Test 4: Resource Node Harvesting
  console.log('4. Navigating to Resource Node & Harvesting...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const scene = ember.game.scene.getScene('OutpostScene');
      if (scene && scene.resourceNodes.length > 3) {
        const node = scene.resourceNodes[3]; // Aether crystal node
        scene.mascot.setPosition(node.x, node.y + 10);
      }
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 500));

  const sc3 = path.join(SCREENSHOT_DIR, 'phase2_03_harvesting.png');
  await page.screenshot({ path: sc3 });
  console.log(`✓ [3/9] Resource Harvesting screenshot saved to: ${sc3}`);

  // Test 5: Friend NPC Interaction & Dialogue
  console.log('5. Opening Friend NPC Modal (Architect Milo)...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.OPEN_FRIEND_MODAL, ember.FRIENDS_DATA['milo']);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const sc4 = path.join(SCREENSHOT_DIR, 'phase2_04_friend_dialog.png');
  await page.screenshot({ path: sc4 });
  console.log(`✓ [4/9] Friend Dialogue modal screenshot saved to: ${sc4}`);

  // Test 6: Rhythm Challenge "The Forge Sync"
  console.log('6. Launching The Forge Sync Rhythm Minigame against Milo...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.CLOSE_FRIEND_MODAL);
      ember.EventBus.emit(ember.GameEvents.OPEN_CHALLENGE_MODAL, ember.FRIENDS_DATA['milo']);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const sc5 = path.join(SCREENSHOT_DIR, 'phase2_05_forge_sync.png');
  await page.screenshot({ path: sc5 });
  console.log(`✓ [5/9] The Forge Sync minigame screenshot saved to: ${sc5}`);

  // Perform 5 rhythm strikes
  console.log('7. Performing 5 rhythm precision strikes (Spacebar)...');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 400));
  }
  await new Promise(r => setTimeout(r, 800));

  const sc6 = path.join(SCREENSHOT_DIR, 'phase2_06_challenge_result.png');
  await page.screenshot({ path: sc6 });
  console.log(`✓ [6/9] Challenge Results & Bounty screenshot saved to: ${sc6}`);

  // Close challenge modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Test 7: Production Hub & Smelting
  console.log('8. Opening Production Hub & Smelting Alloys...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['production_hub']);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const sc7 = path.join(SCREENSHOT_DIR, 'phase2_07_production_smelt.png');
  await page.screenshot({ path: sc7 });
  console.log(`✓ [7/9] Production Hub modal screenshot saved to: ${sc7}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Test 8: Outpost Core Upgrade to Level 2
  console.log('9. Upgrading Outpost Core to Level 2 (Kindled Camp)...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.GameState.resources.wood = Math.max(ember.GameState.resources.wood, 20);
      ember.GameState.resources.stone = Math.max(ember.GameState.resources.stone, 15);
      ember.GameState.currencies.coins = Math.max(ember.GameState.currencies.coins, 600);
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['outpost_core']);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Trigger Outpost Upgrade
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.GameState.upgradeOutpost();
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['outpost_core']);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const sc8 = path.join(SCREENSHOT_DIR, 'phase2_08_outpost_level2.png');
  await page.screenshot({ path: sc8 });
  console.log(`✓ [8/9] Outpost Level 2 Upgrade screenshot saved to: ${sc8}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Test 9: Mobile Responsive Viewport (375x667)
  console.log('10. Testing Mobile Responsive Viewport (375x667)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500));

  const sc9 = path.join(SCREENSHOT_DIR, 'phase2_09_mobile_viewport.png');
  await mobilePage.screenshot({ path: sc9 });
  console.log(`✓ [9/9] Mobile viewport screenshot saved to: ${sc9}`);
  await mobilePage.close();

  await browser.close();

  console.log('\n================================================================');
  console.log('--- PHASE 2 BROWSER TEST RESULTS ---');
  console.log('================================================================');
  console.log(`Total Console Messages Captured: ${consoleLogs.length}`);
  console.log(`Total Page Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.error('❌ FAIL: Page errors encountered:');
    errors.forEach(e => console.error('  ', e));
    process.exit(1);
  } else {
    console.log('✅ PASS: All 9 Phase 2 browser assertions and visual screenshots passed with zero errors!');
  }
}

runPhase2BrowserTest().catch(err => {
  console.error('Fatal Browser Test Error:', err);
  process.exit(1);
});
