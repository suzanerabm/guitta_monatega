// Só servidor. Este módulo carrega os JSONs de conteúdo INTEIROS, inclusive o
// que não está publicado — se um client component importar daqui, essa lore vai
// junto pro bundle do navegador. O `server-only` transforma isso em erro de
// build. Os dados chegam ao cliente por props, via `src/lib/content/`.
import 'server-only';
import manifest from '@/data/image-manifest.json';
import { mediaUrl, mediaUrls } from '@/lib/media';

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

// Todo acessor abaixo passa os paths por `mediaUrl` — é aqui que se decide se
// a mídia vem de `public/imgs` ou do CDN. Os componentes recebem o valor já
// resolvido e não sabem da diferença.
//
// Os objetos do manifesto são singletons de módulo (vêm de um `import` de
// JSON), então NUNCA mutamos: cada acessor devolve objetos novos.

export function getCharacters(creature: string): Character[] {
  const list = (manifest.characters as Record<string, Character[]>)[creature] ?? [];
  return list.map((c) => ({ ...c, image: mediaUrl(c.image) }));
}

export function getBooks(section: string): Book[] {
  const list = (manifest.books as Record<string, Book[]>)[section] ?? [];
  return list.map((b) => ({
    ...b,
    cover: mediaUrl(b.cover),
    pages: mediaUrls(b.pages),
  }));
}

export function getBookPages(section: string, bookId: string): string[] {
  const books = getBooks(section);
  return books.find((b) => b.id === bookId)?.pages ?? [];
}

export function getArtImages(section: string): ArtImageGroup {
  const group = (manifest.art as Record<string, ArtImageGroup>)[section];
  if (!group) return { thumbs: [], full: [] };
  return { thumbs: mediaUrls(group.thumbs), full: mediaUrls(group.full) };
}

export function getScenes(world: string): Scene[] {
  const list = (manifest.scenes as Record<string, Scene[]>)[world] ?? [];
  return list.map((s) => ({ ...s, image: mediaUrl(s.image) }));
}

/**
 * Get the parallax background image for a kammara section.
 * Keys: 'kammara' (main), 'kammara/lunnp1', 'kammara/eni4', etc.
 */
export function getKammaraBg(key: string): string | null {
  const bgs = (manifest as unknown as { kammaraBgs?: Record<string, string> })
    .kammaraBgs;
  return mediaUrl(bgs?.[key] ?? null);
}

