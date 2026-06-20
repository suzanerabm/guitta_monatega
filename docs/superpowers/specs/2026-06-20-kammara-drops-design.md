# Kammara Drops — strip de small clips

**Data:** 2026-06-20
**Status:** aprovado, pronto pra implementação

## Objetivo

Uma seção nova **por planeta** ("Drops") com um strip horizontal de
**small clips** (vídeos curtos 16:9), em cards super premium no estilo do
Kammara. Tira a necessidade de misturar vídeo nas cenas — vídeo ganha casa
própria.

## Decisões (do brainstorm)

- **Onde**: seção própria dentro de cada planeta (junto de personagens /
  cenas / subsistemas), só quando o planeta tem drops.
- **Formato**: cada vídeo é um **card completo** 16:9 (não vídeo solto).
- **Card** (aprovado no editor visual):
  - Fundo: degradê uniforme na cor escura do planeta
    `linear-gradient(160deg, ${dark}cc 0%, ${mid}cc 50%, ${dark}cc 100%)`
    (sem mancha clara no meio).
  - Moldura: `border 1px ${color}40` + `outline 2px ${color}` offset 5px +
    boxShadow glow (mesmo dos cards). `borderRadius 28px`.
  - **Header**: breadcrumb kalún (`—⊷ ⊙ ⊶—`) à esquerda + nome do mundo
    (uppercase, accent) à direita; borda inferior fina. Glifos kalún de
    marca-d'água VISÍVEIS atrás do header (~12% alpha).
  - **Vídeo**: `aspect-ratio 16/9`, margem **2rem laterais** / ~1.1rem
    topo-baixo (respiro igual nos 4 lados), `borderRadius 14px`, borda fina
    + sombra. Loop, muted, autoplay, playsInline. webm preferido + mp4.
  - **Footer**: legenda no **estilo do subtítulo do DSTextPanel**
    (`0.65rem`, weight 600, `letterSpacing 0.2em`, uppercase, accent) +
    glifo `⊹ ⊙ ⊹` à direita. Marca-d'água sutil no footer.
  - **Hover**: `translateY(-6px) scale(1.02)` + glow maior + botão ▶ aparece.
  - **Entrada**: fade + slide escalonado (stagger por índice), respeitando
    `prefers-reduced-motion`.
- **Strip**: setas no desktop + swipe no mobile (reusa o mecanismo do
  HorizontalCardStrip ou o padrão dos strips), com máscara de fade nas pontas.
- **Clique**: abre no **mesmo ModalKammara** (vídeo grande, controles, sem
  zoom) — reusa o sistema de modal que já registra `videos[]`.

## Componente: KammaraDropsStrip

Local: `src/components/KammaraDropsStrip/`
Arquivos: `KammaraDropsStrip.tsx`, `.stories.tsx`, `.test.tsx`, `index.ts`

### Interface

```ts
export interface KammaraDrop {
  /** Video src (.mp4). The .webm sibling is offered automatically. */
  video: string;
  /** Poster image (shown while the video loads). */
  poster: string;
  /** Caption (footer label). */
  label: string;
}

export interface KammaraDropsStripProps {
  /** Drops to show. */
  drops: KammaraDrop[];
  /** World display name shown in each card header (e.g. "ORF-V"). */
  worldName: string;
  /** Crest glyph of the world (breadcrumb + watermark). */
  crestGlyph: string;
  /** Accent color (palette.colors[0] of the world). */
  color: string;
  /** Mid color for the card gradient. */
  midColor?: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  /** Section title (e.g. "Drops"). */
  sectionTitle?: string;
  'data-testid'?: string;
}
```

### Comportamento

- Registra a galeria do modal só com os drops (`registerGallery` com
  `images=posters`, `labels`, `videos`), e `handleClick(i)` abre o
  `openKammaraGallery` no índice — igual SceneStrip/Collage.
- Cada card renderiza header + vídeo (autoplay/loop/muted) + footer.
- Tokens do tema para cores/spacing; sem hex hardcoded além dos repassados
  por prop. `@media` só para o toggle de setas (exceção sancionada).

## Dados

Novo `drops` por mundo no `_worldData.ts`:
- Interface `WorldDrop { video, poster, label: Bilingual<string> }`.
- `getWorldDrops(worldId, locale)` → `{ video, poster, label }[]`.
- Default inicial:
  - **ORF-V**: Lüp'Nül Fest (`/imgs/kammara/orfv/_videos/festa_orfv.mp4`,
    poster `festa_orfv_poster.jpg`).
  - **malloc**: running mesh
    (`/imgs/kammara/triplec/malloc/_videos/malloc_runnnin_mesh.mp4` — gerar
    poster).

## Integração

No `KammaraClient` (`WorldSection`), adicionar a seção Drops após a galeria
de personagens (ou onde fizer sentido), só quando `drops.length > 0`,
passando worldName/crestGlyph/cores do mundo.

## Limpeza relacionada

- Remover o vídeo Lüp'Nül das **cenas** do ORF-V (`orfv_scenes.json`) — ele
  migra pro Drops. A funcionalidade vídeo-na-cena (SceneStrip / Collage /
  Modal) **permanece** no código pra uso pontual.

## Testes

- Renderiza N cards (um por drop), com label e worldName.
- Cada card tem um `<video>` com a source mp4 (e webm derivada).
- Clique chama o modal (mock do useModal / openKammaraGallery).

## Storybook

`KammaraDropsStrip.stories.tsx` — story Default (ORF-V) + outra cor (malloc),
com decorator de fundo escuro.

## Fora de escopo

- Vídeos verticais 9:16 (escolhido 16:9).
- Seção geral de vídeos do Kammara (é por planeta).
