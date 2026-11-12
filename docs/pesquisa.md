# tetrisword: relatório de pesquisa

> Data: 2026-11-11. Autor: agente pesquisador.
> Legenda: **[VERIFICADO]** = conferido nesta pesquisa (arquivo baixado, API do GitHub/npm consultada ou página lida). **[NÃO VERIFICADO]** = informação de terceiros ou inferência que não confirmei na fonte primária. **[MEDIDO]** = número que calculei localmente sobre os arquivos baixados.

---

## 1. Jogos de referência do gênero

### 1.1 Wordtris (Spectrum HoloByte, 1991)
Fonte: https://en.wikipedia.org/wiki/Wordtris [VERIFICADO]
- Caem **blocos de uma letra** (não tetrominós). O jogador forma palavras de **3+ letras** na horizontal ou vertical, e elas podem se sobrepor.
- **"Palavra mágica"** mostrada no topo: se o jogador a forma, o poço é limpo e ele ganha um bônus grande.
- **Bloco "?" (letra livre)**: o jogador escolhe a letra. Se não escolher, ela vira uma letra aleatória ao pousar.
- **Borracha**: apaga a letra em que cai. No SNES foi trocada por bomba e frasco de ácido.
- Recepção mediana (GameRankings em torno de 54–56%). A CGW o achou "tão irritante quanto viciante".
- **O que falhou** (inferência a partir das críticas): blocos de uma letra deixam o jogo lento e sem a parte espacial do Tetris, e letras ruins acumulam sem uma ferramenta de saída boa.

### 1.2 Letris (Ivanovich Games, iOS/Android, série 1–4)
Fontes: https://toucharcade.com/2012/01/11/letris-2-review , https://www.appspy.com/letris-2-word-puzzle-game/review/ [VERIFICADO parcialmente: só reviews]
- As letras caem e se empilham em fileiras. O jogador **toca as letras para montar a palavra**, que não precisa ser contígua, exceto no modo mais difícil. Cada fase tem uma meta.
- Críticas: dicionário "fragmentado" (palavras válidas recusadas) e freemium invasivo.
- **Lição:** a qualidade do dicionário é percebida na hora. Palavra comum recusada irrita mais que palavra obscura aceita.
- Como trata vogais: **[NÃO VERIFICADO]**. Não achei fonte primária.

### 1.3 Bookworm (PopCap, 2003)
Fonte: https://en.wikipedia.org/wiki/Bookworm_(video_game) [VERIFICADO]
- Grade de letras com palavras por **adjacência**. As letras usadas somem e as de cima caem (a mesma ideia de gravidade do nosso jogo).
- **Pontos por raridade da letra** e bônus por palavra longa.
- **Ladrilhos vermelhos "queimando"**: descem pelo tabuleiro e, se chegam ao fundo, o jogo acaba. É a pressão de tempo.
- **Ladrilhos especiais** (verde, ouro, safira, diamante) premiam palavras longas.
- **Embaralhar** (botão do mascote) resolve um tabuleiro ruim, mas com penalidade: mais ladrilhos vermelhos. É uma **válvula de escape com custo**, boa solução para letras ruins.
- A peça "Qu" (Q e U num ladrilho só) é amplamente citada, mas **[NÃO VERIFICADO]** na Wikipedia.
- Prêmio "Puzzle Game of the Year" da CGW (2003).

### 1.4 Alphabear (Spry Fox, 2015)
Fontes: https://toucharcade.com/2015/07/14/alphabear-review/ , https://www.destructoid.com/review-alphabear/ [VERIFICADO: reviews]
- Grade de letras. As letras usadas abrem espaço para ursos que crescem, e **a posição importa** (usar letras adjacentes faz o urso maior).
- **Letras com contador que viram pedra** quando o contador zera. Isso pune deixar letras ruins paradas e cria um dilema de risco e recompensa.
- Crítica principal: o metajogo (energia "mel", power-ups) dilui o núcleo.

### 1.5 Clones open source no GitHub [VERIFICADO via API do GitHub]
| Repositório | Licença | Observações |
|---|---|---|
| https://github.com/khivy/wordtris | MIT | TypeScript, roda no mobile. O roadmap admite "procurar dicionário mais adequado" e "corrigir bugs de não-determinismo" |
| https://github.com/AbhishekCode/word-tetris | Apache-2.0 | React PWA. O jogador clica na palavra para pontuar, ou seja, a detecção não é automática |
| https://github.com/dbasch/letris | sem licença | Vanilla JS, uma letra por vez, palavras de **4+** letras, frequência de letras do inglês. Sem licença = não reutilizar código |
| https://github.com/sajadhsm/word-tetris | (sem) | versão persa |

Nenhum clone que encontrei usa **tetrominós com letras e detecção automática em PT-BR**, então a nossa combinação parece pouco explorada. **[NÃO VERIFICADO]** de forma exaustiva.

### 1.6 Como o gênero lida com "letras ruins" (síntese)
1. **Letra coringa ou escolhível** (Wordtris "?").
2. **Destruidores** (borracha, bomba, ácido).
3. **Embaralhar com custo** (Bookworm).
4. **Punição por deixar letra parada** (Alphabear, pedra).
5. **Pontos maiores para letras raras** (Bookworm, Scrabble), para compensar o risco.
6. **Distribuição controlada** (saco de letras do Scrabble, em vez de sorteio independente).
Críticas recorrentes do gênero: "faltam vogais" (review de Lexis em https://atarigamer.com/lynx/game-review/Lexis/5708307545194496) e "chuva de vogais e consoantes impossível de administrar" em velocidades altas (review de AlphaBeats em https://www.pocketgamer.com/alphabeats/alphabeats/).

### 1.7 Ideias de mecânica ORIGINAIS para o tetrisword
(Usar só nomes, arte e visual próprios. Não citar marcas de terceiros na UI.)
1. **Saco de letras** (análogo ao 7-bag): um saco de N letras (ex.: 100) com a distribuição-alvo, embaralhado e consumido peça a peça. Isso garante proporções no curto prazo e acaba com as secas de vogal.
2. **Regra de vogais por peça**: cada tetrominó de 4 blocos tem **1 a 3 vogais** (nunca 0 nem 4). Se o saco produzir algo fora disso, trocar com a próxima letra do saco.
3. **Sorteio adaptativo leve**: se as vogais nas 4 linhas de baixo ficarem abaixo de 35%, aumentar temporariamente o peso das vogais (ou o contrário). É invisível ao jogador e reduz o travamento.
4. **Girar letras sem girar a forma**: um botão secundário faz as 4 letras andarem em ciclo dentro da peça. Dá controle fino sem coringa.
5. **Reserva de uma letra**: guardar 1 letra da peça atual e trocá-la depois. É um "hold" de letra, não de peça.
6. **Q sempre acompanhado**: se sair Q, o próximo bloco da mesma peça (na ordem de leitura) é U.
7. **Faxina com custo**: depois de K peças sem formar palavra, aparece a opção de pulverizar a linha de baixo ao custo de pontos ou de multiplicador.
8. **Cascata com multiplicador visível** (x2, x3...) e "palavra-tema" da partida (ex.: comida), com bônus temático. Precisa de listas temáticas próprias.
9. **Pré-visualização de palavra**: ao mover a peça, destacar em fantasma as palavras que se formariam ao travar. Exige busca rápida por prefixo (DAWG ou trie).
10. **Revelação didática**: ao limpar, mostrar a palavra por 1 s. Isso evita "por que sumiu?" quando sai uma palavra obscura.

---

## 2. Frequência de letras e referência do Scrabble

### 2.1 Frequência no português
- **Wikipédia PT, "Frequência de letras"** (https://pt.wikipedia.org/wiki/Frequência_de_letras), atribuída à UFRJ, "Decifrando Textos em Português" (gta.ufrj.br) [VERIFICADO na Wikipédia, NÃO VERIFICADO na fonte UFRJ]:
  a 14,63 · e 12,57 · o 10,73 · s 7,81 · r 6,53 · i 6,18 · n 5,05 · d 4,99 · m 4,74 · u 4,63 · t 4,34 · c 3,88 · l 2,78 · p 2,52 · v 1,67 · g 1,30 · h 1,28 · q 1,20 · b 1,04 · f 1,02 · z 0,47 · j 0,40 · x 0,21 · k 0,02 · w 0,01 · y 0,01.
- **[MEDIDO]** sobre dois conjuntos (acentos removidos):

| Letra | Corpus falado (FrequencyWords 50k, ponderado por ocorrência) | Dicionário expandido (VERO, 3–10 letras, 881k formas) | Só palavras de 3–5 letras |
|---|---|---|---|
| a | 13,33 | 16,61 | 15,79 |
| e | 13,88 | 10,33 | 9,45 |
| o | 11,29 | 8,60 | 10,42 |
| i | 5,80 | 8,57 | 8,87 |
| u | 4,99 | 3,30 | 6,15 |
| s | 7,59 | 8,34 | 6,58 |
| r | 6,29 | 7,91 | 6,08 |
| m | 5,09 | 4,35 | 4,25 |
| n | 4,92 | 4,90 | 3,59 |
| t | 4,42 | 4,27 | 3,56 |
| d | 4,08 | 3,66 | 2,38 |
| c | 3,80 | 4,20 | 3,66 |
| l | 2,59 | 3,44 | 4,11 |
| p | 2,50 | 2,15 | 2,69 |
| v | 1,98 | 1,46 | 1,61 |
| q | 1,56 | 0,36 | 0,19 |
| h | 1,30 | 1,15 | 0,87 |
| g | 1,19 | 1,71 | 2,38 |
| b | 1,08 | 1,77 | 2,69 |
| f | 1,04 | 1,29 | 1,76 |
| z | 0,44 | 0,72 | 0,98 |
| j | 0,34 | 0,51 | 1,07 |
| x | 0,19 | 0,37 | 0,83 |
| k/w/y | ~0,3 total | ~0 | ~0 |
| **vogais** | **49,3%** | **47,4%** | **50,7%** |

O português é rico em vogais (cerca de 48–50%). O jogo deve manter isso: com menos vogais, forma-se muito menos palavra.

### 2.2 Scrabble em português (distribuição oficial de referência)
Fonte: https://pt.wikipedia.org/wiki/Scrabble [VERIFICADO na Wikipédia. A soma listada dá 119 e não os 120 declarados]
| Pontos | Letras (quantidade) |
|---|---|
| 0 | branco ×2 |
| 1 | A×14, E×11, I×10, O×10, S×8, U×7, M×6, R×6, T×5 |
| 2 | D×5, L×5, C×4, P×4 |
| 3 | N×4, B×3, Ç×2 |
| 4 | F×2, G×2, H×2, V×2 |
| 5 | J×2 |
| 6 | Q×1 |
| 8 | X×1, Z×1 |
Não há K, W nem Y. Vogais = 52/117 ≈ 44%.

### 2.3 Proposta de pesos de sorteio e pontos para o tetrisword
Mistura de corpus, dicionário e Scrabble. Ç foi fundido em C (normalização), e K/W/Y ficam fora. Os pesos somam 1000 e servem para montar o **saco de letras** (por exemplo, um saco de 100 = peso/10, arredondado).

| Letra | Peso (‰) | Pontos | | Letra | Peso (‰) | Pontos |
|---|---|---|---|---|---|---|
| A | 140 | 1 | | P | 30 | 2 |
| E | 120 | 1 | | V | 20 | 4 |
| O | 100 | 1 | | G | 15 | 4 |
| I | 70 | 1 | | B | 15 | 3 |
| U | 50 | 1 | | F | 10 | 4 |
| S | 80 | 1 | | H | 10 | 4 |
| R | 70 | 1 | | Z | 7 | 8 |
| N | 50 | 2 | | J | 5 | 5 |
| T | 50 | 1 | | X | 4 | 8 |
| M | 40 | 1 | | Q | 4 | 6 (sai sempre com U) |
| D | 40 | 2 | | K, W, Y | 0 | — |
| C | 40 | 2 | | | | |
| L | 30 | 2 | | **Vogais** | **480 (48%)** | |

Pontuação sugerida: `soma(pontos das letras) × fator_comprimento(n) × multiplicador_cascata`, com fator_comprimento = {3:1, 4:1.5, 5:2, 6:3, 7+:4}.

**Simulação [MEDIDO]** com esses pesos (Monte Carlo, 100k amostras):
| Dicionário | P(3 letras aleatórias = palavra) | P(4) | P(5) | P(linha aleatória de 10 contém ≥1 palavra) |
|---|---|---|---|---|
| VERO expandido completo (881k) | **21,2%** | 9,0% | 2,4% | **84,7%** |
| 120k mais comuns | 17,8% | 6,0% | 1,2% | 79,1% |
| 30k mais comuns | 13,6% | 3,2% | 0,5% | 69,5% |
| Só 4+ letras (881k) | — | — | — | 46,1% |
| 4+ letras + só 452 palavras de 3 letras comuns | — | — | — | 75,1% |

**Conclusão importante:** com mínimo de 3 letras e dicionário completo, **1 em cada 5 trincas aleatórias é palavra válida**, e o tabuleiro tende a se limpar sozinho, quase sem desafio. O dicionário completo tem 736 palavras de 3 letras, muitas obscuras ou siglas ("aca", "atm", "csi"). Recomendo uma **lista curada de palavras de 3 letras** (cerca de 300–450, tiradas das mais frequentes) e o dicionário amplo só para 4+ letras, além de pontuação baixa para 3 letras. O ajuste final deve vir de playtest.

---

## 3. Fontes de dicionário PT-BR

Arquivos baixados e analisados em 2026-11-11.

### 3.1 VERO (pt_BR Hunspell, LibreOffice): **RECOMENDADO como fonte principal**
- **Download direto** [VERIFICADO, HTTP 200]:
  - https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic (4,48 MB, 312.368 entradas-raiz, UTF-8 com BOM)
  - https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.aff (980 KB)
  - README/licença: https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_en.txt
  - Espelho em npm: pacote `dictionary-pt@4.0.0` (wooorm/dictionaries, `(LGPL-3.0 OR MPL-2.0)`), com `index.dic`/`index.aff` do mesmo tamanho. O antigo `dictionary-pt-br` está **deprecated** e manda usar `dictionary-pt` [VERIFICADO via npm].
  - O link oficial antigo `pt-br.libreoffice.org/.../VeroptBRV320AOC.oxt` retorna **404**, e o `cgit.freedesktop.org` retornou **503** no teste [VERIFICADO]. Use o espelho do GitHub.
- **Licença** [VERIFICADO no README e no .aff]: "GNU LGPLv3 **e** Mozilla Public License", na prática dupla licença. O wooorm declara `LGPL-3.0 OR MPL-2.0`. VERO 3.2, © 2006–2013 Raimundo Santos Moura.
- **Conteúdo**: raízes com flags de afixo. **Expandido**, gera plurais, femininos, diminutivos, aumentativos e **toda a conjugação verbal**. Ex.: "casa" e "casas" saem de `casar/ajkLMYÀÂ` (não existe entrada isolada "casa"; por isso a lista do pythonprobr precisou de remendo).
- **Tamanho após expansão [MEDIDO]** com `hunspell-reader`:
  - 10.505.652 formas brutas, das quais 7,7 M têm hífen (ênclises como "cantá-lo") ou ponto.
  - Sem maiúsculas (nomes próprios e siglas), sem hífen e normalizado sem acento: **2.571.007** formas únicas de 3–20 letras e **881.497** de 3–10 letras.
  - Distribuição 3–10 letras: 3:736, 4:4.644, 5:18.215, 6:47.515, 7:98.004, 8:167.632, 9:241.008, 10:303.743.
  - Contém casa, casas, mesa, mesas, cantou, falávamos (→falavamos), bonitas e peixe [VERIFICADO].
  - Ruído: algumas siglas e estrangeirismos em minúsculas (atm, csi, web, out, top, box), além de regionalismos e termos indígenas raros.
- **Compatível com repo MIT?** Sim, **desde que** o arquivo de dicionário derivado continue sob a licença dele. Escolher **MPL-2.0** (copyleft por arquivo: o código MIT do jogo não é afetado), manter o arquivo separado (ex.: `public/dict/`), incluir `LICENSE-dicionario.txt` com o texto da MPL-2.0 e o crédito ao VERO, e apontar para a fonte. *Não é parecer jurídico.*

### 3.2 fserb/pt-br
- Repo: https://github.com/fserb/pt-br, licença **MIT** (© 2021 Fernando Serboncini), último push em 2025-08 [VERIFICADO].
- Arquivos (download direto `https://raw.githubusercontent.com/fserb/pt-br/master/<arquivo>`):
  - `lexico`: 145.744 lemas (só formas base: "casa" sim, "casas" não) [MEDIDO]
  - `conjugações` (URL: `.../master/conjuga%C3%A7%C3%B5es`): 195.751 formas verbais
  - `icf`: 419.486 palavras **com flexões** e um escore de raridade (ICF, menor = mais comum; ex.: "de,3.02"). Inclui algumas grafias pt-PT ("zooelectricidade")
  - `listas/`: verbos (4.023), países, estados, municípios, "negativas"
- Prós: MIT e **escore de frequência** (útil para ranquear palavras comuns, montar a lista curada de 3 letras e dar dicas). Contras: o README diz "múltiplas fontes" sem detalhar, ou seja, **proveniência não documentada** [risco de licença NÃO VERIFICADO]. Não cobre todos os plurais e femininos ("mesas" não aparece em nenhum arquivo).

### 3.3 pythonprobr/palavras
- Repo: https://github.com/pythonprobr/palavras, licença **MPL-2.0**, último push em 2020-07 [VERIFICADO].
- Download: https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt (3,8 MB, **320.139** linhas).
- É o `pt_BR.dic` do LibreOffice **com as flags removidas, sem expansão**: há "casas" e "bonitas" (entradas próprias ou componentes de compostos), mas **não** "cantou" nem "falávamos". **Não serve sozinha** para um jogo que aceita flexões verbais.

### 3.4 hermitdave/FrequencyWords (pt_br)
- Repo: https://github.com/hermitdave/FrequencyWords. Código **MIT**, mas o **conteúdo é CC-BY-SA-4.0** (README) [VERIFICADO].
- Downloads: https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt_br/pt_br_50k.txt (50k), `.../pt_br_full.txt` (848.043 linhas, 9,9 MB) [MEDIDO]. Formato `palavra contagem`, derivado de legendas do OpenSubtitles 2018 (inclui erros de digitação, nomes e gírias).
- **Compatibilidade:** CC-BY-SA exige atribuição e *share-alike* para derivados. Dá para distribuir como arquivo de dados separado com atribuição, mas **prefiro evitar embutir**. Use, no máximo, em tempo de build para análise (como fiz para a frequência de letras).

### 3.5 Outras fontes
- **LanguageTool portuguese-pos-dict**: https://github.com/languagetool-org/portuguese-pos-dict, **LGPL-2.1** [VERIFICADO]. Tem Hunspell pt-BR próprio (Latin-1) e `pt_BR_wordlist.xml` (5,8 MB) e é mantido ativamente (2024). Pode servir para etiquetar classe gramatical e filtrar nomes próprios. Conteúdo do XML **[NÃO VERIFICADO]**.
- **wooorm/dictionaries** `dictionary-pt` (npm): o mesmo VERO, prático para baixar no build.

### 3.6 Expandir Hunspell sem binário nativo
- **`hunspell-reader`** (npm, **MIT**, v10.4.1, do projeto cspell, TypeScript puro) [VERIFICADO: rodei]. Comando:
  ```bash
  npx hunspell-reader@10.4.1 words -u -o expandido.txt pt_BR.dic
  ```
  Expandiu o VERO inteiro em **cerca de 17 s** no Mac (10,5 M linhas, 158 MB). Opções úteis: `-u` (únicas), `-l` (minúsculas, **mas** isso mistura siglas e nomes próprios; melhor filtrar maiúsculas depois), `-m` (profundidade).
- Alternativa em Python: `spylls` (port puro de Hunspell, v0.1.7 no PyPI) [existência VERIFICADA; capacidade de "unmunch" NÃO VERIFICADA]. `nspell` e `typo-js` só verificam palavras, não listam a expansão.
- **Pipeline recomendado** (script Node no repo, `scripts/build-dict.ts`, rodando em CI e **não** no browser):
  1. baixar `pt_BR.dic`/`.aff` (fixar commit) ou usar `dictionary-pt@4.0.0`;
  2. expandir com `hunspell-reader`;
  3. descartar linhas com maiúscula, hífen, apóstrofo, ponto ou dígito;
  4. normalizar: `toLowerCase()` → NFD → remover `\p{Mn}` → manter só `^[a-z]+$`;
  5. filtrar por comprimento: 4 a 10 (ou até o maior lado do tabuleiro), mais a lista curada de 3 letras;
  6. remover blocklist (seção 4) e ruído (siglas, estrangeirismos);
  7. ordenar, deduplicar, serializar (seção 5) e gravar `public/dict/ptbr.bin` + `LICENSE-dicionario.txt`.

---

## 4. Listas de palavrões / termos ofensivos PT-BR

| Lista | URL | Licença | Tamanho | Avaliação |
|---|---|---|---|---|
| LDNOOBW `pt` | https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/pt | **CC-BY-4.0** (exige atribuição) | 76 termos | Pequena, mistura PT-BR e pt-PT. Boa semente [VERIFICADO] |
| Kuyoku-san/Badwords | https://raw.githubusercontent.com/Kuyoku-san/Badwords/HEAD/badwords.txt | **MIT** | 563 linhas | Bloqueia demais: inclui "Argentino", "Baleia", "Barril", "Bobo", "BIOS". Precisa de curadoria manual [VERIFICADO] |
| Zeindelf/badwords | https://github.com/Zeindelf/badwords (lista em `src/Config/Filter.php`) | **MIT** | cerca de 300 termos | Embutida em PHP, precisa de extração [VERIFICADO] |
| spam-detection/badwords-pt-br | https://github.com/spam-detection/badwords-pt-br | **sem licença** | 150 expressões | **Não usar** (sem licença) [VERIFICADO] |
| ricardojosehlima/identifica_palavroes | https://github.com/ricardojosehlima/identifica_palavroes | GPL-3.0 | ? | **Evitar** (GPL, incompatível com o objetivo MIT) |

Recomendação: montar uma **blocklist própria** em `data/blocklist.txt` (MIT), com cerca de 150–300 raízes revisadas manualmente pelo time, usando LDNOOBW (com crédito CC-BY no README) e Kuyoku (MIT) como semente. Aplicar **depois da expansão**, pela raiz e pelas flexões (ex.: bloquear o lema e as formas que começam com ele, com uma lista de exceções para falsos positivos). Duas políticas possíveis: (a) remover do dicionário, e a palavra não limpa; ou (b) aceitar mas não exibir o texto ("palavra oculta"). A (a) é mais simples. Lembrete: a lista curada de 3 letras gerada por frequência trouxe termos sensíveis, então revisar à mão.

---

## 5. Estrutura de dados do dicionário no browser

Requisitos: lookup exato rápido (detectar palavras ao travar a peça), **prefixo** (opcional, para dica e fantasma), download pequeno, memória aceitável no celular.

**Medições [MEDIDO]** (lista de 3–10 letras, sem acento, 881.497 palavras; e top 120k):
| Formato | 881k palavras | 120k palavras |
|---|---|---|
| Texto puro, uma por linha | 8,5 MB | ~1,1 MB |
| Texto + gzip -9 | 2,05 MB | 471 KB |
| Texto + brotli -q11 | **1,31 MB** | 413 KB |
| `Set<string>` no V8 (heap) | **cerca de 45–54 MB**, construído em ~160 ms (Node, desktop) | cerca de 7 MB |
| Trie ingênua (nós) | 1.387.343 nós | 240k nós |
| **DAWG mínimo** (Daciuk) | **77.700 nós / 256.554 arestas → cerca de 0,77–1,0 MB** em `Uint32Array` (3–4 B/aresta), sem descompactar | 31k nós / 92k arestas → cerca de 0,3 MB |
| Bloom filter, 1% falso positivo | cerca de 1,05 MB (9,6 bits/palavra) | ~145 KB |
| Bloom filter, 0,1% | cerca de 1,6 MB | ~215 KB |

Análise:
- **Set de strings**: o mais simples. O download é bom com brotli, mas gasta cerca de 50 MB de RAM com 881k palavras, o que é arriscado em celular modesto. Com até cerca de 150k palavras, é ótimo.
- **DAWG empacotado em typed array**: cerca de 1 MB em memória e no disco, lookup O(comprimento) e **suporta prefixo**. Ideal para 300k–1M palavras. Gerar no build e carregar com `fetch` + `arrayBuffer`. O tamanho comprimido do binário **[NÃO MEDIDO]** deve ficar abaixo de 1 MB.
- **Bloom filter**: **não recomendado como estrutura única**, porque um falso positivo faz sumir uma "palavra" inexistente e quebra a confiança do jogador. Também não faz prefixo.
- **Front-coding / lista ordenada + busca binária** num único buffer: meio-termo simples (cerca de 3–4 MB de RAM para 881k), sem prefixo eficiente.

Bibliotecas JS [VERIFICADO via npm]:
- `dawg-lookup` 2.2.1 (MIT): DAWG compacto serializável. Boa candidata.
- `tiny-trie` 0.2.6 (MIT): Trie/DAWG com serialização em string base64 (pouco mantida).
- `mnemonist` 0.40.8 (MIT): Trie, TrieMap e outras estruturas (em memória, sem serialização compacta).
- `bloom-filters` 3.0.4 (MIT).
- `fflate` 0.8.3 (MIT): descompressão gzip/deflate no browser, caso o servidor não comprima.
- Alternativa sem dependência: escrever um DAWG próprio, com cerca de 150 linhas de TS (build Daciuk + serialização em `Uint32Array` com bits de letra, fim de palavra e último-irmão). Fácil de testar no Vitest.

GitHub Pages serve arquivos com gzip **[NÃO VERIFICADO se também serve brotli]**. O Service Worker da PWA deve cachear o binário do dicionário.

---

## 6. Referência técnica: SRS e 7-bag

Fontes: https://tetris.wiki/Super_Rotation_System , https://tetris.wiki/Random_Generator [VERIFICADO]

### 6.1 Super Rotation System (SRS)
- Estados de rotação: **0** (spawn), **R** (horário), **2** (180°), **L** (anti-horário).
- Todas as peças nascem **na horizontal**. I e O nascem centralizadas, e as de largura 3 ficam arredondadas à esquerda. J, L e T nascem com o lado plano para baixo.
- Ao girar, testam-se até 5 deslocamentos (*kicks*) em ordem, e o primeiro sem colisão vence. Se nenhum servir, a rotação falha.
- **Convenção da tabela: x positivo = direita, y positivo = PARA CIMA.** Num grid com y crescendo para baixo, **inverter o sinal de y**.

**J, L, S, T, Z**
| Transição | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| 0→R | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| R→0 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| R→2 | (0,0) | (+1,0) | (+1,-1) | (0,+2) | (+1,+2) |
| 2→R | (0,0) | (-1,0) | (-1,+1) | (0,-2) | (-1,-2) |
| 2→L | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |
| L→2 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| L→0 | (0,0) | (-1,0) | (-1,-1) | (0,+2) | (-1,+2) |
| 0→L | (0,0) | (+1,0) | (+1,+1) | (0,-2) | (+1,-2) |

**I**
| Transição | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| 0→R | (0,0) | (-2,0) | (+1,0) | (-2,-1) | (+1,+2) |
| R→0 | (0,0) | (+2,0) | (-1,0) | (+2,+1) | (-1,-2) |
| R→2 | (0,0) | (-1,0) | (+2,0) | (-1,+2) | (+2,-1) |
| 2→R | (0,0) | (+1,0) | (-2,0) | (+1,-2) | (-2,+1) |
| 2→L | (0,0) | (+2,0) | (-1,0) | (+2,+1) | (-1,-2) |
| L→2 | (0,0) | (-2,0) | (+1,0) | (-2,-1) | (+1,+2) |
| L→0 | (0,0) | (+1,0) | (-2,0) | (+1,-2) | (-2,+1) |
| 0→L | (0,0) | (-1,0) | (+2,0) | (-1,+2) | (+2,-1) |

- **O não tem kick.** Gira "sem sair do lugar". Se a rotação for implementada por centro, compensar o deslocamento.
- **Letras na peça:** cada célula da peça carrega sua letra e gira junto com ela (a letra fica sempre na vertical, sem rotacionar o glifo). Assim, girar muda a ordem de leitura, o que é uma decisão de design boa e intuitiva.

### 6.2 Randomizador 7-bag
- Embaralha as 7 peças (I, J, L, O, S, T, Z) com Fisher–Yates, entrega uma a uma e gera um novo saco quando acaba. As 5.040 permutações são equiprováveis.
- Garantias: no máximo **12 peças** entre dois I. Sequência de S/Z de no máximo **4**. Secas são limitadas.
- Variantes: 14-bag (dois sacos), saco de 63 (The New Tetris), randomizador por histórico do TGM.
- Usar PRNG com semente (ex.: mulberry32 ou sfc32) para replays, testes determinísticos e "desafio do dia". Usar **um saco para formas e outro, independente, para letras** (seção 1.7).

---

## Recomendações para o time

1. **Dicionário principal: VERO pt_BR (LibreOffice)**, baixado de `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic` e `.../pt_BR.aff` (fixar o SHA do commit) ou do npm `dictionary-pt@4.0.0`. Licença do arquivo derivado: **MPL-2.0** (opção da dupla LGPL-3/MPL), num arquivo separado com `LICENSE-dicionario.txt` e crédito. O código do jogo fica MIT.
2. **Expansão no build** com `hunspell-reader@10.4.1` (npm, MIT, puro JS, cerca de 17 s), num script `scripts/build-dict.ts` que roda no CI. Nada de binário nativo nem expansão no browser.
3. **Filtros**: descartar formas com maiúscula, hífen ou ponto, normalizar acentos (NFD + remover marcas), aceitar só `[a-z]`, comprimento de **4 a 10** (cerca de 880k formas) e **palavras de 3 letras só de uma lista curada** de cerca de 300–450 (as mais frequentes pelo `icf` do fserb/pt-br, MIT, revisadas à mão). Motivo medido: com todas as trincas, 21% das trincas aleatórias valem e cerca de 85% das linhas teriam palavra.
4. **Lista de frequência** para curadoria e dicas: `fserb/pt-br/icf` (MIT). Não embutir FrequencyWords (CC-BY-SA).
5. **Estrutura no browser: DAWG** gerado no build e serializado em `Uint32Array` (cerca de 1 MB para 880k palavras, com prefixo para o fantasma e as dicas). Como fallback mais simples para o MVP, `Set<string>` com lista brotli (1,3 MB de download, cerca de 50 MB de RAM), aceitável no desktop. Não usar bloom filter sozinho.
6. **Sorteio de letras**: **saco de 100 letras** com os pesos da tabela 2.3 (48% de vogais, sem K/W/Y, Q sempre com U), **1 a 3 vogais por peça** e ajuste adaptativo leve se o fundo do tabuleiro ficar com menos de 35% de vogais. Pontos por letra conforme a tabela 2.3 (base no Scrabble PT).
7. **Peças**: SRS com as tabelas acima (cuidado com o sinal de y) e 7-bag com PRNG semeado. As letras giram junto com as células e o glifo fica sempre em pé.
8. **Detecção**: ao travar, varrer linhas (esq→dir) e colunas (cima→baixo) e achar todas as subpalavras válidas. Limpar a **união** das células, aplicar gravidade, repetir a busca (cascata) e aumentar o multiplicador a cada passo. Mostrar a palavra encontrada por cerca de 1 s.
9. **Válvula anti-travamento** (escolher 1–2 no MVP): girar letras dentro da peça, reserva de 1 letra e "faxina" com custo. Coringa raro (cerca de 1 em 60 peças) como item.
10. **Blocklist própria** (`data/blocklist.txt`, MIT), semeada com LDNOOBW `pt` (CC-BY-4.0, com crédito) e Kuyoku-san/Badwords (MIT), **revisada à mão**, aplicada sobre raiz e flexões depois da expansão. Não usar listas sem licença ou GPL.
11. **Testes (Vitest)**: palavras-âncora obrigatórias no dicionário (casa, casas, mesa, cantou, falavamos, peixe...), ausência de termos da blocklist, determinismo do saco com semente e tabelas de kick do SRS.
12. **Identidade**: nome, arte e UI próprios. Não usar "Tetris", "Wordtris", "Letris" etc. na interface nem nos assets (marcas registradas). Termos genéricos ("blocos", "peças") são suficientes.

### Pendências não verificadas
- Conteúdo e licença real das fontes por trás de `fserb/pt-br` (README genérico).
- Tamanho comprimido do DAWG binário e se o GitHub Pages serve brotli.
- Capacidade de expansão do `spylls`. Conteúdo do `pt_BR_wordlist.xml` do LanguageTool.
- Fonte primária da tabela de frequência da UFRJ (só via Wikipédia).
