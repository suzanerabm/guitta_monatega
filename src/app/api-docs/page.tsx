import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiDocs } from '@/components/ApiDocs';
import { API_DOCS_ENABLED } from '@/lib/api/docs-gate';
import { openApiDocument } from '@/lib/api/openapi';

export const metadata: Metadata = {
  title: 'API de conteúdo — documentação',
  // A doc não deve ser indexada mesmo quando ligada de propósito.
  robots: { index: false, follow: false },
};

/**
 * Documentação da API, fora de `[locale]` porque não é conteúdo do site —
 * é ferramenta, e existe num idioma só. O middleware do next-intl já ignora
 * caminhos que começam com `api`, então não há redirect de locale aqui.
 *
 * Desabilitada por padrão: sem `API_DOCS=true` a rota é um 404 comum.
 */
export default function ApiDocsPage() {
  if (!API_DOCS_ENABLED) notFound();

  return (
    <ApiDocs
      doc={openApiDocument as unknown as Record<string, unknown>}
      specUrl="/api/v1/openapi.json"
    />
  );
}
