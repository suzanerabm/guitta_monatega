'use client';
import { useRef, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterInfoPanel } from '@/components/CharacterInfoPanel';
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
  inStripSide = false,
  contextId,
  locale = 'pt',
}: CharacterStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const autoSpeed = speed ?? characters.length * 5;
  const allCards = noLoop ? characters : [...characters, ...characters];

  // Animation hook is unconditionally called; it bails out if refs aren't ready
  // or if noLoop is true (track ref will be a separate scrollable container).
  useStripAnimation(noLoop ? { current: null } : trackRef, {
    speed: autoSpeed,
    wrapperRef: stripRef,
    enableEdgeControl: true,
  });

  const handleArrow = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: dir * (cardSize + 16), behavior: 'smooth' });
    } else {
      el.scrollLeft += dir * (cardSize + 16);
    }
  };

  const arrowCss: Record<string, unknown> = {
    flexShrink: 0,
    zIndex: 10,
    background: 'none',
    border: 'none',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: arrowColor ?? 'var(--chakra-colors-textOverlayDim)',
    transition: 'opacity 0.2s ease',
    // Astro: .strip-arrow { display: none; } @media (max-width: 768px)
    '@media (max-width: 48em)': { display: 'none' },
  };

  const maskImage =
    'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';

  // Strip container CSS — animated mode uses overflow:hidden so the looping
  // track only shows what fits inside the mask. Static (noLoop) mode allows
  // horizontal scroll for arrow nav.
  const stripCss: Record<string, unknown> = noLoop
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
        overflow: 'hidden',
        maskImage,
        WebkitMaskImage: maskImage,
      };

  // Match Astro: .char-strip is absolute top:20px left/right:0 inside the
  // DSMainCard banner by default. Only static (noLoop) or arrow-enabled
  // variants use relative/flex layout. Inside DSMainCard's stripSide slot,
  // the strip stays in normal flow too (matches Astro's
  // `.ds-strip-side .char-strip { position: relative; top: auto }` override).
  const useAbsolute = !noLoop && !showArrows && !inStripSide;

  return (
    <Box
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
          fontSize="section"
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          margin="5em 2em 0 3em"
          color={arrowColor}
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
          <Box
            as="button"
            type="button"
            aria-label="Previous"
            onClick={() => handleArrow(-1)}
            css={{ ...arrowCss, marginRight: '0.5rem' }}
          >
            <ChevronLeft size={40} />
          </Box>
        )}
        <Box ref={stripRef} css={stripCss}>
          <Box
            ref={trackRef}
            display="flex"
            gap="0.5rem"
            padding={noLoop ? '0.5rem 0 1rem' : '4rem 0 2rem'}
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
            {allCards.map((c, i) => (
              <Box
                key={`${c.name}-${i}`}
                position="relative"
                onMouseEnter={contextId ? () => setHoveredName(c.name) : undefined}
                onMouseLeave={contextId ? () => setHoveredName(null) : undefined}
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
                />
                {contextId && hoveredName === c.name && (
                  <CharacterInfoPanel
                    character={findCharacter(contextId, c.name)}
                    locale={locale}
                    top="-10px"
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
        {showArrows && (
          <Box
            as="button"
            type="button"
            aria-label="Next"
            onClick={() => handleArrow(1)}
            css={{ ...arrowCss, marginLeft: '0.5rem' }}
          >
            <ChevronRight size={40} />
          </Box>
        )}
      </Flex>
    </Box>
  );
}
