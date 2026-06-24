# /kammara como vitrine do universo — design

**Data:** 2026-06-21
**Status:** estrutura aprovada (visual a detalhar na implementação)
**Página:** `/kammara` (a raiz `/` continua como guarda-chuva separado)

## Objetivo

A `/kammara` virou a porta de entrada do universo. Repensá-la como uma
**landing cinematográfica — pitch de game / página de filme**: a pessoa rola e
o universo se revela em atos. Vender pelo **encantamento** primeiro (sentir o
universo antes de explicá-lo), apresentar os mundos pela cor/clima de cada um,
e deixar eventos/cronograma por último.

Princípio de tom: cada mundo tem alma própria (a Suzane conseguiu passar o
clima único de cada um). A página deve preservar e vender essa unicidade.

## Estrutura (5 atos, scroll de cima pra baixo)

1. **Hero — a capa do livro** (AJUSTE 2026-06-24). Em vez de vídeo full-screen,
   o hero usa a **capa do livro** (`/imgs/books/kammara/saga-orf-v/cover.jpg`)
   como imagem principal — posiciona o Kammara como uma obra/saga já no primeiro
   olhar. O nome KAMMARA e o clima saem da própria capa. (A ideia de vídeo loop
   foi descartada a pedido da Suzane.)

2. **O texto do Kammara — MANTER** (AJUSTE 2026-06-24). NÃO virar uma logline
   curta: o texto de apresentação do universo é importante e fica. O ajuste é
   **deixá-lo mais largo** (mais respiro/largura na coluna), com bom destaque.
   Fonte do texto: `kammara.section.text` e/ou `kammara.section.panel.story` no
   i18n (pt/en) — já existe, é o "Kammara — um universo onde memória é matéria…".

3. **Os mundos — grid de portais** (o coração). Cada mundo é um cartão grande
   com sua cor/clima/imagem de fundo, todos lado a lado, estilo *menu de
   seleção de mundos* de game. Clicar num cartão leva à página daquele mundo
   (a que já foi otimizada na FASE 1/2 de performance). Mundos: ORF-V, TripleC,
   LUNNP1, eni4, z1, gotto (publicados).

4. **Saga / lore** — o `KammaraSagaPoster` + livros que já existem. Posiciona o
   Kammara como uma obra grande (história), não só personagens soltos.

5. **Eventos & cronograma** — desce para o rodapé do universo. Reaproveita o
   `KammaraEvents` atual, só reposicionado. O **visual dos eventos será
   repensado numa conversa futura** — agora é só mover pro final.

## Decisões já tomadas (visual companion)

- Hero: ~~A — loop cinematográfico full-screen~~ → **REVISADO: a capa do livro**
  (`saga-orf-v/cover.jpg`) como imagem do hero. Posiciona como obra/saga.
- Texto do Kammara: **MANTER** (não virar logline curta), só deixar mais largo.
- Mundos: **A — grid de portais** (vs. faixas full-width / carrossel).
- Logline: **uma frase só** (escolha do agente, sem preferência forte da Suzane).

## Reaproveitamento (o que já existe)

- `HeroSection` — base do hero (adaptar para vídeo full-screen).
- `KammaraSagaPoster`, livros, `KammaraEvents` — já prontos, só reposicionar.
- Páginas de mundo + desmonte/lazy/cache de performance — intactos; o grid de
  portais leva a elas.
- Paletas por mundo (`src/theme/palettes.ts`) — fonte das cores dos portais.

## Fora de escopo (backlog — NÃO agora)

- Repensar a **home raiz `/`** (o guarda-chuva guitta monatega).
- **Tela cheia no mobile** para vídeo e imagem; repensar o **modal** no mobile.
- Redesenhar o **visual dos eventos** (só reposicionar por ora).
- Sistema de personagem que pertence a dois mundos (decidido: manter como está).

## Próximo passo

Detalhar o visual de cada ato na implementação, com a identidade premium do
Kammara (paletas, vídeos, glifos kalún). A estrutura acima é o mapa.
