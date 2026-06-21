# Performance Kammara — vídeos e imagens travando no servidor

**Data:** 2026-06-21
**Status:** diagnóstico + plano (a implementar)
**Sintoma:** a página `/kammara` trava no servidor. Vídeos mal abrem, "somem",
não paginam, tudo lento. Vai piorar — virão muito mais imagens e vídeos.

---

## 1. Causa raiz (medida, não suposta)

A página `/kammara` monta **TUDO de uma vez**, sem desmontar nada:

| Asset | Quantidade | Peso |
|---|---|---|
| Imagens (kammara) | **431 arquivos** | **314 MB** |
| Vídeos (mp4+webm, já otimizados) | 37 mp4 | 15 MB |
| Vídeos `<video autoPlay>` no DOM | **~74** (duplicados) | — |

Três multiplicadores de dano, todos confirmados no código:

### 1a. O filtro "Todos" não desmonta — só esconde
- `KammaraClient.tsx:416` → `hidden = activeFilter !== 'all' && activeFilter !== w.id`
- `CreatureSection.tsx:56-57` → `hidden` aplica `opacity: 0` + `maxHeight: 0`.
- **Resultado:** mudar de aba/filtro NÃO descarrega nada. Todos os 6 mundos +
  3 regiões continuam montados e baixando, mesmo invisíveis. O default é
  `'all'` (`KammaraClient.tsx:312`), então no primeiro load tudo carrega.

### 1b. Vídeos do Drops duplicados no DOM
- `KammaraDropsStrip.tsx` renderiza **dois blocos** (mobile + desktop), e o CSS
  só esconde um. Cada drop vira **2 `<video>`**. 37 drops → ~74 `<video>`.
- Todos com `autoPlay loop muted preload="metadata"`
  (`KammaraDropsStrip.tsx:415-428`). `autoPlay` força o navegador a baixar e
  decodificar o vídeo imediatamente — dezenas em paralelo = congestão.

### 1c. Imagens sem otimização nem lazy consistente
- **`next/image` não é usado em lugar nenhum** (`grep` retornou vazio). Tudo é
  `<img>` cru ou `<Image>` do Chakra → sem `srcset` responsivo, sem WebP/AVIF
  automático, sem redimensionar por viewport. 314 MB servidos no tamanho cheio.
- `KammaraSceneCollage.tsx:198,279` → imagens com `loading="eager"` (força
  download imediato).
- `next.config.ts` → sem bloco `images`, sem `Cache-Control` para assets.

---

## 2. O que a Suzane decidiu (diretrizes desta sessão)

1. **Tirar/repensar a opção "Todos"** — ao abrir, carregar só o mundo da aba
   ativa; carregar os outros só quando a aba é aberta pela primeira vez.
2. **Lazy loading** — não baixar tudo de uma vez; carregar sob demanda.
3. **Cache** — depois de carregado uma vez, guardar pra não rebaixar.
4. **Vídeos não começam com play ativo** e **não baixam todos de uma vez** —
   só tocam/baixam quando entram em tela (ou no hover/clique).

---

## 3. Plano priorizado (do maior impacto / menor risco pro maior esforço)

### FASE 1 — parar o sangramento (rápido, alto impacto)

**1.1 Vídeo: matar autoplay-em-massa + duplicação**
- Remover `autoPlay` dos cards. Tocar só quando o card está **visível**
  (IntersectionObserter) — e idealmente um de cada vez / poucos.
- `preload="none"` em vez de `"metadata"` (só baixa ao tocar). O `poster`
  (já existe pra cada drop) segura o visual sem baixar o vídeo.
- Resolver a duplicação mobile/desktop: renderizar o `<video>` uma vez e
  trocar só o layout, OU montar o bloco do breakpoint atual.
- Arquivos: `KammaraDropsStrip.tsx`, `SceneStrip.tsx`.

**1.2 Imagens: lazy em tudo**
- `loading="lazy"` + `decoding="async"` em todo `<img>`; trocar
  `loading="eager"` por `lazy` em `KammaraSceneCollage.tsx:198,279`.
- Conferir `DSMainCard.tsx:214` e `KammaraCharacterCard` (Chakra `<Image>`).

**1.3 next.config: cache + otimização de imagem**
- Adicionar bloco `images` (formats AVIF/WebP, `deviceSizes`) e
  `Cache-Control: public, max-age=31536000, immutable` pra `/imgs/*` e
  `/_next/image`.

### FASE 2 — só carregar o mundo ativo (médio esforço, resolve a raiz)

**2.1 Desmontar mundos inativos**
- Trocar o `hidden` (opacity/maxHeight) por **render condicional**: a
  `CreatureSection` de um mundo só monta quando `activeFilter === 'all'` **ou**
  `=== w.id`. Mundos fora do filtro saem do DOM (e param de baixar).
- **Cache de "já visto":** manter um `Set` de mundos já abertos; uma vez
  montado, manter montado (evita rebaixar ao voltar). Assim "abre na primeira
  vez e fica em cache" — exatamente o que a Suzane pediu.
- Repensar o default `'all'`: talvez abrir já num mundo (ou num "resumo" leve)
  em vez de montar os 9 de uma vez.
- Arquivos: `KammaraClient.tsx` (`hidden` → render condicional + Set de vistos),
  `CreatureSection.tsx`.

### FASE 3 — migrar imagens pra next/image (maior esforço, melhor resultado)

- Migrar `<img>`/Chakra `<Image>` → `next/image` com `sizes` corretos.
  Reduz drasticamente os 314 MB (serve WebP/AVIF no tamanho do viewport).
- Fazer por componente, começando pelos mais pesados (cenas, personagens).

---

## 4. Backlog (anotado pra NÃO esquecer — fazer depois, NÃO agora)

> A Suzane pediu explicitamente pra registrar e adiar:

- **Leitura mobile mais agradável.** No celular:
  - Abrir o **vídeo em tela cheia** (ocupar a tela inteira do celular).
  - Abrir as **imagens em tela cheia** também.
  - **Repensar o modal** no mobile (layout atual não está bom).
- (Adicionar aqui outros itens que surgirem.)

---

## 5. Próximo passo imediato

Implementar **FASE 1** primeiro (autoplay/preload dos vídeos + lazy das imagens),
medir, e só então ir pra FASE 2 (desmontar mundos inativos). FASE 3 fica para
depois, componente a componente.
