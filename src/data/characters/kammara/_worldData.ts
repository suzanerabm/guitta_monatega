import type { Locale } from '@/lib/characters';

import eni4Story from './eni4_story.json';
import eni4Subs from './eni4_subsystems.json';
import eni4Scenes from './eni4_scenes.json';
import eni4Drops from './eni4_drops.json';
import gottoStory from './gotto_story.json';
import gottoSubs from './gotto_subsystems.json';
import lunnp1Story from './lunnp1_story.json';
import lunnp1Subs from './lunnp1_subsystems.json';
import lunnp1Scenes from './lunnp1_scenes.json';
import lunnp1Drops from './lunnp1_drops.json';
import orfvStory from './orfv_story.json';
import orfvSubs from './orfv_subsystems.json';
import orfvScenes from './orfv_scenes.json';
import orfvDrops from './orfv_drops.json';
import triplecStory from './triplec_story.json';
import triplecSubs from './triplec_subsystems.json';
import triplecScenes from './triplec_scenes.json';
import triplecDrops from './triplec_drops.json';
import triplecMallocStory from './triplec-malloc_story.json';
import triplecMallocSubs from './triplec-malloc_subsystems.json';
import triplecMallocScenes from './triplec-malloc_scenes.json';
import triplecMallocDrops from './triplec-malloc_drops.json';
import triplecMeshStory from './triplec-mesh_story.json';
import triplecMeshSubs from './triplec-mesh_subsystems.json';
import triplecMeshScenes from './triplec-mesh_scenes.json';
import triplecMeshDrops from './triplec-mesh_drops.json';
import triplecSharpStory from './triplec-sharp_story.json';
import triplecSharpSubs from './triplec-sharp_subsystems.json';
import triplecSharpScenes from './triplec-sharp_scenes.json';
import triplecSharpDrops from './triplec-sharp_drops.json';
import z1Story from './z1_story.json';
import z1Subs from './z1_subsystems.json';
import z1Scenes from './z1_scenes.json';

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

export interface WorldScene {
  /** Image path relative to /public (e.g. "/imgs/kammara/lunnp1/_scenes/foo.jpg"). */
  image: string;
  /** Curated label per locale — replaces filename-derived names + word dictionary. */
  label: Bilingual<string>;
  /** Optional looping video for this scene (region strips only). The image
   *  acts as its poster. */
  video?: string;
}

export interface WorldDrop {
  /**
   * Set to false to hide this drop without deleting it (JSON has no comments).
   * Omitted/true → shown. Lets you park a clip in the JSON and toggle it.
   */
  enabled?: boolean;
  /** Video path (.mp4). The .webm sibling is offered automatically. */
  video: string;
  /** Poster image shown while the video loads. */
  poster: string;
  /** Caption per locale. */
  label: Bilingual<string>;
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

const SCENES: Record<string, WorldScene[]> = {
  eni4: eni4Scenes as WorldScene[],
  lunnp1: lunnp1Scenes as WorldScene[],
  orfv: orfvScenes as WorldScene[],
  triplec: triplecScenes as WorldScene[],
  'triplec-malloc': triplecMallocScenes as WorldScene[],
  'triplec-mesh': triplecMeshScenes as WorldScene[],
  'triplec-sharp': triplecSharpScenes as WorldScene[],
  z1: z1Scenes as WorldScene[],
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

/**
 * Returns the curated scene list for a world, with the label resolved
 * to the requested locale. Replaces the legacy manifest + word
 * dictionary path — labels live next to the images they describe in
 * <world>_scenes.json.
 */
export function getWorldScenes(
  worldId: string,
  locale: Locale,
): { name: string; image: string; video?: string }[] {
  const scenes = SCENES[worldId];
  if (!scenes) return [];
  return scenes.map((s) => ({
    image: s.image,
    name: s.label[locale]?.trim() || s.label.pt || '',
    ...(s.video ? { video: s.video } : {}),
  }));
}

// ── Drops (small clips) per world, sourced from <world>_drops.json — same
//    pattern as SCENES. Each world's Drops section reads this. ──
const DROPS: Record<string, WorldDrop[]> = {
  lunnp1: lunnp1Drops as WorldDrop[],
  eni4: eni4Drops as WorldDrop[],
  orfv: orfvDrops as WorldDrop[],
  triplec: triplecDrops as WorldDrop[],
  'triplec-malloc': triplecMallocDrops as WorldDrop[],
  'triplec-mesh': triplecMeshDrops as WorldDrop[],
  'triplec-sharp': triplecSharpDrops as WorldDrop[],
};

/** Localized drops (small clips) for a world. Empty when the world has none. */
export function getWorldDrops(
  worldId: string,
  locale: Locale,
): { video: string; poster: string; label: string }[] {
  const drops = DROPS[worldId];
  if (!drops) return [];
  return drops
    // `enabled: false` parks a clip in the JSON without showing it.
    .filter((d) => d.enabled !== false)
    .map((d) => ({
      video: d.video,
      poster: d.poster,
      label: d.label[locale]?.trim() || d.label.pt || '',
    }));
}
