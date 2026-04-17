'use client';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
@keyframes kcg-scanline {
  0%   { background-position: 0 0; }
  100% { background-position: 0 4px; }
}
@keyframes kcg-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kcg-arrow-glow {
  0%, 100% { box-shadow: 0 0 12px currentColor, inset 0 0 0 1px currentColor; }
  50%      { box-shadow: 0 0 24px currentColor, inset 0 0 0 1px currentColor; }
}
`;

/**
 * KammaraCharacterGallery — chique, game-premium container for character cards.
 *
 * Features:
 *  - HUD-style frame with angular corner decorations.
 *  - Colored gradient bg + subtle scanlines for that CRT/TCG feel.
 *  - Header with world crest, title, and "n / total" counter.
 *  - Responsive grid of cards. Each card keeps its own flip state.
 *  - Pagination: large circular "⊷" / "⊶" buttons flanking dot indicators
 *    with semantic Kalún glyphs (⊷ back, ⊶ forward, ⊙ active page).
 *  - Stagger fade-in animation when cards enter a page.
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
  // Measure the grid's available width so we know how many cards fit per page.
  // Mobile (< md / 768px) always shows 1 card per page to keep each card
  // big and legible while paginating through characters.
  const gridRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(1);
  const [effectiveCardWidth, setEffectiveCardWidth] = useState(minCardWidth);
  const [page, setPage] = useState(0);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      if (isMobile) {
        setPerPage(1);
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
      // Desktop: how many cards of targetWidth fit side-by-side with cardGap?
      // Formula: (w + gap) / (card + gap) — gives us a clean count.
      // Add 1px of tolerance so sub-pixel rounding doesn't steal a slot.
      const fit = Math.max(1, Math.floor((w + cardGap + 1) / (targetWidth + cardGap)));
      setPerPage(fit);
    };

    measure();
    // ResizeObserver picks up container size changes (parent layout shifting,
    // fonts loading, etc) that window resize wouldn't catch.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [minCardWidth, minCardWidthMd, minCardWidthLg, cardGap]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  // Clamp page if items or perPage changed and current page is out of range
  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const visibleItems = items.slice(page * perPage, (page + 1) * perPage);

  const firstIndex = items.length === 0 ? 0 : page * perPage + 1;
  const lastIndex = Math.min(items.length, (page + 1) * perPage);

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
        padding={{ base: 'md', md: 'lg' }}
        borderRadius="24px"
        css={{
          background: `linear-gradient(160deg, ${darkColor}33 0%, ${darkColor}26 50%, ${darkColor}33 100%)`,
          border: `1px solid ${color}40`,
          outline: isRegion ? `1px solid ${color}` : `1px solid ${color}80`,
          outlineOffset: '4px',
          boxShadow: `0 20px 60px ${color}30, 0 4px 16px ${color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {/* Scanline overlay — subtle CRT feel */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          aria-hidden="true"
          css={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              ${color}08 2px,
              ${color}08 3px
            )`,
            mixBlendMode: 'screen',
            opacity: 0.35,
            borderRadius: '24px',
            animation: 'kcg-scanline 8s linear infinite',
          }}
        />

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
              {firstIndex}–{lastIndex} / {items.length}
            </Text>
          </Flex>

          {/* ── Cards row ────────────────────────────────
              Always a single horizontal row.
              - Mobile: 1 card per page, full width.
              - Desktop: as many cards of `minCardWidth` as fit side-by-side.
                `justify: space-evenly` distributes the leftover horizontal
                space as breathing room between cards, so the gap grows
                naturally on wider screens instead of leaving wide blank
                margins on the sides. Overflow paginates. */}
          <Flex
            ref={gridRef}
            gap={{ base: 'md', md: `${cardGap}px` }}
            minH={0}
            justify={{ base: 'center', md: 'space-evenly' }}
            align="stretch"
            flexWrap="nowrap"
            width="100%"
          >
            {visibleItems.map((item, i) => (
              <Box
                // Include page in the key so the fade-in animation restarts
                // every time the page changes.
                key={`${page}-${i}`}
                css={{
                  animation: `kcg-fade-in 0.5s ease-out ${i * 80}ms both`,
                }}
                // Mobile: 1 card = full width. Desktop: the effective
                // card width computed from the current breakpoint (so
                // lg+ can use the larger `minCardWidthLg`).
                flex={{ base: '1 1 100%', md: `0 0 ${effectiveCardWidth}px` }}
                maxWidth={{ base: '100%', md: `${effectiveCardWidth}px` }}
              >
                {renderCard(item, page * perPage + i)}
              </Box>
            ))}
          </Flex>

          {/* ── Pagination ──────────────────────────────── */}
          {totalPages > 1 && (
            <Flex
              align="center"
              justify="center"
              gap={{ base: 'md', md: 'lg' }}
              paddingTop={{ base: 'sm', md: 'md' }}
              css={{
                borderTop: `1px solid ${color}40`,
              }}
            >
              {/* Prev button */}
              <Box
                as="button"
                aria-label="Página anterior"
                onClick={() => canPrev && setPage((p) => p - 1)}
                disabled={!canPrev}
                width="44px"
                height="44px"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontFamily="glyph"
                fontSize="lg"
                lineHeight={1}
                cursor={canPrev ? 'pointer' : 'default'}
                css={{
                  color,
                  background: canPrev ? `${color}15` : 'transparent',
                  opacity: canPrev ? 1 : 0.25,
                  transition: 'opacity 0.2s ease, background 0.2s ease',
                  animation: canPrev ? 'kcg-arrow-glow 2.5s ease-in-out infinite' : 'none',
                  '&:hover': canPrev ? { background: `${color}30` } : {},
                }}
              >
                ⊷
              </Box>

              {/* Page dots (active page is ⊙, others are small bullets) */}
              <Flex align="center" gap="sm">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const isActive = i === page;
                  return (
                    <Box
                      key={i}
                      as="button"
                      aria-label={`Ir para página ${i + 1}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setPage(i)}
                      cursor="pointer"
                      fontFamily="glyph"
                      fontSize={isActive ? 'md' : 'sm'}
                      lineHeight={1}
                      css={{
                        color: isActive ? color : `${color}60`,
                        transition: 'color 0.2s ease, opacity 0.2s ease',
                        textShadow: isActive ? `0 0 8px ${color}` : 'none',
                        '&:hover': { color },
                      }}
                    >
                      {isActive ? '⊙' : '·'}
                    </Box>
                  );
                })}
              </Flex>

              {/* Next button */}
              <Box
                as="button"
                aria-label="Próxima página"
                onClick={() => canNext && setPage((p) => p + 1)}
                disabled={!canNext}
                width="44px"
                height="44px"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontFamily="glyph"
                fontSize="lg"
                lineHeight={1}
                cursor={canNext ? 'pointer' : 'default'}
                css={{
                  color,
                  background: canNext ? `${color}15` : 'transparent',
                  opacity: canNext ? 1 : 0.25,
                  transition: 'opacity 0.2s ease, background 0.2s ease',
                  animation: canNext ? 'kcg-arrow-glow 2.5s ease-in-out infinite' : 'none',
                  '&:hover': canNext ? { background: `${color}30` } : {},
                }}
              >
                ⊶
              </Box>
            </Flex>
          )}
        </Flex>
      </Box>
    </>
  );
}
