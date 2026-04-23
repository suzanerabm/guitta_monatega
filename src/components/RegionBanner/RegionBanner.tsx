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
  /**
   * Optional side column rendered to the right of the left panel
   * (on md+). Mirrors the `stripSide` slot of DSMainCard — used to host
   * a SceneStrip / scene collage next to the region card.
   */
  children?: ReactNode;
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
  children,
  'data-testid': testId,
}: RegionBannerProps) {
  return (
    <Box
      data-testid={testId ?? 'region-banner'}
      position="relative"
      zIndex={5}
      width={{ base: '100%', md: '100vw' }}
      marginLeft={{ base: '0', md: 'calc(-50vw + 50%)' }}
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
        height={{ base: '60vh', md: 'calc(100% - 3rem)' }}
        maxHeight={{ base: '520px', md: 'none' }}
        left={{ md: '2rem', xl: '3rem' }}
        top={{ md: '50%' }}
        width={{ md: '60%', lg: '50%', xl: '50%', '2xl': '50%' }}
        transform={{ md: 'translateY(-50%)' }}
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
      {/* Side column (right) — starts right after the left panel and
          stretches to the right edge so the SceneStrip takes all the remaining
          space. On mobile stacks below the panel. */}
      {children && (
        <Box
          position={{ base: 'relative', md: 'absolute' }}
          zIndex={2}
          mt={{ base: '4rem', md: 0 }}
          // left = painelLeft + painelWidth + gap(1rem)
          //   md  : 2rem + 60% + 1rem   → calc(60% + 3rem)
          //   lg  : 2rem + 50% + 1rem   → calc(50% + 3rem)
          //   xl  : 3rem + 50% + 1rem   → calc(50% + 4rem)
          left={{
            md: 'calc(60% + 3rem)',
            lg: 'calc(50% + 3rem)',
            xl: 'calc(50% + 4rem)',
          }}
          right={{ md: '2rem', xl: '3rem' }}
          top={{ md: '50%' }}
          height={{ md: 'calc(100% - 3rem)' }}
          transform={{ md: 'translateY(-50%)' }}
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          padding={{ base: '1rem 25px 1.5rem', md: 0 }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
