export interface BuildingDefinition {
  id: string;
  name: string;
  subtitle: string;
  prompt: string;
  icon: string;
  gridX: number; // Isometric Cartesian X
  gridY: number; // Isometric Cartesian Y
  footprintWidth: number; // in tiles
  footprintHeight: number; // in tiles
  color: string;
  glowColor: number;
  description: string;
  tier: number;
  maxTier: number;
  stats: { label: string; value: string }[];
  simulatedActionText: string;
}

export const BUILDINGS_DATA: Record<string, BuildingDefinition> = {
  outpost_core: {
    id: 'outpost_core',
    name: 'Outpost Core',
    subtitle: 'Settlement Command & Aether Spire',
    prompt: 'Inspect Outpost',
    icon: 'icon_core',
    gridX: 0,
    gridY: 0,
    footprintWidth: 3,
    footprintHeight: 3,
    color: '#F59E0B',
    glowColor: 0xF59E0B,
    description: 'The ancient ember spire fueling all outpost systems. Upgrading expands settlement boundaries and unlocks new structures.',
    tier: 1,
    maxTier: 7,
    stats: [
      { label: 'Outpost Level', value: '1 / 7' },
      { label: 'Settlement Status', value: 'Active' },
      { label: 'Grid Efficiency', value: '100%' },
      { label: 'Next Expansion', value: 'Kindled Camp (Lv 2)' }
    ],
    simulatedActionText: '[ UPGRADE OUTPOST ]'
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    subtitle: 'Research & Engineering Hub',
    prompt: 'Open Workshop',
    icon: 'icon_workshop',
    gridX: -5,
    gridY: -2,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#06B6D4',
    glowColor: 0x06B6D4,
    description: 'Houses precision brass machinery for technological research, tool upgrades, and crafting efficiency boosters.',
    tier: 1,
    maxTier: 5,
    stats: [
      { label: 'Tech Tier', value: '1' },
      { label: 'Research Slots', value: '1 Active' },
      { label: 'Craft Speed', value: '+10%' }
    ],
    simulatedActionText: '[ RESEARCH TECH ]'
  },
  storage: {
    id: 'storage',
    name: 'Storage Vault',
    subtitle: 'Secure Resource Depot',
    prompt: 'Check Storage',
    icon: 'icon_storage',
    gridX: -5,
    gridY: 3,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#334155',
    glowColor: 0x38BDF8,
    description: 'Reinforced obsidian vault storing accrued Coins and harvestable materials. Protects yields while offline.',
    tier: 1,
    maxTier: 7,
    stats: [
      { label: 'Max Coin Cap', value: '1,000 Coins' },
      { label: 'Vault Fill', value: '25%' },
      { label: 'Protection', value: '100% Guaranteed' }
    ],
    simulatedActionText: '[ EXPAND CAPACITY ]'
  },
  production_hub: {
    id: 'production_hub',
    name: 'Production Hub',
    subtitle: 'Ember Furnace & Foundry',
    prompt: 'Inspect Production',
    icon: 'icon_production',
    gridX: 5,
    gridY: -2,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#EA580C',
    glowColor: 0xEA580C,
    description: 'Harnesses raw thermal energy to forge Coins continuously. Generates idle income even when the keeper rests.',
    tier: 1,
    maxTier: 7,
    stats: [
      { label: 'Production Rate', value: '10.0 Coins / min' },
      { label: 'Hourly Yield', value: '600 Coins / hr' },
      { label: 'Active Embers', value: '4 / 4' }
    ],
    simulatedActionText: '[ HARVEST YIELD ]'
  },
  defense_tower: {
    id: 'defense_tower',
    name: 'Defense Tower',
    subtitle: 'Sentry Array & Overcharge',
    prompt: 'Inspect Defense',
    icon: 'icon_defense',
    gridX: 0,
    gridY: -6,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#F43F5E',
    glowColor: 0xF43F5E,
    description: 'Guards the perimeter against simulated wilderness storms. Can be overcharged with Simulated $RF for settlement-wide yield buffs.',
    tier: 1,
    maxTier: 5,
    stats: [
      { label: 'Perimeter Range', value: '100m' },
      { label: 'Overcharge State', value: 'Standby' },
      { label: 'Buff Potential', value: '+15% Global Output' }
    ],
    simulatedActionText: '[ OVERCHARGE (50 RF) ]'
  },
  training_station: {
    id: 'training_station',
    name: 'Training Station',
    subtitle: 'Keeper Reflex & Agility Course',
    prompt: 'Train',
    icon: 'icon_training',
    gridX: 0,
    gridY: 4,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#22C55E',
    glowColor: 0x22C55E,
    description: 'Drills the mascot in precision timing, improving challenge score windows and reflexes.',
    tier: 1,
    maxTier: 5,
    stats: [
      { label: 'Timing Window', value: '±8ms (Standard)' },
      { label: 'Focus Bonus', value: '+5% XP' },
      { label: 'Mastery Rank', value: 'Novice Keeper' }
    ],
    simulatedActionText: '[ START DRILL ]'
  },
  friend_gate: {
    id: 'friend_gate',
    name: 'Friend Gate',
    subtitle: 'Social Portal & Settlement Network',
    prompt: 'Friends',
    icon: 'icon_friend',
    gridX: -4,
    gridY: 8,
    footprintWidth: 3,
    footprintHeight: 2,
    color: '#6366F1',
    glowColor: 0x6366F1,
    description: 'Gateway connecting to rival outposts across the network. Inspect friend profiles, rivalry dossiers, and competitive tags.',
    tier: 1,
    maxTier: 3,
    stats: [
      { label: 'Active Friends', value: '3 Tracked' },
      { label: 'Top Rival', value: 'Alex (9W - 5L)' },
      { label: 'Network Signal', value: 'Strong' }
    ],
    simulatedActionText: '[ VIEW RIVALRIES ]'
  },
  challenge_board: {
    id: 'challenge_board',
    name: 'Challenge Board',
    subtitle: 'The Forge Sync Terminal',
    prompt: 'View Challenges',
    icon: 'icon_board',
    gridX: 4,
    gridY: 8,
    footprintWidth: 2,
    footprintHeight: 2,
    color: '#F59E0B',
    glowColor: 0xF59E0B,
    description: 'Launch real-time timing and precision challenges. Compete for fixed Coin rewards and climb head-to-head friend rankings.',
    tier: 1,
    maxTier: 5,
    stats: [
      { label: 'Active Event', value: 'The Forge Sync' },
      { label: 'Ticket Cost', value: '1 Ticket (6/6 Available)' },
      { label: 'Best Score', value: '492 (Rank S)' },
      { label: 'Reward Tier', value: 'Up to 100 Coins' }
    ],
    simulatedActionText: '[ LAUNCH CHALLENGE ]'
  }
};
