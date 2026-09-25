import Phaser from 'phaser';
import { EventBus, GameEvents } from '../core/EventBus';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private virtualVector: { x: number; y: number } = { x: 0, y: 0 };
  private isPointerDown: boolean = false;
  private targetPointerPos: { x: number; y: number } | null = null;
  private isInputLocked: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupPointer();
    this.setupEventBus();
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };

    // E key triggers contextual interaction
    this.wasd.E.on('down', () => {
      if (!this.isInputLocked) {
        EventBus.emit(GameEvents.ACTION_BUTTON_PRESSED);
      }
    });

    // Spacebar also triggers interaction as alternative
    this.cursors.space.on('down', () => {
      if (!this.isInputLocked) {
        EventBus.emit(GameEvents.ACTION_BUTTON_PRESSED);
      }
    });
  }

  private setupPointer(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore click if clicking over UI modal
      if (this.isInputLocked) return;
      this.isPointerDown = true;
      this.targetPointerPos = { x: pointer.worldX, y: pointer.worldY };
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerDown && !this.isInputLocked) {
        this.targetPointerPos = { x: pointer.worldX, y: pointer.worldY };
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isPointerDown = false;
      this.targetPointerPos = null;
    });
  }

  private setupEventBus(): void {
    // Listen for mobile joystick vector
    EventBus.on('virtual_joystick_move', (vec: { x: number; y: number }) => {
      this.virtualVector = vec;
    });

    // Lock input when modal is open
    EventBus.on(GameEvents.OPEN_BUILDING_MODAL, () => {
      this.isInputLocked = true;
    });
    EventBus.on(GameEvents.CLOSE_BUILDING_MODAL, () => {
      this.isInputLocked = false;
    });
    EventBus.on(GameEvents.OPEN_SETTINGS, () => {
      this.isInputLocked = true;
    });
    EventBus.on(GameEvents.CLOSE_SETTINGS, () => {
      this.isInputLocked = false;
    });
  }

  public getMovementVector(playerX: number, playerY: number): { x: number; y: number } {
    if (this.isInputLocked) return { x: 0, y: 0 };

    let vx = 0;
    let vy = 0;

    // 1. Keyboard (WASD & Arrows)
    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;
    }

    // 2. Virtual Joystick (Mobile)
    if (this.virtualVector.x !== 0 || this.virtualVector.y !== 0) {
      vx = this.virtualVector.x;
      vy = this.virtualVector.y;
    }

    // 3. Pointer Destination (Click-to-Move on desktop/mobile)
    if (this.targetPointerPos && vx === 0 && vy === 0) {
      const dx = this.targetPointerPos.x - playerX;
      const dy = this.targetPointerPos.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 16) {
        vx = dx / dist;
        vy = dy / dist;
      } else {
        this.targetPointerPos = null;
      }
    }

    // Normalize diagonal velocity
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }

    return { x: vx, y: vy };
  }

  public setLock(locked: boolean): void {
    this.isInputLocked = locked;
  }
}
