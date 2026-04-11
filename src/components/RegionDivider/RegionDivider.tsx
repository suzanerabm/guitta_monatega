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
   * Short tagline shown below the name (e.g. "instinto e precisão").
   * Optional.
   */
  tagline?: string;
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
  tagline,
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
        {tagline && (
          <Text
            mt={{ base: '0.5rem', md: '0.8rem' }}
            textStyle="label"
            color="textOverlay"
            textShadow="labelText"
          >
            {tagline}
          </Text>
        )}
      </Box>
    </Box>
  );
}
