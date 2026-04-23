'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';

export interface SubSystemCard {
  title: string;
  image?: string;
  imageAlt?: string;
  texts: string[];
}

interface SubSystemProps {
  cards: SubSystemCard[];
  titleColor?: string;
  subtitleColor?: string;
  textColor?: string;
  sectionTitle?: string;
  /**
   * Color used for the left/right arrow buttons of the horizontal strip.
   * Defaults to `titleColor`. Match it to the world/region accent color
   * so the arrows sit comfortably over the section background.
   */
  arrowColor?: string;
  'data-testid'?: string;
}

export function SubSystem({
  cards,
  titleColor = 'textOverlayBright',
  subtitleColor,
  textColor = 'textOverlay',
  sectionTitle,
  arrowColor,
  'data-testid': testId,
}: SubSystemProps) {
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

  // Arrow button styling applied via a css selector on the root Flex.
  // We use plain <button> elements (not <Box as="button">) because
  // Chakra v3 rejects `type="button"` as a direct prop on Box.
  const arrowSelector = {
    '& .subsystem-arrow': {
      flexShrink: 0,
      zIndex: 10,
      background: 'none',
      border: 'none',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      fontFamily: 'var(--chakra-fonts-glyph)',
      fontSize: 'var(--chakra-font-sizes-glyph-h1)',
      lineHeight: 1,
    },
    // Hide arrows on mobile — rely on native touch scroll instead
    '@media (max-width: 48em)': {
      '& .subsystem-arrow': { display: 'none' },
    },
  };

  const maskImage =
    'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)';

  return (
    <Box data-testid={testId} marginBottom="5rem">
      {sectionTitle && (
        <Heading
          as="h2"
          fontFamily="body"
          // `lg` (62em) is the closest canonical cut to the old 64em; the
          // ~32px gap is imperceptible for this font-size tier.
          fontSize={{ base: 'section', md: '0.85rem', lg: 'section' }}
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          margin="5em 0 0.5rem"
          color={titleColor}
        >
          {sectionTitle}
        </Heading>
      )}
      <Flex
        align="center"
        width={{ base: '100%', md: '100vw' }}
        marginLeft={{ base: 0, md: 'calc(-50vw + 50%)' }}
        padding={{ base: '0', md: '0 0.5rem' }}
        css={arrowSelector}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={() => handleArrow(-1)}
          data-testid="subsystem-arrow-left"
          style={{ marginRight: '0.5rem', color: canPrev ? (arrowColor || 'var(--chakra-colors-glyphIdle)') : 'var(--chakra-colors-glyphDisabled)', cursor: canPrev ? 'pointer' : 'default' }}
          className="subsystem-arrow"
        >
          ⊷
        </button>
        <Box
          ref={scrollRef}
          flex={1}
          minWidth={0}
          css={{
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            maskImage,
            WebkitMaskImage: maskImage,
          }}
        >
          <Flex
            gap="1.5rem"
            padding={{ base: '1rem 1.5rem', md: '0.5rem 2rem 2rem' }}
            width="max-content"
          >
        {cards.map((card, idx) => {
          return (
            <Box
              key={`${card.title}-${idx}`}
              data-testid={`subsystem-card-${idx}`}
              flexShrink={0}
              width={{ base: '85vw', md: '360px', '2xl': '420px' }}
              maxW={{ base: '480px', md: 'none' }}
              // Mirror the DSTextPanel visual: dark translucent bg + blur,
              // tinted outline (in the world/region accent color), rounded
              // corners with outline offset, and the same dsPanel shadow.
              bg="rgba(0,0,0,0.3)"
              backdropFilter="blur(8px)"
              borderRadius="16px"
              outline="2px solid"
              outlineColor={titleColor}
              outlineOffset="3px"
              boxShadow="dsPanel"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              position="relative"
              height={{ base: 'auto', md: '550px', '2xl': '600px' }}
              maxHeight={{ base: '420px', md: 'none' }}
            >
              <Heading
                as="h3"
                position="relative"
                zIndex={1}
                // Smaller than the DSTextPanel h2 (2rem) so the card
                // title reads as a sub-heading inside the section —
                // still clearly a title, just lower in the visual
                // hierarchy of the kammara text panels.
                fontFamily="body"
                fontSize="1.5rem"
                fontWeight={700}
                padding="1.2rem 1.5rem 0.8rem"
                marginBottom="0.8rem"
                color={titleColor}
              >
                {card.title}
              </Heading>
              <Flex
                position="relative"
                zIndex={1}
                flexDirection="column"
                flex={1}
                minH={0}
                overflow="hidden"
              >
                {card.image && (
                  <Box
                    flex="none"
                    overflow="hidden"
                    css={{
                      height: '200px',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-testid={`subsystem-card-${idx}-image`}
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                )}
                <Box
                  flex={1}
                  // Slight top padding so the first line doesn't sit
                  // glued to the card title above (matches DSTextPanel).
                  padding={{ base: '0.8rem 1.5rem 1.5rem', md: '1rem 1.5rem 1.5rem' }}
                  fontFamily="body"
                  // Body text matches the DSTextPanel body scale:
                  // 0.8rem on mobile, 1rem on md, `lg` on 2xl. Line-heights
                  // and weight also mirror DSTextPanel.
                  fontSize={{ base: '0.8rem', md: '1rem', '2xl': 'lg' }}
                  lineHeight={{ base: 1.5, md: 1.65 }}
                  fontWeight="light"
                  overflowY="auto"
                  color={textColor}
                  css={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    // Top mask tightened to 3% so the first line isn't
                    // swallowed by the fade (matches DSTextPanel).
                    maskImage:
                      'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)',
                    '&::-webkit-scrollbar': { display: 'none' },
                    '& p': {
                      marginBottom: '0.8rem',
                    },
                    // Subtitle styling mirrors DSTextPanel `& h3`:
                    // small caps label that sits above each subsection.
                    // Color falls back to titleColor when no subtitleColor
                    // is passed, matching DSTextPanel's `--ds-subtitle-color`
                    // resolution (subtitleColor || titleColor).
                    '& h3': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      marginTop: '1.2rem',
                      marginBottom: '0.3rem',
                      color: subtitleColor ?? titleColor,
                    },
                    '& h3:first-child': {
                      marginTop: 0,
                    },
                  }}
                >
                  {card.texts.map((p, i) =>
                    p.startsWith('### ') ? (
                      <h3 key={i}>{p.slice(4)}</h3>
                    ) : p.startsWith('## ') ? (
                      <h3 key={i}>{p.slice(3)}</h3>
                    ) : (
                      <p key={i}>{p}</p>
                    )
                  )}
                </Box>
              </Flex>
            </Box>
          );
        })}
          </Flex>
        </Box>
        <button
          type="button"
          aria-label="Next"
          onClick={() => handleArrow(1)}
          data-testid="subsystem-arrow-right"
          style={{ marginLeft: '0.5rem', color: canNext ? (arrowColor || 'var(--chakra-colors-glyphIdle)') : 'var(--chakra-colors-glyphDisabled)', cursor: canNext ? 'pointer' : 'default' }}
          className="subsystem-arrow"
        >
          ⊶
        </button>
      </Flex>
    </Box>
  );
}
