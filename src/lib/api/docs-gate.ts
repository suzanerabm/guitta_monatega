// Interruptor da documentação da API (`/api-docs` e `/api/v1/openapi.json`).
//
// DESABILITADA POR PADRÃO, em qualquer ambiente. Ligue com `API_DOCS=true` —
// no dia a dia, uma linha no `.env.local`; em produção, só se alguém decidir
// publicar a doc de propósito.
//
// A variável NÃO leva o prefixo `NEXT_PUBLIC_`: o gate roda no servidor (a rota
// responde 404) e não precisa chegar ao navegador. Se levasse, o valor seria
// embutido no bundle do cliente sem necessidade.

/**
 * Lido em escopo de módulo, como `showAll` em `src/lib/visibility.ts`.
 * A expressão `process.env.API_DOCS` aparece inteira e literal porque é assim
 * que o bundler do Next a substitui no build.
 */
export const API_DOCS_ENABLED = process.env.API_DOCS === "true";
