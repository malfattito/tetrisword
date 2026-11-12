import type { Board } from './Board';
import type { Piece } from './Piece';
import type { RotationDirection, RotationState } from './types';

/** Strategy for rotating a piece on a board (with or without kicks). */
export interface RotationSystem {
  rotate(piece: Piece, direction: RotationDirection, board: Board): Piece | null;
}

type Kick = readonly [number, number];
type KickTable = Readonly<Record<string, readonly Kick[]>>;

// Official SRS tables, written with y pointing UP (as in the guideline). They are flipped on use.
const JLSTZ_KICKS: KickTable = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const I_KICKS: KickTable = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

const NO_KICKS: readonly Kick[] = [[0, 0]];

/** Super Rotation System with wall kicks. */
export class SrsRotationSystem implements RotationSystem {
  rotate(piece: Piece, direction: RotationDirection, board: Board): Piece | null {
    const rotated = piece.rotated(direction);
    for (const [dx, dyUp] of this.kicksFor(piece, rotated.rotation)) {
      const candidate = rotated.movedBy(dx, -dyUp);
      if (board.canPlace(candidate)) return candidate;
    }
    return null;
  }

  private kicksFor(piece: Piece, to: RotationState): readonly Kick[] {
    if (piece.type === 'O') return NO_KICKS;
    const table = piece.type === 'I' ? I_KICKS : JLSTZ_KICKS;
    return table[`${piece.rotation}>${to}`] ?? NO_KICKS;
  }
}
