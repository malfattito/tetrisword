import type { Piece } from './Piece';
import type { PlacedTile, Point, Tile } from './types';

/** Read-only view of the board, used by finders and renderers (Interface Segregation). */
export interface BoardView {
  readonly width: number;
  readonly height: number;
  tileAt(x: number, y: number): Tile | null;
}

/** Stores locked tiles. Knows nothing about words, scoring or timing. */
export class Board implements BoardView {
  private grid: (Tile | null)[][];

  constructor(readonly width = 10, readonly height = 20) {
    this.grid = Board.emptyGrid(width, height);
  }

  private static emptyGrid(width: number, height: number): (Tile | null)[][] {
    return Array.from({ length: height }, () => Array<Tile | null>(width).fill(null));
  }

  reset(): void {
    this.grid = Board.emptyGrid(this.width, this.height);
  }

  tileAt(x: number, y: number): Tile | null {
    return this.grid[y]?.[x] ?? null;
  }

  setTile(p: Point, tile: Tile | null): void {
    if (!this.isInside(p)) throw new Error(`Point out of board: ${p.x},${p.y}`);
    this.grid[p.y][p.x] = tile;
  }

  isInside(p: Point): boolean {
    return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height;
  }

  /** Cells above the visible area (y < 0) are allowed while falling. */
  canPlace(piece: Piece): boolean {
    return piece.cells().every(({ point: { x, y } }) =>
      x >= 0 && x < this.width && y < this.height && (y < 0 || this.grid[y][x] === null));
  }

  /** Locks the piece. Returns false when any block is above the visible area (top out). */
  lock(piece: Piece): boolean {
    let fits = true;
    for (const { point, tile } of piece.cells()) {
      if (point.y < 0) fits = false;
      else this.grid[point.y][point.x] = tile;
    }
    return fits;
  }

  removeCells(points: Iterable<Point>): void {
    for (const p of points) if (this.isInside(p)) this.grid[p.y][p.x] = null;
  }

  fullRows(): number[] {
    const rows: number[] = [];
    this.grid.forEach((row, y) => { if (row.every((t) => t !== null)) rows.push(y); });
    return rows;
  }

  /** Per-column gravity: every tile falls until it rests on another tile or the floor. */
  applyGravity(): boolean {
    let moved = false;
    for (let x = 0; x < this.width; x++) {
      let writeY = this.height - 1;
      for (let y = this.height - 1; y >= 0; y--) {
        const tile = this.grid[y][x];
        if (!tile) continue;
        if (writeY !== y) {
          this.grid[writeY][x] = tile;
          this.grid[y][x] = null;
          moved = true;
        }
        writeY--;
      }
    }
    return moved;
  }

  tiles(): PlacedTile[] {
    const out: PlacedTile[] = [];
    this.grid.forEach((row, y) => row.forEach((tile, x) => { if (tile) out.push({ point: { x, y }, tile }); }));
    return out;
  }
}
