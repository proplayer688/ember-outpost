export interface FriendDefinition {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  primaryColor: number;
  accentColor: number;
  dialogue: string[];
  rivalScore: number;
  defaultGridPos: { gx: number; gy: number };
  patrolWaypoints: Array<{ gx: number; gy: number }>;
}

export const FRIENDS_DATA: Record<string, FriendDefinition> = {
  milo: {
    id: 'milo',
    name: 'Milo',
    title: 'Outpost Architect',
    role: 'Builder & Mason',
    bio: 'Milo measures everything in micro-millibars of ember pressure. He designed the seismic foundations keeping the mesa elevated above the deep void.',
    primaryColor: 0x164E2E, // Forest Emerald
    accentColor: 0x22C55E, // Clover Green
    dialogue: [
      '"Check the structural load on that workshop beam! Solid obsidian stone never buckles."',
      '"If you bring me 10 Wood and 5 Stone, we can reinforce the Outpost Core to Level 2!"',
      '"A good architect keeps their hammer rhythm sharp. Think you can match my forge timing?"'
    ],
    rivalScore: 290,
    defaultGridPos: { gx: -3.5, gy: -2.0 },
    patrolWaypoints: [
      { gx: -3.5, gy: -2.0 },
      { gx: -4.5, gy: -1.0 },
      { gx: -3.0, gy: -0.5 },
      { gx: -2.5, gy: -2.2 }
    ]
  },

  bram: {
    id: 'bram',
    name: 'Bram',
    title: 'Master Quartermaster',
    role: 'Storage Vault Guardian',
    bio: 'Bram can smell raw copper from sixty paces. He treats every harvest like sacred treasure and ensures not a single ember shard goes unaccounted.',
    primaryColor: 0x7C2D12, // Burnt Rust
    accentColor: 0xF59E0B, // Sunburst Gold
    dialogue: [
      '"Vault capacity is tight, Keeper. Expand our storage chests before our timber spills into the void!"',
      '"Every crystal gathered is another tick of safety for our generator grid."',
      '"My fingers have weighed a million coins. My reflexes in The Forge Sync are second to none."'
    ],
    rivalScore: 320,
    defaultGridPos: { gx: -3.5, gy: 3.2 },
    patrolWaypoints: [
      { gx: -3.5, gy: 3.2 },
      { gx: -4.5, gy: 2.5 },
      { gx: -3.0, gy: 4.0 },
      { gx: -2.2, gy: 2.8 }
    ]
  },

  vex: {
    id: 'vex',
    name: 'Vex',
    title: 'Aether Sentinel',
    role: 'Perimeter Defense',
    bio: 'Vex scans the perimeter day and night. His energy visor detects cosmic drift anomalies before the sirens even spin up.',
    primaryColor: 0x083344, // Deep Mariana
    accentColor: 0x06B6D4, // Electric Cyan
    dialogue: [
      '"Defense grid calibrated at 100%. Overcharging with Simulated $RF will grant a 15% outpost yield boost."',
      '"Perimeter clear of void echoes. Keep harvesting the outskirts nodes, Ignis."',
      '"Precision isn\'t optional in combat. Let us see if your timing holds against my record."'
    ],
    rivalScore: 390,
    defaultGridPos: { gx: 1.5, gy: -5.0 },
    patrolWaypoints: [
      { gx: 1.5, gy: -5.0 },
      { gx: -1.5, gy: -5.0 },
      { gx: 0.0, gy: -4.0 },
      { gx: 1.0, gy: -5.8 }
    ]
  },

  kael: {
    id: 'kael',
    name: 'Kael',
    title: 'Dojo Vanguard',
    role: 'Combat & Timing Trainer',
    bio: 'Kael trains champions in rhythm strikes. He believes that true victory in the frontier comes from unwavering mental focus and perfect muscle memory.',
    primaryColor: 0x881337, // Deep Crimson
    accentColor: 0xFB7185, // Rose Glow
    dialogue: [
      '"Strike on the pulse! Not a millisecond before, not a millisecond after."',
      '"Train your reflexes at the dojo. It widens your Gold Zone window in The Forge Sync."',
      '"I hold the camp record of 440 points. Step to the anvil if you think you\'re ready!"'
    ],
    rivalScore: 420,
    defaultGridPos: { gx: 2.2, gy: 4.2 },
    patrolWaypoints: [
      { gx: 2.2, gy: 4.2 },
      { gx: 1.0, gy: 3.5 },
      { gx: 2.5, gy: 2.5 },
      { gx: 3.2, gy: 3.8 }
    ]
  },

  pip: {
    id: 'pip',
    name: 'Pip',
    title: 'Frontier Scout',
    role: 'Expeditionist & Pathfinder',
    bio: 'Pip is small, ultra-fast, and perpetually curious. He maps ancient crystal fissures across the floating archipelago and knows every secret shortcut.',
    primaryColor: 0x0369A1, // Cobalt Cyan
    accentColor: 0x38BDF8, // Aether Sky
    dialogue: [
      '"Did you see the blue crystal glow out on the eastern ridge? Fresh shards are ripe for mining!"',
      '"I scouted ahead—our outpost is drawing the attention of travelers across the aether."',
      '"Bet I can tap the rhythm faster than you! Care for a quick Sync round?"'
    ],
    rivalScore: 340,
    defaultGridPos: { gx: -1.2, gy: 1.5 },
    patrolWaypoints: [
      { gx: -1.2, gy: 1.5 },
      { gx: 0.0, gy: 2.5 },
      { gx: -1.8, gy: -0.5 },
      { gx: -0.5, gy: -0.5 }
    ]
  },

  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Forge Artificer',
    role: 'Production Engineer',
    bio: 'Nova runs the furnace bellows and smelt conduits. Her heat-proof goggles have witnessed thousand-degree molten alloy casts.',
    primaryColor: 0x9A3412, // Warm Bronze
    accentColor: 0xFEF08A, // Spark Yellow
    dialogue: [
      '"Feed 5 Wood and 2 Crystals into the smelter, and I will cast 80 crisp Coins in seconds!"',
      '"Our passive furnace is constantly accumulating coins. Claim them before Bram gets jealous."',
      '"A smith has rhythm in their bones. Let\'s see how your hammer falls on the anvil!"'
    ],
    rivalScore: 350,
    defaultGridPos: { gx: 3.5, gy: -2.0 },
    patrolWaypoints: [
      { gx: 3.5, gy: -2.0 },
      { gx: 4.5, gy: -1.0 },
      { gx: 3.0, gy: -0.8 },
      { gx: 4.2, gy: -2.5 }
    ]
  },

  cleo: {
    id: 'cleo',
    name: 'Cleo',
    title: 'Inter-Outpost Envoy',
    role: 'Diplomat & Trade Emissary',
    bio: 'Cleo speaks seventeen frontier dialects and manages communications through the Friend Gate. She connects our outpost with distant allied settlements.',
    primaryColor: 0x4C1D95, // Royal Violet
    accentColor: 0xC084FC, // Bright Amethyst
    dialogue: [
      '"The Friend Gate is humming with allied signals. Soon travelers from across the realm will visit!"',
      '"Keep our settlement thriving, Keeper Ignis. Prosperity here inspires the entire network."',
      '"Diplomacy requires flawless cadence. Test your timing with me on the Challenge Board!"'
    ],
    rivalScore: 310,
    defaultGridPos: { gx: -2.5, gy: 7.2 },
    patrolWaypoints: [
      { gx: -2.5, gy: 7.2 },
      { gx: -1.0, gy: 6.8 },
      { gx: -3.5, gy: 6.5 },
      { gx: -2.0, gy: 8.0 }
    ]
  }
};
