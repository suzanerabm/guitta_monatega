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
  /**
   * Title shown pinned at the top of the DSTextPanel — it stays fixed
   * while the body text scrolls below. When omitted, fall back to the
   * legacy behavior (caller puts `<h2>` inside `text`).
   */
  textPanelTitle?: string;
  glyphVariant?: 'planet' | 'universe';
  text?: ReactNode;
  /**
   * Custom renderer for the left-side panel. When provided, replaces the
   * default DSTextPanel. Receives the DSMainCard color/text props so the
   * custom panel can stay in sync with the host card's theme.
   * If omitted, falls back to DSTextPanel with the legacy behavior.
   */
  renderPanel?: (ctx: {
    titleColor?: string;
    subtitleColor?: string;
    textColor?: string;
    title?: string;
    glyphVariant?: 'planet' | 'universe';
    stripSide?: boolean;
    text?: ReactNode;
  }) => ReactNode;
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
  textPanelTitle,
  glyphVariant,
  text,
  renderPanel,
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
        opacity={0.3}
        background={gradient}
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
          zIndex={40}
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
                  // Desktop (>=768px): narrow panel anchored to the left,
                  // taking ~20% of the banner width. The character/scene
                  // strip on the right gets the remaining space.
                  '@media (min-width: 48em)': {
                    position: 'absolute',
                    left: '2rem',
                    right: 'auto',
                    top: '50%',
                    bottom: 'auto',
                    width: '60%',
                    maxWidth: '680px',
                    height: 'calc(100% - 100px)',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    marginTop: 0,
                  },
                  // lg (992–1280px): narrower panel
                  '@media (min-width: 62em) and (max-width: 80em)': {
                    width: '45%',
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
          {renderPanel ? (
            renderPanel({
              title: textPanelTitle,
              titleColor,
              subtitleColor,
              textColor,
              glyphVariant,
              stripSide,
              text,
            })
          ) : (
            <DSTextPanel
              title={textPanelTitle}
              titleColor={titleColor}
              subtitleColor={subtitleColor}
              textColor={textColor}
              fillParent={stripSide}
              showGlyph={stripSide}
              glyphVariant={glyphVariant}
            >
              {text}
            </DSTextPanel>
          )}
        </Box>
      )}

      {/* Default slot — strip */}
      {children &&
        (stripSide ? (
          <Box
            data-testid="ds-strip-side"
            zIndex={2}
            css={{
              // Mobile: content flow under the text-wrap
              position: 'relative',
              right: 'auto',
              top: 'auto',
              bottom: 'auto',
              transform: 'none',
              width: '100%',
              marginTop: '1rem',
              // Desktop: absolute positioned to the right of the card,
              // pinned top and bottom with 20px gutters (matches the text
              // panel) so the slot hosts a vertical flex column. Multiple
              // children passed as a fragment are stacked here — each
              // direct child shares the available height evenly and is
              // allowed to shrink (minHeight: 0) so internal scrolls work.
              display: 'flex',
              flexDirection: 'column',
              '@media (min-width: 48em)': {
                position: 'absolute',
                left: 'min(calc(60% + 2rem + 10px), calc(680px + 2rem + 10px))',
                right: '0',
                top: '50%',
                bottom: 'auto',
                height: 'calc(100% - 100px)',
                transform: 'translateY(-50%)',
                width: 'auto',
                marginTop: 0,
                gap: '20px',
                justifyContent: 'center',
                '& > *': { flex: '0 0 auto', minHeight: 0, width: '100%' },
              },
              // md (768–992px): reduce strip height
              '@media (min-width: 48em) and (max-width: 62em)': {
                height: 'calc(100% - 40px)',
                gap: '10px',
              },
              // lg (992–1280px): strip starts after the narrower 45% panel
              '@media (min-width: 62em) and (max-width: 80em)': {
                left: 'calc(45% + 2rem + 10px)',
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
