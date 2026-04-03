# Guitta Monatega — Site

Site portfolio da Guitta Monatega. Astro 6, Lucide icons, i18n (pt-BR / en).

## Comandos

```bash
npm run dev          # dev server em localhost:4321
npm run build        # gera dist/
npm run preview      # preview do build
npm run storybook    # component library em localhost:6006
```

## Estrutura

```
src/
  components/        # componentes reutilizaveis (cada um em sua pasta com .stories.ts)
  layouts/           # BaseLayout (header + breadcrumb + footer)
  page-content/      # conteudo das paginas (aceita locale prop)
  pages/             # rotas pt-BR (default)
  pages/en/          # rotas em ingles
  i18n/              # traducoes e helpers
  styles/            # tokens.css (design tokens) + global.css
  stories/           # stories de documentacao (Foundation/Design Tokens)
  script/            # scripts de processamento de imagens
public/
  imgs/              # todas as imagens do site
```

## Galeria de arte

A galeria le imagens automaticamente do filesystem. O grid mostra thumbnails, o modal abre a imagem original.

### Adicionar imagens a uma categoria existente

1. Coloque as imagens originais na pasta da categoria:
   ```
   public/imgs/art/{categoria}/minha-foto.jpeg
   ```

2. Rode o script de processamento para gerar os thumbnails:
   ```bash
   python3 src/script/process_art.py
   ```

3. Rode `npm run dev` — as imagens aparecem no grid.

O script gera automaticamente o thumbnail em `_thumb/` (crop quadrado 800x800 com moldura branca, ajustes de contraste/nitidez). Tambem converte `.heic` para `.jpg`.

### Categorias existentes

| Pasta | Nome |
|---|---|
| `black` | Branco no Preto |
| `grafite` | Grafite |
| `doodle` | Doodle |
| `digital` | Arte Digital |
| `collections` | Colecoes |
| `fimo` | Pontilhismo |
| `needle` | Needle Felting |
| `clay` | Clay |
| `croche` | Croche |

### Criar uma categoria nova

1. Crie a pasta em `public/imgs/art/{nova-categoria}/` e coloque as imagens.

2. Rode `python3 src/script/process_art.py` para gerar os thumbnails.

3. Em `src/page-content/ArtContent.astro`, adicione o id no array `sectionIds`:
   ```typescript
   const sectionIds = ['black', 'grafite', ..., 'nova-categoria'] as const;
   ```

4. No mesmo arquivo, adicione os metadados visuais em `sectionMeta`:
   ```typescript
   'nova-categoria': { bg: '#f0f0f0', titleColor: '#333', techColor: 'rgba(51,51,51,0.5)', large: false },
   ```

5. Adicione as traducoes em `src/i18n/pt-BR.ts` e `src/i18n/en.ts`:
   ```typescript
   // pt-BR.ts → art.sections
   'nova-categoria': { title: 'Nome em Portugues', technique: 'Descricao da tecnica' },

   // en.ts → art.sections
   'nova-categoria': { title: 'English Name', technique: 'Technique description' },
   ```

6. Rode `npm run build` — a nova categoria aparece automaticamente com filtro e galeria.

### Remover imagens

Apague a imagem original da pasta. Na proxima vez que rodar `python3 src/script/process_art.py`, o thumbnail orfao sera removido automaticamente.

## Script de processamento de imagens

Setup (uma vez):

```bash
python3 -m venv src/script/.venv
source src/script/.venv/bin/activate
pip install -r src/script/requirements.txt
```

Rodar:

```bash
source src/script/.venv/bin/activate
python3 src/script/process_art.py
```

O que o script faz:
- Gera thumbnails (crop quadrado 800x800, moldura branca, ajustes de cor/nitidez) em `_thumb/`
- Converte `.heic` para `.jpg` na pasta raiz (remove o `.heic`)
- Remove thumbs orfaos (cuja original foi apagada)
- Incremental: so processa imagens novas (pula as que ja tem thumb)
- Efeito bokeh automatico nas categorias `croche`, `needle` e `clay`

## i18n

Idioma padrao: pt-BR (sem prefixo na URL). Ingles em `/en/`.

- Traducoes em `src/i18n/pt-BR.ts` e `src/i18n/en.ts`
- Toggle de idioma no header de todas as paginas
- Para adicionar texto traduzivel, edite os dois arquivos de traducao

## Design tokens

Cores, tipografia, espacamento e sombras centralizados em `src/styles/tokens.css`. Todos os componentes usam variaveis CSS em vez de cores hardcoded.

Documentacao visual no Storybook: `npm run storybook` → Foundation / Design Tokens.
