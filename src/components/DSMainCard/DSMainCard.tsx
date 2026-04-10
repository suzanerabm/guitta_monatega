import { Box } from '@chakra-ui/react';
import type { ReactNode, CSSProperties } from 'react';
import { DSTextPanel } from '@/components/DSTextPanel';

interface CharacterBreakpoint {
  x?: number;
  y?: number;
  size?: number;
}

export interface Character {
  image: string;
  x: number;
  y: number;
  size: number;
  zIndex?: number;
  mobileY?: number;
  mobileScale?: number;
  /** Override x, y, size at >=768px (mid-desktop, before xl kicks in at 1500px) */
  md?: CharacterBreakpoint;
  /** Override x, y, size at >=1500px */
  xl?: CharacterBreakpoint;
  /** Override x, y, size at >=1920px */
  xxl?: CharacterBreakpoint;
  /** Only show this character from this breakpoint onwards */
  minBreakpoint?: 'md' | 'xl' | 'xxl';
  /** CSS animation string (e.g. 'cardFloat 3s ease-in-out infinite') */
  animation?: string;
}

export interface Mascot {
  image: string;
  size?: number;
  offsetX?: number;
  offsetY?: number;
  mobileScale?: number;
  mobileOffsetY?: number;
}

interface DSMainCardProps {
  characters: Character[];
  gradient?: string;
  height?: string;
  maxHeight?: string;
  titleColor?: string;
  subtitleColor?: string;
  textColor?: string;
  mascot?: Mascot;
  stripSide?: boolean;
  bgOpacity?: number;
  text?: ReactNode;
  children?: ReactNode;
  'data-testid'?: string;
}

export function DSMainCard({
  characters,
  gradient = 'linear-gradient(135deg, var(--chakra-colors-darkBg), var(--chakra-colors-ink))',
  height = '50vh',
  maxHeight = '80vh',
  titleColor,
  subtitleColor,
  textColor,
  mascot,
  stripSide = false,
  bgOpacity = 1,
  text,
  children,
  'data-testid': testId,
}: DSMainCardProps) {
  return (
    <Box
      data-testid={testId}
      data-strip-side={stripSide ? 'true' : undefined}
      position="relative"
      width="100vw"
      marginLeft="calc(-50vw + 50%)"
      height={{ base: 'auto', md: height }}
      maxH={{ base: 'none', md: maxHeight, '2xl': '850px' }}
      // Guarantee enough vertical room for the absolute-positioned text-wrap
      // (top:260px + bottom:4rem + min ~280px panel = ~620px floor) on
      // shallow viewports so the panel never gets squashed.
      minH={{ base: 'auto', md: '700px' }}
      overflow={{ base: 'visible', md: 'hidden' }}
      mt={{ base: '8rem', md: '2.5rem' }}
    >
      {/* Background gradient layer */}
      <Box
        data-testid="ds-card-bg"
        position="absolute"
        inset={0}
        zIndex={0}
        background={gradient}
        opacity={bgOpacity}
      />

      {/* Characters scene */}
      <Box
        position="absolute"
        inset={0}
        zIndex={{ base: 4, md: 1 }}
        height={{ base: '180px', md: 'auto' }}
      >
        {characters.map((c, idx) => {
          const cssVars = {
            '--mobile-y': `${c.mobileY ?? 20}%`,
            '--mobile-scale': String(c.mobileScale ?? 0.4),
          } as CSSProperties;

          // Build responsive overrides via @media
          const mobileScale = c.mobileScale ?? 0.4;
          const mobileSize = Math.round(c.size * mobileScale);
          const breakpointMap = { md: '48em', xl: '94em', xxl: '120em' } as const;
          const mediaOverrides: Record<string, Record<string, string>> = {};

          // If minBreakpoint is set, hide by default and show from that breakpoint
          if (c.minBreakpoint) {
            mediaOverrides.display = 'none' as unknown as Record<string, string>;
            mediaOverrides[`@media (min-width: ${breakpointMap[c.minBreakpoint]})`] = {
              display: 'block',
            };
          } else {
            // Mobile: scale down and reposition (only for always-visible characters)
            mediaOverrides['@media (max-width: 48em)'] = {
              width: `${mobileSize}px`,
              height: `${mobileSize}px`,
              bottom: `${c.mobileY ?? 90}%`,
            };
          }

          if (c.md) {
            const o: Record<string, string> = {};
            if (c.md.size != null) { o.width = `${c.md.size}px`; o.height = `${c.md.size}px`; }
            if (c.md.x != null) o.left = `${c.md.x}%`;
            if (c.md.y != null) o.bottom = `${c.md.y}%`;
            const existing = mediaOverrides['@media (min-width: 48em)'] ?? {};
            mediaOverrides['@media (min-width: 48em)'] = { ...existing, ...o };
          }
          if (c.xl) {
            const o: Record<string, string> = {};
            if (c.xl.size != null) { o.width = `${c.xl.size}px`; o.height = `${c.xl.size}px`; }
            if (c.xl.x != null) o.left = `${c.xl.x}%`;
            if (c.xl.y != null) o.bottom = `${c.xl.y}%`;
            const existing = mediaOverrides['@media (min-width: 94em)'] ?? {};
            mediaOverrides['@media (min-width: 94em)'] = { ...existing, ...o };
          }
          if (c.xxl) {
            const o: Record<string, string> = {};
            if (c.xxl.size != null) { o.width = `${c.xxl.size}px`; o.height = `${c.xxl.size}px`; }
            if (c.xxl.x != null) o.left = `${c.xxl.x}%`;
            if (c.xxl.y != null) o.bottom = `${c.xxl.y}%`;
            const existing = mediaOverrides['@media (min-width: 120em)'] ?? {};
            mediaOverrides['@media (min-width: 120em)'] = { ...existing, ...o };
          }

          return (
            <Box
              key={`char-${idx}`}
              data-testid={`ds-char-${idx}`}
              position="absolute"
              left={`${c.x}%`}
              bottom={`${c.y}%`}
              width={`${c.size}px`}
              height={`${c.size}px`}
              zIndex={c.zIndex || 1}
              transform="translateX(-50%)"
              animation={c.animation}
              style={cssVars}
              css={mediaOverrides}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))',
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Text wrap (panel + optional mascot) */}
      {text && (
        <Box
          data-testid="ds-text-wrap"
          zIndex={3}
          css={
            stripSide
              ? {
                  // Mobile (<=768px): full width content-flow, fixed 350px panel
                  position: 'relative',
                  left: 0,
                  right: 'auto',
                  top: 'auto',
                  bottom: 'auto',
                  width: '100%',
                  maxWidth: 'none',
                  height: '350px',
                  transform: 'none',
                  padding: '0 1rem',
                  marginTop: '10px',
                  // Medium desktop (769px – 1500px): pinned to left:2rem
                  '@media (min-width: 48em)': {
                    position: 'absolute',
                    left: '2rem',
                    right: 'auto',
                    top: '50%',
                    bottom: 'auto',
                    width: '38%',
                    maxWidth: '540px',
                    height: '60%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    marginTop: 0,
                  },
                  // Large desktop (>=1500px): match Astro default — pinned to right:50% with margin-right
                  // Also handles XL since 120em media queries don't generate in conditional css prop
                  '@media (min-width: 94em)': {
                    left: 'auto',
                    right: '50%',
                    marginRight: '12rem',
                    width: '42%',
                    maxWidth: '620px',
                    height: '50%',
                    top: '58%',
                  },
                }
              : {
                  // Mobile content flow
                  position: 'relative',
                  left: 0,
                  top: 'auto',
                  bottom: 'auto',
                  width: '100%',
                  maxWidth: 'none',
                  height: 'auto',
                  padding: '0 2.5rem 1rem',
                  marginTop: '10px',
                  // Desktop default — absolute top + bottom auto-stretches the
                  // height; do NOT set `height` here or it overrides the stretch
                  '@media (min-width: 48em)': {
                    position: 'absolute',
                    left: '5rem',
                    top: '260px',
                    bottom: '4rem',
                    width: '38%',
                    maxWidth: '480px',
                    height: 'unset',
                    padding: 0,
                    marginTop: 0,
                  },
                  // XL screens (>=1920px)
                  '@media (min-width: 120em)': {
                    width: '65%',
                    maxWidth: '680px',
                    top: 'auto',
                    bottom: '5rem',
                    height: '55%',
                  },
                }
          }
        >
          {mascot && (
            <Box
              data-testid="ds-mascot"
              position="absolute"
              zIndex={4}
              width={`${mascot.size || 120}px`}
              height={`${mascot.size || 120}px`}
              right={`${mascot.offsetX ?? 10}%`}
              top={`${mascot.offsetY ?? -40}px`}
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.2))"
              css={{
                '@media (max-width: 48em)': {
                  width: `${Math.round((mascot.size || 120) * (mascot.mobileScale ?? 0.5))}px`,
                  height: `${Math.round((mascot.size || 120) * (mascot.mobileScale ?? 0.5))}px`,
                  right: 'auto',
                  left: '5%',
                  top: `${mascot.mobileOffsetY ?? -30}px`,
                },
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mascot.image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
          <DSTextPanel
            titleColor={titleColor}
            subtitleColor={subtitleColor}
            textColor={textColor}
            fillParent={stripSide}
            kammaraStyle={stripSide}
          >
            {text}
          </DSTextPanel>
        </Box>
      )}

      {/* Default slot — strip */}
      {children &&
        (stripSide ? (
          <Box
            data-testid="ds-strip-side"
            zIndex={2}
            overflow="hidden"
            css={{
              // Mobile: content flow under the text-wrap
              position: 'relative',
              right: 'auto',
              top: 'auto',
              transform: 'none',
              width: '100%',
              marginTop: '1rem',
              // Desktop: absolute positioned to the right of the card,
              // vertically centered — matches Astro .ds-strip-side
              '@media (min-width: 48em)': {
                position: 'absolute',
                right: '2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48%',
                marginTop: 0,
              },
            }}
          >
            {children}
          </Box>
        ) : (
          children
        ))}
    </Box>
  );
}
