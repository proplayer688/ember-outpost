import Phaser from 'phaser';

/**
 * Global typed event bus for decoupling gameplay systems from rendering and UI.
 */
class EventBusDispatcher extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }
}

export const EventBus = new EventBusDispatcher();

export const GameEvents = {
  // Movement & Input
  PLAYER_MOVED: 'player_moved',
  INTERACTION_TRIGGERED: 'interaction_triggered',
  INTERACTION_EXITED: 'interaction_exited',
  ACTION_BUTTON_PRESSED: 'action_button_pressed',
  
  // Building UI
  OPEN_BUILDING_MODAL: 'open_building_modal',
  CLOSE_BUILDING_MODAL: 'close_building_modal',

  // Friend Dialog & Dossier
  OPEN_FRIEND_MODAL: 'open_friend_modal',
  CLOSE_FRIEND_MODAL: 'close_friend_modal',

  // Minigame Challenge
  OPEN_CHALLENGE_MODAL: 'open_challenge_modal',
  CLOSE_CHALLENGE_MODAL: 'close_challenge_modal',
  
  // Harvesting & Resources
  HARVEST_ATTEMPTED: 'harvest_attempted',
  RESOURCE_HARVESTED: 'resource_harvested',
  SHOW_FLOATING_TEXT: 'show_floating_text',

  // Outpost Level & Settings
  OUTPOST_UPGRADED: 'outpost_upgraded',
  OPEN_SETTINGS: 'open_settings',
  CLOSE_SETTINGS: 'close_settings',
  STATE_UPDATED: 'state_updated',
  
  // Audio & VFX
  PLAY_SFX: 'play_sfx',
  EMIT_VFX: 'emit_vfx'
} as const;
