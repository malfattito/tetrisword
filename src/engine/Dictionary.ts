/** Word lookup abstraction. Words are lowercase, accent-free ASCII. */
export interface Dictionary {
  readonly size: number;
  has(word: string): boolean;
  hasPrefix(prefix: string): boolean;
}

/**
 * Memory-friendly dictionary for ~1M words: keeps the sorted newline-separated text as a
 * single string plus an offsets index, and answers queries with binary search.
 * Uses ~1/6 of the memory of a Set<string> on mobile browsers.
 */
export class SortedWordList implements Dictionary {
  private constructor(
    private readonly text: string,
    private readonly starts: Uint32Array,
  ) {}

  /** `text` must be sorted (byte order) and newline-separated. */
  static fromText(text: string): SortedWordList {
    const body = text.endsWith('\n') ? text : `${text}\n`;
    let count = 0;
    for (let i = 0; i < body.length; i++) if (body.charCodeAt(i) === 10) count++;
    const starts = new Uint32Array(count + 1);
    let w = 1;
    for (let i = 0; i < body.length; i++) if (body.charCodeAt(i) === 10) starts[w++] = i + 1;
    return new SortedWordList(body, starts);
  }

  static fromWords(words: Iterable<string>): SortedWordList {
    return SortedWordList.fromText([...words].sort().join('\n'));
  }

  get size(): number {
    return this.starts.length - 1;
  }

  has(word: string): boolean {
    const i = this.lowerBound(word);
    return i < this.size && this.wordAt(i) === word;
  }

  hasPrefix(prefix: string): boolean {
    const i = this.lowerBound(prefix);
    return i < this.size && this.wordAt(i).startsWith(prefix);
  }

  private wordAt(i: number): string {
    return this.text.slice(this.starts[i], this.starts[i + 1] - 1);
  }

  private lowerBound(target: string): number {
    let lo = 0;
    let hi = this.size;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.wordAt(mid) < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
}
