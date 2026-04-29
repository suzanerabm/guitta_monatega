'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export interface ProgressCategory {
  id: string;
  label: { pt: string; en: string };
}

export interface ProgressPlanet {
  id: string;
  name: { pt: string; en: string };
  progress: Record<string, number>;
}

export interface KammaraProgressHeatmapProps {
  /** Section title kicker (uppercase, small). */
  kicker?: string;
  /** Main heading. */
  title: string;
  /** Subline below the title (e.g. "Kammara"). */
  subline?: string;
  /** Background image, full-bleed inside the card. Optional. */
  backgroundImage?: string;
  /** Crest glyph displayed as the giant watermark behind the title. */
  crestGlyph?: string;
  /** Categories shown as the heatmap columns. */
  categories: ProgressCategory[];
  /** One row per planet. */
  planets: ProgressPlanet[];
  /** Active locale for label/name translation. */
  locale: 'pt' | 'en';
  /** Section accent color (passed in so the page can keep all colour wiring central). */
  color: string;
  /** Section dark colour, for darken layers + glow. */
  darkColor: string;
  'data-testid'?: string;
}

const CARD_PADDING_X = '1.8rem';

/**
 * KammaraProgressHeatmap — "Próximos Planetas" section.
 *
 * Visual DNA borrowed from KammaraCardSubsystemHorizontal Variant C
 * (full-bleed cinematic background, crest watermark, kalún ornaments,
 * floating top-left title, footer with `⊹ ⊙ ⊹`). The body, however,
 * isn't a tab panel — it's a heatmap grid where rows are planets and
 * columns are work categories, each cell tinted from `darkColor` to
 * `color` based on the planet/category percentage in `planets[].progress`.
 *
 * Data is fully driven by `categories` + `planets` props (typically read
 * from `src/data/kammara_progress.json`). No content is hardcoded.
 */
export function KammaraProgressHeatmap({
  kicker,
  title,
  subline,
  backgroundImage,
  crestGlyph = '⊙',
  categories,
  planets,
  locale,
  color,
  darkColor,
  'data-testid': testId,
}: KammaraProgressHeatmapProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-progress-heatmap'}
      aria-label={title}
      position="relative"
      width="100%"
      marginBottom="10px"
      borderRadius="32px"
      overflow="visible"
    >
      <Box
        position="relative"
        width="100%"
        minH={{ base: '560px', md: '520px', xl: '560px' }}
        borderRadius="32px"
        overflow="hidden"
        css={{
          border: `1px solid ${color}40`,
          outline: `2px solid ${color}`,
          outlineOffset: '6px',
          boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {/* Darken layers — same recipe as Variant C, keep the heatmap
            legible no matter how bright the bg image is. */}
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{
            background: `linear-gradient(90deg, ${darkColor}80 0%, ${darkColor}66 45%, ${darkColor}40 75%, ${darkColor}33 100%)`,
          }}
        />
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{
            background: `linear-gradient(180deg, ${darkColor}66 0%, transparent 35%, transparent 60%, ${darkColor}66 100%)`,
          }}
        />

        {/* Giant crest watermark behind the title block. */}
        <Box
          position="absolute"
          top="1rem"
          left="-2rem"
          aria-hidden="true"
          pointerEvents="none"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '12rem',
            lineHeight: 1,
            color: `${color}14`,
            userSelect: 'none',
            textShadow: `0 0 24px ${darkColor}`,
          }}
        >
          {crestGlyph}
        </Box>

        {/* Title block — top-left, floating over the image. */}
        <Flex
          position="absolute"
          top={{ base: '2rem', md: '2.4rem' }}
          left={{ base: '1.2rem', md: CARD_PADDING_X }}
          direction="column"
          align="flex-start"
          gap="xs"
          maxW={{ base: 'calc(100% - 2.4rem)', md: '52%' }}
          zIndex={3}
        >
          {kicker && (
            <Text
              fontSize="xs"
              letterSpacing="hero"
              textTransform="uppercase"
              fontWeight="bold"
              color={color}
              m={0}
              opacity={0.9}
              css={{ textShadow: `0 2px 8px ${darkColor}` }}
            >
              {kicker}
            </Text>
          )}
          <Heading
            as="h2"
            fontFamily="body"
            fontSize={{ base: '1.6rem', md: '2.2rem', xl: '2.6rem' }}
            fontWeight="bold"
            lineHeight={1}
            color={color}
            letterSpacing="heroTitle"
            m={0}
            css={{
              textShadow: `0 0 28px ${darkColor}, 0 0 12px ${color}40`,
              textWrap: 'balance',
            }}
          >
            {title.toUpperCase()}
          </Heading>
          {subline && (
            <Text
              textStyle="label"
              color={color}
              m={0}
              opacity={0.95}
              css={{ textShadow: `0 2px 8px ${darkColor}` }}
            >
              {subline}
            </Text>
          )}
          <Text
            aria-hidden="true"
            color={color}
            fontFamily="glyph"
            letterSpacing="wider"
            fontSize="sm"
            opacity={0.8}
            m={0}
            mt="xs"
            css={{ textShadow: `0 2px 8px ${darkColor}` }}
          >
            — ⊙ —
          </Text>
        </Flex>

        {/* Heatmap grid — sits in the lower portion, leaving the title
            block breathing room above. */}
        <Box
          position="relative"
          zIndex={2}
          paddingX={{ base: '0.8rem', md: CARD_PADDING_X }}
          paddingTop={{ base: '12rem', md: '10rem', xl: '11rem' }}
          paddingBottom={{ base: '4rem', md: '3.5rem' }}
        >
          <HeatmapGrid
            categories={categories}
            planets={planets}
            locale={locale}
            color={color}
            darkColor={darkColor}
          />
        </Box>

        {/* Footer ornaments — same pattern as Variant C. */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          justify="space-between"
          align="center"
          padding="0.4rem 1.5rem"
          zIndex={3}
          css={{
            borderTop: `1px solid ${color}25`,
            background: `linear-gradient(0deg, ${color}10, transparent)`,
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '0.9rem',
            letterSpacing: '0.3em',
          }}
          color={`${color}cc`}
        >
          <span aria-label="Kammara">⊹ ⊙ ⊹</span>
          <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" m={0} color={`${color}cc`}>
            Kammara
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

interface HeatmapGridProps {
  categories: ProgressCategory[];
  planets: ProgressPlanet[];
  locale: 'pt' | 'en';
  color: string;
  darkColor: string;
}

function HeatmapGrid({
  categories,
  planets,
  locale,
  color,
  darkColor,
}: HeatmapGridProps) {
  const launchLabel = locale === 'en' ? 'Loading' : 'Carregando';
  // Extra column at the end is the aggregated "Launch" readiness —
  // sized noticeably wider than the category cells so it reads as the
  // visual anchor of each row.
  //
  // Mobile (base): tighter — name and launch shrink so the category
  // cells survive on a ~360-400px viewport; category headers rotate
  // -60° to fit vertically without truncation.
  // Desktop (md+): comfortable spacing with horizontal labels.
  const gridTemplateColumns = {
    base: `minmax(4rem, 5.5rem) repeat(${categories.length}, minmax(0, 1fr)) minmax(4.5rem, 6rem)`,
    md: `minmax(7rem, 12rem) repeat(${categories.length}, minmax(0, 1fr)) minmax(7.2rem, 10.8rem)`,
  };

  return (
    <Box
      role="table"
      aria-label="planet progress heatmap"
      display="grid"
      gridTemplateColumns={gridTemplateColumns}
      columnGap={{ base: '0.2rem', md: '0.5rem' }}
      rowGap={{ base: '0.35rem', md: '0.5rem' }}
    >
      {/* Header row — empty corner + category labels + launch label. */}
      <Box role="columnheader" />
      {categories.map((cat) => (
        <Box
          key={cat.id}
          role="columnheader"
          display="flex"
          alignItems="flex-end"
          justifyContent="center"
          minH={{ base: '5.5rem', md: 'auto' }}
          paddingBottom="xs"
        >
          <Text
            fontSize={{ base: '0.5rem', md: '0.65rem' }}
            letterSpacing="wider"
            textTransform="uppercase"
            fontWeight="semibold"
            color={`${color}d9`}
            lineHeight={1.2}
            m={0}
            textAlign="center"
            css={{
              textShadow: `0 2px 8px ${darkColor}`,
              '@media (max-width: 47.99em)': {
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                whiteSpace: 'nowrap',
              },
            }}
          >
            {cat.label[locale]}
          </Text>
        </Box>
      ))}
      <Text
        role="columnheader"
        fontSize={{ base: '0.5rem', md: '0.65rem' }}
        letterSpacing="wider"
        textTransform="uppercase"
        fontWeight="bold"
        color={LAUNCH_ACCENT}
        textAlign="center"
        lineHeight={1.2}
        m={0}
        alignSelf="end"
        paddingBottom="xs"
        css={{ textShadow: `0 2px 8px ${darkColor}` }}
      >
        {launchLabel}
      </Text>

      {/* Data rows — planet name + cells + launch total. */}
      {planets.map((planet) => (
        <PlanetRow
          key={planet.id}
          planet={planet}
          categories={categories}
          locale={locale}
          color={color}
          darkColor={darkColor}
        />
      ))}
    </Box>
  );
}

/** Accent gold used for the "Lançamento" column — contrasts with the
 *  lavender Kammara accent so the aggregate stands apart from the
 *  per-category cells. */
const LAUNCH_ACCENT = '#f5c842';

interface PlanetRowProps {
  planet: ProgressPlanet;
  categories: ProgressCategory[];
  locale: 'pt' | 'en';
  color: string;
  darkColor: string;
}

function PlanetRow({ planet, categories, locale, color, darkColor }: PlanetRowProps) {
  // Launch readiness = simple mean of the percentages across the
  // currently-defined categories. Driving the average from the
  // `categories` list (not from `Object.keys(planet.progress)`) means a
  // newly-added category counts as 0 for any planet that doesn't have
  // it yet — so adding a category to the JSON automatically lowers the
  // launch total instead of being silently ignored.
  const launchValue = computeLaunchPercent(planet, categories);
  const launchLabel = locale === 'en' ? 'Launch' : 'Lançamento';

  return (
    <>
      <Text
        role="rowheader"
        fontSize={{ base: '0.7rem', md: '1rem' }}
        fontWeight="bold"
        letterSpacing="wider"
        color={color}
        m={0}
        alignSelf="center"
        textAlign="right"
        paddingRight={{ base: '0.3rem', md: '0.75rem' }}
        css={{ textShadow: `0 2px 8px ${darkColor}` }}
      >
        {planet.name[locale]}
      </Text>
      {categories.map((cat) => {
        const value = clampPercent(planet.progress[cat.id] ?? 0);
        return (
          <HeatmapCell
            key={cat.id}
            value={value}
            color={color}
            ariaLabel={`${planet.name[locale]} · ${cat.label[locale]}: ${value}%`}
          />
        );
      })}
      <LaunchCell
        value={launchValue}
        ariaLabel={`${planet.name[locale]} · ${launchLabel}: ${launchValue}%`}
      />
    </>
  );
}

function computeLaunchPercent(
  planet: ProgressPlanet,
  categories: ProgressCategory[],
): number {
  if (categories.length === 0) return 0;
  const total = categories.reduce((sum, cat) => {
    return sum + clampPercent(planet.progress[cat.id] ?? 0);
  }, 0);
  return Math.round(total / categories.length);
}

interface HeatmapCellProps {
  value: number;
  color: string;
  ariaLabel: string;
}

function HeatmapCell({ value, color, ariaLabel }: HeatmapCellProps) {
  // Cell floats over the background image: only the accent color
  // tints it, with opacity proportional to the percentage. Empty
  // cells (value = 0) reveal the image fully; full cells (100%)
  // sit as a saturated overlay. No dark base, no inner text.
  const overlayOpacity = value / 100;

  return (
    <Box
      role="cell"
      aria-label={ariaLabel}
      position="relative"
      height={{ base: '2.2rem', md: '2.6rem', xl: '3rem' }}
      borderRadius="6px"
      overflow="hidden"
      css={{
        border: `1px solid ${color}33`,
        background: color,
        opacity: 0.15 + overlayOpacity * 0.85,
      }}
    />
  );
}

interface LaunchCellProps {
  value: number;
  ariaLabel: string;
}

function LaunchCell({ value, ariaLabel }: LaunchCellProps) {
  // Aggregated readiness — visually distinct from per-category cells:
  // gold accent instead of lavender, thicker border, soft glow.
  //
  // On mount the cell animates from 0% up to its real value (~1.2s,
  // ease-out) so the row reads as a loading bar settling into place.
  // We use a horizontal fill (left-to-right) instead of just bumping
  // opacity, because a horizontal bar is the universally understood
  // "loading" affordance.
  const animatedValue = useFillOnMount(value);
  return (
    <Box
      role="cell"
      aria-label={ariaLabel}
      position="relative"
      height={{ base: '2.2rem', md: '2.6rem', xl: '3rem' }}
      borderRadius="6px"
      overflow="hidden"
      css={{
        border: `2px solid ${LAUNCH_ACCENT}`,
        boxShadow: `0 0 12px ${LAUNCH_ACCENT}55`,
        background: `${LAUNCH_ACCENT}26`,
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        aria-hidden="true"
        css={{
          width: `${animatedValue}%`,
          background: LAUNCH_ACCENT,
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </Box>
  );
}

/**
 * Animates a numeric value from 0 up to `target` once, on mount.
 * Used by LaunchCell to give the aggregate readiness a "loading bar
 * settling" feel without re-running every render. We schedule the
 * state update on the next frame so the browser actually paints the
 * 0 state first — otherwise the transition wouldn't fire.
 */
function useFillOnMount(target: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return value;
}

function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}
