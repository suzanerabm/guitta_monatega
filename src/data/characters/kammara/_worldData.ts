import type { Locale } from '@/lib/characters';

import eni4Story from './eni4_story.json';
import eni4Subs from './eni4_subsystems.json';
import gottoStory from './gotto_story.json';
import gottoSubs from './gotto_subsystems.json';
import lunnp1Story from './lunnp1_story.json';
import lunnp1Subs from './lunnp1_subsystems.json';
import orfvStory from './orfv_story.json';
import orfvSubs from './orfv_subsystems.json';
import triplecStory from './triplec_story.json';
import triplecSubs from './triplec_subsystems.json';
import triplecMallocStory from './triplec-malloc_story.json';
import triplecMallocSubs from './triplec-malloc_subsystems.json';
import triplecMeshStory from './triplec-mesh_story.json';
import triplecMeshSubs from './triplec-mesh_subsystems.json';
import triplecSharpStory from './triplec-sharp_story.json';
import triplecSharpSubs from './triplec-sharp_subsystems.json';
import z1Story from './z1_story.json';
import z1Subs from './z1_subsystems.json';

type Bilingual<T> = { pt: T; en: T };

export interface WorldStory {
  name: Bilingual<string>;
  summary: Bilingual<string[]>;
  panel: { story: Bilingual<string[]> };
}

export interface WorldSubsystem {
  title: Bilingual<string>;
  /**
   * Optional image path for this subsystem (relative to /public).
   * Empty string means "no image". Replaces the legacy
   * `subsystemImages` array that lived in image-manifest.json —
   * the JSON itself is now the single source of truth.
   */
  img?: string;
  text: Bilingual<string[]>;
}

const STORIES: Record<string, WorldStory> = {
  eni4: eni4Story as WorldStory,
  gotto: gottoStory as WorldStory,
  lunnp1: lunnp1Story as WorldStory,
  orfv: orfvStory as WorldStory,
  triplec: triplecStory as WorldStory,
  'triplec-malloc': triplecMallocStory as WorldStory,
  'triplec-mesh': triplecMeshStory as WorldStory,
  'triplec-sharp': triplecSharpStory as WorldStory,
  z1: z1Story as WorldStory,
};

const SUBSYSTEMS: Record<string, WorldSubsystem[]> = {
  eni4: eni4Subs as WorldSubsystem[],
  gotto: gottoSubs as WorldSubsystem[],
  lunnp1: lunnp1Subs as WorldSubsystem[],
  orfv: orfvSubs as WorldSubsystem[],
  triplec: triplecSubs as WorldSubsystem[],
  'triplec-malloc': triplecMallocSubs as WorldSubsystem[],
  'triplec-mesh': triplecMeshSubs as WorldSubsystem[],
  'triplec-sharp': triplecSharpSubs as WorldSubsystem[],
  z1: z1Subs as WorldSubsystem[],
};

export function getWorldName(worldId: string, locale: Locale): string {
  const s = STORIES[worldId];
  if (!s) return '';
  return s.name[locale] || s.name.pt || '';
}

function hasRealContent(arr: string[] | undefined): boolean {
  return Array.isArray(arr) && arr.some((p) => p && p.trim());
}

export function getWorldSummary(worldId: string, locale: Locale): string[] {
  const s = STORIES[worldId];
  if (!s) return [];
  const v = s.summary[locale];
  return hasRealContent(v) ? v : s.summary.pt || [];
}

export function getWorldPanelStory(worldId: string, locale: Locale): string[] {
  const s = STORIES[worldId];
  if (!s) return [];
  const v = s.panel.story[locale];
  return hasRealContent(v) ? v : s.panel.story.pt || [];
}

export function getWorldSubsystems(
  worldId: string,
  locale: Locale,
): { title: string; text: string[]; img: string }[] {
  const subs = SUBSYSTEMS[worldId];
  if (!subs) return [];
  return subs.map((s) => {
    // If either title or text is missing in the requested locale, fall back to
    // PT for BOTH fields — so we never render a PT-titled item with EN body
    // or vice-versa.
    const titleInLocale = s.title[locale]?.trim();
    const textInLocale = s.text[locale];
    const hasTitle = !!titleInLocale;
    const hasText = Array.isArray(textInLocale) && textInLocale.some((p) => p && p.trim());
    const img = s.img || '';
    if (hasTitle && hasText) {
      return { title: titleInLocale!, text: textInLocale, img };
    }
    return {
      title: s.title.pt || '',
      text: s.text.pt || [],
      img,
    };
  });
}

/**
 * Returns the array of subsystem image paths for a world.
 * Replaces the manifest-backed `getSubsystemImages` helper.
 * Empty strings stay as empty (caller treats them as "no image").
 */
export function getWorldSubsystemImages(worldId: string): (string | null)[] {
  const subs = SUBSYSTEMS[worldId];
  if (!subs) return [];
  return subs.map((s) => (s.img && s.img.trim() ? s.img : null));
}
