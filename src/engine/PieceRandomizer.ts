import type { RandomSource } from './Random';
import { PIECE_TYPES, type PieceType } from './types';

/** Strategy that decides which tetromino comes next. */
export interface PieceRandomizer {
  next(): PieceType;
}

/** "7-bag": every run of 7 pieces contains each tetromino exactly once, shuffled. */
export class SevenBagRandomizer implements PieceRandomizer {
  private bag: PieceType[] = [];

  constructor(private readonly random: RandomSource) {}

  next(): PieceType {
    if (this.bag.length === 0) this.bag = this.shuffled([...PIECE_TYPES]);
    return this.bag.pop() as PieceType;
  }

  private shuffled<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(this.random.next() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}
