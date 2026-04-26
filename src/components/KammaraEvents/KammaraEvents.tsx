'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { KammaraEventCard } from '@/components/KammaraEventCard';
import { palettes, type PaletteName } from '@/theme/palettes';
import { worldCrestGlyph } from '@/theme/kalunGlyphs';
import { getWorldName } from '@/data/characters/kammara/_worldData';

export interface EventCategory {
  id: string;
  label: { pt: string; en: string };
}

export interface KammaraEvent {
  id: string;
  category: string;
  /**
   * Optional free-form sub-type of the event (e.g. festival, rito,
   * conferência). When present, gets appended to the badge after a
   * `·` separator and rendered uppercase.
   */
  subcategory?: { pt: string; en: string };
  /** ID of an existing world (lunnp1, eni4, triplec, …) — used as a label. */
  planet: string;
  /**
   * Optional override for the kalún glyph. When omitted (or empty)
   * the card uses the planet's canonical crest from kalunGlyphs.ts.
   */
  glyph?: string;
  title: { pt: string; en: string };
  /** Free-form date string (e.g. "Próximo ciclo", "Ano 41-Z"). */
  date: { pt: string; en: string };
  /** Optional location/region inside the planet (e.g. "Malloc", "Niul Forest"). */
  location?: { pt: string; en: string };
  /** Optional Cshift address — Kammara's interplanetary "coordinate". */
  cshiftAddress?: string;
  /**
   * Optional background image for THIS card only. Path relative to
   * `/public` (e.g. `/imgs/kammara/lunnp1/festival.png`). When set,
   * sits behind the translucent panel so the image reads through it.
   */
  backgroundImage?: string;
  description: { pt: string; en: string };
  /**
   * Optional destination. When present, the card becomes a clickable
   * link. Internal paths ("/kammara/...") render as same-tab nav;
   * absolute URLs (starting with http) open in a new tab.
   */
  href?: string;
}

export interface KammaraEventsProps {
  /** Section title (already localized by the page). */
  title: string;
  /** Optional kicker shown above the title. */
  kicker?: string;
  /** Categories — each category becomes its own sub-section. */
  categories: EventCategory[];
  /** All events. Filtered into sub-sections by `event.category === category.id`. */
  events: KammaraEvent[];
  /** Active locale used to read `{pt, en}` fields. */
  locale: 'pt' | 'en';
  /** Section accent colour (page-controlled, usually kammara palette). */
  color: string;
  /** Section dark colour for shadows + tints. */
  darkColor: string;
  'data-testid'?: string;
}

/**
 * KammaraEvents — list of upcoming in-universe events for Kammara.
 *
 * Pure presentational component: renders title + one sub-section per
 * category, each containing a grid of event cards. Background image,
 * outer wrapper, and section placement are controlled by the calling
 * page (so you can drop this anywhere and decide separately whether
 * to put a backdrop behind it).
 *
 * Visual DNA borrows from KammaraProgressHeatmap: same kicker/title
 * stack, same kalún ornaments, same accent-driven glow on cards. No
 * cinematic bg image baked in, by design.
 */
export function KammaraEvents({
  title,
  kicker,
  categories,
  events,
  locale,
  color,
  darkColor,
  'data-testid': testId,
}: KammaraEventsProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-events'}
      aria-label={title}
      width="100%"
      position="relative"
      marginBottom={{ base: '1.5rem', md: '2.5rem' }}
      marginTop={{ base: '1.5rem', md: '2.5rem' }}
    >
      {/* Section title block */}
      <Flex
        direction="column"
        align="flex-start"
        gap="xs"
        marginBottom={{ base: '1.5rem', md: '2.5rem' }}
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

      {/* One sub-section per category */}
      <Flex direction="column" gap={{ base: '2rem', md: '3rem' }}>
        {categories.map((cat) => {
          const items = events.filter((e) => e.category === cat.id);
          if (items.length === 0) return null;
          return (
            <CategoryBlock
              key={cat.id}
              category={cat}
              events={items}
              locale={locale}
              color={color}
              darkColor={darkColor}
            />
          );
        })}
      </Flex>
    </Box>
  );
}

interface CategoryBlockProps {
  category: EventCategory;
  events: KammaraEvent[];
  locale: 'pt' | 'en';
  color: string;
  darkColor: string;
}

function CategoryBlock({
  category,
  events,
  locale,
  color,
  darkColor,
}: CategoryBlockProps) {
  return (
    <Box>
      <Flex align="center" gap="sm" marginBottom={{ base: '0.8rem', md: '1.2rem' }}>
        <Text
          aria-hidden="true"
          color={color}
          fontFamily="glyph"
          fontSize="md"
          opacity={0.7}
          m={0}
          css={{ textShadow: `0 2px 8px ${darkColor}` }}
        >
          ⊹
        </Text>
        <Heading
          as="h3"
          fontFamily="body"
          fontSize={{ base: '1rem', md: '1.2rem' }}
          fontWeight="semibold"
          letterSpacing="hero"
          textTransform="uppercase"
          color={color}
          m={0}
          css={{ textShadow: `0 2px 10px ${darkColor}` }}
        >
          {category.label[locale]}
        </Heading>
      </Flex>

      <Box
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          md: 'repeat(3, minmax(0, 1fr))',
          xl: 'repeat(4, minmax(0, 1fr))',
        }}
        gap={{ base: '1.2rem', md: '2rem', xl: '2.4rem' }}
      >
        {events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            locale={locale}
            color={color}
            darkColor={darkColor}
          />
        ))}
      </Box>
    </Box>
  );
}

interface EventCardProps {
  event: KammaraEvent;
  locale: 'pt' | 'en';
  color: string;
  darkColor: string;
}

function EventCard({ event, locale, color, darkColor }: EventCardProps) {
  const meta = getEventPlanetMeta(event.planet, locale);
  // Planet accent + dark colour — fall back to section colours when
  // the planet isn't a registered palette (hash, bluecity, etc).
  const planetPalette = palettes[event.planet as PaletteName];
  const accent = meta.color ?? color;
  const accentDark = planetPalette?.dark ?? darkColor;
  const whenLabel = locale === 'en' ? 'CYCLE' : 'CICLO';
  const whereLabel = locale === 'en' ? 'LOCATION' : 'LOCAL';
  const cshiftLabel = 'CSHIFT';

  // Map the event onto KammaraEventCard (= KammaraCardRegion clone):
  //   - name           ← event title              (hero heading)
  //   - category       ← subcategory or category  (kicker line)
  //   - parentName     ← canonical planet name    ("LUNN'P1" etc.)
  //   - parentCrestGlyph ← canonical planet crest (background echo)
  //   - crestGlyph     ← event glyph if provided, otherwise planet crest
  //   - tabs[0].content ← the metadata stack + description
  const subcategory = event.subcategory?.[locale];
  const category = subcategory ?? '';
  const eventGlyph = event.glyph || meta.glyph;

  return (
    <KammaraEventCard
      name={event.title[locale]}
      category={category}
      parentName={meta.name}
      parentCrestGlyph={meta.glyph}
      crestGlyph={eventGlyph}
      color={accent}
      darkColor={accentDark}
      headerBg={accentDark}
      bgImage={event.backgroundImage}
      tabs={[
        {
          id: event.id,
          icon: eventGlyph,
          label: event.title[locale],
          title: event.title[locale],
          content: (
            <>
              <p>
                <strong>{whenLabel}:</strong> {event.date[locale]}
              </p>
              {event.location && (
                <p>
                  <strong>{whereLabel}:</strong> {event.location[locale]}
                </p>
              )}
              {event.cshiftAddress && (
                <p>
                  <strong>{cshiftLabel}:</strong> ⊷⊙⊶[{event.cshiftAddress}]
                </p>
              )}
              <p className="kec-description">{event.description[locale]}</p>
            </>
          ),
        },
      ]}
    />
  );
}

/**
 * Resolves the event-card tag fields for a given planet id by reading
 * the canonical sources directly:
 *   - palettes[id].colors[0]       — accent colour
 *   - worldCrestGlyph(id)          — kalún crest of the world
 *   - getWorldName(id, locale)     — display name (with apostrophes etc.)
 *
 * If the id isn't a known world (hash, bluecity, …), `color` and `glyph`
 * fall back to undefined / the generic Kammara glyph and the caller is
 * expected to provide its own fallback colour. The name falls back to
 * the raw id so the tag still renders.
 */
function getEventPlanetMeta(
  planetId: string,
  locale: 'pt' | 'en',
): { color: string | undefined; glyph: string; name: string } {
  const palette = palettes[planetId as PaletteName];
  const name = getWorldName(planetId, locale) || planetId;
  return {
    color: palette?.colors[0],
    glyph: worldCrestGlyph(planetId),
    name,
  };
}
