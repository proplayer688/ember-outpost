import Phaser from 'phaser';

/**
 * Generates all original, high-fidelity pixel art textures directly into
 * Phaser's Texture Manager during the boot phase, adhering strictly to the Art Bible.
 */
export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    this.generateEnvironment(scene);
    this.generateProps(scene);
    this.generateBuildings(scene);
    this.generateMascot(scene);
    this.generateFriends(scene);
    this.generateResourceNodes(scene);
    this.generateMinigameAssets(scene);
    this.generateVFX(scene);
    this.generateUI(scene);
    this.generateCombatAssets(scene);
  }

  private static generateEnvironment(scene: Phaser.Scene): void {
    // 1. Isometric Ground Tile (32x16 diamond)
    const ground = scene.make.graphics({ x: 0, y: 0 });
    ground.fillStyle(0x0F172A, 1);
    ground.beginPath();
    ground.moveTo(16, 0);
    ground.lineTo(32, 8);
    ground.lineTo(16, 16);
    ground.lineTo(0, 8);
    ground.closePath();
    ground.fillPath();

    // Subtle inner bevel
    ground.lineStyle(1, 0x1E293B, 0.8);
    ground.strokePath();

    // Darker bottom edge for isometric depth
    ground.lineStyle(1, 0x070A13, 1);
    ground.lineBetween(0, 8, 16, 16);
    ground.lineBetween(16, 16, 32, 8);

    // Stone pebble accents
    ground.fillStyle(0x334155, 0.6);
    ground.fillRect(14, 6, 2, 2);
    ground.fillRect(18, 9, 2, 2);
    ground.generateTexture('tile_ground', 32, 16);
    ground.destroy();

    // 2. Isometric Path Tile (32x16 diamond)
    const path = scene.make.graphics({ x: 0, y: 0 });
    path.fillStyle(0x1E293B, 1);
    path.beginPath();
    path.moveTo(16, 0);
    path.lineTo(32, 8);
    path.lineTo(16, 16);
    path.lineTo(0, 8);
    path.closePath();
    path.fillPath();

    // Flagstone texture
    path.lineStyle(1, 0x334155, 0.9);
    path.strokePath();
    path.lineBetween(8, 4, 24, 12);
    path.lineBetween(16, 2, 16, 14);

    path.fillStyle(0x475569, 0.7);
    path.fillRect(10, 6, 3, 2);
    path.fillRect(20, 7, 3, 2);
    path.generateTexture('tile_path', 32, 16);
    path.destroy();

    // 3. Cliff Border Tile (32x24)
    const cliff = scene.make.graphics({ x: 0, y: 0 });
    cliff.fillStyle(0x070A13, 1);
    cliff.beginPath();
    cliff.moveTo(0, 8);
    cliff.lineTo(16, 16);
    cliff.lineTo(32, 8);
    cliff.lineTo(32, 24);
    cliff.lineTo(16, 32);
    cliff.lineTo(0, 24);
    cliff.closePath();
    cliff.fillPath();

    cliff.fillStyle(0x0F172A, 1);
    cliff.fillRect(4, 14, 8, 8);
    cliff.fillRect(20, 14, 8, 8);

    cliff.generateTexture('tile_cliff', 32, 32);
    cliff.destroy();
  }

  private static generateProps(scene: Phaser.Scene): void {
    // 1. Ancient Cyber Tree (48x64)
    const tree = scene.make.graphics({ x: 0, y: 0 });
    // Trunk
    tree.fillStyle(0x070A13, 1);
    tree.fillRect(20, 40, 8, 22);
    tree.fillStyle(0x1E293B, 1);
    tree.fillRect(21, 40, 6, 20);

    // Foliage layers (pine tiers)
    const layers = [
      { y: 32, w: 36, h: 16, c: 0x0D2818 },
      { y: 20, w: 28, h: 14, c: 0x164E2E },
      { y: 8, w: 18, h: 14, c: 0x22C55E }
    ];
    layers.forEach(l => {
      tree.fillStyle(l.c, 1);
      tree.fillTriangle(24 - l.w / 2, l.y + l.h, 24 + l.w / 2, l.y + l.h, 24, l.y);
    });

    // Bioluminescent veins
    tree.fillStyle(0x86EFAC, 0.9);
    tree.fillRect(23, 16, 2, 2);
    tree.fillRect(16, 28, 2, 2);
    tree.fillRect(30, 30, 2, 2);
    tree.fillRect(24, 46, 1, 6);

    tree.generateTexture('prop_tree', 48, 64);
    tree.destroy();

    // 2. Ember Lantern (16x32)
    const lantern = scene.make.graphics({ x: 0, y: 0 });
    // Post
    lantern.fillStyle(0x0F172A, 1);
    lantern.fillRect(7, 12, 3, 20);
    lantern.fillStyle(0x334155, 1);
    lantern.fillRect(8, 12, 1, 18);

    // Lantern box
    lantern.fillStyle(0x070A13, 1);
    lantern.fillRect(4, 4, 8, 10);
    lantern.fillStyle(0xEA580C, 1);
    lantern.fillRect(5, 5, 6, 8);
    lantern.fillStyle(0xFEF08A, 1);
    lantern.fillRect(6, 6, 4, 6);

    lantern.generateTexture('prop_lantern', 16, 32);
    lantern.destroy();

    // 3. Cyber Crystal Node (24x32)
    const crystal = scene.make.graphics({ x: 0, y: 0 });
    crystal.fillStyle(0x083344, 1);
    crystal.beginPath();
    crystal.moveTo(12, 2);
    crystal.lineTo(20, 16);
    crystal.lineTo(12, 30);
    crystal.lineTo(4, 16);
    crystal.closePath();
    crystal.fillPath();

    crystal.fillStyle(0x06B6D4, 0.9);
    crystal.fillTriangle(12, 4, 18, 16, 12, 28);
    crystal.fillStyle(0xE0F2FE, 1);
    crystal.fillTriangle(12, 4, 14, 16, 12, 26);

    crystal.generateTexture('prop_crystal', 24, 32);
    crystal.destroy();

    // 4. Logistics Crate (24x20)
    const crate = scene.make.graphics({ x: 0, y: 0 });
    crate.fillStyle(0x0F172A, 1);
    crate.fillRect(2, 2, 20, 16);
    crate.fillStyle(0x334155, 1);
    crate.fillRect(4, 4, 16, 12);
    crate.fillStyle(0xF59E0B, 0.8);
    crate.fillRect(6, 8, 12, 4);

    crate.generateTexture('prop_crate', 24, 20);
    crate.destroy();

    // 5. Perimeter Fence (32x20)
    const fence = scene.make.graphics({ x: 0, y: 0 });
    fence.fillStyle(0x070A13, 1);
    fence.fillRect(2, 6, 28, 4);
    fence.fillRect(2, 12, 28, 4);
    fence.fillRect(4, 2, 4, 18);
    fence.fillRect(24, 2, 4, 18);
    fence.fillStyle(0x1E293B, 1);
    fence.fillRect(5, 3, 2, 16);
    fence.fillRect(25, 3, 2, 16);

    fence.generateTexture('prop_fence', 32, 20);
    fence.destroy();

    // 6. Contact Shadow (24x12)
    const shadow = scene.make.graphics({ x: 0, y: 0 });
    shadow.fillStyle(0x070A13, 0.45);
    shadow.fillEllipse(12, 6, 20, 10);
    shadow.generateTexture('shadow_blob', 24, 12);
    shadow.destroy();
  }

  private static generateBuildings(scene: Phaser.Scene): void {
    // 1. OUTPOST CORE (96x96)
    const core = scene.make.graphics({ x: 0, y: 0 });
    // Base platform
    core.fillStyle(0x070A13, 1);
    core.fillRect(16, 48, 64, 44);
    core.fillStyle(0x0F172A, 1);
    core.fillRect(20, 50, 56, 40);

    // Tower walls & pillars
    core.fillStyle(0x1E293B, 1);
    core.fillRect(28, 28, 40, 48);
    core.fillStyle(0x334155, 1);
    core.fillRect(32, 30, 8, 44);
    core.fillRect(56, 30, 8, 44);

    // Amber Aether Crystal on Spire
    core.fillStyle(0x7C2D12, 1);
    core.fillRect(44, 16, 8, 16);
    core.fillStyle(0xEA580C, 1);
    core.fillTriangle(48, 4, 56, 20, 40, 20);
    core.fillStyle(0xF59E0B, 1);
    core.fillTriangle(48, 6, 53, 18, 43, 18);
    core.fillStyle(0xFEF08A, 1);
    core.fillTriangle(48, 8, 51, 15, 45, 15);

    // Glowing core gateway
    core.fillStyle(0x070A13, 1);
    core.fillRect(40, 64, 16, 26);
    core.fillStyle(0xF59E0B, 0.9);
    core.fillRect(42, 66, 12, 24);
    core.fillStyle(0xFEF08A, 1);
    core.fillRect(45, 70, 6, 18);

    core.generateTexture('building_outpost_core', 96, 96);
    core.destroy();

    // 2. PRODUCTION HUB / FURNACE (64x64)
    const prod = scene.make.graphics({ x: 0, y: 0 });
    // Foundation
    prod.fillStyle(0x070A13, 1);
    prod.fillRect(8, 24, 48, 36);
    prod.fillStyle(0x1E293B, 1);
    prod.fillRect(12, 26, 40, 32);

    // Chimney
    prod.fillStyle(0x0F172A, 1);
    prod.fillRect(14, 8, 12, 20);
    prod.fillStyle(0x7C2D12, 1);
    prod.fillRect(16, 10, 8, 18);

    // Furnace mouth (Glowing ember fire)
    prod.fillStyle(0x070A13, 1);
    prod.fillRect(26, 36, 20, 18);
    prod.fillStyle(0xEA580C, 1);
    prod.fillRect(28, 38, 16, 14);
    prod.fillStyle(0xF59E0B, 1);
    prod.fillRect(30, 41, 12, 10);
    prod.fillStyle(0xFEF08A, 1);
    prod.fillRect(33, 44, 6, 6);

    prod.generateTexture('building_production_hub', 64, 64);
    prod.destroy();

    // 3. WORKSHOP (64x64)
    const work = scene.make.graphics({ x: 0, y: 0 });
    work.fillStyle(0x070A13, 1);
    work.fillRect(8, 20, 48, 40);
    work.fillStyle(0x0F172A, 1);
    work.fillRect(12, 22, 40, 36);

    // Roof & tech antennae
    work.fillStyle(0x083344, 1);
    work.fillRect(10, 14, 44, 8);
    work.fillStyle(0x06B6D4, 1);
    work.fillRect(14, 6, 2, 10);
    work.fillRect(48, 6, 2, 10);

    // Brass gear emblem
    work.fillStyle(0xF59E0B, 1);
    work.fillCircle(32, 34, 10);
    work.fillStyle(0x0F172A, 1);
    work.fillCircle(32, 34, 5);

    // Doorway
    work.fillStyle(0x06B6D4, 0.8);
    work.fillRect(28, 46, 8, 12);

    work.generateTexture('building_workshop', 64, 64);
    work.destroy();

    // 4. STORAGE VAULT (64x48)
    const stor = scene.make.graphics({ x: 0, y: 0 });
    stor.fillStyle(0x070A13, 1);
    stor.fillRect(8, 12, 48, 32);
    stor.fillStyle(0x1E293B, 1);
    stor.fillRect(12, 14, 40, 28);

    // Reinforced vault door
    stor.fillStyle(0x334155, 1);
    stor.fillCircle(32, 28, 12);
    stor.fillStyle(0x475569, 1);
    stor.fillCircle(32, 28, 8);
    stor.fillStyle(0x38BDF8, 1);
    stor.fillCircle(32, 28, 3);

    stor.generateTexture('building_storage', 64, 48);
    stor.destroy();

    // 5. DEFENSE TOWER (48x80)
    const def = scene.make.graphics({ x: 0, y: 0 });
    def.fillStyle(0x070A13, 1);
    def.fillRect(12, 28, 24, 48);
    def.fillStyle(0x0F172A, 1);
    def.fillRect(14, 30, 20, 44);

    // Tower head & Sentry Eye
    def.fillStyle(0x1E293B, 1);
    def.fillRect(8, 12, 32, 18);
    def.fillStyle(0xF43F5E, 1);
    def.fillCircle(24, 21, 6);
    def.fillStyle(0xFFFFFF, 1);
    def.fillCircle(24, 21, 2);

    // Sentry spikes
    def.fillStyle(0x334155, 1);
    def.fillRect(6, 6, 4, 8);
    def.fillRect(38, 6, 4, 8);

    def.generateTexture('building_defense_tower', 48, 80);
    def.destroy();

    // 6. TRAINING STATION (64x64)
    const train = scene.make.graphics({ x: 0, y: 0 });
    train.fillStyle(0x070A13, 1);
    train.fillRect(8, 24, 48, 36);
    train.fillStyle(0x164E2E, 1);
    train.fillRect(12, 26, 40, 32);

    // Training ring posts
    train.fillStyle(0x22C55E, 1);
    train.fillRect(14, 20, 4, 16);
    train.fillRect(46, 20, 4, 16);
    train.lineStyle(1, 0x86EFAC, 0.8);
    train.lineBetween(18, 24, 46, 24);
    train.lineBetween(18, 30, 46, 30);

    // Punch dummy
    train.fillStyle(0xF59E0B, 1);
    train.fillCircle(32, 36, 5);
    train.fillRect(30, 41, 4, 10);

    train.generateTexture('building_training_station', 64, 64);
    train.destroy();

    // 7. FRIEND GATE (96x80)
    const gate = scene.make.graphics({ x: 0, y: 0 });
    // Archway columns
    gate.fillStyle(0x070A13, 1);
    gate.fillRect(12, 20, 20, 56);
    gate.fillRect(64, 20, 20, 56);
    gate.fillStyle(0x1E293B, 1);
    gate.fillRect(16, 24, 12, 50);
    gate.fillRect(68, 24, 12, 50);

    // Archway beam
    gate.fillStyle(0x0F172A, 1);
    gate.fillRect(12, 12, 72, 14);

    // Aether Swirling Portal
    gate.fillStyle(0x312E81, 1);
    gate.fillEllipse(48, 48, 32, 42);
    gate.fillStyle(0x6366F1, 0.9);
    gate.fillEllipse(48, 48, 22, 32);
    gate.fillStyle(0x38BDF8, 0.9);
    gate.fillEllipse(48, 48, 12, 18);
    gate.fillStyle(0xE0F2FE, 1);
    gate.fillCircle(48, 48, 4);

    gate.generateTexture('building_friend_gate', 96, 80);
    gate.destroy();

    // 8. CHALLENGE BOARD (48x48)
    const board = scene.make.graphics({ x: 0, y: 0 });
    board.fillStyle(0x070A13, 1);
    board.fillRect(6, 6, 36, 30);
    board.fillStyle(0x1E293B, 1);
    board.fillRect(8, 8, 32, 26);

    // Posts
    board.fillStyle(0x0F172A, 1);
    board.fillRect(12, 36, 4, 10);
    board.fillRect(32, 36, 4, 10);

    // Glowing screen (The Forge Sync preview)
    board.fillStyle(0xF59E0B, 0.9);
    board.fillRect(11, 11, 26, 20);
    board.fillStyle(0xFEF08A, 1);
    board.fillRect(14, 14, 20, 3);
    board.fillRect(14, 20, 14, 3);
    board.fillRect(14, 26, 8, 3);

    board.generateTexture('building_challenge_board', 48, 48);
    board.destroy();
  }

  private static generateMascot(scene: Phaser.Scene): void {
    // Generates 4-directional frames for Ignis the Keeper (24x32)
    // Directions: Down, Up, Left, Right (4 frames each)
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      for (let frame = 0; frame < 4; frame++) {
        const m = scene.make.graphics({ x: 0, y: 0 });
        const stepOffset = (frame === 1 || frame === 3) ? (dir === 'left' || dir === 'right' ? 1 : 2) : 0;
        const bob = (frame === 1 || frame === 3) ? 1 : 0;

        // Feet (Stride animation)
        m.fillStyle(0x070A13, 1);
        if (dir === 'down' || dir === 'up') {
          const footY = 26 - bob;
          const leftFootX = 7 - (frame === 1 ? 2 : 0);
          const rightFootX = 13 + (frame === 3 ? 2 : 0);
          m.fillRect(leftFootX, footY, 4, 5);
          m.fillRect(rightFootX, footY, 4, 5);
          m.fillStyle(0x1E293B, 1);
          m.fillRect(leftFootX + 1, footY + 1, 2, 3);
          m.fillRect(rightFootX + 1, footY + 1, 2, 3);
        } else {
          const footY = 26 - bob;
          const footX = 10 + (frame === 1 ? -3 : frame === 3 ? 3 : 0);
          m.fillRect(footX, footY, 5, 5);
          m.fillStyle(0x1E293B, 1);
          m.fillRect(footX + 1, footY + 1, 3, 3);
        }

        // Body / Cloak (Twilight Indigo)
        m.fillStyle(0x312E81, 1);
        m.fillRect(6, 12 - bob, 12, 14);
        m.fillStyle(0x6366F1, 1);
        m.fillRect(7, 13 - bob, 10, 12);

        // Utility Belt & Emissive Pip
        m.fillStyle(0x7C2D12, 1);
        m.fillRect(6, 21 - bob, 12, 3);
        m.fillStyle(0xF59E0B, 1);
        m.fillRect(10, 21 - bob, 4, 3);

        // Coral Scarf (reacts to motion)
        m.fillStyle(0xF43F5E, 1);
        m.fillRect(5, 10 - bob, 14, 5);
        if (dir === 'left') {
          m.fillRect(17, 12 - bob, 4 + stepOffset, 3); // trailing scarf
        } else if (dir === 'right') {
          m.fillRect(3 - stepOffset, 12 - bob, 4, 3);
        } else {
          m.fillRect(8, 14 - bob, 4, 5);
        }

        // Head & Hood
        m.fillStyle(0x312E81, 1);
        m.fillRect(5, 3 - bob, 14, 9);
        m.fillStyle(0x6366F1, 1);
        m.fillRect(6, 4 - bob, 12, 7);

        // Amber Visor (Eyes)
        if (dir === 'down') {
          m.fillStyle(0x070A13, 1);
          m.fillRect(7, 6 - bob, 10, 4);
          m.fillStyle(0xF59E0B, 1);
          m.fillRect(8, 7 - bob, 3, 2);
          m.fillRect(13, 7 - bob, 3, 2);
          m.fillStyle(0xFFFFFF, 1);
          m.fillRect(8, 7 - bob, 1, 1);
          m.fillRect(13, 7 - bob, 1, 1);
        } else if (dir === 'left') {
          m.fillStyle(0x070A13, 1);
          m.fillRect(6, 6 - bob, 6, 4);
          m.fillStyle(0xF59E0B, 1);
          m.fillRect(7, 7 - bob, 3, 2);
          m.fillStyle(0xFFFFFF, 1);
          m.fillRect(7, 7 - bob, 1, 1);
        } else if (dir === 'right') {
          m.fillStyle(0x070A13, 1);
          m.fillRect(12, 6 - bob, 6, 4);
          m.fillStyle(0xF59E0B, 1);
          m.fillRect(14, 7 - bob, 3, 2);
          m.fillStyle(0xFFFFFF, 1);
          m.fillRect(16, 7 - bob, 1, 1);
        }
        // If up, back of hood is shown without eyes

        m.generateTexture(`ignis_${dir}_${frame}`, 24, 32);
        m.destroy();
      }
    });
  }

  private static generateVFX(scene: Phaser.Scene): void {
    // 1. Ember Spark
    const spark = scene.make.graphics({ x: 0, y: 0 });
    spark.fillStyle(0xF59E0B, 1);
    spark.fillRect(1, 0, 2, 4);
    spark.fillRect(0, 1, 4, 2);
    spark.fillStyle(0xFEF08A, 1);
    spark.fillRect(1, 1, 2, 2);
    spark.generateTexture('particle_ember', 4, 4);
    spark.destroy();

    // 2. Smoke Puff
    const smoke = scene.make.graphics({ x: 0, y: 0 });
    smoke.fillStyle(0x475569, 0.7);
    smoke.fillCircle(3, 3, 3);
    smoke.fillStyle(0x64748B, 0.9);
    smoke.fillCircle(3, 3, 1.5);
    smoke.generateTexture('particle_smoke', 6, 6);
    smoke.destroy();

    // 3. Radial Glow Light Cookie (64x64)
    const glow = scene.make.graphics({ x: 0, y: 0 });
    for (let r = 32; r > 0; r -= 4) {
      const alpha = (1 - r / 32) * 0.15;
      glow.fillStyle(0xF59E0B, alpha);
      glow.fillCircle(32, 32, r);
    }
    glow.generateTexture('light_glow', 64, 64);
    glow.destroy();
  }

  private static generateUI(scene: Phaser.Scene): void {
    // 1. Contextual Badge [E] (28x14)
    const badge = scene.make.graphics({ x: 0, y: 0 });
    badge.fillStyle(0x070A13, 0.9);
    badge.fillRoundedRect(0, 0, 28, 14, 3);
    badge.lineStyle(1, 0xF59E0B, 1);
    badge.strokeRoundedRect(0, 0, 28, 14, 3);
    badge.generateTexture('prompt_badge', 28, 14);
    badge.destroy();

    // 2. HUD Coin Icon (16x16)
    const coin = scene.make.graphics({ x: 0, y: 0 });
    coin.fillStyle(0x070A13, 1);
    coin.fillCircle(8, 8, 7);
    coin.fillStyle(0xEA580C, 1);
    coin.fillCircle(8, 8, 6);
    coin.fillStyle(0xF59E0B, 1);
    coin.fillCircle(8, 8, 5);
    coin.fillStyle(0xFEF08A, 1);
    coin.fillRect(7, 5, 2, 6);
    coin.generateTexture('hud_coin', 16, 16);
    coin.destroy();

    // 3. HUD Diamond Icon (16x16)
    const diamond = scene.make.graphics({ x: 0, y: 0 });
    diamond.fillStyle(0x083344, 1);
    diamond.beginPath();
    diamond.moveTo(8, 1);
    diamond.lineTo(15, 8);
    diamond.lineTo(8, 15);
    diamond.lineTo(1, 8);
    diamond.closePath();
    diamond.fillPath();
    diamond.fillStyle(0x38BDF8, 1);
    diamond.fillTriangle(8, 3, 13, 8, 8, 13);
    diamond.fillStyle(0xE0F2FE, 1);
    diamond.fillTriangle(8, 3, 10, 8, 8, 11);
    diamond.generateTexture('hud_diamond', 16, 16);
    diamond.destroy();

    // 4. HUD Simulated RF Token Glyph (16x16)
    const rf = scene.make.graphics({ x: 0, y: 0 });
    rf.fillStyle(0x070A13, 1);
    rf.fillRect(1, 1, 14, 14);
    rf.lineStyle(1, 0x06B6D4, 1);
    rf.strokeRect(1, 1, 14, 14);
    rf.fillStyle(0x06B6D4, 1);
    rf.fillRect(4, 4, 3, 8);
    rf.fillRect(7, 4, 4, 3);
    rf.fillRect(7, 7, 3, 2);
    rf.fillRect(8, 9, 3, 3);
    rf.generateTexture('hud_rf', 16, 16);
    rf.destroy();

    // 5. Virtual Joystick Base (96x96) & Knob (40x40)
    const jBase = scene.make.graphics({ x: 0, y: 0 });
    jBase.fillStyle(0x0F172A, 0.45);
    jBase.fillCircle(48, 48, 46);
    jBase.lineStyle(2, 0x38BDF8, 0.7);
    jBase.strokeCircle(48, 48, 46);
    jBase.generateTexture('joystick_base', 96, 96);
    jBase.destroy();

    const jKnob = scene.make.graphics({ x: 0, y: 0 });
    jKnob.fillStyle(0x1E293B, 0.85);
    jKnob.fillCircle(20, 20, 18);
    jKnob.lineStyle(2, 0xF59E0B, 1);
    jKnob.strokeCircle(20, 20, 18);
    jKnob.fillStyle(0xFEF08A, 1);
    jKnob.fillCircle(20, 20, 4);
    jKnob.generateTexture('joystick_knob', 40, 40);
    jKnob.destroy();

    // 6. Action Button (56x56)
    const actBtn = scene.make.graphics({ x: 0, y: 0 });
    actBtn.fillStyle(0x0F172A, 0.85);
    actBtn.fillCircle(28, 28, 26);
    actBtn.lineStyle(2, 0x22C55E, 1);
    actBtn.strokeCircle(28, 28, 26);
    actBtn.generateTexture('touch_action_btn', 56, 56);
    actBtn.destroy();

    // 7. HUD Wood Icon (16x16)
    const woodIcon = scene.make.graphics({ x: 0, y: 0 });
    woodIcon.fillStyle(0x070A13, 1);
    woodIcon.fillRoundedRect(1, 3, 14, 10, 2);
    woodIcon.fillStyle(0x7C2D12, 1);
    woodIcon.fillRect(2, 4, 12, 8);
    woodIcon.fillStyle(0xEA580C, 1);
    woodIcon.fillRect(4, 5, 8, 6);
    woodIcon.fillStyle(0xFEF08A, 1);
    woodIcon.fillRect(7, 7, 2, 2);
    woodIcon.generateTexture('hud_wood', 16, 16);
    woodIcon.destroy();

    // 8. HUD Crystal Icon (16x16)
    const cryIcon = scene.make.graphics({ x: 0, y: 0 });
    cryIcon.fillStyle(0x083344, 1);
    cryIcon.beginPath();
    cryIcon.moveTo(8, 1);
    cryIcon.lineTo(15, 8);
    cryIcon.lineTo(8, 15);
    cryIcon.lineTo(1, 8);
    cryIcon.closePath();
    cryIcon.fillPath();
    cryIcon.fillStyle(0x06B6D4, 1);
    cryIcon.fillTriangle(8, 3, 13, 8, 8, 13);
    cryIcon.fillStyle(0xE0F2FE, 1);
    cryIcon.fillTriangle(8, 3, 10, 8, 8, 10);
    cryIcon.generateTexture('hud_crystal', 16, 16);
    cryIcon.destroy();

    // 9. HUD Stone Icon (16x16)
    const stoneIcon = scene.make.graphics({ x: 0, y: 0 });
    stoneIcon.fillStyle(0x070A13, 1);
    stoneIcon.fillRect(2, 3, 12, 10);
    stoneIcon.fillStyle(0x1E293B, 1);
    stoneIcon.fillRect(3, 4, 10, 8);
    stoneIcon.fillStyle(0x334155, 1);
    stoneIcon.fillRect(4, 5, 4, 4);
    stoneIcon.fillStyle(0x94A3B8, 1);
    stoneIcon.fillRect(9, 7, 3, 3);
    stoneIcon.generateTexture('hud_stone', 16, 16);
    stoneIcon.destroy();
  }

  private static generateFriends(scene: Phaser.Scene): void {
    // Generates 2-frame pixel art sprites (24x32) for 7 original Friend NPCs
    const friends = [
      { id: 'milo', body: 0x164E2E, vest: 0x22C55E, detail: 0xEA580C, accessory: 'goggles' },
      { id: 'bram', body: 0x7C2D12, vest: 0xF59E0B, detail: 0xFEF08A, accessory: 'keys' },
      { id: 'vex',  body: 0x083344, vest: 0x1E293B, detail: 0x06B6D4, accessory: 'antenna' },
      { id: 'kael', body: 0x881337, vest: 0xFB7185, detail: 0xFFFFFF, accessory: 'headband' },
      { id: 'pip',  body: 0x0369A1, vest: 0x38BDF8, detail: 0xFEF08A, accessory: 'cape' },
      { id: 'nova', body: 0x9A3412, vest: 0xEA580C, detail: 0xFEF08A, accessory: 'wrench' },
      { id: 'cleo', body: 0x4C1D95, vest: 0xC084FC, detail: 0x38BDF8, accessory: 'orb' }
    ];

    friends.forEach(f => {
      for (let frame = 0; frame < 2; frame++) {
        const g = scene.make.graphics({ x: 0, y: 0 });
        const bob = frame === 1 ? 1 : 0;

        // Shadow beneath feet
        g.fillStyle(0x070A13, 0.4);
        g.fillEllipse(12, 30, 14, 5);

        // Feet / Boots
        g.fillStyle(0x070A13, 1);
        if (frame === 0) {
          g.fillRect(7, 26, 4, 5);
          g.fillRect(13, 26, 4, 5);
        } else {
          g.fillRect(6, 25, 4, 5);
          g.fillRect(14, 27, 4, 4);
        }

        // Body / Robe / Trench
        g.fillStyle(f.body, 1);
        g.fillRect(6, 12 - bob, 12, 14);
        g.fillStyle(f.vest, 1);
        g.fillRect(8, 13 - bob, 8, 11);

        // Head
        g.fillStyle(f.body, 1);
        g.fillRect(6, 4 - bob, 12, 9);
        g.fillStyle(0x070A13, 1);
        g.fillRect(7, 6 - bob, 10, 4);

        // Eyes
        g.fillStyle(f.detail, 1);
        g.fillRect(8, 7 - bob, 2, 2);
        g.fillRect(14, 7 - bob, 2, 2);

        // Distinct Accessory Rendering
        if (f.accessory === 'goggles') {
          // Milo: Brass dual goggles on forehead
          g.fillStyle(0x7C2D12, 1);
          g.fillRect(6, 3 - bob, 12, 3);
          g.fillStyle(0xF59E0B, 1);
          g.fillRect(7, 3 - bob, 3, 2);
          g.fillRect(14, 3 - bob, 3, 2);
        } else if (f.accessory === 'keys') {
          // Bram: Heavy coat collar & golden key on hip
          g.fillStyle(0x0F172A, 1);
          g.fillRect(5, 11 - bob, 14, 3);
          g.fillStyle(0xF59E0B, 1);
          g.fillRect(15, 21 - bob, 3, 4);
        } else if (f.accessory === 'antenna') {
          // Vex: Tall comms antenna
          g.fillStyle(0x334155, 1);
          g.fillRect(15, 0 - bob, 2, 6);
          g.fillStyle(0x06B6D4, 1);
          g.fillRect(14, 0 - bob, 4, 2);
        } else if (f.accessory === 'headband') {
          // Kael: Martial headband with knot
          g.fillStyle(0xFFFFFF, 1);
          g.fillRect(5, 4 - bob, 14, 2);
          g.fillRect(16, 5 - bob, 4, 3);
        } else if (f.accessory === 'cape') {
          // Pip: Swift scout cape
          g.fillStyle(0x06B6D4, 1);
          g.fillRect(4, 13 - bob, 3, 9);
          g.fillRect(17, 13 - bob, 3, 9);
        } else if (f.accessory === 'wrench') {
          // Nova: Big mechanical wrench slung at hip
          g.fillStyle(0x334155, 1);
          g.fillRect(16, 15 - bob, 3, 8);
          g.fillStyle(0x94A3B8, 1);
          g.fillRect(15, 14 - bob, 5, 3);
        } else if (f.accessory === 'orb') {
          // Cleo: Hovering celestial aether orb
          const orbY = 7 + (frame === 1 ? -2 : 0);
          g.fillStyle(0x06B6D4, 0.4);
          g.fillCircle(19, orbY, 4);
          g.fillStyle(0x38BDF8, 0.9);
          g.fillCircle(19, orbY, 2.5);
          g.fillStyle(0xFFFFFF, 1);
          g.fillCircle(19, orbY, 1);
        }

        g.generateTexture(`friend_${f.id}_${frame}`, 24, 32);
        g.destroy();
      }
    });
  }

  private static generateResourceNodes(scene: Phaser.Scene): void {
    // 1. Wood Node (Ancient Timber Stump with glowing rings) (32x28)
    const wood = scene.make.graphics({ x: 0, y: 0 });
    wood.fillStyle(0x070A13, 0.5);
    wood.fillEllipse(16, 25, 24, 6); // shadow

    wood.fillStyle(0x0F172A, 1);
    wood.fillRect(8, 12, 16, 12);
    wood.fillStyle(0x1E293B, 1);
    wood.fillRect(9, 13, 14, 10);

    // Cut surface with glowing rings
    wood.fillStyle(0x7C2D12, 1);
    wood.fillEllipse(16, 12, 18, 10);
    wood.fillStyle(0xEA580C, 1);
    wood.fillEllipse(16, 12, 12, 6);
    wood.fillStyle(0xFEF08A, 1);
    wood.fillCircle(16, 12, 2.5);

    // Sprout leaf
    wood.fillStyle(0x22C55E, 1);
    wood.fillRect(19, 7, 3, 4);
    wood.fillRect(21, 6, 3, 2);
    wood.generateTexture('node_wood', 32, 28);
    wood.destroy();

    // 1b. Wood Node Depleted (32x28)
    const woodDep = scene.make.graphics({ x: 0, y: 0 });
    woodDep.fillStyle(0x070A13, 0.4);
    woodDep.fillEllipse(16, 25, 20, 5);
    woodDep.fillStyle(0x0F172A, 1);
    woodDep.fillRect(10, 16, 12, 8);
    woodDep.fillStyle(0x334155, 0.7);
    woodDep.fillEllipse(16, 16, 14, 6);
    woodDep.generateTexture('node_wood_depleted', 32, 28);
    woodDep.destroy();

    // 2. Crystal Node (Aether Crystal Cluster) (32x34)
    const cry = scene.make.graphics({ x: 0, y: 0 });
    cry.fillStyle(0x070A13, 0.5);
    cry.fillEllipse(16, 30, 22, 6);

    // Base rock
    cry.fillStyle(0x0F172A, 1);
    cry.fillRoundedRect(7, 20, 18, 10, 3);

    // Center Spire
    cry.fillStyle(0x083344, 1);
    cry.fillTriangle(16, 3, 10, 24, 22, 24);
    cry.fillStyle(0x06B6D4, 0.95);
    cry.fillTriangle(16, 4, 13, 23, 21, 23);
    cry.fillStyle(0x38BDF8, 1);
    cry.fillTriangle(16, 5, 15, 18, 20, 22);
    cry.fillStyle(0xE0F2FE, 1);
    cry.fillRect(15, 5, 2, 4);

    // Flank Spires
    cry.fillStyle(0x06B6D4, 0.9);
    cry.fillTriangle(9, 10, 5, 24, 13, 24);
    cry.fillTriangle(23, 12, 19, 24, 27, 24);
    cry.generateTexture('node_crystal', 32, 34);
    cry.generateTexture('node_crystals', 32, 34);
    cry.destroy();

    // 2b. Crystal Depleted (32x34)
    const cryDep = scene.make.graphics({ x: 0, y: 0 });
    cryDep.fillStyle(0x070A13, 0.4);
    cryDep.fillEllipse(16, 30, 18, 5);
    cryDep.fillStyle(0x0F172A, 1);
    cryDep.fillRoundedRect(8, 22, 16, 8, 2);
    cryDep.fillStyle(0x083344, 0.8);
    cryDep.fillTriangle(16, 18, 12, 24, 20, 24);
    cryDep.generateTexture('node_crystal_depleted', 32, 34);
    cryDep.generateTexture('node_crystals_depleted', 32, 34);
    cryDep.destroy();

    // 3. Stone Node (Obsidian Quarry Boulder) (32x28)
    const stone = scene.make.graphics({ x: 0, y: 0 });
    stone.fillStyle(0x070A13, 0.5);
    stone.fillEllipse(16, 25, 24, 6);

    // Stone facets
    stone.fillStyle(0x0F172A, 1);
    stone.fillRoundedRect(5, 8, 22, 17, 3);
    stone.fillStyle(0x1E293B, 1);
    stone.fillRoundedRect(7, 10, 18, 13, 2);
    stone.fillStyle(0x334155, 1);
    stone.fillRect(10, 12, 6, 7);

    // Amber mineral vein
    stone.fillStyle(0xF59E0B, 1);
    stone.fillRect(16, 11, 2, 4);
    stone.fillRect(18, 14, 3, 3);
    stone.fillRect(12, 17, 4, 2);
    stone.generateTexture('node_stone', 32, 28);
    stone.destroy();

    // 3b. Stone Depleted (32x28)
    const stoneDep = scene.make.graphics({ x: 0, y: 0 });
    stoneDep.fillStyle(0x070A13, 0.4);
    stoneDep.fillEllipse(16, 25, 20, 5);
    stoneDep.fillStyle(0x0F172A, 1);
    stoneDep.fillRoundedRect(8, 18, 16, 7, 2);
    stoneDep.fillStyle(0x1E293B, 0.7);
    stoneDep.fillRect(11, 19, 10, 4);
    stoneDep.generateTexture('node_stone_depleted', 32, 28);
    stoneDep.destroy();
  }

  private static generateMinigameAssets(scene: Phaser.Scene): void {
    // 1. The Forge Sync Gauge (320x26)
    const gauge = scene.make.graphics({ x: 0, y: 0 });
    // Outer Frame
    gauge.fillStyle(0x070A13, 1);
    gauge.fillRoundedRect(0, 0, 320, 26, 4);
    gauge.lineStyle(2, 0x1E293B, 1);
    gauge.strokeRoundedRect(0, 0, 320, 26, 4);

    // Red Outer Zones (MISS)
    gauge.fillStyle(0x7C2D12, 0.7);
    gauge.fillRect(4, 4, 312, 18);

    // White Zones (GOOD: 40 pts) - from 60 to 260
    gauge.fillStyle(0x334155, 1);
    gauge.fillRect(50, 4, 220, 18);

    // Cyan Zones (EXCELLENT: 75 pts) - from 110 to 210
    gauge.fillStyle(0x06B6D4, 0.9);
    gauge.fillRect(100, 4, 120, 18);

    // Center Gold Zone (PERFECT: 100 pts) - from 140 to 180
    gauge.fillStyle(0xF59E0B, 1);
    gauge.fillRect(142, 4, 36, 18);
    gauge.fillStyle(0xFEF08A, 1);
    gauge.fillRect(156, 4, 8, 18); // center sweet spot

    // Center Strike Mark
    gauge.lineStyle(2, 0xFFFFFF, 1);
    gauge.lineBetween(160, 2, 160, 24);

    gauge.generateTexture('challenge_gauge', 320, 26);
    gauge.destroy();

    // 2. Needle Indicator (12x30)
    const needle = scene.make.graphics({ x: 0, y: 0 });
    needle.fillStyle(0x070A13, 1);
    needle.fillTriangle(6, 0, 0, 28, 12, 28);
    needle.fillStyle(0xEA580C, 1);
    needle.fillTriangle(6, 2, 1, 26, 11, 26);
    needle.fillStyle(0xFEF08A, 1);
    needle.fillTriangle(6, 4, 3, 24, 9, 24);
    needle.fillRect(5, 4, 2, 24);
    needle.generateTexture('challenge_needle', 12, 30);
    needle.destroy();
  }

  private static generateCombatAssets(scene: Phaser.Scene): void {
    // --- 1. COMBAT UNITS ---
    // A. Volt Imp (24x28, 2 frames)
    for (let f = 0; f < 2; f++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const bob = f === 1 ? 1 : 0;
      // Shadow
      g.fillStyle(0x070A13, 0.4);
      g.fillEllipse(12, 26, 12, 4);
      // Feet
      g.fillStyle(0x064E3B, 1);
      g.fillRect(7, 22, 3, 4);
      g.fillRect(14, 22, 3, 4);
      // Cloaked Body
      g.fillStyle(0x065F46, 1);
      g.fillRect(6, 11 - bob, 12, 12);
      g.fillStyle(0x10B981, 1);
      g.fillRect(8, 12 - bob, 8, 9);
      // Hood & Head
      g.fillStyle(0x064E3B, 1);
      g.fillRect(6, 4 - bob, 12, 8);
      // Sharp glowing eyes
      g.fillStyle(0xFEF08A, 1);
      g.fillRect(8, 7 - bob, 3, 2);
      g.fillRect(13, 7 - bob, 3, 2);
      // Dual Energy Blades
      g.fillStyle(0x34D399, 1);
      g.fillRect(3, 10 - bob, 3, 10);
      g.fillRect(18, 10 - bob, 3, 10);
      g.fillStyle(0xA7F3D0, 1);
      g.fillRect(4, 11 - bob, 1, 8);
      g.fillRect(19, 11 - bob, 1, 8);

      g.generateTexture(`unit_volt_imp_${f}`, 24, 28);
      g.destroy();
    }

    // B. Pulse Ranger (24x28, 2 frames)
    for (let f = 0; f < 2; f++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const bob = f === 1 ? 1 : 0;
      // Shadow
      g.fillStyle(0x070A13, 0.4);
      g.fillEllipse(12, 26, 12, 4);
      // Boots
      g.fillStyle(0x082F49, 1);
      g.fillRect(7, 22, 3, 4);
      g.fillRect(14, 22, 3, 4);
      // Armor Tunic
      g.fillStyle(0x0369A1, 1);
      g.fillRect(6, 11 - bob, 12, 12);
      g.fillStyle(0x38BDF8, 1);
      g.fillRect(8, 12 - bob, 8, 9);
      // Helmet & Visor
      g.fillStyle(0x082F49, 1);
      g.fillRect(6, 3 - bob, 12, 9);
      g.fillStyle(0x06B6D4, 1);
      g.fillRect(7, 6 - bob, 10, 3);
      g.fillStyle(0xE0F2FE, 1);
      g.fillRect(8, 7 - bob, 4, 1);
      // Long Cyber Rifle
      g.fillStyle(0x1E293B, 1);
      g.fillRect(14, 13 - bob, 9, 3);
      g.fillStyle(0x38BDF8, 1);
      g.fillRect(20, 12 - bob, 3, 2);

      g.generateTexture(`unit_pulse_ranger_${f}`, 24, 28);
      g.destroy();
    }

    // C. Obsidian Breacher (32x36, 2 frames)
    for (let f = 0; f < 2; f++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const bob = f === 1 ? 1 : 0;
      // Heavy Shadow
      g.fillStyle(0x070A13, 0.5);
      g.fillEllipse(16, 33, 22, 6);
      // Thick stone legs
      g.fillStyle(0x0F172A, 1);
      g.fillRect(8, 26, 6, 7);
      g.fillRect(18, 26, 6, 7);
      // Massive Torso
      g.fillStyle(0x1E293B, 1);
      g.fillRect(5, 11 - bob, 22, 16);
      g.fillStyle(0x334155, 1);
      g.fillRect(7, 13 - bob, 18, 12);
      // Molten magma core
      g.fillStyle(0xEA580C, 1);
      g.fillRect(12, 15 - bob, 8, 7);
      g.fillStyle(0xF59E0B, 1);
      g.fillRect(13, 16 - bob, 6, 5);
      g.fillStyle(0xFEF08A, 1);
      g.fillRect(15, 18 - bob, 2, 2);
      // Stone Head / Brow
      g.fillStyle(0x0F172A, 1);
      g.fillRect(8, 4 - bob, 16, 8);
      g.fillStyle(0xF59E0B, 1);
      g.fillRect(11, 7 - bob, 3, 2);
      g.fillRect(18, 7 - bob, 3, 2);
      // Heavy Fists
      g.fillStyle(0xF97316, 1);
      g.fillRect(2, 17 - bob, 5, 8);
      g.fillRect(25, 17 - bob, 5, 8);

      g.generateTexture(`unit_obsidian_golem_${f}`, 32, 36);
      g.destroy();
    }

    // D. EMP Drone (24x24, 2 frames)
    for (let f = 0; f < 2; f++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const bob = f === 1 ? 1 : -1;
      // Outer aura
      g.fillStyle(0x8B5CF6, 0.3);
      g.fillCircle(12, 12 + bob, 10);
      // Core Chassis
      g.fillStyle(0x4C1D95, 1);
      g.fillCircle(12, 12 + bob, 7);
      g.fillStyle(0xA855F7, 1);
      g.fillCircle(12, 12 + bob, 5);
      // Electric Pips
      g.fillStyle(0x06B6D4, 1);
      g.fillRect(11, 4 + bob, 2, 2);
      g.fillRect(11, 18 + bob, 2, 2);
      g.fillRect(4, 11 + bob, 2, 2);
      g.fillRect(18, 11 + bob, 2, 2);
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(12, 12 + bob, 2);

      g.generateTexture(`unit_emp_drone_${f}`, 24, 24);
      g.destroy();
    }

    // --- 2. DEFENSIVE TURRETS ---
    // A. Pulse Turret (36x44)
    const pt = scene.make.graphics({ x: 0, y: 0 });
    // Pedestal
    pt.fillStyle(0x070A13, 1);
    pt.fillRect(6, 26, 24, 16);
    pt.fillStyle(0x1E293B, 1);
    pt.fillRect(8, 28, 20, 12);
    // Swivel Turret Head
    pt.fillStyle(0x0F172A, 1);
    pt.fillRect(9, 14, 18, 14);
    pt.fillStyle(0x334155, 1);
    pt.fillRect(11, 16, 14, 10);
    // Dual Blaster Barrels
    pt.fillStyle(0x22C55E, 1);
    pt.fillRect(12, 4, 3, 12);
    pt.fillRect(21, 4, 3, 12);
    pt.fillStyle(0x86EFAC, 1);
    pt.fillRect(12, 2, 3, 3);
    pt.fillRect(21, 2, 3, 3);
    pt.generateTexture('turret_pulse', 36, 44);
    pt.destroy();

    // B. Tesla Coil (36x48)
    const tc = scene.make.graphics({ x: 0, y: 0 });
    // Iron Base
    tc.fillStyle(0x070A13, 1);
    tc.fillRect(6, 32, 24, 14);
    tc.fillStyle(0x7C2D12, 1);
    tc.fillRect(8, 34, 20, 10);
    // Insulator Ring Stack
    tc.fillStyle(0x0369A1, 1);
    tc.fillRect(11, 26, 14, 4);
    tc.fillRect(13, 20, 10, 4);
    tc.fillRect(11, 14, 14, 4);
    // Copper Spire
    tc.fillStyle(0xEA580C, 1);
    tc.fillRect(16, 8, 4, 24);
    // Electric Sphere Top
    tc.fillStyle(0x06B6D4, 0.4);
    tc.fillCircle(18, 8, 9);
    tc.fillStyle(0x38BDF8, 0.9);
    tc.fillCircle(18, 8, 6);
    tc.fillStyle(0xFFFFFF, 1);
    tc.fillCircle(18, 8, 2.5);
    tc.generateTexture('turret_tesla', 36, 48);
    tc.destroy();

    // C. Plasma Mortar (40x44)
    const pm = scene.make.graphics({ x: 0, y: 0 });
    // Base Plate
    pm.fillStyle(0x070A13, 1);
    pm.fillRect(4, 28, 32, 14);
    pm.fillStyle(0x1E293B, 1);
    pm.fillRect(6, 30, 28, 10);
    // Heavy Angled Mortar Tube
    pm.fillStyle(0x334155, 1);
    pm.beginPath();
    pm.moveTo(12, 30);
    pm.lineTo(26, 6);
    pm.lineTo(34, 11);
    pm.lineTo(20, 32);
    pm.closePath();
    pm.fillPath();
    // Glowing Barrel Muzzle
    pm.fillStyle(0xF59E0B, 1);
    pm.fillCircle(29, 9, 5);
    pm.fillStyle(0xFEF08A, 1);
    pm.fillCircle(29, 9, 2.5);
    pm.generateTexture('turret_mortar', 40, 44);
    pm.destroy();

    // D. Barrier Wall Segment (32x24)
    const wall = scene.make.graphics({ x: 0, y: 0 });
    wall.fillStyle(0x070A13, 1);
    wall.fillRect(0, 4, 32, 20);
    wall.fillStyle(0x1E293B, 1);
    wall.fillRect(2, 6, 28, 16);
    // Neon reinforcing circuits
    wall.fillStyle(0x06B6D4, 0.9);
    wall.fillRect(4, 10, 24, 2);
    wall.fillRect(4, 16, 24, 2);
    wall.fillRect(15, 6, 2, 16);
    wall.generateTexture('wall_segment', 32, 24);
    wall.destroy();

    // E. Rubble / Destroyed Debris (40x28)
    const rub = scene.make.graphics({ x: 0, y: 0 });
    rub.fillStyle(0x070A13, 0.7);
    rub.fillEllipse(20, 20, 36, 12);
    rub.fillStyle(0x1E293B, 1);
    rub.fillRect(6, 14, 12, 8);
    rub.fillRect(16, 10, 14, 12);
    rub.fillRect(26, 16, 8, 7);
    rub.fillStyle(0x334155, 1);
    rub.fillRect(9, 12, 6, 5);
    rub.fillRect(20, 8, 8, 6);
    // Glowing smoking embers
    rub.fillStyle(0xEA580C, 1);
    rub.fillRect(12, 17, 3, 3);
    rub.fillRect(22, 14, 3, 2);
    rub.fillStyle(0xFEF08A, 1);
    rub.fillRect(13, 18, 1, 1);
    rub.generateTexture('building_rubble', 40, 28);
    rub.destroy();

    // --- 3. PROJECTILES & FX ---
    // A. Laser Bolt (10x4)
    const las = scene.make.graphics({ x: 0, y: 0 });
    las.fillStyle(0x22C55E, 1);
    las.fillRect(0, 0, 10, 4);
    las.fillStyle(0x86EFAC, 1);
    las.fillRect(2, 1, 6, 2);
    las.generateTexture('proj_laser', 10, 4);
    las.destroy();

    // B. Plasma Bolt (8x8)
    const pla = scene.make.graphics({ x: 0, y: 0 });
    pla.fillStyle(0x06B6D4, 0.4);
    pla.fillCircle(4, 4, 4);
    pla.fillStyle(0x38BDF8, 0.9);
    pla.fillCircle(4, 4, 2.5);
    pla.fillStyle(0xFFFFFF, 1);
    pla.fillCircle(4, 4, 1);
    pla.generateTexture('proj_plasma', 8, 8);
    pla.destroy();

    // C. Mortar Shell (8x8)
    const mor = scene.make.graphics({ x: 0, y: 0 });
    mor.fillStyle(0xEA580C, 1);
    mor.fillCircle(4, 4, 3.5);
    mor.fillStyle(0xFEF08A, 1);
    mor.fillCircle(4, 4, 1.5);
    mor.generateTexture('proj_mortar', 8, 8);
    mor.destroy();

    // D. EMP Shockwave Ring (64x64)
    const emp = scene.make.graphics({ x: 0, y: 0 });
    emp.lineStyle(2, 0x8B5CF6, 0.8);
    emp.strokeCircle(32, 32, 28);
    emp.lineStyle(2, 0x06B6D4, 0.9);
    emp.strokeCircle(32, 32, 18);
    emp.fillStyle(0xFFFFFF, 0.9);
    emp.fillCircle(32, 32, 5);
    emp.generateTexture('proj_emp_blast', 64, 64);
    emp.destroy();

    // --- 4. COMBAT ICONS & STARS ---
    // A. Stars
    const sGold = scene.make.graphics({ x: 0, y: 0 });
    sGold.fillStyle(0xF59E0B, 1);
    sGold.fillTriangle(10, 1, 3, 19, 19, 7);
    sGold.fillTriangle(10, 1, 1, 7, 17, 19);
    sGold.fillStyle(0xFEF08A, 1);
    sGold.fillCircle(10, 10, 4);
    sGold.generateTexture('star_gold', 20, 20);
    sGold.destroy();

    const sEmpty = scene.make.graphics({ x: 0, y: 0 });
    sEmpty.fillStyle(0x1E293B, 1);
    sEmpty.fillTriangle(10, 1, 3, 19, 19, 7);
    sEmpty.fillTriangle(10, 1, 1, 7, 17, 19);
    sEmpty.fillStyle(0x334155, 1);
    sEmpty.fillCircle(10, 10, 4);
    sEmpty.generateTexture('star_empty', 20, 20);
    sEmpty.destroy();

    // B. Unit Deck Icons (28x28)
    const icons = [
      { key: 'icon_unit_imp', color: 0x10B981, border: 0x34D399, text: '⚡' },
      { key: 'icon_unit_ranger', color: 0x0284C7, border: 0x38BDF8, text: '🎯' },
      { key: 'icon_unit_breacher', color: 0xEA580C, border: 0xF59E0B, text: '🛡️' },
      { key: 'icon_unit_emp', color: 0x7C3AED, border: 0xA855F7, text: '💥' }
    ];

    icons.forEach(ic => {
      const c = scene.make.graphics({ x: 0, y: 0 });
      c.fillStyle(0x070A13, 0.95);
      c.fillRoundedRect(0, 0, 28, 28, 3);
      c.lineStyle(1.5, ic.border, 1);
      c.strokeRoundedRect(0, 0, 28, 28, 3);
      c.fillStyle(ic.color, 0.4);
      c.fillCircle(14, 14, 8);
      c.generateTexture(ic.key, 28, 28);
      c.destroy();
    });
  }
}

