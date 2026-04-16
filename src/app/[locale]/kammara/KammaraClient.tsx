'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslations, useLocale } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { CreatureSection } from '@/components/CreatureSection';
import { KammaraPlanetTitle } from '@/components/KammaraPlanetTitle';
import { KammaraCard } from '@/components/KammaraCard';
import { DSMainCard } from '@/components/DSMainCard';
import { CharacterStrip } from '@/components/CharacterStrip';
import { SceneStrip } from '@/components/SceneStrip';
import { KammaraCardSubsystem, KammaraCardSubsystemContainer } from '@/components/KammaraCardSubsystem';
import { RegionDivider } from '@/components/RegionDivider';
import { RegionBanner } from '@/components/RegionBanner';
import { SoonPanel } from '@/components/SoonPanel';
import { BookGallery } from '@/components/BookGallery';
import { useModal } from '@/components/Modal';
import { palettes, type PaletteName, type Palette } from '@/theme/palettes';
import { kammaraHero, kammaraFilter } from '@/theme/creatures';
import { subsystemGlyph, worldCrestGlyph } from '@/theme/kalunGlyphs';
import { translateName } from '@/lib/translateName';
import { KammaraStarField } from './KammaraStarField';

// ============================================================================
// Types & constants
// ============================================================================

type WorldId = 'lunnp1' | 'eni4' | 'triplec' | 'orfv' | 'z1' | 'gotto';
type TriplecRegionId = 'malloc' | 'mesh' | 'sharp';
type Locale = 'pt' | 'en';

const TRIPLEC_REGION_IDS = ['malloc', 'mesh', 'sharp'] as const;

interface RegionData {
  id: TriplecRegionId;
  chars: { name: string; image: string }[];
  scenes: { name: string; image: string }[];
  bgImage: string | null;
  subsystemImages: (string | null)[];
}

interface WorldData {
  id: WorldId;
  chars: { name: string; image: string }[];
  scenes: { name: string; image: string }[];
  bgImage: string | null;
  subsystemImages: (string | null)[];
  /** Sub-regions inside a world. Only triplec currently uses this. */
  regions?: Partial<Record<TriplecRegionId, RegionData>>;
}

interface KammaraBook {
  id: string;
  cover: string | null;
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
  gotto: { name: 0, text: 2, title: 1, label: 5 },
};

/** Per-world bgOpacity override. orfv is dimmer; others default. */
const WORLD_BG_OPACITY: Partial<Record<WorldId, number>> = {
  orfv: 0.4,
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
function renderStory(story: string[]) {
  return story.map((p, i) =>
    p.startsWith('### ') ? (
      <h3 key={i}>{p.slice(4)}</h3>
    ) : p.startsWith('## ') ? (
      <h2 key={i}>{p.slice(3)}</h2>
    ) : (
      <p key={i}>{p}</p>
    )
  );
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
  const [activeFilter, setActiveFilter] = useState('all');
  const { registerGallery, openGallery } = useModal();

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
  const bookDefs = safeTRaw<{ tag: string; title: string }[] | undefined>(
    'section.books',
    undefined
  );

  // ── Modal gallery registration for kammara books ──────────────────────
  const bookGalleries = useMemo(() => {
    const out: Record<string, { title: string; pages: string[] }> = {};
    for (const book of kammaraBooks) {
      if (book.pages.length === 0) continue;
      const def = bookDefs?.find((d) => d.tag === book.id);
      out[`book_kammara-${book.id}`] = {
        title: def?.title ?? book.id,
        pages: book.pages,
      };
    }
    return out;
  }, [kammaraBooks, bookDefs]);

  useEffect(() => {
    for (const [id, g] of Object.entries(bookGalleries)) {
      registerGallery(id, g.pages);
    }
  }, [bookGalleries, registerGallery]);

  const handleBookClick = (rawBookId: string) => {
    const galleryId = `book_kammara-${rawBookId.replace(/^kammara-/, '')}`;
    const g = bookGalleries[galleryId];
    if (!g) return;
    openGallery(galleryId, 0, g.title, '');
  };

  // ── Filter bar ────────────────────────────────────────────────────────
  const filters = [
    { id: 'kammara', label: sectionName, color: kammaraFilter.color, bgColor: kammaraFilter.bgColor },
    ...worlds.map((w) => ({
      id: w.id,
      label: WORLD_NAMES[w.id],
      color: palettes[w.id as PaletteName].colors[0],
      bgColor: palettes[w.id as PaletteName].dark,
    })),
  ];

  const kammaraPalette = palettes.kammara;
  const kammaraHidden = activeFilter !== 'all' && activeFilter !== 'kammara';

  // ── Per-world content ──────────────────────────────────────────────────
  // Everything a WorldSection needs is shared here so the sub-component
  // stays small and easy to read below.
  const perWorldProps = worlds.map((w) => ({
    w,
    palette: palettes[w.id as PaletteName],
    colors: getWorldColors(w, palettes[w.id as PaletteName]),
    name: safeT(`worlds.${w.id}.name`, WORLD_NAMES[w.id]),
    bodyText: safeTRaw<string[]>(`worlds.${w.id}.text`, []),
    panelStory: safeTRaw<string[]>(`worlds.${w.id}.panel.story`, []),
    subsystems: safeTRaw<{ title: string; text: string[] }[]>(`worlds.${w.id}.subsystems`, []),
    hidden: activeFilter !== 'all' && activeFilter !== w.id,
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
        allLabel={locale === 'en' ? 'All' : 'Todos'}
        onFilter={setActiveFilter}
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
          description={
            <>
              {sectionText.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </>
          }
        />
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
          text={renderStory(sectionStory)}
        >
          {kammaraChars.length > 0 ? (
            <CharacterStrip
              characters={kammaraChars.map((c) => ({
                ...c,
                name: translateName(c.name, words),
              }))}
              gradient={kammaraPalette.gradient}
              cardSize={200}
              noFloat
              transparent
              speed={120}
              inStripSide
              contextId="kammara/kammara"
              locale={locale}
            />
          ) : (
            <SoonPanel label={tCommon('soon')} />
          )}
        </DSMainCard>
        {kammaraBooks.length > 0 && (
          <BookGallery
            title={t('booksTitle')}
            books={kammaraBooks.map((b) => {
              const def = bookDefs?.find((d) => d.tag === b.id);
              return {
                id: `kammara-${b.id}`,
                image: b.cover ?? undefined,
                alt: def?.title ?? b.id,
                label: def?.title ?? b.id,
                soon: b.pages.length === 0,
              };
            })}
            soonLabel={tCommon('soon')}
            onBookClick={handleBookClick}
            tone="overlay"
          />
        )}
      </CreatureSection>

      {/* ── WORLDS ─────────────────────────────────────────────────────── */}
      {perWorldProps.map((props) => (
        <Fragment key={props.w.id}>
          <WorldSection
            {...props}
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
                  hidden={props.hidden}
                  words={words}
                  locale={locale}
                  tCommon={tCommon}
                  scenesTitle={scenesTitle}
                  subsystemsTitle={subsystemsTitle}
                  safeT={safeT}
                  safeTRaw={safeTRaw}
                />
              );
            })}
        </Fragment>
      ))}
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
  subsystems: { title: string; text: string[] }[];
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
      <DSMainCard
        characters={[]}
        gradient={palette.gradient}
        height="1400px"
        maxHeight="80vh"
        titleColor={colors.title}
        textColor={colors.text}
        stripSide
        bgOpacity={WORLD_BG_OPACITY[w.id] ?? (w.bgImage ? 0.6 : 1)}
        textPanelTitle={name}
        text={renderStory(panelStory)}
        renderPanel={({ text: panelText }) => (
          <KammaraCard
            name={name}
            category="Planeta"
            color={palette.colors[0]}
            darkColor={palette.dark}
            crestGlyph={worldCrestGlyph(w.id)}
            tabs={[
              {
                id: `${w.id}-story`,
                icon: '⊙',
                label: name,
                title: name,
                content: panelText,
              },
            ]}
          />
        )}
      >
        {/* Side column inside the banner: CharacterStrip on top,
            SceneStrip below. Both share the column height 50/50
            via the `& > *` flex rule in DSMainCard's stripSide slot. */}
        {w.chars.length > 0 ? (
          <CharacterStrip
            characters={w.chars.map((c) => ({
              ...c,
              name: translateName(c.name, words),
            }))}
            gradient={palette.gradient}
            cardSize={200}
            noFloat
            transparent
            labelColor={colors.titleDestaque}
            arrowColor={colors.titleDestaque}
            mobileColor={colors.title}
            sectionTitle={charactersTitle}
            speed={100}
            inStripSide
            contextId={`kammara/${w.id}`}
            locale={locale}
          />
        ) : (
          <SoonPanel label={tCommon('soon')} color={palette.colors[0]} />
        )}
        {w.scenes.length > 0 && (
          <SceneStrip
            scenes={w.scenes.map((s) => ({
              ...s,
              name: translateName(s.name, words),
            }))}
            sectionTitle={scenesTitle}
            arrowColor={colors.titleDestaque}
            labelColor={colors.titleDestaque}
            accentColor={colors.titleDestaque}
            mobileColor={colors.title}
            modalBg={palette.gradientBg}
            modalTitle={name}
            modalSubtitle={bodyText[0] || ''}
            titleMarginTop="0"
          />
        )}
      </DSMainCard>
      {realSubsystems.length > 0 && (
        <Box
          width={{ base: '418px', md: '440px' }}
          height={{ base: '627px', md: '660px' }}
          mx="auto"
          my="2xl"
          padding="1.5rem"
          display="flex"
        >
          <KammaraCardSubsystem
            name={name}
            category={subsystemsTitle}
            color={palette.colors[0]}
            darkColor={palette.dark}
            crestGlyph={worldCrestGlyph(w.id)}
            tabs={realSubsystems.map((s, i) => ({
              id: `${w.id}-${i}`,
              icon: subsystemGlyph(s.title),
              label: s.title,
              title: s.title,
              image: w.subsystemImages[i] ?? undefined,
              imageAlt: s.title,
              content: renderStory(s.text),
            }))}
          />
        </Box>
      )}
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
  safeT: (key: string, fallback?: string) => string;
  safeTRaw: <T>(key: string, fallback: T) => T;
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
  safeT,
  safeTRaw,
}: TriplecRegionSectionProps) {
  const regionPalette = palettes[regionId];
  const regionColor = regionPalette.colors[0];
  const keyPrefix = `worlds.triplec.regions.${regionId}`;

  const name = safeT(`${keyPrefix}.name`, regionId);
  const tagline = safeT(`${keyPrefix}.tagline`);
  const bodyText = safeTRaw<string[]>(`${keyPrefix}.text`, []);
  const panelStory = safeTRaw<string[]>(`${keyPrefix}.panel.story`, []);
  const subsystems = safeTRaw<{ title: string; text: string[] }[]>(
    `${keyPrefix}.subsystems`,
    []
  );
  const realSubsystems = subsystems.filter(hasRealContent);
  const contextId = `kammara/triplec/${regionId}`;

  return (
    <CreatureSection
      id={`triplec-${regionId}`}
      gradient={regionPalette.gradientBg}
      accentColor={regionColor}
      bgImage={region.bgImage ?? undefined}
      hidden={hidden}
    >
      <RegionDivider
        parent="TRIPLEC"
        name={name}
        tagline={tagline}
        color={regionColor}
        data-testid={`region-divider-${regionId}`}
      />
      <RegionBanner
        name={name}
        color={regionColor}
        gradient={regionPalette.gradient}
        characters={region.chars.map((c) => ({
          ...c,
          name: translateName(c.name, words),
        }))}
        contextId={contextId}
        locale={locale}
        soonLabel={tCommon('soon')}
        data-testid={`region-banner-${regionId}`}
        story={renderStory(panelStory)}
      />
      {region.scenes.length > 0 && (
        <SceneStrip
          scenes={region.scenes.map((s) => ({
            ...s,
            name: translateName(s.name, words),
          }))}
          sectionTitle={scenesTitle}
          arrowColor={regionColor}
          labelColor={regionColor}
          accentColor={regionColor}
          modalBg={regionPalette.gradientBg}
          modalTitle={name}
          modalSubtitle={bodyText[0] || ''}
          titleMarginTop="1.5em"
        />
      )}
      {realSubsystems.length > 0 && (
        <Box
          width={{ base: '418px', md: '440px' }}
          height={{ base: '627px', md: '660px' }}
          mx="auto"
          mt="-40px"
          mb="2xl"
          padding="1.5rem"
          display="flex"
        >
          <KammaraCardSubsystem
            name={name}
            category={subsystemsTitle}
            color={regionPalette.colors[0]}
            darkColor={regionPalette.dark}
            crestGlyph={worldCrestGlyph(regionId)}
            tabs={realSubsystems.map((s, i) => ({
              id: `${regionId}-${i}`,
              icon: subsystemGlyph(s.title),
              label: s.title,
              title: s.title,
              image: region.subsystemImages[i] ?? undefined,
              imageAlt: s.title,
              content: renderStory(s.text),
            }))}
          />
        </Box>
      )}
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
