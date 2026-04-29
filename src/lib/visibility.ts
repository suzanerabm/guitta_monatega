// src/lib/visibility.ts
//
// Single source of truth for "is this Kammara world ready to be public?".
// Driven entirely by src/data/kammara_progress.json — when the average of
// a planet's category percentages hits 100, it's published. While below
// 100 it lives in the heatmap as "em construção" but is hidden from the
// rest of the site (menu, filters, world cards, links).
//
// Worlds not present in the JSON default to NOT published.

import progressData from '@/data/kammara_progress.json';

interface PlanetEntry {
  id: string;
  name: { pt: string; en: string };
  progress: Record<string, number>;
}

const planets = progressData.planets as PlanetEntry[];
const categoryIds = progressData.categories.map((c) => c.id);

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
  const launch = launchByPlanet.get(worldId);
  return launch !== undefined && launch >= 100;
}

/** Worlds still under 100 — what the "Próximos Planetas" heatmap shows. */
export function kammaraInProgress(): PlanetEntry[] {
  return planets.filter((p) => launchPercentFor(p) < 100);
}
