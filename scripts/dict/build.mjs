// Builds the game dictionary from VERO (Hunspell pt_BR, LGPLv3/MPL)
// + verb conjugations from fserb/pt-br (MIT).
// Usage: node scripts/dict/build.mjs  -> public/dict/words.txt
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const raw = (f) => readFileSync(join(here, 'raw', f), 'utf8').replace(/^﻿/, '');
const MIN = 3, MAX = 10; // board is 10 columns wide
const ABBR = new Set('abc atm csi exs out oil ice ftp dpi ppm rpm hmg mca pkm ips smj etc'.split(' '));

// ---------- Hunspell affix parsing (FLAG UTF-8: 1 char = 1 flag) ----------
const aff = raw('pt_BR.aff').split('\n');
const rules = new Map(); // flag -> {type, cross, entries[]}
let forbidden = '';
for (const line of aff) {
  const p = line.trim().split(/\s+/);
  if (p[0] === 'FORBIDDENWORD') forbidden = p[1];
  if (p[0] !== 'SFX' && p[0] !== 'PFX') continue;
  const [type, flag] = p;
  if (!rules.has(flag)) { rules.set(flag, { type, cross: p[2] === 'Y', entries: [] }); continue; }
  const strip = p[2] === '0' ? '' : p[2];
  let [add, cont = ''] = (p[3] ?? '').split('/');
  if (add === '0') add = '';
  const cond = p[4] && p[4] !== '.' ? new RegExp(type === 'SFX' ? `${p[4]}$` : `^${p[4]}`) : null;
  rules.get(flag).entries.push({ strip, add, cont, cond });
}

function applyRule(word, r, e) {
  if (e.cond && !e.cond.test(word)) return null;
  if (r.type === 'SFX') {
    if (e.strip && !word.endsWith(e.strip)) return null;
    return word.slice(0, word.length - e.strip.length) + e.add;
  }
  if (e.strip && !word.startsWith(e.strip)) return null;
  return e.add + word.slice(e.strip.length);
}

function expand(word, flags, out) {
  out.add(word);
  const sfx = [];
  for (const f of flags) {
    const r = rules.get(f);
    if (!r || r.type !== 'SFX') continue;
    for (const e of r.entries) {
      const w = applyRule(word, r, e);
      if (!w) continue;
      out.add(w); sfx.push({ w, cross: r.cross });
      for (const c of e.cont) { // continuation (twofold) – one level
        const r2 = rules.get(c);
        if (r2?.type === 'SFX') for (const e2 of r2.entries) { const w2 = applyRule(w, r2, e2); if (w2) out.add(w2); }
      }
    }
  }
  for (const f of flags) {
    const r = rules.get(f);
    if (!r || r.type !== 'PFX') continue;
    for (const e of r.entries) {
      const w = applyRule(word, r, e);
      if (w) out.add(w);
      if (r.cross) for (const s of sfx) if (s.cross) { const w2 = applyRule(s.w, r, e); if (w2) out.add(w2); }
    }
  }
}

// ---------- Build ----------
const forms = new Set();
const dic = raw('pt_BR.dic').split('\n').slice(1);
for (const line of dic) {
  const [word, flags = ''] = line.trim().split('/');
  if (!word || (forbidden && flags.includes(forbidden))) continue;
  if (/^[A-ZÀ-Ý]/.test(word)) continue; // proper nouns / acronyms
  expand(word, [...flags], forms);
}
for (const w of raw('conj').split('\n')) forms.add(w.trim());

const normalize = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const blockPath = join(here, 'blocklist.txt');
const block = new Set(existsSync(blockPath)
  ? readFileSync(blockPath, 'utf8').split('\n').map((s) => normalize(s.trim())).filter(Boolean) : []);

// Research finding (docs/pesquisa.md): with the full dictionary ~21% of random trigrams are words,
// so 3-letter words come only from the most frequent ones (fserb ICF top 20k, MIT).
const COMMON_RANK = 20000;
const common3 = new Set(raw('icf').split('\n').slice(0, COMMON_RANK)
  .map((l) => normalize(l.split(',')[0])).filter((w) => w.length === 3));

const words = new Set();
for (const f of forms) {
  if (/^[A-ZÀ-Ý]/.test(f)) continue;
  const n = normalize(f);
  if (n.length < MIN || n.length > MAX || !/^[a-z]+$/.test(n) || block.has(n) || ABBR.has(n) || !/[aeiouy]/.test(n)) continue;
  if (n.length === 3 && !common3.has(n)) continue;
  words.add(n);
}
const sorted = [...words].sort();
mkdirSync(join(here, '../../public/dict'), { recursive: true });
writeFileSync(join(here, '../../public/dict/words.txt'), sorted.join('\n') + '\n');
console.log(`expanded forms: ${forms.size}  game words (${MIN}-${MAX} letters): ${sorted.length}`);
