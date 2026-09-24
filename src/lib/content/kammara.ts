// Monta o payload da seção Kammara. Chamado pela página
// (`app/[locale]/kammara/page.tsx`) e pelos route handlers de `/api/v1`.
//
// Todo gate roda aqui, no servidor. Antes, boa parte rodava dentro do
// KammaraClient (que é `'use client'`), então a lore dos 11 mundos e a bio dos
// personagens `visible: false` iam parar no bundle do navegador — escondidas
// na UI, mas baixáveis.

import { getCharacters, getBookPages, getKammaraBg } from "@/lib/images";
import { getCharactersForContext } from "@/lib/characters";
import {
	isKammaraPublished,
	kammaraInProgress,
	getKammaraBooks as getKammaraBookEntries,
} from "@/lib/visibility";
import {
	getWorldName,
	getWorldSummary,
	getWorldPanelStory,
	getWorldTags,
	getWorldSubsystems,
	getWorldScenes,
	getWorldDrops,
} from "@/data/characters/kammara/_worldData";
import { mediaUrl } from "@/lib/media";
import kammaraMosaicData from "@/data/kammara_mosaic.json";
import kammaraEventsData from "@/data/kammara_events.json";
import kammaraProgressData from "@/data/kammara_progress.json";
import type {
	Book,
	CharacterCardItem,
	Locale,
	MediaCharacter,
	MosaicClip,
	ProgressPayload,
	RegionPayload,
	Subsystem,
	WorldPayload,
} from "./types";

/** Ordem canônica dos mundos — define a ordem do FilterBar e dos cards. */
export const WORLD_IDS = [
	"lunnp1",
	"eni4",
	"triplec",
	"orfv",
	"z1",
	"gotto",
	"digg",
	"memphis",
] as const;

const TRIPLEC_REGIONS = ["malloc", "mesh", "sharp"] as const;

/**
 * Nome de exibição de reserva, para o caso de um mundo não ter `_story.json`.
 * O nome real vem de `getWorldName`; hoje os dois coincidem em todos os
 * mundos e nos dois idiomas.
 */
const FALLBACK_NAMES: Record<string, string> = {
	lunnp1: "LUNN'P1",
	eni4: "ENI-4Δ",
	triplec: "TripleC",
	orfv: "ORF-V",
	z1: "Z1",
	gotto: "Gotto",
	digg: "Digg",
	memphis: "Memphis",
};

/** Subsistema que ainda está com o texto cru "Placeholder — …" não é publicado. */
const hasRealContent = (s: { text: string[] }) =>
	s.text.length > 0 && !s.text[0].startsWith("Placeholder");

function worldName(id: string, locale: Locale): string {
	return getWorldName(id, locale) || FALLBACK_NAMES[id] || id;
}

/**
 * Imagens de personagem vindas do manifesto, sem as dos personagens marcados
 * `visible: false`.
 *
 * O manifesto guarda VÁRIAS entradas por personagem (frente, costas,
 * variações), com nome derivado do arquivo: "sereno", "sereno 2",
 * "Sereno costas"… O `match` do JSON é só "Sereno". Por isso o cruzamento é
 * por prefixo, não por igualdade.
 */
function visibleManifestChars(contextId: string): MediaCharacter[] {
	const hiddenPrefixes = getCharactersForContext(contextId)
		.filter((c) => c.visible === false)
		.map((c) => c.match.toLowerCase().trim());

	const isHidden = (name: string) => {
		const n = name.toLowerCase().trim();
		return hiddenPrefixes.some(
			(p) => n === p || n.startsWith(`${p} `) || n.startsWith(`${p}_`),
		);
	};

	return getCharacters(contextId)
		.filter((c) => !isHidden(c.name))
		.map((c) => ({ name: c.name, image: c.image }));
}

/**
 * Fichas completas dos personagens de um contexto, já no idioma pedido e sem
 * os `visible: false`. A imagem vem do JSON; o manifesto é fallback para
 * entradas legadas sem `image`.
 */
function characterCards(
	contextId: string,
	locale: Locale,
	manifestChars: MediaCharacter[],
): CharacterCardItem[] {
	return (
		getCharactersForContext(contextId)
			.filter((char) => char.visible !== false)
			// `flatMap` em vez de map+filter: um personagem sem imagem (nem no JSON
			// nem no manifesto) simplesmente não vira card.
			.flatMap<CharacterCardItem>((char) => {
				const manifestMatch = manifestChars.find(
					(c) =>
						c.name.toLowerCase().trim() === char.match.toLowerCase().trim(),
				);
				const image = char.image ?? manifestMatch?.image;
				if (!image) return [];
				return [
					{
						name: char.name[locale],
						species: char.species[locale],
						bio: char.bio[locale],
						image,
						backImage: char.backImage,
						backTitle: char.backTitle?.[locale],
						dorsalMeaning: char.dorsalMeaning?.[locale],
						backMeaning: char.backMeaning?.[locale],
						attributes: char.attributes?.map((a) => ({
							glyph: a.glyph,
							label: a.label[locale],
							value: a.value[locale],
						})),
						fairyDust: char.fairyDust,
						fairyDustBack: char.fairyDustBack,
					},
				];
			})
	);
}

function subsystemsFor(worldId: string, locale: Locale): Subsystem[] {
	// `getWorldSubsystems` já remove os `visible: false`; aqui cai também o que
	// ainda está com texto de placeholder, que antes era filtrado no cliente.
	return getWorldSubsystems(worldId, locale).filter(hasRealContent);
}

function buildRegion(regionId: string, locale: Locale): RegionPayload {
	const contextId = `kammara/triplec/${regionId}`;
	const worldKey = `triplec-${regionId}`;
	const chars = visibleManifestChars(contextId);
	return {
		id: regionId,
		name: worldName(worldKey, locale) || regionId,
		summary: getWorldSummary(worldKey, locale),
		panelStory: getWorldPanelStory(worldKey, locale),
		subsystems: subsystemsFor(worldKey, locale),
		characters: characterCards(contextId, locale, chars),
		chars,
		scenes: getWorldScenes(worldKey, locale),
		drops: getWorldDrops(worldKey, locale),
		bgImage: getKammaraBg(contextId),
	};
}

/** Um mundo publicado, com tudo resolvido. `null` se não estiver publicado. */
export function getWorld(id: string, locale: Locale): WorldPayload | null {
	if (!isKammaraPublished(id)) return null;

	const contextId = `kammara/${id}`;
	const chars = visibleManifestChars(contextId);

	const payload: WorldPayload = {
		id,
		name: worldName(id, locale),
		summary: getWorldSummary(id, locale),
		tags: getWorldTags(id, locale),
		subsystems: subsystemsFor(id, locale),
		characters: characterCards(contextId, locale, chars),
		chars,
		scenes: getWorldScenes(id, locale),
		drops: getWorldDrops(id, locale),
		bgImage: getKammaraBg(contextId),
	};

	// Só o TripleC tem sub-regiões.
	if (id === "triplec") {
		payload.regions = Object.fromEntries(
			TRIPLEC_REGIONS.map((regionId) => [
				regionId,
				buildRegion(regionId, locale),
			]),
		);
	}

	return payload;
}

/** Todos os mundos publicados, na ordem canônica. */
export function getWorlds(locale: Locale): WorldPayload[] {
	return WORLD_IDS.map((id) => getWorld(id, locale)).filter(
		(w): w is WorldPayload => w !== null,
	);
}

/** Clipes do mosaico, sem os de planetas não publicados. */
export function getMosaic(locale: Locale): MosaicClip[] {
	return kammaraMosaicData
		.filter((c) => isKammaraPublished(c.world))
		.map((c) => ({
			video: mediaUrl(c.video),
			poster: mediaUrl(c.poster),
			label: c.label[locale] ?? c.label.pt,
			worldId: c.world,
			worldName: worldName(c.world, locale),
		}));
}

/**
 * Eventos, ou `null` quando a seção está desligada / sem eventos publicados.
 *
 * `null` (e não lista vazia) porque o cliente usa esse valor pra decidir se
 * renderiza o bloco INTEIRO — que tem imagem de fundo e padding próprios. Uma
 * lista vazia desenharia uma faixa vazia com fundo.
 */
export function getEvents(locale: Locale): {
	categories: typeof kammaraEventsData.categories;
	items: typeof kammaraEventsData.events;
	planetNames: Record<string, string>;
} | null {
	if (kammaraEventsData.visible === false) return null;

	const items = kammaraEventsData.events.filter((e) =>
		isKammaraPublished(e.planet),
	);
	if (items.length === 0) return null;

	return {
		// EXCEÇÃO deliberada: este é o único payload que sai bilíngue (`{pt, en}`)
		// em vez de resolvido. O KammaraEventCard tem 8 campos bilíngues e a seção
		// está desligada hoje (`visible: false` no JSON) — achatar significaria
		// reescrever o card inteiro sem nada visível pra validar. Fica como está
		// até a seção ser ligada.
		categories: kammaraEventsData.categories,
		items,
		// Estes SIM já vêm resolvidos, porque o componente não pode mais chamar
		// `getWorldName` (arrastaria os 44 JSONs de mundo pro bundle).
		planetNames: Object.fromEntries(
			items.map((e) => [e.planet, worldName(e.planet, locale)]),
		),
	};
}

/** Heatmap "Próximos Planetas", ou `null` quando não há mundo em construção. */
export function getProgress(locale: Locale): ProgressPayload | null {
	const planets = kammaraInProgress();
	if (planets.length === 0) return null;

	return {
		categories: kammaraProgressData.categories.map((c) => ({
			id: c.id,
			label: c.label[locale] ?? c.label.pt,
		})),
		planets: planets.map((p) => ({
			id: p.id,
			name: p.name[locale] ?? p.name.pt,
			progress: p.progress,
		})),
	};
}

/** Personagens da vitrine Kammara (o hub, fora dos mundos). */
export function getKammaraCharacters(locale: Locale): CharacterCardItem[] {
	const contextId = "kammara/kammara";
	return characterCards(contextId, locale, visibleManifestChars(contextId));
}

/** Livros da seção Kammara, filtrados por visibilidade e idioma. */
export function getKammaraBooks(locale: Locale): Book[] {
	return getKammaraBookEntries("kammara", locale).map((b) => ({
		id: b.id,
		title: b.title,
		cover: b.cover,
		pages: getBookPages("kammara", b.id),
		buy: b.buy,
	}));
}

/** Payload completo da página /kammara. */
export function getKammaraPage(locale: Locale) {
	return {
		worlds: getWorlds(locale),
		kammaraBooks: getKammaraBooks(locale),
		kammaraBg: getKammaraBg("kammara"),
		kammaraCharacters: getKammaraCharacters(locale),
		mosaicClips: getMosaic(locale),
		events: getEvents(locale),
		progress: getProgress(locale),
	};
}
