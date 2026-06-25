'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Heading, chakra } from '@chakra-ui/react';
import { CharacterCard } from '@/components/bichittos/CharacterCard';
import { CharacterInfoPanel } from '@/components/bichittos/CharacterInfoPanel';
import { useStripAnimation } from '@/hooks/useStripAnimation';
import { findCharacter, type Locale } from '@/lib/characters';

export interface CharacterStripCharacter {
  name: string;
  image: string;
}

export interface CharacterStripProps {
  characters: CharacterStripCharacter[];
  gradient?: string;
  side?: 'left' | 'right';
  speed?: number;
  cardSize?: number;
  noFloat?: boolean;
  transparent?: boolean;
  noBorder?: boolean;
  noLoop?: boolean;
  showArrows?: boolean;
  noHoverScale?: boolean;
  arrowColor?: string;
  sectionTitle?: string;
  cardBg?: string;
  labelColor?: string;
  /** Color override for title and card borders on mobile (≤768px). */
  mobileColor?: string;
  /**
   * When true (rendered inside DSMainCard's stripSide slot), the strip
   * stays in normal flow instead of using `position: absolute; top: 20px`
   * over the banner. Matches Astro's `.ds-strip-side .char-strip` override.
   */
  inStripSide?: boolean;
  /**
   * Character data context id (e.g. "kammara/lunnp1", "bichittos/napcat").
   * When set, hovering a card shows a CharacterInfoPanel tooltip with the
   * character's name, species and bio from the character JSON data.
   */
  contextId?: string;
  /** Locale for character info panel text. Defaults to 'pt'. */
  locale?: Locale;
}

export function CharacterStrip({
  characters,
  gradient,
  speed,
  cardSize = 120,
  noFloat = false,
  transparent = false,
  noBorder = false,
  noLoop = false,
  showArrows = false,
  noHoverScale = false,
  arrowColor,
  sectionTitle,
  cardBg,
  labelColor,
  mobileColor,
  inStripSide = false,
  contextId,
  locale = 'pt',
}: CharacterStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Map of card key → DOM element. Populated via ref callbacks in the
  // render loop; used to hand the selected card's rect to the portal'd
  // CharacterInfoPanel as its anchor.
  const cardElsRef = useRef<Map<string, HTMLElement>>(new Map());
  // Unique key (`${name}-${index}`) of the card currently selected by click.
  // Using the index prevents both instances of the duplicated loop
  // ([...characters, ...characters]) from appearing active at once.
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // With 0 or 1 character there's nothing to loop against — force noLoop
  // so the animation doesn't try to scroll a duplicated single card, and
  // the strip behaves like a static row.
  const effectiveNoLoop = noLoop || characters.length <= 1;

  const autoSpeed = speed ?? characters.length * 5;
  const allCards = effectiveNoLoop ? characters : [...characters, ...characters];

  // Set of character display names that have data in the character JSONs.
  // Only these cards are interactive (click → opens info panel).
  const activatableNames = useMemo(() => {
    if (!contextId) return new Set<string>();
    const set = new Set<string>();
    for (const c of characters) {
      if (findCharacter(contextId, c.name)) set.add(c.name);
    }
    return set;
  }, [characters, contextId]);

  // Animation hook is unconditionally called; it bails out if refs aren't ready
  // or if effectiveNoLoop is true (track ref will be a separate scrollable container).
  useStripAnimation(effectiveNoLoop ? { current: null } : trackRef, {
    speed: autoSpeed,
    wrapperRef: stripRef,
    enableEdgeControl: true,
    paused: activeKey !== null,
  });

  // Close on Escape, click outside, or page scroll (so the panel doesn't
  // end up floating detached from its anchor when the user scrolls).
  useEffect(() => {
    if (!activeKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveKey(null);
    };
    const onMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setActiveKey(null);
    };
    const onScroll = () => setActiveKey(null);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeKey]);

  const handleArrow = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: dir * (cardSize + 16), behavior: 'smooth' });
    } else {
      el.scrollLeft += dir * (cardSize + 16);
    }
  };

  // Shared Box props for the prev/next arrow buttons. Hidden on mobile
  // (base → md), shown as a flex button from md+.
  const arrowBoxProps = {
    flexShrink: 0,
    zIndex: 10,
    bg: 'none',
    border: 'none',
    padding: '0.5rem',
    display: { base: 'none', md: 'flex' },
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: arrowColor ?? 'textOverlayDim',
    transition: 'opacity 0.2s ease',
    fontFamily: 'glyph',
    fontSize: 'glyphH1',
    lineHeight: 1,
  } as const;

  const maskImage =
    'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';

  // Strip container CSS — animated mode uses overflow:hidden so the looping
  // track only shows what fits inside the mask. Static (noLoop) mode allows
  // horizontal scroll for arrow nav.
  const stripCss: Record<string, unknown> = effectiveNoLoop
    ? {
        flex: 1,
        minWidth: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        maskImage,
        WebkitMaskImage: maskImage,
      }
    : {
        flex: 1,
        minWidth: 0,
        overflow: inStripSide ? 'visible' : 'hidden',
        maskImage: inStripSide ? 'none' : maskImage,
        WebkitMaskImage: inStripSide ? 'none' : maskImage,
      };

  // Match Astro: .char-strip is absolute top:20px left/right:0 inside the
  // DSMainCard banner by default. Only static (noLoop) or arrow-enabled
  // variants use relative/flex layout. Inside DSMainCard's stripSide slot,
  // the strip stays in normal flow too (matches Astro's
  // `.ds-strip-side .char-strip { position: relative; top: auto }` override).
  const useAbsolute = !effectiveNoLoop && !showArrows && !inStripSide;

  return (
    <Box
      ref={rootRef}
      position={useAbsolute ? { base: 'relative', md: 'absolute' } : 'relative'}
      top={useAbsolute ? { base: 'auto', md: '20px' } : undefined}
      left={useAbsolute ? { base: 'auto', md: 0 } : undefined}
      right={useAbsolute ? { base: 'auto', md: 0 } : undefined}
      zIndex={useAbsolute ? 2 : undefined}
      width="100%"
      mt={useAbsolute ? { base: '2rem', md: 0 } : undefined}
    >
      {sectionTitle && (
        <Heading
          as="h2"
          fontFamily="body"
          fontSize={mobileColor ? { base: 'section', md: '0.85rem', lg: 'section' } : 'section'}
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          margin={inStripSide ? '1rem 0 0.5rem 0' : '5em 2em 0 3em'}
          color={
            mobileColor
              ? { base: mobileColor, md: arrowColor ?? mobileColor }
              : arrowColor
          }
        >
          {sectionTitle}
        </Heading>
      )}
      <Flex
        position="relative"
        width="100%"
        align={showArrows ? 'center' : undefined}
        display={showArrows ? 'flex' : 'block'}
        padding={showArrows ? '0 0.5rem' : undefined}
      >
        {showArrows && (
          <chakra.button
            {...arrowBoxProps}
            type="button"
            aria-label="Previous"
            onClick={() => handleArrow(-1)}
            marginRight="0.5rem"
          >
            ⊷
          </chakra.button>
        )}
        <Box ref={stripRef} css={stripCss}>
          <Box
            ref={trackRef}
            display="flex"
            gap="0.5rem"
            padding={
              effectiveNoLoop
                ? '0.5rem 0 1rem'
                : inStripSide
                  ? '0.5rem 1rem'
                  : '4rem 0 2rem'
            }
            width="max-content"
            css={{
              // Stagger the cardFloat animation across cards so they don't
              // bob in sync (matches Astro :nth-child delays).
              // Each card is wrapped in a Box for tooltip hover, so the
              // CharacterCard (with the animation) is one level deeper.
              '& > *:nth-of-type(2n) > .group': { animationDelay: '-1s' },
              '& > *:nth-of-type(3n) > .group': { animationDelay: '-2s' },
            }}
          >
            {allCards.map((c, i) => {
              const key = `${c.name}-${i}`;
              const isActivatable = activatableNames.has(c.name);
              const isActive = activeKey === key;
              return (
                <Box
                  key={key}
                  ref={(el: HTMLDivElement | null) => {
                    if (el) cardElsRef.current.set(key, el);
                    else cardElsRef.current.delete(key);
                  }}
                  position="relative"
                  cursor={isActivatable ? 'pointer' : undefined}
                  onClick={
                    isActivatable
                      ? () => setActiveKey((prev) => (prev === key ? null : key))
                      : undefined
                  }
                >
                  <CharacterCard
                    name={c.name}
                    image={c.image}
                    gradient={gradient}
                    cardSize={cardSize}
                    noFloat={noFloat}
                    transparent={transparent}
                    noBorder={noBorder}
                    noHoverScale={noHoverScale}
                    cardBg={cardBg}
                    labelColor={labelColor}
                    mobileColor={mobileColor}
                    isSelected={isActive}
                  />
                </Box>
              );
            })}
            {activeKey && contextId && (
              <CharacterInfoPanel
                character={findCharacter(
                  contextId,
                  // Strip the `-${index}` suffix to get the character name back
                  activeKey.slice(0, activeKey.lastIndexOf('-'))
                )}
                locale={locale}
                anchorEl={cardElsRef.current.get(activeKey) ?? null}
                onClose={() => setActiveKey(null)}
              />
            )}
          </Box>
        </Box>
        {showArrows && (
          <chakra.button
            {...arrowBoxProps}
            type="button"
            aria-label="Next"
            onClick={() => handleArrow(1)}
            marginLeft="0.5rem"
          >
            ⊶
          </chakra.button>
        )}
      </Flex>
    </Box>
  );
}
