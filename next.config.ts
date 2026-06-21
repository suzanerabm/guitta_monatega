import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
