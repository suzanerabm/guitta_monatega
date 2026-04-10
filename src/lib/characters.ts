/**
 * Character lookup helpers used by CharacterStrip / CharacterInfoPanel.
 *
 * The CharacterStrip receives names that come from `image-manifest.json`
 * (e.g. "Erú'Rin", "napcat dormindo"). We need to find the matching entry
 * in the character data without being tripped up by accents, casing, or
 * stray whitespace, so the lookup is fuzzy.
 */

import type { Character } from "@/data/characters/types";
import { charactersByContext } from "@/data/characters";

export type Locale = "pt" | "en";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getCharactersForContext(contextId: string): Character[] {
  return charactersByContext[contextId] ?? [];
}

export function findCharacter(
  contextId: string,
  name: string,
): Character | undefined {
  const list = getCharactersForContext(contextId);
  if (list.length === 0) return undefined;
  const target = normalize(name);
  return list.find((c) => normalize(c.match) === target);
}

export function getLocalizedName(character: Character, locale: Locale): string {
  return character.name[locale];
}

export function getLocalizedSpecies(
  character: Character,
  locale: Locale,
): string {
  return character.species[locale];
}

export function getLocalizedBio(character: Character, locale: Locale): string {
  return character.bio[locale];
}
