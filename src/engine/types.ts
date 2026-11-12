export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/** Rotation state following SRS naming: 0 = spawn, 1 = R, 2 = 180, 3 = L. */
export type RotationState = 0 | 1 | 2 | 3;

export type RotationDirection = 1 | -1; // 1 = clockwise, -1 = counter-clockwise

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A single lettered block. `letter` may be a digraph such as "QU". */
export interface Tile {
  readonly id: number;
  readonly letter: string;
  readonly pieceType: PieceType;
}

export interface PlacedTile {
  readonly point: Point;
  readonly tile: Tile;
}

export const pointKey = (p: Point): string => `${p.x},${p.y}`;
