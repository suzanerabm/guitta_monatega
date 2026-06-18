# Capa-pôster da saga Kammara

**Data:** 2026-06-18
**Status:** aprovado, pronto pra implementação

## Objetivo

Substituir o "EM BREVE" (`SoonPanel`) que fica no slot lateral da seção
**Universo** do Kammara por uma **capa estilo pôster de saga** (tipo
Star Wars): fundo cinematográfico de ORF-V, heróis recortados em primeiro
plano, título "KAMMARA / A·S·A·G·A".

## Decisões

- **Onde**: no slot lateral (children) do `DSMainCard` da seção Universo,
  em `KammaraClient.tsx` — exatamente onde hoje está `<SoonPanel>` (linha ~490).
- **Formato**: retrato 2:3 (pôster clássico), referência `capa2.jpg` do vault.
- **Heróis** (6): EruRin (centro/protagonista), Orvian, SELKA RIN, KAEL TORIN,
  LUMA VAL, Lumesha. Imagens já existentes em `public/imgs/...`.
- **Mobile**: escala proporcional — o pôster inteiro encolhe mantendo as
  posições relativas (posicionamento em %, não px). Fiel ao layout desenhado,
  sem reposicionar por breakpoint.
- **Interação**: só visual, não clicável.

## Componente: KammaraSagaPoster

Local: `src/components/KammaraSagaPoster/`
Arquivos: `KammaraSagaPoster.tsx`, `.stories.tsx`, `.test.tsx`, `index.ts`

### Interface

```ts
interface PosterHero {
  image: string;
  /** Âncora horizontal + offset, em % da largura do pôster. */
  side: 'left' | 'right' | 'center';
  x: number;        // % da largura (left/right: da borda; center: offset do meio)
  bottom: number;   // % da altura, a partir da base
  height: number;   // % da altura do pôster
  glow?: string;    // cor do drop-shadow (default da palette)
  brightness?: number;
  z?: number;
}

interface KammaraSagaPosterProps {
  /** Cena de fundo (path em /public). */
  background: string;
  /** Heróis posicionados. Default = composição da saga (6 heróis). */
  heroes?: PosterHero[];
  title?: string;        // default "KAMMARA"
  subtitle?: string;     // default "A · S · A · G · A"
  topLabel?: string;     // default "UNIVERSO"
  color?: string;        // accent (default palette kammara)
  darkColor?: string;
  'data-testid'?: string;
}
```

### Layout

- Container com `aspectRatio: '360 / 540'`, `width: 100%`, `maxW` para não
  estourar o slot, `borderRadius`, `overflow: hidden`, sombra/glow (tokens).
- Fundo `<img object-fit:cover>` + dois overlays (gradiente vertical roxo +
  vinheta radial) usando cores da palette `kammara`.
- Cada herói: `<Box position="absolute">` com `bottom`, `height` e
  `left/right` em **%**; `center` usa `left: calc(50% + x%)` + translateX(-50%).
  A imagem dentro é `height: 100%; width: auto`.
- Topo: label pequeno ("UNIVERSO"). Base: faixa de glow + título grande +
  subtítulo espaçado. z-index do título acima dos heróis.

### Conversão dos valores (px no pôster 360×540 → %)

Valores aprovados pelo usuário (px), convertidos:
- x left/right: `px / 360 * 100`
- bottom: `px / 540 * 100`
- height: `px / 540 * 100`

| Herói | side | x% | bottom% | height% |
|---|---|---|---|---|
| Orvian | left | 0.3 | 38.0 | 39.6 |
| SELKA RIN | right | -2.8 | 18.9 | 42.4 |
| KAEL TORIN | right | 17.2 | 33.3 | 28.9 |
| LUMA VAL | left | -2.2 | 9.6 | 24.8 |
| Lumesha | right | 0.8 | 10.9 | 18.9 |
| EruRin | center | +1 | 9.3 | 33.1 |

(z: EruRin 6, SELKA/LUMA/Lumesha 4, KAEL 3, Orvian 2.)

## Integração

`KammaraClient.tsx` (~linha 490): trocar
```jsx
<SoonPanel label={tCommon('soon')} />
```
por
```jsx
<KammaraSagaPoster background="/imgs/kammara/orfv/_scenes/9noite_em_orfv.jpg" />
```
(o componente já traz a composição default; só passamos o fundo.)

## Tokens / convenções

- Cores (accent, dark, overlays, título) via `palettes.kammara` e tokens do
  tema. Sem hex hardcoded em código de componente, exceto os filtros de glow
  por-herói (caso particular de composição, aceitável).
- Responsividade por escala proporcional (aspect-ratio + %), sem `@media`.

## Testes

- Renderiza o `<img>` de fundo e os 6 heróis (por `alt`/testid).
- Renderiza o título e o topLabel.
- (Sem interação a testar — não é clicável.)

## Fora de escopo

- Poses "estilo Star Wars" (braços cruzados): exigem **imagens novas** dos
  personagens. O componente posiciona o que existe; quando houver arte nova,
  é só trocar os paths.
- Link/clique (saga ORF-V) — pode ser ligado depois.
