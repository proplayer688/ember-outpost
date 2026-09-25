import Phaser from 'phaser';
import { GameState, ResourceData } from '../core/GameState';
import { Audio } from '../audio/AudioManager';
import { EventBus, GameEvents } from '../core/EventBus';
import { ParticleFactory } from '../rendering/ParticleFactory';

export type ResourceType = keyof ResourceData;

export class ResourceNode extends Phaser.GameObjects.Container {
  public readonly nodeType: ResourceType;
  public readonly harvestYield: number;
  public readonly sprite: Phaser.GameObjects.Sprite;
  public readonly promptContainer: Phaser.GameObjects.Container;
  public readonly glow: Phaser.GameObjects.Image;
  private isDepleted: boolean = false;
  private isNearby: boolean = false;
  private respawnTimeMs: number = 16000;

  constructor(scene: Phaser.Scene, screenX: number, screenY: number, nodeType: ResourceType, harvestYield: number = 3) {
    super(scene, screenX, screenY);
    this.nodeType = nodeType;
    this.harvestYield = harvestYield;
    scene.add.existing(this);

    // 1. Ambient Glow Accent
    let glowTint = 0xF59E0B;
    if (nodeType === 'crystals') glowTint = 0x06B6D4;
    else if (nodeType === 'wood') glowTint = 0x22C55E;

    this.glow = scene.add.image(0, 8, 'light_glow');
    this.glow.setTint(glowTint);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.glow.setAlpha(0.3);
    this.glow.setScale(0.5);
    this.add(this.glow);

    // 2. Node Sprite
    this.sprite = scene.add.sprite(0, 0, this.getTextureKey(false));
    this.sprite.setOrigin(0.5, 0.85);
    this.sprite.setInteractive({ useHandCursor: true });
    this.add(this.sprite);

    this.sprite.on('pointerdown', () => {
      this.harvest();
    });

    // 3. Floating Interaction Badge [E] Harvest Resource
    this.promptContainer = scene.add.container(0, -32);

    const promptBg = scene.add.graphics();
    promptBg.fillStyle(0x070A13, 0.9);
    promptBg.fillRoundedRect(-48, -8, 96, 16, 3);
    promptBg.lineStyle(1, glowTint, 1);
    promptBg.strokeRoundedRect(-48, -8, 96, 16, 3);
    this.promptContainer.add(promptBg);

    const typeLabel = nodeType === 'crystals' ? 'Shards' : nodeType.toUpperCase();
    const promptText = scene.add.text(0, 0, `[E] ${typeLabel} (+${this.harvestYield})`, {
      fontSize: '8px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(promptText);

    this.promptContainer.setAlpha(0);
    this.promptContainer.setVisible(false);
    this.add(this.promptContainer);

    scene.tweens.add({
      targets: this.promptContainer,
      y: '-=3',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.setDepth(screenY + 2);
  }

  public harvest(): boolean {
    if (this.isDepleted) return false;

    // Check if inventory full
    const added = GameState.addResource(this.nodeType, this.harvestYield);
    if (!added) {
      Audio.playError();
      EventBus.emit(GameEvents.SHOW_FLOATING_TEXT, {
        text: 'STORAGE FULL!',
        color: '#F43F5E',
        x: this.x,
        y: this.y - 20
      });
      return false;
    }

    // Success harvest
    this.isDepleted = true;
    this.sprite.setTexture(this.getTextureKey(true));
    this.glow.setAlpha(0.08);
    this.setProximity(false);

    Audio.playHarvest(this.nodeType);
    ParticleFactory.burstCoinSparks(this.scene, this.x, this.y - 8);

    const label = this.nodeType === 'crystals' ? 'CRYSTAL' : this.nodeType.toUpperCase();
    EventBus.emit(GameEvents.SHOW_FLOATING_TEXT, {
      text: `+${this.harvestYield} ${label}`,
      color: this.nodeType === 'crystals' ? '#38BDF8' : this.nodeType === 'wood' ? '#22C55E' : '#F59E0B',
      x: this.x,
      y: this.y - 15
    });

    EventBus.emit(GameEvents.RESOURCE_HARVESTED, { type: this.nodeType, amount: this.harvestYield });

    // Respawn timer
    this.scene.time.delayedCall(this.respawnTimeMs, () => {
      this.respawn();
    });

    return true;
  }

  public respawn(): void {
    this.isDepleted = false;
    this.sprite.setTexture(this.getTextureKey(false));
    this.glow.setAlpha(0.3);

    // Respawn sparkle
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 150,
      yoyo: true
    });
  }

  private getTextureKey(depleted: boolean): string {
    const base = this.nodeType === 'crystals' ? 'node_crystal' : `node_${this.nodeType}`;
    return depleted ? `${base}_depleted` : base;
  }

  public setProximity(nearby: boolean): void {
    if (this.isDepleted) {
      this.promptContainer.setVisible(false);
      this.isNearby = false;
      return;
    }

    if (this.isNearby === nearby) return;
    this.isNearby = nearby;

    this.scene.tweens.killTweensOf(this.promptContainer);
    if (nearby) {
      this.promptContainer.setVisible(true);
      this.scene.tweens.add({
        targets: this.promptContainer,
        alpha: 1,
        duration: 150,
        ease: 'Quad.easeOut'
      });
    } else {
      this.scene.tweens.add({
        targets: this.promptContainer,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.promptContainer.setVisible(false);
        }
      });
    }
  }

  public getInteractionPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public isAvailable(): boolean {
    return !this.isDepleted;
  }
}
