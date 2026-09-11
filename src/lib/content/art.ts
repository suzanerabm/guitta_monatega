// Monta o payload da seção Arte. Chamado pela página
// (`app/[locale]/art/page.tsx`) e pelo route handler `/api/v1/art`.
//
// Diferente de Kammara e Bichittos, este payload NÃO depende de idioma: são só
// caminhos de imagem. Título e técnica de cada seção vivem nas mensagens e são
// resolvidos no cliente, que já recebe todas elas do NextIntlClientProvider.

import { getArtImages } from "@/lib/images";
import type { ArtSectionPayload } from "./types";

/**
 * Ordem canônica das seções — define a ordem do FilterBar e qual abre por
 * padrão. `digital` está fora de propósito: a seção existe em
 * `src/theme/artSections.ts` mas ainda não foi publicada.
 */
export const ART_SECTION_IDS = [
	"doodle",
	"grafite",
	"black",
	"collections",
	"fimo",
	"needle",
	"clay",
	"croche",
] as const;

export type ArtSectionId = (typeof ART_SECTION_IDS)[number];

/** Uma seção de arte, ou `null` se o id não for publicado. */
export function getArtSection(id: string): ArtSectionPayload | null {
	if (!(ART_SECTION_IDS as readonly string[]).includes(id)) return null;
	const imgs = getArtImages(id);
	return { id, thumbs: imgs.thumbs, full: imgs.full };
}

/** Todas as seções publicadas, na ordem canônica. */
export function getArtSections(): ArtSectionPayload[] {
	return ART_SECTION_IDS.map((id) => {
		const imgs = getArtImages(id);
		return { id, thumbs: imgs.thumbs, full: imgs.full };
	});
}
