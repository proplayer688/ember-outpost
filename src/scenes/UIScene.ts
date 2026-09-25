import Phaser from 'phaser';
import { HUDController } from '../ui/HUDController';
import { BuildingModal } from '../ui/BuildingModal';
import { FriendModal } from '../ui/FriendModal';
import { ChallengeModal } from '../ui/ChallengeModal';
import { SettingsModal } from '../ui/SettingsModal';
import { TitleScreen } from '../ui/TitleScreen';
import { VirtualJoystick } from '../input/VirtualJoystick';

export class UIScene extends Phaser.Scene {
  public hud!: HUDController;
  public buildingModal!: BuildingModal;
  public friendModal!: FriendModal;
  public challengeModal!: ChallengeModal;
  public settingsModal!: SettingsModal;
  public titleScreen!: TitleScreen;
  public joystick!: VirtualJoystick;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // 1. In-Game Top HUD (Coins, Diamonds, Simulated RF, Resources, Tickets, Profile, Settings)
    this.hud = new HUDController(this);

    // 2. Interactive Building Modal Dialog
    this.buildingModal = new BuildingModal(this);

    // 3. Friend Dialogue & Dossier Modal
    this.friendModal = new FriendModal(this);

    // 4. Rhythm Challenge Modal (The Forge Sync)
    this.challengeModal = new ChallengeModal(this);

    // 5. System Settings Modal
    this.settingsModal = new SettingsModal(this);

    // 6. Mobile Touch Joystick & Action Button (visible on mobile / touch interactions)
    this.joystick = new VirtualJoystick(this);

    // 7. Title Screen & Welcome Onboarding Overlay
    this.titleScreen = new TitleScreen(this);

    // 8. Onboarding Hint Toast (fades after 7 seconds)
    const hint = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40,
      'WASD / ARROWS TO WALK  ·  PRESS [E] TO HARVEST / CHAT / INSPECT',
      {
        fontSize: '9px',
        color: '#FEF08A',
        fontStyle: 'bold',
        fontFamily: 'monospace',
        backgroundColor: '#070A13CC',
        padding: { x: 12, y: 6 }
      }
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(400);

    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 6000,
      duration: 1000,
      ease: 'Sine.easeOut',
      onComplete: () => hint.destroy()
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      if (hint.active) {
        hint.setPosition(gameSize.width / 2, gameSize.height - 40);
      }
    });
  }
}
