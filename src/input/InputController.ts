import { GameCommand } from '../engine';

/** What input controllers need from the game (Interface Segregation: they never see the full Game). */
export interface CommandSink {
  execute(command: GameCommand): void;
  setSoftDrop(active: boolean): void;
}

export interface InputController {
  attach(): void;
  detach(): void;
}

/** Keyboard → commands. Key map is data, so remapping needs no code changes. */
export class KeyboardController implements InputController {
  static readonly DEFAULT_KEYMAP: Readonly<Record<string, GameCommand>> = {
    ArrowLeft: GameCommand.MoveLeft,
    ArrowRight: GameCommand.MoveRight,
    ArrowUp: GameCommand.RotateClockwise,
    KeyX: GameCommand.RotateClockwise,
    KeyZ: GameCommand.RotateCounterClockwise,
    Space: GameCommand.HardDrop,
    KeyP: GameCommand.TogglePause,
    Escape: GameCommand.TogglePause,
  };

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowDown') { this.sink.setSoftDrop(true); e.preventDefault(); return; }
    const command = this.keymap[e.code];
    if (!command) return;
    e.preventDefault();
    if (e.repeat && (command === GameCommand.HardDrop || command === GameCommand.TogglePause)) return;
    this.sink.execute(command);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowDown') this.sink.setSoftDrop(false);
  };

  constructor(
    private readonly sink: CommandSink,
    private readonly keymap: Readonly<Record<string, GameCommand>> = KeyboardController.DEFAULT_KEYMAP,
  ) {}

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
