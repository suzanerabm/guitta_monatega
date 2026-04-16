'use client';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { GlyphPlanet } from '@/components/GlyphPlanet';

export interface KammaraPlanetTitleProps {
  /** Planet name (displayed as the main heading) */
  name: string;
  /** Short descriptive text shown under the name */
  description: string;
  /** Planet accent color — drives name color and glyph tint */
  color: string;
  /** Declarer variant: "planet" (— ⊙ —) or "universe" (⊹ ⊙ ⊹). Default: planet. */
  declarer?: 'planet' | 'universe';
  'data-testid'?: string;
}

/**
 * KammaraPlanetTitle — Hero-style title block for a Kammara planet.
 *
 * The vertical glyph on the left is a semantic type declarer from the Kalún
 * alphabet: "— ⊙ —" = PLANET, "⊹ ⊙ ⊹" = UNIVERSE (Kammara). It is not
 * decorative; it states what kind of entity the block represents.
 */
export function KammaraPlanetTitle({
  name,
  description,
  color,
  declarer = 'planet',
  'data-testid': testId,
}: KammaraPlanetTitleProps) {
  return (
    <Flex
      data-testid={testId ?? 'kammara-planet-title'}
      align="stretch"
      gap="lg"
      width="100%"
    >
      {/* Semantic declarer: vertical — ⊙ — = PLANET */}
      <Box
        flexShrink={0}
        display="flex"
        alignItems="stretch"
        aria-label={declarer === 'universe' ? 'Universo' : 'Planeta'}
        color={color}
      >
        <GlyphPlanet variant={declarer} stretch color={color} />
      </Box>

      {/* Name + description */}
      <Flex direction="column" justify="center" gap="sm" minW={0} flex={1}>
        <Heading
          as="h1"
          fontFamily="body"
          fontSize="h1"
          fontWeight="bold"
          lineHeight={1}
          color={color}
          letterSpacing="heroTitle"
          m={0}
        >
          {name}
        </Heading>
        <Text
          fontSize="bannerDesc"
          color="textOverlayBright"
          lineHeight={1.5}
          m={0}
        >
          {description}
        </Text>
      </Flex>
    </Flex>
  );
}
