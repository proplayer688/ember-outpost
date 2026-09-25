import Phaser from 'phaser';
import { IsoMath } from '../rendering/IsoMath';
import {
  RivalOutpostDef,
  RIVAL_OUTPOSTS,
  DEFENSE_TOWERS,
  COMBAT_UNITS,
  CombatUnitDef,
  BASE_DEFENSE_WAVES
} from '../data/CombatData';
import { CombatUnit, DefenseBuilding } from '../systems/CombatEntity';
import { GameState } from '../core/GameState';
import { Audio } from '../audio/AudioManager';
import { EventBus, GameEvents } from '../core/EventBus';

export class SiegeBattleScene extends Phaser.Scene {
  public rivalDef: RivalOutpostDef = RIVAL_OUTPOSTS[0];
  public isDefenseMode: boolean = false;

  private buildings: DefenseBuilding[] = [];
  private playerUnits: CombatUnit[] = [];
  private enemyUnits: CombatUnit[] = [];

  // Tactical Deck & Deployment
  private deployEnergy: number = 8;
  private maxDeployEnergy: number = 10;
  private selectedUnitId: string = 'volt_imp';

  // Battle Metrics
  private totalBuildingCount: number = 0;
  private destroyedBuildingCount: number = 0;
  private coreDestroyed: boolean = false;
  private destructionPercent: number = 0;
  private starsEarned: number = 0;
  private pillagedCoins: number = 0;
  private pillagedRF: number = 0;

  // Timers
  private battleDurationSec: number = 90;
  private battleTimerText!: Phaser.GameObjects.Text;
  private isBattleOver: boolean = false;

  // UI Elements
  private destructionBarFill!: Phaser.GameObjects.Graphics;
  private destructionLabel!: Phaser.GameObjects.Text;
  private starIcons: Phaser.GameObjects.Sprite[] = [];
  private lootText!: Phaser.GameObjects.Text;
  private energyFill!: Phaser.GameObjects.Graphics;
  private energyText!: Phaser.GameObjects.Text;
  private deckButtons: Map<string, { bg: Phaser.GameObjects.Graphics; container: Phaser.GameObjects.Container }> = new Map();

  constructor() {
    super({ key: 'SiegeBattleScene' });
  }

  init(data: { rivalDef?: RivalOutpostDef; mode?: 'siege' | 'defense' }): void {
    this.rivalDef = data.rivalDef || RIVAL_OUTPOSTS[0];
    this.isDefenseMode = data.mode === 'defense';
    this.isBattleOver = false;
    this.deployEnergy = 8;
    this.selectedUnitId = 'volt_imp';
    this.destroyedBuildingCount = 0;
    this.coreDestroyed = false;
    this.destructionPercent = 0;
    this.starsEarned = 0;
    this.pillagedCoins = 0;
    this.pillagedRF = 0;
    this.battleDurationSec = 90;
    this.buildings = [];
    this.playerUnits = [];
    this.enemyUnits = [];
  }

  create(): void {
    // 1. Setup Camera & World Dimensions
    const worldW = 1200;
    const worldH = 900;
    this.cameras.main.setBounds(-worldW / 2, -worldH / 2, worldW, worldH);
    this.cameras.main.centerOn(0, 0);
    this.cameras.main.setBackgroundColor('#070A13');
    this.cameras.main.setZoom(1.32);

    // 2. Render Tactical Ground Grid & Deployment Boundary
    this.buildBattlefieldGrid();

    // 3. Spawn Fortress Structures
    this.spawnFortress();

    // 4. Setup Input Handling (Tap outside boundary to deploy)
    this.setupDeploymentInput();

    // 5. Build Top Battle HUD & Bottom Unit Deck
    this.buildBattleHUD();
    this.buildCommandDeck();

    // 6. If defense mode, schedule enemy waves
    if (this.isDefenseMode) {
      this.startDefenseWaves();
      Audio.playAlarmSiren();
    } else {
      Audio.playInteractChime();
    }

    // 7. Tick Battle Timer
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.isBattleOver) return;
        this.battleDurationSec--;
        const mins = Math.floor(this.battleDurationSec / 60);
        const secs = (this.battleDurationSec % 60).toString().padStart(2, '0');
        if (this.battleTimerText) {
          this.battleTimerText.setText(`${mins}:${secs}`);
        }
        if (this.battleDurationSec <= 0) {
          this.endBattle(false);
        }
      }
    });

    // 8. Energy Regeneration (+1 per 1.4s)
    this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => {
        if (this.isBattleOver) return;
        if (this.deployEnergy < this.maxDeployEnergy) {
          this.deployEnergy = Math.min(this.maxDeployEnergy, this.deployEnergy + 1);
          this.updateEnergyBar();
        }
      }
    });

    this.cameras.main.fadeIn(300, 7, 10, 19);
  }

  update(time: number, delta: number): void {
    if (this.isBattleOver) return;

    // Update Player Units
    for (let i = this.playerUnits.length - 1; i >= 0; i--) {
      const u = this.playerUnits[i];
      if (u.isDead || !u.active) {
        this.playerUnits.splice(i, 1);
        continue;
      }
      u.update(time, delta, this.buildings);
    }

    // Update Enemy Units (Defense Mode)
    for (let i = this.enemyUnits.length - 1; i >= 0; i--) {
      const u = this.enemyUnits[i];
      if (u.isDead || !u.active) {
        this.enemyUnits.splice(i, 1);
        continue;
      }
      u.update(time, delta, this.buildings);
    }

    // Update Defense Buildings
    const targets = this.isDefenseMode ? this.enemyUnits : this.playerUnits;
    for (const b of this.buildings) {
      if (!b.isDead) {
        b.update(time, targets);
      }
    }

    // Check Destruction Progress
    this.checkDestructionProgress();
  }

  private buildBattlefieldGrid(): void {
    // Isometric ground tiles
    const ground = this.add.container(0, 0).setDepth(-100);
    const radius = 11;

    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        if (Math.abs(q) + Math.abs(r) <= radius + 2) {
          const pos = IsoMath.gridToScreen(q, r);
          const tile = this.add.image(pos.screenX, pos.screenY, 'tile_ground');
          ground.add(tile);
        }
      }
    }

    // Red Deployment Perimeter Boundary (Dashed Diamond Line)
    const boundary = this.add.graphics().setDepth(-50);
    boundary.lineStyle(2, 0xEF4444, 0.85);

    const bPoints = [
      IsoMath.gridToScreen(0, -7.5),
      IsoMath.gridToScreen(7.5, 0),
      IsoMath.gridToScreen(0, 7.5),
      IsoMath.gridToScreen(-7.5, 0)
    ];

    boundary.beginPath();
    boundary.moveTo(bPoints[0].screenX, bPoints[0].screenY);
    boundary.lineTo(bPoints[1].screenX, bPoints[1].screenY);
    boundary.lineTo(bPoints[2].screenX, bPoints[2].screenY);
    boundary.lineTo(bPoints[3].screenX, bPoints[3].screenY);
    boundary.closePath();
    boundary.strokePath();

    // Corner pulse rings
    bPoints.forEach(pt => {
      const ring = this.add.graphics().setDepth(-49);
      ring.lineStyle(1.5, 0xEF4444, 0.7);
      ring.strokeCircle(pt.screenX, pt.screenY, 9);
    });
  }

  private spawnFortress(): void {
    this.buildings = [];
    const bList = this.rivalDef.buildings;
    this.totalBuildingCount = bList.length;

    bList.forEach(item => {
      const towerDef = DEFENSE_TOWERS[item.type];
      const pos = IsoMath.gridToScreen(item.gridX, item.gridY);
      const building = new DefenseBuilding(this, pos.screenX, pos.screenY, {
        ...towerDef,
        hp: towerDef.maxHp
      }, item.gridX, item.gridY);
      this.buildings.push(building);
    });
  }

  private setupDeploymentInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      Audio.unlock();
      if (this.isBattleOver) return;

      // Ignore touches on top HUD or bottom deck
      if (pointer.y < 70 || pointer.y > this.scale.height - 80) return;

      const worldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const grid = IsoMath.screenToGrid(worldPos.x, worldPos.y);

      // Handle EMP Strike (Can be placed anywhere on base)
      if (this.selectedUnitId === 'emp_strike') {
        const empDef = COMBAT_UNITS['emp_strike'];
        if (this.deployEnergy >= empDef.costEnergy && GameState.currencies.simulatedRF >= empDef.costRF) {
          this.deployEnergy -= empDef.costEnergy;
          GameState.currencies.simulatedRF -= empDef.costRF;
          this.updateEnergyBar();
          this.castEMPStrike(worldPos.x, worldPos.y);
        } else {
          Audio.playError();
        }
        return;
      }

      // Standard Squad Deployment: MUST be outside inner fortress grid
      const distFromCenter = Math.abs(grid.gridX) + Math.abs(grid.gridY);
      if (distFromCenter < 6.8) {
        // Inside restricted drop zone
        Audio.playError();
        this.showRestrictedWarning(worldPos.x, worldPos.y);
        return;
      }

      const unitDef = COMBAT_UNITS[this.selectedUnitId];
      if (this.deployEnergy < unitDef.costEnergy) {
        Audio.playError();
        return;
      }

      // Deduct Energy & Spawn Unit
      this.deployEnergy -= unitDef.costEnergy;
      this.updateEnergyBar();
      this.spawnPlayerUnit(worldPos.x, worldPos.y, unitDef);
    });
  }

  private spawnPlayerUnit(x: number, y: number, def: CombatUnitDef): void {
    Audio.playUnitDeploy();

    // Deployment spawn ripple
    const ripple = this.add.graphics();
    ripple.lineStyle(2, 0x06B6D4, 1);
    ripple.strokeCircle(x, y, 6);
    this.tweens.add({
      targets: ripple,
      scale: 3,
      alpha: 0,
      duration: 350,
      onComplete: () => ripple.destroy()
    });

    const unit = new CombatUnit(this, x, y, def, true);
    this.playerUnits.push(unit);
  }

  private castEMPStrike(x: number, y: number): void {
    Audio.playTeslaZap();
    this.cameras.main.shake(200, 0.009);

    // Expanding shockwave graphic
    const blast = this.add.sprite(x, y, 'proj_emp_blast').setDepth(2500);
    blast.setScale(0.2);
    this.tweens.add({
      targets: blast,
      scale: 2.2,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => blast.destroy()
    });

    // Stun and damage all buildings within 130px
    const radius = 130;
    this.buildings.forEach(b => {
      if (b.isDead) return;
      const d = Phaser.Math.Distance.Between(x, y, b.x, b.y);
      if (d <= radius) {
        b.applyStun(4000); // 4 seconds stun
        b.takeDamage(110); // burst EMP damage
      }
    });
  }

  private showRestrictedWarning(x: number, y: number): void {
    const txt = this.add.text(x, y - 10, '⚠️ DROP ZONE RESTRICTED', {
      fontSize: '9px',
      color: '#EF4444',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#070A13CC',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5, 0.5).setDepth(3000);

    this.tweens.add({
      targets: txt,
      y: y - 28,
      alpha: 0,
      duration: 700,
      onComplete: () => txt.destroy()
    });
  }

  private checkDestructionProgress(): void {
    const dead = this.buildings.filter(b => b.isDead);
    this.destroyedBuildingCount = dead.length;

    // Calculate percentage
    const prevPercent = this.destructionPercent;
    this.destructionPercent = Math.min(100, Math.round((this.destroyedBuildingCount / this.totalBuildingCount) * 100));

    if (this.destructionPercent !== prevPercent) {
      this.updateDestructionBar();
    }

    // Check Citadel Core
    const core = this.buildings.find(b => b.def.type === 'core');
    if (core && core.isDead && !this.coreDestroyed) {
      this.coreDestroyed = true;
    }

    // Update Stars
    let stars = 0;
    if (this.destructionPercent >= 50) stars++;
    if (this.coreDestroyed) stars++;
    if (this.destructionPercent >= 100) stars = 3;

    if (stars > this.starsEarned) {
      this.starsEarned = stars;
      Audio.playStarEarned();
      this.animateStarUnlock(this.starsEarned - 1);
    }

    // Update Pillaged Loot
    let coins = 0;
    let rf = 0;
    dead.forEach(b => {
      coins += b.def.lootCoins || 0;
      rf += b.def.lootRF || 0;
    });
    this.pillagedCoins = coins;
    this.pillagedRF = rf;
    if (this.lootText) {
      this.lootText.setText(`🟡 ${this.pillagedCoins}  🔷 ${this.pillagedRF} RF`);
    }

    // 100% Victory
    if (this.destructionPercent >= 100 && !this.isBattleOver) {
      this.time.delayedCall(800, () => this.endBattle(true));
    }
  }

  private buildBattleHUD(): void {
    const w = this.scale.width;

    // Top Panel Background
    const topBar = this.add.graphics().setScrollFactor(0).setDepth(2000);
    topBar.fillStyle(0x070A13, 0.94);
    topBar.fillRect(0, 0, w, 52);
    topBar.lineStyle(1, 0x1E293B, 1);
    topBar.lineBetween(0, 52, w, 52);

    // Title & Subtitle (Left)
    const titleText = this.isDefenseMode
      ? 'BASE DEFENSE · INBOUND RAID'
      : `${this.rivalDef.name.toUpperCase()} · ${this.rivalDef.difficulty.toUpperCase()}`;
    const subText = this.isDefenseMode
      ? `OUTPOST DEFENSE LV.${GameState.combat.baseDefenseLevel} · REPEL RIVAL INVASION`
      : `CMD: ${this.rivalDef.commander.toUpperCase()} (${this.rivalDef.commanderRole})`;

    this.add.text(18, 10, titleText, {
      fontSize: '11px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(2001);

    this.add.text(18, 26, subText, {
      fontSize: '8px',
      color: '#94A3B8',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(2001);

    // Center: Destruction Bar & Stars
    const centerX = w / 2;

    this.destructionLabel = this.add.text(centerX, 12, 'DESTRUCTION: 0%', {
      fontSize: '10px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2001);

    const barBg = this.add.graphics().setScrollFactor(0).setDepth(2001);
    barBg.fillStyle(0x0F172A, 1);
    barBg.fillRoundedRect(centerX - 90, 24, 180, 8, 3);
    barBg.lineStyle(1, 0x334155, 1);
    barBg.strokeRoundedRect(centerX - 90, 24, 180, 8, 3);

    this.destructionBarFill = this.add.graphics().setScrollFactor(0).setDepth(2002);
    this.destructionBarFill.fillStyle(0x06B6D4, 1);
    this.destructionBarFill.fillRoundedRect(centerX - 89, 25, 0, 6, 2);

    // 3 Star Indicators
    this.starIcons = [];
    for (let i = 0; i < 3; i++) {
      const star = this.add.sprite(centerX - 24 + i * 24, 40, 'star_empty');
      star.setScale(0.7).setScrollFactor(0).setDepth(2002);
      this.starIcons.push(star);
    }

    // Right: Loot & Timer
    this.lootText = this.add.text(w - 110, 10, '🟡 0  🔷 0 RF', {
      fontSize: '9px',
      color: '#F59E0B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2001);

    this.battleTimerText = this.add.text(w - 110, 26, '1:30', {
      fontSize: '11px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2001);

    // Surrender / Retreat Button
    const retBtn = this.add.container(w - 50, 26).setScrollFactor(0).setDepth(2002);
    const retBg = this.add.graphics();
    retBg.fillStyle(0x1E293B, 1);
    retBg.fillRoundedRect(-36, -14, 72, 28, 3);
    retBg.lineStyle(1, 0xEF4444, 0.8);
    retBg.strokeRoundedRect(-36, -14, 72, 28, 3);
    retBtn.add(retBg);

    const retTxt = this.add.text(0, 0, 'RETREAT', {
      fontSize: '9px',
      color: '#F87171',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    retBtn.add(retTxt);

    retBg.setInteractive(new Phaser.Geom.Rectangle(-36, -14, 72, 28), Phaser.Geom.Rectangle.Contains);
    retBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.endBattle(false);
    });
  }

  private buildCommandDeck(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    // Bottom Panel Background
    const deckBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    deckBg.fillStyle(0x070A13, 0.95);
    deckBg.fillRect(0, h - 70, w, 70);
    deckBg.lineStyle(1, 0x1E293B, 1);
    deckBg.lineBetween(0, h - 70, w, h - 70);

    // Energy Meter (Left)
    this.add.text(20, h - 60, 'DEPLOY ENERGY', {
      fontSize: '8px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(2001);

    const energyBarBg = this.add.graphics().setScrollFactor(0).setDepth(2001);
    energyBarBg.fillStyle(0x0F172A, 1);
    energyBarBg.fillRoundedRect(20, h - 46, 100, 10, 2);
    energyBarBg.lineStyle(1, 0x334155, 1);
    energyBarBg.strokeRoundedRect(20, h - 46, 100, 10, 2);

    this.energyFill = this.add.graphics().setScrollFactor(0).setDepth(2002);
    this.energyText = this.add.text(70, h - 41, '8/10', {
      fontSize: '8px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2003);

    this.updateEnergyBar();

    // Unit Cards Row (Center)
    const unitKeys = ['volt_imp', 'pulse_ranger', 'obsidian_breacher', 'emp_strike'];
    const cardWidth = 74;
    const startX = Math.max(140, w / 2 - (unitKeys.length * cardWidth) / 2 + cardWidth / 2);

    unitKeys.forEach((key, idx) => {
      const def = COMBAT_UNITS[key];
      const cardX = startX + idx * cardWidth;
      const cardY = h - 35;

      const card = this.add.container(cardX, cardY).setScrollFactor(0).setDepth(2002);
      const bg = this.add.graphics();
      bg.fillStyle(0x0F172A, 1);
      bg.fillRoundedRect(-32, -26, 64, 52, 4);
      bg.lineStyle(1, key === this.selectedUnitId ? 0x22C55E : 0x334155, 1);
      bg.strokeRoundedRect(-32, -26, 64, 52, 4);
      card.add(bg);

      // Icon
      const icon = this.add.sprite(0, -8, def.iconTexture).setScale(0.85);
      card.add(icon);

      // Unit Name
      const name = this.add.text(0, 10, def.name.split(' ')[0].toUpperCase(), {
        fontSize: '7px',
        color: '#F8FAFC',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      }).setOrigin(0.5, 0.5);
      card.add(name);

      // Cost Tag
      const cost = this.add.text(0, 19, `⚡${def.costEnergy}`, {
        fontSize: '8px',
        color: '#FEF08A',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      }).setOrigin(0.5, 0.5);
      card.add(cost);

      bg.setInteractive(new Phaser.Geom.Rectangle(-32, -26, 64, 52), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerdown', () => {
        Audio.playUIClick();
        this.selectUnitCard(key);
      });

      this.deckButtons.set(key, { bg, container: card });
    });
  }

  private selectUnitCard(unitId: string): void {
    this.selectedUnitId = unitId;
    this.deckButtons.forEach((val, key) => {
      val.bg.clear();
      val.bg.fillStyle(0x0F172A, 1);
      val.bg.fillRoundedRect(-32, -26, 64, 52, 4);
      const isSelected = key === this.selectedUnitId;
      val.bg.lineStyle(isSelected ? 2 : 1, isSelected ? 0x22C55E : 0x334155, 1);
      val.bg.strokeRoundedRect(-32, -26, 64, 52, 4);
      val.container.setScale(isSelected ? 1.05 : 1.0);
    });
  }

  private updateEnergyBar(): void {
    if (!this.energyFill || !this.energyText) return;
    const h = this.scale.height;
    this.energyFill.clear();
    const pct = this.deployEnergy / this.maxDeployEnergy;
    this.energyFill.fillStyle(0x06B6D4, 1);
    this.energyFill.fillRoundedRect(21, h - 45, 98 * pct, 8, 2);
    this.energyText.setText(`${this.deployEnergy}/${this.maxDeployEnergy}`);
  }

  private updateDestructionBar(): void {
    const w = this.scale.width;
    const centerX = w / 2;
    this.destructionLabel.setText(`DESTRUCTION: ${this.destructionPercent}%`);
    this.destructionBarFill.clear();
    const pct = this.destructionPercent / 100;
    const color = pct >= 0.8 ? 0x22C55E : pct >= 0.5 ? 0xF59E0B : 0x06B6D4;
    this.destructionBarFill.fillStyle(color, 1);
    this.destructionBarFill.fillRoundedRect(centerX - 89, 25, 178 * pct, 6, 2);
  }

  private animateStarUnlock(starIdx: number): void {
    if (starIdx < 0 || starIdx >= this.starIcons.length) return;
    const s = this.starIcons[starIdx];
    s.setTexture('star_gold');
    this.tweens.add({
      targets: s,
      scale: 1.2,
      yoyo: true,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  private startDefenseWaves(): void {
    BASE_DEFENSE_WAVES.forEach(waveDef => {
      this.time.delayedCall((waveDef.wave - 1) * 22000, () => {
        if (this.isBattleOver) return;
        Audio.playAlarmSiren();
        this.cameras.main.flash(400, 239, 68, 68, true);

        // Spawn Wave Units from perimeter
        waveDef.units.forEach(uGroup => {
          for (let i = 0; i < uGroup.count; i++) {
            this.time.delayedCall(i * uGroup.delayMs, () => {
              if (this.isBattleOver) return;
              const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
              const spawnDist = 320;
              const spawnX = Math.cos(angle) * spawnDist;
              const spawnY = Math.sin(angle) * spawnDist * 0.6; // Isometric perspective
              const def = COMBAT_UNITS[uGroup.type];
              const enemy = new CombatUnit(this, spawnX, spawnY, def, false);
              this.enemyUnits.push(enemy);
            });
          }
        });
      });
    });
  }

  private endBattle(isWin: boolean): void {
    if (this.isBattleOver) return;
    this.isBattleOver = true;

    if (this.starsEarned > 0) {
      Audio.playSuccessFanfare();
      if (this.isDefenseMode) {
        GameState.recordDefenseVictory(this.pillagedCoins + 300, this.pillagedRF + 80);
      } else {
        GameState.recordSiegeVictory(this.rivalDef.id, this.starsEarned, this.pillagedCoins, this.pillagedRF);
      }
    } else {
      Audio.playError();
    }

    this.showResultModal(isWin);
  }

  private showResultModal(isWin: boolean): void {
    const w = this.scale.width;
    const h = this.scale.height;

    // Overlay
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(4000);
    overlay.fillStyle(0x070A13, 0.85);
    overlay.fillRect(0, 0, w, h);

    // Modal Box
    const mw = Math.min(460, w - 40);
    const mh = 320;
    const modal = this.add.container(w / 2, h / 2).setScrollFactor(0).setDepth(4001);

    const box = this.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 6);
    box.lineStyle(2, this.starsEarned > 0 ? 0x22C55E : 0xEF4444, 1);
    box.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 6);
    modal.add(box);

    // Header Title
    const headerStr = this.starsEarned === 3
      ? '🏆 3-STAR TOTAL WIPEOUT!'
      : this.starsEarned === 2
      ? '⚔️ CITADEL BREACH VICTORY!'
      : this.starsEarned === 1
      ? '🛡️ BASE DAMAGED VICTORY!'
      : '❌ SIEGE REPELLED';

    const header = this.add.text(0, -mh / 2 + 30, headerStr, {
      fontSize: '15px',
      color: this.starsEarned > 0 ? '#FEF08A' : '#F87171',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    modal.add(header);

    // Star Icons
    for (let i = 0; i < 3; i++) {
      const star = this.add.sprite(-36 + i * 36, -mh / 2 + 70, i < this.starsEarned ? 'star_gold' : 'star_empty');
      star.setScale(1.3);
      modal.add(star);
    }

    // Stats Grid
    const statsY = -mh / 2 + 120;
    const stats = [
      `DESTRUCTION: ${this.destructionPercent}%`,
      `CITADEL CORE: ${this.coreDestroyed ? 'DESTROYED (+1⭐)' : 'INTACT'}`,
      `PILLAGED COINS: +${this.pillagedCoins.toLocaleString()} 🟡`,
      `PILLAGED $RF: +${this.pillagedRF} 🔷 (SIMULATED)`,
      `TROPHIES GAINED: +${this.starsEarned * 12} 🏆`,
      `COMMANDER XP: +${this.starsEarned * 25} XP`
    ];

    stats.forEach((st, idx) => {
      const t = this.add.text(-mw / 2 + 36, statsY + idx * 20, st, {
        fontSize: '10px',
        color: idx >= 2 ? '#38BDF8' : '#F8FAFC',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      });
      modal.add(t);
    });

    // Return Button Visuals
    const returnBtn = this.add.container(0, mh / 2 - 36);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x065F46, 1);
    btnBg.fillRoundedRect(-110, -16, 220, 32, 4);
    btnBg.lineStyle(1.5, 0x34D399, 1);
    btnBg.strokeRoundedRect(-110, -16, 220, 32, 4);
    returnBtn.add(btnBg);

    const btnTxt = this.add.text(0, 0, '▶ RETURN TO OUTPOST', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    returnBtn.add(btnTxt);
    modal.add(returnBtn);

    modal.setScale(0.8);
    this.tweens.add({
      targets: modal,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // Close Handler
    let isClosed = false;
    const closeAction = () => {
      if (isClosed) return;
      isClosed = true;
      Audio.playUIClick();
      this.cameras.main.fadeOut(200, 7, 10, 19);
      this.time.delayedCall(220, () => {
        this.scene.resume('OutpostScene');
        this.scene.resume('UIScene');
        EventBus.emit(GameEvents.STATE_UPDATED);
        this.scene.stop('SiegeBattleScene');
      });
    };

    // Top-Level Screen Hit Zone (Independent of container scaling)
    const btnScreenX = w / 2;
    const btnScreenY = h / 2 + mh / 2 - 36;
    const hitZone = this.add.zone(btnScreenX, btnScreenY, 260, 48)
      .setScrollFactor(0)
      .setDepth(5000)
      .setInteractive({ useHandCursor: true });

    hitZone.on('pointerdown', closeAction);
    hitZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x047857, 1);
      btnBg.fillRoundedRect(-110, -16, 220, 32, 4);
      btnBg.lineStyle(2, 0xFFFFFF, 1);
      btnBg.strokeRoundedRect(-110, -16, 220, 32, 4);
      btnTxt.setColor('#FEF08A');
    });
    hitZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x065F46, 1);
      btnBg.fillRoundedRect(-110, -16, 220, 32, 4);
      btnBg.lineStyle(1.5, 0x34D399, 1);
      btnBg.strokeRoundedRect(-110, -16, 220, 32, 4);
      btnTxt.setColor('#FFFFFF');
    });

    // Keyboard Shortcuts (Space, Enter, Escape)
    this.input.keyboard?.once('keydown-SPACE', closeAction);
    this.input.keyboard?.once('keydown-ENTER', closeAction);
    this.input.keyboard?.once('keydown-ESC', closeAction);
  }
}
