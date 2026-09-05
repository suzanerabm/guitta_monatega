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

// ─── Books (Bichittos, Kammara, Arte) ───────────────────────────────────
//
// Fonte ÚNICA de verdade dos livros do site (título, capa, idioma,
// visibilidade, link de compra) — cada domínio (Bichittos, Kammara, Arte)
// tem seu próprio JSON de dados, mas todos compartilham o mesmo formato e a
// mesma lógica de resolução via `resolveBooks` abaixo. Cada IDIOMA de um
// livro é a sua própria entrada (capa e link de compra podem ser diferentes
// por edição) — chave = `<contextId>/<bookId>-<locale>`. `visible: false`
// esconde SEMPRE — em dev/preview/prod — porque é uma escolha manual de
// esconder, não um estado de progresso. Os filtros rodam no servidor
// (page.tsx de cada domínio) → livro oculto não vaza.

interface BookConfig {
  visible?: boolean;
  /** Idioma em que essa edição aparece. Cada entrada é uma edição de um só idioma. */
  onlyLocale?: 'pt' | 'en';
  /** Caminho da capa dessa edição (ex: '/imgs/books/kammara/saga-orf-v/cover.jpg'). */
  cover?: string;
  /** Título do livro, preenchido só no idioma dessa edição. */
  title?: { pt?: string; en?: string };
  buyUrl?: string;
  buyLabel?: string;
}

export interface BookEntry {
  /** `bookId` sem o prefixo de `contextId/` — usado como id estável no front. */
  id: string;
  title: string;
  cover: string | null;
  buy: { url: string; label: string } | null;
}

function resolveBuy(cfg: BookConfig): { url: string; label: string } | null {
  if (!cfg.buyUrl) return null;
  // Garante um link ABSOLUTO: sem o esquema, o navegador trataria "www.x.com"
  // como caminho relativo (guittamonatega.com/.../www.x.com).
  const raw = cfg.buyUrl.trim();
  const url = /^(https?:)?\/\//i.test(raw) || raw.startsWith('/')
    ? raw
    : `https://${raw}`;
  return { url, label: cfg.buyLabel || 'Compre na Amazon' };
}

/** Livros de um contexto (`<contextId>/...`) visíveis para o idioma dado, já
 *  resolvidos (título, capa, link de compra). Regras de visibilidade:
 *  `visible: false` esconde sempre; `onlyLocale` restringe a edição a um
 *  idioma. Ausente do JSON = não aparece (o JSON é a única fonte — sem
 *  entrada, não há livro a mostrar). */
function resolveBooks(
  config: Record<string, BookConfig>,
  contextId: string,
  locale: 'pt' | 'en',
): BookEntry[] {
  const prefix = `${contextId}/`;
  return Object.entries(config)
    .filter(([key, cfg]) => {
      if (!key.startsWith(prefix)) return false;
      if (cfg.visible === false) return false;
      if (cfg.onlyLocale && cfg.onlyLocale !== locale) return false;
      return true;
    })
    .map(([key, cfg]) => ({
      id: key.slice(prefix.length),
      title: cfg.title?.[locale] ?? key.slice(prefix.length),
      cover: cfg.cover ?? null,
      buy: resolveBuy(cfg),
    }));
}

// ─── Bichittos books — src/data/characters/bichittos/bichittos_books.json

import bichittosBooksData from '@/data/characters/bichittos/bichittos_books.json';

const bichittosBookConfig = (bichittosBooksData.books ?? {}) as Record<string, BookConfig>;
const bichittosStickerConfig = (bichittosBooksData.stickers ?? {}) as Record<string, BookConfig>;

export function getBichittoBooks(creatureId: string, locale: 'pt' | 'en'): BookEntry[] {
  return resolveBooks(bichittosBookConfig, creatureId, locale);
}

export function getBichittoStickers(creatureId: string, locale: 'pt' | 'en'): BookEntry[] {
  return resolveBooks(bichittosStickerConfig, creatureId, locale);
}

// ─── Kammara books — src/data/kammara_books.json (chave `section/bookId`)

import kammaraBooksData from '@/data/kammara_books.json';

const kammaraBookConfig = (kammaraBooksData.books ?? {}) as Record<string, BookConfig>;

export function getKammaraBooks(section: string, locale: 'pt' | 'en'): BookEntry[] {
  return resolveBooks(kammaraBookConfig, section, locale);
}

// ─── Art books — src/data/art_books.json (chave `sectionId/bookId`)

import artBooksData from '@/data/art_books.json';

const artBookConfig = (artBooksData.books ?? {}) as Record<string, BookConfig>;

export function getArtBooks(sectionId: string, locale: 'pt' | 'en'): BookEntry[] {
  return resolveBooks(artBookConfig, sectionId, locale);
}
