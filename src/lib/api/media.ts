// src/lib/api/media.ts
//
// URLs de mídia ABSOLUTAS na resposta da API.
//
// O site pode usar caminho relativo (`/imgs/...`) porque o navegador resolve
// contra a origem da página. O app Android não tem essa origem — precisa de
// URL completa.
//
// É aqui que a API fica compatível com a migração pro S3, nos dois sentidos:
//   - hoje (`NEXT_PUBLIC_MEDIA_BASE_URL` vazia): `/imgs/x.png` vira
//     `https://guittamonatega.com/imgs/x.png`.
//   - depois do S3: `src/lib/media.ts` já devolve a URL do CDN, que é
//     absoluta, e esta função não faz nada.
// Ou seja: o app consome a API hoje e não muda no dia da troca.

import { SITE_URL } from "@/lib/site";

const MEDIA_PREFIX = "/imgs/";

/**
 * Reescreve, em profundidade, toda string que comece com `/imgs/`.
 *
 * Percorre o payload inteiro em vez de listar campo por campo porque os
 * caminhos aparecem em muitos formatos (string solta, array, campo aninhado em
 * região/personagem/livro). Como só toca strings com esse prefixo exato,
 * qualquer outro texto passa intacto — e URL já absoluta também.
 */
export function absolutizeMedia<T>(value: T): T {
	if (typeof value === "string") {
		return (value.startsWith(MEDIA_PREFIX)
			? `${SITE_URL}${value}`
			: value) as unknown as T;
	}
	if (Array.isArray(value)) {
		return value.map((v) => absolutizeMedia(v)) as unknown as T;
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			out[k] = absolutizeMedia(v);
		}
		return out as unknown as T;
	}
	return value;
}
