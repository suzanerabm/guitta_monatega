# Design — Capa EPUB derivada do KammaraSagaPoster

**Data:** 2026-07-15
**Objetivo:** Gerar uma imagem estática de alta resolução (capa de e-book EPUB) a
partir do componente `KammaraSagaPoster`, numa proporção 1:1,6 vertical.

## Entregável final

- Arquivo: `public/imgs/kammara/capa_kammara_saga.jpg`
- Dimensões: **1600 × 2560 px** (proporção 1:1,6)
- Formato: **JPG, RGB, qualidade 92** (padrão de capa EPUB; TIFF não é aceito por readers)

## Decisões de composição (fechadas com a usuária)

1. **Proporção:** derivação do componente para 1:1,6 (não exportar o 2:3 original como está).
2. **Espaço vertical extra:** heróis e discos mantêm o mesmo tamanho; o espaço a mais
   (a moldura 1:1,6 é mais alta que a 2:3) vira respiro de céu/fundo no topo. Mudança
   mínima no original.
3. **Título/rodapé:** mantidos como no componente — título "KAMMARA / A·S·A·G·A" grande
   acima do rodapé, label "UNIVERSO" no topo, rodapé "Kammara".
4. **Animações:** congeladas num frame bonito — moldura no pico do glow (sem pulse),
   orbes FairyDust visíveis.
5. **Método:** screenshot via navegador headless (Playwright), renderizando o componente
   numa rota real.

## Arquitetura — 3 peças

### 1. Componente derivado `KammaraSagaPosterCover`

Pasta padrão: `src/components/KammaraSagaPosterCover/{KammaraSagaPosterCover.tsx,
.stories.tsx, .test.tsx, index.ts}`.

- **Reusa** `KammaraSagaPoster` internamente — não duplica a composição de heróis/discos.
- Envolve num container que força `aspectRatio: 1000 / 1600` (0,625) em vez do
  `360 / 540` do original.
- Como a moldura da razão vem do container pai (não do componente), o wrapper controla
  a proporção; o `KammaraSagaPoster` preenche 100% via `width/height`.
- Heróis mantêm `bottom/height` originais (respiro no topo). Só se algum herói estourar
  a borda inferior nessa proporção, ajusto pontualmente via prop `heroes` (o componente
  já aceita override — zero mudança no original para o caso normal).

### 2. Prop `frozen` no `KammaraSagaPoster` (única mudança no original)

Adicionar `frozen?: boolean` (default `false`) a `KammaraSagaPosterProps`:

- Quando `true`: substituir `animation: 'ksp-pulse ...'` por um `boxShadow` fixo no pico
  do glow (o estado 50% do keyframe). Sem alterar o visual quando `frozen` é `false`.
- Orbes FairyDust: continuam renderizando; o "congelamento" real do frame vem do
  screenshot. Se necessário, aplicar `animationDelay` negativo para pegar um instante
  em que as partículas já estão dispersas (bom visual).

Isso mantém o componente de produção intocado (default `false`) e não espalha valores —
o boxShadow de pico já existe no keyframe, só é promovido a estado estático.

### 3. Rota de export `src/app/[locale]/_export/cover/page.tsx`

- Prefixo `_export` marca rota fora do fluxo do site.
- Renderiza só `KammaraSagaPosterCover` num container de 1000×1600 px, sem chrome,
  sem padding, fundo transparente/escuro.
- `frozen` ativado.

### 4. Script `scripts/export-cover.ts`

Segue o padrão `scripts/*.ts` (tsx, sharp já usado no projeto):

1. Usa o Next dev server (assume rodando em `localhost:3000`, ou sobe se preciso).
2. Playwright: abre `/pt/_export/cover` (ou locale default) com viewport 1000×1600 e
   `deviceScaleFactor: 1.6` → screenshot nativo em 1600×2560.
3. Espera `networkidle` + carregamento das `<img>` (fundo, heróis, discos) antes do shot.
4. `sharp`: garante RGB, converte PNG→JPG qualidade 92, salva em
   `public/imgs/kammara/capa_kammara_saga.jpg`.
5. Loga dimensões e caminho final.

## Testes

- `KammaraSagaPosterCover.test.tsx`: renderiza, checa que o poster interno aparece
  (`data-testid`) e que o container aplica a razão 1:1,6.
- Verificação end-to-end: rodar o script e conferir que a imagem sai 1600×2560 JPG RGB
  (via `sharp metadata` ou `file`/`identify`).

## Fora de escopo (YAGNI)

- Não gerar a versão 2:3 (usuária escolheu só a derivação 1:1,6).
- Não gerar TIFF (EPUB não usa).
- Não parametrizar múltiplos tamanhos de capa — só o 1600×2560 pedido.
