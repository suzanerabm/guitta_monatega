/**
 * Character data model.
 *
 * Lightweight per-context JSON files feed the CharacterInfoPanel tooltip
 * AND the KammaraCharacterCard/Gallery on the Kammara page.
 *
 * Kammara now stores everything (image paths, bio, attributes, dorsal info)
 * in this one place — no cross-referencing with `image-manifest.json`.
 * Bichittos and the other older sections still rely on the manifest for
 * backwards compatibility (fuzzy `match` lookup).
 *
 * Keep this file the single source of truth for the shape — add fields
 * here first, then in the JSONs.
 */

/** A string that has a Portuguese and English version. */
export interface I18nString {
  pt: string;
  en: string;
}

/**
 * One row in the attributes section of a character card.
 * Each field shows as: [label]  [glyph]  [value]
 */
export interface CharacterAttribute {
  /** Semantic Kalún glyph (e.g. "⊶⊹⊷"). Not translated — symbols are universal. */
  glyph: string;
  /** Short uppercase label shown on the left (e.g. "Protocolo"). */
  label: I18nString;
  /** Value shown on the right (e.g. "AURYN", "Água"). */
  value: I18nString;
}

export interface Character {
  /**
   * Fuzzy matching key, kept for legacy CharacterStrip lookups in
   * bichittos/arte sections. In Kammara it's also used as a stable id.
   */
  match: string;
  /** Display name (i18n). Usually the "canonical" spelling with accents. */
  name: I18nString;
  /** Species / kind. Examples: "Shal'ún", "Gato", "Criatura fofa". */
  species: I18nString;
  /** Short biography / description shown in the tooltip / card. */
  bio: I18nString;

  // --- Kammara-only, optional fields below. ---

  /** Front image path (relative to /public). Used on Kammara character cards. */
  image?: string;
  /** Back-face image — enables the flip behavior on the card. */
  backImage?: string;
  /**
   * Heading for the back face. When absent:
   *   - if `dorsalMeaning` is set → "Glifo Dorsal"
   *   - otherwise                → "Costas"
   */
  backTitle?: I18nString;
  /** Narrative about the dorsal glyph. Only meaningful for species that carry one. */
  dorsalMeaning?: I18nString;
  /** Narrative about the character's back (species without dorsal glyph). */
  backMeaning?: I18nString;
  /** Optional list of card attributes (rendered as label · glyph · value rows). */
  attributes?: CharacterAttribute[];
  /**
   * Optional magic sparkle overlay on the portrait. Provide at least `color`
   * (hex). Everything else falls back to the FairyDust component defaults.
   * Useful for luminous characters (Lún'Kai) that should look magical.
   */
  fairyDust?: {
    color: string;
    count?: number;
    size?: number;
    duration?: number;
    /** Brightness multiplier for the glow (default 1). */
    intensity?: number;
    /**
     * Restrict the sparkle field to a sub-region of the card image
     * (percentages). Defaults to the full image when omitted.
     * Example for a tail glow: { top: 65, left: 40, width: 25, height: 30 }.
     */
    area?: { top: number; left: number; width: number; height: number };
    /**
     * Emit sparkles from a point with a directional trail. Overrides `area`.
     *   origin: where the core is (%).
     *   spread: direction and length of the trail (% offsets).
     *   falloff: 0..1, higher = denser core.
     */
    emit?: {
      origin: { top: number; left: number };
      spread: { x: number; y: number };
      falloff?: number;
    };
  };
  /**
   * Optional override for the sparkle effect on the card's back face.
   * Same shape as `fairyDust`. When absent, the front config is reused on
   * both faces. Useful when the back image has the glowing body part at a
   * different spot (e.g. the Tzir'Kai tail flipped to the other side).
   */
  fairyDustBack?: {
    color: string;
    count?: number;
    size?: number;
    duration?: number;
    intensity?: number;
    area?: { top: number; left: number; width: number; height: number };
    emit?: {
      origin: { top: number; left: number };
      spread: { x: number; y: number };
      falloff?: number;
    };
  };
}

/**
 * A character file exports an array of characters for a given context
 * (ex: "kammara/lunnp1", "bichittos/napcat").
 */
export type CharacterContext = Character[];
