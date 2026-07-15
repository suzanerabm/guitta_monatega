'use client';
import { Box, Flex, Text } from '@chakra-ui/react';
import { palettes } from '@/theme/palettes';
import { FairyDust } from '@/components/FairyDust';

export interface PosterHero {
  image: string;
  alt?: string;
  /** Horizontal anchor. `center` is the poster's mid-line. */
  side: 'left' | 'right' | 'center';
  /** Horizontal offset in % of poster width. For `left`/`right` it's the
   *  distance from that edge; for `center` it's the offset from the middle. */
  x: number;
  /** Distance from the bottom, in % of poster height. */
  bottom: number;
  /** Image height, in % of poster height. */
  height: number;
  /** Glow color of the drop-shadow. */
  glow?: string;
  brightness?: number;
  z?: number;
}

export interface PosterInset {
  image: string;
  /** Disc diameter as % of poster width. */
  size: number;
  /** Position in % (from top / right edge). */
  top: number;
  right: number;
  z?: number;
}

export interface KammaraSagaPosterProps {
  /** Background scene (path under /public). */
  background: string;
  /** Circular scene discs (behind the heroes). Defaults to two: ORF-V's
   *  central Fjorks and a LUNN'P1 scene. Pass [] to hide. */
  insets?: PosterInset[];
  /** Heroes to compose. Defaults to the canonical saga line-up. */
  heroes?: PosterHero[];
  /** Floating light orbs (lunkais). Defaults to EruRin's + Lumesha's. */
  lunkais?: Lunkai[];
  title?: string;
  subtitle?: string;
  topLabel?: string;
  /** Footer label (right side, next to the crest glyph). Default "Kammara". */
  footerLabel?: string;
  /** Accent color — defaults to the kammara palette. */
  color?: string;
  /** Dark base color — defaults to the kammara palette. */
  darkColor?: string;
  /** Congela o glow da moldura no pico (sem pulse). Para export estático. */
  frozen?: boolean;
  'data-testid'?: string;
}

// Canonical saga composition. Positions are in % of a 360×540 poster,
// converted from the values dialed in the visual editor. EruRin centers
// the frame as the protagonist; the others fan out around him.
const DEFAULT_HEROES: PosterHero[] = [
  { image: '/imgs/kammara/orfv/1orvian.png', alt: 'Orvian', side: 'left', x: 0.3, bottom: 38.0, height: 39.6, glow: '#5a9ee0', brightness: 0.8, z: 3 },
  { image: '/imgs/kammara/triplec/sharp/SELKA-RIN.png', alt: 'SELKA RIN', side: 'right', x: -2.8, bottom: 18.9, height: 42.4, glow: '#b8a9e8', z: 5 },
  { image: '/imgs/kammara/triplec/mesh/KAEL_TORIN.png', alt: 'KAEL TORIN', side: 'right', x: 17.2, bottom: 33.3, height: 28.9, glow: '#e0b87e', brightness: 0.85, z: 4 },
  { image: '/imgs/kammara/triplec/malloc/Luma_Val.png', alt: 'LUMA VAL', side: 'left', x: -2.2, bottom: 9.6, height: 24.8, glow: '#7ee0c0', z: 5 },
  { image: '/imgs/kammara/lunnp1/LumEsha.png', alt: 'Lumesha', side: 'right', x: 0.8, bottom: 10.9, height: 18.9, glow: '#e07e9e', z: 5 },
  { image: '/imgs/kammara/lunnp1/EruRin_new.png', alt: 'EruRin', side: 'center', x: 1, bottom: 9.3, height: 33.1, glow: '#b8a9e8', z: 7 },
];

// Two scene discs behind the heroes: ORF-V's central Fjorks (bigger, upper
// right) and a LUNN'P1 scene beside it (smaller, slightly lower-left of it).
const DEFAULT_INSETS: PosterInset[] = [
  { image: '/imgs/kammara/orfv/_scenes/1vista_Fjorks_Centrais.jpg', size: 46, top: 5, right: -8, z: 2 },
  { image: '/imgs/kammara/lunnp1/_scenes/EruRin_e_LumEsha_plantando.jpg', size: 30, top: 12, right: 36, z: 1 },
];

// Lunkais — small floating orbs of light (FairyDust clouds) that accompany
// the LUNN'P1 heroes. `left`/`bottom` are % of the poster; `size` is the
// FairyDust speck diameter in px; the orb's footprint is `size*4`% wide.
interface Lunkai { color: string; left: number; bottom: number; size: number; }
const DEFAULT_LUNKAIS: Lunkai[] = [
  { color: '#3df2c0', left: 43, bottom: 36, size: 5.5 }, // EruRin's, teal — bigger, closer to him
  { color: '#ff5ad0', left: 84, bottom: 26, size: 3.5 }, // Lumesha's, magenta — centered on her (right)
];

function heroPosition(h: PosterHero) {
  if (h.side === 'center') {
    return { left: `calc(50% + ${h.x}%)`, transform: 'translateX(-50%)' };
  }
  return h.side === 'left' ? { left: `${h.x}%` } : { right: `${h.x}%` };
}

/**
 * KammaraSagaPoster — movie-poster-style cover for the Kammara universe.
 *
 * A 2:3 portrait that drops into the Universo section's side slot (where the
 * "EM BREVE" placeholder used to live). A cinematic ORF-V backdrop, the saga's
 * heroes cut out in the foreground, and the "KAMMARA · A·S·A·G·A" title.
 *
 * Purely presentational and not clickable. Everything scales proportionally:
 * the frame keeps a fixed aspect-ratio and heroes are positioned in %, so the
 * whole poster shrinks intact on small screens — no per-breakpoint layout.
 */
export function KammaraSagaPoster({
  background,
  insets = DEFAULT_INSETS,
  heroes = DEFAULT_HEROES,
  lunkais = DEFAULT_LUNKAIS,
  title = 'KAMMARA',
  subtitle = 'A · S · A · G · A',
  topLabel = 'UNIVERSO',
  footerLabel = 'Kammara',
  color,
  darkColor,
  frozen = false,
  'data-testid': testId,
}: KammaraSagaPosterProps) {
  const accent = color ?? palettes.kammara.colors[0];
  const dark = darkColor ?? palettes.kammara.dark;

  return (
    <Box
      data-testid={testId ?? 'kammara-saga-poster'}
      position="relative"
      width="100%"
      maxW="420px"
      mx="auto"
      borderRadius="14px"
      overflow="hidden"
      css={{
        aspectRatio: '360 / 540',
        // Animated accent glow on the frame — a slow, subtle breathing pulse.
        // `--ksp-accent` lets the keyframe reference the resolved accent color.
        ['--ksp-accent' as string]: accent,
        boxShadow: frozen
          ? `0 30px 80px rgba(0,0,0,.6), 0 0 0 1px ${accent}, 0 0 70px color-mix(in srgb, ${accent} 45%, transparent)`
          : `0 30px 80px rgba(0,0,0,.6), 0 0 0 1px ${accent}55, 0 0 50px ${accent}33`,
        animation: frozen ? 'none' : 'ksp-pulse 5s ease-in-out infinite',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <style>{`
        @keyframes ksp-pulse {
          0%, 100% { box-shadow: 0 30px 80px rgba(0,0,0,.6), 0 0 0 1px var(--ksp-accent), 0 0 40px color-mix(in srgb, var(--ksp-accent) 20%, transparent); }
          50%      { box-shadow: 0 30px 80px rgba(0,0,0,.6), 0 0 0 1px var(--ksp-accent), 0 0 70px color-mix(in srgb, var(--ksp-accent) 45%, transparent); }
        }
      `}</style>

      {/* Background scene */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={background}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Circular scene discs (behind the heroes) — "planet" insets with a
          soft shadow and accent rim. */}
      {insets.map((inset, i) => (
        <Box
          key={i}
          position="absolute"
          top={`${inset.top}%`}
          right={`${inset.right}%`}
          width={`${inset.size}%`}
          zIndex={inset.z ?? 2}
          pointerEvents="none"
          aria-hidden="true"
          borderRadius="full"
          overflow="hidden"
          css={{
            aspectRatio: '1 / 1',
            boxShadow: `0 12px 40px ${dark}, 0 0 40px ${accent}40, inset 0 0 30px ${dark}aa`,
            border: `1px solid ${accent}40`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={inset.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.92 }}
          />
        </Box>
      ))}

      {/* Mood overlays — vertical darken + center vignette */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        css={{ background: `linear-gradient(180deg, ${dark}77 0%, ${dark}11 30%, ${dark}cc 100%)` }}
      />
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        css={{ background: `radial-gradient(circle at 50% 45%, transparent 45%, ${dark} 97%)` }}
      />

      {/* Top label */}
      <Text
        position="absolute"
        top="3%"
        left={0}
        right={0}
        textAlign="center"
        zIndex={9}
        m={0}
        fontSize="xs"
        letterSpacing="hero"
        textTransform="uppercase"
        color="textOverlayBright"
        opacity={0.85}
      >
        {topLabel}
      </Text>

      {/* Heroes */}
      {heroes.map((h, i) => (
        <Box
          key={i}
          position="absolute"
          zIndex={h.z ?? 1}
          height={`${h.height}%`}
          width="auto"
          css={{ bottom: `${h.bottom}%`, ...heroPosition(h) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={h.image}
            alt={h.alt ?? ''}
            style={{
              height: '100%',
              width: 'auto',
              maxWidth: 'none',
              objectFit: 'contain',
              display: 'block',
              filter: `drop-shadow(0 0 12px ${(h.glow ?? accent)}66) brightness(${h.brightness ?? 1})`,
            }}
          />
        </Box>
      ))}

      {/* Lunkais — floating sparkle orbs beside the LUNN'P1 heroes, reusing
          FairyDust. A small `emit` cloud with a tight falloff reads as one
          glowing orb shedding light specks (teal by EruRin, magenta by Lumesha). */}
      {lunkais.map((l, i) => (
        <Box
          key={`lunkai-${i}`}
          position="absolute"
          zIndex={8}
          pointerEvents="none"
          width={`${l.size * 4}%`}
          css={{ left: `${l.left}%`, bottom: `${l.bottom}%`, aspectRatio: '1 / 1' }}
        >
          <FairyDust
            color={l.color}
            count={9}
            size={l.size}
            duration={3.2}
            intensity={1.6}
            emit={{ origin: { top: 50, left: 50 }, spread: { x: 8, y: -14 }, falloff: 0.82 }}
          />
        </Box>
      ))}

      {/* Floor glow */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="18%"
        zIndex={5}
        pointerEvents="none"
        css={{ background: `linear-gradient(0deg, ${dark}, ${accent}33 60%, transparent)` }}
      />

      {/* Title — big saga wordmark, sits just above the footer */}
      <Box position="absolute" bottom="9%" left={0} right={0} textAlign="center" zIndex={9} pointerEvents="none">
        <Text
          as="span"
          display="block"
          fontFamily="body"
          fontWeight="bold"
          letterSpacing="heroTitle"
          color="textOverlayBright"
          fontSize={{ base: '1.5rem', sm: '1.8rem', lg: '2rem' }}
          css={{ textShadow: `0 0 22px ${accent}, 0 2px 6px ${dark}` }}
        >
          {title}
        </Text>
        <Text
          as="span"
          display="block"
          mt="2xs"
          fontSize="xs"
          letterSpacing="hero"
          color="textOverlayBright"
          opacity={0.85}
        >
          {subtitle}
        </Text>
      </Box>

      {/* Footer — same idiom as the Kammara cards: crest glyph + name,
          with a top hairline and faint gradient. */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        zIndex={9}
        justify="space-between"
        align="center"
        padding="0.4rem 1.1rem"
        color="bannerLabel"
        css={{
          borderTop: `1px solid ${accent}25`,
          background: `linear-gradient(0deg, ${dark}, ${accent}10 60%, transparent)`,
          fontFamily: 'var(--chakra-fonts-glyph)',
          fontSize: '0.85rem',
          letterSpacing: '0.3em',
        }}
      >
        <span aria-label="Kammara">⊹ ⊙ ⊹</span>
        <Text fontSize="xs" letterSpacing="hero" textTransform="uppercase" color="bannerLabel" m={0}>
          {footerLabel}
        </Text>
      </Flex>
    </Box>
  );
}
