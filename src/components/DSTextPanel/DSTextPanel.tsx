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
  glyphVariant?: 'planet' | 'universe';
  /**
   * When set, turns the panel into the Bichittos "creature" variant:
   * decorative HUD corners in the given color, a subtle dot pattern
   * background, and a colored dropcap on the first paragraph letter.
   * The color provided is used as the accent (corners + dropcap).
   */
  creatureAccent?: string;
  /** Secondary accent used for the dropcap and inner corner stroke. */
  creatureAccentAlt?: string;
  /** Optional pill shown above the title (e.g. "NAPCAT · GATO"). */
  badge?: string;
  /**
   * Override the panel background. Defaults to `rgba(0,0,0,0.3)` — the
   * Kammara/SubSystem/RegionBanner idiom. The Bichittos client passes a
   * creature-tinted translucent color per creature.
   */
  panelBg?: string;
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
  glyphVariant,
  creatureAccent,
  creatureAccentAlt,
  badge,
  panelBg,
  'data-testid': testId,
}: DSTextPanelProps) {
  const hasCreature = Boolean(creatureAccent);
  const accent = creatureAccent ?? titleColor;
  const accentAlt = creatureAccentAlt ?? creatureAccent ?? titleColor;
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
      // Mobile: collapse to content-driven height (unless fillParent);
      // desktop always fills parent.
      height={{ base: fillParent ? '100%' : 'auto', md: '100%' }}
      borderRadius="16px"
      overflow="hidden"
      position="relative"
      bg={panelBg ?? 'rgba(0, 0, 0, 0.3)'}
      backdropFilter="blur(8px)"
      outline="2px solid"
      outlineColor={borderColor ?? titleColor}
      outlineOffset="3px"
      boxShadow="dsPanel"
      display="flex"
      flexDirection="column"
    >
      {hasCreature && (
        <>
          {/* Subtle dot pattern layer — adds texture without stealing focus */}
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            aria-hidden="true"
            css={{
              backgroundImage: `radial-gradient(${accent}22 1px, transparent 1px)`,
              backgroundSize: '18px 18px',
              opacity: 0.45,
            }}
          />
          {/* HUD-style angular corners — playful take on the Kammara frame */}
          {[
            { top: '-6px', left: '-6px', borderTop: '3px', borderLeft: '3px' },
            { top: '-6px', right: '-6px', borderTop: '3px', borderRight: '3px' },
            { bottom: '-6px', left: '-6px', borderBottom: '3px', borderLeft: '3px' },
            { bottom: '-6px', right: '-6px', borderBottom: '3px', borderRight: '3px' },
          ].map((pos, i) => (
            <Box
              key={i}
              position="absolute"
              width="22px"
              height="22px"
              pointerEvents="none"
              aria-hidden="true"
              css={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                bottom: pos.bottom,
                borderTopWidth: pos.borderTop,
                borderLeftWidth: pos.borderLeft,
                borderRightWidth: pos.borderRight,
                borderBottomWidth: pos.borderBottom,
                borderStyle: 'solid',
                borderColor: accent,
                borderRadius: '4px',
                boxShadow: `0 0 10px ${accent}80`,
              }}
            />
          ))}
        </>
      )}
      {title && (
        <Box
          position="relative"
          flexShrink={0}
          padding={
            compact
              ? { base: '1rem 2rem 0', md: '1.3rem 1.5rem 0', '2xl': '1.5rem 2rem 0' }
              : { base: '1.5rem 2rem 0', md: '2rem 1.5rem 0', '2xl': '2.5rem 2rem 0' }
          }
          marginBottom={{ base: '0.5rem', md: '0.8rem' }}
        >
          {badge && (
            <Box
              as="span"
              display="inline-block"
              marginBottom="0.6rem"
              padding="0.25rem 0.7rem"
              borderRadius="999px"
              fontSize="xs"
              letterSpacing="hero"
              textTransform="uppercase"
              fontWeight="bold"
              color={accentAlt}
              css={{
                background: `${accent}1f`,
                border: `1px solid ${accent}66`,
              }}
            >
              {badge}
            </Box>
          )}
          <Flex align="stretch" gap="0.4rem">
            {showGlyph && (
              <Box display="flex" alignItems="center" flexShrink={0}>
                <GlyphPlanet size="h3" color={titleColor} stretch variant={glyphVariant} />
              </Box>
            )}
            <Heading
              as="h2"
              textStyle="heading"
              fontSize={{ base: '1.3rem', md: '2rem', '2xl': 'clamp(2rem, 4vw, 3rem)' }}
              lineHeight={1.1}
              color={titleColor}
              m={0}
            >
              {title}
            </Heading>
          </Flex>
          {hasCreature && (
            <Box
              marginTop="0.7rem"
              height="3px"
              width="80px"
              borderRadius="999px"
              css={{
                background: `linear-gradient(90deg, ${accent}, ${accentAlt}, transparent)`,
              }}
            />
          )}
        </Box>
      )}
      <Box
        className="ds-text-scroll"
        style={cssVars}
        width="100%"
        flex={1}
        minH={0}
        height={{
          base: fillParent ? '100%' : 'auto',
          md: fillParent ? '100%' : 'auto',
        }}
        overflowY={{
          base: fillParent ? 'auto' : 'visible',
          md: 'auto',
        }}
        position="relative"
        // Top/bottom mask gradient. Mobile: no mask except when fillParent
        // is set (kept a slightly wider top fade there for the stripSide
        // variant); desktop: tight 3% top fade, softer 92% bottom fade.
        maskImage={{
          base: fillParent
            ? 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)'
            : 'none',
          md: 'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
        }}
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
          // Safari still needs the -webkit- prefix (no Chakra responsive).
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Descendant selectors — can't be expressed as Chakra responsive
          // props because the target is a child element, not the Box itself.
          // Allowed exception per AGENTS.md rule 6.
          '& h2': {
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: 'var(--ds-title-color)',
          },
          '& h3': {
            fontSize: '0.65rem',
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
            marginBottom: '0.5rem',
            color: 'var(--ds-text-color)',
          },
          '@media (min-width: 48em)': {
            '& h2': { fontSize: '2rem', marginBottom: '0.8rem' },
            '& h3': { fontSize: '0.75rem' },
            '& p': { marginBottom: '0.8rem' },
          },
          '@media (min-width: 120em)': {
            '& h2': { fontSize: 'clamp(2rem, 4vw, 3rem)' },
            '& h3': { fontSize: '1.3rem' },
          },
          ...(hasCreature && {
            '& p:first-of-type::first-letter': {
              fontSize: '3.2em',
              fontWeight: 700,
              color: accentAlt,
              float: 'left',
              lineHeight: 0.9,
              padding: '0.05em 0.15em 0 0',
              fontFamily: 'var(--chakra-fonts-body)',
              textShadow: `0 2px 12px ${accent}66`,
            },
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
