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

// ─── Bichittos books ─────────────────────────────────────────────────────
//
// Fonte ÚNICA de verdade dos livros dos Bichittos (título, capa, idioma,
// visibilidade, link de compra) — lida de
// `src/data/characters/bichittos/bichittos_books.json`. Cada IDIOMA de um
// livro é a sua própria entrada (capa e link de compra podem ser diferentes
// por edição). Diferente de `isBichittoPublished` (gate de "publicado"),
// aqui `visible: false` esconde SEMPRE — em dev/preview/prod — porque é uma
// escolha manual de esconder, não um estado de progresso. O filtro roda no
// servidor (bichittos/page.tsx) → não vaza.

import booksVisibility from '@/data/characters/bichittos/bichittos_books.json';

interface BichittoBookConfig {
  visible?: boolean;
  /** Idioma em que essa edição aparece. Cada entrada é uma edição de um só idioma. */
  onlyLocale?: 'pt' | 'en';
  /** Caminho da capa dessa edição (ex: '/imgs/books/zeco/zeco-estacoes/cover.png'). */
  cover?: string;
  /** Título do livro, preenchido só no idioma dessa edição. */
  title?: { pt?: string; en?: string };
  buyUrl?: string;
  buyLabel?: string;
}

const bookConfig = (booksVisibility.books ?? {}) as Record<string, BichittoBookConfig>;

export interface BichittoBookEntry {
  /** `bookId` sem o prefixo de `creatureId/` — usado como id estável no front. */
  id: string;
  title: string;
  cover: string | null;
  buy: { url: string; label: string } | null;
}

function resolveBichittoBuy(cfg: BichittoBookConfig): { url: string; label: string } | null {
  if (!cfg.buyUrl) return null;
  // Garante um link ABSOLUTO: sem o esquema, o navegador trataria "www.x.com"
  // como caminho relativo (guittamonatega.com/.../www.x.com).
  const raw = cfg.buyUrl.trim();
  const url = /^(https?:)?\/\//i.test(raw) || raw.startsWith('/')
    ? raw
    : `https://${raw}`;
  return { url, label: cfg.buyLabel || 'Compre na Amazon' };
}

/** Livros de uma criatura visíveis para o idioma dado, já resolvidos (título,
 *  capa, link de compra). Regras de visibilidade: `visible: false` esconde
 *  sempre; `onlyLocale` restringe a edição a um idioma. Ausente do JSON = não
 *  aparece (o JSON é a única fonte — sem entrada, não há livro a mostrar). */
export function getBichittoBooks(creatureId: string, locale: 'pt' | 'en'): BichittoBookEntry[] {
  const prefix = `${creatureId}/`;
  return Object.entries(bookConfig)
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
      buy: resolveBichittoBuy(cfg),
    }));
}

// ─── Kammara books ───────────────────────────────────────────────────────
//
// Fonte ÚNICA de verdade dos livros de Kammara (título, capa, idioma,
// visibilidade, link de compra) — lida de `src/data/kammara_books.json`.
// Diferente do bloco dos Bichittos (que só controla visibilidade/compra
// sobre dados vindos do image-manifest + i18n), aqui o JSON já é dono de
// tudo: cada IDIOMA de um livro é a sua própria entrada (capa e link de
// compra podem ser diferentes por edição). Chave = `section/bookId`.

import kammaraBooksData from '@/data/kammara_books.json';

interface KammaraBookConfig {
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

const kammaraBookConfig = (kammaraBooksData.books ?? {}) as Record<string, KammaraBookConfig>;

export interface KammaraBookEntry {
  /** `bookId` sem o prefixo de `section/` — usado como id estável no front. */
  id: string;
  title: string;
  cover: string | null;
  buy: { url: string; label: string } | null;
}

function resolveBuy(cfg: KammaraBookConfig): { url: string; label: string } | null {
  if (!cfg.buyUrl) return null;
  // Garante um link ABSOLUTO: sem o esquema, o navegador trataria "www.x.com"
  // como caminho relativo (guittamonatega.com/.../www.x.com).
  const raw = cfg.buyUrl.trim();
  const url = /^(https?:)?\/\//i.test(raw) || raw.startsWith('/')
    ? raw
    : `https://${raw}`;
  return { url, label: cfg.buyLabel || 'Compre na Amazon' };
}

/** Livros de Kammara visíveis para o idioma dado, já resolvidos (título,
 *  capa, link de compra). `section` = 'kammara' pro livro do universo geral.
 *  Regras de visibilidade: `visible: false` esconde sempre; `onlyLocale`
 *  restringe a edição a um idioma. Ausente do JSON = não aparece (o JSON é a
 *  única fonte — sem entrada, não há livro a mostrar). */
export function getKammaraBooks(section: string, locale: 'pt' | 'en'): KammaraBookEntry[] {
  const prefix = `${section}/`;
  return Object.entries(kammaraBookConfig)
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
