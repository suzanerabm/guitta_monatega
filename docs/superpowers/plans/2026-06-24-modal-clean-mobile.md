# Modal clean no mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No mobile (< 768px ou celular virado), o ModalKammara fica clean — sem título/descrição/label/contador/setas — com a mídia ocupando quase a tela, navegação por swipe, e em paisagem a mídia toma 100% da altura. Desktop intocado.

**Architecture:** Tudo num único componente (`ModalKammara.tsx`). Um hook local `useMobileModal()` usa `matchMedia` pra responder duas perguntas SSR-safe: "está no modo clean?" (`(max-width: 48em), (orientation: landscape) and (max-height: 48em)`) e "está em paisagem?" (`(orientation: landscape)`). O título/descrição/label/nav-rodapé recebem `display={{ base: 'none', md: ... }}` (some no mobile via CSS). No mobile, o `ZoomableImage` é trocado por um `<img>` simples — sem zoom/pan (desnecessário quando a mídia já ocupa a tela, e evita conflito do pinch com o swipe). Um wrapper de swipe em volta da mídia dispara `next()`/`prev()` por arraste horizontal; como no mobile não há `ZoomableImage` (nem seu `touch-action: none`), o gesto chega limpo ao wrapper.

**Tech Stack:** React 18, Chakra UI v3, TypeScript, Vitest + @testing-library/react, `matchMedia`.

---

## Notas de contexto (ler antes de começar)

- **Arquivo alvo:** [src/components/Modal/ModalKammara.tsx](../../../src/components/Modal/ModalKammara.tsx). Já tem: backdrop, card flutuante (fundo gradiente + outline accent), watermarks, botão fechar (✕, `aria-label="Close"`), corpo com título/descrição → mídia → label, e nav-rodapé absoluta (⊷ `i/N` ⊶) com `aria-label="Previous"`/`"Next"`.
- **`useModal()`** (de `./ModalProvider`) expõe `state`, `close`, `next`, `prev`. `next`/`prev` já navegam com wrap-around. O componente já chama `next()`/`prev()` no teclado (ArrowRight/Left) e nos botões do rodapé.
- **`ZoomableImage`** ([src/components/ZoomableImage/ZoomableImage.tsx](../../../src/components/ZoomableImage/ZoomableImage.tsx)): pinch/pan contidos. **No mobile clean ele NÃO é usado** — trocado por um `<img>` simples (Task 4-bis), porque com a mídia ocupando a tela o zoom é desnecessário e o pinch atrapalharia o swipe. No desktop, segue usando `ZoomableImage` normalmente.
- **Regras do projeto** (AGENTS.md): responsividade por props do Chakra (`{ base, md }`), nunca `@media` manual em componente; cores/tamanhos via tokens — mas aqui as cores são dinâmicas (vêm da paleta do planeta via props `color`/`darkColor`), então valores inline com essas variáveis são aceitáveis (já é o padrão do arquivo). Não introduzir hex hardcoded novo.
- **Breakpoint `md`** = 48em = 768px (definido em `src/theme/index.ts`).
- **Teste:** usar `renderWithChakra` de `@/test-utils` e `ModalProvider` de `@/components/Modal`. O modal lê do contexto, então o teste abre a galeria via um helper que dispara `openKammaraGallery`. jsdom não tem `matchMedia` por padrão — o test-setup precisa de um polyfill (Task 1).

---

## Task 1: Polyfill de `matchMedia` no test-setup

`matchMedia` não existe no jsdom. Sem ele o hook quebra no teste. Adiciona um mock controlável.

**Files:**
- Modify: `src/test-setup.ts`

- [ ] **Step 1: Adicionar o polyfill de matchMedia**

Em [src/test-setup.ts](../../../src/test-setup.ts), após o bloco do `ResizeObserver`, adicionar:

```ts
// Polyfill matchMedia for jsdom. Defaults every query to non-matching
// (desktop-like). Tests that need a specific match override window.matchMedia.
globalThis.matchMedia =
  globalThis.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList);
```

- [ ] **Step 2: Rodar a suíte pra garantir que nada quebrou**

Run: `npx vitest run`
Expected: PASS — 42 files, 133 tests (mesmo baseline de antes; o polyfill é aditivo).

- [ ] **Step 3: Commit**

```bash
git add src/test-setup.ts
git commit -m "test: polyfill matchMedia no jsdom (pré-requisito do modal mobile)"
```

---

## Task 2: Hook `useMobileModal` (gate clean + paisagem)

Hook local no arquivo do modal. SSR-safe (começa `false`), sincroniza no mount, escuta mudanças. Retorna `{ isCleanMobile, isLandscape }`.

**Files:**
- Modify: `src/components/Modal/ModalKammara.tsx` (adicionar o hook no topo do arquivo, antes do componente)

- [ ] **Step 1: Adicionar o hook**

No topo de [src/components/Modal/ModalKammara.tsx](../../../src/components/Modal/ModalKammara.tsx), trocar o import do React pra incluir `useState`, e adicionar o hook após os imports:

```tsx
import { useEffect, useState } from 'react';
```

E, depois dos imports e da função `formatFilename`, antes de `export function ModalKammara`:

```tsx
// Reads two media queries to drive the mobile-clean modal layout:
//  - isCleanMobile: phone-sized OR a phone held sideways (landscape with a
//    short viewport). The width cut alone (<=48em) misses a landscape phone,
//    whose width is ~850px; the orientation+max-height clause catches it
//    without affecting wide desktops in landscape (their height is >>48em).
//  - isLandscape: true when the device is turned sideways, so the media can
//    take the full height.
// SSR-safe: starts false (desktop layout) and syncs on mount.
function useMobileModal() {
  const [isCleanMobile, setIsCleanMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const cleanQuery = window.matchMedia(
      '(max-width: 48em), (orientation: landscape) and (max-height: 48em)',
    );
    const landscapeQuery = window.matchMedia('(orientation: landscape)');

    const sync = () => {
      setIsCleanMobile(cleanQuery.matches);
      setIsLandscape(landscapeQuery.matches);
    };
    sync();
    cleanQuery.addEventListener('change', sync);
    landscapeQuery.addEventListener('change', sync);
    return () => {
      cleanQuery.removeEventListener('change', sync);
      landscapeQuery.removeEventListener('change', sync);
    };
  }, []);

  return { isCleanMobile, isLandscape };
}
```

- [ ] **Step 2: Chamar o hook dentro do componente**

Dentro de `ModalKammara`, logo após a desestruturação de `state` (depois da linha `} = state;`), adicionar:

```tsx
  const { isCleanMobile, isLandscape } = useMobileModal();
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros. (`isCleanMobile`/`isLandscape` ainda não usados gera warning de lint, não erro de tsc — serão usados nas próximas tasks; se o lint falhar o build, seguir direto pra Task 3 sem commit isolado.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Modal/ModalKammara.tsx
git commit -m "feat(modal): hook useMobileModal (gate clean + orientação)"
```

---

## Task 3: Esconder título, descrição, label e nav-rodapé no mobile

Esses blocos só aparecem no desktop. Usar `display={{ base: 'none', md: ... }}` (CSS responsivo do Chakra — não depende do hook).

**Files:**
- Modify: `src/components/Modal/ModalKammara.tsx`

- [ ] **Step 1: Esconder o bloco título + descrição**

O bloco `{(heroTitle || heroText) && ( <Flex align="center" gap="0.8rem" ...> ... </Flex> )}` (o cabeçalho com `<Heading>` do `heroTitle` e `<Text>` do `heroText`). Envolver/anotar o `<Flex>` externo desse bloco com `display={{ base: 'none', md: 'flex' }}`:

```tsx
          {(heroTitle || heroText) && (
            <Flex
              display={{ base: 'none', md: 'flex' }}
              align="center"
              gap="0.8rem"
              flexWrap="wrap"
              justify="center"
            >
```

(o resto do bloco — `<Heading>` e `<Text>` — fica igual.)

- [ ] **Step 2: Esconder o label lateral (desktop já era `{ base: 'none', md: 'block' }`) — confirmar**

O `<Text>` do `techniqueText` lateral rotacionado JÁ tem `display={{ base: 'none', md: 'block' }}`. Nenhuma mudança. (Confirmar lendo a linha; não editar.)

- [ ] **Step 3: Esconder o label de baixo (mobile-only hoje) — inverter pra sumir**

O `<Text>` do `techniqueText` horizontal de baixo tem hoje `display={{ base: 'block', md: 'none' }}` (aparece só no mobile). No design clean ele some no mobile. Trocar pra não exibir em lugar nenhum no mobile: como o lateral já cobre desktop, este bloco de baixo deixa de ter função. Remover o bloco inteiro:

```tsx
            {/* Bottom label removido: no mobile o modal é clean (sem label). */}
```

(apagar o `{techniqueText && ( <Text display={{ base: 'block', md: 'none' }} ...>{techniqueText}</Text> )}` inteiro.)

- [ ] **Step 4: Esconder a nav-rodapé no mobile**

A `<Flex position="absolute" bottom={0} ...>` que contém ⊷, o contador `{currentIndex + 1} / {images.length}` e ⊶. Anotar com `display={{ base: 'none', md: 'flex' }}`:

```tsx
        {/* Bottom nav — desktop only; mobile navega por swipe (Task 4). */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          align="center"
          justify="center"
          gap="3xl"
          py="1.6rem"
          bg="transparent"
          onClick={(e) => e.stopPropagation()}
        >
```

(o conteúdo interno — botões Previous/Next e contador — fica igual.)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/components/Modal/ModalKammara.tsx
git commit -m "feat(modal): mobile clean — esconde título/label/nav (desktop intocado)"
```

---

## Task 4: Swipe pra navegar no mobile

Wrapper de swipe em volta da área da mídia. Mede arraste horizontal; dispara `next()`/`prev()` quando o gesto é claramente horizontal. Só ativa no mobile clean.

**Files:**
- Modify: `src/components/Modal/ModalKammara.tsx`

- [ ] **Step 1: Adicionar `useRef` ao import e o handler de swipe**

Trocar o import:

```tsx
import { useEffect, useRef, useState } from 'react';
```

Dentro de `ModalKammara`, após a chamada `const { isCleanMobile, isLandscape } = useMobileModal();`, adicionar:

```tsx
  // Swipe-to-navigate on mobile. Records the touch start, and on touch end
  // fires next()/prev() when the horizontal travel dominates (>=50px and
  // clearly more horizontal than vertical). On mobile the media is a plain
  // <img> (no ZoomableImage), so nothing competes for the gesture. Only armed
  // on the clean-mobile layout.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onMediaTouchStart = (e: React.TouchEvent) => {
    if (!isCleanMobile || e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onMediaTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !isCleanMobile) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };
```

- [ ] **Step 2: Ligar o handler no container da mídia**

O `<Box position="relative" display="flex" justifyContent="center" minH={0} flex={1} width={{ base: '94vw', md: '100%' }} ...>` que envolve a mídia (o vídeo ou `ZoomableImage`). Adicionar os handlers de touch nele:

```tsx
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              minH={0}
              flex={1}
              width={{ base: '94vw', md: '100%' }}
              maxW={{ base: '94vw', md: '90vw' }}
              onTouchStart={onMediaTouchStart}
              onTouchEnd={onMediaTouchEnd}
            >
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/Modal/ModalKammara.tsx
git commit -m "feat(modal): swipe pra navegar no mobile (sem brigar com o zoom)"
```

---

## Task 4-bis: Sem zoom no mobile — `<img>` simples no lugar do `ZoomableImage`

No mobile clean, o zoom é desnecessário e o pinch atrapalharia o swipe. Trocar o `ZoomableImage` por um `<img>` puro quando `isCleanMobile`. Desktop segue com `ZoomableImage`.

**Files:**
- Modify: `src/components/Modal/ModalKammara.tsx`

- [ ] **Step 1: Renderizar `<img>` no mobile, `ZoomableImage` no desktop**

O ramo `else` que hoje é só `<ZoomableImage key={currentImage} src={currentImage} alt={heroTitle || ''} maxHeight="100%" />`. Trocar por:

```tsx
              ) : isCleanMobile ? (
                // Mobile: plain image, no zoom/pan. The media already fills the
                // screen and pinch would fight the swipe. objectFit contain
                // keeps the whole frame visible.
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={heroTitle || ''}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    display: 'block',
                  }}
                />
              ) : (
                <ZoomableImage
                  key={currentImage}
                  src={currentImage}
                  alt={heroTitle || ''}
                  maxHeight="100%"
                />
              )}
```

(o ramo do vídeo — `currentVideo ? (<video .../>)` — fica igual; só o `: (` do else vira `: isCleanMobile ? (<img/>) : (<ZoomableImage/>)`.)

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/Modal/ModalKammara.tsx
git commit -m "feat(modal): mobile sem zoom — img simples no lugar do ZoomableImage"
```

---

## Task 5: Mídia ocupa mais espaço (paisagem = 100% altura)

Aumentar o respiro da mídia no mobile e, em paisagem, encostar nas bordas (100% altura). Reduzir os paddings do corpo no mobile (que existiam pra título/nav que agora sumiram).

**Files:**
- Modify: `src/components/Modal/ModalKammara.tsx`

- [ ] **Step 1: Reduzir o padding do corpo no mobile**

O `<Flex direction="column" align="center" justify="center" flex={1} minH={0} px={...} pt={...} pb={...} gap={...}>` do corpo. Hoje tem `pt={{ base: '3.5rem', md: '4rem' }}` e `pb={{ base: '5rem', md: '6rem' }}` (espaço reservado pro título e pra nav-rodapé, que somem no mobile). Encolher no base — manter só o respiro do ✕ no topo:

```tsx
        <Flex
          direction="column"
          align="center"
          justify="center"
          flex={1}
          minH={0}
          px={{ base: '0.5rem', md: '3xl' }}
          pt={{ base: '3rem', md: '4rem' }}
          pb={{ base: '0.5rem', md: '6rem' }}
          gap={{ base: '0', md: 'lg' }}
          onClick={(e) => e.stopPropagation()}
        >
```

- [ ] **Step 2: Em paisagem, mídia em 100% da altura**

No `<Box>` container da mídia (o mesmo da Task 4, que ganhou os handlers de touch), a largura é `{ base: '94vw', md: '100%' }`. Em paisagem a mídia deve usar toda a altura/largura disponível. Usar `isLandscape` pra abrir a largura no modo deitado:

```tsx
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              minH={0}
              flex={1}
              width={isLandscape ? '100%' : { base: '94vw', md: '100%' }}
              maxW={isLandscape ? '100%' : { base: '94vw', md: '90vw' }}
              onTouchStart={onMediaTouchStart}
              onTouchEnd={onMediaTouchEnd}
            >
```

(o `flex={1}` + `minH={0}` já fazem a altura preencher; em paisagem, com o padding do corpo reduzido na Task 5.1, a mídia chega perto de 100% da altura do card.)

- [ ] **Step 3: Verificar tipos + build**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/Modal/ModalKammara.tsx
git commit -m "feat(modal): mídia maior no mobile; 100% da altura em paisagem"
```

---

## Task 6: Teste do ModalKammara

`ModalKammara` não tem teste hoje. Cobrir: abre e mostra a mídia; ✕ fecha; nav (Previous/Next no desktop) chama next/prev. (O gate base/md e swipe não são exercitáveis em jsdom — documentado no spec.)

**Files:**
- Create: `src/components/Modal/ModalKammara.test.tsx`

- [ ] **Step 1: Escrever o teste**

Criar `src/components/Modal/ModalKammara.test.tsx`:

```tsx
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { renderWithChakra } from '@/test-utils';
import { ModalProvider, useModal } from '@/components/Modal';
import { ModalKammara } from './ModalKammara';

// Opens a kammara gallery on mount so ModalKammara has state to render.
function OpenOnMount() {
  const { openKammaraGallery, registerGallery } = useModal();
  useEffect(() => {
    registerGallery('test-km', ['/imgs/a.webp', '/imgs/b.webp']);
    openKammaraGallery({
      galleryId: 'test-km',
      startIndex: 0,
      color: '#00e676',
      darkColor: '#002e14',
      textColor: '#c6eed6',
      crestGlyph: '⊙',
      heroTitle: "LUNN'P1",
    });
  }, [openKammaraGallery, registerGallery]);
  return null;
}

function render() {
  return renderWithChakra(
    <ModalProvider>
      <OpenOnMount />
      <ModalKammara />
    </ModalProvider>,
  );
}

describe('ModalKammara', () => {
  it('shows the current image when open', () => {
    render();
    const imgs = screen.getAllByRole('img') as HTMLImageElement[];
    const found = imgs.some((img) => img.getAttribute('src') === '/imgs/a.webp');
    expect(found).toBe(true);
  });

  it('advances to the next image when Next is clicked', () => {
    render();
    fireEvent.click(screen.getByLabelText('Next'));
    const imgs = screen.getAllByRole('img') as HTMLImageElement[];
    const found = imgs.some((img) => img.getAttribute('src') === '/imgs/b.webp');
    expect(found).toBe(true);
  });

  it('closes when the close button is clicked', () => {
    render();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste**

Run: `npx vitest run src/components/Modal/ModalKammara.test.tsx`
Expected: PASS (3 testes). Se "shows the current image" falhar porque o `ZoomableImage` renderiza o `<img>` com `src` diferente, ajustar a asserção pra checar `img.src` contém `/imgs/a.webp` em vez de igualdade exata.

- [ ] **Step 3: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: PASS — agora 43 files, 136 tests (3 novos).

- [ ] **Step 4: Commit**

```bash
git add src/components/Modal/ModalKammara.test.tsx
git commit -m "test(modal): cobre ModalKammara — abre, navega, fecha"
```

---

## Task 7: Validação final + push

- [ ] **Step 1: tsc + suíte + build**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc 0 erros; testes verdes; build OK.

- [ ] **Step 2: Conferência manual (dev)**

Run: `npm run dev`, abrir `/kammara`, entrar num planeta, abrir o modal de uma cena/drop. No DevTools responsivo:
- 320px retrato: sem título/label/contador/setas; mídia grande; sem zoom (pinch não dá zoom); swipe troca a imagem; ✕ fecha.
- Girar pra paisagem (~850×390): mídia 100% da altura; swipe troca; ✕ no canto.
- Desktop (>768px): título + label rotacionado + nav-rodapé + zoom/pan como antes (sem regressão).

- [ ] **Step 3: Push**

```bash
git push
```

---

## Self-review (preenchido pelo autor do plano)

**Cobertura do spec:**
- Some no mobile: título (T3.1), descrição (T3.1), label lateral (já era, T3.2), label de baixo (T3.3), contador + setas/nav-rodapé (T3.4). ✓
- Fica: fundo (não tocado), ✕ (não tocado), watermark (não tocado), vídeo/teclado (não tocados). Zoom: mantido no desktop, removido no mobile (T4-bis, por pedido). ✓
- Swipe nos dois modos, sem setas (T4). ✓
- Paisagem 100% altura (T5.2). ✓
- Gate < 768px OU celular virado, via matchMedia (T2). ✓
- Teste novo (T6). ✓
- Desktop intocado: todas as mudanças usam `{ base: ..., md: <valor original> }` ou `isCleanMobile`/`isLandscape` que são falsos no desktop. ✓

**Consistência de nomes:** `useMobileModal` → `{ isCleanMobile, isLandscape }` usados igual em T2/T4/T5. Handlers `onMediaTouchStart`/`onMediaTouchEnd` definidos em T4 e usados em T4.2/T5.2. ✓

**Sem placeholders:** todo passo de código mostra o código. ✓
