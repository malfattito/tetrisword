import type { Game } from '../engine';
import { CanvasSurface } from './CanvasSurface';
import type { Theme } from './Theme';
import { TilePainter } from './TilePainter';

/** Renders the upcoming pieces (with their letters) side by side, or stacked when tall. */
export class PreviewRenderer {
  private readonly surface: CanvasSurface;
  private readonly painter: TilePainter;

  constructor(canvas: HTMLCanvasElement, private readonly game: Game, theme: Theme) {
    this.surface = new CanvasSurface(canvas);
    this.painter = new TilePainter(theme);
  }

  render(): void {
    const { ctx, width, height } = this.surface;
    ctx.clearRect(0, 0, width, height);
    const queue = this.game.queue;
    if (!queue.length) return;

    const vertical = height > width;
    const slots = queue.length;
    const slotW = vertical ? width : width / slots;
    const slotH = vertical ? height / slots : height;
    const cell = Math.min(slotW / 4.6, slotH / 2.6);

    queue.forEach((piece, i) => {
      const cells = piece.localCells();
      const xs = cells.map((c) => c.point.x);
      const ys = cells.map((c) => c.point.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const pw = (maxX - minX + 1) * cell;
      const ph = (maxY - minY + 1) * cell;
      const sx = (vertical ? 0 : i * slotW) + (slotW - pw) / 2;
      const sy = (vertical ? i * slotH : 0) + (slotH - ph) / 2;
      ctx.globalAlpha = i === 0 ? 1 : 0.6;
      for (const { point, tile } of cells) {
        this.painter.paint(ctx, tile, sx + (point.x - minX) * cell, sy + (point.y - minY) * cell, cell);
      }
    });
    ctx.globalAlpha = 1;
  }
}
