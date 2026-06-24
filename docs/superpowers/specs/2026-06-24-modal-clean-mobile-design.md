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

**Escopo:** só no mobile (≤ breakpoint `md` = 48em). O desktop continua
**exatamente** como está hoje (título + descrição + label rotacionado +
navegação no rodapé). Nada do desktop muda.

**O que some no mobile:**
- Título do planeta (`heroTitle`)
- Descrição (`heroText`)
- Label da foto (`techniqueText` — tanto o lateral rotacionado quanto o
  horizontal de baixo)
- Paginação / contador (`1 / N`)

**O que fica no mobile:**
- Cor de fundo atual — o mesmo card flutuante com gradiente escuro do planeta +
  borda/outline accent que o modal já usa. **Não mexer no fundo.**
- Navegação por **setas laterais**: ⊷ na borda esquerda, ⊶ na borda direita.
- Botão fechar **✕** no canto superior direito (já existe).
- Marca d'água discreta (`KammaraWatermark` — glifo + nome do planeta) sobre a
  mídia. **Continua.**
- Zoom/pan da imagem (`ZoomableImage`), vídeo com `controls`, navegação por
  teclado (setas/Esc) — tudo intacto.

**Dois layouts no mobile, escolhidos pela orientação real do aparelho:**

| | Retrato (em pé) | Paisagem (virado) |
|---|---|---|
| Mídia | cresce no centro, ocupa quase tudo | ganha toda a altura |
| Setas | ⊷ ⊶ nas laterais (colunas finas) | ⊷ ⊶ nas laterais (colunas um pouco mais largas) |
| ✕ | canto sup. direito | canto sup. direito |
| Contador | (removido) | (removido) |

A diferença entre os dois é só a largura das colunas das setas e o respiro da
mídia — o esqueleto (setas-laterais + ✕ no canto) é o mesmo.

**Gatilho de orientação:** detectar a orientação real da tela. Virar o aparelho
→ layout paisagem; pôr em pé → retrato. Usar `matchMedia('(orientation:
landscape)')` com listener; é a API canônica de orientação e cobre o caso da
criança virando o celular. Quando a tela está em paisagem **e** é mobile, usa o
respiro maior; o esqueleto de setas-laterais é o mesmo nos dois.

## Arquitetura

Mudanças contidas em `ModalKammara.tsx`. O componente já tem `next()`/`prev()`
(via `useModal`), `ZoomableImage`, `KammaraWatermark`, fechar e teclado. O
trabalho é reorganizar o **layout mobile** e gatear título/label/contador por
breakpoint.

1. **Hook de orientação (local):** um `useIsLandscape()` simples dentro do
   arquivo (ou inline via `useState` + `useEffect` + `matchMedia`). SSR-safe:
   começa `false`, sincroniza no mount, escuta `change`.

2. **Layout em duas faixas → layout em três colunas no mobile.** Hoje o corpo é
   uma coluna (título → mídia → label) com nav absoluta no rodapé. No mobile, o
   corpo vira: `[ seta-esq | mídia | seta-dir ]` em flex-row, com ✕ absoluto no
   canto. Sem título, sem label, sem contador.

3. **Responsividade por props do Chakra** (`base` = mobile, `md` = desktop),
   seguindo AGENTS.md — nada de `@media` manual. O bloco de título e o label
   ganham `display={{ base: 'none', md: ... }}`. As setas do rodapé ficam só no
   desktop; as setas laterais só no mobile.

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
