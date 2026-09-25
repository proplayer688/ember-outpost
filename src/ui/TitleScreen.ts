import Phaser from 'phaser';
import { Audio } from '../audio/AudioManager';
import { EventBus } from '../core/EventBus';

export class TitleScreen extends Phaser.GameObjects.Container {
  private backdrop: Phaser.GameObjects.Graphics;
  private card: Phaser.GameObjects.Container;
  private hasEntered: boolean = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(3000); // Top-most overlay on boot

    const width = scene.scale.width;
    const height = scene.scale.height;

    // 1. Dark Vignetted Backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x070A13, 0.88);
    this.backdrop.fillRect(0, 0, width, height);
    this.add(this.backdrop);

    // 2. Card Container
    this.card = scene.add.container(width / 2, height / 2);
    this.add(this.card);

    this.renderWelcomeView();

    // Listen for manual open requests (e.g. from HUD [?] Help button)
    EventBus.on('open_field_guide', () => {
      this.openAsGuide();
    });

    scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible && this.hasEntered) {
        this.closeGuide();
      }
    });

    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.backdrop.clear();
      this.backdrop.fillStyle(0x070A13, 0.88);
      this.backdrop.fillRect(0, 0, gameSize.width, gameSize.height);
      this.card.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  public renderWelcomeView(): void {
    this.card.removeAll(true);
    const cw = 520;
    const ch = 350;

    // Window Box
    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 6);
    box.lineStyle(2, 0xF59E0B, 1);
    box.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 6);

    box.lineStyle(1, 0x1E293B, 0.8);
    box.strokeRoundedRect(-cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10, 4);
    this.card.add(box);

    // Logo / Title
    const title = this.scene.add.text(0, -ch / 2 + 30, 'EMBER OUTPOST', {
      fontSize: '20px',
      color: '#F59E0B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.card.add(title);

    const sub = this.scene.add.text(0, -ch / 2 + 52, 'A 2.5D ISOMETRIC SOCIAL STRATEGY IN THE RARE FRIENDS UNIVERSE', {
      fontSize: '8px',
      color: '#06B6D4',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.card.add(sub);

    // Divider
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0x1E293B, 1);
    div.lineBetween(-cw / 2 + 20, -ch / 2 + 68, cw / 2 - 20, -ch / 2 + 68);
    this.card.add(div);

    // Quick Overview Lore
    const lore = this.scene.add.text(0, -ch / 2 + 85,
      'Welcome, Outpost Keeper Ignis! Command an ancient ember settlement floating above\n' +
      'the cosmic void. Harvest raw materials, smelt currency, and challenge your companions.',
      {
        fontSize: '9px',
        color: '#E2E8F0',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 4
      }
    ).setOrigin(0.5, 0);
    this.card.add(lore);

    // Core Loop Feature Highlights
    const features = [
      '🧭  EXPLORE      : Navigate isometric streets using WASD, Arrows, or Touch Joystick.',
      '👥  7 FRIENDS    : Milo, Bram, Vex, Kael, Pip, Nova, and Cleo live and patrol camp.',
      '🪵  HARVEST      : Collect Wood, Aether Crystals, and Obsidian Stone from outskirts.',
      '🔥  PRODUCE      : Smelt alloys (5 Wood + 2 Crystals -> 80 Coins) at the Production Hub.',
      '⚡  THE FORGE    : 5-pulse rhythm precision minigame. 100% skill, zero gambling.',
      '🛡️  SIMULATED RF : 100% local prototype utility. Overcharge defense for outpost buffs.'
    ];

    let fy = -ch / 2 + 130;
    features.forEach(feat => {
      const ft = this.scene.add.text(-cw / 2 + 30, fy, feat, {
        fontSize: '8px',
        color: '#94A3B8',
        fontFamily: 'monospace'
      });
      this.card.add(ft);
      fy += 18;
    });

    // Action Buttons: [ ▶ ENTER OUTPOST ] & [ 📖 FIELD GUIDE ]
    const playBtn = this.scene.add.container(-cw / 4 + 10, ch / 2 - 40);
    const playBg = this.scene.add.graphics();
    playBg.fillStyle(0x164E2E, 1);
    playBg.fillRoundedRect(-95, -16, 190, 32, 4);
    playBg.lineStyle(2, 0x22C55E, 1);
    playBg.strokeRoundedRect(-95, -16, 190, 32, 4);
    playBtn.add(playBg);

    const playTxt = this.scene.add.text(0, 0, '▶ ENTER OUTPOST', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    playBtn.add(playTxt);

    playBg.setInteractive(new Phaser.Geom.Rectangle(-95, -16, 190, 32), Phaser.Geom.Rectangle.Contains);
    playBg.on('pointerover', () => {
      playBg.lineStyle(2, 0xFEF08A, 1);
      playTxt.setColor('#FEF08A');
    });
    playBg.on('pointerout', () => {
      playBg.lineStyle(2, 0x22C55E, 1);
      playTxt.setColor('#FFFFFF');
    });
    playBg.on('pointerdown', () => {
      this.enterGame();
    });
    this.card.add(playBtn);

    const guideBtn = this.scene.add.container(cw / 4 - 10, ch / 2 - 40);
    const guideBg = this.scene.add.graphics();
    guideBg.fillStyle(0x0F172A, 1);
    guideBg.fillRoundedRect(-95, -16, 190, 32, 4);
    guideBg.lineStyle(1, 0x38BDF8, 1);
    guideBg.strokeRoundedRect(-95, -16, 190, 32, 4);
    guideBtn.add(guideBg);

    const guideTxt = this.scene.add.text(0, 0, '📖 FIELD GUIDE', {
      fontSize: '10px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    guideBtn.add(guideTxt);

    guideBg.setInteractive(new Phaser.Geom.Rectangle(-95, -16, 190, 32), Phaser.Geom.Rectangle.Contains);
    guideBg.on('pointerover', () => {
      guideBg.lineStyle(1, 0xFEF08A, 1);
      guideTxt.setColor('#FFFFFF');
    });
    guideBg.on('pointerout', () => {
      guideBg.lineStyle(1, 0x38BDF8, 1);
      guideTxt.setColor('#38BDF8');
    });
    guideBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.renderGuideView();
    });
    this.card.add(guideBtn);

    this.card.setScale(0.96);
    this.scene.tweens.add({
      targets: this.card,
      scale: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });
  }

  public renderGuideView(): void {
    this.card.removeAll(true);
    const cw = 520;
    const ch = 350;

    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 6);
    box.lineStyle(2, 0x38BDF8, 1);
    box.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 6);
    this.card.add(box);

    const title = this.scene.add.text(0, -ch / 2 + 25, 'OUTPOST FIELD GUIDE & BUILDINGS', {
      fontSize: '14px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.card.add(title);

    // Close [X] button
    const closeBtn = this.scene.add.text(cw / 2 - 28, -ch / 2 + 18, '[X]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.card.add(closeBtn);
    closeBtn.on('pointerdown', () => {
      if (this.hasEntered) this.closeGuide();
      else this.renderWelcomeView();
    });

    const bldgs = [
      '👑 OUTPOST CORE      : Level up settlement (Lv1 -> Lv2/3), boosts production.',
      '🔥 PRODUCTION HUB    : Claim passive Coins and smelt raw Wood & Crystals.',
      '📦 STORAGE VAULT     : Sets caps on materials & coins; expandable via stone.',
      '🛠️ WORKSHOP          : Research Turbo Gather (+1 yield) and Ember Refining.',
      '🛡️ DEFENSE TOWER     : Spend Simulated RF to Overcharge outpost yields (+15%).',
      '🥋 TRAINING STATION  : Train reflexes to expand timing precision window in challenges.',
      '🌀 FRIEND GATE       : Directory of all 7 companions in the settlement.',
      '🎯 CHALLENGE BOARD   : Test timing reflexes in "The Forge Sync" (0% wagering).'
    ];

    let by = -ch / 2 + 55;
    bldgs.forEach(line => {
      const t = this.scene.add.text(-cw / 2 + 25, by, line, {
        fontSize: '8px',
        color: '#E2E8F0',
        fontFamily: 'monospace'
      });
      this.card.add(t);
      by += 20;
    });

    // Primary action button
    const backBtn = this.scene.add.container(0, ch / 2 - 35);
    const backBg = this.scene.add.graphics();
    backBg.fillStyle(0x0F172A, 1);
    backBg.fillRoundedRect(-110, -15, 220, 30, 4);
    backBg.lineStyle(1, 0xF59E0B, 1);
    backBg.strokeRoundedRect(-110, -15, 220, 30, 4);
    backBtn.add(backBg);

    const btnLabel = this.hasEntered ? '✓ RESUME EXPLORATION' : '← BACK TO WELCOME';
    const backTxt = this.scene.add.text(0, 0, btnLabel, {
      fontSize: '10px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    backBtn.add(backTxt);

    backBg.setInteractive(new Phaser.Geom.Rectangle(-110, -15, 220, 30), Phaser.Geom.Rectangle.Contains);
    backBg.on('pointerdown', () => {
      Audio.playUIClick();
      if (this.hasEntered) {
        this.closeGuide();
      } else {
        this.renderWelcomeView();
      }
    });
    this.card.add(backBtn);
  }

  public openAsGuide(): void {
    this.setVisible(true);
    this.backdrop.setAlpha(1);
    this.card.setAlpha(1);
    this.renderGuideView();
    Audio.playInteractChime();
  }

  public closeGuide(): void {
    Audio.playUIClick();
    this.scene.tweens.add({
      targets: [this.card, this.backdrop],
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }

  public enterGame(): void {
    this.hasEntered = true;
    Audio.playSuccessFanfare();
    Audio.startBGM();

    this.scene.tweens.add({
      targets: [this.card, this.backdrop],
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }
}
