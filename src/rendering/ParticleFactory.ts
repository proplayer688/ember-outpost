import Phaser from 'phaser';

export class ParticleFactory {
  public static createEmberEmitter(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Particles.ParticleEmitter {
    return scene.add.particles(x, y, 'particle_ember', {
      speedY: { min: -20, max: -45 },
      speedX: { min: -10, max: 10 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 1200, max: 2200 },
      frequency: 250,
      blendMode: 'ADD'
    });
  }

  public static createChimneySmoke(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Particles.ParticleEmitter {
    return scene.add.particles(x, y, 'particle_smoke', {
      speedY: { min: -15, max: -30 },
      speedX: { min: -5, max: 12 },
      scale: { start: 0.8, end: 2.2 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 1800, max: 2600 },
      frequency: 400
    });
  }

  public static burstCoinSparks(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'particle_ember', {
      speed: { min: 40, max: 90 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12,
      blendMode: 'ADD',
      emitting: false
    });
    emitter.explode(12);
    scene.time.delayedCall(700, () => emitter.destroy());
  }
}
