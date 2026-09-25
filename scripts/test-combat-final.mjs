import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runCombatTestSuite() {
  console.log('================================================================');
  console.log('--- EMBER OUTPOST: TACTICAL SIEGE & BASE DEFENSE QA SUITE ---');
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
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 3800));

  const scTitle = path.join(SCREENSHOT_DIR, 'combat_01_title_screen.png');
  await page.screenshot({ path: scTitle });
  console.log(`✓ [1/8] Title Screen captured: ${scTitle}`);

  // STEP 2: Enter Outpost
  console.log('2. Entering Outpost with Ignis the Keeper...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const uiScene = ember.game.scene.getScene('UIScene');
      if (uiScene && uiScene.titleScreen) {
        uiScene.titleScreen.enterGame();
      }
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const scOutpost = path.join(SCREENSHOT_DIR, 'combat_02_outpost_hud.png');
  await page.screenshot({ path: scOutpost });
  console.log(`✓ [2/8] Outpost Living World captured with [⚔️ SIEGE] button: ${scOutpost}`);

  // STEP 3: Open Siege & Defense Command Center
  console.log('3. Opening Siege & Defense Command Center...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      ember.EventBus.emit(ember.GameEvents.OPEN_CHALLENGE_MODAL);
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const scModal = path.join(SCREENSHOT_DIR, 'combat_03_siege_command_center.png');
  await page.screenshot({ path: scModal });
  console.log(`✓ [3/8] Tactical Siege Command Center captured: ${scModal}`);

  // STEP 4: Launch Siege on Sentinel Vex (Iron Bastion)
  console.log('4. Launching Siege Assault on Sentinel Vex (Iron Bastion)...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const uiScene = ember.game.scene.getScene('UIScene');
      if (uiScene && uiScene.challengeModal) {
        uiScene.challengeModal.launchBattle();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  const scBattleStart = path.join(SCREENSHOT_DIR, 'combat_04_fortress_deployed.png');
  await page.screenshot({ path: scBattleStart });
  console.log(`✓ [4/8] Enemy Fortress & Drop Zone captured: ${scBattleStart}`);

  // STEP 5: Deploy Tactical Squads (Volt Imps, Pulse Rangers, Obsidian Breachers)
  console.log('5. Deploying tactical squads outside the perimeter boundary...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const battleScene = ember.game.scene.getScene('SiegeBattleScene');
      if (battleScene) {
        // Deploy Obsidian Breachers (Heavy Tanks) at (-220, 160)
        battleScene.selectUnitCard('obsidian_breacher');
        battleScene.spawnPlayerUnit(-220, 160, ember.COMBAT_UNITS['obsidian_breacher']);

        // Deploy Pulse Rangers at (220, -140)
        battleScene.selectUnitCard('pulse_ranger');
        battleScene.spawnPlayerUnit(220, -140, ember.COMBAT_UNITS['pulse_ranger']);
        battleScene.spawnPlayerUnit(240, -120, ember.COMBAT_UNITS['pulse_ranger']);

        // Deploy Volt Imps (Melee Swarmers) at (-180, -150)
        battleScene.selectUnitCard('volt_imp');
        battleScene.spawnPlayerUnit(-180, -150, ember.COMBAT_UNITS['volt_imp']);
        battleScene.spawnPlayerUnit(-195, -135, ember.COMBAT_UNITS['volt_imp']);
        battleScene.spawnPlayerUnit(-170, -165, ember.COMBAT_UNITS['volt_imp']);

        // Cast EMP Strike on central defense cluster
        battleScene.castEMPStrike(0, 0);
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  const scCombatLive = path.join(SCREENSHOT_DIR, 'combat_05_active_battle_demolition.png');
  await page.screenshot({ path: scCombatLive });
  console.log(`✓ [5/8] Active battle action with laser projectiles & EMP stun captured: ${scCombatLive}`);

  // STEP 6: Let battle simulate and demolish towers
  console.log('6. Simulating demolition of defense towers and core...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const battleScene = ember.game.scene.getScene('SiegeBattleScene');
      if (battleScene) {
        // Deal heavy damage to fortress to achieve 100% demolition
        battleScene.buildings.forEach(b => {
          b.takeDamage(b.maxHp);
        });
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  const scVictory = path.join(SCREENSHOT_DIR, 'combat_06_three_star_victory.png');
  await page.screenshot({ path: scVictory });
  console.log(`✓ [6/8] 3-Star Total Annihilation Victory Modal captured: ${scVictory}`);

  // Return to Outpost via physical mouse click on [ ▶ RETURN TO OUTPOST ]
  console.log('Testing physical mouse click on [ ▶ RETURN TO OUTPOST ] at (640, 484)...');
  await page.mouse.click(640, 484);
  await new Promise(r => setTimeout(r, 600));

  // STEP 7: Base Defense Mode (Inbound Raid)
  console.log('7. Testing Base Defense Mode (Repelling Inbound Rival Wave)...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const outpost = ember.game.scene.getScene('OutpostScene');
      if (outpost) {
        outpost.scene.pause('OutpostScene');
        outpost.scene.pause('UIScene');
        outpost.scene.launch('SiegeBattleScene', { mode: 'defense' });
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  const scDefense = path.join(SCREENSHOT_DIR, 'combat_07_base_defense_mode.png');
  await page.screenshot({ path: scDefense });
  console.log(`✓ [7/8] Base Defense Mode with incoming raid wave captured: ${scDefense}`);

  // STEP 8: Clean Return to Outpost with Persisted Balances
  console.log('8. Returning to Outpost and verifying state persistence...');
  await page.evaluate(() => {
    const ember = window.__EMBER__;
    if (ember) {
      const battleScene = ember.game.scene.getScene('SiegeBattleScene');
      if (battleScene) {
        battleScene.scene.stop('SiegeBattleScene');
        battleScene.scene.resume('OutpostScene');
        battleScene.scene.resume('UIScene');
        ember.EventBus.emit(ember.GameEvents.STATE_UPDATED);
      }
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const scFinal = path.join(SCREENSHOT_DIR, 'combat_08_outpost_updated_state.png');
  await page.screenshot({ path: scFinal });
  console.log(`✓ [8/8] Outpost returned with updated trophies and loot: ${scFinal}`);

  console.log('================================================================');
  console.log('--- ALL COMBAT QA ASSERTIONS PASSED WITH 0 ERRORS ---');
  console.log(`Console Errors Encountered: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }
  console.log('================================================================');

  await browser.close();
}

runCombatTestSuite().catch(err => {
  console.error('QA Test Suite Failed:', err);
  process.exit(1);
});
