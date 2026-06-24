# Planeta ativo na URL (`?planeta=lunnp1`)

**Data:** 2026-06-24
**Arquivo:** `src/app/[locale]/kammara/KammaraClient.tsx`

## Problema

O planeta aberto vive só em `useState('kammara')` (memória do React). Dar
refresh perde o planeta e volta pra vitrine Kammara. Também não dá pra
compartilhar o link de um planeta nem medir (analytics) quais planetas as
pessoas mais abrem.

## Objetivo

Guardar o planeta ativo na URL como query param (`?planeta=lunnp1`). Refresh
mantém o planeta; o link é compartilhável; o param aparece no analytics.

## Decisões

- **Query param** (não hash, não sessionStorage): aparece na URL completa que o
  analytics registra (o `#hash` não chega ao servidor/GA), é compartilhável e é
  o padrão do Next.js (`useSearchParams`/`useRouter`).
- **`router.replace`** (não `push`): trocar de planeta NÃO empilha histórico —
  o botão "voltar" do navegador sai da página em vez de ficar preso navegando
  planeta a planeta.
- **Não cria rotas por planeta**: preserva a estratégia de performance atual
  (montar um mundo por vez). É só sincronizar o estado existente com a URL.

## Comportamento

1. **Ler no carregamento:** `activeFilter` inicia lendo `?planeta` da URL. Se o
   valor for um mundo **publicado** (passa em `isKammaraPublished`), abre nele;
   caso contrário (ausente, inválido, ou não-publicado), cai em `'kammara'`.
   A checagem de publicado evita forçar um planeta incompleto via link.
2. **Escrever ao trocar:** toda troca de planeta (menu, card de planeta, mosaico)
   passa por um único `handleSelectFilter(id)` que faz `setActiveFilter(id)` E
   atualiza a URL: `?planeta=<id>` para um mundo, e remove o param quando volta
   pra `kammara`. Usa `router.replace` com scroll preservado (o scroll-reset já
   é feito pelo effect existente que reage a `activeFilter`).
3. **Locale:** a URL base inclui o locale (`/pt/kammara`, `/en/kammara`). O
   param é adicionado por cima via `usePathname` + `useSearchParams`, sem mexer
   no locale.

## Arquitetura

Mudança contida em `KammaraClient.tsx`:

- `useSearchParams()`, `usePathname()`, `useRouter()` de `next/navigation`.
- O `useState` inicial lê o param uma vez (lazy initializer), validando contra
  `publishedWorlds`/`isKammaraPublished`.
- `handleSelectFilter(id)` substitui as referências diretas a `setActiveFilter`
  nos pontos de entrada (FilterBar `onFilter`, cards `onSelect`, mosaico
  `onSelectWorld`). Internamente chama `setActiveFilter` e `router.replace`.
- O `FilterBar` continua controlado por `active={activeFilter}` (já é hoje).

## Não-objetivos (YAGNI)

- Não criar rotas `/kammara/lunnp1`.
- Não persistir nada além do planeta (ex: posição de scroll, aba de subsistema).
- Não mexer no locale nem em outras páginas.

## Testes

`KammaraClient` é client-heavy; o teste foca na função de derivação:

- Dado `?planeta=lunnp1` (publicado) → estado inicial = `lunnp1`.
- Dado `?planeta=inexistente` ou um mundo não-publicado → estado inicial =
  `kammara`.
- Sem param → `kammara`.

Se a derivação ficar numa função pura exportável (ex.
`resolveInitialFilter(param, publishedIds)`), ela é testada isolada sem montar
o componente inteiro (que puxa muitos dados). O mock de `next/navigation` segue
o padrão já usado em `LanguageToggle.test.tsx`.
