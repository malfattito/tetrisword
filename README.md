# tetrisword

Jogo web (PWA, mobile-first) de blocos caindo em que **cada bloco é uma letra**. Forme palavras em português do Brasil (3+ letras, horizontal ou vertical) e elas somem — gerando cascatas e combos.

> Projeto em planejamento. Veja o [board](../../projects) e as [issues](../../issues).

## Regras (rascunho)
- Peças de 4 blocos, cada bloco com uma letra sorteada por frequência do português.
- Palavras de 3+ letras, leitura esquerda→direita e cima→baixo. Vale a mais longa.
- Acentos normalizados (á = a, ç = c). `Q` sempre vem como `QU`.
- Linhas completas também são limpas. Cascatas multiplicam a pontuação.

## Stack
TypeScript · Vite · Canvas 2D · Vitest · Playwright · GitHub Pages

## Time (agentes em `.claude/agents/`)
Pesquisador · Especialista em Puzzle · UX/UI · QA · PO

## Licença
MIT (código). Dicionários mantêm as licenças das fontes originais — ver `docs/pesquisa.md`.
