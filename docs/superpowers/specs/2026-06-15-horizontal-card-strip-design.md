# HorizontalCardStrip + carrossel de eventos (mobile)

**Data:** 2026-06-15
**Status:** aprovado, pronto pra implementação

## Problema

Na seção de eventos do Kammara (`KammaraEvents`), os cards empilham em lista
vertical no mobile — um embaixo do outro. O grid usa `base: '1fr'` (uma coluna),
o que força o empilhamento. Queremos os cards lado-a-lado num strip horizontal
deslizável, igual aos personagens fazem, mas **com visual próprio** (não o mesmo
componente dos personagens).

## Decisões

- **Strip horizontal em todos os breakpoints** (não híbrido grid/strip): setas
  `⊷`/`⊶` no desktop, swipe nativo no mobile. Consistente com o idiom que o
  `SubSystem` já usava.
- **Componente novo genérico** `HorizontalCardStrip` — não acoplado a evento,
  personagem ou subsystem. Cuida só do scroll/setas/swipe; quem usa passa os
  cards já renderizados.
- **Largura do card vem de quem renderiza**, não do strip. Mais flexível e
  reusável.
- **Um strip por categoria**: mantém o agrupamento atual de eventos. Cada
  categoria (com seu subtítulo) vira um strip independente.
- **`SubSystem` fica quieto**: está órfão (nenhum import real, só menções em
  comentário). Não refatoramos nem deletamos nesta tarefa — fora de escopo.

## Componente: HorizontalCardStrip

Local: `src/components/HorizontalCardStrip/`
Arquivos: `HorizontalCardStrip.tsx`, `.stories.tsx`, `.test.tsx`, `index.ts`

Responsabilidade única: tornar uma fileira de children deslizável na horizontal,
com controles de seta no desktop e swipe no mobile.

### Interface

```ts
interface HorizontalCardStripProps {
  children: ReactNode;        // cards já renderizados por quem usa
  arrowColor?: string;        // cor das setas ⊷ ⊶ (default: glyphIdle do tema)
  gap?: string;               // espaçamento entre cards (default '1.5rem')
  cardPadding?: string;       // padding interno do track (default responsivo)
  'data-testid'?: string;
}
```

### Comportamento

- `scrollRef` num container `overflowX: auto`, scrollbar oculta
  (`scrollbarWidth: none` + `::-webkit-scrollbar { display: none }`).
- Estado `canPrev` / `canNext` atualizado no evento de scroll (passive):
  `canPrev = scrollLeft > 2`, `canNext = scrollLeft + clientWidth < scrollWidth - 2`.
- Botões `⊷` (prev) e `⊶` (next):
  - Ocultos no mobile via `@media (max-width: 48em)` (breakpoint canônico `md`)
    — rely no swipe nativo.
  - Cor habilitada = `arrowColor` (ou `glyphIdle`); desabilitada = `glyphDisabled`.
  - `scrollBy({ left: ±step, behavior: 'smooth' })`.
- Track: `display: flex`, `gap`, `width: max-content`; cada child encapsulado
  num wrapper `flexShrink: 0` (a largura do card é definida pelo child).
- Máscara de fade nas bordas
  (`linear-gradient(to right, transparent, black 3%, black 97%, transparent)`).
- Sem `@media` manual em `css` de componente além do toggle das setas, que é a
  exceção aceita (descendente `& .arrow`). Usa breakpoint canônico `48em`.

### Tema / convenções

- Setas usam `fontFamily="glyph"`, `fontSize="glyphH1"` (tokens existentes).
- Cores das setas via tokens `glyphIdle` / `glyphDisabled` (já usados pelo
  SubSystem).
- Nenhum valor visual hardcoded fora dos tokens.

## Mudança no KammaraEvents

- `CategoryBlock` (`KammaraEvents.tsx:218-237`): troca o
  `<Box display="grid" gridTemplateColumns={...}>` por
  `<HorizontalCardStrip arrowColor={color}>` envolvendo os `<EventCard>`.
- `EventCard` ganha largura responsiva própria, já que o grid não controla mais:
  envolver o `KammaraEventCard` num `Box width={{ base: '85vw', md: '320px' }}`
  `maxW={{ base: '480px', md: 'none' }}` (espelha o que o SubSystem fazia).
- Cabeçalho da categoria (subtítulo + glyph) permanece inalterado, fora do strip.

## Testes

- `HorizontalCardStrip.test.tsx`:
  - renderiza todos os children;
  - botões prev/next presentes no DOM (com `aria-label`);
  - container scrollável presente (`data-testid`).
- `KammaraEvents.test.tsx`: atualizar qualquer assert que dependa do grid antigo;
  garantir que os cards de evento continuam renderizando dentro do strip.

## Fora de escopo

- Refactor ou deleção do `SubSystem` (órfão).
- Revisão do PT-BR / EN do tripleC (tarefa separada, do início da sessão).
- Mudar o layout dos personagens.
