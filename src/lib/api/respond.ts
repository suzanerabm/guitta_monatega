// Resposta padrão dos route handlers de `/api/v1`.
//
// Sobre cache: a doc do Next 16 que acompanha o pacote deixa claro que
// `dynamic`, `revalidate` e `fetchCache` são REMOVIDOS quando `cacheComponents`
// é ligado (`02-route-segment-config/index.md:19`) e só sobrevivem num guia
// chamado "(Previous Model)". Usar qualquer um deles funcionaria hoje e
// quebraria calado no dia em que alguém ligasse a flag. Por isso o cache aqui é
// header explícito + ETag, que não depende de config de segmento.
//
// CORS não é feito aqui: os headers saem de `next.config.ts` com
// `source: '/api/:path*'`, que é o que a doc recomenda pra múltiplos handlers
// (`route.md:557`).

import { createHash } from "crypto";
import { absolutizeMedia } from "./media";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/content/types";

/** Quanto o CDN pode servir sem revalidar, e por quanto tempo pode servir velho. */
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

/** Lê e valida `?locale=`. Ausente ou inválido → idioma padrão. */
export function readLocale(request: Request): Locale {
	const raw = new URL(request.url).searchParams.get("locale");
	return (routing.locales as readonly string[]).includes(raw ?? "")
		? (raw as Locale)
		: (routing.defaultLocale as Locale);
}

function etagOf(body: string): string {
	return `W/"${createHash("sha1").update(body).digest("base64url")}"`;
}

/**
 * Os dados vêm de `import` de JSON, então são constantes em runtime: dá pra
 * serializar uma vez por chave e só comparar strings depois. Sem isso, listar
 * os mundos re-serializaria ~500KB a cada request.
 */
const memo = new Map<string, { body: string; etag: string }>();

function serialize(
	key: string,
	build: () => unknown,
): { body: string; etag: string } {
	const hit = memo.get(key);
	if (hit) return hit;
	// `absolutizeMedia` roda ANTES de serializar, então o ETag corresponde
	// exatamente ao corpo entregue.
	const body = JSON.stringify(absolutizeMedia(build()));
	const entry = { body, etag: etagOf(body) };
	memo.set(key, entry);
	return entry;
}

/**
 * Resposta JSON com ETag e 304. `cacheKey` precisa incluir tudo que muda o
 * corpo (normalmente o locale e o id do recurso).
 */
export function json(
	request: Request,
	cacheKey: string,
	build: () => unknown,
): Response {
	const { body, etag } = serialize(cacheKey, build);

	if (request.headers.get("if-none-match") === etag) {
		return new Response(null, {
			status: 304,
			headers: { ETag: etag, "Cache-Control": CACHE_CONTROL },
		});
	}

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			ETag: etag,
			"Cache-Control": CACHE_CONTROL,
		},
	});
}

/** Erro com corpo padronizado. */
export function fail(status: number, code: string, message: string): Response {
	return Response.json(
		{ error: { code, message } },
		{ status, headers: { "Cache-Control": "no-store" } },
	);
}

/** 404 com a mesma forma dos outros erros. */
export function notFound(resource: string, id: string): Response {
	return fail(
		404,
		"not_found",
		`${resource} '${id}' não existe ou não está publicado.`,
	);
}
