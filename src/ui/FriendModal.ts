import Phaser from 'phaser';
import { FriendDefinition } from '../data/FriendsData';
import { EventBus, GameEvents } from '../core/EventBus';
import { Audio } from '../audio/AudioManager';
import { GameState } from '../core/GameState';

export class FriendModal extends Phaser.GameObjects.Container {
  private overlay: Phaser.GameObjects.Graphics;
  private panel: Phaser.GameObjects.Container;
  private currentDef: FriendDefinition | null = null;
  private dialogueIndex: number = 0;
  private dialogueText!: Phaser.GameObjects.Text;
  private rivalryText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(2100);
    this.setVisible(false);

    // 1. Semi-transparent backdrop
    this.overlay = scene.add.graphics();
    this.overlay.fillStyle(0x070A13, 0.7);
    this.overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);
    this.overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, scene.scale.width, scene.scale.height), Phaser.Geom.Rectangle.Contains);
    this.overlay.on('pointerdown', () => this.close());
    this.add(this.overlay);

    // 2. Center Panel Container
    this.panel = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.add(this.panel);

    EventBus.on(GameEvents.OPEN_FRIEND_MODAL, (def: FriendDefinition) => {
      this.open(def);
    });

    scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible) this.close();
    });

    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.overlay.clear();
      this.overlay.fillStyle(0x070A13, 0.7);
      this.overlay.fillRect(0, 0, gameSize.width, gameSize.height);
      this.panel.setPosition(gameSize.width / 2, gameSize.height / 2);
    });
  }

  public open(def: FriendDefinition): void {
    this.currentDef = def;
    this.dialogueIndex = 0;
    this.panel.removeAll(true);

    const pw = 440;
    const ph = 300;

    // Window Box
    const box = this.scene.add.graphics();
    box.fillStyle(0x0B0F19, 0.98);
    box.fillRect(-pw / 2, -ph / 2, pw, ph);
    box.lineStyle(2, def.accentColor, 1);
    box.strokeRect(-pw / 2, -ph / 2, pw, ph);

    // Inner subtle border
    box.lineStyle(1, 0x1E293B, 0.7);
    box.strokeRect(-pw / 2 + 4, -ph / 2 + 4, pw - 8, ph - 8);
    this.panel.add(box);

    // Friend Portrait / Avatar Box
    const avatarBg = this.scene.add.graphics();
    avatarBg.fillStyle(0x070A13, 1);
    avatarBg.fillRect(-pw / 2 + 20, -ph / 2 + 25, 48, 54);
    avatarBg.lineStyle(1, def.accentColor, 0.8);
    avatarBg.strokeRect(-pw / 2 + 20, -ph / 2 + 25, 48, 54);
    this.panel.add(avatarBg);

    const avatar = this.scene.add.sprite(-pw / 2 + 44, -ph / 2 + 52, `friend_${def.id}_0`);
    avatar.setScale(1.4);
    this.panel.add(avatar);

    // Name & Title
    const name = this.scene.add.text(-pw / 2 + 80, -ph / 2 + 25, def.name.toUpperCase(), {
      fontSize: '15px',
      color: '#F8FAFC',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.panel.add(name);

    const title = this.scene.add.text(-pw / 2 + 80, -ph / 2 + 43, `${def.title} · ${def.role}`, {
      fontSize: '9px',
      color: '#38BDF8',
      fontFamily: 'monospace'
    });
    this.panel.add(title);

    // Close Button [X]
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

    // Divider
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0x1E293B, 1);
    div.lineBetween(-pw / 2 + 15, -ph / 2 + 85, pw / 2 - 15, -ph / 2 + 85);
    this.panel.add(div);

    // Bio
    const bio = this.scene.add.text(-pw / 2 + 20, -ph / 2 + 96, def.bio, {
      fontSize: '9px',
      color: '#94A3B8',
      fontFamily: 'monospace',
      wordWrap: { width: pw - 40 }
    });
    this.panel.add(bio);

    // Speech Bubble Container
    const speechBg = this.scene.add.graphics();
    speechBg.fillStyle(0x070A13, 0.9);
    speechBg.fillRoundedRect(-pw / 2 + 18, -ph / 2 + 140, pw - 36, 60, 4);
    speechBg.lineStyle(1, 0x334155, 0.8);
    speechBg.strokeRoundedRect(-pw / 2 + 18, -ph / 2 + 140, pw - 36, 60, 4);
    this.panel.add(speechBg);

    this.dialogueText = this.scene.add.text(-pw / 2 + 28, -ph / 2 + 148, def.dialogue[0], {
      fontSize: '9px',
      color: '#FEF08A',
      fontFamily: 'monospace',
      wordWrap: { width: pw - 56 }
    });
    this.panel.add(this.dialogueText);

    // Rivalry Dossier Bar
    const rivalry = GameState.rivalries[def.id] || { wins: 0, losses: 0, bestScore: def.rivalScore };
    this.rivalryText = this.scene.add.text(-pw / 2 + 20, -ph / 2 + 210,
      `RIVAL TARGET: ${def.rivalScore} PTS  |  RECORD: ${rivalry.wins} WINS - ${rivalry.losses} LOSSES`, {
      fontSize: '8px',
      color: '#06B6D4',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    });
    this.panel.add(this.rivalryText);

    // Action Buttons Row: [ NEXT CHAT ] & [ CHALLENGE ]
    // Button 1: Next Chat
    const chatBtn = this.scene.add.container(-pw / 4 - 5, ph / 2 - 32);
    const chatBg = this.scene.add.graphics();
    chatBg.fillStyle(0x0F172A, 1);
    chatBg.fillRoundedRect(-85, -14, 170, 28, 3);
    chatBg.lineStyle(1, 0x334155, 1);
    chatBg.strokeRoundedRect(-85, -14, 170, 28, 3);
    chatBtn.add(chatBg);

    const chatTxt = this.scene.add.text(0, 0, '[ NEXT DIALOGUE ]', {
      fontSize: '9px',
      color: '#94A3B8',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    chatBtn.add(chatTxt);

    chatBg.setInteractive(new Phaser.Geom.Rectangle(-85, -14, 170, 28), Phaser.Geom.Rectangle.Contains);
    chatBg.on('pointerover', () => {
      chatBg.lineStyle(1, 0xF8FAFC, 1);
      chatTxt.setColor('#FFFFFF');
    });
    chatBg.on('pointerout', () => {
      chatBg.lineStyle(1, 0x334155, 1);
      chatTxt.setColor('#94A3B8');
    });
    chatBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.cycleDialogue();
    });
    this.panel.add(chatBtn);

    // Button 2: Challenge To Forge Sync
    const challBtn = this.scene.add.container(pw / 4 + 5, ph / 2 - 32);
    const challBg = this.scene.add.graphics();
    challBg.fillStyle(0x0F172A, 1);
    challBg.fillRoundedRect(-95, -14, 190, 28, 3);
    challBg.lineStyle(1, 0xF59E0B, 1);
    challBg.strokeRoundedRect(-95, -14, 190, 28, 3);
    challBtn.add(challBg);

    const challTxt = this.scene.add.text(0, 0, '[ CHALLENGE RIVAL (1🎫) ]', {
      fontSize: '9px',
      color: '#FEF08A',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0.5);
    challBtn.add(challTxt);

    challBg.setInteractive(new Phaser.Geom.Rectangle(-95, -14, 190, 28), Phaser.Geom.Rectangle.Contains);
    challBg.on('pointerover', () => {
      challBg.lineStyle(1, 0xFEF08A, 1);
      challTxt.setColor('#FFFFFF');
    });
    challBg.on('pointerout', () => {
      challBg.lineStyle(1, 0xF59E0B, 1);
      challTxt.setColor('#FEF08A');
    });
    challBg.on('pointerdown', () => {
      Audio.playUIClick();
      this.close();
      EventBus.emit(GameEvents.OPEN_CHALLENGE_MODAL, def);
    });
    this.panel.add(challBtn);

    this.setVisible(true);
    Audio.playInteractChime();

    this.panel.setScale(0.9);
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  private cycleDialogue(): void {
    if (!this.currentDef) return;
    this.dialogueIndex = (this.dialogueIndex + 1) % this.currentDef.dialogue.length;
    this.dialogueText.setText(this.currentDef.dialogue[this.dialogueIndex]);
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
        EventBus.emit(GameEvents.CLOSE_FRIEND_MODAL);
      }
    });
  }
}
