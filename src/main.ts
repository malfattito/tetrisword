import './style.css';
import { createDefaultGame, GameCommand, type Dictionary } from './engine';
import { HttpDictionaryLoader } from './infra/DictionaryLoader';
import { LocalScoreStore } from './infra/ScoreStore';
import { ButtonController } from './input/ButtonController';
import { GestureController } from './input/GestureController';
import { KeyboardController } from './input/InputController';
import { BoardRenderer } from './render/BoardRenderer';
import { PreviewRenderer } from './render/PreviewRenderer';
import { MOVABLE_TYPE_THEME } from './render/Theme';
import { STRINGS } from './ui/strings';
import { OverlayView, StatsView, ToastView, WordLogView } from './ui/views';

/** Composition root: the only place that knows concrete classes. */
async function bootstrap(): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-app]');
  if (!root) return;
  const overlay = new OverlayView(root);
  overlay.show('loading', { message: STRINGS.loading });

  let dictionary: Dictionary;
  try {
    const [dict] = await Promise.all([
      new HttpDictionaryLoader('dict/words.txt').load(),
      document.fonts?.load('800 32px "Bricolage Grotesque"').catch(() => undefined),
    ]);
    dictionary = dict;
  } catch {
    overlay.show('error', { message: STRINGS.loadError });
    return;
  }

  const { game, events } = createDefaultGame({ dictionary });
  const store = new LocalScoreStore();
  const theme = MOVABLE_TYPE_THEME;
  const boardCanvas = root.querySelector<HTMLCanvasElement>('[data-board]')!;
  const board = new BoardRenderer(boardCanvas, game, theme);
  const preview = new PreviewRenderer(root.querySelector<HTMLCanvasElement>('[data-preview]')!, game, theme);
  const stats = new StatsView(root, game, store);
  new WordLogView(root, events);
  new ToastView(root, events);

  const controllers = [
    new KeyboardController(game),
    new GestureController(boardCanvas, game, { cellSize: () => board.cellSize }),
    new ButtonController(root, game),
  ];
  controllers.forEach((c) => c.attach());

  const start = () => { overlay.show('none'); game.start(); };
  events.on('phaseChanged', ({ phase }) => {
    root.dataset.phase = phase;
    if (phase === 'paused') overlay.show('paused', { message: STRINGS.summary(game.score, game.wordsFormed), onAction: () => game.execute(GameCommand.TogglePause) });
    else if (phase === 'falling' || phase === 'clearing') overlay.show('none');
  });
  events.on('gameOver', ({ score, words }) => {
    const record = store.submit(score);
    overlay.show('over', { message: `${STRINGS.summary(score, words)}${record ? ' · novo recorde!' : ''}`, onAction: start });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (game.phase === 'falling' || game.phase === 'clearing')) game.execute(GameCommand.TogglePause);
  });

  overlay.show('start', { message: STRINGS.dictionarySize(dictionary.size), onAction: start });

  let last = performance.now();
  const frame = (now: number) => {
    const delta = Math.min(100, now - last);
    last = now;
    game.update(delta);
    board.render(delta);
    preview.render();
    stats.render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

void bootstrap();
