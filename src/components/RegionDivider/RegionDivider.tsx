'use client';
import { Box, Heading, Text } from '@chakra-ui/react';

export interface RegionDividerProps {
  /**
   * Small eyebrow label rendered *above* the region name — used to keep
   * the user oriented about which parent world the region belongs to
   * (e.g. "TRIPLEC" above "MESH"). Optional.
   */
  parent?: string;
  /**
   * Region display name. Rendered uppercase (e.g. "MALLOC").
   * The component applies `textTransform: uppercase`, so pass it as-is
   * — you can send `malloc` / `Malloc` / `MALLOC` and the UI will be
   * consistent.
   */
  name: string;
  /**
   * Kalún crest glyph of the region (e.g. "⊶⊙⊶⊙⊶" for Mesh).
   * Shown as a subtle watermark behind the text AND as the semantic
   * label below the name (replacing the old tagline).
   */
  crestGlyph?: string;
  /**
   * Accent color from the world's palette. Used to tint the gradient
   * background, the bottom/top borders and the tagline text.
   */
  color: string;
  /**
   * Optional background image. When provided, the image is rendered
   * covering the divider with `objectFit: cover`, and the gradient is
   * dimmed so the text stays readable. When omitted, only the gradient
   * is shown (still tinted by `color`).
   */
  image?: string;
  'data-testid'?: string;
}

/**
 * RegionDivider — visual separator between the main content of a kammara
 * world and one of its sub-regions (e.g. triplec → malloc / mesh / sharp).
 *
 * Renders a horizontal band with the region name in a large uppercase
 * heading plus an optional tagline, tinted by the region's accent color.
 * Scales down on mobile. Meant to be dropped between CreatureCard blocks
 * inside a CreatureSection, so it inherits the world's parallax background.
 */
export function RegionDivider({
  parent,
  name,
  crestGlyph,
  color,
  image,
  'data-testid': testId,
}: RegionDividerProps) {
  return (
    <Box
      data-testid={testId ?? 'region-divider'}
      position="relative"
      width="100vw"
      marginLeft="calc(-50vw + 50%)"
      height={{ base: '140px', md: '180px', '2xl': '220px' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      mt={{ base: '2rem', md: '4rem' }}
      mb={{ base: '1rem', md: '2rem' }}
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor={color}
      style={{
        // Soft gradient tinted by the region's accent color. When an image
        // is supplied it sits underneath and this layer becomes the tint.
        background: `linear-gradient(135deg, ${color}22 0%, ${color}44 50%, ${color}22 100%)`,
      }}
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
          <Box
            aria-hidden
            position="absolute"
            inset={0}
            style={{
              background: `linear-gradient(135deg, ${color}55 0%, ${color}33 50%, ${color}55 100%)`,
            }}
          />
        </>
      )}
      {/* Crest glyph watermark — big, subtle, centered behind the name.
          Signals the region's identity without overpowering the heading. */}
      {crestGlyph && (
        <Box
          aria-hidden="true"
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
          fontFamily="glyph"
          lineHeight={1}
          opacity={0.12}
          css={{
            color,
            fontSize: 'clamp(6rem, 18vw, 14rem)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {crestGlyph}
        </Box>
      )}
      <Box
        position="relative"
        zIndex={1}
        textAlign="center"
        padding="0 2rem"
      >
        {parent && (
          <Text
            mb={{ base: '0.3rem', md: '0.5rem' }}
            textStyle="label"
            color="textOverlayDim"
            textShadow="labelText"
          >
            {parent}
          </Text>
        )}
        <Heading
          as="h2"
          fontFamily="body"
          fontSize={{ base: 'clamp(2rem, 7vw, 3rem)', md: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          fontWeight="bold"
          letterSpacing="widest"
          textTransform="uppercase"
          color="white"
          textShadow="labelText"
          lineHeight={1}
          m={0}
        >
          {name}
        </Heading>
        {crestGlyph && (
          <Text
            mt={{ base: '0.5rem', md: '0.8rem' }}
            fontFamily="glyph"
            fontSize={{ base: '1rem', md: '1.2rem' }}
            color="textOverlay"
            textShadow="labelText"
            letterSpacing="0.08em"
          >
            {crestGlyph}
          </Text>
        )}
      </Box>
    </Box>
  );
}
