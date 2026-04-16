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
   * Minimum width of a card in px (desktop). The gallery packs as many
   * as fit horizontally; any overflow paginates. Default: 400.
   */
  minCardWidth?: number;
  /**
   * Gap between cards in px (desktop). Default: 24.
   */
  cardGap?: number;
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
  cardGap = 24,
  'data-testid': testId,
}: KammaraCharacterGalleryProps<T>) {
  // Measure the grid's available width so we know how many cards fit per page.
  // Mobile (< md / 768px) always shows 1 card per page to keep each card
  // big and legible while paginating through characters.
  const gridRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(1);
  const [page, setPage] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPerPage(1);
        return;
      }
      // Desktop: how many cards of minCardWidth fit side-by-side with cardGap?
      // Formula: (w + gap) / (card + gap) — gives us a clean count.
      const fit = Math.max(1, Math.floor((w + cardGap) / (minCardWidth + cardGap)));
      setPerPage(fit);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [minCardWidth, cardGap]);

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
      <Box
        data-testid={testId ?? 'kammara-character-gallery'}
        position="relative"
        width="100%"
        padding={{ base: 'md', md: 'lg', xl: 'xl' }}
        borderRadius="24px"
        css={{
          background: `linear-gradient(160deg, ${darkColor}cc 0%, ${darkColor}99 50%, ${darkColor}cc 100%)`,
          border: `1px solid ${color}40`,
          outline: `1px solid ${color}80`,
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
              - Desktop: as many cards of `minCardWidth` as fit side-by-side,
                with `cardGap` between them. Overflow paginates. */}
          <Flex
            ref={gridRef}
            gap={{ base: 'md', md: `${cardGap}px` }}
            minH={0}
            justify="center"
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
                // Mobile: 1 card = full width. Desktop: fixed minCardWidth.
                flex={{ base: '1 1 100%', md: `0 0 ${minCardWidth}px` }}
                maxWidth={{ base: '100%', md: `${minCardWidth}px` }}
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
