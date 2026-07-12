# 🖼️  Image weight audit

_Generated 2026-07-12 00:41:25_

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
| Total de imagens | **977** |
| Peso total | **188.1 MB** |
| Acima do alvo (ideal por tipo) | **19** (2%) |
| Críticos (> 2× o alvo) | **9** |

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
| `kammara` | 562 | 168.6 MB |
| `art` | 276 | 10.7 MB |
| `bichittos` | 125 | 7.3 MB |
| `books` | 9 | 1.3 MB |
| `banners` | 5 | 251 KB |

## Top 30 arquivos mais pesados

| Peso | Classificação | Caminho |
|---|---|---|
| 5.7 MB | 🔴 crítico (background (longest side 1920, JPG 82%)) | `imgs/kammara/digg/_bg/digg_vista-gigapixel.png` |
| 4.0 MB | 🔴 crítico (scene (longest side 1200, JPG 82%)) | `imgs/kammara/z1/_scenes/CENTRAL_SQUARE.png` |
| 3.7 MB | 🔴 crítico (scene (longest side 1200, JPG 82%)) | `imgs/kammara/z1/_scenes/Vila.png` |
| 2.6 MB | 🔴 crítico (character / misc) | `imgs/kammara/gotto/daryun.png` |
| 2.6 MB | 🔴 crítico (character / misc) | `imgs/kammara/gotto/daryun_back.png` |
| 2.4 MB | 🔴 crítico (character / misc) | `imgs/kammara/triplec/sharp/Veris_Anon.png` |
| 2.4 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `imgs/kammara/digg/_scenes/NinhO_Zin.png` |
| 2.3 MB | 🔴 crítico (character / misc) | `imgs/kammara/digg/ZIN_costas.png` |
| 2.3 MB | 🔴 crítico (character / misc) | `imgs/kammara/orfv/velo.png` |
| 2.1 MB | 🔴 crítico (character / misc) | `imgs/kammara/triplec/mesh/EllenVar.png` |
| 1.9 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `imgs/kammara/triplec/_scenes/5EruRin_com_NERAN_VEL.png` |
| 1.9 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `imgs/kammara/gotto/_scenes/Vila_Central_vista.png` |
| 1.8 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `imgs/kammara/digg/_scenes/CHMURKA_eating.png` |
| 1.6 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `imgs/kammara/gotto/_scenes/kirio_comendo.png` |
| 1.4 MB | 🟠 acima (character / misc) | `imgs/kammara/orfv/zupi_costas.png` |
| 1.3 MB | 🟠 acima (character / misc) | `imgs/kammara/gotto/jump.png` |
| 970 KB | 🟠 acima (character / misc) | `imgs/kammara/digg/CHMURKA_com_bolacha.png` |
| 801 KB | 🟠 acima (character / misc) | `imgs/kammara/digg/Nihrak_frente.png` |
| 779 KB | 🟠 acima (character / misc) | `imgs/kammara/digg/ORVIN.png` |

## Todos acima do alvo, agrupados por pasta

### `imgs/kammara/digg/` — 4.8 MB em 4 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.3 MB | 🔴 crítico (character / misc) | `ZIN_costas.png` |
| 970 KB | 🟠 acima (character / misc) | `CHMURKA_com_bolacha.png` |
| 801 KB | 🟠 acima (character / misc) | `Nihrak_frente.png` |
| 779 KB | 🟠 acima (character / misc) | `ORVIN.png` |

### `imgs/kammara/digg/_bg/` — 5.7 MB em 1 arquivo

| Peso | Classificação | Arquivo |
|---|---|---|
| 5.7 MB | 🔴 crítico (background (longest side 1920, JPG 82%)) | `digg_vista-gigapixel.png` |

### `imgs/kammara/digg/_scenes/` — 4.2 MB em 2 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.4 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `NinhO_Zin.png` |
| 1.8 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `CHMURKA_eating.png` |

### `imgs/kammara/gotto/` — 6.6 MB em 3 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.6 MB | 🔴 crítico (character / misc) | `daryun.png` |
| 2.6 MB | 🔴 crítico (character / misc) | `daryun_back.png` |
| 1.3 MB | 🟠 acima (character / misc) | `jump.png` |

### `imgs/kammara/gotto/_scenes/` — 3.5 MB em 2 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 1.9 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `Vila_Central_vista.png` |
| 1.6 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `kirio_comendo.png` |

### `imgs/kammara/orfv/` — 3.7 MB em 2 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.3 MB | 🔴 crítico (character / misc) | `velo.png` |
| 1.4 MB | 🟠 acima (character / misc) | `zupi_costas.png` |

### `imgs/kammara/triplec/_scenes/` — 1.9 MB em 1 arquivo

| Peso | Classificação | Arquivo |
|---|---|---|
| 1.9 MB | 🟠 acima (scene (longest side 1200, JPG 82%)) | `5EruRin_com_NERAN_VEL.png` |

### `imgs/kammara/triplec/mesh/` — 2.1 MB em 1 arquivo

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.1 MB | 🔴 crítico (character / misc) | `EllenVar.png` |

### `imgs/kammara/triplec/sharp/` — 2.4 MB em 1 arquivo

| Peso | Classificação | Arquivo |
|---|---|---|
| 2.4 MB | 🔴 crítico (character / misc) | `Veris_Anon.png` |

### `imgs/kammara/z1/_scenes/` — 7.7 MB em 2 arquivos

| Peso | Classificação | Arquivo |
|---|---|---|
| 4.0 MB | 🔴 crítico (scene (longest side 1200, JPG 82%)) | `CENTRAL_SQUARE.png` |
| 3.7 MB | 🔴 crítico (scene (longest side 1200, JPG 82%)) | `Vila.png` |

