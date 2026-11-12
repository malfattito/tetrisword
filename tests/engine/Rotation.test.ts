import { describe, expect, it } from 'vitest';
import { Board } from '../../src/engine/Board';
import { Piece } from '../../src/engine/Piece';
import { SrsRotationSystem } from '../../src/engine/RotationSystem';
import { SevenBagRandomizer } from '../../src/engine/PieceRandomizer';
import { SeededRandom } from '../../src/engine/Random';
import { tile } from './helpers';

const tiles = () => ['A', 'B', 'C', 'D'].map(tile);

describe('SRS rotation', () => {
  it('rotates letters together with the blocks', () => {
    const piece = Piece.create('I', tiles(), { x: 3, y: 5 });
    const rotated = piece.rotated(1);
    const column = rotated.cells().map((c) => c.point.x);
    expect(new Set(column).size).toBe(1);
    expect(rotated.cells().map((c) => c.tile.letter)).toEqual(['A', 'B', 'C', 'D']);
    expect(rotated.cells()[0].point.y).toBeLessThan(rotated.cells()[3].point.y);
  });

  it('kicks off the left wall', () => {
    const board = new Board();
    const vertical = Piece.create('T', tiles(), { x: 0, y: 5 }).rotated(1).movedBy(-1, 0); // state R hugging left wall
    expect(board.canPlace(vertical)).toBe(true);
    const result = new SrsRotationSystem().rotate(vertical, 1, board);
    expect(result).not.toBeNull();
    expect(result!.cells().every((c) => c.point.x >= 0)).toBe(true);
  });

  it('four clockwise rotations return to spawn', () => {
    const piece = Piece.create('L', tiles(), { x: 3, y: 3 });
    const back = piece.rotated(1).rotated(1).rotated(1).rotated(1);
    expect(back.cells()).toEqual(piece.cells());
  });
});

describe('SevenBagRandomizer', () => {
  it('deals each tetromino once per bag', () => {
    const bag = new SevenBagRandomizer(new SeededRandom(42));
    const first = Array.from({ length: 7 }, () => bag.next()).sort();
    expect(first).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
  });
});
