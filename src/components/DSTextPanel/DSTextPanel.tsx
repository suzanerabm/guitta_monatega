import { Box, Flex, Heading } from '@chakra-ui/react';
import type { ReactNode, CSSProperties } from 'react';
import { GlyphPlanet } from '@/components/GlyphPlanet';

interface DSTextPanelProps {
  /**
   * Optional heading rendered at the top of the panel, OUTSIDE the
   * scrollable area — so it stays pinned while the body scrolls. When
   * omitted, the caller is expected to provide the heading inside
   * `children` instead.
   */
  title?: string;
  /**
   * Color of the `<h2>` title (the one passed via `title` and any inside
   * `children`). Also used as the outline color unless `borderColor` is
   * explicitly set.
   */
  titleColor?: string;
  /** Color of `<h3>` subtitles inside `children`. Defaults to title color. */
  subtitleColor?: string;
  /** Color of `<p>` body paragraphs inside `children`. */
  textColor?: string;
  children: ReactNode;
  /**
   * When true, the panel fills its parent's height even on mobile.
   * Used by DSMainCard `stripSide` variant where the wrapper has a fixed
   * 350px mobile height and the panel needs to expand inside it.
   */
  fillParent?: boolean;
  /**
   * When true, reduces the internal vertical padding so the panel takes
   * less vertical space. Only affects padding — font sizes, line-heights
   * and spacing between elements stay the same as the default variant.
   */
  compact?: boolean;
  /**
   * Override the outline (border) color. When not provided, the outline
   * uses `titleColor`.
   */
  borderColor?: string;
  showGlyph?: boolean;
  'data-testid'?: string;
}

/**
 * DSTextPanel — the single-panel text block used across Kammara (world
 * banners, region banners) and Bichittos. Visual idiom mirrors the card
 * of `SubSystem`: dark translucent background with backdrop blur, 2px
 * tinted outline offset by 3px, rounded corners, dsPanel shadow, and
 * kammara-style typography inside (h2 2rem bold, h3 as uppercase eyebrow,
 * p as light body).
 *
 * Layout: when `title` is provided, it renders as a fixed heading at the
 * top of the panel (outside the scroll) and `children` fills the rest in
 * a scrollable area — same structure as a SubSystem card. If `title` is
 * omitted the panel becomes a single scroll area containing `children`
 * as-is (legacy behavior).
 */
export function DSTextPanel({
  title,
  titleColor = 'var(--chakra-colors-textOverlayBright)',
  subtitleColor,
  textColor = 'var(--chakra-colors-textOverlay)',
  children,
  fillParent = false,
  compact = false,
  borderColor,
  showGlyph = false,
  'data-testid': testId,
}: DSTextPanelProps) {
  const cssVars = {
    '--ds-title-color': titleColor,
    '--ds-subtitle-color': subtitleColor || titleColor,
    '--ds-text-color': textColor,
  } as CSSProperties;

  return (
    <Box
      data-testid={testId}
      className="ds-text-panel"
      width="100%"
      height="100%"
      borderRadius="16px"
      overflow="hidden"
      bg="rgba(0,0,0,0.3)"
      backdropFilter="blur(8px)"
      outline="2px solid"
      outlineColor={borderColor ?? titleColor}
      outlineOffset="3px"
      boxShadow="dsPanel"
      display="flex"
      flexDirection="column"
      css={{
        // Mobile: collapse to content-driven height (unless fillParent)
        '@media (max-width: 48em)': {
          height: fillParent ? '100%' : 'auto',
        },
      }}
    >
      {title && (
        <Flex
          flexShrink={0}
          align="stretch"
          gap="0.4rem"
          padding={
            compact
              ? { base: '1rem 2rem 0', md: '1.3rem 1.5rem 0', '2xl': '1.5rem 2rem 0' }
              : { base: '1.5rem 2rem 0', md: '2rem 1.5rem 0', '2xl': '2.5rem 2rem 0' }
          }
          marginBottom={{ base: '0.5rem', md: '0.8rem' }}
        >
          {showGlyph && (
            <Box display="flex" alignItems="center" flexShrink={0}>
              <GlyphPlanet size="h3" color={titleColor} stretch />
            </Box>
          )}
          <Heading
            as="h2"
            fontFamily="body"
            fontSize={{ base: '1.3rem', md: '2rem', '2xl': 'clamp(2rem, 4vw, 3rem)' }}
            fontWeight={700}
            lineHeight={1.1}
            color={titleColor}
            m={0}
          >
            {title}
          </Heading>
        </Flex>
      )}
      <Box
        className="ds-text-scroll"
        style={cssVars}
        width="100%"
        flex={1}
        minH={0}
        overflowY="auto"
        padding={
          compact
            ? title
              ? { base: '0.6rem 2rem 1rem', md: '0.8rem 1.5rem 1.3rem', '2xl': '1rem 2rem 1.5rem' }
              : { base: '1rem 2rem', md: '1.3rem 1.5rem', '2xl': '1.5rem 2rem' }
            : title
              ? { base: '0.8rem 2rem 1.5rem', md: '1rem 1.5rem 2rem', '2xl': '1.2rem 2rem 2.5rem' }
              : { base: '1.5rem 2rem', md: '2rem 1.5rem', '2xl': '2.5rem 2rem' }
        }
        fontFamily="body"
        fontSize={{ base: '0.8rem', md: '1rem', '2xl': 'lg' }}
        lineHeight={{ base: 1.5, md: 1.65 }}
        fontWeight="light"
        css={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Desktop: top/bottom mask gradient. Mobile: no mask (visible scroll)
          // Top fade is tight (3%) so the first line doesn't get swallowed;
          // bottom keeps the softer 92% fade so scroll has a nice cue.
          '@media (min-width: 48em)': {
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
          },
          '&::-webkit-scrollbar': { display: 'none' },
          // `& h2` styles here only apply to h2 elements still passed via
          // `children` (legacy usage). When the caller uses the `title`
          // prop, the heading is rendered above this box by the parent.
          '& h2': {
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.8rem',
            color: 'var(--ds-title-color)',
          },
          '& h3': {
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '1.2rem',
            marginBottom: '0.3rem',
            color: 'var(--ds-subtitle-color)',
          },
          '& h3:first-child': {
            marginTop: 0,
          },
          '& p': {
            marginBottom: '0.8rem',
            color: 'var(--ds-text-color)',
          },
          // Mobile (<= 768px) overrides
          '@media (max-width: 48em)': {
            height: fillParent ? '100%' : 'auto',
            overflowY: fillParent ? 'auto' : 'visible',
            ...(fillParent
              ? {
                  maskImage:
                    'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                }
              : {}),
            '& h2': { fontSize: '1rem', marginBottom: '0.5rem' },
            '& h3': { fontSize: '0.65rem', marginBottom: '0.3rem' },
            '& p': { marginBottom: '0.5rem' },
          },
          // XL screens (>= 1920px)
          '@media (min-width: 120em)': {
            '& h2': { fontSize: 'clamp(2rem, 4vw, 3rem)' },
            '& h3': { fontSize: '1.3rem' },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
