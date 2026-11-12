import { GameCommand } from '../engine';
import type { CommandSink, InputController } from './InputController';

const REPEATABLE = new Set<GameCommand>([GameCommand.MoveLeft, GameCommand.MoveRight, GameCommand.SoftDrop]);

/** On-screen buttons declared in HTML via `data-command="<GameCommand>"`. Movement buttons auto-repeat while held. */
export class ButtonController implements InputController {
  private timers = new Map<HTMLElement, number>();
  private readonly buttons: HTMLElement[];
  private readonly validCommands = new Set<string>(Object.values(GameCommand));

  constructor(root: HTMLElement, private readonly sink: CommandSink, private readonly repeatDelayMs = 170, private readonly repeatRateMs = 55) {
    this.buttons = [...root.querySelectorAll<HTMLElement>('[data-command]')];
  }

  private commandOf(el: HTMLElement): GameCommand | null {
    const value = el.dataset.command ?? '';
    return this.validCommands.has(value) ? (value as GameCommand) : null;
  }

  private readonly onDown = (e: PointerEvent): void => {
    const el = e.currentTarget as HTMLElement;
    const command = this.commandOf(el);
    if (!command) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    this.sink.execute(command);
    if (!REPEATABLE.has(command)) return;
    const timer = window.setTimeout(function repeat(this: ButtonController) {
      this.sink.execute(command);
      this.timers.set(el, window.setTimeout(repeat.bind(this), this.repeatRateMs));
    }.bind(this), this.repeatDelayMs);
    this.timers.set(el, timer);
  };

  private readonly onUp = (e: PointerEvent): void => {
    const el = e.currentTarget as HTMLElement;
    window.clearTimeout(this.timers.get(el));
    this.timers.delete(el);
  };

  /** Keyboard users activate buttons with Enter/Space (click), without repeat. */
  private readonly onClick = (e: MouseEvent): void => {
    if (e.detail !== 0) return; // pointer clicks already handled on pointerdown
    const command = this.commandOf(e.currentTarget as HTMLElement);
    if (command) this.sink.execute(command);
  };

  attach(): void {
    for (const b of this.buttons) {
      b.addEventListener('pointerdown', this.onDown);
      b.addEventListener('pointerup', this.onUp);
      b.addEventListener('pointercancel', this.onUp);
      b.addEventListener('click', this.onClick);
    }
  }

  detach(): void {
    for (const b of this.buttons) {
      b.removeEventListener('pointerdown', this.onDown);
      b.removeEventListener('pointerup', this.onUp);
      b.removeEventListener('pointercancel', this.onUp);
      b.removeEventListener('click', this.onClick);
    }
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers.clear();
  }
}
