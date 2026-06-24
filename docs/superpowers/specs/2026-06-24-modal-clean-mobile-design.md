# Modal Kammara — modo clean no mobile

**Data:** 2026-06-24
**Componente:** `src/components/Modal/ModalKammara.tsx`

## Problema

Quando se mostra o universo Kammara pras crianças no celular, o modal de
imagens/vídeos deixa a mídia minúscula: título do planeta, descrição e label da
foto comem o espaço, e a foto fica em ~120px. Vídeo fica ainda menor. As
crianças nem olham porque não dá pra enxergar.

## Objetivo

No mobile, deixar o modal **clean** com a mídia ocupando quase a tela toda.
Aproveitar quando a criança vira o aparelho (paisagem) pra a mídia crescer ainda
mais. Manter a navegação entre as imagens.

## Decisões

**Escopo:** só no mobile. Mobile = largura ≤ `md` (48em = 768px) **OU** celular
virado em paisagem. O detalhe importante: um celular deitado tem ~850px de
largura (acima de 768px), então o corte por largura sozinho não pegaria o
aparelho virado. Por isso o modo clean liga quando **`(max-width: 48em)` OU
`(orientation: landscape) and (max-height: 48em)`** — a segunda condição captura
o celular virado (altura baixa) sem afetar desktops largos em paisagem (que têm
altura bem maior que 768px). O desktop continua **exatamente** como está hoje
(título + descrição + label rotacionado + navegação no rodapé). Nada do desktop
muda.

**O que some no mobile:**
- Título do planeta (`heroTitle`)
- Descrição (`heroText`)
- Label da foto (`techniqueText` — tanto o lateral rotacionado quanto o
  horizontal de baixo)
- Paginação / contador (`1 / N`)
- Barra de navegação do rodapé (as setas ⊷ ⊶ só existem no desktop;
  no mobile a troca é por swipe)

**O que fica no mobile:**
- Cor de fundo atual — o mesmo card flutuante com gradiente escuro do planeta +
  borda/outline accent que o modal já usa. **Não mexer no fundo.**
- Navegação por **swipe** (sem setas visíveis em nenhum modo).
- Botão fechar **✕** no canto superior direito (já existe).
- Marca d'água discreta (`KammaraWatermark` — glifo + nome do planeta) sobre a
  mídia. **Continua.**
- Zoom/pan da imagem (`ZoomableImage`), vídeo com `controls`, navegação por
  teclado (setas/Esc) — tudo intacto.

**Um comportamento mobile, dois respiros pela orientação real do aparelho:**

| | Retrato (em pé) | Paisagem (virado) |
|---|---|---|
| Mídia | cresce no centro, ocupa quase tudo | ocupa 100% da altura |
| Navegação | **swipe** (sem setas) | **swipe** (sem setas) |
| ✕ | canto sup. direito | canto sup. direito |
| Contador | (removido) | (removido) |

A navegação é por swipe nos dois modos — nenhuma seta visível no mobile. A única
diferença entre retrato e paisagem é o respiro da mídia (em paisagem ela toma
100% da altura). O ✕ no canto é comum aos dois.

**Swipe:** detectar arraste horizontal sobre a área da mídia (touchstart →
touchend, limiar ~50px). Arrasto pra esquerda = `next()`, pra direita =
`prev()`. Não interferir no zoom/pan do `ZoomableImage` nem nos `controls` do
vídeo — o handler de swipe fica num wrapper e só dispara quando o gesto é
claramente horizontal e a imagem não está com zoom ativo.

**Gatilho de orientação:** detectar a orientação real da tela. Virar o aparelho
→ layout paisagem; pôr em pé → retrato. Usar `matchMedia('(orientation:
landscape)')` com listener; é a API canônica de orientação e cobre o caso da
criança virando o celular. Quando a tela está em paisagem **e** é mobile, a
mídia toma 100% da altura; o comportamento (swipe, sem setas, ✕ no canto) é o
mesmo nos dois modos.

## Arquitetura

Mudanças contidas em `ModalKammara.tsx`. O componente já tem `next()`/`prev()`
(via `useModal`), `ZoomableImage`, `KammaraWatermark`, fechar e teclado. O
trabalho é reorganizar o **layout mobile** e gatear título/label/contador por
breakpoint.

1. **Hook de orientação (local):** um `useIsLandscape()` simples dentro do
   arquivo (ou inline via `useState` + `useEffect` + `matchMedia`). SSR-safe:
   começa `false`, sincroniza no mount, escuta `change`.

2. **Corpo mobile = só a mídia.** Hoje o corpo é uma coluna (título → mídia →
   label) com nav absoluta no rodapé. No mobile, vira só a mídia ocupando o
   card, com o ✕ absoluto no canto e um wrapper que captura o swipe. Sem título,
   sem label, sem contador, sem setas. Em paisagem a mídia toma 100% da altura.

3. **Responsividade por props do Chakra** (`base` = mobile, `md` = desktop),
   seguindo AGENTS.md — nada de `@media` manual. O bloco de título, o label e a
   barra de navegação do rodapé ganham `display={{ base: 'none', md: ... }}`
   (só desktop). O swipe-wrapper só age no mobile.

## Não-objetivos (YAGNI)

- Não travar a orientação do aparelho (não usar Screen Orientation lock API).
- Não fullscreen nativo (`requestFullscreen`) — o card flutuante atual já cobre
  quase a tela.
- Não tocar no desktop nem no fundo.

## Testes

`ModalKammara` não tem teste hoje. Adicionar um arquivo
`ModalKammara.test.tsx` cobrindo:
- Abre e mostra a mídia (imagem) do `currentIndex`.
- `next`/`prev` continuam acessíveis (botões com `aria-label` Previous/Next
  existem — agora as setas laterais no mobile carregam os mesmos labels).
- Fechar via ✕ chama `close`.

jsdom não tem orientação real, então o teste cobre a presença dos controles e a
navegação; o gate visual base/md não é exercido em jsdom (responsive props do
Chakra não resolvem lá), o que é aceitável.
