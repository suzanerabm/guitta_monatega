// src/lib/media.ts
//
// Fonte única da BASE das mídias (imagens e vídeos).
//
// Dois modos:
//   - LOCAL  (default): `NEXT_PUBLIC_MEDIA_BASE_URL` ausente/vazia → o path
//     sai como está (`/imgs/...`) e o Next serve de `public/`. É o que roda
//     em dev, no Storybook e nos testes.
//   - REMOTO: com a env definida (ex: `https://cdn.guittamonatega.com`), todo
//     path `/imgs/...` vira URL absoluta no CDN.
//
// O prefixo `NEXT_PUBLIC_` é obrigatório: `kammara_mosaic.json` é importado
// direto num client component (KammaraClient), então a base precisa chegar ao
// browser.
//
// IMPORTANTE: nada de query string nas URLs. Modal.tsx e ModalKammara.tsx
// derivam o rótulo da imagem a partir do nome do arquivo
// (`.replace(/\.[^.]+$/, '')`) — um `?v=` quebraria o label.

/**
 * Base do CDN, sem barra no fim. String vazia = modo local.
 *
 * A expressão `process.env.NEXT_PUBLIC_MEDIA_BASE_URL` precisa aparecer
 * INTEIRA e literal: o bundler do Next substitui a expressão completa por uma
 * string no build do cliente. Desestruturar (`const { X } = process.env`)
 * quebraria silenciosamente no browser.
 */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "")
	.trim()
	.replace(/\/+$/, "");

/** Só mídia de conteúdo migra. `/icons/*` e afins são chrome de UI e ficam. */
const MEDIA_PREFIX = "/imgs/";

/**
 * Codifica um segmento de path de forma IDEMPOTENTE: decodifica antes de
 * codificar, então aplicar duas vezes dá o mesmo resultado. Necessário porque
 * existe arquivo com espaço no nome (`/imgs/books/art/Coloring Book/cover.jpg`)
 * e o S3 exige `%20` na URL.
 */
function encodeSegment(segment: string): string {
	try {
		return encodeURIComponent(decodeURIComponent(segment));
	} catch {
		// `decodeURIComponent` lança em `%` solto (ex: "100%.png"). Nesse caso o
		// segmento não estava codificado — codifica direto.
		return encodeURIComponent(segment);
	}
}

/**
 * Resolve o caminho final de uma mídia.
 *
 * Passa direto (sem tocar) quando: estamos em modo local, o valor é vazio/nulo,
 * já é uma URL absoluta (`http:`, `//`, `data:`, `blob:`) ou não é `/imgs/...`.
 * Isso torna a função IDEMPOTENTE — aplicar duas vezes é inofensivo.
 */
export function mediaUrl(path: string): string;
export function mediaUrl(path: string | null): string | null;
export function mediaUrl(path: string | undefined): string | undefined;
export function mediaUrl(
	path: string | null | undefined,
): string | null | undefined {
	if (!path) return path;
	if (!MEDIA_BASE) return path;
	if (!path.startsWith(MEDIA_PREFIX)) return path;

	const encoded = path.split("/").map(encodeSegment).join("/");
	return `${MEDIA_BASE}${encoded}`;
}

/** Versão para arrays de paths (thumbs, páginas de livro, etc). */
export function mediaUrls(paths: string[]): string[] {
	if (!MEDIA_BASE) return paths;
	return paths.map((p) => mediaUrl(p));
}

/**
 * Origem do CDN (ex: `https://cdn.exemplo.com`), ou `null` em modo local.
 * Usada pelo `next.config.ts` pra liberar o host no CSP — assim a config de
 * segurança e a de leitura saem da MESMA variável, sem duplicar.
 */
export function mediaOrigin(): string | null {
	if (!MEDIA_BASE) return null;
	try {
		return new URL(MEDIA_BASE).origin;
	} catch {
		return null;
	}
}
