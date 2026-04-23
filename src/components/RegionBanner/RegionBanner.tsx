'use client';
import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DSTextPanel } from '@/components/DSTextPanel';

export interface RegionBannerProps {
  /** Region display name, passed to the DSTextPanel as h2. */
  name: string;
  /**
   * Accent color from the region's palette. Used as the DSTextPanel
   * outline color.
   */
  color: string;
  /**
   * Gradient used as the banner background (the dark layer behind the
   * panel). Usually `palette.gradient` of the region.
   */
  gradient: string;
  /**
   * Narrative content rendered inside the DSTextPanel scroll area.
   * Accepts `### Heading` and `## Heading` prefixes which are converted
   * to h3/h2 by the caller before being passed in — the RegionBanner
   * itself doesn't parse anything, it just renders `story` as-is.
   */
  story: ReactNode;
  /**
   * Background image for the banner (behind the gradient). Optional.
   * When provided, it's rendered with `objectFit: cover` at 30% opacity.
   */
  bgImage?: string;
  /**
   * Custom renderer for the left-side panel. When provided, replaces the
   * default DSTextPanel. Receives the region's name, color and story so
   * the custom panel can stay in sync. If omitted, falls back to the
   * legacy DSTextPanel layout.
   */
  renderPanel?: (ctx: {
    name: string;
    color: string;
    story: ReactNode;
  }) => ReactNode;
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
  bgImage,
  renderPanel,
  'data-testid': testId,
}: RegionBannerProps) {
  return (
    <Box
      data-testid={testId ?? 'region-banner'}
      position="relative"
      zIndex={5}
      width="100vw"
      marginLeft="calc(-50vw + 50%)"
      overflow={{ base: 'visible', md: 'hidden' }}
      mt={{ base: '1rem', md: '2rem' }}
      mb={{ base: '1rem', md: '2rem' }}
      minH={{ base: 'auto', md: '400px', lg: '540px', xl: '640px' }}
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
      {/* Text panel — same z-index pattern as DSMainCard: text-wrap at 40,
          strip at 2, so expanded character cards don't cover the panel. */}
      <Box
        position={{ base: 'relative', md: 'absolute' }}
        zIndex={40}
        css={{
          '@media (min-width: 48em)': {
            left: '2rem',
            top: '50%',
            width: '60%',
            maxWidth: '900px',
            height: 'calc(100% - 3rem)',
            transform: 'translateY(-50%)',
          },
          '@media (min-width: 80em)': {
            left: '3rem',
          },
        }}
        padding={{ base: '1.5rem 25px 0', md: 0 }}
        display="flex"
      >
        {renderPanel ? (
          renderPanel({ name, color, story })
        ) : (
          <DSTextPanel
            title={name}
            titleColor={color}
            textColor="white"
            compact
            borderColor={color}
          >
            {story}
          </DSTextPanel>
        )}
      </Box>
    </Box>
  );
}
