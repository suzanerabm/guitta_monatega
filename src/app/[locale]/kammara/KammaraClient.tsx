'use client';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import { useTranslations, useLocale } from 'next-intl';
import { resolveInitialFilter } from './resolveInitialFilter';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CreatureSection } from '@/components/CreatureSection';
import { KammaraPlanetTitle } from '@/components/KammaraPlanetTitle';
import { KammaraCard } from '@/components/KammaraCard';
import { KammaraCardRegion } from '@/components/KammaraCardRegion';
import { KammaraCharacterCard } from '@/components/KammaraCharacterCard';
import { KammaraCharacterGallery } from '@/components/KammaraCharacterGallery';
import { getCharactersForContext, getLocalizedBio, getLocalizedName as getCharLocalizedName, getLocalizedSpecies } from '@/lib/characters';
import { DSMainCard } from '@/components/DSMainCard';
import { KammaraSceneCollage } from '@/components/KammaraSceneCollage';
import { SceneStrip } from '@/components/SceneStrip';
import { KammaraCardSubsystem, KammaraCardSubsystemContainer, KammaraCardSubsystemHorizontal } from '@/components/KammaraCardSubsystem';
import { RegionDivider } from '@/components/RegionDivider';
import { RegionBanner } from '@/components/RegionBanner';
import { KammaraDropsStrip } from '@/components/KammaraDropsStrip';
import { BookShelf } from '@/components/BookShelf';
import { KammaraProgressHeatmap } from '@/components/KammaraProgressHeatmap';
import kammaraProgressData from '@/data/kammara_progress.json';
import { isKammaraPublished, kammaraInProgress } from '@/lib/visibility';
import { KammaraEvents } from '@/components/KammaraEvents';
import kammaraEventsData from '@/data/kammara_events.json';
import { KammaraPlanetCard } from '@/components/KammaraPlanetCard';
import { KammaraDropsMosaic } from '@/components/KammaraDropsMosaic';
import kammaraMosaicData from '@/data/kammara_mosaic.json';
import { useModal } from '@/components/Modal';
import { palettes, type PaletteName, type Palette } from '@/theme/palettes';

const kammaraHero = palettes.kammara.hero!;
import { subsystemGlyph, worldCrestGlyph } from '@/theme/kalunGlyphs';
import { translateName } from '@/lib/translateName';
import {
  getWorldName,
  getWorldSummary,
  getWorldPanelStory,
  getWorldSubsystems,
  getWorldTags,
} from '@/data/characters/kammara/_worldData';
import { KammaraStarField } from './KammaraStarField';

// ============================================================================
// Types & constants
// ============================================================================

type WorldId = 'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto' | 'digg' | 'memphis';
type TriplecRegionId = 'malloc' | 'mesh' | 'sharp';
type Locale = 'pt' | 'en';

const TRIPLEC_REGION_IDS = ['malloc', 'mesh', 'sharp'] as const;

interface RegionData {
  id: TriplecRegionId;
  chars: { name: string; image: string }[];
  scenes: { name: string; image: string; video?: string }[];
  drops: { video: string; poster: string; label: string }[];
  bgImage: string | null;
  subsystemImages: (string | null)[];
}

interface WorldData {
  id: WorldId;
  chars: { name: string; image: string }[];
  scenes: { name: string; image: string; video?: string }[];
  drops: { video: string; poster: string; label: string }[];
  bgImage: string | null;
  subsystemImages: (string | null)[];
  /** Sub-regions inside a world. Only triplec currently uses this. */
  regions?: Partial<Record<TriplecRegionId, RegionData>>;
}

interface KammaraBook {
  id: string;
  title: string;
  cover: string | null;
  buy: { url: string; label: string } | null;
  pages: string[];
}

interface Props {
  worlds: WorldData[];
  kammaraBooks: KammaraBook[];
  kammaraBg: string | null;
  kammaraChars: { name: string; image: string }[];
}

const WORLD_NAMES: Record<WorldId, string> = {
  lunnp1: "LUNN'P1",
  eni4: 'ENI-4Δ',
  triplec: 'TripleC',
  orfv: 'ORF-V',
  z1: 'Z1',
  gotto: 'Gotto',
  digg: 'Digg',
  memphis: 'Memphis',
};

/**
 * Per-world color indices into the palette.colors[] array. Matches the
 * Astro original where triplec/orfv use their -4 color (colors[3]) as
 * the name instead of -1, because their -1 purple doesn't read well
 * on the dark gradient.
 */
const WORLD_COLOR_INDICES: Record<
  WorldId,
  { name: number; text: number; title: number; label: number }
> = {
  lunnp1: { name: 0, text: 2, title: 1, label: 5 },
  eni4: { name: 0, text: 2, title: 1, label: 5 },
  triplec: { name: 3, text: 2, title: 1, label: 5 },
  orfv: { name: 3, text: 2, title: 1, label: 5 },
  z1: { name: 0, text: 2, title: 1, label: 5 },
  gotto: { name: 3, text: 2, title: 1, label: 5 },
  digg: { name: 3, text: 2, title: 1, label: 5 },
  memphis: { name: 3, text: 2, title: 1, label: 5 },
};

/**
 * Per-world text color override. When a world's background image has tones
 * too similar to the palette's `colors[]`, force an explicit color so text
 * stays legible. Keys: name = h1, text = body copy, title = DSTextPanel h2,
 * label = strip labels / scene captions / subsystem subtitles.
 */
const WORLD_TEXT_OVERRIDE: Partial<
  Record<WorldId, { name?: string; text?: string; title?: string; label?: string }>
> = {
  triplec: {
    // Only body text forced white; name/title/label keep palette colors.
    text: '#ffffff',
  },
};

interface WorldColors {
  name: string;
  text: string;
  title: string;
  /** Brighter accent for borders/labels inside the DSMainCard strip side */
  titleDestaque: string;
  label: string;
  /** The legacy `arrowColor` for SceneStrip + `titleColor` for SubSystem */
  arrow: string;
  /** The legacy `subtitleColor` for SubSystem + `labelColor` for SceneStrip */
  subtitle: string;
  /** The CreatureSection accent (radial tint in the corner) */
  accent: string;
}

/**
 * Resolve the 7 derived colors of a world from its palette + overrides.
 * Encapsulates the `WORLD_TEXT_OVERRIDE[id] ?? palette.colors[indices[k]]`
 * pattern so the JSX below is free of `??` chains.
 */
function getWorldColors(w: WorldData, palette: Palette): WorldColors {
  const override = WORLD_TEXT_OVERRIDE[w.id];
  const idx = WORLD_COLOR_INDICES[w.id];
  // eni4 uses the palette's label slot for its scene/subsystem subtitle;
  // every other world uses colors[3]. This was the rule that existed
  // inline before the refactor and is preserved as-is.
  const subtitle =
    override?.label ??
    (w.id === 'eni4' ? palette.colors[idx.label] : palette.colors[3]);
  return {
    name: override?.name ?? palette.colors[idx.name],
    text: override?.text ?? palette.colors[idx.text],
    title: override?.title ?? palette.colors[idx.title],
    titleDestaque: palette.dark,
    label: override?.label ?? palette.colors[idx.label],
    arrow: override?.title ?? palette.colors[1],
    subtitle,
    // triplec gets a custom pastel green accent instead of its palette[0]
    // purple, because purple fights the forest bg image.
    accent: w.id === 'triplec' ? '#8ce8a8' : palette.colors[0],
  };
}

/** Filter out subsystems that still hold the raw "Placeholder — ..." text. */
const hasRealContent = (s: { text: string[] }) =>
  s.text.length > 0 && !s.text[0].startsWith('Placeholder');

/** Render a panel story array as <h2>/<h3>/<p> based on `##`/`###` prefixes. */
// Detect a "glyph line": a maximal prefix of Kalún glyph chars (⊶ ⊷ ⊙ ⊹ • — ⋄)
// and spaces, followed by whitespace, followed by a descriptive label
// (regular words). Captures the glyph cluster and the label so we can render
// them as a table row with the glyph colored in the accent hue.
//
// Uses a maximal-munch on [glyph chars + spaces] then requires at least one
// space before a word character — so single-space separators like "⊶ ⊶ atenção"
// work the same as "⊶ ⊷  voltar".
const GLYPH_LINE = /^([⊶⊷⊙⊹•—⋄][⊶⊷⊙⊹•—⋄\s]*?)\s+[:\-–—]?\s*([A-Za-zÀ-ÿ].*)$/;
// "TERM : description" — strict: term must be a compact identifier
// (uppercase codes like MOVE / BLM / Δ-PRIME, short lowercase codes like
// tk / tk-tk, or punch-card patterns like ■ □ □ ■ □). The separator must
// be " : " (colon only — dashes/em-dashes are avoided because they show
// up inside normal sentences).
const TERM_LINE = /^([A-ZΔ][A-Za-zÀ-ÿ0-9Δ]*(?:[-\s][A-Za-zÀ-ÿ0-9Δ]+)?(?:-[A-Za-zÀ-ÿ0-9Δ]+)*|[a-z]{1,5}(?:-[a-z]{1,5})*|[■□](?:\s*[■□])+)\s+:\s+(.+)$/;

function parseGlyphLine(p: string): { glyph: string; label: string } | null {
  const m = p.match(GLYPH_LINE);
  if (!m) return null;
  const glyph = m[1].trim();
  const label = m[2].trim();
  if (!glyph || !label) return null;
  return { glyph, label };
}

function parseTermLine(p: string): { glyph: string; label: string } | null {
  const m = p.match(TERM_LINE);
  if (!m) return null;
  const term = m[1].trim();
  const body = m[2].trim();
  if (!term || !body) return null;
  return { glyph: term, label: body };
}

function renderStory(story: string[], accentColor?: string) {
  const out: React.ReactElement[] = [];
  let tableBuf: { glyph: string; label: string }[] = [];

  const flushTable = (key: string) => {
    if (tableBuf.length === 0) return;
    const rows = tableBuf;
    tableBuf = [];
    out.push(
      <Box
        key={key}
        as="table"
        width="100%"
        my="md"
        css={{
          borderCollapse: 'separate',
          borderSpacing: '0',
          '& td': {
            padding: '0.5rem 0.75rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          },
          '& tr:last-child td': {
            borderBottom: 'none',
          },
        }}
      >
        <Box as="tbody">
          {rows.map((row, idx) => {
            // Kalún symbols should render in the glyph font; plain identifiers
            // (MOVE, BLM, tk, ■ □ □) render in mono/sans so they stay readable.
            const isKalun = /^[⊶⊷⊙⊹•—⋄\s]+$/.test(row.glyph);
            return (
              <Box as="tr" key={idx}>
                <Box
                  as="td"
                  fontFamily={isKalun ? 'glyph' : 'mono'}
                  fontSize={isKalun ? '1.25rem' : '0.85rem'}
                  fontWeight="normal"
                  textAlign={isKalun ? 'center' : 'left'}
                  whiteSpace="nowrap"
                  letterSpacing={isKalun ? '0.08em' : '0.04em'}
                  css={{
                    color: accentColor ?? 'inherit',
                    minWidth: '5rem',
                    width: '1%', /* shrink-wrap to content */
                    paddingRight: '1rem',
                    verticalAlign: 'middle',
                  }}
                >
                  {row.glyph}
                </Box>
                <Box as="td" css={{ verticalAlign: 'middle' }}>
                  {row.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>,
    );
  };

  story.forEach((p, i) => {
    const row = parseGlyphLine(p) ?? parseTermLine(p);
    if (row) {
      tableBuf.push(row);
      return;
    }
    flushTable(`table-${i}`);
    if (p.startsWith('### ')) {
      out.push(<h3 key={i}>{p.slice(4)}</h3>);
    } else if (p.startsWith('## ')) {
      out.push(<h2 key={i}>{p.slice(3)}</h2>);
    } else {
      out.push(<p key={i}>{p}</p>);
    }
  });
  flushTable('table-end');
  return out;
}

/**
 * Map a subsystem title (PT or EN) to its semantic Kalún glyph.
 * Based on the glossary defined in i18n pt.json →
 * characters.kammara.lunnp1.subsystems["Os Glifos Kalún"]:
 *   Cultura         → ⊙    (centro, foco)
 *   Flora & Fauna   → •    (semente, começo)
 *   Geografia       → —    (fluxo, caminho)
 *   Ciclos & Luas   → ⊶⊷   (abertura/fechamento — ritmo)
 *   A Água          → ⋄    (silêncio, pausa)
 *   Idioma          → ⊹⊙⊹  (universo, linguagem)
 *   Os Glifos Kalún → ⊹    (ancestral, memória)
 * Falls back to "⊙" (centro/foco) for any other title.
 */

// ============================================================================
// Main component
// ============================================================================

export function KammaraClient({ worlds, kammaraBooks, kammaraBg, kammaraChars }: Props) {
  const t = useTranslations('kammara');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  // No "all" on /kammara: it would mount every world at once and freeze the
  // page. We open on the Kammara intro and mount one world at a time — the
  // intro section stays mounted always; each world mounts only when active.
  //
  // O planeta ativo vive na URL como `?planet=lunnp1`, então refresh e link
  // compartilhado reabrem o mundo certo. O estado inicial lê esse param (só
  // aceita mundos publicados; senão cai na vitrine 'kammara').
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const publishedIds = useMemo(
    () => [
      ...worlds.filter((w) => isKammaraPublished(w.id)).map((w) => w.id),
      ...(kammaraBooks.length > 0 ? ['livros'] : []),
    ],
    [worlds, kammaraBooks],
  );
  const [activeFilter, setActiveFilter] = useState(() =>
    // `planet` é o param atual; `planeta` é o legado em PT (links antigos).
    resolveInitialFilter(
      searchParams.get('planet') ?? searchParams.get('planeta'),
      publishedIds,
    ),
  );

  // Troca o filtro E sincroniza a URL (?planet=<id>), sem recarregar nem
  // empilhar histórico (replace). 'kammara' remove o param. Todos os pontos de
  // entrada (menu, cards, mosaico) passam por aqui.
  const handleSelectFilter = useCallback(
    (id: string) => {
      setActiveFilter(id);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('planeta'); // limpa o param legado (PT) se estiver na URL
      if (id === 'kammara') params.delete('planet');
      else params.set('planet', id);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );

  const { registerGallery, openKammaraGallery } = useModal();

  // Word dictionary used by translateName() for filename-derived labels.
  const words = tCommon.raw('words') as Record<string, string>;

  // ── Safe i18n helpers ──────────────────────────────────────────────────
  // next-intl throws when a key is missing. These helpers swallow the
  // error and return a fallback so the JSX stays clean.
  const safeT = (key: string, fallback = ''): string => {
    try {
      return t(key as never);
    } catch {
      return fallback;
    }
  };
  const safeTRaw = <T,>(key: string, fallback: T): T => {
    try {
      return t.raw(key) as T;
    } catch {
      return fallback;
    }
  };

  // ── Shared i18n values (same for every world/region) ─────────────────
  const charactersTitle = safeT('charactersTitle');
  const scenesTitle = safeT('scenesTitle');
  const subsystemsTitle = safeT('subsystemsTitle');
  const placeholder = safeT('placeholder');
  const sectionName = safeT('section.name', 'Kammara');
  const sectionText = safeTRaw<string[]>('section.text', []);
  const sectionStory = safeTRaw<string[]>('section.panel.story', []);

  // ── Modal gallery registration for kammara books ──────────────────────
  const bookGalleries = useMemo(() => {
    const out: Record<string, { title: string; pages: string[] }> = {};
    for (const book of kammaraBooks) {
      if (book.pages.length === 0) continue;
      out[`book_kammara-${book.id}`] = {
        title: book.title,
        pages: book.pages,
      };
    }
    return out;
  }, [kammaraBooks]);

  useEffect(() => {
    for (const [id, g] of Object.entries(bookGalleries)) {
      registerGallery(id, g.pages);
    }
  }, [bookGalleries, registerGallery]);

  // Scroll the freshly-activated section to just below the sticky FilterBar
  // whenever the active world changes. This is the single scroll path for BOTH
  // the menu pills and the planet entry cards (the FilterBar defers its own
  // scroll to us while controlled). We skip the first render so opening the
  // page on the Kammara intro doesn't yank the viewport down. The 550ms delay
  // matches the section's hidden→visible max-height transition: the new world
  // only just mounted, so its [data-section-creature] needs a beat to settle
  // into final coordinates before we measure.
  const didMountScroll = useRef(false);
  useEffect(() => {
    if (!didMountScroll.current) {
      didMountScroll.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      const bar = document.querySelector('nav[aria-label="filters"]');
      const target = document.querySelector(
        `[data-section-creature="${activeFilter}"]`,
      );
      if (!target) return;
      const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
      const offset = barBottom + 10;
      const top =
        (target as HTMLElement).getBoundingClientRect().top +
        window.scrollY -
        offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 550);
    return () => window.clearTimeout(timer);
  }, [activeFilter]);

  const handleBookClick = (rawBookId: string) => {
    const galleryId = `book_kammara-${rawBookId.replace(/^kammara-/, '')}`;
    const g = bookGalleries[galleryId];
    if (!g) return;
    openKammaraGallery({
      galleryId,
      startIndex: 0,
      color: kammaraPalette.colors[0],
      darkColor: kammaraPalette.dark,
      textColor: kammaraPalette.text,
      crestGlyph: worldCrestGlyph('kammara'),
      heroTitle: g.title,
    });
  };

  // Mundos com launchValue >= 100 (média das 7 categorias em
  // kammara_progress.json). Os incompletos aparecem APENAS no heatmap
  // de "Próximos Planetas" — não no filtro, no menu ou como seção da
  // página. Quando chegam a 100, somem do heatmap e entram em tudo
  // o resto.
  const publishedWorlds = worlds.filter((w) => isKammaraPublished(w.id));

  // ── Filter bar ────────────────────────────────────────────────────────
  const filters = [
    { id: 'kammara', label: sectionName, color: palettes.kammara.colors[0], bgColor: palettes.kammara.dark },
    ...publishedWorlds.map((w) => ({
      id: w.id,
      label: WORLD_NAMES[w.id],
      color: palettes[w.id as PaletteName].colors[0],
      bgColor: palettes[w.id as PaletteName].dark,
    })),
    ...(kammaraBooks.length > 0
      ? [{ id: 'livros', label: safeT('booksTitle', 'Livros'), color: palettes.kammara.colors[0], bgColor: palettes.kammara.dark }]
      : []),
  ];

  const kammaraPalette = palettes.kammara;
  const kammaraHidden = activeFilter !== 'kammara';
  const booksHidden = activeFilter !== 'livros';

  // Cards de entrada: um por mundo publicado, com nome/texto/tags/imagem/cor
  // resolvidos dos dados do mundo (sem duplicar conteúdo). Clicar aciona o
  // mesmo setActiveFilter do FilterBar (monta a seção daquele mundo).
  const worldCards = publishedWorlds.map((w) => ({
    id: w.id,
    name: getWorldName(w.id, locale) || WORLD_NAMES[w.id],
    summary: (getWorldSummary(w.id, locale)[0] ?? ''),
    tags: getWorldTags(w.id, locale),
    crestGlyph: worldCrestGlyph(w.id),
    color: palettes[w.id as PaletteName].colors[0],
    darkColor: palettes[w.id as PaletteName].dark,
    image: w.bgImage ?? undefined,
  }));

  // Mosaico de drops curado (src/data/kammara_mosaic.json), localizado. Cada
  // clip carrega a marca do seu planeta (nome + glifo); clicar abre o mundo.
  // Filtra clips de planetas não publicados: senão vídeo/poster/label deles
  // vazariam no payload mesmo com o mundo oculto do resto do site.
  const mosaicClips = kammaraMosaicData
    .filter((c) => isKammaraPublished(c.world))
    .map((c) => ({
    video: c.video,
    poster: c.poster,
    label: c.label[locale] ?? c.label.pt,
    worldId: c.world,
    worldName: getWorldName(c.world, locale) || WORLD_NAMES[c.world as WorldId] || c.world,
    crestGlyph: worldCrestGlyph(c.world),
  }));

  // Só eventos de planetas publicados chegam ao componente — senão título,
  // data, local e planeta de mundos ocultos vazariam no payload de produção.
  const publishedEvents = kammaraEventsData.events.filter((e) =>
    isKammaraPublished(e.planet),
  );

  // ── Per-world content ──────────────────────────────────────────────────
  // Everything a WorldSection needs is shared here so the sub-component
  // stays small and easy to read below. With no "all", exactly one section is
  // active: only the active world is MOUNTED (its images/videos exist in the
  // DOM); the rest aren't rendered at all, which is what keeps the page light.
  const perWorldProps = publishedWorlds.map((w) => ({
    w,
    palette: palettes[w.id as PaletteName],
    colors: getWorldColors(w, palettes[w.id as PaletteName]),
    name: getWorldName(w.id, locale) || WORLD_NAMES[w.id],
    bodyText: getWorldSummary(w.id, locale),
    panelStory: getWorldPanelStory(w.id, locale),
    subsystems: getWorldSubsystems(w.id, locale),
    mount: activeFilter === w.id,
  }));

  return (
    <>
      <HeroSection
        label={t('heroLabel')}
        title={t('heroTitle')}
        description={t('heroDesc')}
        background={kammaraHero.background}
        textColor={kammaraHero.textColor}
        labelColor={kammaraHero.labelColor}
      >
        <KammaraHeroStars />
      </HeroSection>

      <FilterBar
        filters={filters}
        showAll={false}
        defaultActive="kammara"
        active={activeFilter}
        onFilter={handleSelectFilter}
        defaultTintColor={palettes.kammara.dark}
      />

      {/* ── KAMMARA META SECTION ───────────────────────────────────────── */}
      <CreatureSection
        id="kammara"
        gradient={kammaraPalette.gradient}
        accentColor={kammaraPalette.colors[4]}
        bgImage={kammaraBg ?? undefined}
        hidden={kammaraHidden}
      >
        <KammaraStarField />
        <KammaraPlanetTitle
          name={sectionName}
          palette="kammara"
          category="Universo"
          declarer="universe"
          crestGlyph={worldCrestGlyph('kammara')}
          descriptionMaxWidth="880px"
          description={
            <>
              {sectionText.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </>
          }
        />
        {/* Same trim as the planets: cancel the DSMainCard's legacy mobile
            `mt: 8rem` so the intro title + card sit close, no empty gap. */}
        <Box mt={{ base: '-6rem', md: 0 }}>
        <DSMainCard
          characters={[]}
          gradient={kammaraPalette.gradientBg}
          height="1400px"
          maxHeight="80vh"
          titleColor={kammaraPalette.colors[0]}
          textColor={kammaraPalette.colors[1]}
          stripSide
          textPanelTitle={sectionName}
          glyphVariant="universe"
          text={renderStory(sectionStory, kammaraPalette.colors[0])}
          renderPanel={({ text: panelText }) => (
            <KammaraCard
              name={sectionName}
              category="Universo"
              color={kammaraPalette.colors[0]}
              darkColor={kammaraPalette.dark}
              crestGlyph={worldCrestGlyph('kammara')}
              tabs={[
                {
                  id: 'kammara-story',
                  icon: '⊙',
                  label: sectionName,
                  title: sectionName,
                  content: panelText,
                },
              ]}
            />
          )}
        >
          {/* Side slot: a curated mosaic of drops (kammara_mosaic.json) — a
              living sample of the universe next to the intro text. */}
          <KammaraDropsMosaic clips={mosaicClips} color={kammaraPalette.colors[0]} onSelectWorld={handleSelectFilter} />
        </DSMainCard>
        </Box>

        {/* ── Título "Planetas" — mesmo componente da intro do universo.
            Textos vêm do i18n (kammara.planetsTitle / planetsDesc). ── */}
        <KammaraPlanetTitle
          name={safeT('planetsTitle', 'Planetas')}
          palette="kammara"
          category={sectionName}
          declarer="universe"
          crestGlyph={worldCrestGlyph('kammara')}
          description={safeT('planetsDesc', '')}
        />

        {/* ── Cards de entrada dos mundos — o coração da vitrine. Clicar num
            card aciona o filtro (monta a seção daquele mundo). ── */}
        <Box width="100%" my={{ base: 'xl', lg: '4xl' }} px={{ base: '25px', md: '2rem', xl: '3rem' }}>
          {/* 1 coluna até xl; 2 colunas a partir de 1280px (xl). */}
          <Grid gridTemplateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap="lg">
            {worldCards.map((w) => (
              <KammaraPlanetCard
                key={w.id}
                id={w.id}
                name={w.name}
                summary={w.summary}
                image={w.image}
                crestGlyph={w.crestGlyph}
                color={w.color}
                darkColor={w.darkColor}
                badges={w.tags}
                onSelect={handleSelectFilter}
              />
            ))}
          </Grid>
        </Box>
        {(() => {
          const contextId = 'kammara/kammara';
          const characterData = getCharactersForContext(contextId);
          const galleryItems = characterData
            .filter((char) => char.visible !== false)
            .map((char) => {
              const manifestMatch = kammaraChars.find(
                (c) => c.name.toLowerCase().trim() === char.match.toLowerCase().trim(),
              );
              const image = char.image ?? manifestMatch?.image;
              if (!image) return null;
              return {
                name: getCharLocalizedName(char, locale),
                species: getLocalizedSpecies(char, locale),
                bio: getLocalizedBio(char, locale),
                image,
                backImage: char.backImage,
                backTitle: char.backTitle?.[locale],
                dorsalMeaning: char.dorsalMeaning?.[locale],
                backMeaning: char.backMeaning?.[locale],
                attributes: char.attributes?.map((a) => ({
                  glyph: a.glyph,
                  label: a.label[locale],
                  value: a.value[locale],
                })),
              };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);
          if (galleryItems.length === 0) return null;
          return (
            <Box width="100%" my="3xl" px={{ base: "25px", md: "2rem", xl: "3rem" }}>
              <KammaraCharacterGallery
                title={`${charactersTitle} · ${sectionName}`}
                worldCrestGlyph={worldCrestGlyph('kammara')}
                color={kammaraPalette.colors[0]}
                darkColor={kammaraPalette.dark}
                items={galleryItems}
                minCardWidth={320}
              minCardWidthMd={316}
              minCardWidthLg={360}
                renderCard={(char) => (
                  <Box height={{ base: '460px', md: '600px' }}>
                    <KammaraCharacterCard
                      name={char.name}
                      species={char.species}
                      bio={char.bio}
                      image={char.image}
                      backImage={char.backImage}
                      backTitle={char.backTitle}
                      dorsalMeaning={char.dorsalMeaning}
                      backMeaning={char.backMeaning}
                      attributes={char.attributes}
                      worldName={sectionName}
                      worldCrestGlyph={worldCrestGlyph('kammara')}
                      color={kammaraPalette.colors[0]}
                      darkColor={kammaraPalette.dark}
                    />
                  </Box>
                )}
              />
            </Box>
          );
        })()}

        {/* ── PRÓXIMOS EVENTOS — eventos in-universe de Kammara ──────────
            A `Box` externa controla padding + imagem de fundo da seção.
            Pra trocar a imagem: jogue um arquivo em
            `public/imgs/kammara/_events_bg.png` (ou ajuste o path no
            `backgroundImage`). O overlay garante leitura mesmo se a
            imagem for clara.

            Visibilidade controlada por DADOS, não por código: a seção some
            quando `kammara_events.json` tem `"visible": false` — ou quando
            não sobra nenhum evento de planeta publicado. Basta editar o JSON
            para ligar/desligar; nenhuma mudança de código é necessária. */}
        {kammaraEventsData.visible !== false && publishedEvents.length > 0 && (
        <Box
          width="100%"
          my="3xl"
          px={{ base: '25px', md: '2rem', xl: '3rem' }}
          pt={{ base: '2rem', md: '3rem' }}
          pb="60px"
          position="relative"
          overflow="hidden"
          backgroundImage="url(/imgs/kammara/_events_bg.jpg)"
          backgroundSize="cover"
          backgroundPosition="center"
        >
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.700"
            zIndex={0}
            aria-hidden="true"
          />
          <Box position="relative" zIndex={1}>
            <KammaraEvents
              title={locale === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
              kicker={sectionName}
              categories={kammaraEventsData.categories}
              events={publishedEvents}
              locale={locale}
              color={kammaraPalette.colors[0]}
              darkColor={kammaraPalette.dark}
            />
          </Box>
        </Box>
        )}

        {/* ── PRÓXIMOS PLANETAS — heatmap de progresso ───────────────── */}
        {/* Só aparece enquanto houver planeta em construção (<100). Quando
            todos chegam a 100, a seção some da interface por completo. */}
        {kammaraInProgress().length > 0 && (
          <Box
            width="100%"
            mt="calc(var(--chakra-spacing-3xl) + 60px)"
            mb="calc(var(--chakra-spacing-3xl) + 60px)"
            px={{ base: '25px', md: '2rem', xl: '3rem' }}
          >
            <KammaraProgressHeatmap
              title={locale === 'en' ? 'Upcoming Worlds' : 'Próximos Planetas'}
              subline={sectionName}
              categories={kammaraProgressData.categories}
              planets={kammaraInProgress()}
              locale={locale}
              color={kammaraPalette.colors[0]}
              darkColor={kammaraPalette.dark}
            />
          </Box>
        )}
      </CreatureSection>

      {/* ── LIVROS — aba própria, exclusiva (não fica embaixo da intro) ── */}
      {kammaraBooks.length > 0 && (() => {
        const booksTitle = safeT('booksTitle', 'Livros');
        return (
          <CreatureSection
            id="livros"
            gradient={kammaraPalette.gradient}
            accentColor={kammaraPalette.colors[4]}
            bgImage={kammaraBg ?? undefined}
            hidden={booksHidden}
          >
            <KammaraPlanetTitle
              name={booksTitle}
              palette="kammara"
              category={sectionName}
              declarer="universe"
              crestGlyph={worldCrestGlyph('kammara')}
              description={safeT('booksDesc', '')}
            />
            <Box my="3xl" px={{ base: '1.5rem', md: 0 }}>
              <BookShelf
                title={booksTitle}
                arrowColor={kammaraPalette.colors[0]}
                comingSoonLabel={tCommon('soon')}
                books={kammaraBooks.map((b) => ({
                  book: {
                    id: `kammara-${b.id}`,
                    image: b.cover,
                    alt: b.title,
                    label: b.title,
                    // "Em breve" sempre que ainda não há link de compra
                    // — mesmo que já existam páginas pra ler.
                    soon: !b.buy,
                    buy: b.buy,
                  },
                  borderColor: kammaraPalette.colors[0],
                  textColor: kammaraPalette.text,
                  onRead: (bookId) => handleBookClick(bookId.replace(/^kammara-/, '')),
                }))}
              />
            </Box>
          </CreatureSection>
        );
      })()}

      {/* ── WORLDS ─────────────────────────────────────────────────────── */}
      {/* Only the active world is rendered — inactive worlds are fully
          unmounted (not just hidden), so their images/videos leave the DOM
          and stop downloading. This is the core of the performance fix. */}
      {perWorldProps.map((props) =>
        !props.mount ? null : (
        <Fragment key={props.w.id}>
          <WorldSection
            {...props}
            hidden={false}
            words={words}
            locale={locale}
            tCommon={tCommon}
            charactersTitle={charactersTitle}
            scenesTitle={scenesTitle}
            subsystemsTitle={subsystemsTitle}
            placeholder={placeholder}
          />
          {/* TripleC sub-regions — each region is its own CreatureSection */}
          {props.w.id === 'triplec' &&
            props.w.regions &&
            TRIPLEC_REGION_IDS.map((regionId) => {
              const region = props.w.regions?.[regionId];
              if (!region) return null;
              return (
                <TriplecRegionSection
                  key={regionId}
                  regionId={regionId}
                  region={region}
                  hidden={false}
                  words={words}
                  locale={locale}
                  tCommon={tCommon}
                  scenesTitle={scenesTitle}
                  subsystemsTitle={subsystemsTitle}
                  charactersTitle={charactersTitle}
                />
              );
            })}
        </Fragment>
        ),
      )}
    </>
  );
}

// ============================================================================
// ═══ WorldSection ═══
// Renders a single kammara world as a CreatureSection with its banner,
// optional scenes and subsystems. Matches exactly the behavior the main
// component had inline before the refactor — no visual changes.
// ============================================================================

interface WorldSectionProps {
  w: WorldData;
  palette: Palette;
  colors: WorldColors;
  name: string;
  bodyText: string[];
  panelStory: string[];
  subsystems: { title: string; text: string[]; img: string }[];
  hidden: boolean;
  words: Record<string, string>;
  locale: Locale;
  tCommon: ReturnType<typeof useTranslations>;
  charactersTitle: string;
  scenesTitle: string;
  subsystemsTitle: string;
  placeholder: string;
}

function WorldSection({
  w,
  palette,
  colors,
  name,
  bodyText,
  panelStory,
  subsystems,
  hidden,
  words,
  locale,
  tCommon,
  charactersTitle,
  scenesTitle,
  subsystemsTitle,
  placeholder,
}: WorldSectionProps) {
  const realSubsystems = subsystems.filter(hasRealContent);


  return (
    <CreatureSection
      id={w.id}
      gradient={palette.gradientBg}
      accentColor={colors.accent}
      bgImage={w.bgImage ?? undefined}
      hidden={hidden}
    >
      <KammaraPlanetTitle
        name={name}
        palette={w.id}
        category="Planeta"
        declarer="planet"
        crestGlyph={worldCrestGlyph(w.id)}
        description={
          bodyText.length > 0 ? (
            <>
              {bodyText.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </>
          ) : (
            placeholder
          )
        }
      />
      {/* Wrapper trims the DSMainCard's legacy `mt: 8rem` on mobile so
          the new KammaraPlanetTitle + KammaraCard sit close together
          with no empty gap in between. Desktop keeps the default. */}
      <Box mt={{ base: '-6rem', md: 0 }}>
      <DSMainCard
        characters={[]}
        gradient={palette.gradient}
        height="1400px"
        maxHeight="80vh"
        titleColor={colors.title}
        textColor={colors.text}
      >
        {/* Painel de texto (KammaraCard com nome+story) removido do Card do
            planeta — reduz volume. Sem `stripSide`, a cena abaixo ocupa a
            largura toda em vez de ficar presa à direita. */}
        {/* Cena do planeta: KammaraSceneCollage, agora full-width. */}
        {w.scenes.length > 0 && (
          <KammaraSceneCollage
            scenes={w.scenes}
            color={palette.colors[0]}
            darkColor={palette.dark}
            modalTextColor={palette.text}
            crestGlyph={worldCrestGlyph(w.id)}
            modalBg={palette.gradientBg}
            modalTitle={name}
            modalSubtitle={bodyText[0] || ''}
          />
        )}
      </DSMainCard>
      </Box>
      {/* ── Drops strip — posicionado ACIMA dos personagens (todas as
          resoluções). TripleC força verde no accent geral, mas o drops usa
          a cor real do mundo (palette[0]) — roxo pro TripleC. */}
      {w.drops.length > 0 && (
        <Box
          display="block"
          width="100%"
          my={{ base: '2xl', lg: '5xl' }}
          px={{ base: '25px', md: '2rem', xl: '3rem' }}
        >
          <KammaraDropsStrip
            sectionTitle={`Drops · ${name}`}
            worldName={name}
            crestGlyph={worldCrestGlyph(w.id)}
            color={palette.colors[0]}
            borderColor={palette.border}
            titleColor={palette.charactersTitleColor}
            darkColor={palette.dark}
            modalSubtitle={bodyText[0] || ''}
            modalTextColor={palette.text}
            drops={w.drops}
          />
        </Box>
      )}
      {/* ── Character gallery — full-width section with KammaraCharacterCard */}
      {(() => {
        const worldColor = palette.colors[0];
        const worldBorder = palette.border;
        const worldCharsTitle = palette.charactersTitleColor;
        const worldDark = palette.dark;
        const worldCrest = worldCrestGlyph(w.id);
        const contextId = `kammara/${w.id}`;
        const characterData = getCharactersForContext(contextId);
        // Kammara characters are driven by the JSON (single source of truth).
        // Manifest images are a fallback for legacy entries without `image`.
        // Filtra `visible: false` AQUI (servidor), antes de montar o payload:
        // personagem escondido não entra no HTML, então não vaza.
        const galleryItems = characterData
          .filter((char) => char.visible !== false)
          .map((char) => {
            const manifestMatch = w.chars.find(
              (c) => c.name.toLowerCase().trim() === char.match.toLowerCase().trim(),
            );
            const image = char.image ?? manifestMatch?.image;
            if (!image) return null;
            return {
              name: getCharLocalizedName(char, locale),
              species: getLocalizedSpecies(char, locale),
              bio: getLocalizedBio(char, locale),
              image,
              backImage: char.backImage,
              backTitle: char.backTitle?.[locale],
              dorsalMeaning: char.dorsalMeaning?.[locale],
              backMeaning: char.backMeaning?.[locale],
              attributes: char.attributes?.map((a) => ({
                glyph: a.glyph,
                label: a.label[locale],
                value: a.value[locale],
              })),
              fairyDust: char.fairyDust,
              fairyDustBack: char.fairyDustBack,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (galleryItems.length === 0) return null;
        return (
          <Box width="100%" my={{ base: '2xl', lg: '5xl' }} px={{ base: "25px", md: "2rem", xl: "3rem" }}>
            <KammaraCharacterGallery
              title={`${charactersTitle} · ${name}`}
              worldCrestGlyph={worldCrest}
              color={worldColor}
              borderColor={worldBorder}
              titleColor={worldCharsTitle}
              darkColor={worldDark}
              items={galleryItems}
              minCardWidth={320}
              minCardWidthMd={316}
              minCardWidthLg={360}
              renderCard={(char) => (
                <Box height={{ base: '460px', md: '600px' }}>
                  <KammaraCharacterCard
                    name={char.name}
                    species={char.species}
                    bio={char.bio}
                    image={char.image}
                    backImage={char.backImage}
                    backTitle={char.backTitle}
                    dorsalMeaning={char.dorsalMeaning}
                    backMeaning={char.backMeaning}
                    attributes={char.attributes}
                    fairyDust={char.fairyDust}
                    fairyDustBack={char.fairyDustBack}
                    worldName={name}
                    worldCrestGlyph={worldCrest}
                    color={worldColor}
                    borderColor={worldBorder}
                    darkColor={worldDark}
                  />
                </Box>
              )}
            />
          </Box>
        );
      })()}
      {realSubsystems.length > 0 && (() => {
        const tabs = realSubsystems.map((s, i) => ({
          id: `${w.id}-${i}`,
          icon: subsystemGlyph(s.title),
          label: s.title,
          title: s.title,
          // Usa o `img` do próprio subsistema (não o array paralelo por índice)
          // pra o filtro de `visible` não desalinhar imagem × subsistema.
          image: s.img || undefined,
          imageAlt: s.title,
          content: renderStory(s.text, palette.colors[0]),
        }));
        return (
          <>
            {/* Vertical (mobile only, base → md). */}
            <Box
              display={{ base: 'block', md: 'none' }}
              width="100%"
              my={{ base: '2xl', lg: '5xl' }}
              px={{ base: '25px', md: '2rem', xl: '3rem' }}
            >
              <Box width="100%" height="627px">
                <KammaraCardSubsystem
                  name={name}
                  category={subsystemsTitle}
                  color={palette.colors[0]}
                  borderColor={palette.border}
                  darkColor={palette.dark}
                  crestGlyph={worldCrestGlyph(w.id)}
                  tabs={tabs}
                />
              </Box>
            </Box>
            {/* Horizontal — Variant C cinematic (md+). Full width with
                the same horizontal gutters as the rest of the page. */}
            <Box
              display={{ base: 'none', md: 'block' }}
              width="100%"
              my={{ base: '2xl', lg: '5xl' }}
              px={{ base: '25px', md: '2rem', xl: '3rem' }}
            >
              <KammaraCardSubsystemHorizontal
                variant="C"
                name={name}
                category={subsystemsTitle}
                color={palette.colors[0]}
                borderColor={palette.border}
                darkColor={palette.dark}
                crestGlyph={worldCrestGlyph(w.id)}
                tabs={tabs}
              />
            </Box>
          </>
        );
      })()}
    </CreatureSection>
  );
}

// ============================================================================
// ═══ TriplecRegionSection ═══
// Renders one of the TripleC sub-regions (malloc/mesh/sharp) as its own
// CreatureSection with a RegionDivider band, a RegionBanner and optional
// scenes/subsystems. All visuals come from the region's own palette entry.
// ============================================================================

interface TriplecRegionSectionProps {
  regionId: TriplecRegionId;
  region: RegionData;
  hidden: boolean;
  words: Record<string, string>;
  locale: Locale;
  tCommon: ReturnType<typeof useTranslations>;
  scenesTitle: string;
  subsystemsTitle: string;
  charactersTitle: string;
}

function TriplecRegionSection({
  regionId,
  region,
  hidden,
  words,
  locale,
  tCommon,
  scenesTitle,
  subsystemsTitle,
  charactersTitle,
}: TriplecRegionSectionProps) {
  const regionPalette = palettes[regionId];
  const regionColor = regionPalette.colors[0];
  const regionWorldId = `triplec-${regionId}`;

  const name = getWorldName(regionWorldId, locale) || regionId;
  const bodyText = getWorldSummary(regionWorldId, locale);
  const panelStory = getWorldPanelStory(regionWorldId, locale);
  const subsystems = getWorldSubsystems(regionWorldId, locale);
  const realSubsystems = subsystems.filter(hasRealContent);
  const contextId = `kammara/triplec/${regionId}`;

  return (
    <CreatureSection
      id={`triplec-${regionId}`}
      gradient={regionPalette.gradientBg}
      accentColor={regionColor}
      bgImage={region.bgImage ?? undefined}
      bgOpacity={regionId === 'sharp' ? 0.12 : 0.3}
      hidden={hidden}
    >
      <RegionDivider
        parent="TRIPLEC"
        name={name}
        crestGlyph={worldCrestGlyph(regionId)}
        color={regionColor}
        {...(regionId === 'sharp' ? { bgColor: regionPalette.dark } : {})}
        data-testid={`region-divider-${regionId}`}
      />
      <Box
        display={{ base: 'flex', md: 'contents' }}
        flexDirection="column"
        gap="2rem"
        css={{
          // Mobile: neutraliza os mt/mb internos dos 3 blocos para que
          // o único espaçamento vertical venha do `gap` deste Flex.
          // (Exceção B do AGENTS.md: seletor de descendente `& > *`.)
          '@media (max-width: 48em)': {
            '& > *': { marginTop: 0, marginBottom: 0 },
          },
        }}
      >
      <RegionBanner
        name={name}
        color={regionColor}
        gradient={regionPalette.gradient}
        data-testid={`region-banner-${regionId}`}
        story={renderStory(panelStory, regionPalette.colors[0])}
        renderPanel={({ name: regionName, color: regionPanelColor, story }) => (
          <KammaraCardRegion
            name={regionName}
            category="Região"
            parentName="TripleC"
            parentCrestGlyph={worldCrestGlyph('triplec')}
            color={regionPanelColor}
            darkColor={regionPalette.dark}
            {...(regionId === 'sharp' ? { headerBg: regionPalette.dark } : {})}
            crestGlyph={worldCrestGlyph(regionId)}
            tabs={[
              {
                id: `${regionId}-story`,
                icon: worldCrestGlyph(regionId),
                label: regionName,
                title: regionName,
                content: story,
              },
            ]}
          />
        )}
      >
        {region.scenes.length > 0 && (
          <SceneStrip
            scenes={region.scenes}
            arrowColor={regionColor}
            accentColor={regionColor}
            darkColor={regionPalette.dark}
            crestGlyph={worldCrestGlyph(regionId)}
            modalBg={regionPalette.gradientBg}
            modalTitle={name}
            modalSubtitle={bodyText[0] || ''}
            titleMarginTop="1.5em"
            hideLabel
            variant="region"
          />
        )}
      </RegionBanner>
      {/* ── Drops strip — acima dos personagens (mesma ordem do WorldSection). */}
      {region.drops.length > 0 && (
        <Box
          display="block"
          width="100%"
          my={{ base: '2xl', lg: '5xl' }}
          px={{ base: '25px', md: '2rem', xl: '3rem' }}
        >
          <KammaraDropsStrip
            sectionTitle={`Drops · ${name}`}
            worldName={name}
            crestGlyph={worldCrestGlyph(regionId)}
            color={regionColor}
            darkColor={regionPalette.dark}
            modalSubtitle={bodyText[0] || ''}
            modalTextColor={regionPalette.text}
            drops={region.drops}
          />
        </Box>
      )}
      {/* ── Character gallery for the region ─────────── */}
      {(() => {
        const characterData = getCharactersForContext(contextId);
        const galleryItems = characterData
          .filter((char) => char.visible !== false)
          .map((char) => {
            const manifestMatch = region.chars.find(
              (c) => c.name.toLowerCase().trim() === char.match.toLowerCase().trim(),
            );
            const image = char.image ?? manifestMatch?.image;
            if (!image) return null;
            return {
              name: getCharLocalizedName(char, locale),
              species: getLocalizedSpecies(char, locale),
              bio: getLocalizedBio(char, locale),
              image,
              backImage: char.backImage,
              backTitle: char.backTitle?.[locale],
              dorsalMeaning: char.dorsalMeaning?.[locale],
              backMeaning: char.backMeaning?.[locale],
              attributes: char.attributes?.map((a) => ({
                glyph: a.glyph,
                label: a.label[locale],
                value: a.value[locale],
              })),
              fairyDust: char.fairyDust,
              fairyDustBack: char.fairyDustBack,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (galleryItems.length === 0) return null;
        return (
          <Box width="100%" px={{ base: "25px", md: "2rem", xl: "3rem" }}>
            <KammaraCharacterGallery
              title={`${charactersTitle} · ${name}`}
              worldCrestGlyph={worldCrestGlyph(regionId)}
              color={regionPalette.colors[0]}
              darkColor={regionPalette.dark}
              items={galleryItems}
              minCardWidth={320}
              minCardWidthMd={316}
              minCardWidthLg={360}
              variant="region"
              renderCard={(char) => (
                <Box height={{ base: '460px', md: '600px' }}>
                  <KammaraCharacterCard
                    name={char.name}
                    species={char.species}
                    bio={char.bio}
                    image={char.image}
                    backImage={char.backImage}
                    backTitle={char.backTitle}
                    dorsalMeaning={char.dorsalMeaning}
                    backMeaning={char.backMeaning}
                    attributes={char.attributes}
                    fairyDust={char.fairyDust}
                    fairyDustBack={char.fairyDustBack}
                    worldName={name}
                    worldCrestGlyph={worldCrestGlyph(regionId)}
                    color={regionPalette.colors[0]}
                    darkColor={regionPalette.dark}
                  />
                </Box>
              )}
            />
          </Box>
        );
      })()}
      {realSubsystems.length > 0 && (() => {
        const tabs = realSubsystems.map((s, i) => ({
          id: `${regionId}-${i}`,
          icon: subsystemGlyph(s.title),
          label: s.title,
          title: s.title,
          image: s.img || undefined,
          imageAlt: s.title,
          content: renderStory(s.text, regionPalette.colors[0]),
        }));
        return (
          <>
            {/* Vertical (mobile only, base → md). */}
            <Box
              display={{ base: 'block', md: 'none' }}
              width="100%"
              pt="3rem"
              px={{ base: '2rem', md: '2rem', xl: '3rem' }}
            >
              <Box width="100%" height="627px">
                <KammaraCardSubsystem
                  name={name}
                  category={subsystemsTitle}
                  color={regionPalette.colors[0]}
                  darkColor={regionPalette.dark}
                  crestGlyph={worldCrestGlyph(regionId)}
                  tabs={tabs}
                  variant="region"
                />
              </Box>
            </Box>
            {/* Horizontal — Variant C cinematic (md+). */}
            <Box
              display={{ base: 'none', md: 'block' }}
              width="100%"
              my={{ base: '2xl', lg: '5xl' }}
              px={{ base: '25px', md: '2rem', xl: '3rem' }}
            >
              <KammaraCardSubsystemHorizontal
                variant="C"
                borderStyle="region"
                name={name}
                category={subsystemsTitle}
                color={regionPalette.colors[0]}
                darkColor={regionPalette.dark}
                crestGlyph={worldCrestGlyph(regionId)}
                tabs={tabs}
              />
            </Box>
          </>
        );
      })()}
      </Box>
    </CreatureSection>
  );
}

// ============================================================================
// ═══ KammaraHeroStars ═══
// Decorative starfield + glow orb rendered inside the Kammara hero section.
// Extracted from inline JSX so the main component stays readable — all the
// box-shadow-heavy star positions live here.
// ============================================================================

function KammaraHeroStars() {
  return (
    <Box
      aria-hidden
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      css={{
        '& > span': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          background: 'transparent',
          animation: 'twinkleField 6s ease-in-out infinite',
        },
        '& > span:nth-of-type(1)': {
          boxShadow:
            '25px 15px #fff, 80px 40px #fff, 150px 20px rgba(255,255,255,0.8), 200px 60px #fff, 320px 30px rgba(255,255,255,0.6), 400px 80px #fff, 50px 90px rgba(255,255,255,0.5), 180px 110px #fff, 280px 95px rgba(255,255,255,0.7), 350px 120px #fff, 450px 50px rgba(255,255,255,0.4), 500px 100px #fff, 30px 140px rgba(255,255,255,0.6), 120px 160px #fff, 250px 150px rgba(255,255,255,0.5), 380px 170px #fff, 480px 140px rgba(255,255,255,0.8), 550px 160px #fff, 70px 200px #fff, 160px 220px rgba(255,255,255,0.6), 300px 210px #fff, 420px 230px rgba(255,255,255,0.7), 520px 200px #fff, 600px 220px rgba(255,255,255,0.5), 90px 250px rgba(255,255,255,0.4), 210px 270px #fff, 340px 260px rgba(255,255,255,0.8), 460px 280px #fff, 580px 250px rgba(255,255,255,0.6), 650px 270px #fff, 40px 300px #fff, 130px 320px rgba(255,255,255,0.5), 270px 310px #fff, 390px 330px rgba(255,255,255,0.7), 510px 300px #fff, 630px 320px rgba(255,255,255,0.4), 700px 50px rgba(255,255,255,0.6), 750px 120px #fff, 800px 200px rgba(255,255,255,0.5), 850px 80px #fff, 900px 160px rgba(255,255,255,0.7), 950px 240px #fff, 720px 300px rgba(255,255,255,0.4), 780px 30px #fff, 830px 280px rgba(255,255,255,0.6)',
        },
        '& > span:nth-of-type(2)': {
          animationDelay: '-3s',
          boxShadow:
            '60px 35px rgba(255,255,255,0.5), 140px 70px #fff, 230px 45px rgba(255,255,255,0.7), 310px 85px #fff, 410px 55px rgba(255,255,255,0.4), 490px 75px #fff, 100px 130px rgba(255,255,255,0.6), 190px 145px #fff, 290px 125px rgba(255,255,255,0.8), 370px 155px #fff, 460px 135px rgba(255,255,255,0.5), 540px 150px #fff, 75px 190px #fff, 170px 205px rgba(255,255,255,0.7), 260px 195px #fff, 360px 215px rgba(255,255,255,0.4), 440px 190px #fff, 530px 210px rgba(255,255,255,0.6), 110px 260px rgba(255,255,255,0.5), 200px 275px #fff, 330px 265px rgba(255,255,255,0.8), 430px 285px #fff, 520px 260px rgba(255,255,255,0.6), 610px 280px #fff, 680px 100px rgba(255,255,255,0.5), 740px 180px #fff, 810px 130px rgba(255,255,255,0.7), 870px 220px #fff, 930px 100px rgba(255,255,255,0.4), 760px 260px #fff',
        },
        // Glow orb
        '& > span:nth-of-type(3)': {
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,80,200,0.15) 0%, transparent 70%)',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'glowPulse 8s ease-in-out infinite',
          filter: 'blur(20px)',
          boxShadow: 'none',
        },
        '@keyframes twinkleField': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        '@keyframes glowPulse': {
          '0%, 100%': { transform: 'translateX(-50%) scale(1)', opacity: 0.5 },
          '50%': { transform: 'translateX(-50%) scale(1.3)', opacity: 0.8 },
        },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
}
