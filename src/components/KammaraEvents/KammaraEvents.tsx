'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { DSTextPanel } from '@/components/DSTextPanel';
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
        gap={{ base: '0.8rem', md: '1.2rem' }}
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
  const isExternal = event.href?.startsWith('http');
  const meta = getEventPlanetMeta(event.planet, locale);
  // Page-level color is the fallback when the planet has no palette
  // yet (e.g. hash, bluecity in the upcoming-worlds list).
  const accent = meta.color ?? color;
  // The card glyph follows the planet's canonical crest by default;
  // `event.glyph` from the JSON is kept as an explicit override for
  // events that want to break the rule.
  const glyph = event.glyph || meta.glyph;
  const planetLabel = meta.name.toUpperCase();
  const badgeText = event.subcategory
    ? `${glyph}  ${planetLabel} · ${event.subcategory[locale].toUpperCase()}`
    : `${glyph}  ${planetLabel}`;
  const whenLabel = locale === 'en' ? 'CYCLE' : 'CICLO';
  const whereLabel = locale === 'en' ? 'LOCATION' : 'LOCAL';
  const cshiftLabel = locale === 'en' ? 'CSHIFT' : 'CSHIFT';

  const card = (
    <Box
      role="article"
      aria-label={event.title[locale]}
      position="relative"
      aspectRatio={{ base: 'auto', md: '1 / 1' }}
      width="100%"
      transition="transform 240ms ease-out"
      css={{
        // The panel's default backdrop blur fakes opacity even when
        // `panelBg` is translucent — so we soften it here to let the
        // section background show through.
        '& .ds-text-panel': {
          backdropFilter: 'blur(2px) !important',
        },
        // Tone down the DSTextPanel headline — that component is sized
        // for full-width banners; here it's a small card inside a 3–4
        // col grid, so we override the inner <h2>.
        '& h2': {
          fontSize: 'calc(1.15rem - 1px) !important',
          lineHeight: '1.2 !important',
        },
        '& p': {
          fontSize: '0.72rem !important',
          lineHeight: '1.45 !important',
        },
        // CICLO and LOCAL sit on adjacent <p>s — the panel's default
        // gap between them feels too loose for a metadata pair, so we
        // tighten it. The last metadata <p> still keeps a healthy gap
        // before the description body.
        '& p:has(strong) + p:has(strong)': {
          marginTop: '-0.7rem !important',
        },
        // Pull the first metadata row up closer to the title — the
        // panel's default top padding under the heading feels heavy
        // for a small card. Bottom padding gets a touch more room so
        // the description doesn't kiss the lower border.
        '& .ds-text-scroll': {
          paddingTop: '0.2rem !important',
          paddingBottom: '1.6rem !important',
        },
        // QUANDO / ONDE labels — small uppercase eyebrows in the
        // planet accent colour, inline with the value. When the card
        // has a custom background image we switch them to white so
        // they stay legible over arbitrary art.
        '& p strong': {
          fontWeight: 600,
          fontSize: '0.6rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginRight: '0.35rem',
          color: event.backgroundImage ? '#ffffff' : accent,
          opacity: 0.95,
        },
        // Disable DSTextPanel's "creature" dropcap — it would turn the
        // first letter of "QUANDO" into a giant Q, which we don't want
        // here. The dropcap rule from the panel is `& p:first-of-type::first-letter`,
        // so we reset it.
        '& p:first-of-type::first-letter': {
          fontSize: 'inherit !important',
          fontWeight: 'inherit !important',
          color: 'inherit !important',
          float: 'none !important',
          lineHeight: 'inherit !important',
          padding: '0 !important',
          textShadow: 'none !important',
        },
        '@media (min-width: 48em)': {
          '& h2': { fontSize: 'calc(1.3rem - 1px) !important' },
          '& p': { fontSize: '0.8rem !important' },
          '& p strong': { fontSize: '0.65rem' },
        },
        '@media (min-width: 80em)': {
          '& h2': { fontSize: 'calc(1.4rem - 1px) !important' },
          '& p': { fontSize: '0.85rem !important' },
        },
        // The DSTextPanel's "creature" decorative gradient bar lives
        // right after the title and ends in `creatureAccentAlt` —
        // which we set to white over a bg image so badge text reads.
        // Force the bar to use the planet accent regardless, so the
        // little splash of identity colour stays under the headline.
        ...(event.backgroundImage
          ? {
              '& .ds-text-panel > div:first-of-type > div:last-child': {
                background: `linear-gradient(90deg, ${color}, ${accent}, transparent) !important`,
              },
            }
          : {}),
        ...(event.href
          ? {
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-2px)' },
            }
          : {}),
      }}
    >
      {event.backgroundImage && (
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          borderRadius="16px"
          overflow="hidden"
          zIndex={0}
          css={{
            backgroundImage: `url(${event.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Tint overlay in the planet's accent so each card carries
            // its world's identity even with a custom background image.
            boxShadow: `inset 0 0 0 1000px ${accent}1a`,
          }}
        />
      )}
      <DSTextPanel
        title={event.title[locale]}
        titleColor={event.backgroundImage ? '#ffffff' : color}
        textColor={event.backgroundImage ? '#ffffffe6' : `${color}d9`}
        subtitleColor={event.backgroundImage ? '#ffffffcc' : `${color}b3`}
        creatureAccent={color}
        creatureAccentAlt={event.backgroundImage ? '#ffffff' : accent}
        borderColor={event.backgroundImage ? accent : undefined}
        badge={badgeText}
        panelBg={`${darkColor}4d`}
        compact
        fillParent
      >
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
        <p>{event.description[locale]}</p>
      </DSTextPanel>
    </Box>
  );

  if (!event.href) return card;

  return (
    <Box
      as="a"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ href: event.href } as any)}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      display="block"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
      _focusVisible={{
        outline: `2px solid ${color}`,
        outlineOffset: '4px',
        borderRadius: '16px',
      }}
    >
      {card}
    </Box>
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
