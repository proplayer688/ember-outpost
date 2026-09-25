import Phaser from 'phaser';
import { EventBus, GameEvents } from '../core/EventBus';
import { Audio } from '../audio/AudioManager';
import { GameState } from '../core/GameState';

export class SettingsModal extends Phaser.GameObjects.Container {
  private overlay: Phaser.GameObjects.Graphics;
  private panel: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(2000);
    this.setVisible(false);

    // Backdrop
    this.overlay = scene.add.graphics();
    this.overlay.fillStyle(0x070A13, 0.65);
    this.overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);
    this.overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height), Phaser.Geom.Rectangle.Contains);
    this.overlay.on('pointerdown', () => this.close());
    this.add(this.overlay);

    // Panel
    this.panel = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.add(this.panel);

    EventBus.on(GameEvents.OPEN_SETTINGS, () => this.open());

    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.overlay.clear();
      this.overlay.fillStyle(0x070A13, 0.65);
      this.overlay.fillRect(0, 0, gameSize.width, gameSize.height);
      this.panel.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  public open(): void {
    this.panel.removeAll(true);
    const pw = 380;
    const ph = 260;

    // Window Box
    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRect(-pw / 2, -ph / 2, pw, ph);
    box.lineStyle(2, 0x1E293B, 1);
    box.strokeRect(-pw / 2, -ph / 2, pw, ph);
    box.lineStyle(1, 0x334155, 0.6);
    box.strokeRect(-pw / 2 + 4, -ph / 2 + 4, pw - 8, ph - 8);
    this.panel.add(box);

    // Title
    const title = this.scene.add.text(0, -ph / 2 + 22, 'SYSTEM SETTINGS', {
      fontSize: '12px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.panel.add(title);

    // Close Button [X]
    const closeBtn = this.scene.add.text(pw / 2 - 28, -ph / 2 + 16, '[X]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.panel.add(closeBtn);
    closeBtn.on('pointerdown', () => this.close());

    // Audio Mute Toggle
    const muteText = this.scene.add.text(-pw / 2 + 25, -ph / 2 + 60, `SOUND: ${GameState.settings.isMuted ? 'MUTED' : 'ENABLED'}`, {
      fontSize: '10px',
      color: '#F59E0B',
      fontFamily: 'monospace'
    });
    this.panel.add(muteText);

    const muteToggle = this.scene.add.text(pw / 2 - 25, -ph / 2 + 60, GameState.settings.isMuted ? '[ UNMUTE ]' : '[ MUTE ]', {
      fontSize: '10px',
      color: '#38BDF8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.panel.add(muteToggle);

    muteToggle.on('pointerdown', () => {
      const newMuted = !GameState.settings.isMuted;
      GameState.setMute(newMuted);
      Audio.updateVolumes();
      Audio.playUIClick();
      muteText.setText(`SOUND: ${newMuted ? 'MUTED' : 'ENABLED'}`);
      muteToggle.setText(newMuted ? '[ UNMUTE ]' : '[ MUTE ]');
    });

    // Controls Guide Section
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0x1E293B, 1);
    div.lineBetween(-pw / 2 + 15, -ph / 2 + 95, pw / 2 - 15, -ph / 2 + 95);
    this.panel.add(div);

    const controlsTitle = this.scene.add.text(0, -ph / 2 + 110, 'CONTROLS & SHORTCUTS', {
      fontSize: '9px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.panel.add(controlsTitle);

    const guideLines = [
      'WASD / Arrows : Walk Mascot (Ignis)',
      'Click / Tap   : Walk to Destination',
      'E / Space     : Interact with Structure',
      'Escape        : Close Window / Menu',
      'Mobile        : Touch Joystick & Action Button'
    ];

    let gy = -ph / 2 + 130;
    guideLines.forEach(line => {
      const t = this.scene.add.text(0, gy, line, {
        fontSize: '8px',
        color: '#E2E8F0',
        fontFamily: 'monospace'
      }).setOrigin(0.5, 0);
      this.panel.add(t);
      gy += 16;
    });

    // Reset Progress Button
    const resetBtn = this.scene.add.text(0, ph / 2 - 25, '[ RESET SAVED STATE ]', {
      fontSize: '8px',
      color: '#64748B',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    this.panel.add(resetBtn);

    resetBtn.on('pointerover', () => resetBtn.setColor('#F43F5E'));
    resetBtn.on('pointerout', () => resetBtn.setColor('#64748B'));
    resetBtn.on('pointerdown', () => {
      localStorage.clear();
      location.reload();
    });

    this.setVisible(true);
    this.panel.setScale(0.9);
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  public close(): void {
    Audio.playUIClick();
    this.scene.tweens.add({
      targets: this.panel,
      scale: 0.9,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        EventBus.emit(GameEvents.CLOSE_SETTINGS);
      }
    });
  }
}
