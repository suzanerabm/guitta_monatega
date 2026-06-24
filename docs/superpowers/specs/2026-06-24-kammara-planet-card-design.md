# Card de entrada do planeta (KammaraPlanetCard) — design

**Data:** 2026-06-24
**Status:** aprovado (mockup), a construir
**Substitui:** os portais simples (`KammaraWorldPortals`) na vitrine `/kammara`.

## Objetivo

Elevar os "cards de entrada" dos planetas — hoje simples demais — a um card
cinematic premium, usando o `KammaraCardSubsystemHorizontal` (variant C) como
referência visual, **sem o menu roleta**.

## Layout (estilo cinematic)

Card horizontal com imagem de fundo do planeta + moldura premium:

- **Frame**: borderRadius 32px, `border ${color}40` + `outline 2px solid ${color}`
  offset 6px + boxShadow forte (igual ao componente de referência).
- **Imagem de fundo**: a imagem do mundo (`bgImage`/getKammaraBg), cobrindo o
  card, com overlay escuro (gradiente `${darkColor}`) pra leitura.
- **Shimmer holográfico**: a faixa diagonal que varre o card (8s) — o
  `kpt-shimmer` do `KammaraPlanetTitle`.
- **Marca d'água**: o glifo do planeta (`worldCrestGlyph`) grande atrás, visível
  (não apagado demais).
- **Esquerda (texto)**:
  - label "PLANETA" (categoria)
  - nome do mundo, grande, com glow duplo
  - declarer (UM glifo só: linha — ⊙ — linha)
  - **texto do planeta** (vem de `getWorldSummary` — NÃO duplicar conteúdo),
    puro sobre a imagem (sem DSTextPanel), alinhado à esquerda, **largura menor
    que metade do card** (~40%) pra não invadir as badges.
- **Direita (badges)**: 4 badges empilhadas, cada uma label + valor. No mockup:
  Habitantes / Idioma / Clima / Energia. Os valores vêm dos dados do mundo
  (a definir a fonte — por ora props/dados; sem duplicar).
- **Footer padrão**: `⊹ ⊙ ⊹` (esquerda) + "Kammara" (direita), borderTop.

## Comportamento

- **Clique no card → abre o planeta**: chama `onSelect(worldId)` que o
  `KammaraClient` liga ao `setActiveFilter` (igual aos portais hoje). Sem rota.

## Dados (sem duplicar)

- nome: `getWorldName(id, locale)`
- texto: `getWorldSummary(id, locale)` (mesmo do planeta)
- cor/darkColor: `palettes[id].colors[0]` / `palettes[id].dark`
- imagem: `bgImage` (getKammaraBg)
- glifo: `worldCrestGlyph(id)`
- badges: label+valor por mundo (fonte a definir; passadas como prop por ora).

## Não duplicar

O texto e (idealmente) as badges vêm dos dados do mundo — não criar conteúdo
paralelo só pro card.

## Fora de escopo

- Rotas por mundo (continua client-side filter).
- O conteúdo/fonte definitiva das badges (começa com props; liga aos dados depois).
