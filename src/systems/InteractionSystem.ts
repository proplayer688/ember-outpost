import { MascotKeeper } from '../entities/MascotKeeper';
import { BuildingNode } from '../entities/BuildingNode';
import { FriendNPC } from '../entities/FriendNPC';
import { HarvestSystem } from './HarvestSystem';
import { EventBus, GameEvents } from '../core/EventBus';

export class InteractionSystem {
  private mascot: MascotKeeper;
  private buildings: BuildingNode[];
  private friends: FriendNPC[];
  private harvestSystem: HarvestSystem;

  private activeBuilding: BuildingNode | null = null;
  private activeFriend: FriendNPC | null = null;

  constructor(
    mascot: MascotKeeper,
    buildings: BuildingNode[],
    friends: FriendNPC[],
    harvestSystem: HarvestSystem
  ) {
    this.mascot = mascot;
    this.buildings = buildings;
    this.friends = friends;
    this.harvestSystem = harvestSystem;

    EventBus.on(GameEvents.ACTION_BUTTON_PRESSED, () => {
      this.handleActionPress();
    });
  }

  public handleActionPress(): void {
    // 1. Priority 1: Harvest closest resource node if available
    const activeNode = this.harvestSystem.getActiveNode();
    if (activeNode && activeNode.isAvailable()) {
      activeNode.harvest();
      return;
    }

    // 2. Priority 2: Talk to closest Friend NPC
    if (this.activeFriend) {
      EventBus.emit(GameEvents.OPEN_FRIEND_MODAL, this.activeFriend.def);
      return;
    }

    // 3. Priority 3: Inspect closest Building
    if (this.activeBuilding) {
      EventBus.emit(GameEvents.OPEN_BUILDING_MODAL, this.activeBuilding.def);
      return;
    }
  }

  public update(): void {
    const feetPos = this.mascot.getFeetPosition();

    // 1. Update Harvest System first
    this.harvestSystem.update();
    const activeNode = this.harvestSystem.getActiveNode();

    // If standing right next to a resource node, suppress building/friend prompts
    if (activeNode) {
      if (this.activeFriend) {
        this.activeFriend.setProximity(false);
        this.activeFriend = null;
      }
      if (this.activeBuilding) {
        this.activeBuilding.setProximity(false);
        this.activeBuilding = null;
      }
      return;
    }

    // 2. Check Friend NPCs (radius 52px)
    let closestFriend: FriendNPC | null = null;
    let minFriendDist = 52;

    for (const friend of this.friends) {
      const pos = friend.getInteractionPosition();
      const dx = feetPos.x - pos.x;
      const dy = feetPos.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minFriendDist) {
        minFriendDist = dist;
        closestFriend = friend;
      }
    }

    if (closestFriend) {
      if (this.activeBuilding) {
        this.activeBuilding.setProximity(false);
        this.activeBuilding = null;
      }
      if (this.activeFriend !== closestFriend) {
        if (this.activeFriend) this.activeFriend.setProximity(false);
        closestFriend.setProximity(true);
        this.activeFriend = closestFriend;
      }
      return;
    } else if (this.activeFriend) {
      this.activeFriend.setProximity(false);
      this.activeFriend = null;
    }

    // 3. Check Buildings (radius 60px)
    let closestBuilding: BuildingNode | null = null;
    let minBuildingDist = 60;

    for (const building of this.buildings) {
      const bPos = building.getInteractionPosition();
      const dx = feetPos.x - bPos.x;
      const dy = feetPos.y - bPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minBuildingDist) {
        minBuildingDist = dist;
        closestBuilding = building;
      }
    }

    if (closestBuilding !== this.activeBuilding) {
      if (this.activeBuilding) {
        this.activeBuilding.setProximity(false);
      }
      if (closestBuilding) {
        closestBuilding.setProximity(true);
      }
      this.activeBuilding = closestBuilding;
    }
  }

  public getActiveBuilding(): BuildingNode | null {
    return this.activeBuilding;
  }

  public getActiveFriend(): FriendNPC | null {
    return this.activeFriend;
  }
}
