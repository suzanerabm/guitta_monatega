import manifest from '@/data/image-manifest.json';

export interface Character {
  name: string;
  image: string;
}

export interface Book {
  id: string;
  cover: string | null;
  pages: string[];
}

export interface ArtImageGroup {
  thumbs: string[];
  full: string[];
}

export interface Scene {
  name: string;
  image: string;
}

export function getCharacters(creature: string): Character[] {
  return (manifest.characters as Record<string, Character[]>)[creature] ?? [];
}

export function getBooks(section: string): Book[] {
  return (manifest.books as Record<string, Book[]>)[section] ?? [];
}

export function getBookPages(section: string, bookId: string): string[] {
  const books = getBooks(section);
  return books.find((b) => b.id === bookId)?.pages ?? [];
}

export function getArtImages(section: string): ArtImageGroup {
  return (manifest.art as Record<string, ArtImageGroup>)[section] ?? { thumbs: [], full: [] };
}

export function getScenes(world: string): Scene[] {
  return (manifest.scenes as Record<string, Scene[]>)[world] ?? [];
}

/**
 * Get the parallax background image for a kammara section.
 * Keys: 'kammara' (main), 'kammara/lunnp1', 'kammara/eni4', etc.
 */
export function getKammaraBg(key: string): string | null {
  const bgs = (manifest as unknown as { kammaraBgs?: Record<string, string> })
    .kammaraBgs;
  return bgs?.[key] ?? null;
}

/**
 * Get the 3 subsystem images for a kammara world.
 * Returns an array of 3 elements (image path or null) corresponding to
 * the 0./1./2. slots in the world's _subsystems directory.
 */
export function getSubsystemImages(key: string): (string | null)[] {
  const subs = (
    manifest as unknown as { subsystems?: Record<string, (string | null)[]> }
  ).subsystems;
  return subs?.[key] ?? [null, null, null];
}
