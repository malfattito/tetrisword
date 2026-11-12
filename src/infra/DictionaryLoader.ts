import { SortedWordList, type Dictionary } from '../engine';

export interface DictionaryLoader {
  load(): Promise<Dictionary>;
}

/** Fetches the newline-separated word list produced by scripts/dict/build.mjs. */
export class HttpDictionaryLoader implements DictionaryLoader {
  constructor(private readonly url: string) {}

  async load(): Promise<Dictionary> {
    const response = await fetch(this.url);
    if (!response.ok) throw new Error(`Dictionary request failed: ${response.status}`);
    return SortedWordList.fromText(await response.text());
  }
}
