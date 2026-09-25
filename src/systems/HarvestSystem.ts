import { MascotKeeper } from '../entities/MascotKeeper';
import { ResourceNode } from '../entities/ResourceNode';
import { EventBus, GameEvents } from '../core/EventBus';

export class HarvestSystem {
  private mascot: MascotKeeper;
  private nodes: ResourceNode[];
  private currentActiveNode: ResourceNode | null = null;
  private readonly harvestRadius: number = 50;

  constructor(mascot: MascotKeeper, nodes: ResourceNode[]) {
    this.mascot = mascot;
    this.nodes = nodes;

    EventBus.on(GameEvents.HARVEST_ATTEMPTED, () => {
      this.tryHarvestCurrent();
    });
  }

  public update(): void {
    const feetPos = this.mascot.getFeetPosition();
    let closestNode: ResourceNode | null = null;
    let minDistance = this.harvestRadius;

    for (const node of this.nodes) {
      if (!node.isAvailable()) continue;
      const pos = node.getInteractionPosition();
      const dx = feetPos.x - pos.x;
      const dy = feetPos.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        minDistance = dist;
        closestNode = node;
      }
    }

    if (closestNode !== this.currentActiveNode) {
      if (this.currentActiveNode) {
        this.currentActiveNode.setProximity(false);
      }
      if (closestNode) {
        closestNode.setProximity(true);
      }
      this.currentActiveNode = closestNode;
    }
  }

  public tryHarvestCurrent(): boolean {
    if (this.currentActiveNode && this.currentActiveNode.isAvailable()) {
      return this.currentActiveNode.harvest();
    }
    return false;
  }

  public getActiveNode(): ResourceNode | null {
    return this.currentActiveNode;
  }
}
