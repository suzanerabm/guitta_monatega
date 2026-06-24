# Kammara Home (vitrine do universo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a `/kammara` numa vitrine do universo em 5 atos — capa do livro como hero, texto do Kammara mais largo, grid de portais dos mundos, saga/lore e eventos no rodapé.

**Architecture:** Reaproveita o máximo do que existe (HeroSection, KammaraSagaPoster, KammaraEvents, paletas, getWorldName, getKammaraBg). A única peça nova é o componente `KammaraWorldPortals` (grid de cartões clicáveis dos mundos). Tudo client-side: clicar num portal aciona o `setActiveFilter` que já desmonta/monta mundos. A reordenação acontece dentro do `KammaraClient` (a META SECTION).

**Tech Stack:** Next.js (App Router), Chakra UI v3, TypeScript, next-intl, Vitest + @testing-library/react.

---

## File Structure

- **Create** `src/components/KammaraWorldPortals/KammaraWorldPortals.tsx` — grid de portais dos mundos (cartões com cor+nome+imagem, clicáveis).
- **Create** `src/components/KammaraWorldPortals/index.ts` — barrel.
- **Create** `src/components/KammaraWorldPortals/KammaraWorldPortals.test.tsx` — testes.
- **Create** `src/components/KammaraWorldPortals/KammaraWorldPortals.stories.tsx` — story.
- **Modify** `src/app/[locale]/kammara/KammaraClient.tsx` — hero usa a capa do livro; texto do Kammara mais largo; renderiza `KammaraWorldPortals` na META SECTION; eventos já estão no rodapé (confirmar ordem).
- **Modify** `src/components/HeroSection/HeroSection.tsx` — aceitar uma imagem de fundo (`backgroundImage`) sem quebrar o uso atual (cor/gradient).

Convenção do projeto: `ComponentName/{ComponentName.tsx, ComponentName.stories.tsx, ComponentName.test.tsx, index.ts}`. Estilos só via tokens do theme; responsividade via props Chakra (`{ base, md, lg }`), nunca `@media`.

---

## Task 1: HeroSection aceita imagem de fundo (capa)

Hoje o `HeroSection` só aceita `background` (cor/gradient CSS). Para o hero usar a **capa do livro** como imagem, adicionamos uma prop opcional `backgroundImage` que, quando setada, é pintada como `background-image` cobrindo a seção (com o `background` de cor/gradient atrás, pro caso de a imagem ter transparência ou demorar a carregar).

**Files:**
- Modify: `src/components/HeroSection/HeroSection.tsx`
- Test: `src/components/HeroSection/HeroSection.test.tsx`

- [ ] **Step 1: Ler o componente atual**

Run: `sed -n '1,60p' src/components/HeroSection/HeroSection.tsx`
Expected: ver a interface de props (incluindo `background?: string`) e onde o `background` é aplicado no Box raiz.

- [ ] **Step 2: Escrever o teste que falha**

Adicionar ao final do `describe` em `src/components/HeroSection/HeroSection.test.tsx`:

```tsx
  it('applies a background image when backgroundImage is set', () => {
    const { container } = renderWithChakra(
      <HeroSection
        label="saga"
        title="Kammara"
        background="#000"
        backgroundImage="/imgs/books/kammara/saga-orf-v/cover.jpg"
      />,
    );
    // The cover image must appear somewhere in the rendered styles.
    expect(container.innerHTML).toContain(
      '/imgs/books/kammara/saga-orf-v/cover.jpg',
    );
  });
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/components/HeroSection -t "background image"`
Expected: FAIL — `backgroundImage` ainda não é prop / a URL não aparece no HTML.

- [ ] **Step 4: Implementar**

Em `src/components/HeroSection/HeroSection.tsx`:

1. Na interface de props, adicionar (logo após `background?: string`):

```tsx
  /** Optional cover/background image painted over the `background` color. */
  backgroundImage?: string;
```

2. Adicionar `backgroundImage` à desestruturação dos props da função.

3. No Box raiz que já recebe `background={background}`, adicionar as props de imagem condicionalmente. Exemplo (ajuste ao Box existente, mantendo o que já tem):

```tsx
      backgroundImage={backgroundImage ? `url(${backgroundImage})` : undefined}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
```

(O `background` de cor/gradient continua como fallback atrás da imagem.)

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/components/HeroSection`
Expected: PASS (incluindo o teste novo e os existentes).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/HeroSection/HeroSection.tsx src/components/HeroSection/HeroSection.test.tsx
git commit -m "feat(hero): HeroSection aceita backgroundImage (capa)"
```

---

## Task 2: Componente KammaraWorldPortals (grid de portais)

Grid de cartões clicáveis — um por mundo. Cada cartão mostra o nome do mundo sobre sua imagem de fundo, com a cor de accent do mundo na borda/sombra. Clicar chama `onSelect(worldId)`. O componente é "burro": recebe a lista pronta e um callback; quem liga ao `setActiveFilter` é o `KammaraClient`.

Responsividade: `gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }}`.

**Files:**
- Create: `src/components/KammaraWorldPortals/KammaraWorldPortals.tsx`
- Create: `src/components/KammaraWorldPortals/index.ts`
- Test: `src/components/KammaraWorldPortals/KammaraWorldPortals.test.tsx`

- [ ] **Step 1: Escrever o teste que falha**

Create `src/components/KammaraWorldPortals/KammaraWorldPortals.test.tsx`:

```tsx
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraWorldPortals, type WorldPortal } from './KammaraWorldPortals';

const portals: WorldPortal[] = [
  { id: 'orfv', name: 'ORF-V', color: '#cf568c', darkColor: '#1e0c48', image: '/imgs/a.jpg' },
  { id: 'eni4', name: 'ENI-4Δ', color: '#7fd4e0', darkColor: '#0a2a30', image: '/imgs/b.jpg' },
];

describe('KammaraWorldPortals', () => {
  it('renders one portal per world with its name', () => {
    renderWithChakra(<KammaraWorldPortals portals={portals} onSelect={() => {}} />);
    expect(screen.getByText('ORF-V')).toBeInTheDocument();
    expect(screen.getByText('ENI-4Δ')).toBeInTheDocument();
  });

  it('calls onSelect with the world id when a portal is clicked', () => {
    const onSelect = vi.fn();
    renderWithChakra(<KammaraWorldPortals portals={portals} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('ORF-V'));
    expect(onSelect).toHaveBeenCalledWith('orfv');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/components/KammaraWorldPortals`
Expected: FAIL — módulo `./KammaraWorldPortals` não existe.

- [ ] **Step 3: Implementar o componente**

Create `src/components/KammaraWorldPortals/KammaraWorldPortals.tsx`:

```tsx
'use client';
import { Box, Grid, Text, chakra } from '@chakra-ui/react';

export interface WorldPortal {
  /** World id used by the filter (e.g. 'orfv'). */
  id: string;
  /** Display name (e.g. 'ORF-V'). */
  name: string;
  /** Accent color of the world (palette.colors[0]). */
  color: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  /** Background image for the portal. */
  image?: string;
}

export interface KammaraWorldPortalsProps {
  /** One entry per world, already resolved (name/color/image). */
  portals: WorldPortal[];
  /** Called with the world id when a portal is clicked. */
  onSelect: (id: string) => void;
  'data-testid'?: string;
}

/**
 * KammaraWorldPortals — the heart of the universe landing: a grid of clickable
 * cards, one per world. Each card carries the world's own color + image, so the
 * grid reads as a "select a world" menu. Clicking calls `onSelect(id)` — the
 * parent wires that to the existing filter that mounts that world's section.
 */
export function KammaraWorldPortals({
  portals,
  onSelect,
  'data-testid': testId,
}: KammaraWorldPortalsProps) {
  return (
    <Grid
      data-testid={testId ?? 'kammara-world-portals'}
      gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }}
      gap={{ base: 'md', md: 'lg' }}
      width="100%"
    >
      {portals.map((p) => (
        <chakra.button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          data-testid={`world-portal-${p.id}`}
          position="relative"
          width="100%"
          aspectRatio="4 / 3"
          borderRadius="20px"
          overflow="hidden"
          cursor="pointer"
          textAlign="left"
          css={{
            background: p.image
              ? `linear-gradient(160deg, ${p.darkColor}cc, ${p.color}55), url(${p.image}) center/cover`
              : `linear-gradient(160deg, ${p.darkColor}, ${p.color})`,
            border: `1px solid ${p.color}55`,
            boxShadow: `0 12px 32px ${p.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: `0 20px 48px ${p.color}50`,
          }}
        >
          <Box position="absolute" left="1rem" bottom="1rem">
            <Text
              m={0}
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="heroTitle"
              color="textOverlayBright"
              css={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            >
              {p.name}
            </Text>
          </Box>
        </chakra.button>
      ))}
    </Grid>
  );
}
```

Create `src/components/KammaraWorldPortals/index.ts`:

```ts
export { KammaraWorldPortals } from './KammaraWorldPortals';
export type { KammaraWorldPortalsProps, WorldPortal } from './KammaraWorldPortals';
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/components/KammaraWorldPortals`
Expected: PASS (2 testes).

- [ ] **Step 5: Verificar token `textOverlayBright` e `heroTitle`**

Run: `grep -n "textOverlayBright\|heroTitle" src/theme/tokens.ts`
Expected: ambos existem. Se algum não existir, trocar por um token equivalente já presente (ex.: cor `white` e `letterSpacing="wide"`), sem inventar valor inline.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/KammaraWorldPortals
git commit -m "feat(portals): KammaraWorldPortals — grid de portais dos mundos"
```

---

## Task 3: Story do KammaraWorldPortals

**Files:**
- Create: `src/components/KammaraWorldPortals/KammaraWorldPortals.stories.tsx`

- [ ] **Step 1: Criar a story**

Create `src/components/KammaraWorldPortals/KammaraWorldPortals.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraWorldPortals } from './KammaraWorldPortals';
import { palettes } from '@/theme/palettes';

const meta: Meta<typeof KammaraWorldPortals> = {
  title: 'Kammara/KammaraWorldPortals',
  component: KammaraWorldPortals,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box bg="darkBg" p="xl">
        <Story />
      </Box>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof KammaraWorldPortals>;

export const Default: Story = {
  args: {
    onSelect: () => {},
    portals: [
      { id: 'orfv', name: 'ORF-V', color: palettes.orfv.colors[0], darkColor: palettes.orfv.dark },
      { id: 'triplec', name: 'TripleC', color: '#8ce8a8', darkColor: palettes.triplec.dark },
      { id: 'lunnp1', name: "LUNN'P1", color: palettes.lunnp1.colors[0], darkColor: palettes.lunnp1.dark },
      { id: 'eni4', name: 'ENI-4Δ', color: palettes.eni4.colors[0], darkColor: palettes.eni4.dark },
    ],
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/KammaraWorldPortals/KammaraWorldPortals.stories.tsx
git commit -m "docs(portals): story do KammaraWorldPortals"
```

---

## Task 4: Hero usa a capa do livro + texto do Kammara mais largo

No `KammaraClient`, o hero passa a usar a capa do livro como `backgroundImage`, e o bloco de texto do Kammara (na META SECTION) ganha mais largura. O texto NÃO é removido (decisão da Suzane) — só fica mais largo/respirado.

**Files:**
- Modify: `src/app/[locale]/kammara/KammaraClient.tsx`

- [ ] **Step 1: Localizar o uso do HeroSection**

Run: `grep -n "HeroSection\|kammaraHero\|panel\|DSMainCard\|maxW\|renderStory" "src/app/[locale]/kammara/KammaraClient.tsx" | head -30`
Expected: linha ~426 do `<HeroSection .../>`, e o ponto onde o texto/painel do Kammara é renderizado (DSMainCard com `renderStory` / `panelStory`).

- [ ] **Step 2: Adicionar a capa ao hero**

No `<HeroSection>` (≈ linha 426), adicionar a prop:

```tsx
        backgroundImage="/imgs/books/kammara/saga-orf-v/cover.jpg"
```

Mantém `background`, `textColor`, `labelColor`, `label/title/description` e o filho `<KammaraHeroStars />` como estão.

- [ ] **Step 3: Deixar o texto do Kammara mais largo**

Localizar o container do texto/painel do Kammara na META SECTION (o Box/DSMainCard que envolve `panelStory`/`renderStory` ou `sectionText`). Onde houver um `maxW`/`maxWidth` limitando a largura desse texto, aumentar um passo (ex.: de `maxW="720px"` para `maxW="960px"`, ou de `md` para `lg`). Se não houver `maxW`, adicionar largura confortável ao bloco de texto:

```tsx
        maxW={{ base: '100%', md: '960px' }}
```

Não alterar o conteúdo do texto — só a largura/respiro. (O texto vem do i18n `kammara.section.text` / `panel.story`.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Build (a página é o que importa)**

Run: `npx next build`
Expected: "Compiled successfully" e a rota `/[locale]/kammara` listada.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/kammara/KammaraClient.tsx"
git commit -m "feat(kammara): hero usa a capa do livro + texto do universo mais largo"
```

---

## Task 5: Renderizar o grid de portais na META SECTION

Montar a lista de portais a partir dos `publishedWorlds` (id, nome via `getWorldName`/`WORLD_NAMES`, cor via paleta, imagem via `bgImage`) e renderizar `KammaraWorldPortals` dentro da META SECTION, **antes** do bloco de personagens/saga, logo após o texto de apresentação. Clicar chama `setActiveFilter(id)` (o mesmo que o FilterBar já usa), o que monta a seção daquele mundo.

**Files:**
- Modify: `src/app/[locale]/kammara/KammaraClient.tsx`

- [ ] **Step 1: Importar o componente**

No topo do arquivo, junto aos outros imports de componentes:

```tsx
import { KammaraWorldPortals } from '@/components/KammaraWorldPortals';
```

- [ ] **Step 2: Montar a lista de portais**

Onde `publishedWorlds` e `filters` já são calculados (≈ linha 389-400), adicionar logo abaixo:

```tsx
  // Portais do grid: um por mundo publicado, com nome/cor/imagem resolvidos.
  const worldPortals = publishedWorlds.map((w) => ({
    id: w.id,
    name: getWorldName(w.id, locale) || WORLD_NAMES[w.id as WorldId],
    color: palettes[w.id as PaletteName].colors[0],
    darkColor: palettes[w.id as PaletteName].dark,
    image: w.bgImage ?? undefined,
  }));
```

(Confirmar que `getWorldName`, `WORLD_NAMES`, `palettes`, `PaletteName`, `WorldId` e `w.bgImage` já estão disponíveis no arquivo — todos já são usados na construção de `filters`. Se `triplec` usar a cor verde custom como em outras telas, manter `colors[0]` aqui mesmo; o ajuste fino de cor pode vir depois.)

- [ ] **Step 3: Renderizar o grid na META SECTION**

Dentro da `CreatureSection id="kammara"`, logo após o bloco de texto/apresentação do Kammara e **antes** da galeria de personagens, inserir:

```tsx
        <Box width="100%" my={{ base: '2xl', lg: '4xl' }} px={{ base: '25px', md: '2rem', xl: '3rem' }}>
          <KammaraWorldPortals portals={worldPortals} onSelect={setActiveFilter} />
        </Box>
```

(Se `Box` ainda não estiver importado do `@chakra-ui/react` neste arquivo, ele já está — é usado em vários pontos.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Build**

Run: `npx next build`
Expected: "Compiled successfully", rota `/[locale]/kammara` presente.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/kammara/KammaraClient.tsx"
git commit -m "feat(kammara): grid de portais dos mundos na vitrine do universo"
```

---

## Task 6: Confirmar a ordem dos atos (eventos no rodapé) + revisão visual

Garantir a ordem final na META SECTION: hero → texto → **grid de portais** → saga/lore → eventos/cronograma por último. Os eventos (`KammaraEvents`) e o heatmap de progresso já estão no rodapé da META SECTION; só confirmar que o grid de portais ficou **acima** deles e abaixo do texto.

**Files:**
- Modify: `src/app/[locale]/kammara/KammaraClient.tsx` (se a ordem precisar de ajuste)

- [ ] **Step 1: Inspecionar a ordem atual**

Run: `grep -n "KammaraWorldPortals\|KammaraSagaPoster\|KammaraCharacterGallery\|KammaraEvents\|KammaraProgressHeatmap\|renderStory\|panelStory" "src/app/[locale]/kammara/KammaraClient.tsx"`
Expected: ver a sequência. Alvo: texto/panel → KammaraWorldPortals → (saga/personagens) → KammaraEvents → KammaraProgressHeatmap.

- [ ] **Step 2: Reordenar se necessário**

Se o `KammaraWorldPortals` não estiver entre o texto e o resto, mover o bloco `<Box>…<KammaraWorldPortals/></Box>` para a posição correta (logo após o texto de apresentação). Não mexer no conteúdo de eventos/heatmap — eles já estão por último.

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npx next build`
Expected: exit 0 e "Compiled successfully".

- [ ] **Step 4: Rodar a suíte dos componentes tocados**

Run: `npx vitest run src/components/HeroSection src/components/KammaraWorldPortals`
Expected: PASS. (Testes pré-existentes quebrados não relacionados — ex.: FilterBar `ResizeObserver`, SceneStrip arrows — podem permanecer; não são regressão deste plano.)

- [ ] **Step 5: Commit (se houve reordenação)**

```bash
git add "src/app/[locale]/kammara/KammaraClient.tsx"
git commit -m "chore(kammara): ordem final dos atos da vitrine (eventos no rodapé)"
```

- [ ] **Step 6: Push de tudo**

```bash
git push
```

---

## Self-Review (cobertura do spec)

- **Ato 1 — Hero = capa do livro:** Task 1 (prop `backgroundImage`) + Task 4 (usar `cover.jpg`). ✅
- **Ato 2 — Texto do Kammara mantido e mais largo:** Task 4 step 3. ✅
- **Ato 3 — Grid de portais:** Tasks 2, 3, 5. ✅
- **Ato 4 — Saga/lore:** já existe (`KammaraSagaPoster`); Task 6 confirma posição. ✅
- **Ato 5 — Eventos no rodapé:** já estão no rodapé; Task 6 confirma ordem. ✅
- **Reaproveitamento:** HeroSection, paletas, getWorldName, getKammaraBg, setActiveFilter — todos reusados. ✅
- **Fora de escopo (não tocar):** home raiz `/`, tela cheia mobile, modal mobile, redesenho dos eventos. ✅

## Notas

- **Sem rotas novas por mundo.** Os portais usam o `setActiveFilter` existente (client-side), que desmonta/monta a seção do mundo — preservando o trabalho de performance (FASE 1/2). O FilterBar já dá o scroll suave até a seção ativa.
- **Visual premium depois.** Este plano entrega a estrutura funcional. Polimento fino (animações, glifos kalún nos portais, tratamento da capa) pode vir numa rodada visual seguinte.
