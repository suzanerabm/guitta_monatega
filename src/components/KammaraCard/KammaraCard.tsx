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
  /** Rarity stars (1-5) */
  rarity?: number;
  /** Central glyph shown as a crest in the header */
  crestGlyph?: string;
  /** Palette main color */
  color: string;
  /** Palette body dark color */
  darkColor: string;
  /** Secondary body color for depth */
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = tabs.find((t) => t.id === activeId) ?? null;

  const isLight = theme === 'light';
  const textColor = isLight ? 'rgba(20,20,30,0.9)' : 'rgba(255,255,255,0.92)';
  const mutedText = isLight ? 'rgba(20,20,30,0.55)' : 'rgba(255,255,255,0.6)';

  const displayTitle = active?.title ?? name;
  const displayCategory = active?.label.toUpperCase() ?? category.toUpperCase();
  const body = midColor ?? darkColor;

  return (
    <Box
      data-testid={testId ?? 'kammara-card'}
      position="relative"
      width="100%"
      height="100%"
      borderRadius="32px"
      overflow="hidden"
      css={{
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${color}40`,
        outline: `2px solid ${color}`,
        outlineOffset: '6px',
        boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      {/* ── Background glyph layer — faint decorative glyphs ─────── */}
      <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
        {/* Big crest glyph watermark — center-back */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '22rem',
            lineHeight: 1,
            color: `${color}08`,
            fontWeight: 400,
            userSelect: 'none',
          }}
        >
          {crestGlyph}
        </Box>

        {/* Scattered small glyphs */}
        <ScatteredGlyph top="8%" right="14%" size="0.8rem" color={color} glyph="⊶" opacity={0.25} />
        <ScatteredGlyph bottom="12%" left="18%" size="0.7rem" color={color} glyph="⊷" opacity={0.2} />
        <ScatteredGlyph top="22%" left="10%" size="0.5rem" color={color} glyph="•" opacity={0.35} />
        <ScatteredGlyph bottom="28%" right="18%" size="0.55rem" color={color} glyph="•" opacity={0.3} />
        <ScatteredGlyph top="35%" right="8%" size="0.6rem" color={color} glyph="⊹" opacity={0.22} />
        <ScatteredGlyph bottom="38%" left="8%" size="0.65rem" color={color} glyph="⋄" opacity={0.2} />
      </Box>

      {/* ── Color halo gradient ───────────────────────────────── */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{
          background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${color}35, transparent 70%)`,
        }}
      />

      {/* Card layout */}
      <Flex
        position="relative"
        direction="column"
        width="100%"
        height="100%"
      >
        {/* ── Title banner — game-style elaborate header ────── */}
        <Box
          position="relative"
          flexShrink={0}
          overflow="hidden"
          css={{
            background: `linear-gradient(160deg, ${color}20 0%, ${color}10 50%, ${color}20 100%)`,
            borderBottom: `1px solid ${color}`,
          }}
        >
          {/* Background image slot (if provided via bgImage prop) */}
          {/* Banner glyph pattern — large decorative watermark */}
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

          {/* Top ornament line */}
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
          <Flex
            position="relative"
            justify="center"
            align="center"
            gap="0.5rem"
            padding="0.3rem 1.8rem"
          >
            <Text
              fontSize="0.6rem"
              letterSpacing="0.35em"
              textTransform="uppercase"
              fontWeight={600}
              color={color}
              m={0}
              opacity={0.9}
            >
              {displayCategory}
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

          {/* Name — big and bold, centered */}
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
            {displayTitle}
          </Heading>

          {subtitle && !active && (
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

          {/* Bottom ornament line */}
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

        {/* Divider under title */}
        <Box
          height="1px"
          flexShrink={0}
          mb="0.4rem"
          css={{ background: `${color}60` }}
        />

        {/* Stats bar */}
        {stats.length > 0 && (
          <Flex
            flexShrink={0}
            padding="0.6rem 1.8rem"
            gap="0.5rem"
            flexWrap="wrap"
          >
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
                  <Text
                    fontSize="0.5rem"
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                    color={color}
                    m={0}
                    opacity={0.8}
                  >
                    {stat.label}
                  </Text>
                </Flex>
                <Text
                  fontSize="0.8rem"
                  fontWeight={600}
                  color={textColor}
                  m={0}
                  lineHeight={1.1}
                >
                  {stat.value}
                </Text>
              </Flex>
            ))}
          </Flex>
        )}

        {/* ── Body: catalogue-style side tabs + content ─────── */}
        <Flex direction="row" flex={1} minH={0} position="relative">
          {/* ── Catalogue tab rail (left) ─────────────── */}
          <Flex
            direction="column"
            align="flex-end"
            justifyContent="flex-start"
            gap="0"
            width="42px"
            flexShrink={0}
            position="relative"
            mt="-1px"
          >
            {/* Home tab */}
            <CatalogueTab
              icon={crestGlyph}
              label=""
              active={activeId === null}
              color={color}
              darkColor={darkColor}
              isLight={isLight}
              onClick={() => setActiveId(null)}
            />
            {/* Subsystem tabs */}
            {tabs.map((tab) => (
              <CatalogueTab
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeId === tab.id}
                color={color}
                darkColor={darkColor}
                isLight={isLight}
                onClick={() => setActiveId(tab.id)}
              />
            ))}
          </Flex>

          {/* ── Content + footer ──────────────────────── */}
          <Flex direction="column" flex={1} minW={0} minH={0} css={{ borderLeft: `1px solid ${color}30` }}>
            {/* Content */}
            <Box
              flex={1}
              minH={0}
              overflowY="auto"
              padding="0.8rem 1.6rem 0.8rem 1.2rem"
              css={{
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
              {active?.content ?? defaultContent}
            </Box>

            {/* Footer — only in the body area */}
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
              <Text
                fontSize="0.55rem"
                letterSpacing="0.3em"
                textTransform="uppercase"
                color={mutedText}
                m={0}
              >
                Kammara
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

// ─────────────────────────────────────────────
function ScatteredGlyph({
  top,
  bottom,
  left,
  right,
  size,
  color,
  glyph,
  opacity,
}: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: string;
  color: string;
  glyph: string;
  opacity: number;
}) {
  return (
    <Box
      position="absolute"
      top={top}
      bottom={bottom}
      left={left}
      right={right}
      css={{
        fontFamily: 'var(--chakra-fonts-glyph)',
        fontSize: size,
        color: color,
        opacity: opacity,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {glyph}
    </Box>
  );
}

interface CatalogueTabProps {
  icon: string;
  label: string;
  active: boolean;
  color: string;
  darkColor: string;
  isLight: boolean;
  onClick: () => void;
}

function CatalogueTab({ icon, label, active, color, darkColor, onClick }: CatalogueTabProps) {
  return (
    <Box
      as="button"
      aria-label={label || icon}
      title={label || icon}
      onClick={onClick}
      position="relative"
      display="flex"
      alignItems="center"
      cursor="pointer"
      transition="all 0.3s ease"
      my="1px"
      css={{
        width: active ? '100%' : '34px',
        height: active ? '80px' : '34px',
        borderRadius: active ? '12px 0 0 12px' : '50%',
        marginLeft: active ? '0' : '4px',
        padding: active ? '0.6rem 0.6rem' : '0',
        justifyContent: active ? 'center' : 'center',
        flexDirection: active ? 'column' : 'row',
        gap: active ? '0.3rem' : '0',
        fontFamily: 'var(--chakra-fonts-body)',
        border: active ? `1px solid ${color}25` : `1px solid ${color}40`,
        borderRight: active ? 'none' : `1px solid ${color}40`,
        background: active
          ? `linear-gradient(90deg, ${color}30, ${darkColor})`
          : 'transparent',
        color: active ? color : `${color}90`,
        boxShadow: active
          ? `4px 0 16px ${color}40, inset 0 1px 0 rgba(255,255,255,0.15)`
          : 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        '&:hover': {
          borderColor: color,
          background: active ? undefined : `${color}15`,
          transform: active ? 'none' : 'scale(1.1)',
        },
      }}
    >
      {active ? (
        <>
          <Box
            width="36px"
            height="36px"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            css={{
              border: `1.5px solid ${color}`,
              background: `radial-gradient(circle at 30% 30%, ${color}50, ${color}15 60%, transparent)`,
              boxShadow: `0 0 10px ${color}50`,
              fontFamily: 'var(--chakra-fonts-glyph)',
              fontSize: '1.1rem',
              lineHeight: 1,
              color: color,
            }}
          >
            {icon}
          </Box>
          {label && (
            <Text
              fontSize="0.5rem"
              letterSpacing="0.18em"
              textTransform="uppercase"
              fontWeight={600}
              color={color}
              m={0}
              lineHeight={1}
              textAlign="center"
            >
              {label}
            </Text>
          )}
        </>
      ) : (
        <Box
          as="span"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '0.85rem',
            lineHeight: 1,
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
}
