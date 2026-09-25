# Ember Outpost — MVP Master Asset Manifest

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Total MVP Assets:** 42 items across 5 categories  

---

## 1. Character & Mascot Assets

| ID | Filename | Dimensions | Format | Purpose | Animation States | Collision | Layer | Priority | Dependencies | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `CH-01` | `ignis_keeper.png` | 24×32 px / frame | PNG-32 Sprite Sheet | Player mascot ("Ignis the Keeper") | Idle (4f), Idle-Alt (6f), Walk-N (6f), Walk-S (6f), Walk-E (6f), Walk-W (6f), Interact (3f), Collect (3f), Celebrate (5f) | Circular feet box (16×8 px) | Dynamic Entity (`y`) | **P0 (Critical)** | None | Original mascot; compact silhouette; indigo body with ember-glowing eyes and coral scarf. |
| `CH-02` | `shadow_blob.png` | 20×10 px | PNG-32 | Mascot ground contact shadow | Static (subtle opacity pulse) | None | Ground FX (`y-1`) | **P0** | `ignis_keeper.png` | Semi-transparent `#070A13` at 45% alpha. |

---

## 2. Settlement Buildings

| ID | Filename | Dimensions | Format | Purpose | Animation States | Collision | Layer | Priority | Dependencies | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `BLD-01` | `outpost_core.png` | 96×96 px | PNG-32 | Central settlement command tower | Pulse Core (4f), Idle (1f) | 64×32 px base | Building (`y`) | **P0 (Critical)** | None | Level 1–7 progression hub; large amber ember crystal on roof spire. |
| `BLD-02` | `production_hub.png` | 64×64 px | PNG-32 | Passive Coin generator (Furnace & Foundry) | Smoke Plume (4f), Molten Flow (3f) | 48×24 px base | Building (`y`) | **P0 (Critical)** | `outpost_core` | Active chimney smoke when producing coins. |
| `BLD-03` | `workshop.png` | 64×64 px | PNG-32 | Tech research & building upgrade station | Gear Turn (4f), Spark Emitter | 48×24 px base | Building (`y`) | **P0 (Critical)** | `outpost_core` | Houses tech tree and efficiency upgrades. |
| `BLD-04` | `storage_vault.png` | 64×48 px | PNG-32 | Coin & Resource maximum capacity vault | Ambient Lock Glow (2f) | 48×24 px base | Building (`y`) | **P1 (High)** | `outpost_core` | Upgrading increases maximum offline storage capacity. |
| `BLD-05` | `training_station.png` | 64×64 px | PNG-32 | Mascot stat training & timing drills | Training Dummy Swing (4f) | 48×24 px base | Building (`y`) | **P1 (High)** | `outpost_core` | Increases challenge score multipliers and XP gains. |
| `BLD-06` | `defense_tower.png` | 48×80 px | PNG-32 | Settlement perimeter defense & overcharge | Rotating Sentry Eye (8f) | 32×16 px base | Building (`y`) | **P1 (High)** | `outpost_core` | Can be overcharged with Simulated $RF for defense perks. |
| `BLD-07` | `friend_gate.png` | 96×80 px | PNG-32 | Social hub & Friend rivalry portal | Portal Vortex Swirl (6f) | 64×24 px base | Building (`y`) | **P1 (High)** | `outpost_core` | Gateway to inspect friend settlements and rivalries. |
| `BLD-08` | `challenge_board.png` | 48×48 px | PNG-32 | Real-time precision challenge terminal | Screen Flicker (2f) | 32×16 px base | Building (`y`) | **P0 (Critical)** | None | Launches "The Forge Sync" rhythm/timing mini-game. |

---

## 3. Environment & Terrain Assets

| ID | Filename | Dimensions | Format | Purpose | Animation States | Collision | Layer | Priority | Dependencies | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `ENV-01` | `tile_isometric_ground.png`| 32×16 px | PNG-32 | Standard dark obsidian ground tile | Static | None | Terrain Base (0) | **P0** | None | Seamless 2:1 isometric tile; dark slate texture with subtle edge bevel. |
| `ENV-02` | `tile_isometric_path.png`  | 32×16 px | PNG-32 | Flagstone walkway tile connecting buildings | Static | None | Terrain Base (1) | **P0** | None | Steel blue flagstones guiding player between core hubs. |
| `ENV-03` | `tile_isometric_cliff.png` | 32×32 px | PNG-32 | Elevated terrain cliff edges | Static | Wall collision | Terrain Cliff (2) | **P0** | None | Defines perimeter boundaries of the floating outpost mesa. |
| `ENV-04` | `prop_ember_lantern.png`  | 16×32 px | PNG-32 | Streetlamp with warm flame | Flame Flicker (4f) | 8×8 px base | Prop (`y`) | **P0** | None | Casts 32px radial ambient warm glow circle. |
| `ENV-05` | `prop_ancient_tree.png`   | 48×64 px | PNG-32 | Cyber-organic foliage tree | Leaf Sway (4f) | 16×16 px base | Prop (`y`) | **P0** | None | Moss green with faint bioluminescent cyan veins. |
| `ENV-06` | `prop_ember_crystal.png`  | 24×32 px | PNG-32 | Harvestable simulated RF crystal node | Shimmer (3f) | 16×16 px base | Prop (`y`) | **P0** | None | Harvestable node in the outpost outskirts. |
| `ENV-07` | `prop_storage_crates.png`  | 32×24 px | PNG-32 | Decorative logistics crates & barrels | Static | 24×16 px base | Prop (`y`) | **P1** | None | Industrial props scattered near Workshop and Storage. |
| `ENV-08` | `prop_settlement_fence.png`| 32×24 px | PNG-32 | Perimeter boundary fencing | Static | Full length bar | Prop (`y`) | **P1** | None | Keeps player safely within the playable outpost perimeter. |

---

## 4. Visual Effects & Particles

| ID | Filename | Dimensions | Format | Purpose | Animation States | Priority | Notes |
|---|---|---|---|---|---|---|---|
| `VFX-01` | `particle_ember_spark.png` | 2×2 / 3×3 px | PNG-32 | Floating chimney and lantern embers | 3-frame life | **P0** | Additive blend; rises with horizontal sine wobble. |
| `VFX-02` | `particle_coin_pop.png`    | 8×8 px | PNG-32 | Burst effect on collecting coins/resources | 4-frame pop | **P0** | Starburst sparkle that scales and fades. |
| `VFX-03` | `particle_upgrade_beam.png` | 16×64 px | PNG-32 | Ascending vertical pillar of cyan energy | 6-frame beam | **P1** | Triggers on building upgrade confirmation. |
| `VFX-04` | `fx_challenge_hit_ring.png` | 32×32 px | PNG-32 | Expanding precision ring for Perfect/Good | 5-frame ring | **P0** | Feedback ring inside the timing challenge. |
| `VFX-05` | `fx_light_glow_radial.png`  | 64×64 px | PNG-32 | Soft radial glow mask for ambient lighting | Static | **P0** | Multiplied or additive light cookie for lanterns. |

---

## 5. UI Elements & Iconography

| ID | Filename | Dimensions | Format | Purpose | States | Priority | Notes |
|---|---|---|---|---|---|---|---|
| `UI-01` | `icon_currency_coin.png`   | 16×16 px | PNG-32 | Gold gameplay coin icon | Static | **P0** | Clean pixel gold coin with bright center pip. |
| `UI-02` | `icon_currency_diamond.png`| 16×16 px | PNG-32 | Blue diamond QoL currency icon | Static | **P0** | Cyan crystalline gem. |
| `UI-03` | `icon_currency_rf.png`     | 16×16 px | PNG-32 | Simulated $RAREFRIENDS token glyph | Static | **P0** | Distinct pixel emblem representing the RF ecosystem. |
| `UI-04` | `icon_currency_ticket.png` | 16×16 px | PNG-32 | Challenge ticket / energy icon | Full / Empty | **P0** | Represents 1/6 challenge energy slots. |
| `UI-05` | `prompt_interact_e.png`    | 24×12 px | PNG-32 | World-space `[E]` interact button prompt | Bobbing (4f) | **P0** | Floats above interactive structures in proximity. |
| `UI-06` | `panel_frame_9slice.png`   | 24×24 px | PNG-32 | 9-slice obsidian window background | Slice 8-8-8 | **P0** | Modular window container with slate borders. |
| `UI-07` | `button_bracket_primary.png`| 48×20 px | PNG-32 | Primary action button `[ TEXT ]` | Default/Hover/Active | **P0** | Brackets style inspired by Rare Friends UI. |
| `UI-08` | `challenge_meter_bar.png`  | 200×24 px | PNG-32 | Precision timing meter base | Track + Zones | **P0** | Color-coded hit zones: Gold, Cyan, White, Red. |
| `UI-09` | `challenge_slider_pip.png` | 6×28 px | PNG-32 | Moving slider needle for timing challenge | Oscillating | **P0** | High-contrast cursor moving across hit zones. |
| `UI-10` | `joystick_base.png`        | 96×96 px | PNG-32 | Virtual touch joystick base for mobile | Static | **P1** | Semi-transparent ring for touch devices. |
| `UI-11` | `joystick_thumb.png`       | 40×40 px | PNG-32 | Virtual touch joystick thumb knob | Dragged | **P1** | Responsive touch knob with spring return. |
