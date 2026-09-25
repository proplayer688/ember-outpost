# Ember Outpost — Phase 1 Playable Vertical Slice Specification

**Game Director:** Studio Lead  
**Scope:** Hyper-Focused, High-Fidelity Playable Vertical Slice  
**Standard:** Must look and feel like a commercially released indie game on first frame  
**Status:** Approved Vertical Slice Contract  

---

## 1. Objective of the Vertical Slice

The goal of Phase 1 is **not** to implement every economic system or deep mini-game mechanic. 

The goal is to prove the **core physical feel, visual beauty, and atmosphere** of Ember Outpost:
> *"Does walking this mascot through this outpost feel tactile, responsive, and visually stunning?"*

If a screenshot of this vertical slice is taken, it must already stand out as a premier contender in the Rare Friends Vibeathon.

---

## 2. Strict Scope Boundaries

### What IS in the Vertical Slice:
1. **One Player Character ("Ignis the Keeper"):**
   - 24x32px original mascot.
   - Smooth 8-directional movement with 4-way isometric animations (Idle 4f, Walk-N 6f, Walk-S 6f, Walk-E 6f, Walk-W 6f).
   - Dynamic contact shadow beneath feet.
2. **One Beautiful Outpost Mesa:**
   - 2.5D isometric terrain (32x16px diamond tiles) with elevation cliff edges.
   - Stone paths connecting central structures.
   - Decorative vegetation: Ancient cyber-trees, moss clumps, glowing ember crystals.
3. **One Camera:**
   - Smooth lerp following (`lerp: 0.1`).
   - Center deadzone.
   - Clamped to outpost bounds.
4. **Collision Engine:**
   - Accurate 2.5D depth sorting (`depth = y + offset`).
   - Tight circular player hitbox preventing walking through buildings, cliffs, or off the mesa edge.
5. **Four Interactive Settlement Buildings:**
   - **Outpost Core:** Monumental tower with pulsing amber crystal spire.
   - **Production Hub:** Brass and stone furnace with active chimney smoke particles.
   - **Workshop:** Mechanical workshop with gear details.
   - **Challenge Board:** Terminal with flickering tech screen.
6. **Contextual Interaction System:**
   - Walking within 48px of any building smoothly pops an animated world-space badge: `[E] Interact`.
   - Pressing `E` (or clicking) opens an inspect modal displaying the building's lore, current tier, and mock upgrade preview.
7. **Visual Effects & Lighting:**
   - Ambient floating ember spark particles drifting up from the furnace and lanterns.
   - Warm radial light cookies cast around lanterns and the Outpost Core.
   - Crisp pixel art rendering (`image-rendering: pixelated`).
8. **Audio Atmosphere:**
   - 1 high-quality ambient Outpost Day BGM track (looping, synth-organic chiptune).
   - Tactile SFX: footstep clicks, building interact chime, modal open/close clicks.
   - Browser autoplay audio unlock handling.
9. **Minimalist HUD:**
   - Top resource bar: Coins (100), Diamonds (10), Simulated $RF (25), Tickets (6/6).
   - Audio mute toggle in top-right.

### What is EXCLUDED from the Vertical Slice (Reserved for Phases 2–5):
- Complex timing challenge rhythm minigame execution (terminal simply shows preview).
- Multi-tier mathematical upgrade trees and deep storage limits.
- Dynamic friend rivalry dossier fetching.
- Full mobile joystick tuning (keyboard WASD + mouse click-to-move is primary).

---

## 3. Acceptance Verification Criteria

The Vertical Slice is accepted ONLY when all 8 criteria pass:
1. **Instant Load:** Canvas renders under 1.5 seconds on local server.
2. **Locomotion Feel:** Mascot responds immediately to WASD/arrows; movement feels tight and agile.
3. **Visual Depth:** Mascot walks cleanly behind the Outpost Core and in front of its base with zero sprite flickering.
4. **Contextual Pop:** Approaching each of the 4 buildings triggers its distinct `[E]` badge.
5. **Modal Interaction:** Pressing `E` halts mascot walking, displays building details, and closes cleanly via `[X]` or `Escape`.
6. **Ambient Life:** Chimney smoke and floating embers are clearly visible and performant at 60 FPS.
7. **Audio Feedback:** Background music loops softly; interacting with buildings produces crisp sound effects.
8. **Visual QA Signoff:** A high-resolution capture of the screen looks rich, cohesive, and finished.
