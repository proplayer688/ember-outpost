import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { EventBus, GameEvents } from '../core/EventBus';
import { Audio } from '../audio/AudioManager';

export class HUDController extends Phaser.GameObjects.Container {
  private levelText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private diamondsText!: Phaser.GameObjects.Text;
  private rfText!: Phaser.GameObjects.Text;
  private ticketsText!: Phaser.GameObjects.Text;
  private woodText!: Phaser.GameObjects.Text;
  private crystalsText!: Phaser.GameObjects.Text;
  private stoneText!: Phaser.GameObjects.Text;
  private muteButtonText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(500);

    this.buildHUD(scene);

    EventBus.on(GameEvents.STATE_UPDATED, () => this.refreshValues());
    EventBus.on(GameEvents.OUTPOST_UPGRADED, () => this.refreshValues());

    // Listen for floating text notifications
    EventBus.on(GameEvents.SHOW_FLOATING_TEXT, (data: { text: string; color?: string; x?: number; y?: number }) => {
      this.showFloatingNotification(data.text, data.color, data.x, data.y);
    });
  }

  private buildHUD(scene: Phaser.Scene): void {
    const width = scene.scale.width;

    // Top Background Panel (Obsidian bar with slate bottom border)
    const bar = scene.add.graphics();
    bar.fillStyle(0x070A13, 0.92);
    bar.fillRect(0, 0, width, 40);
    bar.lineStyle(1, 0x1E293B, 1);
    bar.lineBetween(0, 40, width, 40);
    this.add(bar);

    // 1. Player Info & Outpost Rank (Left)
    const avatar = scene.add.sprite(20, 20, 'ignis_down_0');
    avatar.setScale(0.85);
    this.add(avatar);

    this.levelText = scene.add.text(36, 12, `IGNIS · LV.${GameState.outpost.level}`, {
      fontSize: '10px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.levelText);

    const titleText = scene.add.text(36, 24, `${GameState.outpost.title.toUpperCase()}`, {
      fontSize: '7px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(titleText);

    // 2. Currencies (Center-Left)
    let curX = 160;

    // Coins
    const coinIcon = scene.add.image(curX, 20, 'hud_coin');
    this.add(coinIcon);
    this.coinsText = scene.add.text(curX + 11, 14, `${GameState.currencies.coins.toLocaleString()}`, {
      fontSize: '10px',
      color: '#F59E0B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.coinsText);

    curX += 78;

    // Diamonds
    const diaIcon = scene.add.image(curX, 20, 'hud_diamond');
    this.add(diaIcon);
    this.diamondsText = scene.add.text(curX + 11, 14, `${GameState.currencies.diamonds}`, {
      fontSize: '10px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.diamondsText);

    curX += 65;

    // Simulated $RF
    const rfIcon = scene.add.image(curX, 20, 'hud_rf');
    this.add(rfIcon);
    this.rfText = scene.add.text(curX + 11, 10, `${GameState.currencies.simulatedRF}`, {
      fontSize: '10px',
      color: '#06B6D4',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.rfText);

    const simBadge = scene.add.text(curX + 11, 24, 'SIMULATED', {
      fontSize: '6px',
      color: '#64748B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(simBadge);

    curX += 85;

    // 3. Harvestable Resources (Center-Right)
    // Wood
    const woodIcon = scene.add.image(curX, 20, 'hud_wood');
    this.add(woodIcon);
    this.woodText = scene.add.text(curX + 11, 14, `${GameState.resources.wood}`, {
      fontSize: '9px',
      color: '#22C55E',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.woodText);

    curX += 50;

    // Crystals
    const cryIcon = scene.add.image(curX, 20, 'hud_crystal');
    this.add(cryIcon);
    this.crystalsText = scene.add.text(curX + 11, 14, `${GameState.resources.crystals}`, {
      fontSize: '9px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.crystalsText);

    curX += 50;

    // Stone
    const stoneIcon = scene.add.image(curX, 20, 'hud_stone');
    this.add(stoneIcon);
    this.stoneText = scene.add.text(curX + 11, 14, `${GameState.resources.stone}`, {
      fontSize: '9px',
      color: '#E2E8F0',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.add(this.stoneText);

    curX += 60;

    // Tickets
    const ticketBox = scene.add.text(curX, 14, `🎫 ${GameState.currencies.tickets}/6`, {
      fontSize: '9px',
      color: '#22C55E',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.ticketsText = ticketBox;
    this.add(ticketBox);

    // 4. Settings, Mute & Guide (Right)
    const rightMargin = width - 20;

    // Battle Quick-Access Button [⚔️ SIEGE]
    const siegeBtn = scene.add.container(rightMargin - 150, 20);
    const sBg = scene.add.graphics();
    sBg.fillStyle(0x7C2D12, 1);
    sBg.fillRoundedRect(-36, -11, 72, 22, 3);
    sBg.lineStyle(1, 0xF59E0B, 1);
    sBg.strokeRoundedRect(-36, -11, 72, 22, 3);
    siegeBtn.add(sBg);

    const sTxt = scene.add.text(0, 0, '⚔️ SIEGE', {
      fontSize: '8.5px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    siegeBtn.add(sTxt);

    sBg.setInteractive(new Phaser.Geom.Rectangle(-36, -11, 72, 22), Phaser.Geom.Rectangle.Contains);
    sBg.on('pointerover', () => {
      sBg.lineStyle(1, 0xFFFFFF, 1);
      sTxt.setColor('#FFFFFF');
    });
    sBg.on('pointerout', () => {
      sBg.lineStyle(1, 0xF59E0B, 1);
      sTxt.setColor('#FEF08A');
    });
    sBg.on('pointerdown', () => {
      Audio.playUIClick();
      EventBus.emit(GameEvents.OPEN_CHALLENGE_MODAL);
    });
    this.add(siegeBtn);

    // Help Button [?]
    const helpBtn = scene.add.text(rightMargin - 95, 14, '[?]', {
      fontSize: '12px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.add(helpBtn);

    helpBtn.on('pointerover', () => helpBtn.setColor('#FFFFFF'));
    helpBtn.on('pointerout', () => helpBtn.setColor('#38BDF8'));
    helpBtn.on('pointerdown', () => {
      Audio.playUIClick();
      EventBus.emit('open_field_guide');
    });

    // Mute Button [🔊 / 🔇]
    this.muteButtonText = scene.add.text(rightMargin - 65, 14, GameState.settings.isMuted ? '[🔇]' : '[🔊]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.add(this.muteButtonText);

    this.muteButtonText.on('pointerover', () => this.muteButtonText.setColor('#F8FAFC'));
    this.muteButtonText.on('pointerout', () => this.muteButtonText.setColor('#94A3B8'));
    this.muteButtonText.on('pointerdown', () => {
      const newMuted = !GameState.settings.isMuted;
      GameState.setMute(newMuted);
      Audio.updateVolumes();
      Audio.playUIClick();
      this.muteButtonText.setText(newMuted ? '[🔇]' : '[🔊]');
    });

    // Settings Button [⚙]
    const settingsBtn = scene.add.text(rightMargin - 30, 14, '[⚙]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.add(settingsBtn);

    settingsBtn.on('pointerover', () => settingsBtn.setColor('#F8FAFC'));
    settingsBtn.on('pointerout', () => settingsBtn.setColor('#94A3B8'));
    settingsBtn.on('pointerdown', () => {
      Audio.playUIClick();
      EventBus.emit(GameEvents.OPEN_SETTINGS);
    });

    // Dynamic resize repositioning
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      bar.clear();
      bar.fillStyle(0x070A13, 0.92);
      bar.fillRect(0, 0, gameSize.width, 40);
      bar.lineStyle(1, 0x1E293B, 1);
      bar.lineBetween(0, 40, gameSize.width, 40);

      const newRight = gameSize.width - 20;
      settingsBtn.setPosition(newRight - 30, 14);
      this.muteButtonText.setPosition(newRight - 65, 14);
      helpBtn.setPosition(newRight - 95, 14);
      siegeBtn.setPosition(newRight - 150, 20);
    });
  }

  public showFloatingNotification(text: string, color: string = '#FEF08A', worldX?: number, worldY?: number): void {
    const screenX = worldX !== undefined ? worldX : this.scene.scale.width / 2;
    const screenY = worldY !== undefined ? worldY : this.scene.scale.height / 2;

    const toast = this.scene.add.text(screenX, screenY, text, {
      fontSize: '11px',
      color: color,
      fontStyle: 'bold',
      fontFamily: 'monospace',
      backgroundColor: '#070A13EE',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0.5).setDepth(2500);

    this.scene.tweens.add({
      targets: toast,
      y: screenY - 30,
      alpha: 0,
      duration: 1200,
      ease: 'Quad.easeOut',
      onComplete: () => toast.destroy()
    });
  }

  private displayedCoins: number = GameState.currencies.coins;

  public refreshValues(): void {
    this.levelText.setText(`IGNIS · LV.${GameState.outpost.level}`);
    
    // Smooth roll-up animation for coins
    if (this.displayedCoins !== GameState.currencies.coins) {
      this.scene.tweens.addCounter({
        from: this.displayedCoins,
        to: GameState.currencies.coins,
        duration: 350,
        ease: 'Sine.easeOut',
        onUpdate: (tween) => {
          const val = Math.round(tween.getValue() as number);
          this.coinsText.setText(`${val.toLocaleString()}`);
        },
        onComplete: () => {
          this.displayedCoins = GameState.currencies.coins;
          this.coinsText.setText(`${this.displayedCoins.toLocaleString()}`);
        }
      });
    } else {
      this.coinsText.setText(`${GameState.currencies.coins.toLocaleString()}`);
    }

    this.diamondsText.setText(`${GameState.currencies.diamonds}`);
    this.rfText.setText(`${GameState.currencies.simulatedRF}`);
    this.woodText.setText(`${GameState.resources.wood}`);
    this.crystalsText.setText(`${GameState.resources.crystals}`);
    this.stoneText.setText(`${GameState.resources.stone}`);
    this.ticketsText.setText(`🎫 ${GameState.currencies.tickets}/6`);
    this.muteButtonText.setText(GameState.settings.isMuted ? '[🔇]' : '[🔊]');
  }
}
