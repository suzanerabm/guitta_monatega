'use client';
import { Box, Text, Heading } from '@chakra-ui/react';
import type { Character } from '@/data/characters/types';
import { getLocalizedName, getLocalizedSpecies, getLocalizedBio, type Locale } from '@/lib/characters';

export interface CharacterInfoPanelProps {
  /** Character to display. When null/undefined, the panel is hidden. */
  character: Character | null | undefined;
  /** Active locale for i18n text. */
  locale: Locale;
  /** Optional positioning overrides (absolute positioned by default). */
  top?: string;
  left?: string;
}

/**
 * CharacterInfoPanel — tooltip that appears when hovering a character card
 * in the CharacterStrip. Derived from DSTextPanel visual style (dark
 * translucent bg + backdrop blur + outline) but much simpler and lighter.
 *
 * Renders: name (h2), species (label), bio (paragraph).
 * Hidden when `character` is null.
 */
export function CharacterInfoPanel({
  character,
  locale,
  top,
  left,
}: CharacterInfoPanelProps) {
  if (!character) return null;

  const name = getLocalizedName(character, locale);
  const species = getLocalizedSpecies(character, locale);
  const bio = getLocalizedBio(character, locale);

  return (
    <Box
      position="absolute"
      top={top ?? '0'}
      left={left ?? '50%'}
      transform="translateX(-50%)"
      zIndex={1500}
      pointerEvents="none"
      width={{ base: '200px', md: '260px' }}
      maxW="90vw"
      bg="rgba(0,0,0,0.75)"
      backdropFilter="blur(12px)"
      borderRadius="12px"
      outline="1px solid"
      outlineColor="outlineSoft"
      padding={{ base: '1rem', md: '1.2rem 1.4rem' }}
      opacity={1}
      animation="fadeIn 0.2s ease"
    >
      <Heading
        as="h4"
        fontSize="md"
        fontWeight="bold"
        color="white"
        mb="xs"
        lineHeight={1.2}
      >
        {name}
      </Heading>
      <Text
        textStyle="label"
        color="textOverlayDim"
        mb="sm"
      >
        {species}
      </Text>
      {bio && (
        <Text
          fontSize="sm"
          fontWeight="light"
          color="textOverlay"
          lineHeight={1.5}
        >
          {bio}
        </Text>
      )}
    </Box>
  );
}
