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
  components/        # componentes reutilizaveis (cada um em sua pasta)
  layouts/           # BaseLayout (header + breadcrumb + footer)
  page-content/      # conteudo das paginas (aceita locale prop)
  pages/             # rotas pt-BR (default)
  pages/en/          # rotas em ingles
  i18n/              # traducoes e helpers
  styles/            # tokens.css + global.css
  stories/           # stories de documentacao (design tokens)
public/
  imgs/              # todas as imagens
```

## Como adicionar imagens na galeria de arte

A galeria le as imagens automaticamente do filesystem. Basta colocar os arquivos nas pastas certas.

### Adicionar imagem a uma categoria existente

1. Coloque a **imagem original** (`.jpg`, `.jpeg` ou `.png`) na pasta da categoria:
   ```
   public/imgs/art/{categoria}/minha-foto.jpeg
   ```

2. Coloque o **thumbnail** (`.jpg`) na subpasta `_thumb/` com o **mesmo nome base**:
   ```
   public/imgs/art/{categoria}/_thumb/minha-foto.jpg
   ```

3. Rode `npm run dev` ou `npm run build` — a imagem aparece sozinha no grid.

O thumbnail aparece no grid da pagina. Ao clicar, o modal abre a imagem original em tamanho completo.

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

1. Crie as pastas:
   ```
   public/imgs/art/{nova-categoria}/
   public/imgs/art/{nova-categoria}/_thumb/
   ```

2. Em `src/page-content/ArtContent.astro`, adicione o id no array `sectionIds`:
   ```typescript
   const sectionIds = ['black', 'grafite', ..., 'nova-categoria'] as const;
   ```

3. No mesmo arquivo, adicione os metadados visuais em `sectionMeta`:
   ```typescript
   'nova-categoria': { bg: '#f0f0f0', titleColor: '#333', techColor: 'rgba(51,51,51,0.5)', large: false },
   ```

4. Adicione as traducoes em `src/i18n/pt-BR.ts` e `src/i18n/en.ts`:
   ```typescript
   // pt-BR.ts → art.sections
   'nova-categoria': { title: 'Nome em Portugues', technique: 'Descricao da tecnica' },

   // en.ts → art.sections
   'nova-categoria': { title: 'English Name', technique: 'Technique description' },
   ```

5. Coloque as imagens + thumbs nas pastas criadas no passo 1.

6. Rode `npm run build` — a nova categoria aparece automaticamente com filtro e galeria.
