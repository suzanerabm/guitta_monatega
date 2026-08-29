'use client';
import { Box, Flex, Grid, Heading, Text, chakra } from '@chakra-ui/react';
import { KammaraStatBadge } from '@/components/KammaraStatBadge';

export interface PlanetBadge {
  /** Small uppercase label (e.g. "Habitantes"). */
  label: string;
  /** Value (e.g. "Shal'ún"). */
  value: string;
}

export interface KammaraPlanetCardProps {
  /** World id used by the page filter (e.g. 'lunnp1'). */
  id: string;
  /** Display name (e.g. "LUNN'P1"). */
  name: string;
  /** Intro paragraph — comes from the world's data (getWorldSummary). */
  summary: string;
  /** Background image of the world (cinematic full-bleed). */
  image?: string;
  /** Kalún crest glyph of the world — watermark + declarer. */
  crestGlyph: string;
  /** Accent color (palette.colors[0]). */
  color: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  /** Up to ~4 fact badges (label + value) shown on the right. */
  badges?: PlanetBadge[];
  /** Category label above the name. Defaults to "Planeta". */
  category?: string;
  /** Clicking the card opens this world (the page wires it to the filter). */
  onSelect?: (id: string) => void;
  'data-testid'?: string;
}

const KEYFRAMES = `
@keyframes kpc-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
`;

/**
 * KammaraPlanetCard — a cinematic entry card for a Kammara world. Based on the
 * visual language of KammaraCardSubsystemHorizontal (variant C) but without the
 * roulette: a full-bleed world image, a glowing title block + intro text on the
 * left, fact badges on the right, a holographic shimmer sweep, and the standard
 * Kammara footer. Clicking opens the world via `onSelect` (no per-world routes).
 *
 * Content (name, summary, badges) comes from the world's own data — the card
 * doesn't duplicate copy.
 */
export function KammaraPlanetCard({
  id,
  name,
  summary,
  image,
  crestGlyph,
  color,
  darkColor,
  badges = [],
  category = 'Planeta',
  onSelect,
  'data-testid': testId,
}: KammaraPlanetCardProps) {
  return (
    <chakra.button
      type="button"
      onClick={onSelect ? () => onSelect(id) : undefined}
      aria-label={`Abrir ${name}`}
      data-testid={testId ?? 'kammara-planet-card'}
      position="relative"
      display="block"
      textAlign="left"
      width="100%"
      cursor={onSelect ? 'pointer' : 'default'}
      borderRadius="32px"
      css={{
        border: `1px solid ${color}40`,
        outline: `2px solid ${color}`,
        outlineOffset: '6px',
        boxShadow: `0 20px 60px ${color}50, 0 4px 16px ${color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      _hover={onSelect ? { transform: 'translateY(-4px)', boxShadow: `0 28px 72px ${color}60` } : {}}
    >
      <style>{KEYFRAMES}</style>
      <Box
        position="relative"
        width="100%"
        height={{ base: 'auto', md: '360px' }}
        minHeight={{ base: '440px', md: '360px' }}
        borderRadius="32px"
        overflow="hidden"
      >
        {/* World image fills the card */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Darken layers — keep text legible over any image */}
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{ background: `linear-gradient(90deg, ${darkColor}cc 0%, ${darkColor}88 45%, ${darkColor}33 75%, transparent 100%)` }}
        />
        <Box
          position="absolute"
          inset={0}
          aria-hidden="true"
          css={{ background: `linear-gradient(180deg, ${darkColor}55 0%, transparent 45%, transparent 55%, ${darkColor}55 100%)` }}
        />

        {/* Holographic shimmer sweeping across (from KammaraPlanetTitle) */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width="30%"
          height="100%"
          pointerEvents="none"
          aria-hidden="true"
          zIndex={1}
          css={{
            background: `linear-gradient(115deg, transparent 40%, ${color}1a 50%, transparent 60%)`,
            animation: 'kpc-shimmer 8s ease-in-out infinite',
            willChange: 'transform',
            mixBlendMode: 'screen',
          }}
        />

        {/* Giant crest watermark behind the title */}
        <Box
          position="absolute"
          top="1.5rem"
          left="1.5rem"
          aria-hidden="true"
          pointerEvents="none"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '6rem',
            lineHeight: 1,
            color: `${color}33`,
            userSelect: 'none',
            textShadow: `0 0 30px ${color}22`,
            letterSpacing: '0.1em',
          }}
        >
          {crestGlyph}
        </Box>

        {/* ── Left: title block + intro text ──
            Mobile (base/sm): normal flow so text + badges stack, never overlap.
            md+: absolute, anchored top-left, 40% wide (the cinematic layout). */}
        <Flex
          position={{ base: 'relative', md: 'absolute' }}
          top={{ md: '3rem' }}
          left={{ md: '2.8rem' }}
          direction="column"
          maxW={{ base: '100%', md: '40%' }}
          padding={{ base: '2.4rem 1.4rem 0', md: 0 }}
          zIndex={3}
        >
          <Text
            fontSize="xs"
            letterSpacing="hero"
            textTransform="uppercase"
            fontWeight="bold"
            color={color}
            m={0}
            css={{ textShadow: `0 2px 10px ${color}, 0 0 20px ${color}88` }}
          >
            {category.toUpperCase()}
          </Text>
          <Heading
            as="h2"
            textStyle="heading"
            fontSize={{ base: '2.2rem', md: '2.8rem' }}
            lineHeight={1}
            letterSpacing="heroTitle"
            color="textOverlayBright"
            m={0}
            mt="2px"
            css={{ textShadow: `0 0 38px ${color}, 0 0 16px ${color}, 0 2px 12px rgba(0,0,0,0.6)` }}
          >
            {name}
          </Heading>

          {/* Declarer — single glyph */}
          <Flex
            align="center"
            gap="sm"
            width="220px"
            my="1rem"
            aria-hidden="true"
            css={{
              fontFamily: 'var(--chakra-fonts-glyph)',
              color: color,
              letterSpacing: '0.3em',
              textShadow: `0 0 12px ${color}`,
            }}
          >
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, ${color}, transparent)`, boxShadow: `0 0 8px ${color}` }} />
            <span style={{ fontSize: '1.3rem' }}>⊙</span>
            <Box flex={1} height="1px" css={{ background: `linear-gradient(90deg, transparent, ${color})`, boxShadow: `0 0 8px ${color}` }} />
          </Flex>

          {/* Intro text — from the world's data, plain over the image */}
          <Text
            m={0}
            fontSize={{ base: 'sm', md: 'base' }}
            fontWeight="light"
            lineHeight={1.7}
            color="textOverlayBright"
            css={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
          >
            {summary}
          </Text>
        </Flex>

        {/* ── Right: fact badges ──
            Mobile: normal flow, stacked below the text. md+: absolute right,
            vertically centered (the cinematic layout). */}
        {badges.length > 0 && (
          <Grid
            position={{ base: 'relative', md: 'absolute' }}
            top={{ md: '50%' }}
            right={{ md: '2.5rem' }}
            transform={{ md: 'translateY(-50%)' }}
            // Mobile: 2 columns side-by-side so the card stays short. md+: a
            // single vertical column (the cinematic right rail).
            gridTemplateColumns={{ base: '1fr 1fr', md: '1fr' }}
            gap="sm"
            zIndex={3}
            minW={{ base: 'auto', md: '140px' }}
            padding={{ base: '1.4rem 1.4rem 3rem', md: 0 }}
            alignSelf="flex-start"
          >
            {badges.map((b, i) => (
              <KammaraStatBadge
                key={`${b.label}-${i}`}
                label={b.label}
                value={b.value}
                color={color}
                darkColor={darkColor}
              />
            ))}
          </Grid>
        )}

        {/* ── Footer — same recipe as KammaraCardSubsystemHorizontal: glyph
            font + 0.3em tracking on the whole bar, muted text color. ── */}
        <Flex
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          justify="space-between"
          align="center"
          padding="0.4rem 1.5rem"
          zIndex={3}
          color="bannerLabel"
          css={{
            borderTop: `1px solid ${color}40`,
            background: `linear-gradient(0deg, ${darkColor}dd, ${darkColor}66)`,
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '0.9rem',
            letterSpacing: '0.3em',
          }}
        >
          <span aria-label="Kammara">⊹ ⊙ ⊹</span>
          <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color="bannerLabel" m={0}>
            Kammara
          </Text>
        </Flex>
      </Box>
    </chakra.button>
  );
}
