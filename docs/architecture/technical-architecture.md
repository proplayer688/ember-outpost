# Ember Outpost — Technical Architecture & Systems Engineering

**Technical Director:** Lead Systems Architect  
**Engine:** Phaser 3.80+ · **Language:** TypeScript 5.5+ · **Bundler:** Vite 5.3+  
**Target Viewport:** Desktop (16:9 responsive) & Mobile (Touch responsive)  
**Status:** Approved Architectural Blueprint  

---

## 1. Architectural Philosophy

Ember Outpost is engineered around four core technical doctrines:
1. **Decoupled Simulation & Rendering:** Game state (economy, building levels, rivalry records) exists independently of Phaser rendering objects. Game logic can be executed and unit-tested headlessly.
2. **Interface Abstraction for Future On-Chain & Multiplayer Extensibility:** All economic actions flow through `IEconomyService`; all friend interactions flow through `ISocialService`. In the MVP, these resolve via local simulation; in production, they can be swapped for Web3 contract calls and WebSocket servers without modifying a single line of gameplay code.
3. **Data-Driven Configuration:** Balance numbers, building costs, particle limits, and audio mappings reside in declarative JSON/TypeScript records in `src/data/`.
4. **Resilient Offline-First Persistence:** State is serialized to `localStorage` with versioned schema migration, checksum validation, and automatic corrupted-save recovery.

---

## 2. Directory Hierarchy

```text
src/
├── core/                  # Game initialization, lifecycle, state container, event bus
│   ├── GameConfig.ts      # Phaser game config (resolution, scale mode, physics)
│   ├── GameState.ts       # Central observable application state
│   └── EventBus.ts        # Typed pub/sub event dispatcher
├── scenes/                # Phaser scene controllers (rendering & display lifecycle)
│   ├── BootScene.ts       # Asset preloading, font injection, audio unlock
│   ├── OutpostScene.ts    # Main isometric walkable settlement world
│   ├── ChallengeScene.ts  # Rhythm/timing precision mini-game overlay
│   └── UIScene.ts         # Screen-space HUD and modal layer
├── entities/              # World objects with physical presence
│   ├── MascotKeeper.ts    # Player character (Ignis) with animation controller
│   └── BuildingNode.ts    # Interactive settlement structure entity
├── systems/               # Logic processors acting on entities
│   ├── MovementSystem.ts  # Vector math, isometric projection, velocity smoothing
│   ├── CameraSystem.ts    # Smooth tracking lerp, boundary clamping
│   ├── InteractionSystem.ts# World-space proximity checks & prompt triggers
│   └── ProductionSystem.ts# Idle coin accumulation and offline timer tick
├── components/            # Reusable entity attachments
│   ├── IsometricTransform.ts
│   └── ProximityTrigger.ts
├── data/                  # Declarative configurations
│   ├── BuildingsData.ts   # Upgrade trees, costs, production rates
│   ├── ProgressionData.ts # Outpost levels 1-7 unlock definitions
│   └── AudioData.ts       # Track listings and sound mapping
├── ui/                    # Modals, menus, and HUD overlays
│   ├── HUDController.ts   # Top currency bar, level pip, ticket meter
│   ├── BuildingModal.ts   # Upgrade/harvest modal dialog
│   ├── ChallengeModal.ts  # Timing challenge gauge and feedback
│   ├── RivalryModal.ts    # Friend dossier and match stats
│   └── SettingsModal.ts   # Volume sliders, reduced motion, save wipe
├── input/                 # Input normalization
│   ├── InputManager.ts    # Unified keyboard, mouse, and touch listener
│   └── VirtualJoystick.ts # Floating analog touch controls for mobile
├── audio/                 # Sound management
│   └── AudioManager.ts    # Web Audio sound manager with autoplay unlock
├── economy/               # Pure business logic
│   ├── IEconomyService.ts # Canonical economic interface
│   ├── LocalEconomyService.ts # Deterministic local simulator
│   └── BalanceCalculator.ts # Pure mathematical yield formulas
├── social/                # Friend & rivalry logic
│   ├── ISocialService.ts  # Canonical social interface
│   ├── MockSocialService.ts # Local friend rivalry simulator
│   └── RivalryProfile.ts  # Data model for head-to-head records
├── persistence/           # Save/load management
│   ├── IPersistenceService.ts
│   ├── LocalStorageService.ts
│   └── SaveSchema.ts      # TypeScript interfaces, versioning, migrations
├── rendering/             # Visual utilities
│   ├── IsoMath.ts         # 2:1 isometric coordinate math
│   ├── DepthSorter.ts     # Y-coordinate depth sort controller
│   └── ParticleFactory.ts # Object-pooled emitter factory
└── utils/                 # General helpers
    ├── MathUtils.ts
    └── Logger.ts          # Structured studio logger
```

---

## 3. Core Interface Abstraction (Future Extensibility)

### Economic Interface:
```typescript
export interface IEconomyService {
  getBalances(): Observable<CurrencyBalances>;
  canAfford(cost: PriceRequirement): boolean;
  executeUpgrade(buildingId: string): Promise<UpgradeResult>;
  harvestProduction(buildingId: string): Promise<HarvestResult>;
  consumeTicket(): Promise<boolean>;
  refillTickets(useDiamonds: boolean): Promise<boolean>;
}
```
*In MVP, `LocalEconomyService` implements this locally. In future releases, `OnChainEconomyService` can implement the exact same interface using ethers.js / viem on Robinhood Chain.*

### Social Interface:
```typescript
export interface ISocialService {
  getFriendsList(): Promise<FriendSummary[]>;
  getRivalryProfile(friendId: string): Promise<RivalryDossier>;
  submitChallengeResult(friendId: string, result: ChallengeScore): Promise<RivalryOutcome>;
  unlockBadge(badgeId: string): Promise<void>;
}
```
*In MVP, `MockSocialService` simulates realistic friend interactions (e.g. Umesh vs Alex). In production, this connects to a WebSocket server or decentralized attestations.*

---

## 4. Isometric Coordinate System

The world is mapped to a discrete 2:1 isometric Cartesian plane:

```typescript
export class IsoMath {
  static readonly TILE_WIDTH = 32;
  static readonly TILE_HEIGHT = 16;

  /** Convert grid coordinates (cartX, cartY) to screen pixel coordinates */
  static gridToScreen(x: number, y: number): { screenX: number; screenY: number } {
    return {
      screenX: (x - y) * (this.TILE_WIDTH / 2),
      screenY: (x + y) * (this.TILE_HEIGHT / 2)
    };
  }

  /** Convert screen pixel coordinates to nearest grid cell */
  static screenToGrid(screenX: number, screenY: number): { gridX: number; gridY: number } {
    const halfW = this.TILE_WIDTH / 2;
    const halfH = this.TILE_HEIGHT / 2;
    return {
      gridX: Math.floor((screenX / halfW + screenY / halfH) / 2),
      gridY: Math.floor((screenY / halfH - screenX / halfW) / 2)
    };
  }

  /** Calculate depth sort order for 2.5D layering */
  static getDepth(screenY: number, zElevation: number = 0): number {
    return Math.floor(screenY + zElevation * 8);
  }
}
```

---

## 5. Persistence Schema & Migration Strategy

```typescript
export interface OutpostSaveData {
  version: number;
  timestamp: number;
  checksum: string;
  player: {
    name: string;
    level: number;
    xp: number;
    position: { x: number; y: number };
  };
  currencies: {
    coins: number;
    diamonds: number;
    simulatedRF: number;
    tickets: number;
    lastTicketTimestamp: number;
  };
  buildings: Record<string, {
    tier: number;
    lastHarvestTimestamp: number;
    isOvercharged?: boolean;
    overchargeExpires?: number;
  }>;
  social: {
    rivalries: Record<string, RivalryRecord>;
    unlockedBadges: string[];
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
  };
}
```
* **Save Frequency:** Auto-saves every 5 seconds (debounced) and immediately on any financial or building transaction.
* **Integrity Guard:** If `version < CURRENT_VERSION`, a sequential migration runner updates older schema payloads without loss of data. If corrupted, a friendly recovery dialogue offers to reset to safe initial state.

---

## 6. Development Tooling & Windows Environment Support

* **Windows PowerShell Execution Policy:** Uses `npm.cmd` directly for all CLI commands.
* **Vite Config:** Configured with relative base path `./` for seamless, static, zero-configuration deployment to GitHub Pages.
* **Bundle Target:** ES2022, optimized WebGL2 with Canvas2D fallback for older hardware.
