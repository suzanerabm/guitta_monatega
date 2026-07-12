import type { MetadataRoute } from 'next';

// Base URL do site. Em produção a Vercel expõe o host em VERCEL_URL, mas como
// há 3 domínios apontando pro mesmo app, preferimos uma env explícita
// (NEXT_PUBLIC_SITE_URL) quando definida; senão caímos no domínio principal.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://guittamonatega.com';

/**
 * robots.txt gerado pelo Next (App Router).
 *
 * Estratégia:
 *  - Buscadores legítimos (Googlebot, Bingbot) e o público geral: liberados,
 *    pra o site ser encontrado.
 *  - Crawlers de treinamento de IA: bloqueados por nome. É um PEDIDO (bots
 *    bem-comportados respeitam; scraper malicioso ignora — o bloqueio técnico
 *    de verdade vem da Cloudflare/Bot Fight Mode).
 */
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    'GPTBot', // OpenAI
    'OAI-SearchBot', // OpenAI search
    'ChatGPT-User', // OpenAI plugins
    'CCBot', // Common Crawl (alimenta muitos LLMs)
    'Google-Extended', // treino do Gemini (≠ Googlebot da busca)
    'Bytespider', // ByteDance / TikTok
    'Meta-ExternalAgent', // Meta AI
    'anthropic-ai', // Anthropic
    'ClaudeBot', // Anthropic
    'PerplexityBot', // Perplexity
    'Amazonbot', // Amazon
    'Applebot-Extended', // treino da Apple (≠ Applebot da busca)
    'cohere-ai', // Cohere
    'Diffbot',
    'ImagesiftBot',
  ];

  return {
    rules: [
      // Buscadores que queremos: liberados.
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      // Crawlers de IA: bloqueados.
      ...aiBots.map((userAgent) => ({ userAgent, disallow: '/' })),
      // Todo o resto (pessoas, buscadores não listados): liberado.
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
