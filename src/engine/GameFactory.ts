import { Board } from './Board';
import type { Dictionary } from './Dictionary';
import { EventBus } from './EventBus';
import { Game, type GameConfig, type GameEvents } from './Game';
import { WeightedLetterSource } from './LetterSource';
import { SeededRandom } from './Random';
import { SevenBagRandomizer } from './PieceRandomizer';
import { SrsRotationSystem } from './RotationSystem';
import { LetterValueScoring } from './ScoringStrategy';
import { LongestWordFinder } from './WordFinder';

export interface GameSetup {
  readonly dictionary: Dictionary;
  readonly seed?: number;
  readonly minWordLength?: number;
  readonly config?: Partial<GameConfig>;
}

/** Factory with the default wiring. Swap any strategy here without touching Game (Open/Closed). */
export function createDefaultGame(setup: GameSetup): { game: Game; events: EventBus<GameEvents> } {
  const seed = setup.seed ?? Date.now();
  const events = new EventBus<GameEvents>();
  const game = new Game({
    board: new Board(10, 20),
    randomizer: new SevenBagRandomizer(new SeededRandom(seed)),
    letters: new WeightedLetterSource(new SeededRandom(seed ^ 0x9e3779b9)),
    rotation: new SrsRotationSystem(),
    wordFinder: new LongestWordFinder(setup.dictionary, setup.minWordLength ?? 3),
    scoring: new LetterValueScoring(),
    events,
    config: setup.config,
  });
  return { game, events };
}
