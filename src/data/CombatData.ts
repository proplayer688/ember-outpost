export interface CombatUnitDef {
  id: string;
  name: string;
  role: string;
  description: string;
  costEnergy: number;
  costRF: number;
  hp: number;
  dps: number;
  speed: number;
  range: number;
  attackSpeed: number; // seconds per attack
  targetPriority: 'all' | 'defenses' | 'walls';
  iconTexture: string;
  spriteTexture: string;
  bulletType: 'melee' | 'laser' | 'plasma';
}

export interface DefenseTowerDef {
  id: string;
  name: string;
  type: 'pulse' | 'tesla' | 'mortar' | 'wall' | 'core' | 'vault';
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  aoeRadius?: number;
  texture: string;
  lootCoins?: number;
  lootRF?: number;
}

export interface RivalOutpostDef {
  id: string;
  name: string;
  commander: string;
  commanderRole: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  defenseRating: number;
  totalLootCoins: number;
  totalLootRF: number;
  description: string;
  buildings: Array<{
    type: 'core' | 'pulse' | 'tesla' | 'mortar' | 'vault' | 'wall';
    gridX: number;
    gridY: number;
  }>;
}

export const COMBAT_UNITS: Record<string, CombatUnitDef> = {
  volt_imp: {
    id: 'volt_imp',
    name: 'Volt Imp',
    role: 'Melee Swarmer',
    description: 'Fast cyber-scout with dual energy blades. Swarms nearest structures.',
    costEnergy: 1,
    costRF: 10,
    hp: 95,
    dps: 32,
    speed: 110,
    range: 24,
    attackSpeed: 0.6,
    targetPriority: 'all',
    iconTexture: 'icon_unit_imp',
    spriteTexture: 'unit_volt_imp',
    bulletType: 'melee'
  },
  pulse_ranger: {
    id: 'pulse_ranger',
    name: 'Pulse Ranger',
    role: 'Ranged Sniper',
    description: 'High-tech cyber marksman. Fires plasma bolts over barricade walls.',
    costEnergy: 2,
    costRF: 20,
    hp: 120,
    dps: 45,
    speed: 75,
    range: 160,
    attackSpeed: 1.1,
    targetPriority: 'defenses',
    iconTexture: 'icon_unit_ranger',
    spriteTexture: 'unit_pulse_ranger',
    bulletType: 'laser'
  },
  obsidian_breacher: {
    id: 'obsidian_breacher',
    name: 'Obsidian Breacher',
    role: 'Heavy Siege Tank',
    description: 'Armored titanium golem. Demolishes defense turrets and smash barriers with seismic fist impacts.',
    costEnergy: 3,
    costRF: 35,
    hp: 480,
    dps: 65,
    speed: 48,
    range: 30,
    attackSpeed: 1.4,
    targetPriority: 'defenses',
    iconTexture: 'icon_unit_breacher',
    spriteTexture: 'unit_obsidian_golem',
    bulletType: 'melee'
  },
  emp_strike: {
    id: 'emp_strike',
    name: 'EMP Overcharge',
    role: 'Tactical Spell',
    description: 'Calls down an electric lightning storm that disables enemy towers for 4.0s and deals burst damage.',
    costEnergy: 4,
    costRF: 25,
    hp: 1,
    dps: 120,
    speed: 0,
    range: 120,
    attackSpeed: 0,
    targetPriority: 'all',
    iconTexture: 'icon_unit_emp',
    spriteTexture: 'unit_emp_drone',
    bulletType: 'plasma'
  }
};

export const DEFENSE_TOWERS: Record<string, Omit<DefenseTowerDef, 'hp'>> = {
  core: {
    id: 'core',
    name: 'Citadel Core',
    type: 'core',
    maxHp: 650,
    damage: 0,
    range: 0,
    fireRate: 0,
    texture: 'building_outpost_core',
    lootCoins: 250,
    lootRF: 80
  },
  pulse: {
    id: 'pulse',
    name: 'Pulse Turret',
    type: 'pulse',
    maxHp: 240,
    damage: 24,
    range: 150,
    fireRate: 1.5,
    texture: 'turret_pulse',
    lootCoins: 60,
    lootRF: 20
  },
  tesla: {
    id: 'tesla',
    name: 'Tesla Coil',
    type: 'tesla',
    maxHp: 280,
    damage: 38,
    range: 110,
    fireRate: 1.8,
    texture: 'turret_tesla',
    lootCoins: 75,
    lootRF: 25
  },
  mortar: {
    id: 'mortar',
    name: 'Plasma Mortar',
    type: 'mortar',
    maxHp: 210,
    damage: 65,
    range: 190,
    fireRate: 0.5,
    aoeRadius: 55,
    texture: 'turret_mortar',
    lootCoins: 90,
    lootRF: 30
  },
  vault: {
    id: 'vault',
    name: 'Aether Silo',
    type: 'vault',
    maxHp: 220,
    damage: 0,
    range: 0,
    fireRate: 0,
    texture: 'building_storage_vault',
    lootCoins: 150,
    lootRF: 50
  },
  wall: {
    id: 'wall',
    name: 'Barrier Wall',
    type: 'wall',
    maxHp: 180,
    damage: 0,
    range: 0,
    fireRate: 0,
    texture: 'wall_segment',
    lootCoins: 10,
    lootRF: 2
  }
};

export const RIVAL_OUTPOSTS: RivalOutpostDef[] = [
  {
    id: 'vex_fortress',
    name: 'Iron Bastion',
    commander: 'Sentinel Vex',
    commanderRole: 'Fortress Tactician',
    difficulty: 'Hard',
    defenseRating: 780,
    totalLootCoins: 680,
    totalLootRF: 220,
    description: 'Heavy perimeter with interlocking Pulse Cannons and a Plasma Mortar battery.',
    buildings: [
      { type: 'core', gridX: 0, gridY: 0 },
      { type: 'pulse', gridX: -4, gridY: -3 },
      { type: 'pulse', gridX: 4, gridY: 3 },
      { type: 'mortar', gridX: 4, gridY: -3 },
      { type: 'tesla', gridX: -4, gridY: 3 },
      { type: 'vault', gridX: 0, gridY: -5 },
      { type: 'vault', gridX: 0, gridY: 5 },
      // Surrounding barrier wall perimeter
      { type: 'wall', gridX: -5, gridY: -2 },
      { type: 'wall', gridX: -5, gridY: 0 },
      { type: 'wall', gridX: -5, gridY: 2 },
      { type: 'wall', gridX: 5, gridY: -2 },
      { type: 'wall', gridX: 5, gridY: 0 },
      { type: 'wall', gridX: 5, gridY: 2 },
      { type: 'wall', gridX: -2, gridY: -5 },
      { type: 'wall', gridX: 2, gridY: -5 },
      { type: 'wall', gridX: -2, gridY: 5 },
      { type: 'wall', gridX: 2, gridY: 5 }
    ]
  },
  {
    id: 'milo_spire',
    name: 'Geometric Spire',
    commander: 'Architect Milo',
    commanderRole: 'Structural Engineer',
    difficulty: 'Medium',
    defenseRating: 520,
    totalLootCoins: 480,
    totalLootRF: 160,
    description: 'Calculated diamond defensive grid featuring dual Tesla Coils and fortified silos.',
    buildings: [
      { type: 'core', gridX: 0, gridY: 0 },
      { type: 'tesla', gridX: -4, gridY: 0 },
      { type: 'tesla', gridX: 4, gridY: 0 },
      { type: 'pulse', gridX: 0, gridY: -4 },
      { type: 'vault', gridX: -2, gridY: 4 },
      { type: 'vault', gridX: 2, gridY: 4 },
      { type: 'wall', gridX: -4, gridY: -3 },
      { type: 'wall', gridX: 4, gridY: -3 },
      { type: 'wall', gridX: -4, gridY: 3 },
      { type: 'wall', gridX: 4, gridY: 3 }
    ]
  },
  {
    id: 'nova_foundry',
    name: 'Tesla Foundry',
    commander: 'Artificer Nova',
    commanderRole: 'Metallurgy Specialist',
    difficulty: 'Easy',
    defenseRating: 340,
    totalLootCoins: 350,
    totalLootRF: 110,
    description: 'Resource-rich experimental workshop with light defenses and exposed vaults.',
    buildings: [
      { type: 'core', gridX: 0, gridY: 0 },
      { type: 'pulse', gridX: -3, gridY: -2 },
      { type: 'pulse', gridX: 3, gridY: 2 },
      { type: 'vault', gridX: -2, gridY: 3 },
      { type: 'vault', gridX: 2, gridY: -3 },
      { type: 'wall', gridX: 0, gridY: -4 },
      { type: 'wall', gridX: 0, gridY: 4 }
    ]
  },
  {
    id: 'cleo_sanctum',
    name: 'Celestial Sanctum',
    commander: 'Envoy Cleo',
    commanderRole: 'Aether Diplomat',
    difficulty: 'Elite',
    defenseRating: 920,
    totalLootCoins: 950,
    totalLootRF: 320,
    description: 'Heavily fortified grand sanctuary with concentrated mortars and high-yield vaults.',
    buildings: [
      { type: 'core', gridX: 0, gridY: 0 },
      { type: 'mortar', gridX: -4, gridY: -3 },
      { type: 'mortar', gridX: 4, gridY: 3 },
      { type: 'tesla', gridX: 4, gridY: -3 },
      { type: 'pulse', gridX: -4, gridY: 3 },
      { type: 'vault', gridX: -3, gridY: 0 },
      { type: 'vault', gridX: 3, gridY: 0 },
      { type: 'vault', gridX: 0, gridY: 5 },
      { type: 'wall', gridX: -5, gridY: -3 },
      { type: 'wall', gridX: -5, gridY: 0 },
      { type: 'wall', gridX: 5, gridY: 0 },
      { type: 'wall', gridX: 5, gridY: 3 }
    ]
  }
];

export const BASE_DEFENSE_WAVES = [
  {
    wave: 1,
    name: 'Recon Scramblers',
    units: [
      { type: 'volt_imp', count: 4, delayMs: 400 },
      { type: 'pulse_ranger', count: 2, delayMs: 1200 }
    ],
    bountyCoins: 200,
    bountyRF: 50
  },
  {
    wave: 2,
    name: 'Vanguard Strike Unit',
    units: [
      { type: 'volt_imp', count: 6, delayMs: 350 },
      { type: 'pulse_ranger', count: 4, delayMs: 800 },
      { type: 'obsidian_breacher', count: 1, delayMs: 2000 }
    ],
    bountyCoins: 400,
    bountyRF: 100
  },
  {
    wave: 3,
    name: 'Iron Clad Siege Legion',
    units: [
      { type: 'obsidian_breacher', count: 2, delayMs: 1500 },
      { type: 'pulse_ranger', count: 6, delayMs: 600 },
      { type: 'volt_imp', count: 8, delayMs: 250 }
    ],
    bountyCoins: 750,
    bountyRF: 200
  }
];
