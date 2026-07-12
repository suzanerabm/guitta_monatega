# 🖼️  Image weight audit

_Generated 2026-07-12 00:52:43_

## Pipeline

Imagens em `public/imgs/` são processadas por 3 scripts em `scripts/`
(rode tudo com `npm run prepare-art`):

1. **`resize-art-fulls.ts`** — resize in-place via macOS `sips`, normaliza pra `.jpg`.
   Targets atuais:
   - `art/<section>/*` → longest side 500, JPG 82
   - `kammara/**/_scenes/*` → longest side 1200, JPG 82
   - `kammara/**/_subsystems/*` → longest side 2000, JPG **85** (near-full-width)
   - `{kammara,bichittos}/**/_bg/*` → longest side 1920, JPG 82

   Após renomear `.png`→`.jpg`, o script reescreve referências em `src/data/**/*.json`
   pra ficar em sync com o disco. Inclui passada de **reconciliação** que cura refs
   `.png/.jpeg/.webp/.heic` órfãs trocando por `.jpg` quando o sibling existe.

2. **`generate-thumbs.ts`** — recria `art/<section>/_thumb/*.jpg` longest side 300, JPG 75.
   Wipa o folder antes de gerar pra remover thumbs órfãos.

3. **`audit-images.ts`** — gera este report. Top 30 só lista arquivos acima do alvo.

**Padrão:** PNG só pra UI / transparência crítica. Arte vai como JPG 82-85% — o sweet
spot onde o ganho de peso é máximo sem perda visual perceptível.

## Resumo

| Métrica | Valor |
|---|---|
| Total de imagens | **976** |
| Peso total | **143.6 MB** |
| Acima do alvo (ideal por tipo) | **0** (0%) |
| Críticos (> 2× o alvo) | **0** |

## Alvos por tipo de imagem

| Pasta | Alvo ideal | Crítico | Uso |
|---|---|---|---|
| `_bg` | 1.5 MB | 5.0 MB | background (longest side 1920, JPG 82%) |
| `_scenes` | 1.0 MB | 3.0 MB | scene (longest side 1200, JPG 82%) |
| `_subsystems` | 1.6 MB | 4.0 MB | subsystem (longest side 2000, JPG 85%) |
| `_thumb` | 60 KB | 150 KB | art thumb (longest side 300, JPEG 75%) |
| `default` | 600 KB | 2.0 MB | character / misc |

## Peso por pasta (top-level dentro de `public/imgs`)

| Pasta | Imagens | Peso |
|---|---|---|
| `kammara` | 561 | 124.5 MB |
| `art` | 276 | 10.7 MB |
| `bichittos` | 125 | 6.9 MB |
| `books` | 9 | 1.3 MB |
| `banners` | 5 | 251 KB |

## Top 30 arquivos mais pesados

_Nenhum arquivo acima do alvo 🎉_

## Todos acima do alvo, agrupados por pasta

_Tudo dentro do alvo 🎉_
