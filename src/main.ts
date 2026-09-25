import Phaser from 'phaser';
import { createGameConfig } from './core/GameConfig';
import { BootScene } from './scenes/BootScene';
import { OutpostScene } from './scenes/OutpostScene';
import { UIScene } from './scenes/UIScene';
import { SiegeBattleScene } from './scenes/SiegeBattleScene';
import { EventBus, GameEvents } from './core/EventBus';
import { GameState } from './core/GameState';
import { FRIENDS_DATA } from './data/FriendsData';
import { BUILDINGS_DATA } from './data/BuildingsData';
import { RIVAL_OUTPOSTS, COMBAT_UNITS } from './data/CombatData';

window.addEventListener('DOMContentLoaded', () => {
  const config = createGameConfig([BootScene, OutpostScene, UIScene, SiegeBattleScene]);
  const game = new Phaser.Game(config);

  // Smooth orientation / resize handler for mobile devices
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      game.scale.refresh();
    }, 150);
  });
  window.addEventListener('resize', () => {
    game.scale.refresh();
  });

  // Automation / E2E Testing Hook
  (window as unknown as { __EMBER__: unknown }).__EMBER__ = {
    game,
    EventBus,
    GameEvents,
    GameState,
    FRIENDS_DATA,
    BUILDINGS_DATA,
    RIVAL_OUTPOSTS,
    COMBAT_UNITS
  };
});
