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

/** True when the world has shipped (launch readiness >= 100). */
export function isKammaraPublished(worldId: string): boolean {
  if (showAll) return true;
  const launch = launchByPlanet.get(worldId);
  return launch !== undefined && launch >= 100;
}

/** Worlds still under 100 — what the "Próximos Planetas" heatmap shows.
 *  Returned in every environment (dev / preview / prod) so the heatmap
 *  remains editable and visible while you iterate on it locally. */
export function kammaraInProgress(): PlanetEntry[] {
  return planets.filter((p) => launchPercentFor(p) < 100);
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
