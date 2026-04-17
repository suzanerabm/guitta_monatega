'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { KammaraRoulette, type KammaraRouletteHandle } from '@/components/KammaraRoulette';
import type {
  KammaraCardSubsystemProps,
  KammaraCardSubsystemStat,
} from './KammaraCardSubsystem';

export interface KammaraCardSubsystemHorizontalProps
  extends Omit<KammaraCardSubsystemProps, 'variant'> {
  /**
   * Layout variation:
   *  - `'A'` — "editorial" header on top (crest + title + tabs across),
   *    then image (16:9) + text side-by-side below.
   *  - `'C'` — "cinematic" full-bleed active tab image as the background
   *    with a translucent info panel floating over it.
   */
  variant?: 'A' | 'C';
  /**
   * Border style — mirrors the vertical card: `'default'` is solid
   * outline, `'region'` is dashed (used in TripleC sub-regions).
   */
  borderStyle?: 'default' | 'region';
}

const CARD_PADDING_X = '1.8rem';

/**
 * KammaraCardSubsystemHorizontal — desktop-wide version of the subsystem
 * card. Designed to sit at `width: 100%` with the same horizontal gutters
 * as KammaraCharacterGallery so they line up vertically on the page.
 *
 * This does NOT replace the vertical (mobile) `KammaraCardSubsystem` —
 * it's a parallel component for the desktop layout variations we're
 * experimenting with. Keep both so the mobile card stays untouched.
 *
 * Both variations share the same data model (`tabs`, `stats`, etc.) and
 * the same roulette interaction. Only the visual arrangement differs.
 */
export function KammaraCardSubsystemHorizontal({
  name,
  category,
  tabs,
  stats = [],
  crestGlyph = '⊙',
  color,
  darkColor,
  theme = 'dark',
  variant = 'A',
  borderStyle = 'default',
  'data-testid': testId,
}: KammaraCardSubsystemHorizontalProps) {
  const isRegion = borderStyle === 'region';
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = tabs[activeIndex];
  const rouletteRef = useRef<KammaraRouletteHandle>(null);

  const isLight = theme === 'light';
  const textColor = isLight ? 'overlayLightSoft' : 'textOverlayBright';
  const mutedText = isLight ? 'inkSoft' : 'bannerLabel';

  const handleSelect = (index: number) => {
    if (index !== activeIndex) setActiveIndex(index);
  };

  // ---------------------------------------------------------------------
  // Variation A — editorial header on top + image/text side-by-side body.
  // ---------------------------------------------------------------------
  if (variant === 'A') {
    return (
      <Box
        data-testid={testId ?? 'kammara-card-subsystem-horizontal-a'}
        aria-label={name}
        position="relative"
        width="100%"
        borderRadius="32px"
        overflow="visible"
      >
        {/* Roulette anchored at the top-center of the card, inside its
            bounds. `top: 0` places the active sphere's upper edge exactly
            on the card's top edge; the rest of the orbit arcs up around
            it without escaping the card's left/right. */}
        <Box
          position="absolute"
          top="0px"
          left="50%"
          zIndex={40}
          css={{ transform: 'translateX(-50%)' }}
        >
          <KammaraRoulette
            ref={rouletteRef}
            items={tabs}
            activeIndex={activeIndex}
            onSelect={handleSelect}
            color={color}
            darkColor={darkColor}
          />
        </Box>

        {/* Card body */}
        <Box
          position="relative"
          width="100%"
          borderRadius="32px"
          overflow="hidden"
          css={{
            background: `linear-gradient(160deg, ${darkColor}b3 0%, ${darkColor}b3 45%, ${darkColor}b3 100%)`,
            border: `1px solid ${color}40`,
            outline: `2px solid ${color}`,
            outlineOffset: '6px',
            boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {/* Giant faded crest watermark behind everything */}
          <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden" aria-hidden="true">
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '28rem',
                lineHeight: 1,
                color: `${color}08`,
                userSelect: 'none',
              }}
            >
              {crestGlyph}
            </Box>
          </Box>

          {/* Color halo from top */}
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            aria-hidden="true"
            css={{
              background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}35, transparent 70%)`,
            }}
          />

          <Flex position="relative" direction="column" width="100%">
            {/* ── Header strip (full width) ──────────────────────────
                Height grows with the title content (now includes the
                closing declarer below the planet name) — a fixed 140px
                would clip on longer titles. */}
            <Box
              position="relative"
              flexShrink={0}
              minH="160px"
              overflow="hidden"
              css={{
                background: `linear-gradient(160deg, ${color}20 0%, ${color}10 50%, ${color}20 100%)`,
                borderBottom: `1px solid ${color}`,
              }}
            >
              {/* Echo crest at both ends + big one in the center */}
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
                <span style={{ fontSize: '7rem' }}>{crestGlyph}</span>
                <span>{crestGlyph}</span>
              </Flex>

              {/* Title + category. The declarer "— ⊙ —" now closes this
                  block (below the planet name) instead of sitting at the
                  top, which keeps the visual pattern consistent with the
                  other subsystem cards. */}
              <Flex
                align="center"
                paddingTop={`calc(${CARD_PADDING_X} + 0.3rem)`}
                paddingBottom="0.4rem"
                paddingLeft={CARD_PADDING_X}
                paddingRight={CARD_PADDING_X}
                gap="md"
                height="100%"
              >
                <Flex direction="column" align="flex-start" gap="xs" flex={1} minW={0}>
                  <Text
                    fontSize="xs"
                    letterSpacing="hero"
                    textTransform="uppercase"
                    fontWeight="bold"
                    color={color}
                    m={0}
                    opacity={0.9}
                  >
                    {category.toUpperCase()}
                  </Text>
                  <Heading
                    as="h2"
                    fontFamily="body"
                    fontSize={
                      activeItem.label.length > 16
                        ? { base: '1.5rem', md: '1.9rem' }
                        : { base: '2rem', md: '2.4rem' }
                    }
                    fontWeight="bold"
                    lineHeight={1}
                    color={color}
                    letterSpacing="heroTitle"
                    m={0}
                    css={{
                      textShadow: `0 0 24px ${color}40`,
                      textWrap: 'balance',
                      wordBreak: 'break-word',
                    }}
                  >
                    {activeItem.label.toUpperCase()}
                  </Heading>
                  <Text textStyle="label" color={color} m={0} opacity={0.9}>
                    {name}
                  </Text>

                  {/* Closing declarer */}
                  <Flex
                    align="center"
                    gap="sm"
                    width="100%"
                    mt="xs"
                    aria-label="Subsistema"
                    pointerEvents="none"
                    css={{
                      fontFamily: 'var(--chakra-fonts-glyph)',
                      fontSize: '1rem',
                      color: `${color}cc`,
                      letterSpacing: '0.3em',
                    }}
                  >
                    <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
                    <span style={{ fontSize: '1.3rem' }}>⊙</span>
                    <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
                  </Flex>
                </Flex>
              </Flex>
            </Box>

            {/* ── Body — image (16:9) + text side-by-side ───────────── */}
            <Flex
              position="relative"
              direction={{ base: 'column', md: 'row' }}
              align="stretch"
              gap="lg"
              padding={{ base: '1.2rem', md: '1.6rem 2rem' }}
              minH={0}
            >
              {/* Image column — 16:9 aspect ratio. Grows up to ~50% on
                  desktop, then the text column takes the remaining space. */}
              {activeItem.image && (
                <Box
                  flex={{ base: '0 0 auto', md: '0 0 48%' }}
                  maxW={{ base: '100%', md: '48%' }}
                >
                  <Box
                    position="relative"
                    width="100%"
                    css={{
                      aspectRatio: '16 / 9',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${color}40`,
                      boxShadow: `0 10px 28px rgba(0,0,0,0.45), 0 0 24px ${color}20`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeItem.image}
                      alt={activeItem.imageAlt ?? activeItem.title}
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
                  </Box>
                </Box>
              )}

              {/* Text column — stats bar + content body */}
              <Flex direction="column" flex="1 1 0%" minW={0} gap="md">
                {stats.length > 0 && (
                  <StatsBar stats={stats} color={color} textColor={textColor} />
                )}
                <Box
                  flex={1}
                  minH={0}
                  css={{
                    fontFamily: 'var(--chakra-fonts-body)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    fontWeight: 300,
                    color: textColor,
                    '& h3': {
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: color,
                      marginTop: '1.1rem',
                      marginBottom: '0.3rem',
                    },
                    '& h3:first-of-type': { marginTop: 0 },
                    '& p': { marginBottom: '0.8rem' },
                  }}
                >
                  {activeItem.content}
                </Box>
              </Flex>
            </Flex>

            {/* Footer */}
            <Flex
              flexShrink={0}
              justify="space-between"
              align="center"
              padding="0.4rem 1.5rem"
              position="relative"
              css={{
                borderTop: `1px solid ${color}25`,
                background: `linear-gradient(0deg, ${color}10, transparent)`,
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '0.9rem',
                letterSpacing: '0.3em',
              }}
              color={mutedText}
            >
              <span aria-label="Kammara">⊹ ⊙ ⊹</span>
              <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color={mutedText} m={0}>
                Kammara
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    );
  }

  // ---------------------------------------------------------------------
  // Variation C — cinematic. The active tab's image fills the whole card,
  // the roulette sits at the top-center (inside the card), and the header
  // ornaments float lightly OVER the image — no full opaque bar, so the
  // photo still breathes. Title + category live in the top-left corner,
  // info panel with stats + content floats on the right.
  // ---------------------------------------------------------------------
  return (
    <Box
      data-testid={testId ?? 'kammara-card-subsystem-horizontal-c'}
      aria-label={name}
      position="relative"
      width="100%"
      borderRadius="32px"
      overflow="visible"
    >
      {/* Roulette at the top-center of the card, inside its bounds.
          `top: 15px` pushes the whole roulette down a touch so the active
          sphere sits comfortably inside the card over the cinematic image,
          not kissing the top edge like in variant A. */}
      <Box
        position="absolute"
        top="15px"
        left="50%"
        zIndex={40}
        css={{ transform: 'translateX(-50%)' }}
      >
        <KammaraRoulette
          ref={rouletteRef}
          items={tabs}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          color={color}
          darkColor={darkColor}
        />
      </Box>

      <Box
        position="relative"
        width="100%"
        height={{ base: '560px', md: '520px', xl: '560px' }}
        borderRadius="32px"
        overflow="hidden"
        css={{
          border: `1px solid ${color}40`,
          outline: `2px solid ${color}`,
          outlineOffset: '6px',
          boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Active tab image fills the card. Crossfades when the active
            index changes (via `key` prop so React remounts the img). */}
        {activeItem.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={activeItem.id}
            src={activeItem.image}
            alt={activeItem.imageAlt ?? activeItem.title}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              animation: 'ksub-cine-fade 0.6s ease-out both',
            }}
          />
        )}
        {/* Darken layer — keeps the info panel legible regardless of the
            image's brightness. */}
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{
            background: `linear-gradient(90deg, ${darkColor}cc 0%, ${darkColor}99 45%, ${darkColor}55 75%, transparent 100%)`,
          }}
        />
        {/* Top-to-transparent tint so the title area reads clean even
            when the underlying image is bright. */}
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{
            background: `linear-gradient(180deg, ${darkColor}aa 0%, transparent 45%, transparent 55%, ${darkColor}aa 100%)`,
          }}
        />

        {/* Giant watermark crest softly behind the title zone. */}
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

        {/* Title block floating on the top-left over the image. Drop
            shadows on each line so they read regardless of the photo. */}
        <Flex
          position="absolute"
          top={{ base: '3.5rem', md: '4rem' }}
          left={{ base: '1.2rem', md: CARD_PADDING_X }}
          direction="column"
          align="flex-start"
          gap="xs"
          maxW={{ base: 'calc(100% - 2.4rem)', md: '48%' }}
          zIndex={3}
        >
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
            {category.toUpperCase()}
          </Text>
          <Heading
            as="h2"
            fontFamily="body"
            fontSize={
              activeItem.label.length > 16
                ? { base: '1.5rem', md: '2rem' }
                : { base: '2rem', md: '2.6rem' }
            }
            fontWeight="bold"
            lineHeight={1}
            color={color}
            letterSpacing="heroTitle"
            m={0}
            css={{
              textShadow: `0 0 28px ${darkColor}, 0 0 12px ${color}40`,
              textWrap: 'balance',
              wordBreak: 'break-word',
            }}
          >
            {activeItem.label.toUpperCase()}
          </Heading>
          <Text
            textStyle="label"
            color={color}
            m={0}
            opacity={0.95}
            css={{ textShadow: `0 2px 8px ${darkColor}` }}
          >
            {name}
          </Text>

          {/* Closing declarer "— ⊙ —" right below the title block. Fixed
              width so it reads as a compact "stamp" that seals the title,
              not a ruler that extends under the content panel to the right. */}
          <Flex
            align="center"
            gap="sm"
            width="200px"
            mt="xs"
            aria-label="Subsistema"
            pointerEvents="none"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '1rem',
              color: `${color}cc`,
              letterSpacing: '0.3em',
              textShadow: `0 0 12px ${darkColor}`,
            }}
          >
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
            <span style={{ fontSize: '1.3rem' }}>⊙</span>
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
          </Flex>
        </Flex>

        {/* Bottom-right floating info panel — stats + scrollable content. */}
        <Flex
          position="absolute"
          top={{ base: '8rem', md: '6rem' }}
          bottom={{ base: '3.5rem', md: '4rem' }}
          right={{ base: '1rem', md: '2rem' }}
          width={{ base: 'calc(100% - 2rem)', md: '60%' }}
          maxW="710px"
          direction="column"
          gap="md"
          padding={{ base: '1rem', md: '1.4rem 1.6rem' }}
          borderRadius="20px"
          css={{
            background: `linear-gradient(160deg, ${darkColor}d9 0%, ${darkColor}b3 60%, ${darkColor}d9 100%)`,
            border: `1px solid ${color}50`,
            boxShadow: `0 10px 32px rgba(0,0,0,0.6), 0 0 28px ${color}25, inset 0 1px 0 rgba(255,255,255,0.08)`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {stats.length > 0 && (
            <StatsBar stats={stats} color={color} textColor={textColor} compact />
          )}

          {/* Scrollable text body with edge-fade masks. `paddingTop`
              pushes the text itself a bit further down inside the panel
              without changing the container's geometry. Scrolling the
              content also collapses the roulette so it gets out of the
              reading area. */}
          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            onScroll={() => rouletteRef.current?.close()}
            css={{
              paddingTop: '1rem',
              fontFamily: 'var(--chakra-fonts-body)',
              fontSize: '0.88rem',
              lineHeight: 1.65,
              fontWeight: 300,
              color: textColor,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
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
              '& p': { marginBottom: '0.7rem' },
            }}
          >
            {activeItem.content}
          </Box>
        </Flex>

        {/* Footer bar */}
        <Flex
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          justify="space-between"
          align="center"
          padding="0.4rem 1.5rem"
          css={{
            borderTop: `1px solid ${color}40`,
            background: `linear-gradient(0deg, ${darkColor}dd, ${darkColor}66)`,
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '0.9rem',
            letterSpacing: '0.3em',
          }}
          color={mutedText}
        >
          <span aria-label="Kammara">⊹ ⊙ ⊹</span>
          <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color={mutedText} m={0}>
            Kammara
          </Text>
        </Flex>
      </Box>

      <style>{`
        @keyframes ksub-cine-fade {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1);    }
        }
      `}</style>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Shared stats bar — used by both variations so they stay visually
// consistent. `compact` switches to a tighter layout for the cinematic
// variant's floating panel.
// ---------------------------------------------------------------------------
function StatsBar({
  stats,
  color,
  textColor,
  compact = false,
}: {
  stats: KammaraCardSubsystemStat[];
  color: string;
  textColor: string;
  compact?: boolean;
}) {
  return (
    <Flex flexShrink={0} gap="0.5rem" flexWrap="wrap">
      {stats.map((stat, i) => (
        <Flex
          key={i}
          direction="column"
          gap="0.1rem"
          padding={compact ? '0.3rem 0.5rem' : '0.4rem 0.7rem'}
          css={{
            background: `${color}15`,
            border: `1px solid ${color}40`,
            borderRadius: '8px',
          }}
        >
          <Flex align="center" gap="tight">
            <Box as="span" fontFamily="glyph" fontSize="h4" color={color} lineHeight={1}>
              {stat.icon}
            </Box>
            <Text
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
              color={color}
              m={0}
              opacity={0.8}
            >
              {stat.label}
            </Text>
          </Flex>
          <Text
            fontSize={compact ? 'sm' : 'base'}
            fontWeight="semibold"
            color={textColor}
            m={0}
            lineHeight={1.1}
          >
            {stat.value}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
