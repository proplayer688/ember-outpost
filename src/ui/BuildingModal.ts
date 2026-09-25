import Phaser from 'phaser';
import { BuildingDefinition } from '../data/BuildingsData';
import { EventBus, GameEvents } from '../core/EventBus';
import { Audio } from '../audio/AudioManager';
import { GameState } from '../core/GameState';
import { ParticleFactory } from '../rendering/ParticleFactory';
import { FRIENDS_DATA } from '../data/FriendsData';

export class BuildingModal extends Phaser.GameObjects.Container {
  private overlay: Phaser.GameObjects.Graphics;
  private panel: Phaser.GameObjects.Container;
  private currentDef: BuildingDefinition | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(2000);
    this.setVisible(false);

    // 1. Semi-transparent backdrop
    this.overlay = scene.add.graphics();
    this.overlay.fillStyle(0x070A13, 0.65);
    this.overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);
    this.overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height), Phaser.Geom.Rectangle.Contains);
    this.overlay.on('pointerdown', () => this.close());
    this.add(this.overlay);

    // 2. Center Panel Container
    this.panel = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.add(this.panel);

    EventBus.on(GameEvents.OPEN_BUILDING_MODAL, (def: BuildingDefinition) => {
      this.open(def);
    });

    scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible) this.close();
    });

    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.overlay.clear();
      this.overlay.fillStyle(0x070A13, 0.65);
      this.overlay.fillRect(0, 0, gameSize.width, gameSize.height);
      this.panel.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  public open(def: BuildingDefinition): void {
    this.currentDef = def;
    this.panel.removeAll(true);

    const pw = 440;
    const ph = 300;

    // Panel Window Box (Obsidian with Slate Border)
    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRect(-pw / 2, -ph / 2, pw, ph);
    box.lineStyle(2, 0x1E293B, 1);
    box.strokeRect(-pw / 2, -ph / 2, pw, ph);

    // Inner Accent Highlight
    box.lineStyle(1, 0x334155, 0.6);
    box.strokeRect(-pw / 2 + 4, -ph / 2 + 4, pw - 8, ph - 8);
    this.panel.add(box);

    // Building Icon
    const icon = this.scene.add.sprite(-pw / 2 + 40, -ph / 2 + 45, `building_${def.id}`);
    icon.setScale(0.55);
    this.panel.add(icon);

    // Title & Subtitle
    const title = this.scene.add.text(-pw / 2 + 80, -ph / 2 + 25, def.name.toUpperCase(), {
      fontSize: '14px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.panel.add(title);

    const subtitle = this.scene.add.text(-pw / 2 + 80, -ph / 2 + 42, def.subtitle, {
      fontSize: '9px',
      color: '#94A3B8',
      fontFamily: 'monospace'
    });
    this.panel.add(subtitle);

    // Close button [X]
    const closeBtn = this.scene.add.text(pw / 2 - 28, -ph / 2 + 18, '[X]', {
      fontSize: '12px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setInteractive({ useHandCursor: true });
    this.panel.add(closeBtn);

    closeBtn.on('pointerover', () => closeBtn.setColor('#F43F5E'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#94A3B8'));
    closeBtn.on('pointerdown', () => this.close());

    // Horizontal Divider
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0x1E293B, 1);
    div.lineBetween(-pw / 2 + 15, -ph / 2 + 75, pw / 2 - 15, -ph / 2 + 75);
    this.panel.add(div);

    // Lore Description
    const desc = this.scene.add.text(-pw / 2 + 20, -ph / 2 + 88, def.description, {
      fontSize: '9px',
      color: '#E2E8F0',
      fontFamily: 'monospace',
      wordWrap: { width: pw - 40 }
    });
    this.panel.add(desc);

    // Dynamic Stats Table
    let statY = -ph / 2 + 130;
    const dynamicStats = this.getDynamicStats(def.id);
    dynamicStats.forEach(stat => {
      const lbl = this.scene.add.text(-pw / 2 + 25, statY, stat.label, {
        fontSize: '9px',
        color: '#64748B',
        fontFamily: 'monospace'
      });
      const val = this.scene.add.text(pw / 2 - 25, statY, stat.value, {
        fontSize: '9px',
        color: '#F59E0B',
        fontStyle: 'bold',
        fontFamily: 'monospace'
      }).setOrigin(1, 0);

      this.panel.add(lbl);
      this.panel.add(val);
      statY += 18;
    });

    // Action Area (Building-Specific Functional Actions)
    this.renderBuildingActions(def, pw, ph);

    this.setVisible(true);
    Audio.playInteractChime();

    // Scale pop-in
    this.panel.setScale(0.9);
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  private getDynamicStats(buildingId: string): Array<{ label: string; value: string }> {
    switch (buildingId) {
      case 'outpost_core':
        return [
          { label: 'Outpost Tier', value: `Lv.${GameState.outpost.level} (${GameState.outpost.title})` },
          { label: 'Next Upgrade Cost', value: GameState.outpost.level === 1 ? '250 Coins, 10 Wood, 5 Stone' : '600 Coins, 25 Wood, 12 Crystals, 15 Stone' },
          { label: 'Settlement Efficiency', value: `+${GameState.outpost.level * 25}% Production Bonus` }
        ];
      case 'production_hub':
        return [
          { label: 'Passive Accumulation', value: `${GameState.passiveCoins} Coins Stored` },
          { label: 'Alloy Smelting Recipe', value: '5 Wood + 2 Crystals -> 80 Coins' },
          { label: 'Smelt Research Bonus', value: GameState.workshopResearch.emberRefining ? '+20% Active' : 'Locked at Workshop' }
        ];
      case 'storage_vault':
        return [
          { label: 'Timber Reserve', value: `${GameState.resources.wood} / ${GameState.outpost.storageCap} Units` },
          { label: 'Crystal Shards', value: `${GameState.resources.crystals} / ${GameState.outpost.storageCap} Units` },
          { label: 'Obsidian Stone', value: `${GameState.resources.stone} / ${GameState.outpost.storageCap} Units` }
        ];
      case 'workshop':
        return [
          { label: 'Turbo Gather Tech', value: GameState.workshopResearch.turboGather ? 'RESEARCHED (+1 Harvest)' : 'Available (100 Coins)' },
          { label: 'Ember Refining Tech', value: GameState.workshopResearch.emberRefining ? 'RESEARCHED (+20% Smelt)' : 'Available (150 Coins)' }
        ];
      case 'defense_tower': {
        const isBoosted = GameState.overchargeUntil > Date.now();
        return [
          { label: 'Aether Barrier', value: '100% Operational' },
          { label: 'Overcharge State', value: isBoosted ? 'ACTIVE (+15% Outpost Yield)' : 'Offline (25 Sim $RF)' }
        ];
      }
      case 'training_station':
        return [
          { label: 'Ignis Reflex Window', value: `Lv.${GameState.player.level} (+${GameState.player.level * 3}ms Precision)` },
          { label: 'Daily Dojo Tickets', value: `${GameState.currencies.tickets} / 6 Tickets` }
        ];
      case 'friend_gate':
        return [
          { label: 'Allied Friends in Camp', value: '7 Active Companions' },
          { label: 'Outpost Connection', value: 'Stable Aether Frequency' }
        ];
      case 'challenge_board':
        return [
          { label: 'Precision Minigame', value: 'The Forge Sync (5 Pulses)' },
          { label: 'Skill Rank Multiplier', value: 'Rank S: +120 Coins, Rank A: +85 Coins' }
        ];
      default:
        return [];
    }
  }

  private renderBuildingActions(def: BuildingDefinition, pw: number, ph: number): void {
    if (def.id === 'outpost_core') {
      // Outpost Upgrade Button
      const btn = this.createActionButton(0, ph / 2 - 35, `[ UPGRADE OUTPOST TO LV.${GameState.outpost.level + 1} ]`, () => {
        const res = GameState.upgradeOutpost();
        if (res.success) {
          Audio.playLevelUp();
          ParticleFactory.burstCoinSparks(this.scene, this.panel.x, this.panel.y);
          EventBus.emit(GameEvents.SHOW_FLOATING_TEXT, {
            text: `OUTPOST LEVEL ${res.newLevel}!`,
            color: '#FEF08A',
            x: this.panel.x,
            y: this.panel.y - 40
          });
          this.open(def); // Refresh modal view
        } else {
          Audio.playError();
          btn.text.setText(res.error || 'INSUFFICIENT RESOURCES!');
          this.scene.time.delayedCall(1500, () => {
            if (this.visible && this.currentDef?.id === 'outpost_core') {
              btn.text.setText(`[ UPGRADE OUTPOST TO LV.${GameState.outpost.level + 1} ]`);
            }
          });
        }
      });
    } else if (def.id === 'production_hub') {
      // Two buttons: Claim Passive & Smelt Alloys
      const claimBtn = this.createActionButton(-pw / 4 - 5, ph / 2 - 35, `[ CLAIM (${GameState.passiveCoins}🪙) ]`, () => {
        const claimed = GameState.claimPassiveCoins();
        if (claimed > 0) {
          Audio.playSuccessFanfare();
          ParticleFactory.burstCoinSparks(this.scene, this.panel.x, this.panel.y + 40);
          claimBtn.text.setText(`CLAIMED +${claimed}!`);
          this.scene.time.delayedCall(1200, () => {
            if (this.visible) this.open(def);
          });
        } else {
          Audio.playError();
          claimBtn.text.setText('FURNACE EMPTY');
        }
      }, 180);

      const smeltBtn = this.createActionButton(pw / 4 + 5, ph / 2 - 35, '[ SMELT (5🪵+2💎) ]', () => {
        const smelt = GameState.smeltAlloys();
        if (smelt.success) {
          Audio.playSmelt();
          ParticleFactory.burstCoinSparks(this.scene, this.panel.x, this.panel.y + 40);
          smeltBtn.text.setText(`+${smelt.coinsProduced} COINS!`);
          this.scene.time.delayedCall(1200, () => {
            if (this.visible) this.open(def);
          });
        } else {
          Audio.playError();
          smeltBtn.text.setText(smelt.error || 'NEED 5🪵 + 2💎');
          this.scene.time.delayedCall(1400, () => {
            if (this.visible) smeltBtn.text.setText('[ SMELT (5🪵+2💎) ]');
          });
        }
      }, 190);
    } else if (def.id === 'challenge_board') {
      this.createActionButton(0, ph / 2 - 35, '⚡ [ START THE FORGE SYNC (1🎫) ]', () => {
        this.close();
        EventBus.emit(GameEvents.OPEN_CHALLENGE_MODAL, FRIENDS_DATA['milo']);
      }, 260);
    } else if (def.id === 'friend_gate') {
      this.createActionButton(0, ph / 2 - 35, '[ MEET OUTPOST ARCHITECT MILO ]', () => {
        this.close();
        EventBus.emit(GameEvents.OPEN_FRIEND_MODAL, FRIENDS_DATA['milo']);
      }, 260);
    } else if (def.id === 'storage_vault') {
      this.createActionButton(0, ph / 2 - 35, '[ EXPAND STORAGE (+30 CAP · 150🪙) ]', () => {
        const ok = GameState.expandVault();
        if (ok) {
          Audio.playSuccessFanfare();
          this.open(def);
        } else {
          Audio.playError();
        }
      }, 260);
    } else if (def.id === 'defense_tower') {
      this.createActionButton(0, ph / 2 - 35, '[ OVERCHARGE BARRIER (25 SIM $RF) ]', () => {
        const ok = GameState.overchargeTower();
        if (ok) {
          Audio.playSuccessFanfare();
          this.open(def);
        } else {
          Audio.playError();
        }
      }, 260);
    } else if (def.id === 'training_station') {
      this.createActionButton(0, ph / 2 - 35, '[ TRAIN REFLEXES (50🪙 + 1🎫) ]', () => {
        const ok = GameState.trainReflexes();
        if (ok) {
          Audio.playSuccessFanfare();
          this.open(def);
        } else {
          Audio.playError();
        }
      }, 260);
    } else if (def.id === 'workshop') {
      this.createActionButton(0, ph / 2 - 35, '[ RESEARCH TURBO GATHER (100🪙) ]', () => {
        if (!GameState.workshopResearch.turboGather && GameState.currencies.coins >= 100) {
          GameState.currencies.coins -= 100;
          GameState.workshopResearch.turboGather = true;
          GameState.saveState();
          Audio.playSuccessFanfare();
          this.open(def);
        } else {
          Audio.playError();
        }
      }, 260);
    }
  }

  private createActionButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    width: number = 240
  ): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text } {
    const btnContainer = this.scene.add.container(x, y);
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0x0F172A, 1);
    btnBg.fillRoundedRect(-width / 2, -15, width, 30, 4);
    btnBg.lineStyle(2, 0xF59E0B, 1);
    btnBg.strokeRoundedRect(-width / 2, -15, width, 30, 4);
    btnContainer.add(btnBg);

    const btnText = this.scene.add.text(0, 0, text, {
      fontSize: '9px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    btnContainer.add(btnText);

    btnBg.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -15, width, 30), Phaser.Geom.Rectangle.Contains);
    btnBg.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x1E293B, 1);
      btnBg.fillRoundedRect(-width / 2, -15, width, 30, 4);
      btnBg.lineStyle(2, 0xFEF08A, 1);
      btnBg.strokeRoundedRect(-width / 2, -15, width, 30, 4);
      btnText.setColor('#FFFFFF');
    });
    btnBg.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x0F172A, 1);
      btnBg.fillRoundedRect(-width / 2, -15, width, 30, 4);
      btnBg.lineStyle(2, 0xF59E0B, 1);
      btnBg.strokeRoundedRect(-width / 2, -15, width, 30, 4);
      btnText.setColor('#FEF08A');
    });
    btnBg.on('pointerdown', () => onClick());

    this.panel.add(btnContainer);
    return { container: btnContainer, text: btnText };
  }

  public close(): void {
    Audio.playUIClick();
    this.scene.tweens.add({
      targets: this.panel,
      scale: 0.9,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        EventBus.emit(GameEvents.CLOSE_BUILDING_MODAL);
      }
    });
  }
}
