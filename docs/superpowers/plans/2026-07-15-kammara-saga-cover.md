# Kammara Saga EPUB Cover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar `public/imgs/kammara/capa_kammara_saga.jpg` (1600×2560, JPG RGB) — capa EPUB — a partir de uma derivação do componente `KammaraSagaPoster`.

**Architecture:** Um componente derivado `KammaraSagaPosterCover` envolve `KammaraSagaPoster` numa moldura 1:1,6 (reuso, sem duplicar). Uma prop `frozen` no componente original desliga o pulse (moldura no pico do glow). Uma rota bare `src/app/_export/cover/page.tsx` (fora de `[locale]`, sem Header/Footer) renderiza a capa. Um script `scripts/export-cover.ts` usa Playwright para screenshot 1600×2560 e `sharp` para converter em JPG RGB.

**Tech Stack:** Next.js (App Router), React, Chakra UI, Playwright, sharp, tsx.

## Global Constraints

- **Styling no theme:** proibido hex/rgba/fontWeight hardcoded em componentes. Usar tokens de `src/theme/`. (Exceção do plano: o script `export-cover.ts` NÃO é componente — valores literais nele são OK.)
- **Responsividade:** sem `@media` manual em componentes; usar props responsive do Chakra. (A capa é render de tamanho fixo, então não precisa de responsive.)
- **Estrutura de componente:** pasta `ComponentName/{ComponentName.tsx, .stories.tsx, .test.tsx, index.ts}`.
- **Reuso:** `KammaraSagaPosterCover` DEVE reusar `KammaraSagaPoster` — não copiar a composição.
- **Locale default:** `pt`. Mas a rota de export é bare (`/_export/cover`, sem locale).
- **Entregável:** JPG, RGB, 1600×2560, qualidade 92, em `public/imgs/kammara/capa_kammara_saga.jpg`.

---

### Task 1: Prop `frozen` no `KammaraSagaPoster`

**Files:**
- Modify: `src/components/KammaraSagaPoster/KammaraSagaPoster.tsx` (interface + boxShadow/animation da moldura, ~linhas 34-54 e 118-142)
- Test: `src/components/KammaraSagaPoster/KammaraSagaPoster.test.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: `KammaraSagaPosterProps` ganha campo opcional `frozen?: boolean` (default `false`). Quando `true`, a moldura usa boxShadow estático no pico do glow em vez de `animation: ksp-pulse`.

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao fim de `KammaraSagaPoster.test.tsx` (dentro do describe existente; reusar o helper `renderWithChakra`/padrão já presente no arquivo — checar como os outros testes renderizam):

```tsx
it('freezes the frame glow when frozen is set (no pulse animation)', () => {
  const { getByTestId } = renderWithChakra(
    <KammaraSagaPoster background="/bg.jpg" frozen data-testid="poster" />,
  );
  const frame = getByTestId('poster');
  // Congelado: sem a animação de pulse na moldura.
  expect(frame.style.animation || '').not.toContain('ksp-pulse');
});
```

Se o arquivo de teste não tiver um helper de render, seguir exatamente o padrão do `FairyDust.test.tsx` (envolver em `<ChakraProvider value={defaultSystem}>`). Verificar o topo do arquivo antes de escrever.

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/KammaraSagaPoster/KammaraSagaPoster.test.tsx`
Expected: FAIL — o `frozen` ainda não existe, a moldura sempre tem `animation` com `ksp-pulse`.

- [ ] **Step 3: Implementar a prop `frozen`**

Em `KammaraSagaPoster.tsx`:

1. Adicionar à interface `KammaraSagaPosterProps` (perto de `darkColor`):

```tsx
  /** Congela o glow da moldura no pico (sem pulse). Para export estático. */
  frozen?: boolean;
```

2. Adicionar `frozen = false` à desestruturação dos props (junto de `darkColor`).

3. No `css` do `<Box>` raiz (hoje linhas ~127-135), trocar o bloco de animação. O boxShadow de pico é o do keyframe em 50%. Substituir:

```tsx
        boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 0 1px ${accent}55, 0 0 50px ${accent}33`,
        animation: 'ksp-pulse 5s ease-in-out infinite',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
```

por:

```tsx
        boxShadow: frozen
          ? `0 30px 80px rgba(0,0,0,.6), 0 0 0 1px ${accent}, 0 0 70px color-mix(in srgb, ${accent} 45%, transparent)`
          : `0 30px 80px rgba(0,0,0,.6), 0 0 0 1px ${accent}55, 0 0 50px ${accent}33`,
        animation: frozen ? 'none' : 'ksp-pulse 5s ease-in-out infinite',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
```

(O boxShadow congelado replica o estado `50%` do keyframe `ksp-pulse` — não é um valor visual novo, é a promoção do pico já definido no `<style>`.)

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/KammaraSagaPoster/KammaraSagaPoster.test.tsx`
Expected: PASS (todos os testes do arquivo, incluindo os antigos).

- [ ] **Step 5: Commit**

```bash
git add src/components/KammaraSagaPoster/
git commit -m "feat(kammara): prop frozen no KammaraSagaPoster (glow estático p/ export)"
```

---

### Task 2: Componente `KammaraSagaPosterCover`

**Files:**
- Create: `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.tsx`
- Create: `src/components/KammaraSagaPosterCover/index.ts`
- Create: `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.stories.tsx`
- Test: `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.test.tsx`

**Interfaces:**
- Consumes: `KammaraSagaPoster` + `KammaraSagaPosterProps` de Task 1 (incl. `frozen`).
- Produces: `KammaraSagaPosterCover(props: KammaraSagaPosterCoverProps)`. `KammaraSagaPosterCoverProps = KammaraSagaPosterProps` (mesmos props; o cover só muda a moldura). Renderiza um container com `aspectRatio: 1000 / 1600` que contém o poster preenchendo 100%. `data-testid` default `"kammara-saga-poster-cover"`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { KammaraSagaPosterCover } from './KammaraSagaPosterCover';

function renderWithChakra(ui: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
}

describe('KammaraSagaPosterCover', () => {
  it('renders the inner poster', () => {
    const { getByTestId } = renderWithChakra(
      <KammaraSagaPosterCover background="/bg.jpg" />,
    );
    // O poster interno tem seu próprio testid.
    expect(getByTestId('kammara-saga-poster')).toBeInTheDocument();
  });

  it('wraps the poster in a 1:1.6 frame', () => {
    const { getByTestId } = renderWithChakra(
      <KammaraSagaPosterCover background="/bg.jpg" />,
    );
    const cover = getByTestId('kammara-saga-poster-cover');
    expect(cover.style.aspectRatio.replace(/\s/g, '')).toBe('1000/1600');
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar o componente**

Criar `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.tsx`:

```tsx
'use client';
import { Box } from '@chakra-ui/react';
import { KammaraSagaPoster, type KammaraSagaPosterProps } from '@/components/KammaraSagaPoster';

export type KammaraSagaPosterCoverProps = KammaraSagaPosterProps;

/**
 * KammaraSagaPosterCover — variante 1:1,6 (capa de EPUB) do KammaraSagaPoster.
 *
 * Reusa o poster inteiro; só troca a moldura de 2:3 para 1000/1600 (mais alta).
 * Os heróis mantêm tamanho — o espaço vertical extra vira respiro no topo.
 * O poster interno preenche 100% do container do cover.
 */
export function KammaraSagaPosterCover({
  'data-testid': testId,
  frozen = true,
  ...posterProps
}: KammaraSagaPosterCoverProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-saga-poster-cover'}
      position="relative"
      width="100%"
      css={{ aspectRatio: '1000 / 1600' }}
    >
      <Box position="absolute" inset={0} css={{ '& > *': { maxWidth: 'none', height: '100%' } }}>
        <KammaraSagaPoster frozen={frozen} {...posterProps} />
      </Box>
    </Box>
  );
}
```

Nota: o `KammaraSagaPoster` tem `maxW="420px"` e `aspectRatio` próprio. Para preencher a moldura 1:1,6, o wrapper força `height: 100%` e neutraliza o `maxW`. Se na renderização o poster não cobrir toda a altura (por causa do seu próprio aspectRatio 2:3), ajustar o wrapper interno para `width: 100%` e deixar o poster centralizar — validar visualmente na Task 4 e ajustar `bottom/height` de heróis via prop se algum estourar. NÃO editar o `KammaraSagaPoster` para isso; passar override `heroes`/`insets` pela rota de export (Task 3) se necessário.

Criar `src/components/KammaraSagaPosterCover/index.ts`:

```ts
export { KammaraSagaPosterCover } from './KammaraSagaPosterCover';
export type { KammaraSagaPosterCoverProps } from './KammaraSagaPosterCover';
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.test.tsx`
Expected: PASS.

- [ ] **Step 5: Criar a story**

Criar `src/components/KammaraSagaPosterCover/KammaraSagaPosterCover.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraSagaPosterCover } from './KammaraSagaPosterCover';

const meta: Meta<typeof KammaraSagaPosterCover> = {
  title: 'Kammara/KammaraSagaPosterCover',
  component: KammaraSagaPosterCover,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box width="400px" maxW="90vw" bg="darkBg" p="lg">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraSagaPosterCover>;

export const Default: Story = {
  args: { background: '/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg' },
};
```

- [ ] **Step 6: Commit**

```bash
git add src/components/KammaraSagaPosterCover/
git commit -m "feat(kammara): KammaraSagaPosterCover (variante 1:1,6 p/ capa EPUB)"
```

---

### Task 3: Rota de export `/_export/cover`

**Files:**
- Create: `src/app/_export/cover/page.tsx`

**Interfaces:**
- Consumes: `KammaraSagaPosterCover` de Task 2.
- Produces: rota `http://localhost:3000/_export/cover` que renderiza SÓ a capa, num container de 1000×1600 px, fundo escuro, sem Header/Footer (fora de `[locale]`). Herda `Providers` (Chakra + fontes) do root `layout.tsx`.

- [ ] **Step 1: Criar a página**

Criar `src/app/_export/cover/page.tsx`:

```tsx
import { Box } from '@chakra-ui/react';
import { KammaraSagaPosterCover } from '@/components/KammaraSagaPosterCover';

/**
 * Rota de export (não faz parte do site). Renderiza a capa da saga num
 * container de tamanho fixo 1000×1600 para o script de screenshot capturar
 * em 1600×2560 (deviceScaleFactor 1.6). Sem chrome: está fora de [locale].
 */
export default function CoverExportPage() {
  return (
    <Box
      css={{
        width: '1000px',
        height: '1600px',
        margin: 0,
        background: '#0a0a12',
        overflow: 'hidden',
      }}
    >
      <Box css={{ width: '1000px', height: '1600px' }} data-export-target="cover">
        <KammaraSagaPosterCover background="/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg" />
      </Box>
    </Box>
  );
}
```

(O `#0a0a12` inline é aceitável: rota de export não é componente reutilizável — é um alvo de screenshot descartável. Não vaza pro theme.)

- [ ] **Step 2: Verificar que a rota renderiza**

Subir o dev server (se não estiver rodando): `npm run dev` num terminal separado.
Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_export/cover`
Expected: `200`.

- [ ] **Step 3: Commit**

```bash
git add src/app/_export/cover/
git commit -m "feat(kammara): rota /_export/cover p/ screenshot da capa"
```

---

### Task 4: Script `export-cover.ts` (screenshot + JPG)

**Files:**
- Create: `scripts/export-cover.ts`
- Modify: `package.json` (adicionar script `export-cover`)

**Interfaces:**
- Consumes: rota `/_export/cover` de Task 3; usa `@playwright/test` (chromium) e `sharp`.
- Produces: `public/imgs/kammara/capa_kammara_saga.jpg` (1600×2560, JPG RGB q92). Comando `npm run export-cover`.

- [ ] **Step 1: Escrever o script**

Criar `scripts/export-cover.ts`:

```ts
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const URL = process.env.EXPORT_URL ?? 'http://localhost:3000/_export/cover';
const OUT = path.resolve('public/imgs/kammara/capa_kammara_saga.jpg');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1000, height: 1600 },
    deviceScaleFactor: 1.6, // 1000×1600 → 1600×2560
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Garantir que todas as <img> (fundo, heróis, discos) carregaram.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
            }),
      ),
    );
  });

  const target = page.locator('[data-export-target="cover"]');
  const png = await target.screenshot({ type: 'png' });
  await browser.close();

  await mkdir(path.dirname(OUT), { recursive: true });
  await sharp(png)
    .flatten({ background: '#0a0a12' }) // sem alpha → RGB
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(OUT);

  const meta = await sharp(OUT).metadata();
  console.log(`✓ ${OUT}`);
  console.log(`  ${meta.width}×${meta.height} ${meta.format} space=${meta.space}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Adicionar o script ao package.json**

Em `package.json`, no bloco `scripts`, adicionar:

```json
    "export-cover": "tsx scripts/export-cover.ts",
```

- [ ] **Step 3: Rodar o export (com dev server no ar)**

Garantir `npm run dev` rodando. Então:
Run: `npm run export-cover`
Expected (saída de exemplo):
```
✓ /Users/.../public/imgs/kammara/capa_kammara_saga.jpg
  1600×2560 jpeg space=srgb
```

- [ ] **Step 4: Verificar o arquivo end-to-end**

Run: `npx sharp -i public/imgs/kammara/capa_kammara_saga.jpg --metadata 2>/dev/null || node -e "require('sharp')('public/imgs/kammara/capa_kammara_saga.jpg').metadata().then(m=>console.log(m.width,m.height,m.format,m.space))"`
Expected: `1600 2560 jpeg srgb`

Abrir a imagem e conferir visualmente: capa completa, heróis não cortados na base, título "KAMMARA" legível, glow da moldura visível e estático. Se algum herói estourar a base, ajustar via override `heroes` na rota de export (Task 3) — reduzir `bottom`/`height` do herói afetado — e re-rodar. NÃO editar o `KammaraSagaPoster` original.

- [ ] **Step 5: Commit**

```bash
git add scripts/export-cover.ts package.json public/imgs/kammara/capa_kammara_saga.jpg
git commit -m "feat(kammara): script export-cover + capa EPUB 1600x2560 gerada"
```

---

## Notas de verificação final

- A imagem final DEVE ser 1600×2560, jpeg, srgb (Task 4 Step 4).
- O `KammaraSagaPoster` de produção NÃO muda de comportamento com `frozen` default `false` (Task 1).
- `npx vitest run` (suite completa) deve passar após todas as tasks.
- `npm run lint` deve passar (o script não é componente, mas segue ESLint do projeto).
