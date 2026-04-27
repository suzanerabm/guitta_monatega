'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { KammaraRoulette, type KammaraRouletteHandle } from '@/components/KammaraRoulette';

// Shared layout constant: the card's horizontal padding.
// The gate label and the roulette position both depend on this value,
// so keep them in sync via this single source of truth.
export const CARD_PADDING_X = '1.8rem';

export interface KammaraCardSubsystemTab {
  id: string;
  icon: string;
  label: string;
  title: string;
  image?: string;
  imageAlt?: string;
  content: ReactNode;
}

export interface KammaraCardSubsystemStat {
  icon: string;
  label: string;
  value: string;
}

export interface KammaraCardSubsystemProps {
  /** Planet / region name (kept for aria/data-testid; not shown in the header anymore). */
  name: string;
  /** Category label shown in the header (e.g. "Subsistema"). Pass a translated string. */
  category: string;
  tabs: KammaraCardSubsystemTab[];
  stats?: KammaraCardSubsystemStat[];
  crestGlyph?: string;
  color: string;
  darkColor: string;
  theme?: 'light' | 'dark';
  /**
   * Visual variant.
   *  - `'default'` (solid outline) — planets
   *  - `'region'` (dashed outline) — TripleC sub-regions
   */
  variant?: 'default' | 'region';
  'data-testid'?: string;
}

export function KammaraCardSubsystem({
  name,
  category,
  tabs,
  stats = [],
  crestGlyph = '⊙',
  color,
  darkColor,
  theme = 'dark',
  variant = 'default',
  'data-testid': testId,
}: KammaraCardSubsystemProps) {
  const isRegion = variant === 'region';
  const allItems = tabs;

  const [activeIndex, setActiveIndex] = useState(0);
  const rouletteRef = useRef<KammaraRouletteHandle>(null);

  const activeItem = allItems[activeIndex];

  const isLight = theme === 'light';
  const textColor = isLight ? 'overlayLightSoft' : 'textOverlayBright';
  const mutedText = isLight ? 'inkSoft' : 'bannerLabel';

  const handleSelect = (index: number) => {
    if (index === activeIndex) {
      return;
    }
    setActiveIndex(index);
  };

  return (
    <Box
      data-testid={testId ?? 'kammara-card-subsystem'}
      aria-label={name}
      position="relative"
      width="100%"
      height="100%"
      borderRadius="32px"
      overflow="visible"
    >
      {/* Roulette positioned at the top-center of the card, inside its
          bounds. `top: 10px` keeps the active sphere fully inside the
          card (its upper edge touches the card's top border with a tiny
          breathing gap) while the rest of the orbit arcs up around it
          without escaping the card. */}
      <Box
        position="absolute"
        top="10px"
        left="50%"
        zIndex={40}
        css={{ transform: 'translateX(-50%)' }}
      >
        <KammaraRoulette
          ref={rouletteRef}
          items={allItems}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          color={color}
          darkColor={darkColor}
        />
      </Box>

      {/* ── Card body — same ~90% opaque gradient as KammaraCard */}
      <Box
        position="relative"
        width="100%"
        height="100%"
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
        {/* Background watermark */}
        <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: 'token(fontSizes.glyphWatermarkLg)',
              lineHeight: 1,
              color: `${color}06`,
              userSelect: 'none',
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
          {/* ── Header — two-row layout:
              Row 1 (top strip): subsystem declarer glyph, left-aligned.
              Row 2 (main): [ roulette slot | vertical divider | text column ]
              The text column stacks: category label, title, active glyph.
              Mobile is shorter to leave more room for the content; desktop
              keeps the taller strip to accommodate the bigger type. */}
          <Box
            position="relative"
            flexShrink={0}
            height={{ base: '130px', md: '180px' }}
            overflow="hidden"
            css={{
              background: `linear-gradient(160deg, ${color}20 0%, ${color}10 50%, ${color}20 100%)`,
              borderBottom: `1px solid ${color}`,
            }}
          >
            {/* Banner watermark — crest glyph echoes across both sides + giant center */}
            <Flex
              position="absolute"
              inset={0}
              justify="space-between"
              align="center"
              padding="0 lg"
              pointerEvents="none"
              aria-hidden="true"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                color: `${color}12`,
                fontSize: 'token(fontSizes.glyphWatermarkSmSides)',
                lineHeight: 1,
                overflow: 'hidden',
              }}
            >
              <span>{crestGlyph}</span>
              <Box as="span" fontSize="glyphWatermarkSmCenter">{crestGlyph}</Box>
              <span>{crestGlyph}</span>
            </Flex>

            {/* Header text column. The declarer "— ⊙ —" used to sit at
                the very top of the header, but it now closes the title
                block below instead of floating lonely up top. */}
            <Flex
              align="center"
              paddingTop={`calc(${CARD_PADDING_X} + 0.3rem)`}
              paddingBottom="0.4rem" /* tab spacing — values not in catalogue */
              paddingLeft={{ base: '1.2rem', md: CARD_PADDING_X }} /* tab spacing — values not in catalogue */
              paddingRight={{ base: '1.2rem', md: CARD_PADDING_X }} /* tab spacing — values not in catalogue */
              gap="sm"
              height="100%"
            >
              <Flex direction="column" align="flex-start" gap="xs" flex={1} minW={0}>
                {/* Subtitle (category — already translated by caller) */}
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

                {/* Title — dynamic, changes with the active subsystem.
                    Uses a clamp tied to the card's own size (not viewport)
                    so it doesn't blow up on ultra-wide screens. */}
                <Heading
                  as="h2"
                  fontFamily="body"
                  // Shrink the font when the title is long so a lone letter
                  // doesn't get orphaned on the last line.
                  fontSize={
                    activeItem.label.length > 16
                      ? { base: '1.4rem', md: '1.7rem' }
                      : { base: '1.8rem', md: '2.2rem' }
                  }
                  fontWeight="bold"
                  lineHeight={1}
                  color={color}
                  letterSpacing="heroTitle"
                  textAlign="left"
                  m={0}
                  css={{
                    textShadow: `0 0 24px ${color}40`,
                    // `text-wrap: balance` asks the browser to distribute
                    // words across lines so each line has a similar length,
                    // preventing orphan letters like a lone "A" on line 2.
                    textWrap: 'balance',
                    wordBreak: 'break-word',
                  }}
                >
                  {activeItem.label.toUpperCase()}
                </Heading>

                {/* Planet / region name — uses the app-wide `label` textStyle preset. */}
                <Text textStyle="label" color={color} m={0} opacity={0.9}>
                  {name}
                </Text>

                {/* Closing declarer "— ⊙ —" right below the title block,
                    acting as a visual "stamp" that seals the title area. */}
                <Flex
                  align="center"
                  gap="sm"
                  width="100%"
                  mt="xs"
                  aria-label="Subsistema"
                  pointerEvents="none"
                  css={{
                    fontFamily: 'var(--chakra-fonts-glyph)',
                    fontSize: 'token(fontSizes.md)',
                    color: `${color}cc`,
                    letterSpacing: 'token(letterSpacings.hero)',
                  }}
                >
                  <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
                  <Box as="span" fontSize="h3">⊙</Box>
                  <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
                </Flex>
              </Flex>
            </Flex>
          </Box>

          {/* Divider */}
          <Box height="1px" flexShrink={0} css={{ background: `${color}60` }} />

          {/* ── Body content (full width) ── */}
          <Flex direction="column" flex={1} minW={0} minH={0}>

          {/* Stats bar */}
          {stats.length > 0 && (
            <Flex flexShrink={0} padding="0.6rem 1.8rem" /* composite — keep inline */ gap="sm" flexWrap="wrap">
              {stats.map((stat, i) => (
                <Flex
                  key={i}
                  direction="column"
                  gap="0.1rem" /* not in token catalogue */
                  padding="0.35rem 0.6rem" /* composite — keep inline */
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

          {/* ── Content ──────────────────────────
              When the user scrolls the content, collapse the roulette so
              it stops covering the reading area. The ref's `close()`
              fires the shooting-star exit animation once; after that the
              scroll keeps firing but `close()` is a no-op when already
              closed (guarded inside the roulette itself). */}
          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            padding="0.8rem 1.8rem 1.2rem" /* composite — keep inline */
            onScroll={() => rouletteRef.current?.close()}
            css={{
              fontFamily: 'var(--chakra-fonts-body)',
              fontSize: 'token(fontSizes.cardBody)',
              lineHeight: 1.65,
              fontWeight: 300,
              color: textColor,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 4%, black 94%, transparent 100%)',
              '& h3': {
                fontSize: 'token(fontSizes.cardLabel)',
                fontWeight: 600,
                letterSpacing: 'token(letterSpacings.cardLabel)',
                textTransform: 'uppercase',
                color: color,
                marginTop: '1.1rem', /* different from cardSection (1.2rem); subsystem-specific gap */
                marginBottom: 'token(spacing.cardLabelGap)',
              },
              '& h3:first-of-type': { marginTop: 0 },
              '& p': { marginBottom: 'token(spacing.cardBodyParagraph)' },
            }}
          >
            {activeItem.image && (
              <Image
                src={activeItem.image}
                alt={activeItem.imageAlt ?? activeItem.title}
                width="100%"
                height="150px"
                objectFit="cover"
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
            padding="0.4rem 1.5rem" /* composite — keep inline */
            css={{
              borderTop: `1px solid ${color}25`,
              background: `linear-gradient(0deg, ${color}10, transparent)`,
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: 'token(fontSizes.cardFooter)',
              letterSpacing: 'token(letterSpacings.hero)',
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

