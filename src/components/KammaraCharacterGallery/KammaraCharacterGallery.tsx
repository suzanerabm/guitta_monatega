'use client';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface KammaraCharacterGalleryProps<T> {
  /** Optional header title (e.g. "Habitantes de LUNN'P1"). */
  title?: string;
  /** Kalún crest glyph of the world — shown in the header. */
  worldCrestGlyph: string;
  /** Accent color (palette.colors[0]) — drives the frame glow. */
  color: string;
  /** Dark base color (palette.dark) — gradient background of the frame. */
  darkColor: string;
  /** Items to render — one card per item. */
  items: T[];
  /**
   * Render a single card for an item. Called per visible item.
   * The gallery owns pagination; the cards just render themselves.
   */
  renderCard: (item: T, index: number) => ReactNode;
  /**
   * Minimum width of a card in px (base desktop value, used at md unless
   * `minCardWidthMd` overrides). The gallery packs as many as fit
   * horizontally; overflow paginates. Default: 400.
   */
  minCardWidth?: number;
  /**
   * Optional override for minimum card width at md (>=768px, <1024px).
   * Useful when md only fits 2 cards anyway and you want to make them
   * wider rather than leaving empty space.
   */
  minCardWidthMd?: number;
  /**
   * Optional override for minimum card width at lg (>=1024px). Lets the
   * caller make cards bigger on wider screens without the md count
   * changing. Falls back to `minCardWidth` when not provided.
   */
  minCardWidthLg?: number;
  /**
   * Gap between cards in px (desktop). Default: 24.
   */
  cardGap?: number;
  /**
   * Visual variant of the frame.
   *  - `'default'` (solid outline) — used by planets/worlds
   *  - `'region'` (dashed outline + lighter border) — used by TripleC
   *    sub-regions so they read as nested inside the parent world.
   */
  variant?: 'default' | 'region';
  'data-testid'?: string;
}

// ---------------------------------------------------------------------------
// Keyframes for the subtle premium effects. Injected once via a <style> tag
// so consumers don't need a global CSS file.
// ---------------------------------------------------------------------------
const KEYFRAMES = `
@keyframes kcg-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * KammaraCharacterGallery — chique, game-premium container for character cards.
 *
 * Features:
 *  - HUD-style frame with angular corner decorations.
 *  - Colored gradient bg for that game-premium feel.
 *  - Header with world crest, title, and total counter.
 *  - Horizontal scroll-snap strip of cards on every breakpoint.
 *  - Stagger fade-in animation on mount.
 *
 * Data-generic: receives `items[]` + `renderCard`, so it can host any kind
 * of character card variant (front-only, flippable, dual-form, etc).
 */
export function KammaraCharacterGallery<T>({
  title,
  worldCrestGlyph,
  color,
  darkColor,
  items,
  renderCard,
  minCardWidth = 400,
  minCardWidthMd,
  minCardWidthLg,
  cardGap = 24,
  variant = 'default',
  'data-testid': testId,
}: KammaraCharacterGalleryProps<T>) {
  const isRegion = variant === 'region';
  // Measure the container width so we pick the right card width for the
  // breakpoint. On desktop we render every card inline and let the browser
  // scroll horizontally — no pagination state needed.
  const gridRef = useRef<HTMLDivElement>(null);
  const [effectiveCardWidth, setEffectiveCardWidth] = useState(minCardWidth);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      if (isMobile) {
        setEffectiveCardWidth(minCardWidth);
        return;
      }
      // Pick the target card width for this breakpoint. Priority:
      // lg override > md override > base. Allows the caller to widen
      // cards on any range where the card count won't change anyway.
      let targetWidth = minCardWidth;
      if (vw >= 1024 && minCardWidthLg) targetWidth = minCardWidthLg;
      else if (vw >= 768 && vw < 1024 && minCardWidthMd) targetWidth = minCardWidthMd;
      setEffectiveCardWidth(targetWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [minCardWidth, minCardWidthMd, minCardWidthLg, cardGap]);

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Mobile (base → md): plain horizontal scroll-snap strip ──
          No frame, no title, no pagination — on a phone the HUD frame
          just steals space and the pagination forces users to tap back
          and forth. A native horizontal swipe is far more natural, so
          we render every card in a snap scroller and let the user flick. */}
      <Box
        display={{ base: 'block', md: 'none' }}
        data-testid={testId ? `${testId}-mobile` : 'kammara-character-gallery-mobile'}
        width="100%"
        css={{
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Left padding = gutter of the first card; right padding is
          // small so the next card always peeks ~10% from the right edge,
          // making it obvious the user can swipe for more. `scroll-padding`
          // matches the left padding so the snap point lands flush.
          padding: '8px 0 8px 16px',
          scrollPaddingLeft: '16px',
        }}
      >
        <Box
          display="flex"
          css={{
            gap: '16px',
            width: 'max-content',
            // Right spacer after the last card so it can snap flush with
            // the same left gutter even when it's the last one.
            paddingRight: '16px',
          }}
        >
          {items.map((item, i) => (
            <Box
              key={i}
              css={{
                // 72% of the viewport: leaves a visible ~28vw peek of the
                // next card on the right. Works even on narrow 320px
                // viewports, where a wider card would swallow the peek.
                flex: '0 0 72vw',
                maxWidth: '72vw',
                scrollSnapAlign: 'start',
                animation: `kcg-fade-in 0.4s ease-out ${i * 40}ms both`,
              }}
            >
              {renderCard(item, i)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Desktop (md+): the full HUD frame with pagination ────── */}
      <Box
        display={{ base: 'none', md: 'block' }}
        data-testid={testId ?? 'kammara-character-gallery'}
        position="relative"
        width="100%"
        marginTop="30px"
        marginBottom="30px"
        paddingX={{ base: 'md', md: 'lg' }}
        paddingY={{ base: 'lg', md: 'xl' }}
        borderRadius="24px"
        css={{
          background: `linear-gradient(160deg, ${darkColor}33 0%, ${darkColor}26 50%, ${darkColor}33 100%)`,
          border: `1px solid ${color}40`,
          outline: isRegion ? `1px solid ${color}` : `1px solid ${color}80`,
          outlineOffset: '4px',
          boxShadow: `0 20px 60px ${color}30, 0 4px 16px ${color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {/* Angular corner decorations (TL, TR, BL, BR) — HUD style */}
        {[
          { top: '-4px', left: '-4px', borderTop: '2px', borderLeft: '2px' },
          { top: '-4px', right: '-4px', borderTop: '2px', borderRight: '2px' },
          { bottom: '-4px', left: '-4px', borderBottom: '2px', borderLeft: '2px' },
          { bottom: '-4px', right: '-4px', borderBottom: '2px', borderRight: '2px' },
        ].map((pos, i) => (
          <Box
            key={i}
            position="absolute"
            width="18px"
            height="18px"
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
              borderColor: color,
              boxShadow: `0 0 8px ${color}80`,
            }}
          />
        ))}

        <Flex direction="column" position="relative" zIndex={1} gap={{ base: 'md', md: 'lg' }}>
          {/* ── Header ───────────────────────────────────── */}
          <Flex
            align="center"
            justify="space-between"
            gap="sm"
            padding={`0 0 sm 0`}
            css={{
              borderBottom: `1px solid ${color}40`,
              paddingBottom: '0.8rem',
            }}
          >
            {/* Left: crest + title */}
            <Flex align="center" gap="sm" minW={0}>
              <Box
                as="span"
                fontFamily="glyph"
                fontSize="glyphH3"
                lineHeight={1}
                color={color}
                css={{ whiteSpace: 'nowrap', letterSpacing: '0.04em' }}
                aria-hidden="true"
              >
                {worldCrestGlyph}
              </Box>
              {title && (
                <Text
                  fontSize="xs"
                  letterSpacing="hero"
                  textTransform="uppercase"
                  fontWeight="bold"
                  color={color}
                  m={0}
                  opacity={0.9}
                  css={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </Text>
              )}
            </Flex>

            {/* Right: HUD-style counter */}
            <Text
              fontSize="xs"
              letterSpacing="wide"
              fontWeight="semibold"
              color="textOverlayBright"
              m={0}
              opacity={0.7}
              css={{
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {items.length}
            </Text>
          </Flex>

          {/* ── Cards row — horizontal scroll-snap strip ────────────
              Every card renders inline; the user scrolls horizontally
              through them. Snap aligns the leftmost card of the viewport
              so scrolling lands on clean card boundaries. A subtle right
              edge fade hints that more cards exist offscreen. */}
          <Box
            ref={gridRef}
            width="100%"
            position="relative"
            paddingY={{ base: 'md', md: 'lg' }}
            css={{
              overflowX: 'auto',
              overflowY: 'visible',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollPaddingLeft: '15px',
              // Right-edge fade: hints scrollable content without stealing
              // a full pixel column from the card contents.
              maskImage:
                'linear-gradient(to right, black 0, black calc(100% - 48px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, black 0, black calc(100% - 48px), transparent 100%)',
            }}
          >
            <Flex
              gap={`${cardGap}px`}
              align="stretch"
              css={{
                width: 'max-content',
                paddingLeft: '15px',
                paddingRight: '40px',
              }}
            >
              {items.map((item, i) => (
                <Box
                  key={i}
                  css={{
                    animation: `kcg-fade-in 0.5s ease-out ${Math.min(i, 6) * 80}ms both`,
                    scrollSnapAlign: 'start',
                  }}
                  flex={`0 0 ${effectiveCardWidth}px`}
                  maxWidth={`${effectiveCardWidth}px`}
                >
                  {renderCard(item, i)}
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
