import type { Board, BoardView } from './Board';
import type { EventBus } from './EventBus';
import type { LetterSource } from './LetterSource';
import { Piece } from './Piece';
import type { PieceRandomizer } from './PieceRandomizer';
import type { RotationSystem } from './RotationSystem';
import type { ScoringStrategy } from './ScoringStrategy';
import { TETROMINOES } from './Tetromino';
import type { WordFinder, WordMatch } from './WordFinder';
import { pointKey, type Point, type Tile } from './types';

export enum GameCommand {
  MoveLeft = 'moveLeft',
  MoveRight = 'moveRight',
  SoftDrop = 'softDrop',
  HardDrop = 'hardDrop',
  RotateClockwise = 'rotateCw',
  RotateCounterClockwise = 'rotateCcw',
  TogglePause = 'togglePause',
}

export type GamePhase = 'ready' | 'falling' | 'clearing' | 'paused' | 'over';

export interface ScoredWord {
  readonly match: WordMatch;
  readonly points: number;
}

export interface GameEvents {
  started: Record<string, never>;
  pieceLocked: { readonly piece: Piece };
  wordsFound: { readonly words: readonly ScoredWord[]; readonly chain: number };
  linesCleared: { readonly count: number; readonly points: number; readonly chain: number };
  levelUp: { readonly level: number };
  phaseChanged: { readonly phase: GamePhase };
  gameOver: { readonly score: number; readonly words: number };
}

export interface GameConfig {
  readonly previewCount: number;
  readonly lockDelayMs: number;
  readonly maxLockResets: number;
  readonly clearAnimationMs: number;
  readonly softDropFactor: number;
  readonly wordsPerLevel: number;
  readonly baseDropIntervalMs: number;
  readonly minDropIntervalMs: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  previewCount: 3,
  lockDelayMs: 500,
  maxLockResets: 15,
  clearAnimationMs: 420,
  softDropFactor: 20,
  wordsPerLevel: 8,
  baseDropIntervalMs: 900,
  minDropIntervalMs: 90,
};

/** Every collaborator is injected as an abstraction (Dependency Inversion). */
export interface GameDependencies {
  readonly board: Board;
  readonly randomizer: PieceRandomizer;
  readonly letters: LetterSource;
  readonly rotation: RotationSystem;
  readonly wordFinder: WordFinder;
  readonly scoring: ScoringStrategy;
  readonly events: EventBus<GameEvents>;
  readonly config?: Partial<GameConfig>;
}

/**
 * Facade over the engine. Owns the game loop state machine:
 * falling → (lock) → resolve → clearing ⟲ (cascade) → spawn → falling … → over
 */
export class Game {
  private readonly board: Board;
  private readonly deps: GameDependencies;
  private readonly config: GameConfig;
  private readonly commandHandlers: Readonly<Record<GameCommand, () => void>>;

  private _phase: GamePhase = 'ready';
  private _current: Piece | null = null;
  private _queue: Piece[] = [];
  private _score = 0;
  private _level = 1;
  private _words = 0;
  private _clearing: ReadonlySet<string> = new Set();
  private _chain = 0;
  private tileIds = 0;
  private gravityTimer = 0;
  private lockTimer = 0;
  private lockResets = 0;
  private clearTimer = 0;
  private softDropping = false;
  private phaseBeforePause: GamePhase = 'falling';

  constructor(deps: GameDependencies) {
    this.deps = deps;
    this.board = deps.board;
    this.config = { ...DEFAULT_GAME_CONFIG, ...deps.config };
    this.commandHandlers = {
      [GameCommand.MoveLeft]: () => this.tryMove(-1, 0),
      [GameCommand.MoveRight]: () => this.tryMove(1, 0),
      [GameCommand.SoftDrop]: () => this.softDropStep(),
      [GameCommand.HardDrop]: () => this.hardDrop(),
      [GameCommand.RotateClockwise]: () => this.tryRotate(1),
      [GameCommand.RotateCounterClockwise]: () => this.tryRotate(-1),
      [GameCommand.TogglePause]: () => this.togglePause(),
    };
  }

  // ---------- Read-only state for renderers / HUD ----------
  get phase(): GamePhase { return this._phase; }
  get score(): number { return this._score; }
  get level(): number { return this._level; }
  get wordsFormed(): number { return this._words; }
  get chain(): number { return this._chain; }
  get current(): Piece | null { return this._current; }
  get queue(): readonly Piece[] { return this._queue; }
  get boardView(): BoardView { return this.board; }
  /** Cells currently flashing before removal. */
  get clearingCells(): ReadonlySet<string> { return this._clearing; }

  ghost(): Piece | null {
    if (!this._current) return null;
    let ghost = this._current;
    while (this.board.canPlace(ghost.movedBy(0, 1))) ghost = ghost.movedBy(0, 1);
    return ghost;
  }

  // ---------- Lifecycle ----------
  start(): void {
    this.board.reset();
    this._score = 0;
    this._level = 1;
    this._words = 0;
    this._chain = 0;
    this._clearing = new Set();
    this._queue = Array.from({ length: this.config.previewCount }, () => this.createPiece());
    this.deps.events.emit('started', {});
    this.spawnNext();
  }

  execute(command: GameCommand): void {
    if (command === GameCommand.TogglePause) { this.togglePause(); return; }
    if (this._phase !== 'falling') return;
    this.commandHandlers[command]();
  }

  setSoftDrop(active: boolean): void {
    this.softDropping = active;
  }

  update(deltaMs: number): void {
    if (this._phase === 'falling') this.updateFalling(deltaMs);
    else if (this._phase === 'clearing') this.updateClearing(deltaMs);
  }

  // ---------- Falling ----------
  private dropInterval(): number {
    const base = this.config.baseDropIntervalMs * Math.pow(0.85, this._level - 1);
    const interval = Math.max(this.config.minDropIntervalMs, base);
    return this.softDropping ? interval / this.config.softDropFactor : interval;
  }

  private updateFalling(deltaMs: number): void {
    if (!this._current) return;
    if (this.isGrounded()) {
      this.lockTimer += deltaMs;
      if (this.lockTimer >= this.config.lockDelayMs) this.lockCurrent();
      return;
    }
    this.gravityTimer += deltaMs;
    const interval = this.dropInterval();
    while (this.gravityTimer >= interval && !this.isGrounded()) {
      this.gravityTimer -= interval;
      this._current = this._current.movedBy(0, 1);
      if (this.softDropping) this._score += 1;
    }
  }

  private isGrounded(): boolean {
    return !!this._current && !this.board.canPlace(this._current.movedBy(0, 1));
  }

  private tryMove(dx: number, dy: number): boolean {
    if (!this._current) return false;
    const moved = this._current.movedBy(dx, dy);
    if (!this.board.canPlace(moved)) return false;
    this._current = moved;
    this.onSuccessfulManipulation();
    return true;
  }

  private tryRotate(direction: 1 | -1): void {
    if (!this._current) return;
    const rotated = this.deps.rotation.rotate(this._current, direction, this.board);
    if (!rotated) return;
    this._current = rotated;
    this.onSuccessfulManipulation();
  }

  /** Move reset rule: manipulating a grounded piece postpones the lock a limited number of times. */
  private onSuccessfulManipulation(): void {
    if (this.lockTimer > 0 && this.lockResets < this.config.maxLockResets) {
      this.lockTimer = 0;
      this.lockResets++;
    }
  }

  private softDropStep(): void {
    if (this.tryMove(0, 1)) { this._score += 1; this.gravityTimer = 0; }
  }

  private hardDrop(): void {
    const ghost = this.ghost();
    if (!this._current || !ghost) return;
    const distance = ghost.position.y - this._current.position.y;
    this._score += this.deps.scoring.scoreHardDrop(distance);
    this._current = ghost;
    this.lockCurrent();
  }

  private lockCurrent(): void {
    const piece = this._current;
    if (!piece) return;
    this._current = null;
    const fits = this.board.lock(piece);
    this.deps.events.emit('pieceLocked', { piece });
    if (!fits) { this.endGame(); return; }
    this._chain = 0;
    this.resolveBoard();
  }

  // ---------- Resolution / cascades ----------
  private resolveBoard(): void {
    const words = this.deps.wordFinder.find(this.board);
    const rows = this.board.fullRows();
    if (words.length === 0 && rows.length === 0) { this.spawnNext(); return; }

    this._chain++;
    const cells = new Set<string>();
    words.forEach((w) => w.cells.forEach((c) => cells.add(pointKey(c))));
    rows.forEach((y) => { for (let x = 0; x < this.board.width; x++) cells.add(pointKey({ x, y })); });

    if (words.length) this.scoreWords(words);
    if (rows.length) {
      const points = this.deps.scoring.scoreLines(rows.length, this._chain, this._level);
      this._score += points;
      this.deps.events.emit('linesCleared', { count: rows.length, points, chain: this._chain });
    }

    this._clearing = cells;
    this.clearTimer = this.config.clearAnimationMs;
    this.setPhase('clearing');
  }

  private scoreWords(matches: WordMatch[]): void {
    const scored = matches.map((match) => ({
      match,
      points: this.deps.scoring.scoreWord(match, this._chain, this._level),
    }));
    this._score += scored.reduce((sum, w) => sum + w.points, 0);
    this._words += matches.length;
    this.deps.events.emit('wordsFound', { words: scored, chain: this._chain });
    const level = 1 + Math.floor(this._words / this.config.wordsPerLevel);
    if (level > this._level) {
      this._level = level;
      this.deps.events.emit('levelUp', { level });
    }
  }

  private updateClearing(deltaMs: number): void {
    this.clearTimer -= deltaMs;
    if (this.clearTimer > 0) return;
    const points: Point[] = [...this._clearing].map((k) => {
      const [x, y] = k.split(',').map(Number);
      return { x, y };
    });
    this.board.removeCells(points);
    this._clearing = new Set();
    this.board.applyGravity();
    this.resolveBoard(); // may cascade into another clearing phase
  }

  // ---------- Spawning ----------
  private createPiece(): Piece {
    const type = this.deps.randomizer.next();
    const tiles: Tile[] = this.deps.letters
      .nextLetters(TETROMINOES[type].spawnBlocks.length)
      .map((letter) => ({ id: ++this.tileIds, letter, pieceType: type }));
    const boxSize = TETROMINOES[type].boxSize;
    const x = Math.floor((this.board.width - boxSize) / 2);
    const y = type === 'I' ? -1 : 0;
    return Piece.create(type, tiles, { x, y });
  }

  private spawnNext(): void {
    const next = this._queue.shift() ?? this.createPiece();
    this._queue.push(this.createPiece());
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    if (!this.board.canPlace(next)) { this._current = next; this.endGame(); return; }
    this._current = next;
    this.setPhase('falling');
  }

  private togglePause(): void {
    if (this._phase === 'paused') this.setPhase(this.phaseBeforePause);
    else if (this._phase === 'falling' || this._phase === 'clearing') {
      this.phaseBeforePause = this._phase;
      this.setPhase('paused');
    }
  }

  private endGame(): void {
    this.setPhase('over');
    this.deps.events.emit('gameOver', { score: this._score, words: this._words });
  }

  private setPhase(phase: GamePhase): void {
    if (this._phase === phase) return;
    this._phase = phase;
    this.deps.events.emit('phaseChanged', { phase });
  }
}
