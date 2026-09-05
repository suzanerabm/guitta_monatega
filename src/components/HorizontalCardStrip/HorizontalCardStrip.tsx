'use client';
import { Children, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';

export interface HorizontalCardStripProps {
  /**
   * Cards already rendered by the caller. Each child is wrapped in a
   * `flex-shrink: 0` slot, so the card's own width prop decides how wide
   * it is — the strip never imposes a width.
   */
  children: ReactNode;
  /**
   * Color of the prev/next arrow glyphs. Match it to the world/region
   * accent so the arrows sit comfortably over the section background.
   * Defaults to the theme's `glyphIdle`.
   */
  arrowColor?: string;
  /** Gap between cards. Default `1.5rem`. */
  gap?: string;
  /**
   * Padding around the scrollable track. Defaults to a responsive value
   * that gives the cards breathing room on mobile and desktop.
   */
  cardPadding?: { base: string; md: string } | string;
  /**
   * Arrow glyph style. 'glyph' (default) renders the Kammara-world glyph
   * font (⊷/⊶) — reserve it for Kammara surfaces. 'plain' renders neutral
   * chevrons in the body font, for strips outside the Kammara universe
   * (e.g. BookShelf on Bichittos/Art).
   */
  arrowVariant?: 'glyph' | 'plain';
  'data-testid'?: string;
}

// Right/left edge fade so the cut-off card reads as "more to scroll"
// rather than an abrupt clip.
const MASK_IMAGE =
  'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)';

/**
 * HorizontalCardStrip — generic horizontal scroller for a row of cards.
 *
 * Single responsibility: turn a row of children into a horizontally
 * swipeable strip. On desktop it shows prev/next arrows (disabled at the
 * edges); on mobile (≤md) the arrows hide and users rely on native touch
 * scroll. The strip owns scrolling + arrows; the caller owns each card's
 * size and visual.
 */
export function HorizontalCardStrip({
  children,
  arrowColor,
  gap = '1.5rem',
  cardPadding = { base: '1rem 16px', md: '0.5rem 2rem 2rem' },
  arrowVariant = 'glyph',
  'data-testid': testId,
}: HorizontalCardStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const handleArrow = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 380;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
    } else {
      el.scrollLeft += dir * step;
    }
  };

  // Arrow styling lives on a descendant selector so we can hide the arrows
  // below md without a responsive prop on each button. The `@media` here is
  // the sanctioned descendant exception (AGENTS.md rule 6) — it targets
  // `& .hcs-arrow`, not the Box itself, and uses the canonical 48em cut.
  const arrowSelector = {
    '& .hcs-arrow': {
      flexShrink: 0,
      zIndex: 10,
      background: 'none',
      border: 'none',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s ease',
      fontFamily:
        arrowVariant === 'glyph' ? 'var(--chakra-fonts-glyph)' : 'var(--chakra-fonts-body)',
      fontSize: arrowVariant === 'glyph' ? 'var(--chakra-font-sizes-glyph-h1)' : '1.6rem',
      lineHeight: 1,
    },
    '@media (max-width: 48em)': {
      '& .hcs-arrow': { display: 'none' },
    },
  };

  const idleColor = arrowColor ?? 'var(--chakra-colors-glyphIdle)';
  const disabledColor = 'var(--chakra-colors-glyphDisabled)';
  const [prevGlyph, nextGlyph] = arrowVariant === 'glyph' ? ['⊷', '⊶'] : ['‹', '›'];

  return (
    <Flex align="center" css={arrowSelector} data-testid={testId}>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => handleArrow(-1)}
        data-testid={testId ? `${testId}-arrow-left` : 'hcs-arrow-left'}
        className="hcs-arrow"
        style={{
          marginRight: '0.5rem',
          color: canPrev ? idleColor : disabledColor,
          cursor: canPrev ? 'pointer' : 'default',
        }}
      >
        {prevGlyph}
      </button>
      <Box
        ref={scrollRef}
        flex={1}
        minWidth={0}
        data-testid={testId ? `${testId}-track` : 'hcs-track'}
        css={{
          overflowX: 'auto',
          // Contain the swipe so reaching the end doesn't fire the browser's
          // back/forward navigation gesture.
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Edge fade only from md up (alongside the arrows). On mobile it ate
          // a visible slice of the full-width card, so we drop it there.
          '@media (min-width: 48em)': {
            maskImage: MASK_IMAGE,
            WebkitMaskImage: MASK_IMAGE,
          },
        }}
      >
        <Flex gap={gap} padding={cardPadding} width="max-content" align="stretch">
          {Children.map(children, (child, i) => (
            <Box key={i} flexShrink={0}>
              {child}
            </Box>
          ))}
        </Flex>
      </Box>
      <button
        type="button"
        aria-label="Next"
        onClick={() => handleArrow(1)}
        data-testid={testId ? `${testId}-arrow-right` : 'hcs-arrow-right'}
        className="hcs-arrow"
        style={{
          marginLeft: '0.5rem',
          color: canNext ? idleColor : disabledColor,
          cursor: canNext ? 'pointer' : 'default',
        }}
      >
        {nextGlyph}
      </button>
    </Flex>
  );
}
