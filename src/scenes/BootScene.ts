import Phaser from 'phaser';
import { TextureGenerator } from '../rendering/TextureGenerator';
import { Audio } from '../audio/AudioManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.cameras.main.setBackgroundColor('#070A13');

    // Title & Brand
    const title = this.add.text(width / 2, height / 2 - 50, 'EMBER OUTPOST', {
      fontSize: '24px',
      color: '#F59E0B',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);

    const subtitle = this.add.text(width / 2, height / 2 - 20, 'RARE FRIENDS UNIVERSE', {
      fontSize: '10px',
      color: '#06B6D4',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);

    // Animated Loading Bar
    const barW = 240;
    const barH = 10;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0F172A, 1);
    barBg.fillRect(width / 2 - barW / 2, height / 2 + 30, barW, barH);
    barBg.lineStyle(1, 0x1E293B, 1);
    barBg.strokeRect(width / 2 - barW / 2, height / 2 + 30, barW, barH);

    const barFill = this.add.graphics();

    const statusText = this.add.text(width / 2, height / 2 + 55, 'IGNITING AETHER FORGE...', {
      fontSize: '9px',
      color: '#94A3B8',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);

    // Simulate smooth progress loading
    let progress = 0;
    this.time.addEvent({
      delay: 20,
      repeat: 40,
      callback: () => {
        progress += 0.025;
        barFill.clear();
        barFill.fillStyle(0xF59E0B, 1);
        barFill.fillRect(width / 2 - barW / 2 + 2, height / 2 + 32, (barW - 4) * Math.min(progress, 1), barH - 4);

        if (progress >= 1) {
          statusText.setText('PRESS ANYWHERE TO ENTER');
          this.time.delayedCall(200, () => this.startGame());
        }
      }
    });

    // Generate procedural pixel textures into Phaser's texture cache
    TextureGenerator.generateAll(this);
    Audio.init();
  }

  private startGame(): void {
    this.cameras.main.fade(300, 7, 10, 19, false, (_cam: Phaser.Cameras.Scene2D.Camera, complete: number) => {
      if (complete === 1) {
        this.scene.start('OutpostScene');
        this.scene.start('UIScene');
      }
    });
  }
}
