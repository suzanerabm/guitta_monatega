import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { mediaOrigin } from "./src/lib/media";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// O banner do app usa URLs absolutas do bucket mesmo no modo local. Mantemos
// essa origem sempre permitida e acrescentamos o CDN configurado, se houver.
const MEDIA_ORIGIN = mediaOrigin();
const KAMMARA_MEDIA_ORIGIN = "https://kammara.s3.us-east-1.amazonaws.com";
const mediaOrigins = Array.from(
	new Set(
		[KAMMARA_MEDIA_ORIGIN, MEDIA_ORIGIN].filter(
			(origin): origin is string => Boolean(origin),
		),
	),
);
const mediaSrc = mediaOrigins.map((origin) => ` ${origin}`).join("");
const mediaRemotePatterns = mediaOrigins.map(
	(origin) => new URL(`${origin}/**`),
);

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
	images: {
		// A mesma origem usada por `mediaUrl` e pelo CSP. O pathname amplo é
		// necessário porque o bucket guarda kammara/, books/ e art/ na raiz.
		remotePatterns: mediaRemotePatterns,
	},
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
