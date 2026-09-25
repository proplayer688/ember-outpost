import Phaser from 'phaser';

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.camera.setRoundPixels(true);
  }

  public setup(target: Phaser.GameObjects.Sprite, worldBounds: { x: number; y: number; width: number; height: number }): void {
    // Set world bounds for physics and camera
    this.camera.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
    
    // Smooth follow with 0.1 lerp
    this.camera.startFollow(target, true, 0.1, 0.1);
    
    // 32x32 center deadzone to prevent micro-jitter
    this.camera.setDeadzone(32, 32);
    
    // Default zoom for 2.5D pixel art
    this.camera.setZoom(1.5);
  }

  public getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }
}
