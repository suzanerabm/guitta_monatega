import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Content-Security-Policy — controla de onde cada tipo de recurso pode
// carregar, reduzindo a superfície pra injeção de conteúdo/XSS. Calibrado
// pro que o site REALMENTE usa:
//  - Google Fonts (fonts.googleapis.com CSS + fonts.gstatic.com woff2)
//  - Adobe Fonts / Typekit (use.typekit.net CSS+woff2 + p.typekit.net @import)
//  - Vercel Analytics/Speed Insights (va.vercel-scripts.com)
//  - imagens/vídeos: só do próprio site (self) + data: (posters inline)
// `'unsafe-inline'`/`'unsafe-eval'` em script/style são exigidos pelo Next
// (hidratação e estilos inline) — sem nonce dá pra endurecer mais depois.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net https://p.typekit.net",
  "font-src 'self' https://fonts.gstatic.com https://use.typekit.net data:",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

// Security headers applied to every response. HSTS já vem da Vercel
// (max-age 2 anos); o resto cobre clickjacking, MIME sniffing e
// vazamento de Referer pra terceiros.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: cspDirectives },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Imagens e vídeos em /imgs são imutáveis (mudam de nome quando mudam
        // de conteúdo). Cache forte de 1 ano evita rebaixar a cada visita —
        // parte do plano de performance (specs/2026-06-21-performance-*).
        source: '/imgs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
