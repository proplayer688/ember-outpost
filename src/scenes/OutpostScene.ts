import Phaser from 'phaser';
import { IsoMath } from '../rendering/IsoMath';
import { BUILDINGS_DATA } from '../data/BuildingsData';
import { BuildingNode } from '../entities/BuildingNode';
import { MascotKeeper } from '../entities/MascotKeeper';
import { FriendNPC } from '../entities/FriendNPC';
import { ResourceNode } from '../entities/ResourceNode';
import { FRIENDS_DATA } from '../data/FriendsData';
import { CameraSystem } from '../systems/CameraSystem';
import { InputManager } from '../input/InputManager';
import { InteractionSystem } from '../systems/InteractionSystem';
import { HarvestSystem } from '../systems/HarvestSystem';
import { ParticleFactory } from '../rendering/ParticleFactory';

export class OutpostScene extends Phaser.Scene {
  public mascot!: MascotKeeper;
  public buildings: BuildingNode[] = [];
  public friends: FriendNPC[] = [];
  public resourceNodes: ResourceNode[] = [];
  private cameraSystem!: CameraSystem;
  private inputManager!: InputManager;
  private interactionSystem!: InteractionSystem;
  private harvestSystem!: HarvestSystem;
  private obstacleColliders!: Phaser.Physics.Arcade.StaticGroup;
  private readonly maxIslandRadius: number = 9.8;

  constructor() {
    super({ key: 'OutpostScene' });
  }

  create(): void {
    // 1. Establish World Extents
    const worldW = 1600;
    const worldH = 1200;

    this.physics.world.setBounds(-worldW / 2, -worldH / 2, worldW, worldH);
    this.obstacleColliders = this.physics.add.staticGroup();

    // 2. Build Handcrafted Isometric Mesa Terrain (24x24 grid)
    this.buildTerrain();

    // 3. Instantiate Settlement Buildings
    this.buildBuildings();

    // 4. Populate Natural Props & Environmental Detail
    this.buildProps();

    // 4b. Populate Autonomous Friend NPCs & Collectible Resource Nodes
    this.buildFriends();
    this.buildResourceNodes();

    // 5. Spawn Mascot Keeper "Ignis" right in front of Outpost Core
    const spawnPos = IsoMath.gridToScreen(0, 1.2);
    this.mascot = new MascotKeeper(this, spawnPos.screenX, spawnPos.screenY);

    // 6. Set Up Physics Collisions
    this.buildings.forEach(b => {
      this.physics.add.collider(this.mascot, b.collisionBody);
    });
    this.physics.add.collider(this.mascot, this.obstacleColliders);

    // 7. Setup Camera Follow & Clamping
    this.cameraSystem = new CameraSystem(this);
    this.cameraSystem.setup(this.mascot, {
      x: -worldW / 2,
      y: -worldH / 2,
      width: worldW,
      height: worldH
    });

    // 8. Setup Input, Harvest & Interaction Systems
    this.inputManager = new InputManager(this);
    this.harvestSystem = new HarvestSystem(this.mascot, this.resourceNodes);
    this.interactionSystem = new InteractionSystem(
      this.mascot,
      this.buildings,
      this.friends,
      this.harvestSystem
    );

    // 9. Attach Ambient Particle Emitters
    this.setupParticles();

    // Fade in camera smoothly
    this.cameras.main.fadeIn(400, 7, 10, 19);
  }

  private buildTerrain(): void {
    const minGrid = -12;
    const maxGrid = 12;

    // Define set of path grid keys connecting all 8 structures
    const pathKeys = new Set<string>();

    // Center plaza (3x3 ring)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        pathKeys.add(`${x},${y}`);
      }
    }

    // Path West to Workshop (-5, -2) and Storage (-5, 3)
    for (let x = -5; x <= 0; x++) {
      pathKeys.add(`${x},-1`);
      pathKeys.add(`${x},0`);
    }
    for (let y = -2; y <= 3; y++) {
      pathKeys.add(`-5,${y}`);
    }

    // Path East to Production Hub (5, -2)
    for (let x = 0; x <= 5; x++) {
      pathKeys.add(`${x},-1`);
      pathKeys.add(`${x},0`);
    }

    // Path North to Defense Tower (0, -6)
    for (let y = -6; y <= 0; y++) {
      pathKeys.add(`0,${y}`);
    }

    // Path South to Training (0, 4) and then to Friend Gate (-4, 8) and Board (4, 8)
    for (let y = 0; y <= 8; y++) {
      pathKeys.add(`0,${y}`);
    }
    for (let x = -4; x <= 4; x++) {
      pathKeys.add(`${x},8`);
    }

    for (let gx = minGrid; gx <= maxGrid; gx++) {
      for (let gy = minGrid; gy <= maxGrid; gy++) {
        // Oval outpost mesa boundary equation
        const distSq = (gx * gx) / (10.5 * 10.5) + (gy * gy) / (10.5 * 10.5);
        if (distSq > 1.0) continue; // Outside mesa perimeter

        const screen = IsoMath.gridToScreen(gx, gy);
        const isPath = pathKeys.has(`${gx},${gy}`);
        const isEdge = distSq > 0.82;

        let texture = 'tile_ground';
        if (isPath) {
          texture = 'tile_path';
        } else if (isEdge) {
          texture = 'tile_cliff';
        }

        const tile = this.add.image(screen.screenX, screen.screenY, texture);
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(-1000 + (gx + gy)); // Strictly behind all props & characters

        // If on the perimeter edge, place solid perimeter fences and physics blocks
        if (isEdge) {
          // Add fence on outer perimeter
          if ((gx + gy) % 2 === 0) {
            const fence = this.add.image(screen.screenX, screen.screenY, 'prop_fence');
            fence.setOrigin(0.5, 0.7);
            fence.setDepth(screen.screenY + 2);
          }

          // Solid collision zone preventing player from stepping off the cliff
          const zone = this.add.zone(screen.screenX, screen.screenY, 28, 14);
          this.physics.add.existing(zone, true);
          this.obstacleColliders.add(zone);
        }
      }
    }
  }

  private buildBuildings(): void {
    Object.values(BUILDINGS_DATA).forEach(def => {
      const pos = IsoMath.gridToScreen(def.gridX, def.gridY);
      const building = new BuildingNode(this, pos.screenX, pos.screenY, def);
      this.buildings.push(building);
    });
  }

  private buildProps(): void {
    // 1. Forest Edge Cyber Trees (North Perimeter)
    const treePositions = [
      { gx: -2, gy: -8 },
      { gx: 0, gy: -8.5 },
      { gx: 2, gy: -8 },
      { gx: -4, gy: -7 },
      { gx: 4, gy: -7 },
      { gx: -7, gy: -4 },
      { gx: 7, gy: -4 },
      { gx: -8, gy: 0 },
      { gx: 8, gy: 0 }
    ];

    treePositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const tree = this.add.sprite(pos.screenX, pos.screenY, 'prop_tree');
      tree.setOrigin(0.5, 0.85);
      tree.setDepth(pos.screenY + 4);

      // Solid collision zone at base of tree
      const zone = this.add.zone(pos.screenX, pos.screenY - 2, 20, 14);
      this.physics.add.existing(zone, true);
      this.obstacleColliders.add(zone);
    });

    // 2. Ember Lanterns (along pathways with warm glow)
    const lanternPositions = [
      { gx: -2, gy: 0 },
      { gx: 2, gy: 0 },
      { gx: 0, gy: -3 },
      { gx: 0, gy: 2 },
      { gx: -3, gy: 7 },
      { gx: 3, gy: 7 },
      { gx: -5, gy: 1 },
      { gx: 5, gy: 1 }
    ];

    lanternPositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      
      // Light cookie on ground
      const glow = this.add.image(pos.screenX, pos.screenY + 4, 'light_glow');
      glow.setTint(0xF59E0B);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      glow.setAlpha(0.35);
      glow.setDepth(pos.screenY - 2);

      const lamp = this.add.sprite(pos.screenX, pos.screenY, 'prop_lantern');
      lamp.setOrigin(0.5, 0.85);
      lamp.setDepth(pos.screenY + 3);

      // Subtle flame flicker
      this.tweens.add({
        targets: glow,
        alpha: 0.55,
        duration: 400 + Math.random() * 200,
        yoyo: true,
        repeat: -1
      });
    });

    // 3. Cyber Crystals (harvestable nodes in outskirts)
    const crystalPositions = [
      { gx: -7, gy: 2 },
      { gx: 7, gy: 2 },
      { gx: -2, gy: 9 },
      { gx: 2, gy: 9 }
    ];

    crystalPositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const cry = this.add.sprite(pos.screenX, pos.screenY, 'prop_crystal');
      cry.setOrigin(0.5, 0.85);
      cry.setDepth(pos.screenY + 3);

      const cryGlow = this.add.image(pos.screenX, pos.screenY, 'light_glow');
      cryGlow.setTint(0x06B6D4);
      cryGlow.setBlendMode(Phaser.BlendModes.ADD);
      cryGlow.setAlpha(0.25);
      cryGlow.setScale(0.7);
      cryGlow.setDepth(pos.screenY - 1);
    });

    // 4. Logistics Crates (near Workshop & Storage)
    const cratePositions = [
      { gx: -4, gy: -3 },
      { gx: -6, gy: 1 },
      { gx: 4, gy: -3 }
    ];

    cratePositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const crate = this.add.sprite(pos.screenX, pos.screenY, 'prop_crate');
      crate.setOrigin(0.5, 0.8);
      crate.setDepth(pos.screenY + 2);

      const zone = this.add.zone(pos.screenX, pos.screenY - 2, 16, 12);
      this.physics.add.existing(zone, true);
      this.obstacleColliders.add(zone);
    });
  }

  private buildFriends(): void {
    Object.values(FRIENDS_DATA).forEach(def => {
      const friend = new FriendNPC(this, def);
      this.friends.push(friend);
    });
  }

  private buildResourceNodes(): void {
    // 1. Wood Stumps in the North Grove / West Outskirts
    const woodPositions = [
      { gx: -2.5, gy: -7.0 },
      { gx: 2.8, gy: -6.8 },
      { gx: -6.5, gy: -3.2 }
    ];
    woodPositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const node = new ResourceNode(this, pos.screenX, pos.screenY, 'wood', 3);
      this.resourceNodes.push(node);
    });

    // 2. Aether Crystal Spires in Outskirts
    const crystalPositions = [
      { gx: -6.8, gy: 2.2 },
      { gx: 6.8, gy: 1.8 },
      { gx: 2.2, gy: 8.2 }
    ];
    crystalPositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const node = new ResourceNode(this, pos.screenX, pos.screenY, 'crystals', 2);
      this.resourceNodes.push(node);
    });

    // 3. Obsidian Stone Quarry Boulders
    const stonePositions = [
      { gx: -5.8, gy: -0.8 },
      { gx: 5.8, gy: -2.5 },
      { gx: -2.2, gy: 8.2 }
    ];
    stonePositions.forEach(p => {
      const pos = IsoMath.gridToScreen(p.gx, p.gy);
      const node = new ResourceNode(this, pos.screenX, pos.screenY, 'stone', 3);
      this.resourceNodes.push(node);
    });
  }

  private setupParticles(): void {
    // 1. Chimney Smoke on Production Hub
    const prodDef = BUILDINGS_DATA['production_hub'];
    const prodPos = IsoMath.gridToScreen(prodDef.gridX, prodDef.gridY);
    ParticleFactory.createChimneySmoke(this, prodPos.screenX - 16, prodPos.screenY - 48);

    // 2. Floating Embers on Outpost Core
    const coreDef = BUILDINGS_DATA['outpost_core'];
    const corePos = IsoMath.gridToScreen(coreDef.gridX, coreDef.gridY);
    ParticleFactory.createEmberEmitter(this, corePos.screenX, corePos.screenY - 60);
  }

  override update(_time: number, delta: number): void {
    // 1. Calculate movement vector from keyboard/mouse/touch
    const vec = this.inputManager.getMovementVector(this.mascot.x, this.mascot.y);
    this.mascot.move(vec.x, vec.y, delta);

    // 2. Hard boundary clamp: player physically CANNOT walk off island into void
    const grid = IsoMath.screenToGrid(this.mascot.x, this.mascot.y);
    const distSq = (grid.gridX * grid.gridX) / (this.maxIslandRadius * this.maxIslandRadius) +
                   (grid.gridY * grid.gridY) / (this.maxIslandRadius * this.maxIslandRadius);

    if (distSq > 1.0) {
      // Push back towards center
      const angle = Math.atan2(grid.gridY, grid.gridX);
      const safeGridX = Math.cos(angle) * (this.maxIslandRadius - 0.2);
      const safeGridY = Math.sin(angle) * (this.maxIslandRadius - 0.2);
      const safeScreen = IsoMath.gridToScreen(safeGridX, safeGridY);
      this.mascot.setPosition(safeScreen.screenX, safeScreen.screenY);
      this.mascot.setVelocity(0, 0);
    }

    // 3. Update Autonomous Friend NPCs
    this.friends.forEach(f => f.update(delta));

    // 4. Update contextual proximity triggers (Harvest, Friends, Buildings)
    this.interactionSystem.update();
  }
}
