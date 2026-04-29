import type { Locale } from '@/lib/characters';
import type { CreatureId } from '@/theme/palettes';

import stories from './stories.json';

type Bilingual<T> = { pt: T; en: T };

export interface CreatureStory {
  name: Bilingual<string>;
  text: Bilingual<string[]>;
  panel: { story: Bilingual<string[]> };
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
