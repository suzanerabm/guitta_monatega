# Bichittos — montar só a criatura ativa (mount pattern)

**Data:** 2026-07-10
**Branch:** `fix/bichittos-mount-por-criatura`

## Problema

A página `/[locale]/bichittos` trava e "dá refresh do nada" (a aba recarrega
sozinha), tanto em dev quanto em produção, ao rolar. Investigação com Playwright
(Chrome real) mediu a causa:

- **223 tags `<img>` no DOM**, das quais **204 são eager** (sem `loading="lazy"`).
- Apenas **109 URLs únicas** — o `CharacterStrip` duplica os cards
  (`[...characters, ...characters]`) para o loop infinito, então cada imagem
  aparece 2×.
- As **5 criaturas ficam montadas ao mesmo tempo**: o filtro atual só aplica
  `opacity: 0` / `max-height: 0` (via prop `hidden` da `CreatureSection`), o DOM
  continua vivo.
- Zeco sozinho = 100 tags `<img>`.
- ~12 MB de imagens carregadas.

Resultado: pico de memória da aba alto o suficiente para o Chrome descartar e
recarregar a aba em devices de produção (especialmente mobile). Não reproduz em
desktop com RAM sobrando — por isso "parece intermitente".

Kammara teve o **mesmo problema** e já foi resolvido: removeu o botão "Todos" e
passou a montar **um mundo por vez** (`mount: activeFilter === w.id`, render
`!props.mount ? null : <WorldSection/>`). Este spec replica esse padrão na
bichittos.

## Objetivo

Sempre exatamente **1 criatura montada** no DOM. As inativas não são renderizadas
(saem da memória), derrubando o pico de ~220 para ~20–40 imagens.

## Escopo

**Incluído:** replicar o mount pattern do kammara na bichittos (tirar "Todos",
montar só a criatura ativa, sincronizar com a URL).

**Fora de escopo (follow-up):**

- Otimização/compressão dos arquivos de imagem em `public/imgs/bichittos/`.
- 404 de `/imgs/bichittos/_bg/miscelania.png` (arquivo não existe; as outras
  criaturas usam `.jpg`, a miscelania aponta para `.png` inexistente). Cosmético,
  independente do crash.
- `loading="lazy"` no `CharacterCard` e a duplicação do loop no `CharacterStrip`
  — não são necessários uma vez que só 1 criatura monta; podem ser otimização
  futura.

## Arquitetura

Três mudanças, espelhando `KammaraClient` + `resolveInitialFilter`.

### 1. `resolveInitialBichitto.ts` (novo)

Arquivo em `src/app/[locale]/bichittos/`, mesma lógica de
`kammara/resolveInitialFilter.ts`:

```
resolveInitialBichitto(param, publishedIds):
  - param ausente/vazio → primeira criatura publicada (napcat)
  - param que casa criatura publicada → essa criatura
  - param inválido / não-publicado → primeira criatura publicada
```

Diferença do kammara: kammara tem uma seção "kammara" (intro do universo) sempre
montada como default. A bichittos **não tem intro** — o default é a primeira
criatura publicada (napcat).

### 2. `BichittosClient.tsx`

- Imports: `useRouter, usePathname, useSearchParams` de `next/navigation`.
- Estado inicial:
  ```
  const publishedIds = filters.map(f => f.id)   // já filtrados por isBichittoPublished
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialBichitto(searchParams.get('bichitto'), publishedIds))
  ```
- `handleSelectFilter(id)` (substitui o `setActiveFilter` cru passado ao
  FilterBar):
  ```
  setActiveFilter(id)
  const params = new URLSearchParams(searchParams.toString())
  params.set('bichitto', id)
  router.replace(`${pathname}?${params}`, { scroll: false })
  ```
- Render das criaturas: trocar o `hidden`-based por **mount condicional**:
  ```
  {data.map((creature) =>
    creature.id !== activeFilter ? null : (
      <CreatureSection key={creature.id} ...>  // sem prop `hidden`
        ...
      </CreatureSection>
    ))}
  ```
- `useEffect` de scroll ao trocar de criatura (espelho de KammaraClient
  ll. 417–446): após a nova seção montar, rolar para logo abaixo do FilterBar
  usando `[data-section-creature="${activeFilter}"]`, com um pequeno timeout para
  o layout assentar.

### 3. `FilterBar` (uso, sem mudar o componente)

```
<FilterBar
  filters={filters}
  showAll={false}
  defaultActive="napcat"       // ou publishedIds[0]
  active={activeFilter}
  onFilter={handleSelectFilter}
/>
```

O `FilterBar` já suporta modo controlado (`active`) e `showAll={false}` — é a
mesma API que o kammara usa. Quando `active` é passado, o FilterBar pula o scroll
interno dele (a página assume o scroll, evitando double-scroll).

## O que NÃO muda

`CharacterStrip`, `CharacterCard`, `DSMainCard`, `CreatureSection`,
`FilterBar` (componente). A duplicação do loop continua, mas de 1 criatura por
vez.

## Verificação

- Playwright: abrir `/pt/bichittos`, contar `<img>` no DOM → deve cair de ~223
  para a faixa de uma criatura (~20–60 conforme a criatura).
- Trocar filtro → só a criatura ativa presente; a URL vira `?bichitto=<id>`.
- Recarregar com `?bichitto=zeco` → abre no zeco.
- `?bichitto=inexistente` → cai no napcat.
- Sem regressão visual na criatura ativa (strip, vídeo, livros).

## Follow-ups (tarefas separadas)

1. Otimizar imagens de `public/imgs/bichittos/` (compressão/resize via `scripts/`).
2. Corrigir 404 do `_bg/miscelania.png`.
3. Considerar `loading="lazy"` + `decoding="async"` no `CharacterCard` como
   defesa adicional.
