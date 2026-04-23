<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions — READ BEFORE EDITING

## Reuse existing components
Sempre use os componentes que já existem em `src/components/`. Só crie um componente novo quando
realmente não há nada que sirva. Não duplique lógica em páginas / clients quando já existe um
componente encapsulando aquilo (ex: hero, strip, card, banner, panel, etc).

Quando criar um componente novo, siga o padrão da pasta:
`ComponentName/{ComponentName.tsx, ComponentName.stories.tsx, ComponentName.test.tsx, index.ts}`.

## Styling: tudo no theme, nada espalhado
NUNCA espalhe valores visuais (cores, fontes, pesos, letter-spacing, tamanhos, sombras, etc) pelo
código. Tudo vem das folhas de estilo centrais em `src/theme/`:

- `tokens.ts` — cores, fontSizes, fontWeights, letterSpacings, spacing, shadows, durations
- `palettes.ts` — paletas por criatura/mundo
- `creatures.ts` — aliases semânticos por criatura
- `artSections.ts` — configs das seções de arte
- (futuro) `textStyles.ts` — combinações de fontSize + fontWeight + letterSpacing + textTransform

Regras:
1. **Proibido** hex codes (`#fff`), rgba literais, `fontWeight="bold"` hardcoded, `fontSize="1.2rem"`,
   `letterSpacing="0.1em"` em código de componente. Sempre use tokens (`color="ink"`,
   `fontSize="h2"`, `fontWeight="semibold"`, `letterSpacing="wider"`).
2. Se o token certo não existe, **crie o token** em `tokens.ts` (ou a textStyle apropriada) em vez
   de colocar o valor direto no componente.
3. Se uma mudança visual afetaria mais de um componente (ex: "deixar todas as labels bold"), a
   resposta é **mudar no theme, uma vez**, nunca editar N componentes trocando props. Tokens
   existem exatamente pra isso.
4. Exceções aceitáveis (valores inline) são casos realmente particulares: uma animação única de um
   componente, um posicionamento pontual, um override isolado. Em caso de dúvida, pergunte antes
   de espalhar.

## Responsividade: props do Chakra, nunca `@media` manual

A única forma aceita de escrever estilos responsivos neste projeto é pelo sistema de breakpoints
do Chakra — objetos `{ base, sm, md, lg, xl, '2xl', '3xl' }` nas props normais do componente.
Migramos pra Chakra exatamente pra parar de escrever CSS manual; voltar a escrever `@media` é
regressão.

Regras:
1. **Proibido** `css={{ '@media (min-width: ...)': { ... } }}` em componentes. Também proibido
   `@media (max-width)` — use `base` (default do menor breakpoint) + sobrescreva no breakpoint
   superior.
2. **Use props responsive**: `width={{ base: '100%', md: '60%', lg: '50%' }}`,
   `padding={{ base: '1rem', md: '2rem' }}`, `display={{ base: 'block', md: 'flex' }}`, etc.
3. Se o valor responsivo cresce muito (4+ breakpoints diferentes ou se aparece em N props),
   extraia numa variável `const foo: Record<string, string> = { base: ..., md: ..., lg: ... }`
   e use em `width={foo}`. Isso mantém o JSX legível sem cair em `@media`.
4. **Breakpoints canônicos** (definidos em `src/theme/index.ts`): `sm` 30em (480px), `md` 48em
   (768px), `lg` 62em (992px), `xl` 80em (1280px), `2xl` 94em (1500px), `3xl` 120em (1920px).
   Nunca invente breakpoints arbitrários (`118.75em`, `64em`) — se uma criatura precisa de um
   corte próprio, adicione um breakpoint ao tema ao invés de hard-coding no componente.
5. **`@media` só na `<style>` global** que injeta keyframes/reset — nunca dentro de `css={...}` de
   componente.
6. **Exceção A — descendentes**: estilos de descendentes com seletor (ex: `'& h2': { fontSize: ... }`)
   que precisam mudar por breakpoint podem usar `@media` dentro de `css={...}` — não dá pra
   expressar isso com props responsive porque o elemento alvo não é o Box. Ainda assim, use os
   breakpoints canônicos do tema (`48em`, `62em`, `80em`, `94em`, `120em`).
7. **Exceção B — CSS dinâmico**: objetos CSS construídos dinamicamente em loop (ex: posições
   absolutas por character no DSMainCard, variando por `md/xl/xxl` do config) podem usar chaves
   `@media` internamente porque Chakra props responsive não aceitam shapes dinâmicos. Use os
   breakpoints canônicos. Evite criar mais casos desses — só mantenha os que já existem.
