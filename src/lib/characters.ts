// Só servidor. Este módulo carrega os JSONs de conteúdo INTEIROS, inclusive o
// que não está publicado — se um client component importar daqui, essa lore vai
// junto pro bundle do navegador. O `server-only` transforma isso em erro de
// build. Os dados chegam ao cliente por props, via `src/lib/content/`.
import 'server-only';
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
import { mediaUrl } from "@/lib/media";

export type Locale = "pt" | "en";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Personagens de um contexto, com `image`/`backImage` já resolvidos pela base
 * de mídia (local ou CDN) — ver `src/lib/media.ts`. Como `charactersByContext`
 * vem de `import` de JSON (singleton de módulo), devolvemos objetos novos em
 * vez de mutar. `findCharacter` herda a resolução por chamar esta função.
 */
export function getCharactersForContext(contextId: string): Character[] {
  const list = charactersByContext[contextId] ?? [];
  return list.map((c) => ({
    ...c,
    ...(c.image ? { image: mediaUrl(c.image) } : {}),
    ...(c.backImage ? { backImage: mediaUrl(c.backImage) } : {}),
  }));
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
