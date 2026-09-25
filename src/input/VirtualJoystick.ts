import Phaser from 'phaser';
import { EventBus, GameEvents } from '../core/EventBus';

export class VirtualJoystick extends Phaser.GameObjects.Container {
  private baseImage: Phaser.GameObjects.Image;
  private knobImage: Phaser.GameObjects.Image;
  private actionButton: Phaser.GameObjects.Image;
  private actionText: Phaser.GameObjects.Text;
  private isDragging: boolean = false;
  private touchId: number | null = null;
  private readonly maxRadius: number = 40;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    // Joystick Base & Knob (Bottom Left)
    this.baseImage = scene.add.image(100, scene.scale.height - 100, 'joystick_base');
    this.baseImage.setScrollFactor(0);
    this.baseImage.setAlpha(0.6);
    this.add(this.baseImage);

    this.knobImage = scene.add.image(100, scene.scale.height - 100, 'joystick_knob');
    this.knobImage.setScrollFactor(0);
    this.knobImage.setAlpha(0.85);
    this.add(this.knobImage);

    // Contextual Action Button (Bottom Right)
    this.actionButton = scene.add.image(scene.scale.width - 90, scene.scale.height - 90, 'touch_action_btn');
    this.actionButton.setScrollFactor(0);
    this.actionButton.setInteractive({ useHandCursor: true });
    this.add(this.actionButton);

    this.actionText = scene.add.text(scene.scale.width - 90, scene.scale.height - 90, 'ACT', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5).setScrollFactor(0);
    this.add(this.actionText);

    this.actionButton.on('pointerdown', () => {
      scene.tweens.add({
        targets: [this.actionButton, this.actionText],
        scale: 0.9,
        duration: 80,
        yoyo: true
      });
      EventBus.emit(GameEvents.ACTION_BUTTON_PRESSED);
    });

    this.setupTouchListeners(scene);
    this.setDepth(1000); // Overlay layer

    // Hide by default on pure desktop mouse/keyboard devices
    const hasTouch = scene.sys.game.device.input.touch;
    if (!hasTouch) {
      this.setVisible(false);
    }
  }

  private setupTouchListeners(scene: Phaser.Scene): void {
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Check if touch is on bottom-left half of the screen
      if (pointer.x < scene.scale.width / 2 && pointer.y > scene.scale.height / 2) {
        this.isDragging = true;
        this.touchId = pointer.id;
        this.baseImage.setPosition(pointer.x, pointer.y);
        this.knobImage.setPosition(pointer.x, pointer.y);
        this.setVisible(true);
      }
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.id === this.touchId) {
        const dx = pointer.x - this.baseImage.x;
        const dy = pointer.y - this.baseImage.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const clampedDist = Math.min(dist, this.maxRadius);
        const knobX = this.baseImage.x + Math.cos(angle) * clampedDist;
        const knobY = this.baseImage.y + Math.sin(angle) * clampedDist;
        this.knobImage.setPosition(knobX, knobY);

        // Normalize vector from 0 to 1
        const vx = clampedDist > 5 ? (Math.cos(angle) * (clampedDist / this.maxRadius)) : 0;
        const vy = clampedDist > 5 ? (Math.sin(angle) * (clampedDist / this.maxRadius)) : 0;

        EventBus.emit('virtual_joystick_move', { x: vx, y: vy });
      }
    });

    const resetJoystick = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.touchId) {
        this.isDragging = false;
        this.touchId = null;
        this.knobImage.setPosition(this.baseImage.x, this.baseImage.y);
        EventBus.emit('virtual_joystick_move', { x: 0, y: 0 });
      }
    };

    scene.input.on('pointerup', resetJoystick);
    scene.input.on('pointerupoutside', resetJoystick);

    // Responsive repositioning on window resize
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.actionButton.setPosition(gameSize.width - 90, gameSize.height - 90);
      this.actionText.setPosition(gameSize.width - 90, gameSize.height - 90);
    });
  }
}
