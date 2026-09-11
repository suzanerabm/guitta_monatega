import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { mediaOrigin } from "./src/lib/media";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Origem do CDN de mídia, quando `NEXT_PUBLIC_MEDIA_BASE_URL` está definida.
// Sai da MESMA variável que `src/lib/media.ts` usa pra montar as URLs .
// Vazio (default) = modo local, CSP segue `'self'`-only.
const MEDIA_ORIGIN = mediaOrigin();
const mediaSrc = MEDIA_ORIGIN ? ` ${MEDIA_ORIGIN}` : "";

// Content-Security-Policy — controla de onde cada tipo de recurso pode
// carregar, reduzindo a superfície pra injeção de conteúdo/XSS. Calibrado
// pro que o site REALMENTE usa:
//  - Google Fonts (fonts.googleapis.com CSS + fonts.gstatic.com woff2)
//  - Adobe Fonts / Typekit (use.typekit.net CSS+woff2 + p.typekit.net @import)
//  - Vercel Analytics/Speed Insights (va.vercel-scripts.com)
//  - imagens/vídeos: do próprio site (self) + data: (posters inline) + o CDN
//    de mídia, quando NEXT_PUBLIC_MEDIA_BASE_URL estiver definida
// `'unsafe-inline'`/`'unsafe-eval'` em script/style são exigidos pelo Next
// (hidratação e estilos inline) — sem nonce dá pra endurecer mais depois.
const cspDirectives = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net https://p.typekit.net",
	"font-src 'self' https://fonts.gstatic.com https://use.typekit.net data:",
	`img-src 'self' data: blob:${mediaSrc}`,
	`media-src 'self' data: blob:${mediaSrc}`,
	"connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"object-src 'none'",
].join("; ");

// Security headers applied to every response. HSTS já vem da Vercel
// (max-age 2 anos); o resto cobre clickjacking, MIME sniffing e
// vazamento de Referer pra terceiros.
const securityHeaders = [
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
	},
	{ key: "Content-Security-Policy", value: cspDirectives },
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
			{
				// CORS da API pública.
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{ key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, If-None-Match",
					},
					// Deixa o app ler o ETag pra mandar If-None-Match depois.
					{ key: "Access-Control-Expose-Headers", value: "ETag" },
				],
			},
			{
				// Imagens e vídeos em /imgs são imutáveis (mudam de nome quando mudam
				// de conteúdo). Cache forte de 1 ano evita rebaixar a cada visita —
				// parte do plano de performance (specs/2026-06-21-performance-*).
				// Vale no modo LOCAL; no modo CDN quem precisa replicar esse header é
				// a cache policy do CloudFront.
				source: "/imgs/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
};

export default withNextIntl(nextConfig);
