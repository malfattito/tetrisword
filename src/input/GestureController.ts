import { GameCommand } from '../engine';
import type { CommandSink, InputController } from './InputController';

export interface GestureOptions {
  /** Returns the current cell size in CSS pixels (drag distance per move). */
  readonly cellSize: () => number;
  readonly tapMaxMs?: number;
  readonly tapMaxDistance?: number;
  readonly flickVelocity?: number; // px per ms downward to trigger a hard drop
}

/** Touch/pen/mouse gestures on the board: drag = move, tap = rotate, flick down = hard drop. */
export class GestureController implements InputController {
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private stepsX = 0;
  private stepsY = 0;
  private lastY = 0;
  private lastTime = 0;
  private velocityY = 0;

  constructor(private readonly element: HTMLElement, private readonly sink: CommandSink, private readonly options: GestureOptions) {}

  private readonly onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.element.setPointerCapture(e.pointerId);
    this.startX = e.clientX;
    this.startY = this.lastY = e.clientY;
    this.startTime = this.lastTime = e.timeStamp;
    this.stepsX = this.stepsY = 0;
    this.velocityY = 0;
    e.preventDefault();
  };

  private readonly onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const cell = Math.max(12, this.options.cellSize() * 0.9);
    const targetX = Math.trunc((e.clientX - this.startX) / cell);
    while (this.stepsX < targetX) { this.sink.execute(GameCommand.MoveRight); this.stepsX++; }
    while (this.stepsX > targetX) { this.sink.execute(GameCommand.MoveLeft); this.stepsX--; }

    const targetY = Math.trunc((e.clientY - this.startY) / cell);
    while (this.stepsY < targetY) { this.sink.execute(GameCommand.SoftDrop); this.stepsY++; }

    const dt = Math.max(1, e.timeStamp - this.lastTime);
    this.velocityY = 0.7 * this.velocityY + 0.3 * ((e.clientY - this.lastY) / dt);
    this.lastY = e.clientY;
    this.lastTime = e.timeStamp;
  };

  private readonly onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    const distance = Math.hypot(e.clientX - this.startX, e.clientY - this.startY);
    const duration = e.timeStamp - this.startTime;
    if (duration <= (this.options.tapMaxMs ?? 250) && distance <= (this.options.tapMaxDistance ?? 10)) {
      this.sink.execute(GameCommand.RotateClockwise);
    } else if (this.velocityY >= (this.options.flickVelocity ?? 1.1) && Math.abs(this.stepsX) <= 1) {
      this.sink.execute(GameCommand.HardDrop);
    }
  };

  private readonly onCancel = (): void => { this.pointerId = null; };

  attach(): void {
    this.element.style.touchAction = 'none';
    this.element.addEventListener('pointerdown', this.onDown);
    this.element.addEventListener('pointermove', this.onMove);
    this.element.addEventListener('pointerup', this.onUp);
    this.element.addEventListener('pointercancel', this.onCancel);
  }

  detach(): void {
    this.element.removeEventListener('pointerdown', this.onDown);
    this.element.removeEventListener('pointermove', this.onMove);
    this.element.removeEventListener('pointerup', this.onUp);
    this.element.removeEventListener('pointercancel', this.onCancel);
  }
}
