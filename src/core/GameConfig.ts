import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const createGameConfig = (scenes: (typeof Phaser.Scene)[]): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    backgroundColor: '#070A13',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: scenes
  };
};
