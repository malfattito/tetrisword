import type { WordMatch } from './WordFinder';

export interface ScoringStrategy {
  scoreWord(match: WordMatch, chain: number, level: number): number;
  scoreLines(count: number, chain: number, level: number): number;
  scoreHardDrop(cells: number): number;
}

/** Letter values inspired by Portuguese Scrabble tile values. */
export const PT_BR_LETTER_POINTS: Readonly<Record<string, number>> = {
  A: 1, E: 1, I: 1, O: 1, U: 1, S: 1, M: 1, R: 1, T: 1,
  D: 2, L: 2, C: 2, P: 2,
  N: 3, B: 3,
  F: 4, G: 4, H: 4, V: 4,
  J: 5, QU: 6, X: 8, Z: 8,
};

const LINE_POINTS = [0, 100, 300, 500, 800];

/**
 * word = (sum of letter values) × (letters − 2) × chain × level
 * Longer words grow fast; cascades multiply everything.
 */
export class LetterValueScoring implements ScoringStrategy {
  constructor(private readonly letterPoints: Readonly<Record<string, number>> = PT_BR_LETTER_POINTS) {}

  scoreWord(match: WordMatch, chain: number, level: number): number {
    const letters = match.tiles.reduce((sum, t) => sum + (this.letterPoints[t.letter] ?? 1), 0);
    return letters * Math.max(1, match.word.length - 2) * chain * level * 10;
  }

  scoreLines(count: number, chain: number, level: number): number {
    return (LINE_POINTS[Math.min(count, 4)] ?? 0) * chain * level;
  }

  scoreHardDrop(cells: number): number {
    return cells * 2;
  }
}
