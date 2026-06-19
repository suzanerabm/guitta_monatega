'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// Shared layout constant: the card's horizontal padding.
// The gate label and the roulette position both depend on this value,
// so keep them in sync via this single source of truth.
export const CARD_PADDING_X = '1.8rem';

// Fixed height at every breakpoint so cards in a row stay uniform — no
// card grows taller than its neighbours when its description runs long.
// The body content scrolls/clamps inside instead of stretching the card.
// Taller cards so the video strip (which sits below the title) fits without
// squeezing the description.
const CARD_HEIGHT: Record<string, string> = {
  base: '580px',
  md: '560px',
  xl: '680px',
  '3xl': '760px',
};

export interface KammaraEventCardTab {
  id: string;
  icon: string;
  label: string;
  title: string;
  image?: string;
  imageAlt?: string;
  content: ReactNode;
}

export interface KammaraEventCardStat {
  icon: string;
  label: string;
  value: string;
}

export interface KammaraEventCardProps {
  name: string;
  category: string;
  /** Name of the parent planet this region belongs to (e.g. "TripleC"). Required — shown in breadcrumb + footer. */
  parentName: string;
  /** Crest glyph of the parent planet. Shown in the breadcrumb + footer, and as a faint background echo behind the region's own crest. */
  parentCrestGlyph: string;
  /** Archetype / function in the Kammara cosmos. Shown as a secondary tag next to the category. */
  role?: string;
  /** Subtitle as traits — short elements separated by ·. */
  subtitle?: string;
  tabs: KammaraEventCardTab[];
  stats?: KammaraEventCardStat[];
  crestGlyph?: string;
  color: string;
  darkColor: string;
  midColor?: string;
  /** When provided, tints the header banner background with this color
   *  instead of `color`. Useful when `color` is too light for a dark bg. */
  headerBg?: string;
  /** Optional background image, sits at the very bottom of the card
   *  behind every other layer (gradient, watermarks, halo, content). */
  bgImage?: string;
  /** Optional looping background video — same slot as `bgImage`, taking
   *  precedence over it. Muted + autoplay + loop; `bgImage` acts as the
   *  poster while it loads. */
  bgVideo?: string;
  theme?: 'light' | 'dark';
  'data-testid'?: string;
}

/**
 * KammaraEventCard — literal clone of KammaraCardRegion. Same layout,
 * same banner header, same body, same footer; copied byte-for-byte and
 * kept as a separate component so the events grid can evolve from here
 * without touching the world/region cards.
 */
export function KammaraEventCard({
  name,
  category,
  parentName,
  parentCrestGlyph,
  role,
  subtitle,
  tabs,
  stats = [],
  crestGlyph = '⊙',
  color,
  darkColor,
  midColor,
  headerBg,
  bgImage,
  bgVideo,
  theme = 'dark',
  'data-testid': testId,
}: KammaraEventCardProps) {
  const allItems = tabs;

  const activeIndex = 0;

  const activeItem = allItems[activeIndex];

  const isLight = theme === 'light';
  const textColor = isLight ? 'overlayLightSoft' : 'textOverlayBright';
  const mutedText = isLight ? 'inkSoft' : 'bannerLabel';
  const body = midColor ?? darkColor;
  const hdrBg = headerBg ?? color;

  return (
    <Box
      data-testid={testId ?? 'kammara-event-card'}
      position="relative"
      width="100%"
      // Cards with a bgImage take a softer 3:4 portrait — capped at a
      // sensible max-width so they don't balloon on wide grids.
      // Text-only cards keep their fixed compact height.
      height={CARD_HEIGHT}
      borderRadius="32px"
      overflow="visible"
    >
      {/* ── Card body ────────────────────────────────────
          Region variant tweak: outline is DASHED (not solid) + lighter
          offset — signals "this is a fragment, not a whole world". */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        borderRadius="32px"
        overflow="hidden"
        css={{
          background: `linear-gradient(160deg, ${darkColor}b3 0%, ${body}b3 45%, ${darkColor}b3 100%)`,
          border: `1px solid ${color}40`,
          outline: `2px solid ${color}`,
          outlineOffset: '6px',
          boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Optional background media — bottommost layer of the card body.
            All subsequent layers (gradient, watermarks, halo, header
            banner) sit on top, so the image only shows through their
            transparent parts. (A `bgVideo`, when present, gets its own crisp
            strip at the top of the card instead — see below.) */}
        {bgImage && (
          <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImage}
              alt=""
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.45,
                display: 'block',
              }}
            />
          </Box>
        )}

        {/* Background watermark — two layers: parent planet's crest (big, very faint)
            as a distant echo, and the region's own crest on top (smaller, slightly more visible).
            Reinforces the "fragment of a bigger world" feeling. */}
        <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
          {/* Parent planet's crest — gigantic, barely visible (3% alpha) */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '24rem',
              lineHeight: 1,
              color: `${color}05`,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            {parentCrestGlyph}
          </Box>
          {/* Region's crest — smaller, slightly brighter, sits in front of the parent echo */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '14rem',
              lineHeight: 1,
              color: `${color}0a`,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            {crestGlyph}
          </Box>
        </Box>

        {/* Color halo */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          css={{
            background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}35, transparent 70%)`,
          }}
        />

        <Flex position="relative" direction="column" width="100%" height="100%">
          {/* ── Title banner ──────────────────────
              Fixed minimum height so cards in a row align: a 1-line title and
              a 3-line title reserve the same header space, keeping the CICLO /
              LOCAL / CSHIFT rows below them level across cards. */}
          <Box
            position="relative"
            flexShrink={0}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            minHeight={{ base: '184px', md: '176px', xl: '196px' }}
            css={{
              background: hdrBg,
              borderBottom: `1px solid ${color}`,
            }}
          >
            {/* Banner watermark — crest glyph (world identity) on both sides */}
            <Flex
              position="absolute"
              inset={0}
              justify="space-between"
              align="center"
              padding="0 1.5rem"
              pointerEvents="none"
              aria-hidden="true"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                color: `${color}12`,
                fontSize: '5rem',
                lineHeight: 1,
                overflow: 'hidden',
              }}
            >
              <span>{crestGlyph}</span>
              <span style={{ fontSize: '8rem' }}>{crestGlyph}</span>
              <span>{crestGlyph}</span>
            </Flex>

            {/* Header content — left-aligned */}
            <Flex direction="column" gap="sm" padding={`1rem ${CARD_PADDING_X} 1.2rem`}>
              {/* Kalún breadcrumb — region crest only, centered
                  between two rules. */}
              <Flex
                align="center"
                gap="sm"
                aria-label={name}
                css={{
                  fontFamily: 'var(--chakra-fonts-glyph)',
                  fontSize: '1rem',
                  color: `${color}cc`,
                  letterSpacing: '0.12em',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box width="20px" height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
                <span style={{ fontSize: '1.3rem' }}>{crestGlyph}</span>
                <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
              </Flex>

              {/* Category + parent + role tag */}
              <Flex align="center" gap="sm">
                <Text
                  fontSize="xs"
                  letterSpacing="hero"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  color={color}
                  m={0}
                  opacity={0.9}
                >
                  {category.toUpperCase()}
                </Text>
                <Box
                  as="span"
                  fontFamily="glyph"
                  fontSize="xs"
                  lineHeight={1}
                  css={{ color: `${color}80` }}
                  aria-hidden="true"
                >
                  ·
                </Box>
                <Text
                  fontSize="xs"
                  letterSpacing="hero"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  color="textOverlayBright"
                  m={0}
                  opacity={0.7}
                >
                  {parentName}
                </Text>
                {role && (
                  <>
                    <Box
                      as="span"
                      fontFamily="glyph"
                      fontSize="xs"
                      lineHeight={1}
                      css={{ color: `${color}80` }}
                      aria-hidden="true"
                    >
                      ·
                    </Box>
                    <Text
                      fontSize="xs"
                      letterSpacing="hero"
                      textTransform="uppercase"
                      fontWeight="semibold"
                      color="textOverlayBright"
                      m={0}
                      opacity={0.8}
                    >
                      {role}
                    </Text>
                  </>
                )}
              </Flex>

              {/* Name — left aligned. Smaller than the original
                  KammaraCardRegion (h2/h2 hero) since each event card
                  lives inside a multi-column grid. */}
              <Heading
                as="h3"
                fontFamily="body"
                fontSize="h3"
                fontWeight="bold"
                lineHeight={1.05}
                color={color}
                letterSpacing="heroTitle"
                m={0}
                css={{
                  textShadow: `0 0 40px ${color}40, 0 4px 20px ${color}30`,
                }}
              >
                {name}
              </Heading>

              {/* Gradient divider */}
              <Box
                height="1px"
                width="80px"
                css={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
              />

              {/* Traits (subtitle) — inline separated list */}
              {subtitle && (
                <Text
                  fontSize="sm"
                  color={mutedText}
                  m={0}
                  letterSpacing="wide"
                >
                  {subtitle}
                </Text>
              )}
            </Flex>
          </Box>

          {/* ── Video strip ──────────────────────
              A crisp looping video right below the title (no text or scrim
              over it) so the clip reads clearly. Only rendered when the event
              provides `bgVideo`; `bgImage` serves as its poster. */}
          {bgVideo && (
            <Box
              position="relative"
              flexShrink={0}
              overflow="hidden"
              height={{ base: '150px', md: '160px', xl: '190px' }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={bgImage}
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              >
                {/* Offer a webm sibling first (smaller); fall back to the mp4.
                    Derived by swapping the extension, so callers just pass the
                    .mp4 path. Browsers that lack the webm skip to the mp4. */}
                {bgVideo.endsWith('.mp4') && (
                  <source src={bgVideo.replace(/\.mp4$/, '.webm')} type="video/webm" />
                )}
                <source src={bgVideo} type="video/mp4" />
              </video>
              {/* Soft fade at the strip's base into the card body below. */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height="35%"
                pointerEvents="none"
                css={{ background: `linear-gradient(0deg, ${body}, transparent)` }}
              />
            </Box>
          )}

          {/* Divider */}
          <Box height="1px" flexShrink={0} css={{ background: `${color}60` }} />

          {/* ── Body content (full width) ── */}
          <Flex direction="column" flex={1} minW={0} minH={0}>

          {/* Stats bar */}
          {stats.length > 0 && (
            <Flex flexShrink={0} padding="0.6rem 1.8rem" gap="0.5rem" flexWrap="wrap">
              {stats.map((stat, i) => (
                <Flex
                  key={i}
                  direction="column"
                  gap="0.1rem"
                  padding="0.35rem 0.6rem"
                  css={{
                    background: `${color}15`,
                    border: `1px solid ${color}40`,
                    borderRadius: '8px',
                  }}
                >
                  <Flex align="center" gap="tight">
                    <Box
                      as="span"
                      fontFamily="glyph"
                      fontSize="h4"
                      color={color}
                      lineHeight={1}
                    >
                      {stat.icon}
                    </Box>
                    <Text fontSize="xs" letterSpacing="wider" textTransform="uppercase" color={color} m={0} opacity={0.8}>
                      {stat.label}
                    </Text>
                  </Flex>
                  <Text fontSize="base" fontWeight="semibold" color={textColor} m={0} lineHeight={1.1}>
                    {stat.value}
                  </Text>
                </Flex>
              ))}
            </Flex>
          )}

          {/* ── Content — left-aligned ────────────────────────── */}
          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            padding="0.8rem 1.8rem 1.2rem"
            textAlign="left"
            css={{
              fontFamily: 'var(--chakra-fonts-body)',
              fontSize: '0.88rem',
              lineHeight: 1.65,
              fontWeight: 300,
              color: textColor,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
              '& h3': {
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: color,
                marginTop: '1.1rem',
                marginBottom: '0.3rem',
              },
              '& h3:first-of-type': { marginTop: 0 },
              // Metadata rows render as `<p><strong>LABEL:</strong> value</p>`.
              // The <strong> is the accent eyebrow inline with its
              // value; rows stack tight so they read as a block.
              '& p': { marginBottom: '0.25rem' },
              '& p strong': {
                fontWeight: 600,
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color,
                marginRight: '0.4rem',
              },
              '& p.kec-description': {
                marginTop: '0.9rem',
                marginBottom: 0,
              },
            }}
          >
            {activeItem.image && (
              <Image
                src={activeItem.image}
                alt={activeItem.imageAlt ?? activeItem.title}
                width="100%"
                height="auto"
                display="block"
                marginBottom="base"
                boxShadow="cardHoverBig"
                css={{
                  borderRadius: '12px',
                  border: `1px solid ${color}30`,
                }}
              />
            )}
            {activeItem.content}
          </Box>

          {/* Footer */}
          <Flex
            flexShrink={0}
            justify="space-between"
            align="center"
            padding="0.4rem 1.5rem"
            css={{
              borderTop: `1px solid ${color}25`,
              background: `linear-gradient(0deg, ${color}10, transparent)`,
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
            }}
            color={mutedText}
          >
            {/* "⊹ ⊙ ⊹" = universo, Kammara (Kam'Rin) */}
            <span aria-label="Kammara">⊹ ⊙ ⊹</span>
            <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color={mutedText} m={0}>
              Kammara
            </Text>
          </Flex>
            </Flex>{/* close body content */}
        </Flex>
      </Box>
    </Box>
  );
}
