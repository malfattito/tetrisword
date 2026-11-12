import { describe, expect, it } from 'vitest';
import { boardFrom } from './helpers';

describe('Board', () => {
  it('applies per-column gravity after removing cells', () => {
    const board = boardFrom(['A.........', 'B.........', 'C.........']);
    board.removeCells([{ x: 0, y: 18 }]);
    expect(board.applyGravity()).toBe(true);
    expect(board.tileAt(0, 19)?.letter).toBe('C');
    expect(board.tileAt(0, 18)?.letter).toBe('A');
    expect(board.tileAt(0, 17)).toBeNull();
  });

  it('detects full rows', () => {
    const board = boardFrom(['ABCDEFGHIJ', 'A.........']);
    expect(board.fullRows()).toEqual([18]);
  });
});
