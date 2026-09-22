// O que o app Android precisa e as outras rotas de `/api/v1` não carregam.
//
// As rotas existentes descrevem o site: mundos, criaturas, arte. O app monta
// uma wiki a partir dos mesmos dados, e para isso precisa de quatro coisas que
// o site tem mas nunca expôs em JSON: o grafo de conexões entre verbetes, a
// página do universo, os livros de Kammara e os textos de apoio (privacidade,
// subtítulos de seção, contadores de "em breve").
//
// Esses dados viviam congelados dentro do APK. Agora moram aqui, e chegam ao
// aparelho sem nova versão do app.
//
// Sem `?locale=`: o app guarda os dois idiomas no mesmo catálogo e troca de
// idioma offline, então receber `pt` e `en` juntos evita uma segunda requisição
// e mantém as duas versões sempre da mesma revisão.

import 'server-only';
import sectionHeadersData from '@/data/kammara-app/section_headers.json';
// Gerado por `npm run generate-app-content` (roda no predev/prebuild). É a
// mesma fonte de `/api/kammara/v1`: as relações moram em cada item dos JSONs
// (`relations`) e o gerador as junta com as de `kammara-app/relations.json`.
import appSnapshot from '@/generated/kammara-app.json';
import { charactersByContext } from '@/data/characters';
import progressData from '@/data/kammara_progress.json';
import { kammaraInProgress } from '@/lib/visibility';
import { SITE_URL } from '@/lib/site';
import { getMessages } from './i18n';
import type { Locale } from './types';

const LOCALES: readonly Locale[] = ['pt', 'en'];

/** Um texto nos dois idiomas. */
export type Localized = Record<Locale, string>;
/** Parágrafos nos dois idiomas. */
export type LocalizedBody = Record<Locale, string[]>;

export interface OverlayBook {
	id: string;
	title: Localized;
	description: Localized;
	body: LocalizedBody;
	cover: string;
	buyUrl: string;
	/** `pt` ou `en` quando a edição só existe num idioma; vazio quando existe nos dois. */
	onlyLocale: string;
}

export interface OverlayLegalSection {
	tag: string;
	body: string;
}

export interface OverlayLegalDocument {
	title: string;
	lastUpdate: string;
	intro: string;
	sections: OverlayLegalSection[];
	contact: string;
	/** Onde ler a mesma política no site. */
	url: string;
}

export interface AppOverlayPayload {
	schemaVersion: 1;
	universe: { title: Localized; summary: Localized; body: LocalizedBody };
	messages: Record<Locale, unknown>;
	relations: Record<string, string[]>;
	books: OverlayBook[];
	legal: Record<Locale, OverlayLegalDocument>;
	sectionHeaders: unknown;
	comingSoon: { books: Record<Locale, number>; characters: number; planets: number };
}

const catalogEntries = appSnapshot.files['catalog.json'].entries;

/** Grafo de conexões: as relações de cada item somadas às avulsas. */
function relations(): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const entry of catalogEntries) {
		if (entry.relations.length > 0) out[entry.id] = [...entry.relations];
	}
	for (const [id, targets] of Object.entries(
		appSnapshot.files['relations.json'].relations as Record<string, string[]>,
	)) {
		out[id] = [...new Set([...(out[id] ?? []), ...targets])];
	}
	return out;
}

/** Livros visíveis de Kammara, uma entrada por edição. */
function books(): OverlayBook[] {
	return catalogEntries
		.filter((entry) => entry.kind === 'book')
		.map((entry) => ({
			id: entry.id,
			title: { pt: entry.title.pt ?? '', en: entry.title.en ?? '' },
			description: { pt: entry.summary.pt ?? '', en: entry.summary.en ?? '' },
			body: { pt: entry.body?.pt ?? [], en: entry.body?.en ?? [] },
			cover: entry.image,
			buyUrl: entry.externalUrl ?? '',
			onlyLocale: entry.onlyLocale ?? '',
		}));
}

function byLocale<T>(build: (locale: Locale) => T): Record<Locale, T> {
	return Object.fromEntries(LOCALES.map((locale) => [locale, build(locale)])) as Record<
		Locale,
		T
	>;
}

/** A entrada "universo": a abertura da seção Kammara, que no app é uma página. */
function universe() {
	return {
		title: byLocale((locale) => getMessages(locale).kammara.section.name),
		// O app mostra o resumo como um parágrafo só; o site quebra em dois.
		summary: byLocale((locale) => getMessages(locale).kammara.section.text.join('\n\n')),
		body: byLocale((locale) => getMessages(locale).kammara.section.panel.story),
	};
}

function legal(): Record<Locale, OverlayLegalDocument> {
	return byLocale((locale) => {
		const privacy = getMessages(locale).privacy;
		return {
			title: privacy.title,
			lastUpdate: privacy.lastUpdate,
			intro: privacy.intro,
			sections: privacy.sections,
			contact: privacy.contact,
			url: `${SITE_URL}/${locale}/privacy`,
		};
	});
}

/**
 * Os números do bloco "Em breve".
 *
 * Personagens contam TODOS os registros autorais, inclusive os que ainda não
 * foram publicados: é a pergunta "quanto ainda vem por aí", não "quanto já dá
 * para ler". Livros contam só os que ainda não têm link de compra.
 */
function comingSoon() {
	const characters = new Set(
		Object.values(charactersByContext).flatMap((list) => list.map((item) => item.match)),
	).size;
	const stages = progressData.categories.map((category) => category.id);
	const planets = kammaraInProgress().filter((planet) =>
		stages.some((stage) => (planet.progress[stage] ?? 0) < 100),
	).length;
	const upcomingBooks = byLocale(
		(locale) =>
			books().filter(
				(book) => !book.buyUrl && (!book.onlyLocale || book.onlyLocale === locale),
			).length,
	);
	return { books: upcomingBooks, characters, planets };
}

/** Tudo o que o app precisa e as outras rotas não entregam, nos dois idiomas. */
export function getAppOverlay(): AppOverlayPayload {
	return {
		schemaVersion: 1,
		universe: universe(),
		messages: byLocale((locale) => getMessages(locale).kammara),
		relations: relations(),
		books: books(),
		legal: legal(),
		sectionHeaders: sectionHeadersData,
		comingSoon: comingSoon(),
	};
}
