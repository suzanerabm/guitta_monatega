# Bichittos + Art — Mount por Seção Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montar só a seção ativa nas páginas `/bichittos` e `/art` (tirar "Todos", sincronizar com a URL), replicando o padrão do kammara, pra eliminar o crash/refresh causado por 135–223 imagens montadas de uma vez.

**Architecture:** Espelha `KammaraClient` + `resolveInitialFilter`. Um helper puro resolve a criatura inicial a partir de `?bichitto=<id>`. O `BichittosClient` passa a montar condicionalmente só a criatura ativa (as inativas viram `null`, saem do DOM) e sincroniza o filtro com a URL via `router.replace`. O `FilterBar` é usado em modo controlado sem "Todos" — sem mudar o componente.

**Tech Stack:** Next.js (App Router, `next/navigation`), React, next-intl, Chakra UI, Vitest + Testing Library, Playwright (verificação manual).

## Global Constraints

- **NÃO afetar o kammara:** proibido modificar qualquer arquivo compartilhado com a página kammara (`FilterBar`, `CreatureSection`, `palettes.ts`, hooks, etc). Só é permitido criar arquivos novos em `src/app/[locale]/bichittos/` e editar `BichittosClient.tsx`. Se algum step parecer exigir mudar um arquivo compartilhado, PARAR e revisar — o `FilterBar` já suporta tudo que precisamos via props existentes.
- **Reuso:** usar `FilterBar` existente em modo controlado; não criar componente novo. (AGENTS.md)
- **Sem valores visuais espalhados:** nenhuma cor/fonte/tamanho hardcoded; nada de novo estilo é introduzido aqui. (AGENTS.md)
- **Responsividade:** nenhum `@media` manual novo. (AGENTS.md)
- **Ids das criaturas (ordem):** `['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania']`, filtrados por `isBichittoPublished`. Default = primeira publicada (napcat).
- **Query param:** `?bichitto=<id>`.
- **Testes:** `vitest run` (script `test`). Testes unitários espelham `resolveInitialFilter.test.ts`.
- **Padrão de arquivo de componente:** `ComponentName/{ComponentName.tsx, .stories.tsx, .test.tsx, index.ts}` — não se aplica aqui (helper e client, não componente novo).

---

## File Structure

- **Create:** `src/app/[locale]/bichittos/resolveInitialBichitto.ts` — função pura que resolve a criatura inicial a partir do query param + lista publicada.
- **Create:** `src/app/[locale]/bichittos/resolveInitialBichitto.test.ts` — testes do helper.
- **Modify:** `src/app/[locale]/bichittos/BichittosClient.tsx` — estado via URL, `handleSelectFilter` com `router.replace`, mount condicional (`null` pras inativas), `useEffect` de scroll ao trocar, `FilterBar` controlado sem "Todos".

- **Create:** `src/app/[locale]/art/resolveInitialArt.ts` — mesma função pura, para a página art.
- **Create:** `src/app/[locale]/art/resolveInitialArt.test.ts` — testes do helper da art.
- **Modify:** `src/app/[locale]/art/ArtClient.tsx` — mesma migração: estado via URL (`?art=<id>`), `handleSelectFilter`, mount condicional, scroll effect, `FilterBar` controlado sem "Todos".

`FilterBar`, `CreatureSection`, `ArtSection`, `CharacterStrip`, `CharacterCard`, `DSMainCard` ficam intactos. Kammara não é tocado.

---

## Task 1: Helper `resolveInitialBichitto`

**Files:**
- Create: `src/app/[locale]/bichittos/resolveInitialBichitto.ts`
- Test: `src/app/[locale]/bichittos/resolveInitialBichitto.test.ts`

**Interfaces:**
- Consumes: nada (função pura).
- Produces: `resolveInitialBichitto(param: string | null | undefined, publishedIds: string[]): string`. Regras: param ausente/vazio → `publishedIds[0]`; param que casa item de `publishedIds` → esse id; param inválido/não-publicado → `publishedIds[0]`. Se `publishedIds` estiver vazio, retorna `''`.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/app/[locale]/bichittos/resolveInitialBichitto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveInitialBichitto } from './resolveInitialBichitto';

const published = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'];

describe('resolveInitialBichitto', () => {
  it('cai na primeira criatura publicada quando não há param', () => {
    expect(resolveInitialBichitto(null, published)).toBe('napcat');
    expect(resolveInitialBichitto(undefined, published)).toBe('napcat');
    expect(resolveInitialBichitto('', published)).toBe('napcat');
  });

  it('abre a criatura publicada nomeada no param', () => {
    expect(resolveInitialBichitto('zeco', published)).toBe('zeco');
    expect(resolveInitialBichitto('miscelania', published)).toBe('miscelania');
  });

  it('cai na primeira publicada para criatura desconhecida ou não-publicada', () => {
    expect(resolveInitialBichitto('inexistente', published)).toBe('napcat');
    expect(resolveInitialBichitto('zeco', ['napcat', 'taylo'])).toBe('napcat');
  });

  it('retorna string vazia quando não há criaturas publicadas', () => {
    expect(resolveInitialBichitto('napcat', [])).toBe('');
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `yarn test src/app/\[locale\]/bichittos/resolveInitialBichitto.test.ts`
Expected: FAIL — "Failed to resolve import './resolveInitialBichitto'" (arquivo ainda não existe).

- [ ] **Step 3: Implementar o helper**

Create `src/app/[locale]/bichittos/resolveInitialBichitto.ts`:

```ts
/**
 * Decide qual criatura abrir no carregamento da página /bichittos, a partir do
 * query param `?bichitto=` e da lista de criaturas publicadas.
 *
 * Regras:
 *  - param ausente, vazio ou inválido → a primeira criatura publicada (napcat).
 *  - param que casa uma criatura PUBLICADA → essa criatura.
 *  - param de criatura não-publicada ou inexistente → a primeira publicada,
 *    pra ninguém forçar uma criatura escondida via link.
 *
 * Diferente do kammara, a bichittos não tem seção "intro": o default é sempre
 * a primeira criatura da lista publicada.
 */
export function resolveInitialBichitto(
  param: string | null | undefined,
  publishedIds: string[],
): string {
  const fallback = publishedIds[0] ?? '';
  if (!param) return fallback;
  return publishedIds.includes(param) ? param : fallback;
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `yarn test src/app/\[locale\]/bichittos/resolveInitialBichitto.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/bichittos/resolveInitialBichitto.ts" "src/app/[locale]/bichittos/resolveInitialBichitto.test.ts"
git commit -m "feat(bichittos): helper resolveInitialBichitto (criatura inicial via URL)"
```

---

## Task 2: Mount condicional + URL sync no `BichittosClient`

**Files:**
- Modify: `src/app/[locale]/bichittos/BichittosClient.tsx`

**Interfaces:**
- Consumes: `resolveInitialBichitto` do Task 1; `FilterBar` (props `filters`, `showAll`, `defaultActive`, `active`, `onFilter`); `CreatureSection`.
- Produces: nada (componente de página final).

Contexto do estado atual do arquivo (para orientar as edições):
- Linha 2: `import { useEffect, useMemo, useState } from 'react';`
- Linha 39: `const [activeFilter, setActiveFilter] = useState('all');`
- Linhas 147-151: `<FilterBar filters={filters} allLabel={...} onFilter={setActiveFilter} />`
- Linha 181: `const hidden = activeFilter !== 'all' && activeFilter !== creature.id;`
- Linhas 184-193: `return (<CreatureSection key={creature.id} ... hidden={hidden}>`
- O `.map` das criaturas começa na linha 153 (`{data.map((creature) => {`).

- [ ] **Step 1: Escrever teste de reprodução (baseline — deve passar hoje, provando o problema)**

Este teste roda antes e depois para confirmar o comportamento observável muda. Como o `BichittosClient` depende de muito contexto (next-intl, modal, imagens), o teste de comportamento fica no nível de verificação manual com Playwright (Step 7). Aqui, garantimos apenas que o arquivo continua compilando e que o helper está integrado. Pular teste unitário de render completo é intencional — o client tem dependências pesadas de provider que tornam um teste de montagem frágil e de baixo valor; a verificação real é o Playwright no Step 7.

Não há teste de arquivo a escrever neste step. Prosseguir.

- [ ] **Step 2: Trocar imports do React + adicionar next/navigation**

Em `src/app/[locale]/bichittos/BichittosClient.tsx`, linha 1-2, logo após `'use client';`, adicionar o import de navegação e o helper. Localizar:

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
```

Substituir por:

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
```

E adicionar, junto aos outros imports locais (perto da linha 16, após o import de `@/data/bichittos`):

```tsx
import { resolveInitialBichitto } from './resolveInitialBichitto';
```

- [ ] **Step 3: Substituir o estado inicial por resolução via URL**

Localizar (linha ~39):

```tsx
  const [activeFilter, setActiveFilter] = useState('all');
```

Substituir por:

```tsx
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ids publicados, na ordem de `data` (já filtrado por isBichittoPublished
  // na page.tsx). O primeiro é o default quando não há ?bichitto= na URL.
  const publishedIds = data.map((c) => c.id);
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialBichitto(searchParams.get('bichitto'), publishedIds),
  );

  // Troca a criatura ativa E sincroniza a URL (?bichitto=<id>), sem recarregar
  // nem empilhar histórico. É o único ponto de entrada do menu de filtros.
  const handleSelectFilter = (id: string) => {
    setActiveFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('bichitto', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
```

- [ ] **Step 4: Adicionar o `useEffect` de scroll ao trocar de criatura**

Logo após o `useEffect` existente que registra as galerias (termina na linha ~77, `}, [galleries, registerGallery]);`), adicionar:

```tsx
  // Ao trocar de criatura, a seção anterior desmonta e a nova monta — a posição
  // de scroll fica quebrada. Rola pra logo abaixo do FilterBar sticky. Espera um
  // beat pro layout da seção recém-montada assentar antes de medir.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const target = document.querySelector(
        `[data-section-creature="${activeFilter}"]`,
      );
      if (!target) return;
      const bar = document.querySelector('nav[aria-label="filters"]');
      const offset = bar ? bar.getBoundingClientRect().bottom + 10 : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeFilter]);
```

- [ ] **Step 5: Trocar o FilterBar para modo controlado sem "Todos"**

Localizar (linhas ~147-151):

```tsx
      <FilterBar
        filters={filters}
        allLabel={locale === 'en' ? 'All' : 'Todos'}
        onFilter={setActiveFilter}
      />
```

Substituir por:

```tsx
      <FilterBar
        filters={filters}
        showAll={false}
        defaultActive={publishedIds[0]}
        active={activeFilter}
        onFilter={handleSelectFilter}
      />
```

- [ ] **Step 6: Trocar o render escondido por mount condicional**

Localizar o início do `.map` e o cálculo de `hidden` (linhas ~153, ~181-193). Primeiro, remover a linha do `hidden` (linha ~181):

```tsx
        const hidden = activeFilter !== 'all' && activeFilter !== creature.id;
```

Depois, no `return` do map, localizar a abertura da `CreatureSection` (linhas ~184-193):

```tsx
        return (
          <CreatureSection
            key={creature.id}
            id={creature.id}
            gradient={palette.gradientBg}
            accentColor={palette.colors[0]}
            bgImage={colors.bgImage}
            bgOpacity={0.22}
            hidden={hidden}
          >
```

Substituir por (guarda de mount + remoção da prop `hidden`):

```tsx
        if (creature.id !== activeFilter) return null;

        return (
          <CreatureSection
            key={creature.id}
            id={creature.id}
            gradient={palette.gradientBg}
            accentColor={palette.colors[0]}
            bgImage={colors.bgImage}
            bgOpacity={0.22}
          >
```

Nota: o `.map` continua retornando `null` para as criaturas inativas — o React não monta nada para elas, então suas imagens/vídeos deixam o DOM.

- [ ] **Step 7: Verificar (typecheck + lint + build de página)**

Run: `yarn lint src/app/\[locale\]/bichittos/BichittosClient.tsx`
Expected: sem erros.

Se `lint` não aceitar caminho único, rodar `yarn lint` inteiro e conferir que não há novo erro em `BichittosClient.tsx`.

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/bichittos/BichittosClient.tsx"
git commit -m "feat(bichittos): monta só a criatura ativa + filtro na URL (tira Todos)"
```

---

## Task 3: Verificação end-to-end com Playwright

**Files:** nenhum (verificação manual/observacional).

**Interfaces:**
- Consumes: página `/pt/bichittos` servida pelo dev server em `localhost:3000`.
- Produces: evidência de que o pico de imagens caiu e a URL sincroniza.

- [ ] **Step 1: Garantir dev server rodando**

Run: `lsof -i :3000 | grep LISTEN || (cd "<repo>" && yarn dev &)`
Expected: porta 3000 escutando. (Se subir, aguardar "Ready".)

- [ ] **Step 2: Contar imagens no DOM (deve cair de ~223 para faixa de 1 criatura)**

Rodar um script Playwright (headless, channel chrome) que:
1. abre `http://localhost:3000/pt/bichittos`, espera `networkidle`;
2. conta `document.querySelectorAll('img').length`;
3. clica no filtro "zeco" e reconta.

Expected:
- No load inicial (napcat ativo): contagem **muito menor que 223** (faixa de dezenas — napcat tem ~32 tags no total antigo, agora só napcat monta).
- Só uma `[data-testid="creature-section"]` presente por vez.

- [ ] **Step 3: Conferir sincronização da URL**

No mesmo script: após clicar em "zeco", ler `page.url()`.
Expected: contém `?bichitto=zeco`.

- [ ] **Step 4: Conferir deep-link**

Abrir `http://localhost:3000/pt/bichittos?bichitto=taylo` direto.
Expected: a seção `[data-section-creature="taylo"]` está montada; napcat/zeco não estão no DOM.

- [ ] **Step 5: Conferir fallback de param inválido**

Abrir `http://localhost:3000/pt/bichittos?bichitto=inexistente`.
Expected: monta napcat (primeira publicada); nenhuma seção quebrada.

- [ ] **Step 6: Registrar evidência**

Salvar os números (antes/depois de imagens) e um screenshot da página com napcat ativo. Sem commit (é verificação).

---

## Task 4: Helper `resolveInitialArt`

**Files:**
- Create: `src/app/[locale]/art/resolveInitialArt.ts`
- Test: `src/app/[locale]/art/resolveInitialArt.test.ts`

**Interfaces:**
- Consumes: nada (função pura).
- Produces: `resolveInitialArt(param: string | null | undefined, sectionIds: string[]): string`. Regras idênticas ao `resolveInitialBichitto`: param ausente/vazio/inválido → `sectionIds[0]`; param que casa → esse id; lista vazia → `''`.

- [ ] **Step 1: Escrever o teste que falha**

Create `src/app/[locale]/art/resolveInitialArt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveInitialArt } from './resolveInitialArt';

const ids = ['aquarela', 'digital', 'nanquim'];

describe('resolveInitialArt', () => {
  it('cai na primeira seção quando não há param', () => {
    expect(resolveInitialArt(null, ids)).toBe('aquarela');
    expect(resolveInitialArt(undefined, ids)).toBe('aquarela');
    expect(resolveInitialArt('', ids)).toBe('aquarela');
  });

  it('abre a seção nomeada no param', () => {
    expect(resolveInitialArt('digital', ids)).toBe('digital');
    expect(resolveInitialArt('nanquim', ids)).toBe('nanquim');
  });

  it('cai na primeira seção para id desconhecido', () => {
    expect(resolveInitialArt('inexistente', ids)).toBe('aquarela');
  });

  it('retorna string vazia quando não há seções', () => {
    expect(resolveInitialArt('digital', [])).toBe('');
  });
});
```

Nota: os ids `['aquarela', 'digital', 'nanquim']` são exemplos do teste (não precisam casar os ids reais de `artSections` — o helper é agnóstico à lista concreta).

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `yarn test src/app/\[locale\]/art/resolveInitialArt.test.ts`
Expected: FAIL — "Failed to resolve import './resolveInitialArt'".

- [ ] **Step 3: Implementar o helper**

Create `src/app/[locale]/art/resolveInitialArt.ts`:

```ts
/**
 * Decide qual seção de arte abrir no carregamento da página /art, a partir do
 * query param `?art=` e da lista de seções.
 *
 * Regras:
 *  - param ausente, vazio ou inválido → a primeira seção da lista.
 *  - param que casa uma seção → essa seção.
 */
export function resolveInitialArt(
  param: string | null | undefined,
  sectionIds: string[],
): string {
  const fallback = sectionIds[0] ?? '';
  if (!param) return fallback;
  return sectionIds.includes(param) ? param : fallback;
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `yarn test src/app/\[locale\]/art/resolveInitialArt.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/art/resolveInitialArt.ts" "src/app/[locale]/art/resolveInitialArt.test.ts"
git commit -m "feat(art): helper resolveInitialArt (seção inicial via URL)"
```

---

## Task 5: Mount condicional + URL sync no `ArtClient`

**Files:**
- Modify: `src/app/[locale]/art/ArtClient.tsx`

**Interfaces:**
- Consumes: `resolveInitialArt` do Task 4; `FilterBar`; `ArtSection`.
- Produces: nada (componente de página final).

Contexto do estado atual (`ArtClient.tsx`):
- Linha 2: `import { useEffect, useState } from 'react';`
- Linha 23: `const [activeFilter, setActiveFilter] = useState('all');`
- Linha 51: `const filters = sectionsWithMeta.map((s) => ({ id: s.id, label: s.title }));`
- Linhas 71-75: `<FilterBar filters={filters} allLabel={...} onFilter={setActiveFilter} />`
- Linhas 77-91: `{sectionsWithMeta.map((s) => (<ArtSection ... hidden={activeFilter !== 'all' && activeFilter !== s.id} .../>))}`
- `ArtSection` usa `data-section-art={id}`.

- [ ] **Step 1: Trocar imports + adicionar next/navigation e o helper**

Localizar linhas 1-2:

```tsx
'use client';
import { useEffect, useState } from 'react';
```

Substituir por:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
```

E adicionar junto aos imports locais (após a linha 8, `artSectionMeta`):

```tsx
import { resolveInitialArt } from './resolveInitialArt';
```

- [ ] **Step 2: Substituir o estado inicial por resolução via URL**

Localizar (linha 23):

```tsx
  const [activeFilter, setActiveFilter] = useState('all');
```

Substituir por:

```tsx
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionIds = sections.map((s) => s.id);
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialArt(searchParams.get('art'), sectionIds),
  );

  const handleSelectFilter = (id: string) => {
    setActiveFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('art', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
```

- [ ] **Step 3: Adicionar o `useEffect` de scroll ao trocar de seção**

Logo após o `useEffect` existente que registra galerias (termina na linha ~32, `}, [sections, registerGallery]);`), adicionar:

```tsx
  // Ao trocar de seção, a anterior desmonta e a nova monta — rola pra logo
  // abaixo do FilterBar sticky, esperando o layout assentar.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const target = document.querySelector(
        `[data-section-art="${activeFilter}"]`,
      );
      if (!target) return;
      const bar = document.querySelector('nav[aria-label="filters"]');
      const offset = bar ? bar.getBoundingClientRect().bottom + 10 : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeFilter]);
```

- [ ] **Step 4: Trocar o FilterBar para modo controlado sem "Todos"**

Localizar (linhas 71-75):

```tsx
      <FilterBar
        filters={filters}
        allLabel={locale === 'en' ? 'All' : 'Todos'}
        onFilter={setActiveFilter}
      />
```

Substituir por:

```tsx
      <FilterBar
        filters={filters}
        showAll={false}
        defaultActive={sectionIds[0]}
        active={activeFilter}
        onFilter={handleSelectFilter}
      />
```

- [ ] **Step 5: Trocar o render escondido por mount condicional**

Localizar (linhas 77-91):

```tsx
      {sectionsWithMeta.map((s) => (
        <ArtSection
          key={s.id}
          id={s.id}
          title={s.title}
          technique={s.technique}
          bg={s.bg}
          titleColor={s.titleColor}
          techColor={s.techColor}
          large={s.large}
          thumbs={s.thumbs}
          hidden={activeFilter !== 'all' && activeFilter !== s.id}
          onThumbClick={(idx) => handleThumbClick(s.id, idx)}
        />
      ))}
```

Substituir por:

```tsx
      {sectionsWithMeta.map((s) =>
        s.id !== activeFilter ? null : (
          <ArtSection
            key={s.id}
            id={s.id}
            title={s.title}
            technique={s.technique}
            bg={s.bg}
            titleColor={s.titleColor}
            techColor={s.techColor}
            large={s.large}
            thumbs={s.thumbs}
            onThumbClick={(idx) => handleThumbClick(s.id, idx)}
          />
        ),
      )}
```

- [ ] **Step 6: Verificar lint**

Run: `yarn lint`
Expected: sem novo erro em `ArtClient.tsx`.

- [ ] **Step 7: Verificação Playwright**

1. Abrir `http://localhost:3000/pt/art` → contar `<img>` (deve cair de 135 para a faixa de 1 seção).
2. Clicar num filtro → só uma `[data-section-art]` presente; URL vira `?art=<id>`.
3. Deep-link `?art=<id>` válido abre nessa seção; inválido cai na primeira.

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/art/ArtClient.tsx"
git commit -m "feat(art): monta só a seção ativa + filtro na URL (tira Todos)"
```

---

## Self-Review

**1. Spec coverage:**
- Helper `resolveInitialBichitto` (spec §Arquitetura.1) → Task 1. ✓
- Estado via URL + `handleSelectFilter` + `router.replace` (spec §Arquitetura.2) → Task 2, steps 3. ✓
- Mount condicional `null` pras inativas (spec §Arquitetura.2) → Task 2, step 6. ✓
- `useEffect` de scroll ao trocar (spec §Arquitetura.2) → Task 2, step 4. ✓
- `FilterBar` controlado sem "Todos" (spec §Arquitetura.3) → Task 2, step 5. ✓
- Verificação (spec §Verificação) → Task 3. ✓
- Follow-ups (imagens, 404 miscelania, lazy) → explicitamente fora de escopo; nenhum task, correto. ✓

**2. Placeholder scan:** sem TBD/TODO; todo código está inline. Step 1 do Task 2 é intencionalmente "sem arquivo a escrever" com justificativa explícita (client tem providers pesados; verificação real é Playwright). ✓

**3. Type consistency:** `resolveInitialBichitto(param, publishedIds): string` — mesma assinatura usada no teste (Task 1) e na chamada (Task 2 step 3). `handleSelectFilter(id: string)` definido no step 3 e usado no `onFilter` do step 5. `publishedIds` definido no step 3 e usado nos steps 5. Data attr `data-section-creature` (usado no scroll effect e nos asserts do Playwright) confere com o que `CreatureSection` renderiza (`data-section-creature={id}`). ✓
