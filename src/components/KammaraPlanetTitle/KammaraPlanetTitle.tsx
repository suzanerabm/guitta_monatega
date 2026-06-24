'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { GlyphPlanet } from '@/components/GlyphPlanet';
import { palettes } from '@/theme/palettes';
import type { PaletteName } from '@/theme/palettes';

export interface KammaraPlanetTitleProps {
  /** Planet name (displayed as the main heading) */
  name: string;
  /** Short descriptive text shown under the name (string or rich nodes) */
  description: ReactNode;
  /** Short uppercase label shown above the name (e.g. "Planeta") */
  category?: string;
  /** Theme palette name — drives all colors (accent, dark base, mid-tone). */
  palette: PaletteName;
  /** Crest glyph used as giant watermark and accent */
  crestGlyph?: string;
  /** Archetype / function of the planet in the Kammara cosmos (e.g. "Imunidade", "Diálogo-Código", "Memória"). Shown as a secondary tag next to the category. */
  role?: string;
  /** Declarer variant: "planet" (— ⊙ —) or "universe" (⊹ ⊙ ⊹). Default: planet. */
  declarer?: 'planet' | 'universe';
  /** Max width of the description column. Default '640px'. The Kammara intro
   *  passes a wider value so its longer text breathes more. */
  descriptionMaxWidth?: string;
  'data-testid'?: string;
}

/**
 * KammaraPlanetTitle — TCG-style hero title block for a Kammara planet.
 *
 * Inspired by the visual language of KammaraCard:
 * - Diagonal gradient background with color halo
 * - Double outline (border + offset outline) for that premium card feel
 * - Giant crestGlyph watermark pulsing softly at the back
 * - Holographic shimmer line sweeping across the top
 * - Vertical Kalún declarer on the left (— ⊙ — = PLANET,  ⊹ ⊙ ⊹ = UNIVERSE)
 * - Kammara signature on the bottom-right as a "collection mark"
 */
export function KammaraPlanetTitle({
  name,
  description,
  category,
  palette,
  crestGlyph = '⊙',
  role,
  declarer = 'planet',
  descriptionMaxWidth = '640px',
  'data-testid': testId,
}: KammaraPlanetTitleProps) {
  const p = palettes[palette];
  // Derive canonical colors from the palette:
  //   color     = primary accent (name, glyph tint, halo)
  //   darkColor = deep base for the gradient background
  //   body      = mid-tone for the gradient middle (palette.colors[4] when present)
  const color = p.colors[0];
  const darkColor = p.dark;
  const body = p.colors[4] ?? darkColor;

  return (
    <>
      <style>{`
        @keyframes kpt-pulse {
          0%, 100% { opacity: 0.22; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.32; transform: translate(-50%, -50%) scale(1.03); }
        }
        @keyframes kpt-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <Box
        data-testid={testId ?? 'kammara-planet-title'}
        position="relative"
        width="100%"
        overflow="hidden"
      >
        {/* Watermark pattern — repeated crest glyph like a stamped paper */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          aria-hidden="true"
          css={{
            backgroundImage: `radial-gradient(circle at center, ${color}0a 1px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
            mixBlendMode: 'screen',
            opacity: 0.4,
          }}
        />

        {/* Giant crest watermark, softly pulsing — the primary "stamp" */}
        <Box
          position="absolute"
          top="50%"
          left="75%"
          pointerEvents="none"
          aria-hidden="true"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '22rem',
            lineHeight: 1,
            color: `${color}40`,
            userSelect: 'none',
            animation: 'kpt-pulse 6s ease-in-out infinite',
            willChange: 'opacity, transform',
          }}
        >
          {crestGlyph}
        </Box>

        {/* Secondary crest echo — mid-left, smaller, offset rotation */}
        <Box
          position="absolute"
          top="30%"
          left="20%"
          pointerEvents="none"
          aria-hidden="true"
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '10rem',
            lineHeight: 1,
            color: `${color}26`,
            userSelect: 'none',
            transform: 'translate(-50%, -50%) rotate(-12deg)',
          }}
        >
          {crestGlyph}
        </Box>

        {/* Color halo from the left (where the declarer anchors the axis) */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          aria-hidden="true"
          css={{
            background: `radial-gradient(ellipse 55% 120% at 10% 50%, ${color}30, transparent 70%)`,
          }}
        />

        {/* Holographic shimmer — a thin diagonal sheen sweeping slowly across the top */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width="30%"
          height="100%"
          pointerEvents="none"
          aria-hidden="true"
          css={{
            background: `linear-gradient(115deg, transparent 40%, ${color}10 50%, transparent 60%)`,
            animation: 'kpt-shimmer 8s ease-in-out infinite',
            willChange: 'transform',
            mixBlendMode: 'screen',
          }}
        />

        {/* Content grid: declarer | body | signature */}
        <Flex
          position="relative"
          align="stretch"
          gap="lg"
          padding="lg"
          minHeight="200px"
        >
          {/* Left: semantic declarer (— ⊙ — = PLANET) */}
          <Box
            flexShrink={0}
            display="flex"
            alignItems="stretch"
            aria-label={declarer === 'universe' ? 'Universo' : 'Planeta'}
            color={color}
          >
            <GlyphPlanet variant={declarer} stretch color={color} />
          </Box>

          {/* Center: category tag + name + description */}
          <Flex direction="column" justify="center" gap="sm" minW={0} flex={1}>
            {/* Category tag + role tag (archetype/function) */}
            {(category || role) && (
              <Flex align="center" gap="sm">
                {category && (
                  <Text
                    fontSize="xs"
                    letterSpacing="hero"
                    textTransform="uppercase"
                    fontWeight="semibold"
                    color={color}
                    m={0}
                    opacity={0.9}
                  >
                    {category}
                  </Text>
                )}
                {category && role && (
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
                )}
                {role && (
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
                )}
              </Flex>
            )}

            {/* Name — hero scale */}
            <Heading
              as="h1"
              fontFamily="body"
              fontSize="h1"
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

            {/* Gradient divider between name and description */}
            <Box
              height="1px"
              width="80px"
              css={{
                background: `linear-gradient(90deg, ${color}, transparent)`,
              }}
            />

            {/* Description — accepts plain string or rich ReactNode (e.g. multiple <p> */}
            <Box
              fontSize="bannerDesc"
              color="textOverlayBright"
              lineHeight={1.6}
              maxWidth={descriptionMaxWidth}
              css={{
                '& p': { margin: 0, marginBottom: '0.5rem' },
                '& p:last-child': { marginBottom: 0 },
              }}
            >
              {description}
            </Box>
          </Flex>

        </Flex>
      </Box>
    </>
  );
}
