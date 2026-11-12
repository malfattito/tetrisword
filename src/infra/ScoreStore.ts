export interface ScoreStore {
  best(): number;
  submit(score: number): boolean; // true when it is a new record
}

/** Best score in localStorage; silently degrades when storage is unavailable. */
export class LocalScoreStore implements ScoreStore {
  private memory = 0;

  constructor(private readonly key = 'tetrisword.best') {
    try { this.memory = Number(localStorage.getItem(key)) || 0; } catch { /* storage blocked */ }
  }

  best(): number {
    return this.memory;
  }

  submit(score: number): boolean {
    if (score <= this.memory) return false;
    this.memory = score;
    try { localStorage.setItem(this.key, String(score)); } catch { /* storage blocked */ }
    return true;
  }
}
