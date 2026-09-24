// Monta o payload da seção Bichittos. Chamado pela página
// (`app/[locale]/bichittos/page.tsx`) e pelos route handlers de `/api/v1`.
//
// Tudo que é gate roda AQUI, no servidor: criatura não publicada e livro
// oculto nem entram no payload. Antes parte disso rodava dentro do
// BichittosClient, o que colocava o conteúdo não publicado no bundle.

import { getBookPages } from "@/lib/images";
import {
	isBichittoPublished,
	getBichittoBooks,
	getBichittoStickers,
} from "@/lib/visibility";
import {
	characterPositions,
	zecoMascot,
	bichittoVideos,
} from "@/data/bichittos";
import {
	getCreatureName,
	getCreatureText,
	getCreaturePanelStory,
	getCreatureCarousel,
	getBooksText,
} from "@/data/characters/bichittos/_creatureData";
import { translateName } from "@/lib/translateName";
import { getWordDictionary } from "./i18n";
import type { BichittoPayload, Locale } from "./types";
import type { CreatureId } from "@/theme/palettes";

/**
 * Ordem canônica das criaturas. Define a ordem das pills do FilterBar e qual
 * criatura abre por padrão (a primeira publicada).
 */
const CREATURE_IDS = [
	"napcat",
	"zeco",
	"taylo",
	"cheiodebolinha",
	"miscelania",
] as const satisfies readonly CreatureId[];

/** Uma criatura, com tudo resolvido para o idioma pedido. */
export function getBichitto(id: CreatureId, locale: Locale): BichittoPayload {
	const words = getWordDictionary(locale);

	return {
		id,
		name: getCreatureName(id, locale),
		text: getCreatureText(id, locale),
		panelStory: getCreaturePanelStory(id, locale),
		// O nome vem do nome do arquivo no manifesto ("napcat dormindo"); traduzir
		// aqui e não no cliente mantém a conversão na fronteira de dados e evita
		// depender de `useLocale()`, que pode ficar stale em navegação suave.
		chars: getCreatureCarousel(id).map((c) => ({
			name: translateName(c.name, words),
			image: c.image,
		})),
		positions: characterPositions[id] ?? [],
		videos: (bichittoVideos[id] ?? []).map((v) => ({
			...v,
			label: v.label[locale] || v.label.pt,
		})),
		mascot: id === "zeco" ? zecoMascot : undefined,
		// Livro oculto (visible:false, ou onlyLocale de outro idioma) não entra
		// no payload — nem no HTML, nem na resposta da API. `getBichittoBooks` já
		// filtra por visibilidade e idioma.
		books: getBichittoBooks(id, locale).map((b) => ({
			id: b.id,
			title: b.title,
			cover: b.cover,
			pages: getBookPages(id, b.id),
			buy: b.buy,
		})),
		stickers: getBichittoStickers(id, locale).map((s) => ({
			id: s.id,
			title: s.title,
			cover: s.cover,
			buy: s.buy,
		})),
	};
}

/** Todas as criaturas publicadas, na ordem canônica. */
export function getBichittos(locale: Locale): BichittoPayload[] {
	return CREATURE_IDS.filter((id) => isBichittoPublished(id)).map((id) =>
		getBichitto(id, locale),
	);
}

/** Texto de abertura da aba "Livros", que reúne os livros de todas as criaturas. */
export function getBichittosBooksText(locale: Locale): string[] {
	return getBooksText(locale);
}

/** True quando a criatura existe e está publicada. Usado pela API pra 404. */
export function isKnownBichitto(id: string): id is CreatureId {
	return (
		(CREATURE_IDS as readonly string[]).includes(id) && isBichittoPublished(id)
	);
}
