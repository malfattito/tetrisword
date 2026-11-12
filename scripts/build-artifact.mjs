// Turns the Vite build into a self-contained page for a claude.ai Artifact preview:
// inlines the JS/CSS bundle and strips the document skeleton (the host adds its own).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const out = 'dist-artifact';
let html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets'));
const js = assets.find((f) => f.endsWith('.js'));
const css = assets.find((f) => f.endsWith('.css'));

html = html
  .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, '')
  .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, `<style>${readFileSync(join(dist, 'assets', css), 'utf8')}</style>`)
  .replace(/<!doctype html>|<\/?html[^>]*>|<\/?head>|<\/?body>|<meta charset="utf-8">|<meta name="viewport"[^>]*>/gi, '');
const script = readFileSync(join(dist, 'assets', js), 'utf8').replace(/<\/script/g, '<\\/script');
html = `${html.trim()}\n<script type="module">${script}</script>\n`;

mkdirSync(join(out, 'dict'), { recursive: true });
writeFileSync(join(out, 'index.html'), html);
copyFileSync('public/dict/words.txt', join(out, 'dict', 'words.txt'));
console.log(`artifact page: ${(html.length / 1024).toFixed(1)} kB`);
