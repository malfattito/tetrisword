import { pointKey, type Game } from '../engine';
import { CanvasSurface } from './CanvasSurface';
import type { Theme } from './Theme';
import { TilePainter } from './TilePainter';

/** Renders the well: locked tiles, ghost, active piece and clearing flash. Read-only over Game. */
export class BoardRenderer {
  private readonly surface: CanvasSurface;
  private readonly painter: TilePainter;
  private elapsed = 0;

  constructor(canvas: HTMLCanvasElement, private readonly game: Game, private readonly theme: Theme) {
    this.surface = new CanvasSurface(canvas);
    this.painter = new TilePainter(theme);
  }

  /** Size in CSS pixels of one cell, so input controllers can convert drags into moves. */
  get cellSize(): number {
    const board = this.game.boardView;
    return Math.min(this.surface.width / board.width, this.surface.height / board.height);
  }

  render(deltaMs: number): void {
    this.elapsed += deltaMs;
    const { ctx } = this.surface;
    const board = this.game.boardView;
    const size = this.cellSize;
    const ox = (this.surface.width - size * board.width) / 2;
    const oy = (this.surface.height - size * board.height) / 2;

    this.surface.clear(this.theme.well);
    this.drawGrid(ctx, ox, oy, size, board.width, board.height);

    const flashOn = Math.floor(this.elapsed / 90) % 2 === 0;
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const tile = board.tileAt(x, y);
        if (!tile) continue;
        const clearing = this.game.clearingCells.has(pointKey({ x, y }));
        this.painter.paint(ctx, tile, ox + x * size, oy + y * size, size, clearing && flashOn ? 'highlight' : 'solid');
      }
    }

    const current = this.game.current;
    if (!current || this.game.phase === 'clearing') return;
    const ghost = this.game.ghost();
    if (ghost && ghost.position.y !== current.position.y) {
      for (const { point, tile } of ghost.cells()) {
        if (point.y >= 0) this.painter.paint(ctx, tile, ox + point.x * size, oy + point.y * size, size, 'ghost');
      }
    }
    for (const { point, tile } of current.cells()) {
      if (point.y >= 0) this.painter.paint(ctx, tile, ox + point.x * size, oy + point.y * size, size);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D, ox: number, oy: number, size: number, w: number, h: number): void {
    ctx.strokeStyle = this.theme.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 1; x < w; x++) { ctx.moveTo(ox + x * size + 0.5, oy); ctx.lineTo(ox + x * size + 0.5, oy + h * size); }
    for (let y = 1; y < h; y++) { ctx.moveTo(ox, oy + y * size + 0.5); ctx.lineTo(ox + w * size, oy + y * size + 0.5); }
    ctx.stroke();
  }
}
