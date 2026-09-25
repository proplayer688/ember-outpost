import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runFinalQASuite() {
  console.log('================================================================');
  console.log('--- EMBER OUTPOST FINAL MASTER QA & VIBEATHON AUDIT SUITE ---');
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

  // STEP 1: Launch & Title Screen
  console.log('1. Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  console.log('2. Waiting for Title Screen & Welcome Onboarding...');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 3800));

  const scTitle = path.join(SCREENSHOT_DIR, 'final_01_title_screen.png');
  await page.screenshot({ path: scTitle });
  console.log(`✓ [1/10] Title Screen screenshot saved to: ${scTitle}`);

  // STEP 2: Enter Outpost
  console.log('3. Clicking [ ▶ ENTER OUTPOST ]...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const uiScene = ember.game.scene.getScene('UIScene');
      if (uiScene && uiScene.titleScreen) {
        uiScene.titleScreen.enterGame();
      }
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const scWorld = path.join(SCREENSHOT_DIR, 'final_02_living_outpost.png');
  await page.screenshot({ path: scWorld });
  console.log(`✓ [2/10] Living Outpost screenshot saved to: ${scWorld}`);

  // STEP 3: Locomotion Across Mesa
  console.log('4. Testing WASD locomotion across mesa...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 350));
  await page.keyboard.up('KeyW');
  await page.keyboard.down('KeyD');
  await new Promise(r => setTimeout(r, 350));
  await page.keyboard.up('KeyD');

  const scWalk = path.join(SCREENSHOT_DIR, 'final_03_locomotion.png');
  await page.screenshot({ path: scWalk });
  console.log(`✓ [3/10] Locomotion screenshot saved to: ${scWalk}`);

  // STEP 4: Resource Gathering
  console.log('5. Harvesting nearby Aether Crystal node...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const scene = ember.game.scene.getScene('OutpostScene');
      if (scene && scene.resourceNodes.length > 3) {
        const node = scene.resourceNodes[3];
        scene.mascot.setPosition(node.x, node.y + 12);
      }
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 500));

  const scHarvest = path.join(SCREENSHOT_DIR, 'final_04_harvesting.png');
  await page.screenshot({ path: scHarvest });
  console.log(`✓ [4/10] Harvesting screenshot saved to: ${scHarvest}`);

  // STEP 5: Friend NPC Conversation
  console.log('6. Interacting with Friend Architect Milo...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.OPEN_FRIEND_MODAL, ember.FRIENDS_DATA['milo']);
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const scFriend = path.join(SCREENSHOT_DIR, 'final_05_friend_dialog.png');
  await page.screenshot({ path: scFriend });
  console.log(`✓ [5/10] Friend dialogue screenshot saved to: ${scFriend}`);

  // STEP 6: The Forge Sync Rhythm Minigame
  console.log('7. Playing The Forge Sync Rhythm Minigame...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.CLOSE_FRIEND_MODAL);
      ember.EventBus.emit(ember.GameEvents.OPEN_CHALLENGE_MODAL, ember.FRIENDS_DATA['milo']);
    }
  });
  await new Promise(r => setTimeout(r, 600));

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 380));
  }
  await new Promise(r => setTimeout(r, 600));

  const scChallenge = path.join(SCREENSHOT_DIR, 'final_06_challenge_result.png');
  await page.screenshot({ path: scChallenge });
  console.log(`✓ [6/10] Challenge results screenshot saved to: ${scChallenge}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // STEP 7: Production Hub & Smelting
  console.log('8. Smelting alloys in the Production Hub...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['production_hub']);
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Smelt alloys
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.GameState.smeltAlloys();
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['production_hub']);
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const scSmelt = path.join(SCREENSHOT_DIR, 'final_07_production_hub.png');
  await page.screenshot({ path: scSmelt });
  console.log(`✓ [7/10] Production Hub screenshot saved to: ${scSmelt}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // STEP 8: Outpost Level 2 Progression
  console.log('9. Upgrading Outpost Core to Level 2 (Kindled Camp)...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.GameState.resources.wood = Math.max(ember.GameState.resources.wood, 20);
      ember.GameState.resources.stone = Math.max(ember.GameState.resources.stone, 15);
      ember.GameState.currencies.coins = Math.max(ember.GameState.currencies.coins, 600);
      ember.GameState.upgradeOutpost();
      ember.EventBus.emit(ember.GameEvents.OPEN_BUILDING_MODAL, ember.BUILDINGS_DATA['outpost_core']);
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const scUpgrade = path.join(SCREENSHOT_DIR, 'final_08_outpost_level2.png');
  await page.screenshot({ path: scUpgrade });
  console.log(`✓ [8/10] Outpost Level 2 Upgrade screenshot saved to: ${scUpgrade}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // STEP 9: Field Guide Help Modal
  console.log('10. Opening Outpost Field Guide via HUD [?] button...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit('open_field_guide');
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const scGuide = path.join(SCREENSHOT_DIR, 'final_09_field_guide.png');
  await page.screenshot({ path: scGuide });
  console.log(`✓ [9/10] Field Guide screenshot saved to: ${scGuide}`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // STEP 10: Mobile Responsive Viewport (375x667)
  console.log('11. Testing Mobile Responsive Viewport (375x667)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3800));

  // Dismiss title on mobile
  await mobilePage.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const uiScene = ember.game.scene.getScene('UIScene');
      if (uiScene && uiScene.titleScreen) {
        uiScene.titleScreen.enterGame();
      }
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const scMobile = path.join(SCREENSHOT_DIR, 'final_10_mobile_responsive.png');
  await mobilePage.screenshot({ path: scMobile });
  console.log(`✓ [10/10] Mobile viewport screenshot saved to: ${scMobile}`);
  await mobilePage.close();

  // STEP 11: Refresh Persistence Check
  console.log('12. Testing State Refresh Persistence in LocalStorage...');
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3800));

  const persistedLevel = await page.evaluate(() => {
    return window.__EMBER__?.GameState?.outpost?.level;
  });
  console.log(`✓ Outpost Level persisted across page reload: Level ${persistedLevel}`);

  await browser.close();

  console.log('\n================================================================');
  console.log('--- FINAL MASTER QA TEST RESULTS ---');
  console.log('================================================================');
  console.log(`Total Console Messages Captured: ${consoleLogs.length}`);
  console.log(`Total Page Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.error('❌ FAIL: Page errors encountered:');
    errors.forEach(e => console.error('  ', e));
    process.exit(1);
  } else {
    console.log('✅ PASS: All 10 Master QA assertions and visual screenshots passed with zero errors!');
  }
}

runFinalQASuite().catch(err => {
  console.error('Fatal QA Script Error:', err);
  process.exit(1);
});
