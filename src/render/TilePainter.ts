import { PT_BR_LETTER_POINTS, type Tile } from '../engine';
import type { Theme } from './Theme';

export type TileStyle = 'solid' | 'ghost' | 'highlight';

/** Draws a single lettered tile, styled like a piece of movable type. Shared by board and preview. */
export class TilePainter {
  constructor(private readonly theme: Theme) {}

  paint(ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number, size: number, style: TileStyle = 'solid'): void {
    const inset = Math.max(1, size * 0.05);
    const s = size - inset * 2;
    const r = size * 0.16;
    const px = x + inset;
    const py = y + inset;

    if (style === 'ghost') {
      ctx.strokeStyle = this.theme.ghost;
      ctx.lineWidth = Math.max(1, size * 0.05);
      this.roundRect(ctx, px, py, s, s, r);
      ctx.stroke();
      this.letter(ctx, tile, x, y, size, this.theme.ghost);
      return;
    }

    const face = style === 'highlight' ? this.theme.highlight : this.theme.pieceColors[tile.pieceType];
    // body
    ctx.fillStyle = face;
    this.roundRect(ctx, px, py, s, s, r);
    ctx.fill();
    // lower bevel gives the "cast metal type" depth
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    this.roundRect(ctx, px, py + s * 0.82, s, s * 0.18, r * 0.6);
    ctx.fill();
    // top sheen
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    this.roundRect(ctx, px + s * 0.08, py + s * 0.06, s * 0.84, s * 0.12, r * 0.5);
    ctx.fill();

    this.letter(ctx, tile, x, y, size, this.theme.tileText);
    this.points(ctx, tile, px, py, s);
  }

  private letter(ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number, size: number, color: string): void {
    const digraph = tile.letter.length > 1;
    ctx.fillStyle = color;
    ctx.font = `800 ${Math.round(size * (digraph ? 0.42 : 0.58))}px ${this.theme.letterFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = digraph ? tile.letter[0] + tile.letter.slice(1).toLowerCase() : tile.letter;
    ctx.fillText(label, x + size / 2, y + size * 0.48);
  }

  private points(ctx: CanvasRenderingContext2D, tile: Tile, px: number, py: number, s: number): void {
    if (s < 22) return;
    const value = PT_BR_LETTER_POINTS[tile.letter] ?? 1;
    ctx.fillStyle = 'rgba(29, 26, 36, 0.62)';
    ctx.font = `600 ${Math.round(s * 0.2)}px ${this.theme.pointFont}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(value), px + s * 0.9, py + s * 0.78);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
