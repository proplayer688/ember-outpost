/**
 * 2:1 Isometric Coordinate Utility
 * Step 2 pixels horizontally for every 1 pixel vertically.
 * Tile width: 32px, Tile height: 16px.
 */
export class IsoMath {
  static readonly TILE_WIDTH = 32;
  static readonly TILE_HEIGHT = 16;

  /**
   * Convert Cartesian grid coordinates (x, y) to Screen coordinates (screenX, screenY).
   */
  static gridToScreen(gridX: number, gridY: number): { screenX: number; screenY: number } {
    return {
      screenX: Math.round((gridX - gridY) * (this.TILE_WIDTH / 2)),
      screenY: Math.round((gridX + gridY) * (this.TILE_HEIGHT / 2))
    };
  }

  /**
   * Convert Screen coordinates to nearest Cartesian grid coordinates.
   */
  static screenToGrid(screenX: number, screenY: number): { gridX: number; gridY: number } {
    const halfW = this.TILE_WIDTH / 2;
    const halfH = this.TILE_HEIGHT / 2;
    return {
      gridX: Math.round((screenX / halfW + screenY / halfH) / 2),
      gridY: Math.round((screenY / halfH - screenX / halfW) / 2)
    };
  }

  /**
   * Calculate 2.5D depth sort value based on screen Y and height offset.
   */
  static getDepth(screenY: number, zOffset: number = 0): number {
    return Math.floor(screenY + zOffset * 8);
  }
}
