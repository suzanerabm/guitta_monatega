'use client';
import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DSTextPanel } from '@/components/DSTextPanel';
import { CharacterStrip } from '@/components/CharacterStrip';
import { SoonPanel } from '@/components/SoonPanel';
import type { Locale } from '@/lib/characters';

export interface RegionBannerCharacter {
  name: string;
  image: string;
}

export interface RegionBannerProps {
  /** Region display name, passed to the DSTextPanel as h2. */
  name: string;
  /**
   * Accent color from the region's palette. Used both as the DSTextPanel
   * outline color and as the CharacterStrip label color.
   */
  color: string;
  /**
   * Gradient used as the banner background (the dark layer behind the
   * panel + strip). Usually `palette.gradient` of the region.
   */
  gradient: string;
  /**
   * Narrative content rendered inside the DSTextPanel scroll area.
   * Accepts `### Heading` and `## Heading` prefixes which are converted
   * to h3/h2 by the caller before being passed in — the RegionBanner
   * itself doesn't parse anything, it just renders `story` as-is.
   */
  story: ReactNode;
  /** Characters shown on the right side strip. May be empty. */
  characters: RegionBannerCharacter[];
  /** i18n context id for the CharacterInfoPanel lookup. */
  contextId: string;
  locale: Locale;
  /** Label shown in the SoonPanel fallback when `characters` is empty. */
  soonLabel: string;
  /**
   * Background image for the banner (behind the gradient). Optional.
   * When provided, it's rendered with `objectFit: cover` at 30% opacity.
   */
  bgImage?: string;
  'data-testid'?: string;
}

/**
 * RegionBanner — compact horizontal banner used by TripleC sub-regions.
 *
 * Unlike DSMainCard, this component is content-driven (no fixed height,
 * no 700px minH), has a simple left-panel + right-strip layout without
 * the Astro-era right:50% + marginRight overrides, and always renders
 * the DSTextPanel in compact mode with the region's accent color as
 * the outline.
 *
 * Reuses DSTextPanel + CharacterStrip + SoonPanel so the visual idiom
 * matches the rest of the Kammara content. The only thing new here is
 * the layout — no new typography, colors or spacing tokens.
 */
export function RegionBanner({
  name,
  color,
  gradient,
  story,
  characters,
  contextId,
  locale,
  soonLabel,
  bgImage,
  'data-testid': testId,
}: RegionBannerProps) {
  return (
    <Box
      data-testid={testId ?? 'region-banner'}
      position="relative"
      width="100vw"
      marginLeft="calc(-50vw + 50%)"
      overflow="hidden"
      mt={{ base: '1rem', md: '2rem' }}
      mb={{ base: '1rem', md: '2rem' }}
    >
      {/* Gradient layer */}
      <Box
        position="absolute"
        inset={0}
        zIndex={0}
        style={{ background: gradient }}
        opacity={0.0}
      />
      {/* Optional bg image layer */}
      {bgImage && (
        <Box position="absolute" inset={0} zIndex={0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
              display: 'block',
            }}
          />
        </Box>
      )}
      {/* Content layer */}
      <Flex
        position="relative"
        zIndex={1}
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        gap={{ base: '1rem', md: '1.5rem' }}
        padding={{ base: '1.5rem 1rem', md: '1.5rem 2rem' }}
      >
        {/* Text panel — fixed width on desktop, full width on mobile.
            A max-height is required so DSTextPanel's internal overflow:auto
            actually kicks in; otherwise long content grows the wrapper and
            the scroll never activates. Panel takes 60% so the character
            strip on the right has enough room to breathe. */}
        <Box
          flex="0 0 auto"
          width={{ base: '100%', md: '60%' }}
          maxWidth={{ base: 'none', md: '900px' }}
          maxHeight={{ base: 'none', md: 'min(70vh, 640px)' }}
          display="flex"
        >
          <DSTextPanel
            title={name}
            titleColor={color}
            textColor="white"
            compact
            borderColor={color}
          >
            {story}
          </DSTextPanel>
        </Box>
        {/* Character strip — flexes to fill the rest */}
        <Box flex="1 1 0" minWidth={0} display="flex" alignItems="center">
          {characters.length > 0 ? (
            <CharacterStrip
              characters={characters}
              gradient={gradient}
              cardSize={260}
              noFloat
              transparent
              labelColor={color}
              speed={100}
              inStripSide
              contextId={contextId}
              locale={locale}
            />
          ) : (
            <SoonPanel label={soonLabel} color={color} />
          )}
        </Box>
      </Flex>
    </Box>
  );
}
