'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { KammaraRoulette } from '@/components/KammaraRoulette';

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
  'data-testid': testId,
}: KammaraCardSubsystemProps) {
  const allItems = tabs;

  const [activeIndex, setActiveIndex] = useState(0);

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
      {/* Roulette positioned inside the card, floating over the top-left
          of the header. Left is negative so half the orbit sticks out over
          the card's left edge. */}
      <Box
        position="absolute"
        top="80px"
        left="-40px"
        zIndex={40}
      >
        <KammaraRoulette
          items={allItems}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          color={color}
          darkColor={darkColor}
        />
      </Box>

      {/* ── Card body — transparent, relies on watermark + halo + outline */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        borderRadius="32px"
        overflow="hidden"
        css={{
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
              fontSize: '22rem',
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
              The text column stacks: category label, title, active glyph. */}
          <Box
            position="relative"
            flexShrink={0}
            height="180px"
            overflow="visible"
            css={{
              background: `linear-gradient(160deg, ${color}20 0%, ${color}10 50%, ${color}20 100%)`,
              borderBottom: `1px solid ${color}`,
            }}
          >
            {/* Row 1 — subsystem declarer ornament: "— ⊙ —"
                (flow-line + center + flow-line), centered across the top */}
            <Flex
              justify="center"
              align="center"
              gap="sm"
              padding={`0.5rem ${CARD_PADDING_X} 0`}
              aria-label="Subsistema"
              position="relative"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '1rem',
                color: `${color}cc`,
                letterSpacing: '0.3em',
              }}
            >
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
              <span style={{ fontSize: '1.3rem' }}>⊙</span>
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
            </Flex>

            {/* Row 2 — main header grid */}
            <Flex
              align="center"
              paddingTop="0.4rem"
              paddingBottom="0.4rem"
              paddingLeft="0.6rem"
              paddingRight={{ base: '1.2rem', md: CARD_PADDING_X }}
              gap="sm"
              height="calc(100% - 2.5rem)"
            >
              {/* Left column — roulette slot (visual placeholder; the real
                  roulette floats absolutely over this area so interactions
                  don't get clipped). Narrow width leaves more room for the title. */}
              <Box flexShrink={0} width="80px" />

              {/* Vertical divider — gradient line between menu and text */}
              <Box
                flexShrink={0}
                width="1px"
                alignSelf="stretch"
                css={{
                  background: `linear-gradient(180deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
                  boxShadow: `0 0 8px ${color}60`,
                }}
              />

              {/* Right column — subtitle + title + glyph, left-aligned */}
              <Flex direction="column" align="flex-start" gap="xs" flex={1} minW={0}>
                {/* Subtitle (category — already translated by caller) */}
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

                {/* Title — dynamic, changes with the active subsystem.
                    Uses a clamp tied to the card's own size (not viewport)
                    so it doesn't blow up on ultra-wide screens. */}
                <Heading
                  as="h2"
                  fontFamily="body"
                  fontSize={{ base: '1.8rem', md: '2.2rem' }}
                  fontWeight="bold"
                  lineHeight={1}
                  color={color}
                  letterSpacing="heroTitle"
                  textAlign="left"
                  m={0}
                  css={{
                    textShadow: `0 0 24px ${color}40`,
                    wordBreak: 'break-word',
                  }}
                >
                  {activeItem.label.toUpperCase()}
                </Heading>

                {/* Active subsystem glyph — semantic icon for this subsystem */}
                <Box
                  as="span"
                  fontFamily="glyph"
                  fontSize="glyphH2"
                  lineHeight={1}
                  color={color}
                  opacity={0.85}
                  aria-hidden="true"
                >
                  {activeItem.icon}
                </Box>
              </Flex>
            </Flex>
          </Box>

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

          {/* ── Content ────────────────────────── */}
          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            padding="0.8rem 1.8rem 1.2rem"
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
              '& p': { marginBottom: '0.7rem' },
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
            padding="0.4rem 1.5rem"
            css={{
              borderTop: `1px solid ${color}25`,
              background: `linear-gradient(0deg, ${color}10, transparent)`,
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '0.9rem',
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

