import type { PieceType } from '../engine';

/** Visual tokens shared by canvas renderers. Mirrors the CSS custom properties in style.css. */
export interface Theme {
  readonly well: string;
  readonly gridLine: string;
  readonly tileText: string;
  readonly ghost: string;
  readonly highlight: string;
  readonly letterFont: string;
  readonly pointFont: string;
  readonly pieceColors: Readonly<Record<PieceType, string>>;
}

export const MOVABLE_TYPE_THEME: Theme = {
  well: '#17141f',
  gridLine: 'rgba(239, 233, 223, 0.05)',
  tileText: '#1d1a24',
  ghost: 'rgba(239, 233, 223, 0.28)',
  highlight: '#ffcf5a',
  letterFont: '"Bricolage Grotesque", "Arial Black", system-ui, sans-serif',
  pointFont: '"IBM Plex Mono", ui-monospace, monospace',
  pieceColors: {
    I: '#7fc8b8',
    O: '#f2c98a',
    T: '#c9a5e0',
    S: '#a9c77f',
    Z: '#ef9a86',
    J: '#8fb2e8',
    L: '#e8a8c4',
  },
};
