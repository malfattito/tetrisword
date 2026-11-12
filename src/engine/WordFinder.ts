import type { BoardView } from './Board';
import type { Dictionary } from './Dictionary';
import type { Point, Tile } from './types';

export type WordDirection = 'horizontal' | 'vertical';

export interface WordMatch {
  readonly word: string;
  readonly direction: WordDirection;
  readonly cells: readonly Point[];
  readonly tiles: readonly Tile[];
}

/** Strategy that finds the words currently present on a board. */
export interface WordFinder {
  find(board: BoardView): WordMatch[];
}

interface LineCell {
  readonly point: Point;
  readonly tile: Tile | null;
}

/**
 * Scans rows (left→right) and columns (top→bottom). Inside each line, longer words win and
 * matches in the same line never overlap. Horizontal and vertical matches may cross.
 */
export class LongestWordFinder implements WordFinder {
  constructor(
    private readonly dictionary: Dictionary,
    private readonly minLength = 3,
  ) {}

  find(board: BoardView): WordMatch[] {
    const matches: WordMatch[] = [];
    for (let y = 0; y < board.height; y++) {
      const line = Array.from({ length: board.width }, (_, x) => ({ point: { x, y }, tile: board.tileAt(x, y) }));
      matches.push(...this.scanLine(line, 'horizontal'));
    }
    for (let x = 0; x < board.width; x++) {
      const line = Array.from({ length: board.height }, (_, y) => ({ point: { x, y }, tile: board.tileAt(x, y) }));
      matches.push(...this.scanLine(line, 'vertical'));
    }
    return matches;
  }

  private scanLine(line: LineCell[], direction: WordDirection): WordMatch[] {
    const candidates: WordMatch[] = [];
    for (const segment of this.segments(line)) {
      for (let start = 0; start < segment.length; start++) {
        const best = this.longestFrom(segment, start, direction);
        if (best) candidates.push(best);
      }
    }
    return this.selectNonOverlapping(candidates);
  }

  /** Splits a line into runs of contiguous tiles. */
  private segments(line: LineCell[]): { point: Point; tile: Tile }[][] {
    const runs: { point: Point; tile: Tile }[][] = [];
    let current: { point: Point; tile: Tile }[] = [];
    for (const cell of line) {
      if (cell.tile) current.push({ point: cell.point, tile: cell.tile });
      else if (current.length) { runs.push(current); current = []; }
    }
    if (current.length) runs.push(current);
    return runs;
  }

  private longestFrom(segment: { point: Point; tile: Tile }[], start: number, direction: WordDirection): WordMatch | null {
    let text = '';
    let bestEnd = -1;
    let bestText = '';
    for (let end = start; end < segment.length; end++) {
      text += segment[end].tile.letter.toLowerCase();
      if (!this.dictionary.hasPrefix(text)) break;
      if (text.length >= this.minLength && this.dictionary.has(text)) { bestEnd = end; bestText = text; }
    }
    if (bestEnd < 0) return null;
    const used = segment.slice(start, bestEnd + 1);
    return { word: bestText, direction, cells: used.map((c) => c.point), tiles: used.map((c) => c.tile) };
  }

  private selectNonOverlapping(candidates: WordMatch[]): WordMatch[] {
    const sorted = [...candidates].sort((a, b) => b.word.length - a.word.length);
    const taken = new Set<string>();
    const selected: WordMatch[] = [];
    for (const match of sorted) {
      const keys = match.cells.map((p) => `${p.x},${p.y}`);
      if (keys.some((k) => taken.has(k))) continue;
      keys.forEach((k) => taken.add(k));
      selected.push(match);
    }
    return selected;
  }
}
