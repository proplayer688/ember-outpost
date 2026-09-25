import { EventBus, GameEvents } from './EventBus';

export interface PlayerData {
  name: string;
  title: string;
  level: number;
  xp: number;
  maxXP: number;
}

export interface OutpostData {
  level: number;
  title: string;
  storageCap: number;
  coinCap: number;
}

export interface ResourceData {
  wood: number;
  crystals: number;
  stone: number;
}

export interface CurrencyData {
  coins: number;
  diamonds: number;
  simulatedRF: number;
  tickets: number;
  maxTickets: number;
}

export interface SoundSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}

export interface RivalryRecord {
  wins: number;
  losses: number;
  bestScore: number;
}

export interface CombatRecord {
  trophies: number;
  totalStars: number;
  siegesWon: number;
  siegesLost: number;
  defensesHeld: number;
  baseDefenseLevel: number;
}

export interface SavedGameState {
  version: number;
  player: PlayerData;
  outpost: OutpostData;
  resources: ResourceData;
  currencies: CurrencyData;
  settings: SoundSettings;
  rivalries: Record<string, RivalryRecord>;
  combat?: CombatRecord;
  passiveCoins: number;
  lastPassiveTimestamp: number;
  overchargeUntil: number;
  workshopResearch: {
    emberRefining: boolean;
    turboGather: boolean;
  };
  timestamp: number;
}

const STORAGE_KEY = 'ember_outpost_save_v2';

export class GameStateManager {
  private static instance: GameStateManager;

  public player: PlayerData = {
    name: 'Ignis',
    title: 'Outpost Keeper',
    level: 1,
    xp: 65,
    maxXP: 100
  };

  public outpost: OutpostData = {
    level: 1,
    title: 'Ember Hearth',
    storageCap: 60,
    coinCap: 2500
  };

  public resources: ResourceData = {
    wood: 15,
    crystals: 8,
    stone: 12
  };

  public currencies: CurrencyData = {
    coins: 1250,
    diamonds: 20,
    simulatedRF: 500,
    tickets: 6,
    maxTickets: 6
  };

  public settings: SoundSettings = {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.7,
    isMuted: false
  };

  public rivalries: Record<string, RivalryRecord> = {
    milo: { wins: 2, losses: 1, bestScore: 320 },
    bram: { wins: 1, losses: 2, bestScore: 310 },
    vex: { wins: 1, losses: 3, bestScore: 380 },
    kael: { wins: 0, losses: 2, bestScore: 410 },
    pip: { wins: 3, losses: 1, bestScore: 340 },
    nova: { wins: 2, losses: 2, bestScore: 350 },
    cleo: { wins: 1, losses: 1, bestScore: 290 }
  };

  public combat: CombatRecord = {
    trophies: 150,
    totalStars: 3,
    siegesWon: 1,
    siegesLost: 0,
    defensesHeld: 1,
    baseDefenseLevel: 1
  };

  public passiveCoins: number = 30;
  public lastPassiveTimestamp: number = Date.now();
  public overchargeUntil: number = 0;
  public workshopResearch = {
    emberRefining: false,
    turboGather: false
  };

  private constructor() {
    this.loadState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public saveState(): void {
    try {
      const data: SavedGameState = {
        version: 2,
        player: this.player,
        outpost: this.outpost,
        resources: this.resources,
        currencies: this.currencies,
        settings: this.settings,
        rivalries: this.rivalries,
        combat: this.combat,
        passiveCoins: this.passiveCoins,
        lastPassiveTimestamp: this.lastPassiveTimestamp,
        overchargeUntil: this.overchargeUntil,
        workshopResearch: this.workshopResearch,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      EventBus.emit(GameEvents.STATE_UPDATED);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public loadState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: SavedGameState = JSON.parse(raw);
      if (data && data.version === 2) {
        this.player = { ...this.player, ...data.player };
        this.outpost = { ...this.outpost, ...data.outpost };
        this.resources = { ...this.resources, ...data.resources };
        this.currencies = { ...this.currencies, ...data.currencies };
        this.settings = { ...this.settings, ...data.settings };
        this.rivalries = { ...this.rivalries, ...data.rivalries };
        if (data.combat) {
          this.combat = { ...this.combat, ...data.combat };
        }
        this.passiveCoins = data.passiveCoins ?? 30;
        this.lastPassiveTimestamp = data.lastPassiveTimestamp ?? Date.now();
        this.overchargeUntil = data.overchargeUntil ?? 0;
        this.workshopResearch = { ...this.workshopResearch, ...data.workshopResearch };
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, using safe defaults:', e);
    }
  }

  public recordSiegeVictory(rivalId: string, stars: number, lootCoins: number, lootRF: number): void {
    this.currencies.coins = Math.min(this.currencies.coins + lootCoins, this.outpost.coinCap);
    this.currencies.simulatedRF += lootRF;
    this.combat.totalStars += stars;
    this.combat.siegesWon++;
    this.combat.trophies += stars * 12;
    this.player.xp += stars * 25;
    if (this.player.xp >= this.player.maxXP) {
      this.player.level++;
      this.player.xp -= this.player.maxXP;
      this.player.maxXP = Math.floor(this.player.maxXP * 1.5);
    }
    if (!this.rivalries[rivalId]) {
      this.rivalries[rivalId] = { wins: 0, losses: 0, bestScore: 0 };
    }
    this.rivalries[rivalId].wins++;
    this.rivalries[rivalId].bestScore = Math.max(this.rivalries[rivalId].bestScore, stars * 100);
    this.saveState();
  }

  public recordDefenseVictory(bountyCoins: number, bountyRF: number): void {
    this.currencies.coins = Math.min(this.currencies.coins + bountyCoins, this.outpost.coinCap);
    this.currencies.simulatedRF += bountyRF;
    this.combat.defensesHeld++;
    this.combat.trophies += 18;
    this.player.xp += 35;
    this.saveState();
  }

  public upgradeBaseDefense(): boolean {
    const costRF = 60 * this.combat.baseDefenseLevel;
    const costStone = 10 * this.combat.baseDefenseLevel;
    if (this.currencies.simulatedRF >= costRF && this.resources.stone >= costStone) {
      this.currencies.simulatedRF -= costRF;
      this.resources.stone -= costStone;
      this.combat.baseDefenseLevel++;
      this.saveState();
      return true;
    }
    return false;
  }

  public setMute(muted: boolean): void {
    this.settings.isMuted = muted;
    this.saveState();
  }

  public setVolumes(master: number, music: number, sfx: number): void {
    this.settings.masterVolume = master;
    this.settings.musicVolume = music;
    this.settings.sfxVolume = sfx;
    this.saveState();
  }

  public addCoins(amount: number): void {
    this.currencies.coins = Math.min(this.outpost.coinCap, this.currencies.coins + amount);
    this.saveState();
  }

  public addXP(amount: number): void {
    this.player.xp += amount;
    while (this.player.xp >= this.player.maxXP) {
      this.player.xp -= this.player.maxXP;
      this.player.level += 1;
      this.player.maxXP = Math.round(this.player.maxXP * 1.5);
    }
    this.saveState();
  }

  public addResource(type: keyof ResourceData, amount: number): boolean {
    const boost = this.workshopResearch.turboGather ? 1 : 0;
    const finalAmount = amount + boost;
    if (this.resources[type] >= this.outpost.storageCap) {
      return false; // Storage full
    }
    this.resources[type] = Math.min(this.outpost.storageCap, this.resources[type] + finalAmount);
    this.saveState();
    return true;
  }

  public consumeResource(type: keyof ResourceData, amount: number): boolean {
    if (this.resources[type] < amount) return false;
    this.resources[type] -= amount;
    this.saveState();
    return true;
  }

  public canAfford(cost: { coins?: number; simRF?: number; wood?: number; crystals?: number; stone?: number }): boolean {
    if (cost.coins && this.currencies.coins < cost.coins) return false;
    if (cost.simRF && this.currencies.simulatedRF < cost.simRF) return false;
    if (cost.wood && this.resources.wood < cost.wood) return false;
    if (cost.crystals && this.resources.crystals < cost.crystals) return false;
    if (cost.stone && this.resources.stone < cost.stone) return false;
    return true;
  }

  public spendCost(cost: { coins?: number; simRF?: number; wood?: number; crystals?: number; stone?: number }): boolean {
    if (!this.canAfford(cost)) return false;
    if (cost.coins) this.currencies.coins -= cost.coins;
    if (cost.simRF) this.currencies.simulatedRF -= cost.simRF;
    if (cost.wood) this.resources.wood -= cost.wood;
    if (cost.crystals) this.resources.crystals -= cost.crystals;
    if (cost.stone) this.resources.stone -= cost.stone;
    this.saveState();
    return true;
  }

  public upgradeOutpost(): { success: boolean; newLevel: number; error?: string } {
    if (this.outpost.level >= 3) {
      return { success: false, newLevel: this.outpost.level, error: 'Max level reached for Phase 2!' };
    }

    if (this.outpost.level === 1) {
      // Cost to Lv2: 250 Coins, 10 Wood, 5 Stone
      const cost = { coins: 250, wood: 10, stone: 5 };
      if (!this.spendCost(cost)) {
        return { success: false, newLevel: 1, error: 'Need 250 Coins, 10 Wood, 5 Stone' };
      }
      this.outpost.level = 2;
      this.outpost.title = 'Kindled Camp';
      this.outpost.storageCap = 100;
      this.outpost.coinCap = 5000;
      this.addXP(100);
      this.saveState();
      EventBus.emit(GameEvents.OUTPOST_UPGRADED, this.outpost.level);
      return { success: true, newLevel: 2 };
    } else if (this.outpost.level === 2) {
      // Cost to Lv3: 600 Coins, 25 Wood, 12 Crystals, 15 Stone
      const cost = { coins: 600, wood: 25, crystals: 12, stone: 15 };
      if (!this.spendCost(cost)) {
        return { success: false, newLevel: 2, error: 'Need 600 Coins, 25 Wood, 12 Crystals, 15 Stone' };
      }
      this.outpost.level = 3;
      this.outpost.title = 'Brass Outpost';
      this.outpost.storageCap = 150;
      this.outpost.coinCap = 10000;
      this.addXP(250);
      this.saveState();
      EventBus.emit(GameEvents.OUTPOST_UPGRADED, this.outpost.level);
      return { success: true, newLevel: 3 };
    }

    return { success: false, newLevel: this.outpost.level };
  }

  public smeltAlloys(): { success: boolean; coinsProduced: number; error?: string } {
    // Recipe: 5 Wood + 2 Crystals -> 80 Coins (+20% if research unlocked = 96)
    const cost = { wood: 5, crystals: 2 };
    if (!this.spendCost(cost)) {
      return { success: false, coinsProduced: 0, error: 'Need 5 Wood & 2 Crystals' };
    }
    const bonus = this.workshopResearch.emberRefining ? 1.2 : 1.0;
    const coins = Math.round(80 * bonus);
    this.addCoins(coins);
    this.addXP(20);
    this.saveState();
    return { success: true, coinsProduced: coins };
  }

  public claimPassiveCoins(): number {
    const amount = this.passiveCoins;
    if (amount <= 0) return 0;
    this.passiveCoins = 0;
    this.addCoins(amount);
    this.lastPassiveTimestamp = Date.now();
    this.saveState();
    return amount;
  }

  public expandVault(): boolean {
    const cost = { coins: 150, stone: 8 };
    if (!this.spendCost(cost)) return false;
    this.outpost.storageCap += 30;
    this.outpost.coinCap += 1500;
    this.saveState();
    return true;
  }

  public overchargeTower(): boolean {
    if (this.currencies.simulatedRF < 25) return false;
    this.currencies.simulatedRF -= 25;
    this.overchargeUntil = Date.now() + 60000; // 60s active overcharge
    this.saveState();
    return true;
  }

  public trainReflexes(): boolean {
    if (this.currencies.coins < 50 || this.currencies.tickets < 1) return false;
    this.currencies.coins -= 50;
    this.currencies.tickets -= 1;
    this.addXP(30);
    this.saveState();
    return true;
  }

  public recordChallengeResult(friendId: string, score: number, rank: string): { won: boolean; bounty: number; xp: number } {
    const targetScore = this.rivalries[friendId]?.bestScore ?? 300;
    const won = score >= targetScore;
    
    // Deterministic coin bounty based on performance tier
    let bounty = 25;
    let xp = 15;
    if (rank === 'S') { bounty = 120; xp = 50; }
    else if (rank === 'A') { bounty = 85; xp = 35; }
    else if (rank === 'B') { bounty = 55; xp = 25; }

    this.addCoins(bounty);
    this.addXP(xp);

    if (this.currencies.tickets > 0) {
      this.currencies.tickets -= 1;
    }

    if (!this.rivalries[friendId]) {
      this.rivalries[friendId] = { wins: 0, losses: 0, bestScore: targetScore };
    }

    if (won) {
      this.rivalries[friendId].wins += 1;
    } else {
      this.rivalries[friendId].losses += 1;
    }
    this.rivalries[friendId].bestScore = Math.max(this.rivalries[friendId].bestScore, score);

    this.saveState();
    return { won, bounty, xp };
  }
}

export const GameState = GameStateManager.getInstance();
