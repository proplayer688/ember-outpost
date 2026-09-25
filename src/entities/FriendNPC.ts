import Phaser from 'phaser';
import { FriendDefinition } from '../data/FriendsData';
import { IsoMath } from '../rendering/IsoMath';
import { EventBus, GameEvents } from '../core/EventBus';

export type NPCState = 'IDLE' | 'WALK';

export class FriendNPC extends Phaser.GameObjects.Container {
  public readonly def: FriendDefinition;
  public readonly sprite: Phaser.GameObjects.Sprite;
  public readonly promptContainer: Phaser.GameObjects.Container;
  private currentWaypointIdx: number = 0;
  private aiState: NPCState = 'IDLE';
  private idleTimer: number = 2000;
  private animTimer: number = 0;
  private currentFrame: number = 0;
  private isNearby: boolean = false;
  private readonly walkSpeed: number = 28; // gentle isometric stroll

  constructor(scene: Phaser.Scene, def: FriendDefinition) {
    const initPos = IsoMath.gridToScreen(def.defaultGridPos.gx, def.defaultGridPos.gy);
    super(scene, initPos.screenX, initPos.screenY);
    this.def = def;
    scene.add.existing(this);

    // 1. Ambient Glow Accent under feet
    const glow = scene.add.image(0, 4, 'light_glow');
    glow.setTint(def.accentColor);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setAlpha(0.25);
    glow.setScale(0.5);
    this.add(glow);

    // 2. NPC Sprite
    this.sprite = scene.add.sprite(0, 0, `friend_${def.id}_0`);
    this.sprite.setOrigin(0.5, 0.85);
    this.sprite.setInteractive({ useHandCursor: true });
    this.add(this.sprite);

    // Clicking NPC opens friend dialog/dossier
    this.sprite.on('pointerdown', () => {
      EventBus.emit(GameEvents.OPEN_FRIEND_MODAL, this.def);
    });

    // 3. Floating Interaction Badge [E] Talk with Name
    this.promptContainer = scene.add.container(0, -36);

    const badgeBg = scene.add.graphics();
    badgeBg.fillStyle(0x070A13, 0.9);
    badgeBg.fillRoundedRect(-52, -9, 104, 18, 3);
    badgeBg.lineStyle(1, def.accentColor, 1);
    badgeBg.strokeRoundedRect(-52, -9, 104, 18, 3);
    this.promptContainer.add(badgeBg);

    const promptText = scene.add.text(0, 0, `[E] Talk with ${def.name}`, {
      fontSize: '8px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(promptText);

    this.promptContainer.setAlpha(0);
    this.promptContainer.setVisible(false);
    this.add(this.promptContainer);

    // Sine bobbing on prompt
    scene.tweens.add({
      targets: this.promptContainer,
      y: '-=3',
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Initial random idle pause
    this.idleTimer = 1500 + Math.random() * 2500;
    this.setDepth(this.y + 4);
  }

  public update(delta: number): void {
    if (this.aiState === 'IDLE') {
      this.idleTimer -= delta;
      if (this.idleTimer <= 0) {
        // Switch to WALK towards next waypoint
        this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.def.patrolWaypoints.length;
        this.aiState = 'WALK';
      }
    } else if (this.aiState === 'WALK') {
      const targetWaypoint = this.def.patrolWaypoints[this.currentWaypointIdx];
      const targetPos = IsoMath.gridToScreen(targetWaypoint.gx, targetWaypoint.gy);

      const dx = targetPos.screenX - this.x;
      const dy = targetPos.screenY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4) {
        // Arrived at waypoint
        this.x = targetPos.screenX;
        this.y = targetPos.screenY;
        this.aiState = 'IDLE';
        this.idleTimer = 2500 + Math.random() * 3000;
        this.currentFrame = 0;
        this.sprite.setTexture(`friend_${this.def.id}_0`);
      } else {
        // Walk step
        const step = (this.walkSpeed * delta) / 1000;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;

        // Facing direction
        if (dx < -1) {
          this.sprite.setScale(-1, 1);
        } else if (dx > 1) {
          this.sprite.setScale(1, 1);
        }

        // Walk animation cycle
        this.animTimer += delta;
        if (this.animTimer > 180) {
          this.animTimer = 0;
          this.currentFrame = (this.currentFrame + 1) % 2;
          this.sprite.setTexture(`friend_${this.def.id}_${this.currentFrame}`);
        }
      }
    }

    // Dynamic depth sorting based on Y position
    this.setDepth(this.y + 4);
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
    return { x: this.x, y: this.y };
  }
}
