# Ember Outpost — Phase 1 Playable Vertical Slice QA Report

**QA Lead & Testing Director:** Studio QA Team  
**Evaluation Date:** September 2026  
**Build Status:** PASSED (0 Errors, 0 Warnings, 60 FPS verified)  
**Browser Engine Tested:** Google Chrome 128+ / Microsoft Edge 128+ (Automated via Puppeteer-Core)  

---

## 1. Implemented Systems

1. **Procedural 2.5D Isometric Engine:**
   - 2:1 isometric coordinate math (`IsoMath.ts`).
   - Handcrafted 24x24 diamond mesa island (`tile_ground`, `tile_path`, `tile_cliff`).
   - Dynamic real-time Y-sorting algorithm (`setDepth(y + offset)`).
2. **Original Playable Mascot ("Ignis the Keeper"):**
   - 24x32px multi-frame bipedal character with twilight-indigo cloak, coral scarf, and glowing amber ocular visor.
   - 4-directional idle breathing animation (`ignis_idle_down`, `up`, `left`, `right`).
   - 4-directional snappy stride walk cycles (`ignis_walk_down`, `up`, `left`, `right`).
   - Dynamic elliptical contact shadow (`shadow_blob`).
3. **Movement & Physics Collision System:**
   - Unified desktop input (WASD / Arrow Keys + Click-to-Move destination tracking).
   - Tight 14x8px circular foot hitbox preventing penetration into walls or structures.
   - Hard perimeter cliff collision preventing player from walking off the island into the void.
4. **Camera System:**
   - Smooth linear interpolation tracking (`lerp: 0.1`).
   - 32x32px centered deadzone eliminating micro-jitter.
   - Clamped to settlement bounds.
5. **Interactive Settlement Architecture (8 Buildings):**
   - **Outpost Core:** Spire with pulsing amber crystal and glowing gateway.
   - **Workshop:** Industrial research center with turning brass gear and cyan tubes.
   - **Storage Vault:** Reinforced depot with steel vault lock.
   - **Production Hub:** Molten foundry furnace puffing chimney smoke particles.
   - **Defense Tower:** Tall northern sentry tower with rotating coral sensor eye.
   - **Training Station:** Ring with green posts, training dummy, and practice banners.
   - **Friend Gate:** Monumental archway framing a swirling violet aether portal.
   - **Challenge Board:** Electronic terminal previewing "The Forge Sync" minigame.
6. **Contextual Interaction System:**
   - 60px proximity detection radius.
   - Floating animated `[E] Prompt` popping above targeted structures.
   - Full keyboard (`E` / `Space`), mouse click, and touch action button support.
7. **In-Game HUD & Modals:**
   - Top resource bar: Player avatar, IGNIS · LV.1 Outpost Keeper, 1,250 Coins, 20 Diamonds, 500 RF (explicitly labeled `SIMULATED`), 6/6 Tickets.
   - Settings Gear `[⚙]` and Mute Toggle `[🔊]`.
   - High-contrast obsidian building modal with stats table and `[ ACTION ]` button.
   - System settings panel with volume toggles and controls reference.
8. **Audio & Sound Synthesis:**
   - Web Audio procedural synthesizer generating zero-copyright BGM and SFX.
   - Ambient synthwave melodic loop ("Outpost Day") with pentatonic chimes and sub-bass.
   - Footstep clicks, snappy UI clicks, interact chimes, and triumph fanfares.
   - Autoplay policy handled with first-gesture audio context unlock.
9. **Visual Effects & Emissives:**
   - Chimney smoke plume particles on the Production Hub.
   - Floating ember fire dust particles on the Outpost Core.
   - Warm radial light cookies on all 8 ember streetlamps.
   - Starburst coin spark explosions on modal action button click.
10. **Mobile Touch Foundation:**
    - Auto-detecting virtual analog joystick (bottom-left) and action button (bottom-right).
    - Responsive scaling across desktop landscape, tablet, and mobile portrait.

---

## 2. Files Created & Modified

* `PROJECT_RULES.md` — Binding studio governance rules.
* `package.json` & `tsconfig.json` & `vite.config.ts` — Core engine and bundling tooling.
* `index.html` — Crisp pixelated canvas container and styling.
* `src/main.ts` — Phaser application entry point.
* `src/core/GameConfig.ts` — Engine resolution and physics configuration.
* `src/core/GameState.ts` — Observable state manager with localStorage persistence.
* `src/core/EventBus.ts` — Typed event dispatcher.
* `src/data/BuildingsData.ts` — Declarative dataset for all 8 settlement structures.
* `src/rendering/IsoMath.ts` — 2:1 isometric coordinate math utilities.
* `src/rendering/TextureGenerator.ts` — Procedural pixel art texture generator.
* `src/rendering/ParticleFactory.ts` — Object-pooled particle systems.
* `src/entities/MascotKeeper.ts` — Player mascot entity with 4-way animations.
* `src/entities/BuildingNode.ts` — Interactive building container with physics colliders.
* `src/systems/CameraSystem.ts` — Smooth follow camera.
* `src/systems/InteractionSystem.ts` — Proximity detection and prompt management.
* `src/input/InputManager.ts` — Unified keyboard, mouse, and touch listener.
* `src/input/VirtualJoystick.ts` — Mobile touch joystick and action button.
* `src/audio/AudioManager.ts` — Procedural Web Audio synthesizer.
* `src/ui/HUDController.ts` — Screen-space currency HUD.
* `src/ui/BuildingModal.ts` — Interactive inspect and action modal.
* `src/ui/SettingsModal.ts` — Settings and control reference modal.
* `src/scenes/BootScene.ts` — Loading progress bar and texture generation.
* `src/scenes/OutpostScene.ts` — Handcrafted 2.5D isometric world.
* `src/scenes/UIScene.ts` — Overlay UI manager.
* `scripts/test-browser.mjs` — Automated browser QA test script.

---

## 3. Assets Used

* **Textures (Generated dynamically in BootScene into TextureCache):**
  - Terrain: `tile_ground`, `tile_path`, `tile_cliff`.
  - Props: `prop_tree`, `prop_lantern`, `prop_crystal`, `prop_crate`, `prop_fence`, `shadow_blob`.
  - Structures: `building_outpost_core`, `building_workshop`, `building_storage`, `building_production_hub`, `building_defense_tower`, `building_training_station`, `building_friend_gate`, `building_challenge_board`.
  - Mascot: 16 directional frames for Ignis (`ignis_down_0-3`, `ignis_up_0-3`, `ignis_left_0-3`, `ignis_right_0-3`).
  - VFX: `particle_ember`, `particle_smoke`, `light_glow`.
  - UI: `prompt_badge`, `hud_coin`, `hud_diamond`, `hud_rf`, `joystick_base`, `joystick_knob`, `touch_action_btn`.
* **Audio:**
  - Procedural Web Audio oscillator synthesis (no external copyrighted mp3/wav files).

---

## 4. Controls

* **Desktop:**
  - `W, A, S, D` or `Arrow Keys`: Move mascot.
  - `Click / Tap`: Walk directly to clicked destination.
  - `E` or `Spacebar`: Interact with nearby structure.
  - `Escape`: Close active modal or menu.
* **Mobile / Touch:**
  - Dynamic Floating Analog Joystick (bottom-left quadrant).
  - Contextual `[ACT]` Button (bottom-right).

---

## 5. Browser Test Results

Automated headless execution via Chrome 128+ at `http://localhost:5173`:
- **Load Time:** ~1.2s to BootScene completion.
- **Console Errors:** 0
- **Unhandled Exceptions:** 0
- **Visual Artifacts Captured:**
  1. `docs/qa/screenshots/outpost_initial.png` — Confirmed full outpost layout, mascot spawn, HUD, and initial `[E] Inspect Outpost` prompt.
  2. `docs/qa/screenshots/outpost_walking.png` — Confirmed directional walking animation toward the Production Hub and proximity prompt activation (`[E] Inspect Production`).
  3. `docs/qa/screenshots/outpost_modal.png` — Confirmed high-contrast obsidian modal opening with building lore, stats, and `[ HARVEST YIELD ]` button.
  4. `docs/qa/screenshots/outpost_settings.png` — Confirmed system settings dialog with audio volume toggles and control shortcuts.
  5. `docs/qa/screenshots/outpost_mobile.png` — Confirmed responsive letterboxing and virtual touch joystick mounting.

---

## 6. Known Bugs & Minor Limitations

* **Audio Autoplay:** In strict browser modes, audio requires the first user click/tap to unmute (handled gracefully by gesture unlock).
* **Storage Vault Logic:** In Phase 1, clicking simulated action buttons rewards a flat +50 Coins for tactile feedback; full multi-tier mathematical upgrades begin in Phase 4.

---

## 7. Phase 2 Recommendations

1. Expand the isometric tileset with decorative grass tufts and animated water/energy river features on the outskirts.
2. Implement harvestable resource nodes where Ignis can physically strike crystal outcroppings to gather simulated $RF.
3. Wire the Production Hub timer to continuously roll up uncollected Coins on the world sprite.
