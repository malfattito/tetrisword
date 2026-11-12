import type { RandomSource } from './Random';

/** Strategy that supplies letters for a new piece. */
export interface LetterSource {
  nextLetters(count: number): string[];
}

/**
 * Draw weights based on Portuguese letter frequency (Wikipedia, "Frequência de letras").
 * K/W/Y are left out (rare in the dictionary); Q always comes as "QU"; H is lowered because
 * it mostly appears in digraphs (CH/LH/NH).
 */
export const PT_BR_LETTER_WEIGHTS: Readonly<Record<string, number>> = {
  A: 14.6, E: 12.6, O: 10.7, S: 7.8, R: 6.5, I: 6.2, N: 5.0, D: 5.0, M: 4.7, U: 4.6,
  T: 4.3, C: 3.9, L: 2.8, P: 2.5, V: 1.7, G: 1.3, H: 0.8, QU: 1.0, B: 1.0, F: 1.0,
  Z: 0.5, J: 0.4, X: 0.3,
};

export const VOWELS: ReadonlySet<string> = new Set(['A', 'E', 'I', 'O', 'U']);

export interface VowelRules {
  readonly min: number;
  readonly max: number;
}

/** Weighted letter draw that keeps the vowel count of each piece inside [min, max]. */
export class WeightedLetterSource implements LetterSource {
  private readonly letters: string[];
  private readonly cumulative: number[];
  private readonly total: number;

  constructor(
    private readonly random: RandomSource,
    weights: Readonly<Record<string, number>> = PT_BR_LETTER_WEIGHTS,
    private readonly vowelRules: VowelRules = { min: 1, max: 3 },
  ) {
    this.letters = Object.keys(weights);
    let sum = 0;
    this.cumulative = this.letters.map((l) => (sum += weights[l]));
    this.total = sum;
  }

  nextLetters(count: number): string[] {
    const maxAttempts = 50;
    let letters = this.draw(count);
    for (let i = 0; i < maxAttempts && !this.satisfiesVowelRules(letters); i++) letters = this.draw(count);
    return letters;
  }

  private satisfiesVowelRules(letters: string[]): boolean {
    const vowels = letters.filter((l) => VOWELS.has(l)).length;
    return vowels >= this.vowelRules.min && vowels <= this.vowelRules.max;
  }

  private draw(count: number): string[] {
    return Array.from({ length: count }, () => this.drawOne());
  }

  private drawOne(): string {
    const r = this.random.next() * this.total;
    const index = this.cumulative.findIndex((c) => r < c);
    return this.letters[index === -1 ? this.letters.length - 1 : index];
  }
}
