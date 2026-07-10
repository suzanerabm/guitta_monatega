'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// Shared layout constant: the card's horizontal padding.
// The gate label and the roulette position both depend on this value,
// so keep them in sync via this single source of truth.
export const CARD_PADDING_X = '1.8rem';

export interface KammaraCardTab {
  id: string;
  icon: string;
  label: string;
  title: string;
  image?: string;
  imageAlt?: string;
  content: ReactNode;
}

export interface KammaraCardStat {
  icon: string;
  label: string;
  value: string;
}

export interface KammaraCardProps {
  name: string;
  category: string;
  /** Archetype / function in the Kammara cosmos (e.g. "Imunidade", "Diálogo-Código"). Shown as a secondary tag next to the category. */
  role?: string;
  /** Subtitle as traits — short elements separated by · (e.g. "Lar dos Shal'ún · Água · Imunidade"). */
  subtitle?: string;
  tabs: KammaraCardTab[];
  stats?: KammaraCardStat[];
  crestGlyph?: string;
  color: string;
  darkColor: string;
  midColor?: string;
  /** Opacidade (hex, ex. 'b3'=70% | 'e6'=90') do fundo do card. Default 'b3'. */
  cardBgAlpha?: string;
  /** Cor da moldura (border + outline). Default: `color`. */
  borderColor?: string;
  theme?: 'light' | 'dark';
  'data-testid'?: string;
}

export function KammaraCard({
  name,
  category,
  role,
  subtitle,
  tabs,
  stats = [],
  crestGlyph = '⊙',
  color,
  darkColor,
  midColor,
  cardBgAlpha = 'b3',
  borderColor,
  theme = 'dark',
  'data-testid': testId,
}: KammaraCardProps) {
  const allItems = tabs;
  const bd = borderColor ?? color;

  const activeIndex = 0;

  const activeItem = allItems[activeIndex];

  const isLight = theme === 'light';
  const textColor = isLight ? 'overlayLightSoft' : 'textOverlayBright';
  const mutedText = isLight ? 'inkSoft' : 'bannerLabel';
  const body = midColor ?? darkColor;

  return (
    <Box
      data-testid={testId ?? 'kammara-card'}
      position="relative"
      width={{ base: 'calc(100% - 14px)', md: '100%' }}
      mx={{ base: 'auto', md: 0 }}
      height={{ base: '520px', md: '100%' }}
      borderRadius="32px"
      overflow="visible"
    >
      {/* ── Card body ──────────────────────────────────── */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        borderRadius="32px"
        overflow="hidden"
        css={{
          background: `linear-gradient(160deg, ${darkColor}${cardBgAlpha} 0%, ${body}${cardBgAlpha} 45%, ${darkColor}${cardBgAlpha} 100%)`,
          border: `1px solid ${bd}40`,
          outline: `2px solid ${bd}`,
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
          {/* ── Title banner ────────────────────── */}
          <Box
            position="relative"
            flexShrink={0}
            overflow="hidden"
            css={{
              background: `linear-gradient(160deg, ${color}20 0%, ${color}10 50%, ${color}20 100%)`,
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
              {/* Top ornament — semantic declarer "— ⊙ —" = PLANET
                  (flow-line + center + flow-line). The lines frame the
                  declarer; the crestGlyph is the planet's identity. */}
              <Flex
                align="center"
                gap="sm"
                aria-label="Planeta"
                css={{
                  fontFamily: 'var(--chakra-fonts-glyph)',
                  fontSize: '1rem',
                  color: `${color}cc`,
                  letterSpacing: '0.3em',
                }}
              >
                <Box width="28px" height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
                <span style={{ fontSize: '1.3rem' }}>{crestGlyph}</span>
                <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
              </Flex>

              {/* Category + role tag */}
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

              {/* Name — hero scale, left aligned */}
              <Heading
                as="h2"
                fontFamily="body"
                fontSize="h2"
                fontWeight="bold"
                lineHeight={1}
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
              '& p': { marginBottom: '0.7rem' },
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

