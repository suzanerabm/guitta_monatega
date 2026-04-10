/**
 * Character data model.
 *
 * Lightweight per-context JSON files feed the CharacterInfoPanel tooltip.
 * Keep this file the single source of truth for the shape — add fields here
 * first, then in the JSONs.
 *
 * Matching strategy: each entry has a `match` string that identifies the
 * character against the `name` field coming from `image-manifest.json`.
 * Lookup is fuzzy (case + accent insensitive) so the raw manifest name or
 * the translated display name both work.
 */

/** A string that has a Portuguese and English version. */
export interface I18nString {
  pt: string;
  en: string;
}

export interface Character {
  /**
   * Raw string used to identify this character against the `name` field
   * from `image-manifest.json`. Fuzzy-matched (case/accent insensitive).
   * Example: "Erú'Rin", "aracne 1", "napcat dormindo".
   */
  match: string;
  /** Display name (i18n). Usually the "canonical" spelling with accents. */
  name: I18nString;
  /** Species / kind. Examples: "Shal'ún", "Gato", "Criatura fofa". */
  species: I18nString;
  /** Short biography / description shown in the tooltip. */
  bio: I18nString;
}

/**
 * A character file exports an array of characters for a given context
 * (ex: "kammara/lunnp1", "bichittos/napcat").
 */
export type CharacterContext = Character[];
