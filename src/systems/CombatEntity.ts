import Phaser from 'phaser';
import { CombatUnitDef, DefenseTowerDef, COMBAT_UNITS } from '../data/CombatData';
import { Audio } from '../audio/AudioManager';

export interface CombatTarget {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isDead: boolean;
  takeDamage(amount: number): void;
}

export class DefenseBuilding extends Phaser.GameObjects.Container implements CombatTarget {
  public def: DefenseTowerDef;
  public hp: number;
  public maxHp: number;
  public isDead: boolean = false;
  public stunnedUntil: number = 0;
  public lastFireTime: number = 0;
  public gridX: number;
  public gridY: number;

  private buildingSprite: Phaser.GameObjects.Sprite;
  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private stunIndicator: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, def: DefenseTowerDef, gridX: number, gridY: number) {
    super(scene, x, y);
    this.def = def;
    this.hp = def.maxHp;
    this.maxHp = def.maxHp;
    this.gridX = gridX;
    this.gridY = gridY;

    // Sprite
    this.buildingSprite = scene.add.sprite(0, 0, def.texture);
    this.buildingSprite.setOrigin(0.5, 0.75);
    this.add(this.buildingSprite);

    // HP Bar
    this.hpBarBg = scene.add.graphics();
    this.hpBarBg.fillStyle(0x070A13, 0.85);
    this.hpBarBg.fillRect(-18, -38, 36, 4);
    this.add(this.hpBarBg);

    this.hpBarFill = scene.add.graphics();
    this.hpBarFill.fillStyle(0x22C55E, 1);
    this.hpBarFill.fillRect(-17, -37, 34, 2);
    this.add(this.hpBarFill);

    this.setDepth(y + 20);
    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();

    // Floating damage text
    this.showDamageText(amount, 0xF43F5E);

    if (this.hp <= 0) {
      this.destroyBuilding();
    }
  }

  public applyStun(durationMs: number): void {
    this.stunnedUntil = Date.now() + durationMs;
    if (!this.stunIndicator && this.scene) {
      this.stunIndicator = this.scene.add.sprite(0, -42, 'proj_emp_blast');
      this.stunIndicator.setScale(0.4);
      this.add(this.stunIndicator);
      this.scene.tweens.add({
        targets: this.stunIndicator,
        angle: 360,
        duration: 1000,
        repeat: -1
      });
    }
  }

  public update(time: number, targets: CombatUnit[]): void {
    if (this.isDead || this.def.damage <= 0) return;

    // Stun check
    if (Date.now() < this.stunnedUntil) {
      if (this.stunIndicator) this.stunIndicator.setVisible(true);
      return;
    } else if (this.stunIndicator) {
      this.stunIndicator.setVisible(false);
    }

    // Fire rate cooldown
    const cooldownMs = (1 / this.def.fireRate) * 1000;
    if (time - this.lastFireTime < cooldownMs) return;

    // Acquire nearest target in range
    const target = this.findTarget(targets);
    if (target) {
      this.lastFireTime = time;
      this.fireAt(target);
    }
  }

  private findTarget(targets: CombatUnit[]): CombatUnit | null {
    let closest: CombatUnit | null = null;
    let minDist = this.def.range;

    for (const u of targets) {
      if (u.isDead) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y, u.x, u.y);
      if (d < minDist) {
        minDist = d;
        closest = u;
      }
    }
    return closest;
  }

  private fireAt(target: CombatUnit): void {
    if (this.def.type === 'pulse') {
      Audio.playLaserShot();
      this.spawnLaserProjectile(target);
      target.takeDamage(this.def.damage);
    } else if (this.def.type === 'tesla') {
      Audio.playTeslaZap();
      this.drawTeslaArc(target);
      target.takeDamage(this.def.damage);
    } else if (this.def.type === 'mortar') {
      Audio.playMortarLaunch();
      this.spawnMortarShell(target);
    }
  }

  private spawnLaserProjectile(target: CombatUnit): void {
    const laser = this.scene.add.sprite(this.x, this.y - 20, 'proj_laser');
    laser.setDepth(this.y + 100);
    const angle = Phaser.Math.Angle.Between(this.x, this.y - 20, target.x, target.y);
    laser.setRotation(angle);

    this.scene.tweens.add({
      targets: laser,
      x: target.x,
      y: target.y,
      duration: 160,
      ease: 'Linear',
      onComplete: () => laser.destroy()
    });
  }

  private drawTeslaArc(target: CombatUnit): void {
    const arc = this.scene.add.graphics();
    arc.setDepth(this.y + 100);
    arc.lineStyle(2, 0x38BDF8, 0.9);
    arc.lineBetween(this.x, this.y - 30, target.x, target.y - 10);
    this.scene.time.delayedCall(90, () => arc.destroy());
  }

  private spawnMortarShell(target: CombatUnit): void {
    const startX = this.x;
    const startY = this.y - 25;
    const endX = target.x;
    const endY = target.y;

    const shell = this.scene.add.sprite(startX, startY, 'proj_mortar');
    shell.setDepth(2000);

    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 70; // High arc

    let progress = 0;
    const timer = this.scene.time.addEvent({
      delay: 20,
      repeat: 35,
      callback: () => {
        progress += 1 / 35;
        // Quadratic bezier
        const qX = (1 - progress) * (1 - progress) * startX + 2 * (1 - progress) * progress * midX + progress * progress * endX;
        const qY = (1 - progress) * (1 - progress) * startY + 2 * (1 - progress) * progress * midY + progress * progress * endY;
        shell.setPosition(qX, qY);

        if (progress >= 1) {
          shell.destroy();
          Audio.playExplosion();
          this.scene.cameras.main.shake(140, 0.006);
          target.takeDamage(this.def.damage);
        }
      }
    });
  }

  private destroyBuilding(): void {
    this.isDead = true;
    Audio.playDemolition();
    this.scene.cameras.main.shake(160, 0.008);

    // Replace with rubble
    this.buildingSprite.setTexture('building_rubble');
    this.buildingSprite.setOrigin(0.5, 0.5);
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();

    // Spawn destruction smoke
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.sprite(
        this.x + Phaser.Math.Between(-15, 15),
        this.y + Phaser.Math.Between(-15, 10),
        'particle_smoke'
      );
      p.setDepth(this.y + 200);
      this.scene.tweens.add({
        targets: p,
        y: p.y - 25,
        alpha: 0,
        scale: 1.8,
        duration: 700 + i * 100,
        onComplete: () => p.destroy()
      });
    }
  }

  private updateHpBar(): void {
    this.hpBarFill.clear();
    const pct = Math.max(0, this.hp / this.maxHp);
    const color = pct > 0.5 ? 0x22C55E : pct > 0.25 ? 0xF59E0B : 0xEF4444;
    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRect(-17, -37, 34 * pct, 2);
  }

  private showDamageText(amount: number, colorHex: number): void {
    const txt = this.scene.add.text(this.x + Phaser.Math.Between(-10, 10), this.y - 45, `-${Math.round(amount)}`, {
      fontSize: '10px',
      color: '#' + colorHex.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5).setDepth(3000);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 18,
      alpha: 0,
      duration: 650,
      ease: 'Sine.easeOut',
      onComplete: () => txt.destroy()
    });
  }
}

export class CombatUnit extends Phaser.GameObjects.Container implements CombatTarget {
  public def: CombatUnitDef;
  public hp: number;
  public maxHp: number;
  public isDead: boolean = false;
  public lastAttackTime: number = 0;
  public currentTarget: DefenseBuilding | null = null;
  public isPlayerUnit: boolean = true;

  private unitSprite: Phaser.GameObjects.Sprite;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, def: CombatUnitDef, isPlayer: boolean = true) {
    super(scene, x, y);
    this.def = def;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.isPlayerUnit = isPlayer;

    // Sprite
    this.unitSprite = scene.add.sprite(0, 0, `${def.spriteTexture}_0`);
    this.unitSprite.setOrigin(0.5, 0.8);
    this.add(this.unitSprite);

    // HP Bar
    const bg = scene.add.graphics();
    bg.fillStyle(0x070A13, 0.8);
    bg.fillRect(-10, -26, 20, 3);
    this.add(bg);

    this.hpBarFill = scene.add.graphics();
    this.hpBarFill.fillStyle(isPlayer ? 0x06B6D4 : 0xF43F5E, 1);
    this.hpBarFill.fillRect(-9, -25, 18, 1.5);
    this.add(this.hpBarFill);

    this.setDepth(y + 10);
    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;
    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();

    if (this.hp <= 0) {
      this.isDead = true;
      // Death poof
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.5,
        duration: 200,
        onComplete: () => this.destroy()
      });
    }
  }

  public update(time: number, delta: number, buildings: DefenseBuilding[]): void {
    if (this.isDead) return;

    // Animation cycle
    this.animTimer += delta;
    if (this.animTimer > 180) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
      this.unitSprite.setTexture(`${this.def.spriteTexture}_${this.animFrame}`);
    }

    // Target Selection
    if (!this.currentTarget || this.currentTarget.isDead) {
      this.currentTarget = this.acquireTarget(buildings);
    }

    if (!this.currentTarget) return; // All buildings destroyed!

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);

    if (dist <= this.def.range) {
      // In range: Attack!
      const cooldownMs = this.def.attackSpeed * 1000;
      if (time - this.lastAttackTime >= cooldownMs) {
        this.lastAttackTime = time;
        this.performAttack(this.currentTarget);
      }
    } else {
      // Out of range: Move toward target
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
      const step = (this.def.speed * delta) / 1000;
      this.x += Math.cos(angle) * step;
      this.y += Math.sin(angle) * step;
      this.setDepth(this.y + 10);

      // Flip sprite to face direction
      if (Math.cos(angle) < 0) {
        this.unitSprite.setFlipX(true);
      } else {
        this.unitSprite.setFlipX(false);
      }
    }
  }

  private acquireTarget(buildings: DefenseBuilding[]): DefenseBuilding | null {
    const live = buildings.filter(b => !b.isDead);
    if (live.length === 0) return null;

    if (this.def.targetPriority === 'defenses') {
      const defenses = live.filter(b => b.def.type === 'pulse' || b.def.type === 'tesla' || b.def.type === 'mortar');
      if (defenses.length > 0) {
        return this.getClosest(defenses);
      }
    }

    return this.getClosest(live);
  }

  private getClosest(targets: DefenseBuilding[]): DefenseBuilding | null {
    let best: DefenseBuilding | null = null;
    let minDist = 99999;
    for (const t of targets) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y);
      if (d < minDist) {
        minDist = d;
        best = t;
      }
    }
    return best;
  }

  private performAttack(target: DefenseBuilding): void {
    // Attack animation punch/lunge
    this.scene.tweens.add({
      targets: this.unitSprite,
      scaleX: 1.25,
      scaleY: 0.85,
      yoyo: true,
      duration: 100
    });

    if (this.def.bulletType === 'laser') {
      Audio.playLaserShot();
      // Draw tracer line
      const bolt = this.scene.add.sprite(this.x, this.y - 12, 'proj_laser');
      bolt.setDepth(this.y + 100);
      const angle = Phaser.Math.Angle.Between(this.x, this.y - 12, target.x, target.y);
      bolt.setRotation(angle);
      this.scene.tweens.add({
        targets: bolt,
        x: target.x,
        y: target.y,
        duration: 120,
        onComplete: () => bolt.destroy()
      });
    }

    // Breachers deal 2x damage against walls and turrets
    let dmg = this.def.dps * this.def.attackSpeed;
    if (this.def.id === 'obsidian_breacher' && (target.def.type === 'wall' || target.def.type === 'pulse' || target.def.type === 'tesla' || target.def.type === 'mortar')) {
      dmg *= 2.0;
    }

    target.takeDamage(dmg);
  }

  private updateHpBar(): void {
    this.hpBarFill.clear();
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpBarFill.fillStyle(this.isPlayerUnit ? 0x06B6D4 : 0xF43F5E, 1);
    this.hpBarFill.fillRect(-9, -25, 18 * pct, 1.5);
  }
}
