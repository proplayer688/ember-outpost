# Ember Outpost — Comprehensive Quality Assurance & Verification Plan

**QA Lead:** Studio Quality Director & Testing Agent  
**Testing Frameworks:** Vitest (Logic) · Playwright / Browser Testing (E2E)  
**Standard:** Studio Commercial Release Quality  
**Status:** Approved Master QA Specification  

---

## 1. Testing Philosophy

In game development, code compilation is merely the prerequisite for testing—it is **never** proof of a working, enjoyable game. 

Every milestone in Ember Outpost must be verified through two distinct testing gates:
1. **Headless / Unit Verification:** Automated execution of mathematical formulas, save serialization, and state transitions.
2. **Interactive Visual & Browser Testing:** Direct rendering inspection in an active browser session, verifying frame rates, sprite sorting, animation fluidity, UI ergonomics, and audio behavior.

---

## 2. Test Execution Matrix by System

| System | Test ID | Description | Verification Method | Pass Criteria |
|---|---|---|---|---|
| **Boot & Setup** | `TC-BOOT-01` | Canvas initialization & scene mounting | Browser Test | Game loads in < 2.5s with zero console errors or unhandled promise rejections. |
| **Boot & Setup** | `TC-BOOT-02` | Asset preload integrity | Automated / Browser | 100% of textures, sprite sheets, and audio files resolve with HTTP 200. |
| **Movement** | `TC-MOVE-01` | 8-way directional locomotion | Interactive Browser | Pressing WASD / Arrows moves mascot smoothly at 120px/s along isometric axes. |
| **Movement** | `TC-MOVE-02` | Mobile virtual joystick | Responsive Emulation | Dragging touch joystick translates mascot with proportional vector speed. |
| **Collision** | `TC-COLL-01` | Static building collisions | Interactive Browser | Mascot cannot clip through building foundations or perimeter cliffs. |
| **Collision** | `TC-COLL-02` | Corner sliding & snagging | Interactive Browser | Moving diagonally against a wall slides smoothly rather than catching. |
| **Camera** | `TC-CAM-01` | Follow camera lerp & deadzone | Interactive Browser | Camera tracks mascot with 0.1 lerp; zero camera jitter when standing still. |
| **Camera** | `TC-CAM-02` | World boundary clamping | Interactive Browser | Camera never reveals unrendered black void beyond the outpost perimeter. |
| **Interaction**| `TC-INT-01` | Proximity prompt trigger | Interactive Browser | Walking within 48px of building triggers `[E]` prompt; prompt disappears on exit. |
| **Production** | `TC-PROD-01` | Idle Coin accumulation | Unit Test (Vitest) | Formula generates exact Coins based on elapsed seconds and building tier. |
| **Production** | `TC-PROD-02` | Offline harvest calculation | Unit Test (Vitest) | Simulating 60m offline accumulates exact hourly rate capped at Storage limit. |
| **Upgrades** | `TC-UPG-01` | Building upgrade execution | Interactive Browser | Deducts exact Coin/RF cost; increments building tier; triggers cyan energy beam. |
| **Upgrades** | `TC-UPG-02` | Insufficient funds rejection | Interactive Browser | Clicking `[ UPGRADE ]` with low balance shows red warning; balance unchanged. |
| **Challenge** | `TC-CHAL-01`| Precision timing gauge accuracy | Interactive Browser | Spacebar/tap registers Perfect (±8ms), Excellent (±20ms), Good (±40ms), Miss. |
| **Challenge** | `TC-CHAL-02`| Ticket consumption | Interactive Browser | Starting challenge decrements tickets from 6 to 5; ticket timer begins counting. |
| **Persistence**| `TC-PERS-01`| Page reload state preservation | Browser Reload Test | Upgrading base, reloading page: level, coins, mascot position remain intact. |
| **Persistence**| `TC-PERS-02`| Corrupted save recovery | Automated Inject | Injecting garbage JSON into localStorage triggers safe recovery dialog. |
| **Audio** | `TC-AUD-01` | Autoplay unlock policy | Browser Test | Audio unlocks gracefully on first user click/tap without audio context error. |
| **Audio** | `TC-AUD-02` | Master & bus volume controls | Interactive Browser | Adjusting volume slider scales BGM and SFX gain nodes accurately; mute mutes all. |

---

## 3. Visual QA & Aesthetic Evaluation (10 Parameters)

Visual QA is evaluated after every visual milestone against this strict standard:  
> *"Would a screenshot of this game look like a serious, commercially viable game submission?"*

1. **Composition:** Does the outpost look thoughtfully planned, with balanced negative space and clear focal landmarks?
2. **Character Readability:** Is the mascot ("Ignis") immediately distinct from the background terrain at a glance?
3. **World Density:** Is the ground populated with enough cobblestones, lanterns, vegetation, and props to feel lived-in without looking cluttered?
4. **Color Harmony:** Does the scene strictly adhere to the 24-color canonical palette without rogue oversaturated colors?
5. **Contrast:** Do interactive elements and emissive cores (amber flames, cyan crystals) "pop" vividly against the dark obsidian foundation?
6. **Depth Sorting:** Does the mascot correctly pass *behind* roofs and towers, and *in front* of foundation walls and fences?
7. **Lighting & Emissives:** Do lanterns and the Outpost Core cast warm, believable radial illumination on surrounding tiles?
8. **Animation Smoothness:** Do idle bobs, chimney smoke plumes, and walk cycles loop seamlessly at 60 FPS without frame drops?
9. **UI Consistency:** Do all buttons use the branded bracket notation `[ TEXT ]`, high-contrast borders, and pixel-crisp typography?
10. **Mobile Readability:** Is all text legible and all touch targets at least 44x44px on a 375px mobile viewport?

---

## 4. Defect Classification & Severity Matrix

* **P0 — Critical (Blocker):** Game crashes, unhandled exceptions on boot, save data loss, broken core loop (movement blocked, challenge input dead). Must be resolved immediately before any further code is written.
* **P1 — High (Severe):** Major visual glitch (depth sorting inverted, massive pixel swimming), economy balance error (incorrect cost deduction), audio failure on supported devices.
* **P2 — Medium (Degraded Experience):** Minor particle clipping, non-blocking UI alignment issue on specific aspect ratios, text truncation.
* **P3 — Low (Polish / Cosmetic):** Subtle animation timing tweak, minor sound volume balancing, optional particle flourish.

---

## 5. Milestone Regression Checklist

Before marking any milestone complete:
- [ ] `npm.cmd run build` executes with zero TypeScript compiler or Vite errors.
- [ ] Application loads in a fresh browser session with cleared cache.
- [ ] Mascot can walk to all buildings without getting stuck in geometry.
- [ ] Coins accrue and can be harvested.
- [ ] At least one building can be upgraded.
- [ ] Challenge minigame can be played and scored.
- [ ] Page refresh preserves all progress.
- [ ] Mobile touch controls function in device emulation mode.
- [ ] Audio plays cleanly without audio stutter.
- [ ] Browser console remains completely clean (zero warnings/errors).
