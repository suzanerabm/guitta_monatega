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
