import Phaser from 'phaser';
import { BuildingDefinition } from '../data/BuildingsData';
import { EventBus, GameEvents } from '../core/EventBus';

export class BuildingNode extends Phaser.GameObjects.Container {
  public readonly def: BuildingDefinition;
  public readonly buildingSprite: Phaser.GameObjects.Sprite;
  public readonly promptContainer: Phaser.GameObjects.Container;
  public readonly glowImage: Phaser.GameObjects.Image;
  private isNearby: boolean = false;
  public readonly collisionBody: Phaser.Physics.Arcade.StaticBody;

  constructor(scene: Phaser.Scene, screenX: number, screenY: number, def: BuildingDefinition) {
    super(scene, screenX, screenY);
    this.def = def;
    scene.add.existing(this);

    // 1. Ambient Light Glow (radial warmth on ground)
    this.glowImage = scene.add.image(0, 10, 'light_glow');
    this.glowImage.setTint(def.glowColor);
    this.glowImage.setBlendMode(Phaser.BlendModes.ADD);
    this.glowImage.setAlpha(0.4);
    this.add(this.glowImage);

    // Gentle pulse tween for ambient light
    scene.tweens.add({
      targets: this.glowImage,
      alpha: 0.65,
      scale: 1.1,
      duration: 1800 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. Main Building Sprite
    const textureKey = `building_${def.id}`;
    this.buildingSprite = scene.add.sprite(0, 0, textureKey);
    this.buildingSprite.setOrigin(0.5, 0.75); // Grounded isometric anchor
    this.buildingSprite.setInteractive({ useHandCursor: true });
    this.add(this.buildingSprite);

    // Click on building directly triggers inspect
    this.buildingSprite.on('pointerdown', () => {
      EventBus.emit(GameEvents.OPEN_BUILDING_MODAL, this.def);
    });

    // 3. Floating Contextual Interaction Prompt [E / TAP]
    this.promptContainer = scene.add.container(0, -this.buildingSprite.displayHeight * 0.85);
    
    // Background badge
    const badge = scene.add.image(0, 0, 'prompt_badge');
    badge.setDisplaySize(72, 18);
    this.promptContainer.add(badge);

    // Text: "[E] Inspect"
    const text = scene.add.text(0, 0, `[E] ${def.prompt}`, {
      fontSize: '8px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(text);

    // Prompt is hidden by default until in proximity
    this.promptContainer.setAlpha(0);
    this.promptContainer.setVisible(false);
    this.add(this.promptContainer);

    // Gentle bobbing tween for prompt
    scene.tweens.add({
      targets: this.promptContainer,
      y: '-=4',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Arcade Physics Static Collision Box
    // Calculate grounded obstacle dimensions based on footprint
    const colWidth = def.footprintWidth * 20;
    const colHeight = def.footprintHeight * 12;
    const colZone = scene.add.zone(screenX, screenY + 4, colWidth, colHeight);
    scene.physics.add.existing(colZone, true);
    this.collisionBody = colZone.body as Phaser.Physics.Arcade.StaticBody;

    // Set 2.5D Depth based on base Y
    this.setDepth(screenY + 4);
  }

  public setProximity(nearby: boolean): void {
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
    return { x: this.x, y: this.y + 4 };
  }
}
