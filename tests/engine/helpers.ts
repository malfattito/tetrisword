import { Board } from '../../src/engine/Board';
import type { Tile } from '../../src/engine/types';

let id = 0;
export const tile = (letter: string): Tile => ({ id: ++id, letter, pieceType: 'T' });

/** Builds a board from ASCII rows (bottom-aligned). '.' = empty; '#' = Q→"QU" tile. */
export function boardFrom(rows: string[], width = 10, height = 20): Board {
  const board = new Board(width, height);
  const offset = height - rows.length;
  rows.forEach((row, r) => [...row].forEach((ch, x) => {
    if (ch !== '.') board.setTile({ x, y: offset + r }, tile(ch === '#' ? 'QU' : ch));
  }));
  return board;
}
