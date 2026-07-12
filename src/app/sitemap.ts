import type { MetadataRoute } from 'next';

// Domínio RAIZ (guitta). Os outros domínios (kammara, bichittos) apontam pra
// rotas deste mesmo app, então o sitemap canônico mora aqui, na raiz.
// Sobrescreva com NEXT_PUBLIC_SITE_URL se o domínio principal mudar.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://guittamonatega.com';

const LOCALES = ['pt', 'en'] as const;
// Rotas públicas do app (sem locale — ele é prefixado abaixo).
const ROUTES = ['', 'kammara', 'bichittos', 'art', 'about', 'privacy'] as const;

/**
 * sitemap.xml gerado pelo Next (App Router).
 *
 * Uma entrada por rota × locale (o roteamento é /[locale]/rota). O `''`
 * cobre a home de cada locale (/pt, /en). Só listamos páginas públicas
 * estáveis — nada de conteúdo não-publicado.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}
