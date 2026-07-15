// src/lib/visibility.ts
//
// Single source of truth for "is this section ready to be public?".
// Driven by src/data/kammara_progress.json — when the average of a
// planet's category percentages hits 100, it's published. While below
// 100 it lives in the heatmap as "em construção" but is hidden from
// the rest of the site (menu, filters, world cards, links).
//
// In dev (`npm run dev`) and Vercel preview deploys, everything is
// shown regardless of progress — so we can see work-in-progress while
// editing or sharing a preview branch with collaborators. Only the
// production deploy (main → guittamonatega.com) actually hides
// unpublished sections.

import progressData from '@/data/kammara_progress.json';

interface PlanetEntry {
  id: string;
  name: { pt: string; en: string };
  progress: Record<string, number>;
  /**
   * Desliga o planeta manualmente, independente do progresso. Quando `true`,
   * o mundo fica oculto do site em produção MESMO que o progresso seja 100 —
   * é o interruptor para "reduzir volume de info" sem mentir no progresso.
   * Em dev/preview (`showAll`) segue visível, para edição.
   */
  hidden?: boolean;
}

const planets = progressData.planets as PlanetEntry[];
const categoryIds = progressData.categories.map((c) => c.id);

// Dev (`npm run dev`) and Vercel preview deploys see everything.
// Production builds (`vercel --prod` / main branch) respect the gate.
const showAll =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

function launchPercentFor(planet: PlanetEntry): number {
  const total = categoryIds.reduce(
    (sum, cat) => sum + (planet.progress[cat] ?? 0),
    0,
  );
  return Math.round(total / categoryIds.length);
}

const launchByPlanet = new Map<string, number>(
  planets.map((p) => [p.id, launchPercentFor(p)]),
);

const hiddenByPlanet = new Map<string, boolean>(
  planets.map((p) => [p.id, p.hidden === true]),
);

/** True when the world has shipped (launch readiness >= 100) and isn't
 *  manually hidden. In dev/preview (`showAll`) everything is visible so the
 *  work-in-progress stays editable. */
export function isKammaraPublished(worldId: string): boolean {
  if (showAll) return true;
  if (hiddenByPlanet.get(worldId)) return false;
  const launch = launchByPlanet.get(worldId);
  return launch !== undefined && launch >= 100;
}

/** Worlds still under 100 — what the "Próximos Planetas" heatmap shows.
 *  In dev/preview (`showAll`) returns every under-100 world so the heatmap
 *  stays editable locally. In production, worlds marked `hidden` are dropped
 *  so a manually-disabled planet doesn't resurface in the heatmap. */
export function kammaraInProgress(): PlanetEntry[] {
  return planets.filter((p) => {
    if (launchPercentFor(p) >= 100) return false;
    if (!showAll && p.hidden === true) return false;
    return true;
  });
}

// ─── Bichittos ──────────────────────────────────────────────────────────
//
// Bichittos doesn't have a progress heatmap; visibility is just a
// flat true/false flag per creature. Same dev/preview override as
// Kammara: only the production main deploy actually hides anything.

const BICHITTOS_PUBLISHED: Record<string, boolean> = {
  napcat: true,
  zeco: true,
  taylo: true,
  cheiodebolinha: true,
  miscelania: false, // "Fada Candy" — em construção
};

/** True when the bichittos creature is ready to be public. */
export function isBichittoPublished(creatureId: string): boolean {
  if (showAll) return true;
  return BICHITTOS_PUBLISHED[creatureId] ?? true;
}
