# Rare Friends Vibeathon — Official Submission Dossier & Checklist

**Project Name:** Ember Outpost  
**Target Category:** Economy Potential  
**Status:** Pre-Production Readiness  

---

## 1. Project Overview

* **One-Line Description:** A polished browser-based social strategy and precision adventure game set in an original Rare Friends-inspired visual universe, featuring an expanding living outpost, deterministic economy, and skill-based friend challenges.
* **Target Category:** **Economy Potential** (Engineered to demonstrate how $RAREFRIENDS functions as a healthy, deterministic, positive-sum utility token rather than a speculative gambling chip).
* **Live Playable Preview:** `https://spokesz.github.io/rarefriends-vibeathon/submissions/ember-outpost/` (or designated GitHub Pages deployment).
* **Source Repository:** `https://github.com/[owner]/ember-outpost`

---

## 2. Rare Friends & $RAREFRIENDS Connection

Ember Outpost addresses the fundamental question:  
> *"Why would the Rare Friends ecosystem benefit from being connected to this game?"*

1. **Deterministic Utility Catalyst:** Simulated $RF is utilized as the high-prestige fuel for Outpost Specialization:
   - Overcharging Defense Towers for 24h settlement yield boosts (+15%).
   - Unlocking high-tier scientific expansion in the Workshop.
   - Constructing the monumental Friend Gate and Apex Foundry.
2. **Anti-Gambling Demonstration:** Proves that an NFT/crypto gaming community thrives far better on transparent, skill-based competition and base building than on negative-sum casino mechanics.
3. **Ecosystem Lore & Aesthetic Cohesion:** Adheres faithfully to the color palette, typography (bracket notation `[ CONNECT ]`), and high-contrast pixel-art aesthetic of Rare Friends while maintaining 100% original mascot and world IP.

---

## 3. Disclosures & Simulated Systems Transparency

* **Simulated Token Economy:** 100% of $RAREFRIENDS tokens, Coins, Diamonds, and transactions in this MVP are simulated locally within the browser.
* **No Real-Money Interaction:** No real crypto wallets, private keys, gas fees, smart contract calls, or real-money transactions are required or supported in this MVP.
* **Zero Gambling Certification:** Absolutely zero wagering, betting, roulette, or random prize distribution exists in the game. Friend challenge outcomes are 100% skill-based and reproducible.
* **Non-SDK Architecture:** Built independently using Phaser 3 + TypeScript + Vite, adhering fully to the Vibeathon's non-SDK rules. Does not require an owned NFT to play.

---

## 4. Controls & How to Play

### Desktop Controls:
* **Movement:** `W, A, S, D` or `Arrow Keys` (or Click-to-Move destination).
* **Contextual Interact:** `E` or Click on in-world interactive prompts.
* **Challenge Timing:** `Spacebar` or Click on the timing gauge.
* **Menu Navigation:** Mouse click / keyboard escape to close modals.

### Mobile Touch Controls:
* **Locomotion:** Dynamic floating analog thumbstick (bottom-left quadrant).
* **Actions:** `[ACTION]` button (bottom-right) for contextual interactions.
* **Direct Touch:** Tap any building or resource node directly to interact.

---

## 5. Local Setup & Build Instructions

```sh
# Clone repository
git clone https://github.com/[owner]/ember-outpost.git
cd ember-outpost

# Install dependencies (Windows PowerShell: use npm.cmd)
npm.cmd install

# Start local development server (with HMR)
npm.cmd run dev

# Run unit tests
npm.cmd run test

# Build production bundle for static hosting
npm.cmd run build
```

---

## 6. Future Architecture & Extensibility

### Future On-Chain Architecture (Robinhood Chain / Arbitrum):
The codebase isolates all economy operations behind the `IEconomyService` interface. When moving on-chain:
* `LocalEconomyService` is swapped for `RobinhoodChainEconomyService`.
* Upgrades and Overcharges submit transactions to an audited Solidity contract.
* Simulated $RF balances sync directly with the player’s ERC-20 token holdings.

### Future Real-Time Multiplayer Architecture:
The codebase isolates all social and challenge operations behind `ISocialService`:
* `MockSocialService` is swapped for `ColyseusMultiplayerService` / `WebSocketSocialService`.
* Players can physically visit a friend’s outpost in real-time, inspect their buildings, and challenge their ghost records synchronously.

---

## 7. Submission Pre-Flight Checklist

- [x] Project Category explicitly declared as **Economy Potential**.
- [x] Non-SDK architecture documented and justified.
- [x] Zero-gambling compliance verified across all systems.
- [x] All 8 primary references analyzed in comparative research documents.
- [x] Complete Art Bible with 24-color HEX palette established.
- [x] Comprehensive 42-item MVP Asset Manifest documented.
- [x] 19 independent gameplay systems architected.
- [x] Deterministic 4-currency economy balanced.
- [x] QA and Browser Verification Plan complete.
- [x] Static build configuration verified for GitHub Pages.
