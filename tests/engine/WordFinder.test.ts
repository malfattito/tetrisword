import { describe, expect, it } from 'vitest';
import { SortedWordList } from '../../src/engine/Dictionary';
import { LongestWordFinder } from '../../src/engine/WordFinder';
import { boardFrom } from './helpers';

const dict = SortedWordList.fromWords(['casa', 'casas', 'asa', 'sol', 'que', 'mar', 'amor', 'roma']);
const finder = new LongestWordFinder(dict, 3);
const words = (rows: string[]) => finder.find(boardFrom(rows)).map((m) => `${m.word}:${m.direction[0]}`).sort();

describe('LongestWordFinder', () => {
  it('finds a horizontal word', () => {
    expect(words(['..SOL.....'])).toEqual(['sol:h']);
  });

  it('prefers the longest word (CASAS over CASA / ASA)', () => {
    expect(words(['CASAS.....'])).toEqual(['casas:h']);
  });

  it('reads only left→right, never reversed', () => {
    expect(words(['LOS.......'])).toEqual([]);
  });

  it('does not join words across gaps', () => {
    expect(words(['SO.L......'])).toEqual([]);
  });

  it('finds vertical words top→bottom', () => {
    expect(words(['M.........', 'A.........', 'R.........'])).toEqual(['mar:v']);
  });

  it('finds crossing horizontal and vertical words sharing a cell', () => {
    expect(words(['M.........', 'AMOR......', 'R.........'])).toEqual(['amor:h', 'mar:v']);
  });

  it('treats the QU tile as two letters', () => {
    expect(words(['#E........'])).toEqual(['que:h']);
  });

  it('keeps non-overlapping words in the same line', () => {
    expect(words(['SOL.MAR...'])).toEqual(['mar:h', 'sol:h']);
  });
});
