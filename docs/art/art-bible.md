# Ember Outpost — Comprehensive Art Bible & Visual Style Guide

**Version:** 1.0.0  
**Author:** Art Director & UX/UI Director  
**Status:** Canonical Visual Specification  

---

## 1. Visual Pillars & Tone

Ember Outpost fuses **cybernetic alchemy** with **retro-isometric pixel art**. It exists within an original adjacent dimension inspired by the Rare Friends universe: a world where forgotten ancient embers fuel futuristic micro-settlements.

### Core Pillars:
1. **Readable Silhouette First:** Every building, mascot, and prop must be instantly recognizable at native 1x resolution.
2. **Warm Ember vs. Cold Void:** Dramatic contrast between deep midnight navy/purple environments and vibrant warm amber/electric cyan emissive cores.
3. **Tactile Pixel Integrity:** Crisp pixel edges, zero blurry anti-aliasing, rigid adherence to pixel grids and isometric projection.
4. **Living World Motion:** Subtle ambient life everywhere: pulsing crystals, floating ember particles, flickering lamps, breathing chimneys.

---

## 2. Canonical Color Palette (Exact HEX Values)

The palette is rigorously constrained to 24 colors across 6 functional palettes to ensure visual coherence.

### A. Cosmic Void & Environment Base (Cold Shadows)
* `#070A13` — **Deep Void Navy** (Base background, deep ravines, furthest depth)
* `#0F172A` — **Obsidian Slate** (Ground stone tiles, structural foundations)
* `#1E293B` — **Midnight Cobalt** (Elevated terrain edges, masonry, shadows)
* `#334155` — **Cool Steel Blue** (Path flagstones, building structural beams)

### B. Natural Flora & Moss (Muted Accents)
* `#0D2818` — **Dark Pine** (Deep tree shadows, forest foliage backdrop)
* `#164E2E` — **Moss Evergreen** (Standard foliage, grass clumps, bushes)
* `#22C55E` — **Brite Clover** (Grass highlights, healthy plant edges)
* `#86EFAC` — **Bioluminescent Spore** (Glow mushrooms, fairy grass accents)

### C. Ancient Ember & Forge Core (Primary Warm Emissives)
* `#7C2D12` — **Burnt Rust** (Deep shading on metals, forge interior)
* `#EA580C` — **Blaze Amber** (Forge fires, lantern glass, molten conduits)
* `#F59E0B` — **Sunburst Gold** (Coins, energy core highlights, active signs)
* `#FEF08A` — **Ember Spark Yellow** (Hottest flame centers, sparkle particles)

### D. Cybernetic Aether & Rare Friends Utility (Primary Cold Emissives)
* `#083344` — **Deep Mariana** (Crystal shadows, dark circuit lines)
* `#06B6D4` — **Electric Cyan** (Simulated $RF crystals, tech interfaces, teleporters)
* `#38BDF8` — **Aether Sky** (Upgrade energy beams, gate portal vortex)
* `#E0F2FE` — **Quantum Glint** (Brightest crystal tips, hit flash)

### E. Mascot & Character Identity: "Ignis the Keeper"
* `#312E81` — **Twilight Indigo** (Keeper coat/body shadow)
* `#6366F1` — **Starlight Violet** (Keeper main body tone)
* `#F43F5E` — **Coral Rose** (Mascot scarf/cape & blush accents)
* `#FFFFFF` — **Pure White** (Eye glints, UI highlight pips)

### F. UI Shell & Typography
* `#0B0F19` — **Panel Obsidian** (Window background with 95% opacity)
* `#1F2937` — **Panel Border Slate** (1px crisp window frame)
* `#94A3B8` — **Subtext Muted Steel** (Labels, helper copy, secondary stats)
* `#F8FAFC` — **Header Crisp White** (Primary titles, currency counters)

---

## 3. Pixel Scale & Isometric Grid

### The 2:1 True Isometric Ratio
* **Tile Width:** `32px`
* **Tile Height:** `16px`
* **Projection Angle:** `26.565°` (standard mathematical 2:1 pixel art isometric ratio; step 2 pixels horizontally for every 1 pixel vertically).
* **Depth Stride (Z-Axis):** Vertical elevations rise in multiples of `8px` or `16px`.

```
        /\ (0, -8)
       /  \
(-16,0) \  / (16, 0)
         \/ (0, 8)
```

### Scale Multipliers:
* **Native Pixel Resolution:** `480 × 270` or `960 × 540` viewport.
* **Canvas Presentation:** Rendered with `image-rendering: pixelated` / `crisp-edges` with integer scaling (2x or 3x on modern high-DPI displays).
* **No Sub-Pixel Rendering:** All game objects snap to integer world coordinates `Math.round(x)`, `Math.round(y)` to prevent pixel shearing and swimming artifacts.

---

## 4. Construction Rules

### Outline Rules
1. **Outer Silhouette:** Every distinct world object (character, building, interactive chest) has a dark outline using the darkest environmental shade (`#070A13` or `#0F172A`). Never use pure `#000000` unless depicting total void.
2. **Inner Details:** Internal edges use selective outlining (sel-out), utilizing intermediate shades rather than full black lines to avoid a cluttered "coloring book" look.
3. **No Orphan Pixels:** Avoid single isolated 1px specks (jaggies) unless intentionally representing sparks or stars. Double-pixel corners must follow clean staircase geometry (2-1-2-1).

### Shading & Lighting Rules
1. **Universal Light Source:** Primary ambient light originates from the **Top-Left-Up** direction.
   - Top faces: Lightest tone (Sun/Sky tint).
   - Left-facing surfaces: Mid-tone (Key light).
   - Right-facing surfaces: Dark-tone (Shadow).
2. **Emissive Light Sources:**
   - Ember lamps and crystals cast 16-32px soft radial glow overlays with additive blend mode.
   - Ground beneath active buildings receives a warm orange or cyan tint.
3. **Cast Shadows:**
   - Elliptical contact shadows directly beneath characters and elevated objects using `#070A13` with 40–50% opacity.

---

## 5. Sprite Dimensions & Scale Hierarchy

| Entity Class | Footprint (Tiles) | Bounding Box (WxH) | Visual Weight |
|---|---|---|---|
| **Player Mascot (Keeper)** | 1x1 tile | `24 × 32 px` | Agile, expressive, eye-level anchor |
| **Small Props (Lamps, Crates)** | 1x1 tile | `16 × 24 px` | Clear ground readability |
| **Resource Nodes (Rocks, Trees)** | 1x1 to 2x2 | `32 × 48 px` | Harvestable, chunky volume |
| **Standard Buildings (Workshop, Storage)**| 2x2 tiles | `64 × 64 px` | Solid, grounded settlement structures |
| **Major Hubs (Outpost Core, Gate)** | 3x3 tiles | `96 × 96 px` | Monumental focal points |
| **HUD Icons** | N/A | `16 × 16 px` | High-contrast symbolic glyphs |

---

## 6. Animation Principles & Timing

Animation in Ember Outpost follows snappy, responsive 12 FPS timing (83.3ms per frame) to preserve the arcade feel.

* **Idle (Keeper):** 4 frames @ 150ms/frame. Gentle 1px squash/stretch bob with breathing cape.
* **Idle-Variation:** Rare 6-frame cycle (plays every 8-12 seconds): mascot checks an ancient compass or juggles an ember spark.
* **Walk (4 Directions):** 6 frames @ 100ms/frame. Clear foot lift, 2px bounce, trailing scarf puff.
* **Interaction (Tapping/Working):** 3-frame quick forward reach with glowing hand pip.
* **Celebration / Upgrade Success:** 5-frame leap, arms aloft, starburst particle eruption.
* **Challenge Precision Bar:** High-refresh 60 FPS interpolated indicator passing across color-coded hit zones.

---

## 7. Particle Language & VFX

Particles are rendered as pixelated quads (1x1, 2x2, or 3x3 pixels), never smooth circular blobs.

1. **Ember Dust:** 1x1 golden/orange squares floating upwards with subtle horizontal sine-wave drift; fade out over 1.2s.
2. **Coin Pickup Sparkle:** 3x3 cross glint (`+`) expanding into four 1x1 corner pixels that pop and disappear.
3. **Upgrade Aether Pillar:** Vertical ascending lines of cyan `#06B6D4` with electric jitter.
4. **Challenge Hit Impacts:**
   - *Perfect:* Golden shockwave ring expanding outward + "PERFECT" floating pixel text.
   - *Excellent:* Cyan sparkle burst.
   - *Good:* White dual spark.
   - *Miss:* Muted gray smoke puff with red glitch shake.

---

## 8. UX/UI & Typography System

### Typography:
* **Primary Pixel Font:** Clean, readable 8px bitmap font (e.g., `Silkscreen`, `Press Start 2P`, or custom bitmap font canvas renderer).
* **Title Scale:** 16px bitmap text.
* **Body & HUD Scale:** 8px bitmap text (crisp integer rendering).
* **Number Display:** Monospace tabular numerals to prevent layout jiggle when balances increment.

### Window & Panel Language:
* **Background:** Deep obsidian `#0B0F19` with a subtle 1px inner highlight of `#1E293B`.
* **Border:** 2px solid border using `#334155` with sharp 90-degree corners or 1px clipped chamfered corners.
* **Brackets Pattern:** Interactive buttons are framed with ASCII brackets: `[ UPGRADE ]`, `[ CLAIM ]`, `[ CHALLENGE ]` reflecting the authentic Rare Friends brand vernacular.
* **Active State:** Hover/Focus turns button background to `#1E293B` and border to `#F59E0B` (Amber) or `#06B6D4` (Cyan).

---

## 9. DOs and DON'Ts

### DO:
* **DO** keep color saturation focused on interactive objects and energy cores; keep paths and background tiles muted.
* **DO** sort depths strictly using `depth = y + z_offset` so player walks behind roofs and in front of walls correctly.
* **DO** use clear contextual world-space icons (`[E] Interact`) that float above buildings when in proximity.
* **DO** ensure the mascot's eyes and expressions remain readable even when zoomed out.

### DON'T:
* **DON'T** use smooth vector gradients or modern Gaussian blurs; blur destroys pixel-art charm.
* **DON'T** rotate pixel sprites at arbitrary float angles without rotoscope pixel preservation (stick to 90/180/270 degrees or discrete frame flips).
* **DON'T** mix different pixel densities (no "mixels"; everything conforms to 1x or integer 2x pixel size).
* **DON'T** use generic Unicode emoji in place of custom pixel icons.
