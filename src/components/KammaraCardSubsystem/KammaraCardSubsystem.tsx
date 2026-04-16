'use client';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { KammaraRoulette, ROULETTE_SPHERE_SIZE, computeOrbitRadius } from '@/components/KammaraRoulette';

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
  name: string;
  category: string;
  subtitle?: string;
  tabs: KammaraCardSubsystemTab[];
  stats?: KammaraCardSubsystemStat[];
  rarity?: number;
  crestGlyph?: string;
  color: string;
  darkColor: string;
  midColor?: string;
  theme?: 'light' | 'dark';
  'data-testid'?: string;
}

export function KammaraCardSubsystem({
  name,
  category,
  subtitle,
  tabs,
  stats = [],
  rarity = 0,
  crestGlyph = '⊙',
  color,
  darkColor,
  midColor,
  theme = 'dark',
  'data-testid': testId,
}: KammaraCardSubsystemProps) {
  const allItems = tabs;

  const [activeIndex, setActiveIndex] = useState(0);
  const [gateOpen, setGateOpen] = useState(true);
  const [rouletteTop, setRouletteTop] = useState<string>('50%');
  const cardRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);

  // Align the roulette's active sphere (at the top of the orbit) with the
  // center of the gate. The active sphere sits at y = -ROULETTE_ORBIT_RADIUS
  // from the roulette's center, so we offset the center downward by that amount.
  useLayoutEffect(() => {
    const measure = () => {
      const card = cardRef.current;
      const gate = gateRef.current;
      if (!card || !gate) return;
      const cardRect = card.getBoundingClientRect();
      const gateRect = gate.getBoundingClientRect();
      const gateCenter = gateRect.top + gateRect.height / 2 - cardRect.top;
      const rouletteCenter = gateCenter + computeOrbitRadius(allItems.length);
      setRouletteTop(`${rouletteCenter}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [gateOpen]);

  const activeItem = allItems[activeIndex];

  const isLight = theme === 'light';
  const textColor = isLight ? 'overlayLightSoft' : 'textOverlayBright';
  const mutedText = isLight ? 'inkSoft' : 'bannerLabel';
  const body = midColor ?? darkColor;

  const handleSelect = (index: number) => {
    if (index === activeIndex) {
      return;
    }
    setGateOpen(false);
    setTimeout(() => {
      setActiveIndex(index);
      setGateOpen(true);
    }, 200);
  };

  return (
    <Box
      ref={cardRef}
      data-testid={testId ?? 'kammara-card-subsystem'}
      position="relative"
      width="100%"
      height="100%"
      borderRadius="32px"
      overflow="visible"
    >
      <KammaraRoulette
        items={allItems}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        color={color}
        darkColor={darkColor}
        cardPaddingX={CARD_PADDING_X}
        top={rouletteTop}
      />

      {/* ── Card body ──────────────────────────────────── */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        borderRadius="32px"
        overflow="hidden"
        css={{
          background: `linear-gradient(160deg, ${darkColor} 0%, ${body} 45%, ${darkColor} 100%)`,
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

            {/* Top ornament — semantic declarer "— ⊙ —" = PLANET
                (flow-line + center + flow-line). The lines frame the
                declarer; the crestGlyph is the planet's identity. */}
            <Flex
              justify="center"
              align="center"
              gap="sm"
              padding="0.5rem 1rem 0"
              aria-label="Planeta"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '1rem',
                color: `${color}cc`,
                letterSpacing: '0.3em',
              }}
            >
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
              <span style={{ fontSize: '1.3rem' }}>{crestGlyph}</span>
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
            </Flex>

            {/* Category + rarity */}
            <Flex justify="center" align="center" gap="sm" padding="0.3rem 1.8rem">
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
              {rarity > 0 && (
                <Flex gap="0.15rem">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      as="span"
                      css={{
                        fontFamily: 'var(--chakra-fonts-glyph)',
                        fontSize: '0.6rem',
                        color: i < rarity ? color : `${color}30`,
                        lineHeight: 1,
                      }}
                    >
                      ⊙
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>

            {/* Name */}
            <Heading
              as="h2"
              fontFamily="body"
              fontSize="h2"
              fontWeight="bold"
              lineHeight={1}
              color={color}
              letterSpacing="heroTitle"
              textAlign="center"
              m={0}
              padding="0.2rem 1.5rem"
              position="relative"
            >
              {name}
            </Heading>

            {subtitle && (
              <Text
                fontSize="xs"
                color={mutedText}
                textAlign="center"
                m={0}
                mt="0.15rem"
                letterSpacing="wide"
              >
                {subtitle}
              </Text>
            )}

            {/* Bottom ornament — "⊹" = ancestral, memory.
                Framed by gradient lines that echo the "—" flow glyph. */}
            <Flex
              justify="center"
              align="center"
              gap="tight"
              padding="0.4rem 1rem 0.6rem"
              aria-hidden="true"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '0.7rem',
                color: `${color}99`,
              }}
            >
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}60)` }} />
              <span>⊹</span>
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
            </Flex>
          </Box>

          {/* Divider */}
          <Box height="1px" flexShrink={0} css={{ background: `${color}60` }} />

          {/* ── Body content (full width) ── */}
          <Flex direction="column" flex={1} minW={0} minH={0}>

          {/* ── Gate overlay (descends when subsystem selected) ── */}
          {(
            <Box
              ref={gateRef}
              position="relative"
              flexShrink={0}
              overflow="hidden"
              css={{
                height: gateOpen ? '60px' : '0px',
                opacity: gateOpen ? 1 : 0,
                transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                background: `linear-gradient(180deg, ${color}20, ${darkColor})`,
                borderBottom: `1px solid ${color}40`,
              }}
            >
              {/* Gate bars — iron gate effect */}
              <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                css={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, ${color}15 8px, ${color}15 9px)`,
                }}
              />
              <Flex
                align="center"
                justify="flex-start"
                height="100%"
                padding={`0 ${CARD_PADDING_X}`}
                paddingLeft={`calc(${CARD_PADDING_X} + ${ROULETTE_SPHERE_SIZE}px + 0.6rem)`}
                position="relative"
              >
                <Text
                  fontSize="xs"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  color={color}
                  m={0}
                >
                  {activeItem.label}
                </Text>
              </Flex>
            </Box>
          )}

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

