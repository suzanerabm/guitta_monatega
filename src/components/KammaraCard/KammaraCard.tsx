'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

export interface KammaraCardTab {
  id: string;
  icon: string;
  label: string;
  title: string;
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
  subtitle?: string;
  defaultContent: ReactNode;
  tabs?: KammaraCardTab[];
  stats?: KammaraCardStat[];
  rarity?: number;
  crestGlyph?: string;
  color: string;
  darkColor: string;
  midColor?: string;
  theme?: 'light' | 'dark';
  'data-testid'?: string;
}

export function KammaraCard({
  name,
  category,
  subtitle,
  defaultContent,
  tabs = [],
  stats = [],
  rarity = 0,
  crestGlyph = '⊙',
  color,
  darkColor,
  midColor,
  theme = 'dark',
  'data-testid': testId,
}: KammaraCardProps) {
  const allItems = [
    { id: null as string | null, icon: crestGlyph, label: category, title: name, content: defaultContent },
    ...tabs.map((t) => ({ id: t.id as string | null, icon: t.icon, label: t.label, title: t.title, content: t.content })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(true);

  const activeItem = allItems[activeIndex];
  const isHome = activeIndex === 0;

  const isLight = theme === 'light';
  const textColor = isLight ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.92)';
  const mutedText = isLight ? 'rgba(20,20,30,0.55)' : 'rgba(255,255,255,0.6)';
  const body = midColor ?? darkColor;

  const handleSelect = (index: number) => {
    if (index === activeIndex) {
      return;
    }
    if (index === 0) {
      setGateOpen(false);
      setTimeout(() => setActiveIndex(0), 300);
    } else {
      setGateOpen(false);
      setTimeout(() => {
        setActiveIndex(index);
        setGateOpen(true);
      }, 200);
    }
  };

  const toggleRoulette = () => setRouletteOpen((v) => !v);

  const totalItems = allItems.length;

  // Generate float keyframes for each circle orbiting around center
  const r = 50;
  const floatKeyframes = allItems.map((_, i) => {
    const offsetFromActive = ((i - activeIndex) % totalItems + totalItems) % totalItems;
    const angle = (offsetFromActive / totalItems) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return `@keyframes kcFloat${i} {
      0%, 100% { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateY(0); }
      50% { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateY(-3px); }
    }`;
  }).join('\n');

  return (
    <>
    <style>{floatKeyframes}</style>
    <Box
      data-testid={testId ?? 'kammara-card'}
      position="relative"
      width="100%"
      height="100%"
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
            {/* Banner watermark */}
            <Flex
              position="absolute"
              inset={0}
              justify="space-between"
              align="center"
              padding="0 1.5rem"
              pointerEvents="none"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                color: `${color}12`,
                fontSize: '5rem',
                lineHeight: 1,
                overflow: 'hidden',
              }}
            >
              <span>⊶</span>
              <span style={{ fontSize: '8rem' }}>{crestGlyph}</span>
              <span>⊷</span>
            </Flex>

            {/* Top ornament */}
            <Flex
              justify="center"
              align="center"
              gap="0.5rem"
              padding="0.5rem 1rem 0"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '1rem',
                color: `${color}cc`,
                letterSpacing: '0.3em',
              }}
            >
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
              <span style={{ fontSize: '0.7rem' }}>⊶</span>
              <span style={{ fontSize: '0.6rem' }}>•</span>
              <span style={{ fontSize: '1.3rem' }}>{crestGlyph}</span>
              <span style={{ fontSize: '0.6rem' }}>•</span>
              <span style={{ fontSize: '0.7rem' }}>⊷</span>
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
            </Flex>

            {/* Category + rarity */}
            <Flex justify="center" align="center" gap="0.5rem" padding="0.3rem 1.8rem">
              <Text
                fontSize="0.6rem"
                letterSpacing="0.35em"
                textTransform="uppercase"
                fontWeight={600}
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
              fontSize={{ base: '2rem', md: '2.6rem' }}
              fontWeight={800}
              lineHeight={1}
              color={color}
              letterSpacing="-0.02em"
              textAlign="center"
              m={0}
              padding="0.2rem 1.5rem"
              position="relative"
            >
              {name}
            </Heading>

            {subtitle && (
              <Text
                fontSize="0.65rem"
                color={mutedText}
                textAlign="center"
                m={0}
                mt="0.15rem"
                letterSpacing="0.15em"
              >
                {subtitle}
              </Text>
            )}

            {/* Bottom ornament */}
            <Flex
              justify="center"
              align="center"
              gap="0.4rem"
              padding="0.4rem 1rem 0.6rem"
              css={{
                fontFamily: 'var(--chakra-fonts-glyph)',
                fontSize: '0.7rem',
                color: `${color}99`,
              }}
            >
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color}60)` }} />
              <span>—</span>
              <span style={{ fontSize: '0.5rem' }}>⊹</span>
              <span>—</span>
              <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
            </Flex>
          </Box>

          {/* Divider */}
          <Box height="1px" flexShrink={0} css={{ background: `${color}60` }} />

          {/* ── Roulette menu (floating over card) ───── */}
          <Box
            position="absolute"
            top="50%"
            left="0"
            transform="translateY(-50%)"
            zIndex={40}
            overflow="visible"
            pointerEvents="none"
          >
            {/* Roulette — circular orbit */}
            <Box
              position="relative"
              width="140px"
              height="140px"
              css={{
                opacity: rouletteOpen ? 1 : 0,
                transform: rouletteOpen ? 'scale(1) translateX(-30%)' : 'scale(0.3) translateX(-30%)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: rouletteOpen ? 'auto' : 'none',
              }}
            >
              {allItems.map((item, i) => {
                const isActive = i === activeIndex;
                const offsetFromActive = ((i - activeIndex) % totalItems + totalItems) % totalItems;
                const angle = (offsetFromActive / totalItems) * 2 * Math.PI - Math.PI / 2;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                const delay = `${i * -0.4}s`;

                return (
                  <Box
                    key={item.id ?? 'home'}
                    as="button"
                    aria-label={item.label || item.title}
                    title={item.label || item.title}
                    onClick={() => handleSelect(i)}
                    position="absolute"
                    top="50%"
                    left="50%"
                    width="44px"
                    height="44px"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    zIndex={isActive ? 30 : 25}
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      animation: `kcFloat${i} 3s ease-in-out infinite ${delay}`,
                    }}
                    css={{
                      transition: 'border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                      fontFamily: 'var(--chakra-fonts-glyph)',
                      fontSize: '1.2rem',
                      lineHeight: 1,
                      border: isActive ? `2px solid ${color}` : `1px solid ${color}50`,
                      background: isActive
                        ? `radial-gradient(circle at 30% 30%, ${color}80, ${color}30 60%, ${darkColor})`
                        : `${darkColor}dd`,
                      color: isActive ? '#fff' : `${color}aa`,
                      boxShadow: isActive
                        ? `0 0 20px ${color}80, inset 0 1px 0 rgba(255,255,255,0.25)`
                        : `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                      '&:hover': {
                        borderColor: color,
                        boxShadow: `0 0 16px ${color}60`,
                        color: '#fff',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                );
              })}
            </Box>

            {/* Collapsed state — only active circle visible */}
            {!rouletteOpen && (
              <Box
                as="button"
                width="44px"
                height="44px"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                zIndex={30}
                onClick={toggleRoulette}
                css={{
                  fontFamily: 'var(--chakra-fonts-glyph)',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                  border: `2px solid ${color}`,
                  background: `radial-gradient(circle at 30% 30%, ${color}80, ${color}30 60%, ${darkColor})`,
                  color: '#fff',
                  boxShadow: `0 0 20px ${color}80, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  animation: 'kcFloat0 3s ease-in-out infinite',
                  pointerEvents: 'auto',
                  '&:hover': {
                    boxShadow: `0 0 28px ${color}aa`,
                  },
                }}
              >
                {activeItem.icon}
              </Box>
            )}
          </Box>

          {/* ── Body content (full width) ── */}
          <Flex direction="column" flex={1} minW={0} minH={0}>

          {/* ── Gate overlay (descends when subsystem selected) ── */}
          {!isHome && (
            <Box
              position="relative"
              flexShrink={0}
              overflow="hidden"
              css={{
                maxHeight: gateOpen ? '60px' : '0px',
                opacity: gateOpen ? 1 : 0,
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
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
                gap="0.6rem"
                padding="0.8rem 1.8rem"
                position="relative"
              >
                <Box
                  width="30px"
                  height="30px"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  css={{
                    border: `1.5px solid ${color}`,
                    background: `radial-gradient(circle at 30% 30%, ${color}50, ${color}15 60%, transparent)`,
                    boxShadow: `0 0 10px ${color}50`,
                    fontFamily: 'var(--chakra-fonts-glyph)',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    color: color,
                  }}
                >
                  {activeItem.icon}
                </Box>
                <Text
                  fontSize="0.65rem"
                  letterSpacing="0.25em"
                  textTransform="uppercase"
                  fontWeight={600}
                  color={color}
                  m={0}
                >
                  {activeItem.label}
                </Text>
              </Flex>
            </Box>
          )}

          {/* Stats bar */}
          {stats.length > 0 && isHome && (
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
                  <Flex align="center" gap="0.3rem">
                    <Box
                      as="span"
                      css={{
                        fontFamily: 'var(--chakra-fonts-glyph)',
                        fontSize: '0.75rem',
                        color: color,
                        lineHeight: 1,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Text fontSize="0.5rem" letterSpacing="0.2em" textTransform="uppercase" color={color} m={0} opacity={0.8}>
                      {stat.label}
                    </Text>
                  </Flex>
                  <Text fontSize="0.8rem" fontWeight={600} color={textColor} m={0} lineHeight={1.1}>
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
            <span>⊹ ⊙ ⊹</span>
            <Text fontSize="0.55rem" letterSpacing="0.3em" textTransform="uppercase" color={mutedText} m={0}>
              Kammara
            </Text>
          </Flex>
            </Flex>{/* close body content */}
        </Flex>
      </Box>
    </Box>
    </>
  );
}

