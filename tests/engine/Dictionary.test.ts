import { describe, expect, it } from 'vitest';
import { SortedWordList } from '../../src/engine/Dictionary';

describe('SortedWordList', () => {
  const dict = SortedWordList.fromWords(['casa', 'casas', 'gato', 'que', 'sol']);

  it('finds exact words', () => {
    expect(dict.has('casa')).toBe(true);
    expect(dict.has('casas')).toBe(true);
    expect(dict.has('cas')).toBe(false);
    expect(dict.has('zzz')).toBe(false);
  });

  it('answers prefix queries', () => {
    expect(dict.hasPrefix('ca')).toBe(true);
    expect(dict.hasPrefix('gat')).toBe(true);
    expect(dict.hasPrefix('x')).toBe(false);
  });

  it('reports its size', () => expect(dict.size).toBe(5));
});
