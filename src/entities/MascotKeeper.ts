import Phaser from 'phaser';
import { Audio } from '../audio/AudioManager';
import { EventBus, GameEvents } from '../core/EventBus';

export type MascotDirection = 'down' | 'up' | 'left' | 'right';

export class MascotKeeper extends Phaser.Physics.Arcade.Sprite {
  private shadow: Phaser.GameObjects.Image;
  private currentDirection: MascotDirection = 'down';
  private isMoving: boolean = false;
  private footstepTimer: number = 0;
  public readonly moveSpeed: number = 140;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ignis_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create shadow beneath feet
    this.shadow = scene.add.image(x, y + 14, 'shadow_blob');
    this.shadow.setOrigin(0.5, 0.5);

    // Configure arcade physics hitbox: tight base at feet
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 8);
    body.setOffset(5, 24);
    body.setCollideWorldBounds(true);

    this.registerAnimations(scene);
    this.play('ignis_idle_down');

    // Celebrate reaction on collection / upgrade
    EventBus.on(GameEvents.RESOURCE_HARVESTED, () => this.playCelebrate());
    EventBus.on(GameEvents.OUTPOST_UPGRADED, () => this.playCelebrate());
  }

  public playCelebrate(): void {
    this.scene.tweens.add({
      targets: this,
      y: '-=10',
      duration: 130,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  private registerAnimations(scene: Phaser.Scene): void {
    const directions: MascotDirection[] = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      // Idle Animation (Frame 0 & Frame 2 gentle breathing)
      if (!scene.anims.exists(`ignis_idle_${dir}`)) {
        scene.anims.create({
          key: `ignis_idle_${dir}`,
          frames: [
            { key: `ignis_${dir}_0` },
            { key: `ignis_${dir}_2` }
          ],
          frameRate: 3,
          repeat: -1
        });
      }

      // Walk Animation (Frames 0, 1, 2, 3 snappy stride)
      if (!scene.anims.exists(`ignis_walk_${dir}`)) {
        scene.anims.create({
          key: `ignis_walk_${dir}`,
          frames: [
            { key: `ignis_${dir}_0` },
            { key: `ignis_${dir}_1` },
            { key: `ignis_${dir}_2` },
            { key: `ignis_${dir}_3` }
          ],
          frameRate: 10,
          repeat: -1
        });
      }
    });
  }

  public move(vx: number, vy: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (vx === 0 && vy === 0) {
      body.setVelocity(0, 0);
      if (this.isMoving) {
        this.isMoving = false;
        this.play(`ignis_idle_${this.currentDirection}`, true);
      }
    } else {
      // Determine dominant direction
      if (Math.abs(vx) > Math.abs(vy)) {
        this.currentDirection = vx > 0 ? 'right' : 'left';
      } else {
        this.currentDirection = vy > 0 ? 'down' : 'up';
      }

      body.setVelocity(vx * this.moveSpeed, vy * this.moveSpeed);

      if (!this.isMoving || this.anims.currentAnim?.key !== `ignis_walk_${this.currentDirection}`) {
        this.isMoving = true;
        this.play(`ignis_walk_${this.currentDirection}`, true);
      }

      // Footstep audio timing
      this.footstepTimer += delta;
      if (this.footstepTimer >= 300) {
        this.footstepTimer = 0;
        Audio.playFootstep();
      }
    }

    // Keep shadow aligned and update 2.5D depth
    this.shadow.setPosition(this.x, this.y + 14);
    this.shadow.setDepth(this.y + 1);
    this.setDepth(this.y + 2);
  }

  public getDirection(): MascotDirection {
    return this.currentDirection;
  }

  public getFeetPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y + 12 };
  }

  public destroy(fromScene?: boolean): void {
    if (this.shadow) this.shadow.destroy();
    super.destroy(fromScene);
  }
}
