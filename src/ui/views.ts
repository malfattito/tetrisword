import type { EventBus, Game, GameEvents, ScoredWord } from '../engine';
import type { ScoreStore } from '../infra/ScoreStore';
import { STRINGS } from './strings';

const $ = <T extends HTMLElement>(root: ParentNode, selector: string): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

/** Score / level / words / best. Polls cheap getters each frame instead of duplicating state. */
export class StatsView {
  private readonly score: HTMLElement;
  private readonly level: HTMLElement;
  private readonly words: HTMLElement;
  private readonly best: HTMLElement;
  private last = '';

  constructor(root: ParentNode, private readonly game: Game, private readonly store: ScoreStore) {
    this.score = $(root, '[data-stat="score"]');
    this.level = $(root, '[data-stat="level"]');
    this.words = $(root, '[data-stat="words"]');
    this.best = $(root, '[data-stat="best"]');
  }

  render(): void {
    const best = Math.max(this.store.best(), this.game.score);
    const key = `${this.game.score}|${this.game.level}|${this.game.wordsFormed}|${best}`;
    if (key === this.last) return;
    this.last = key;
    this.score.textContent = this.game.score.toLocaleString('pt-BR');
    this.level.textContent = String(this.game.level);
    this.words.textContent = String(this.game.wordsFormed);
    this.best.textContent = best.toLocaleString('pt-BR');
  }
}

/** History of formed words, newest first. */
export class WordLogView {
  private readonly list: HTMLElement;
  private readonly empty: HTMLElement;

  constructor(root: ParentNode, events: EventBus<GameEvents>, private readonly limit = 30) {
    this.list = $(root, '[data-word-log]');
    this.empty = $(root, '[data-word-log-empty]');
    events.on('started', () => { this.list.replaceChildren(); this.empty.hidden = false; });
    events.on('wordsFound', ({ words, chain }) => words.forEach((w) => this.add(w, chain)));
  }

  private add(word: ScoredWord, chain: number): void {
    this.empty.hidden = true;
    const li = document.createElement('li');
    li.className = 'word-chip';
    const text = document.createElement('span');
    text.className = 'word-chip__text';
    text.textContent = word.match.word.toUpperCase();
    const pts = document.createElement('span');
    pts.className = 'word-chip__pts';
    pts.textContent = `+${word.points}`;
    li.append(text, pts);
    if (chain > 1) li.dataset.chain = String(chain);
    li.title = word.match.direction === 'horizontal' ? 'Horizontal' : 'Vertical';
    this.list.prepend(li);
    while (this.list.children.length > this.limit) this.list.lastElementChild?.remove();
  }
}

/** Floating callouts over the board for words, cascades, lines and level-ups. */
export class ToastView {
  private readonly layer: HTMLElement;

  constructor(root: ParentNode, events: EventBus<GameEvents>) {
    this.layer = $(root, '[data-toasts]');
    events.on('wordsFound', ({ words, chain }) => {
      const label = words.map((w) => w.match.word.toUpperCase()).join(' · ');
      const points = words.reduce((s, w) => s + w.points, 0);
      this.show(label, `+${points.toLocaleString('pt-BR')}`, 'word');
      if (chain > 1) this.show(STRINGS.chain(chain), '', 'chain');
    });
    events.on('linesCleared', ({ count, points }) => this.show(STRINGS.line(count), `+${points}`, 'line'));
    events.on('levelUp', ({ level }) => this.show(STRINGS.levelUp(level), '', 'level'));
  }

  private show(title: string, detail: string, kind: string): void {
    const el = document.createElement('div');
    el.className = `toast toast--${kind}`;
    el.setAttribute('role', 'status');
    const t = document.createElement('strong');
    t.textContent = title;
    el.append(t);
    if (detail) {
      const d = document.createElement('span');
      d.textContent = detail;
      el.append(d);
    }
    this.layer.append(el);
    window.setTimeout(() => el.remove(), 1400);
  }
}

export type OverlayMode = 'loading' | 'error' | 'start' | 'paused' | 'over' | 'none';

/** Start / pause / game-over panel on top of the board. */
export class OverlayView {
  private readonly panel: HTMLElement;
  private readonly heading: HTMLElement;
  private readonly message: HTMLElement;
  private readonly action: HTMLButtonElement;
  private onAction: () => void = () => undefined;

  constructor(root: ParentNode) {
    this.panel = $(root, '[data-overlay]');
    this.heading = $(root, '[data-overlay-title]');
    this.message = $(root, '[data-overlay-message]');
    this.action = $(root, '[data-overlay-action]');
    this.action.addEventListener('click', () => this.onAction());
  }

  show(mode: OverlayMode, options: { message?: string; onAction?: () => void } = {}): void {
    this.panel.hidden = mode === 'none';
    this.panel.dataset.mode = mode;
    if (mode === 'none') return;
    const config: Record<Exclude<OverlayMode, 'none'>, { title: string; action: string | null }> = {
      loading: { title: STRINGS.title, action: null },
      error: { title: STRINGS.title, action: null },
      start: { title: STRINGS.title, action: STRINGS.play },
      paused: { title: STRINGS.paused, action: STRINGS.resume },
      over: { title: STRINGS.gameOver, action: STRINGS.playAgain },
    };
    const { title, action } = config[mode];
    this.heading.textContent = title;
    this.message.textContent = options.message ?? '';
    this.action.hidden = action === null;
    if (action) this.action.textContent = action;
    this.onAction = options.onAction ?? (() => undefined);
    if (action) window.setTimeout(() => this.action.focus({ preventScroll: true }), 0);
  }
}
