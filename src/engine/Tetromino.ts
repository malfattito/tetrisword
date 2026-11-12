import type { PieceType, Point } from './types';

export interface TetrominoShape {
  readonly type: PieceType;
  /** Side of the square bounding box the shape rotates in. */
  readonly boxSize: number;
  /** Block offsets in spawn orientation (y grows downwards). Order is stable so letters follow rotation. */
  readonly spawnBlocks: readonly Point[];
}

const shape = (type: PieceType, boxSize: number, blocks: [number, number][]): TetrominoShape => ({
  type,
  boxSize,
  spawnBlocks: blocks.map(([x, y]) => ({ x, y })),
});

/** SRS spawn orientations. */
export const TETROMINOES: Readonly<Record<PieceType, TetrominoShape>> = {
  I: shape('I', 4, [[0, 1], [1, 1], [2, 1], [3, 1]]),
  O: shape('O', 2, [[0, 0], [1, 0], [1, 1], [0, 1]]),
  T: shape('T', 3, [[0, 1], [1, 0], [1, 1], [2, 1]]),
  S: shape('S', 3, [[0, 1], [1, 1], [1, 0], [2, 0]]),
  Z: shape('Z', 3, [[0, 0], [1, 0], [1, 1], [2, 1]]),
  J: shape('J', 3, [[0, 0], [0, 1], [1, 1], [2, 1]]),
  L: shape('L', 3, [[0, 1], [1, 1], [2, 1], [2, 0]]),
};

/** Rotates an offset inside an n×n box. Clockwise: (x, y) → (n-1-y, x). */
export function rotateOffset(p: Point, boxSize: number, clockwise: boolean): Point {
  const n = boxSize - 1;
  return clockwise ? { x: n - p.y, y: p.x } : { x: p.y, y: n - p.x };
}
