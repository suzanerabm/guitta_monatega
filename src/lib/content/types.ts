// Formato dos payloads que a camada de conteúdo entrega. São os MESMOS tipos
// consumidos pelas páginas (via props) e pelos route handlers de `/api/v1`
// (via JSON), porque as duas pontas chamam as mesmas funções.
//
// Tudo aqui é serializável: só string, number, boolean, array e objeto
// simples. Nada de função, Date ou classe — o que não sobrevive a
// `JSON.stringify` não pode entrar num payload de API.

import type { CreatureId } from "@/theme/palettes";
import type {
	Character as DSCharacter,
	Mascot,
} from "@/components/DSMainCard/DSMainCard";
import type { CharacterInfo } from "@/components/bichittos/CharacterInfoPanel";
import type { Character } from "@/data/characters/types";
import type { BookEditionConfig } from "@/lib/visibility";

/** Idiomas suportados. Espelha `routing.locales`. */
export type Locale = "pt" | "en";

// ── Comuns ──────────────────────────────────────────────────────────────

export interface MediaCharacter {
	name: string;
	image: string;
	/** Ficha resolvida. Presente só quando há dados de personagem. */
	info?: CharacterInfo;
}

export interface Scene {
	name: string;
	image: string;
	video?: string;
}

export interface Drop {
	video: string;
	poster: string;
	label: string;
}

export interface BookBuy {
	url: string;
	label: string;
}

export interface Book {
	id: string;
	/** Título da edição, já no idioma pedido. */
	title: string;
	cover: string | null;
	description: string | null;
	contextTitle: string | null;
	editions: BookEditionConfig[];
	pages: string[];
	/** Link de compra, ou `null` quando ainda não está à venda. */
	buy: BookBuy | null;
	details: { url: string; label: string } | null;
}

/** Pacote de stickers de um bichitto (link pra loja, sem páginas). */
export interface Sticker {
	id: string;
	title: string;
	cover: string | null;
	buy: BookBuy | null;
}

// ── Bichittos ───────────────────────────────────────────────────────────

/** Um clipe de vídeo de um bichitto. */
export interface BichittoVideo {
	/** Caminho do .mp4. O .webm irmão é derivado pelo player. */
	src: string;
	/** Imagem de capa mostrada até o vídeo tocar. */
	poster: string;
	/** Rótulo curto, já no idioma pedido. */
	label: string;
}

export interface BichittoPayload {
	id: CreatureId;
	/** Nome de exibição já no idioma pedido. */
	name: string;
	/** Texto curto do CreatureCard. */
	text: string[];
	/** Parágrafos do painel dentro do DSMainCard. */
	panelStory: string[];
	/** Personagens do strip, com o nome já traduzido palavra a palavra. */
	chars: MediaCharacter[];
	/** Posições absolutas dos personagens na cena do card. */
	positions: DSCharacter[];
	/** Clipes de vídeo da criatura. */
	videos: BichittoVideo[];
	/** Mascote no canto do card (hoje só o Zeco tem). */
	mascot?: Mascot;
	books: Book[];
	stickers: Sticker[];
}

// ── Kammara ─────────────────────────────────────────────────────────────

export interface Subsystem {
	title: string;
	text: string[];
	img: string;
}

export interface WorldTag {
	label: string;
	value: string;
}

export interface CharacterCardItem {
	name: string;
	species: string;
	bio: string;
	image: string;
	backImage?: string;
	backTitle?: string;
	dorsalMeaning?: string;
	backMeaning?: string;
	attributes?: { glyph: string; label: string; value: string }[];
	/** Config do brilho mágico sobre o retrato. Shape vem do JSON de personagem. */
	fairyDust?: Character["fairyDust"];
	fairyDustBack?: Character["fairyDustBack"];
}

export interface RegionPayload {
	id: string;
	name: string;
	summary: string[];
	panelStory: string[];
	subsystems: Subsystem[];
	characters: CharacterCardItem[];
	chars: MediaCharacter[];
	scenes: Scene[];
	drops: Drop[];
	bgImage: string | null;
}

export interface WorldPayload {
	id: string;
	name: string;
	summary: string[];
	tags: WorldTag[];
	subsystems: Subsystem[];
	characters: CharacterCardItem[];
	chars: MediaCharacter[];
	scenes: Scene[];
	drops: Drop[];
	bgImage: string | null;
	regions?: Record<string, RegionPayload>;
}

export interface MosaicClip {
	video: string;
	poster: string;
	label: string;
	worldId: string;
	worldName: string;
}

export interface ProgressPayload {
	categories: { id: string; label: string }[];
	planets: { id: string; name: string; progress: Record<string, number> }[];
}

// ── Arte ────────────────────────────────────────────────────────────────

export interface ArtSectionPayload {
	id: string;
	thumbs: string[];
	full: string[];
}
