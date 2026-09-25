# EMBER OUTPOST — PROJECT RULES & GOVERNANCE

This document establishes the binding architectural, legal, economic, and design constraints for **Ember Outpost**. All contributors, automated agents, and systems must adhere strictly to these principles.

---

## 1. Zero Real-Money / Zero Smart-Contract MVP
- **Never execute or require real $RF transactions.** All $RAREFRIENDS balances, transactions, flows, and sinks are 100% locally simulated.
- **Never require a crypto wallet.** The game runs frictionlessly in any standard modern web browser without MetaMask, Rabby, or browser extensions.
- **Never require NFTs.** Players do not need a Rare Friends Generations or Genesis NFT to access 100% of the game's mechanics, buildings, and loops.
- **Clean Interface Abstraction:** All economic operations must pass through an `IEconomyService` interface. Future on-chain settlement (Robinhood Chain / Arbitrum Orbit) can be plugged in without refactoring core gameplay logic.

---

## 2. Non-Negotiable Economic Safety (Zero Gambling)
- **Strict Prohibition on Chance-Based Wagers:** Absolutely no betting, wagering against friends, roulette, loot boxes, random $RF token payouts, or house-edge mechanics.
- **100% Deterministic Outcomes:** All production rates, building upgrades, challenge scores, and coin rewards are mathematical, deterministic, and transparent.
- **Skill-Based Competition:** Friend challenges (rhythm/timing precision) depend strictly on player reflexes and accuracy, never RNG rolls.
- **Fixed Rewards:** Challenges award deterministic Coin amounts and XP based on rank tiers (Perfect, Excellent, Good), never variable token jackpots.

---

## 3. Brand & IP Integrity (Original Universe Inspiration)
- **Zero Asset Piracy:** Never copy or extract proprietary sprites, backgrounds, audio, or textures from Rare Friends or competitor repositories (e.g., Rare Fantasy, Burning Gym, Steal An Egg).
- **Zero NFT Reproduction:** Never recreate, trace, or imitate specific Rare Friends NFT characters or traits.
- **Original Mascot Character:** The protagonist is a completely custom-designed Outpost Keeper mascot created specifically for Ember Outpost.
- **Original Visual Assets:** All tilesets, buildings, particles, and UI elements are generated or crafted specifically for this project, matching a high-contrast 2.5D isometric cyberpunk-fantasy aesthetic.

---

## 4. Software Engineering & Architecture Standards
- **Separation of Concerns:** Business logic must never be hardcoded into UI components, rendering scenes, or input handlers.
  - Gameplay systems manage entity states.
  - Economy engines manage balances and transaction validation.
  - Social managers handle friend records and rivalry statistics.
  - Phaser scenes only handle rendering, animations, camera, and display hierarchy.
- **Anti-Monolith Mandate:** No single file should exceed 300–400 lines of code. Split complex systems into modular components and single-responsibility classes.
- **Data-Driven Design:** Game balance values, building upgrade trees, costs, production timers, and visual definitions must live in decoupled JSON / TypeScript configuration files (`src/data/*`).
- **Resilient Persistence:** State is saved safely to `localStorage` / `IndexedDB` with schema versioning, checksum validation, migration paths, and error fallbacks. Never crash on corrupted saves.

---

## 5. Verification, Testing & QA
- **Verifiable Milestones:** Every feature addition must be testable through automated unit tests and interactive browser testing.
- **Continuous Playability:** The game must remain buildable, error-free, and playable at every step.
- **Visual QA Standard:** "Would a screenshot of this game look like a serious, finished indie game submission?" Pixel consistency, lighting harmony, and depth sorting must be verified visually.
- **No Hidden Errors:** Catch all unhandled promises, asset load errors, and audio autoplay blocks with user-friendly in-game alerts or recovery dialogues.

---

## 6. Transparency & Submission Compliance
- **Simulated Metrics Disclosure:** Never claim simulated active users, simulated rivalry records, or simulated token balances are live on-chain data.
- **Clear Roadmap Delineation:** The documentation, UI, and submission materials must clearly separate MVP features (simulated, offline-first, client-rendered) from Future Extensibility (smart contracts, real-time multiplayer, on-chain rivalry NFTs).
- **Vibeathon Compliance:** Ember Outpost is submitted under the **Economy Potential** track as an independent, non-SDK, browser-native experience conforming to official competition rules.
