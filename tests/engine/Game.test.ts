import { describe, expect, it } from 'vitest';
import { Board } from '../../src/engine/Board';
import { SortedWordList } from '../../src/engine/Dictionary';
import { EventBus } from '../../src/engine/EventBus';
import { Game, GameCommand, type GameEvents } from '../../src/engine/Game';
import type { LetterSource } from '../../src/engine/LetterSource';
import type { PieceRandomizer } from '../../src/engine/PieceRandomizer';
import { SrsRotationSystem } from '../../src/engine/RotationSystem';
import { LetterValueScoring } from '../../src/engine/ScoringStrategy';
import { LongestWordFinder } from '../../src/engine/WordFinder';

class FixedLetters implements LetterSource {
  constructor(private readonly sequence: string[][]) {}
  private i = 0;
  nextLetters(): string[] { return this.sequence[this.i++ % this.sequence.length]; }
}
const onlyI: PieceRandomizer = { next: () => 'I' };

function makeGame(letters: string[][]) {
  const events = new EventBus<GameEvents>();
  const board = new Board();
  const game = new Game({
    board, events,
    randomizer: onlyI,
    letters: new FixedLetters(letters),
    rotation: new SrsRotationSystem(),
    wordFinder: new LongestWordFinder(SortedWordList.fromWords(['casa']), 3),
    scoring: new LetterValueScoring(),
  });
  return { game, events, board };
}

describe('Game', () => {
  it('clears a word formed by a hard-dropped piece and scores it', () => {
    const { game, events, board } = makeGame([['C', 'A', 'S', 'A'], ['X', 'X', 'X', 'X']]);
    const found: string[] = [];
    events.on('wordsFound', (e) => e.words.forEach((w) => found.push(w.match.word)));
    game.start();
    game.execute(GameCommand.HardDrop);
    expect(found).toEqual(['casa']);
    expect(game.phase).toBe('clearing');
    game.update(1000);
    expect(board.tiles()).toHaveLength(0);
    expect(game.score).toBeGreaterThan(0);
    expect(game.phase).toBe('falling');
  });

  it('ends the game when pieces stack above the top', () => {
    const { game, events } = makeGame([['X', 'X', 'X', 'X']]);
    let over = false;
    events.on('gameOver', () => { over = true; });
    game.start();
    for (let i = 0; i < 30 && !over; i++) game.execute(GameCommand.HardDrop);
    expect(over).toBe(true);
    expect(game.phase).toBe('over');
  });
});
