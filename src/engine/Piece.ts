import { TETROMINOES, rotateOffset } from './Tetromino';
import type { PieceType, PlacedTile, Point, RotationDirection, RotationState, Tile } from './types';

interface PieceBlock {
  readonly offset: Point;
  readonly tile: Tile;
}

/** Immutable falling piece. Every transformation returns a new instance. */
export class Piece {
  private constructor(
    readonly type: PieceType,
    private readonly blocks: readonly PieceBlock[],
    readonly position: Point,
    readonly rotation: RotationState,
  ) {}

  static create(type: PieceType, tiles: readonly Tile[], position: Point): Piece {
    const shape = TETROMINOES[type];
    if (tiles.length !== shape.spawnBlocks.length) {
      throw new Error(`Piece ${type} needs ${shape.spawnBlocks.length} tiles, got ${tiles.length}`);
    }
    const blocks = shape.spawnBlocks.map((offset, i) => ({ offset, tile: tiles[i] }));
    return new Piece(type, blocks, position, 0);
  }

  get boxSize(): number {
    return TETROMINOES[this.type].boxSize;
  }

  /** Absolute board cells occupied by this piece. */
  cells(): PlacedTile[] {
    return this.blocks.map(({ offset, tile }) => ({
      point: { x: this.position.x + offset.x, y: this.position.y + offset.y },
      tile,
    }));
  }

  /** Cells relative to the piece box — used for previews. */
  localCells(): PlacedTile[] {
    return this.blocks.map(({ offset, tile }) => ({ point: offset, tile }));
  }

  movedBy(dx: number, dy: number): Piece {
    return new Piece(this.type, this.blocks, { x: this.position.x + dx, y: this.position.y + dy }, this.rotation);
  }

  movedTo(position: Point): Piece {
    return new Piece(this.type, this.blocks, position, this.rotation);
  }

  /** Pure rotation inside the bounding box, without wall kicks. */
  rotated(direction: RotationDirection): Piece {
    const clockwise = direction === 1;
    const blocks = this.blocks.map((b) => ({ offset: rotateOffset(b.offset, this.boxSize, clockwise), tile: b.tile }));
    const rotation = (((this.rotation + direction) % 4) + 4) % 4 as RotationState;
    return new Piece(this.type, blocks, this.position, rotation);
  }
}
