import Phaser from 'phaser';
import { FriendDefinition, FRIENDS_DATA } from '../data/FriendsData';
import { RIVAL_OUTPOSTS, RivalOutpostDef } from '../data/CombatData';
import { EventBus, GameEvents } from '../core/EventBus';
import { Audio } from '../audio/AudioManager';
import { GameState } from '../core/GameState';

export class ChallengeModal extends Phaser.GameObjects.Container {
  private overlay: Phaser.GameObjects.Graphics;
  private panel: Phaser.GameObjects.Container;
  private currentTab: 'siege' | 'defense' = 'siege';
  private selectedRival: RivalOutpostDef = RIVAL_OUTPOSTS[0];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(2200);
    this.setVisible(false);

    // 1. Semi-transparent backdrop
    this.overlay = scene.add.graphics();
    this.overlay.fillStyle(0x070A13, 0.85);
    this.overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);
    this.overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height), Phaser.Geom.Rectangle.Contains);
    this.overlay.on('pointerdown', () => this.close());
    this.add(this.overlay);

    // 2. Center Panel Container
    this.panel = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.add(this.panel);

    EventBus.on(GameEvents.OPEN_CHALLENGE_MODAL, (friendDef?: FriendDefinition) => {
      if (friendDef) {
        // Auto-match rival if launched from specific NPC
        const match = RIVAL_OUTPOSTS.find(r => r.commander.toLowerCase().includes(friendDef.name.toLowerCase()));
        if (match) this.selectedRival = match;
      }
      this.open();
    });

    scene.input.keyboard?.on('keydown-SPACE', () => {
      if (this.visible) {
        this.launchBattle();
      }
    });

    scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible) this.close();
    });

    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.overlay.clear();
      this.overlay.fillStyle(0x070A13, 0.85);
      this.overlay.fillRect(0, 0, gameSize.width, gameSize.height);
      this.panel.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  public open(): void {
    this.renderModal();
    this.setVisible(true);
    Audio.playInteractChime();

    this.panel.setScale(0.9);
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  private renderModal(): void {
    this.panel.removeAll(true);

    const pw = Math.min(520, this.scene.scale.width - 20);
    const ph = 360;

    // Window Box
    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 6);
    box.lineStyle(2, 0xF59E0B, 1);
    box.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 6);

    // Inner border
    box.lineStyle(1, 0x1E293B, 0.8);
    box.strokeRoundedRect(-pw / 2 + 4, -ph / 2 + 4, pw - 8, ph - 8, 4);
    this.panel.add(box);

    // Header Title
    const title = this.scene.add.text(-pw / 2 + 25, -ph / 2 + 18, 'TACTICAL SIEGE & BASE DEFENSE', {
      fontSize: '13px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.panel.add(title);

    const subtitle = this.scene.add.text(-pw / 2 + 25, -ph / 2 + 34, 'REAL ATTACK & DEFENSE COMBAT · 100% DETERMINISTIC', {
      fontSize: '8px',
      color: '#38BDF8',
      fontFamily: 'monospace'
    });
    this.panel.add(subtitle);

    // Close Button [X]
    const closeBtn = this.scene.add.text(pw / 2 - 28, -ph / 2 + 16, '[X]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());
    this.panel.add(closeBtn);

    // Navigation Tabs: [ ⚔️ RIVAL ASSAULT ] & [ 🛡️ BASE DEFENSE ]
    this.renderTabs(pw, ph);

    if (this.currentTab === 'siege') {
      this.renderSiegeTab(pw, ph);
    } else {
      this.renderDefenseTab(pw, ph);
    }
  }

  private renderTabs(pw: number, ph: number): void {
    const tabY = -ph / 2 + 60;
    const tabW = (pw - 50) / 2;

    // Tab 1: Siege
    const tab1 = this.scene.add.container(-pw / 4 - 3, tabY);
    const bg1 = this.scene.add.graphics();
    bg1.fillStyle(this.currentTab === 'siege' ? 0x1E293B : 0x0F172A, 1);
    bg1.fillRoundedRect(-tabW / 2, -12, tabW, 24, 3);
    bg1.lineStyle(1, this.currentTab === 'siege' ? 0x22C55E : 0x334155, 1);
    bg1.strokeRoundedRect(-tabW / 2, -12, tabW, 24, 3);
    tab1.add(bg1);

    const txt1 = this.scene.add.text(0, 0, '⚔️ RIVAL ASSAULT', {
      fontSize: '9px',
      color: this.currentTab === 'siege' ? '#86EFAC' : '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    tab1.add(txt1);

    bg1.setInteractive(new Phaser.Geom.Rectangle(-tabW / 2, -12, tabW, 24), Phaser.Geom.Rectangle.Contains);
    bg1.on('pointerdown', () => {
      Audio.playUIClick();
      this.currentTab = 'siege';
      this.renderModal();
    });
    this.panel.add(tab1);

    // Tab 2: Defense
    const tab2 = this.scene.add.container(pw / 4 + 3, tabY);
    const bg2 = this.scene.add.graphics();
    bg2.fillStyle(this.currentTab === 'defense' ? 0x1E293B : 0x0F172A, 1);
    bg2.fillRoundedRect(-tabW / 2, -12, tabW, 24, 3);
    bg2.lineStyle(1, this.currentTab === 'defense' ? 0x38BDF8 : 0x334155, 1);
    bg2.strokeRoundedRect(-tabW / 2, -12, tabW, 24, 3);
    tab2.add(bg2);

    const txt2 = this.scene.add.text(0, 0, '🛡️ BASE DEFENSE', {
      fontSize: '9px',
      color: this.currentTab === 'defense' ? '#7DD3FC' : '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    tab2.add(txt2);

    bg2.setInteractive(new Phaser.Geom.Rectangle(-tabW / 2, -12, tabW, 24), Phaser.Geom.Rectangle.Contains);
    bg2.on('pointerdown', () => {
      Audio.playUIClick();
      this.currentTab = 'defense';
      this.renderModal();
    });
    this.panel.add(tab2);
  }

  private renderSiegeTab(pw: number, ph: number): void {
    // Rivals Cards Grid
    const startY = -ph / 2 + 115;
    const cardW = (pw - 60) / 2;
    const cardH = 68;

    RIVAL_OUTPOSTS.forEach((r, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = col === 0 ? -pw / 4 - 3 : pw / 4 + 3;
      const cy = startY + row * (cardH + 10);

      const isSelected = r.id === this.selectedRival.id;
      const card = this.scene.add.container(cx, cy);

      const cBg = this.scene.add.graphics();
      cBg.fillStyle(0x0F172A, 1);
      cBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
      cBg.lineStyle(1, isSelected ? 0xF59E0B : 0x1E293B, 1);
      cBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
      card.add(cBg);

      // Rival Title & Commander
      const name = this.scene.add.text(-cardW / 2 + 10, -cardH / 2 + 8, r.name.toUpperCase(), {
        fontSize: '9px',
        color: isSelected ? '#FEF08A' : '#F8FAFC',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      });
      card.add(name);

      const cmd = this.scene.add.text(-cardW / 2 + 10, -cardH / 2 + 22, `CMD: ${r.commander}`, {
        fontSize: '8px',
        color: '#94A3B8',
        fontFamily: 'monospace'
      });
      card.add(cmd);

      // Defense & Loot Tag
      const loot = this.scene.add.text(-cardW / 2 + 10, -cardH / 2 + 36, `DEF: ${r.defenseRating} · 🟡${r.totalLootCoins} 🔷${r.totalLootRF}`, {
        fontSize: '7.5px',
        color: '#F59E0B',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      });
      card.add(loot);

      // Difficulty Badge
      const diffCol = r.difficulty === 'Easy' ? '#86EFAC' : r.difficulty === 'Medium' ? '#FDE047' : '#F87171';
      const diff = this.scene.add.text(cardW / 2 - 10, -cardH / 2 + 8, r.difficulty.toUpperCase(), {
        fontSize: '7.5px',
        color: diffCol,
        fontStyle: 'bold',
        fontFamily: 'monospace'
      }).setOrigin(1, 0);
      card.add(diff);

      cBg.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
      cBg.on('pointerdown', () => {
        Audio.playUIClick();
        this.selectedRival = r;
        this.renderModal();
      });

      this.panel.add(card);
    });

    // Launch Button
    const launchY = ph / 2 - 32;
    const launchBtn = this.scene.add.container(0, launchY);
    const lBg = this.scene.add.graphics();
    lBg.fillStyle(0x7C2D12, 1);
    lBg.fillRoundedRect(-140, -15, 280, 30, 4);
    lBg.lineStyle(1.5, 0xF59E0B, 1);
    lBg.strokeRoundedRect(-140, -15, 280, 30, 4);
    launchBtn.add(lBg);

    const lTxt = this.scene.add.text(0, 0, `⚔️ LAUNCH SIEGE ON ${this.selectedRival.name.toUpperCase()} (1🎫)`, {
      fontSize: '10px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    launchBtn.add(lTxt);

    lBg.setInteractive(new Phaser.Geom.Rectangle(-140, -15, 280, 30), Phaser.Geom.Rectangle.Contains);
    lBg.on('pointerover', () => lTxt.setColor('#FFFFFF'));
    lBg.on('pointerout', () => lTxt.setColor('#FEF08A'));
    lBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.launchBattle();
    });
    this.panel.add(launchBtn);
  }

  private renderDefenseTab(pw: number, ph: number): void {
    const startY = -ph / 2 + 105;

    // Defense Status Card
    const infoBg = this.scene.add.graphics();
    infoBg.fillStyle(0x0F172A, 1);
    infoBg.fillRoundedRect(-pw / 2 + 25, startY, pw - 50, 140, 4);
    infoBg.lineStyle(1, 0x1E293B, 1);
    infoBg.strokeRoundedRect(-pw / 2 + 25, startY, pw - 50, 140, 4);
    this.panel.add(infoBg);

    const dTitle = this.scene.add.text(-pw / 2 + 40, startY + 14, `OUTPOST DEFENSE LEVEL: ${GameState.combat.baseDefenseLevel}`, {
      fontSize: '11px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.panel.add(dTitle);

    const dDesc = this.scene.add.text(-pw / 2 + 40, startY + 34,
      `• Placed Defenses: Pulse Cannon (Active) + Tesla Shock Coil (Active)\n` +
      `• Inbound Raid Waves: Recon Scramblers -> Vanguard Unit -> Siege Legion\n` +
      `• Defense Bounties: Earn +200 to +750 🟡 Coins and +50 to +200 🔷 $RF per wave!\n` +
      `• Successful Defenses: ${GameState.combat.defensesHeld} Waves Held`, {
      fontSize: '8.5px',
      color: '#94A3B8',
      lineSpacing: 4,
      fontFamily: 'monospace'
    });
    this.panel.add(dDesc);

    // Upgrade Defense Button
    const upCostRF = 60 * GameState.combat.baseDefenseLevel;
    const upCostStone = 10 * GameState.combat.baseDefenseLevel;
    const canUpgrade = GameState.currencies.simulatedRF >= upCostRF && GameState.resources.stone >= upCostStone;

    const upBtn = this.scene.add.container(0, startY + 115);
    const uBg = this.scene.add.graphics();
    uBg.fillStyle(canUpgrade ? 0x065F46 : 0x1E293B, 1);
    uBg.fillRoundedRect(-140, -12, 280, 24, 3);
    uBg.lineStyle(1, canUpgrade ? 0x34D399 : 0x475569, 1);
    uBg.strokeRoundedRect(-140, -12, 280, 24, 3);
    upBtn.add(uBg);

    const uTxt = this.scene.add.text(0, 0, `UPGRADE DEFENSES (${upCostRF}🔷 RF + ${upCostStone}🪨)`, {
      fontSize: '8.5px',
      color: canUpgrade ? '#A7F3D0' : '#64748B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    upBtn.add(uTxt);

    uBg.setInteractive(new Phaser.Geom.Rectangle(-140, -12, 280, 24), Phaser.Geom.Rectangle.Contains);
    uBg.on('pointerdown', () => {
      if (canUpgrade) {
        GameState.upgradeBaseDefense();
        Audio.playSuccessFanfare();
        this.renderModal();
      } else {
        Audio.playError();
      }
    });
    this.panel.add(upBtn);

    // Trigger Test Defense Raid Button
    const raidBtn = this.scene.add.container(0, ph / 2 - 32);
    const rBg = this.scene.add.graphics();
    rBg.fillStyle(0x7F1D1D, 1);
    rBg.fillRoundedRect(-150, -15, 300, 30, 4);
    rBg.lineStyle(1.5, 0xEF4444, 1);
    rBg.strokeRoundedRect(-150, -15, 300, 30, 4);
    raidBtn.add(rBg);

    const rTxt = this.scene.add.text(0, 0, '🚨 TRIGGER INBOUND RAID / TEST DEFENSE', {
      fontSize: '10px',
      color: '#FECACA',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    raidBtn.add(rTxt);

    rBg.setInteractive(new Phaser.Geom.Rectangle(-150, -15, 300, 30), Phaser.Geom.Rectangle.Contains);
    rBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.setVisible(false);
      EventBus.emit(GameEvents.CLOSE_CHALLENGE_MODAL);
      this.scene.scene.pause('OutpostScene');
      this.scene.scene.pause('UIScene');
      this.scene.scene.launch('SiegeBattleScene', { mode: 'defense' });
    });
    this.panel.add(raidBtn);
  }

  public launchBattle(): void {
    if (GameState.currencies.tickets > 0) {
      GameState.currencies.tickets--;
      EventBus.emit(GameEvents.STATE_UPDATED);
    }
    this.setVisible(false);
    EventBus.emit(GameEvents.CLOSE_CHALLENGE_MODAL);
    this.scene.scene.pause('OutpostScene');
    this.scene.scene.pause('UIScene');
    this.scene.scene.launch('SiegeBattleScene', { rivalDef: this.selectedRival, mode: 'siege' });
  }

  public close(): void {
    Audio.playUIClick();
    this.setVisible(false);
    EventBus.emit(GameEvents.CLOSE_CHALLENGE_MODAL);
  }
}
