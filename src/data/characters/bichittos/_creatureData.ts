// Só servidor. Este módulo carrega os JSONs de conteúdo INTEIROS, inclusive o
// que não está publicado — se um client component importar daqui, essa lore vai
// junto pro bundle do navegador. O `server-only` transforma isso em erro de
// build. Os dados chegam ao cliente por props, via `src/lib/content/`.
import 'server-only';
import type { Locale } from '@/lib/characters';
import type { CreatureId } from '@/theme/palettes';
import { mediaUrl } from '@/lib/media';

import stories from './stories.json';

type Bilingual<T> = { pt: T; en: T };

export interface CreatureStory {
  name: Bilingual<string>;
  text: Bilingual<string[]>;
  panel: { story: Bilingual<string[]> };
  carousel?: CreatureCarouselItem[];
}

export interface CreatureCarouselItem {
  /** Nome usado como legenda e como chave para as traduções existentes. */
  name: string;
  /** Caminho da imagem dentro de /public. */
  image: string;
  /** `false` esconde a imagem sem remover sua configuração. */
  visible?: boolean;
}

const STORIES = stories as Record<CreatureId, CreatureStory>;

function hasRealContent(arr: string[] | undefined): boolean {
  return Array.isArray(arr) && arr.some((p) => p && p.trim());
}

export function getCreatureName(id: CreatureId, locale: Locale): string {
  const s = STORIES[id];
  if (!s) return '';
  return s.name[locale] || s.name.pt || '';
}

/** Texto curto do CreatureCard (fora do banner). */
export function getCreatureText(id: CreatureId, locale: Locale): string[] {
  const s = STORIES[id];
  if (!s) return [];
  const v = s.text[locale];
  return hasRealContent(v) ? v : s.text.pt || [];
}

/** Parágrafos do DSTextPanel dentro do DSMainCard. */
export function getCreaturePanelStory(id: CreatureId, locale: Locale): string[] {
  const s = STORIES[id];
  if (!s) return [];
  const v = s.panel.story[locale];
  return hasRealContent(v) ? v : s.panel.story.pt || [];
}

/** Imagens do carrossel, na mesma ordem em que aparecem no JSON. */
export function getCreatureCarousel(id: CreatureId): CreatureCarouselItem[] {
  return (STORIES[id]?.carousel ?? [])
    .filter((item) => item.visible !== false)
    .map((item) => ({ ...item, image: mediaUrl(item.image) }));
}

/** Texto da seção "Livros" (não é uma criatura — chave própria em stories.json). */
export function getBooksText(locale: Locale): string[] {
  const s = (stories as Record<string, Pick<CreatureStory, 'name' | 'text'>>).livros;
  if (!s) return [];
  const v = s.text[locale];
  return hasRealContent(v) ? v : s.text.pt || [];
}
