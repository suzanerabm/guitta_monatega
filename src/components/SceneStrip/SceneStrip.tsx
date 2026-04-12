'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useModal } from '@/components/Modal';

export interface SceneStripScene {
  name: string;
  image: string;
}

export interface SceneStripProps {
  scenes: SceneStripScene[];
  sectionTitle?: string;
  labelColor?: string;
  arrowColor?: string;
  accentColor?: string;
  modalBg?: string;
  modalBgOpacity?: number;
  modalTitle?: string;
  modalSubtitle?: string;
  galleryId?: string;
  /**
   * Override the top margin above the section title ("CENAS"). Defaults
   * to `5em` (the kammara world default). Used by the triplec sub-regions
   * to sit closer to the DSTextPanel that precedes them.
   */
  titleMarginTop?: string;
}

export function SceneStrip({
  scenes,
  sectionTitle,
  labelColor,
  arrowColor,
  accentColor,
  modalBg,
  modalTitle,
  modalSubtitle,
  galleryId,
  titleMarginTop = '5em',
}: SceneStripProps) {
  const fallbackId = useId();
  const id = galleryId ?? `scene-strip-${fallbackId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { registerGallery, openGallery } = useModal();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    registerGallery(
      id,
      scenes.map((s) => s.image),
      scenes.map((s) => s.name)
    );
  }, [id, scenes, registerGallery]);

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
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: dir * 300, behavior: 'smooth' });
    } else {
      el.scrollLeft += dir * 300;
    }
  };

  // For Kammara-style scene modals: world name + description go in the hero
  // block (large), bg gets the world's gradient, and the per-image caption
  // comes from the gallery `labels` (already-translated scene names).
  const handleSceneClick = (index: number) => {
    openGallery(id, index, '', '', modalBg, modalTitle, modalSubtitle);
  };

  // Arrow CSS uses className-style media query so we can hide on mobile
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
    transition: 'color 0.2s ease',
    fontFamily: 'var(--chakra-fonts-glyph)',
    fontSize: 'var(--chakra-font-sizes-glyph-h1)',
    lineHeight: 1,
    '@media (max-width: 48em)': { display: 'none' },
  };

  return (
    <Box position="relative">
      {sectionTitle && (
        <Heading
          as="h2"
          fontFamily="body"
          fontSize="section"
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          marginTop={titleMarginTop}
          marginBottom="0.5rem"
          color={arrowColor}
          css={{
            '@media (max-width: 48em)': { marginTop: '2em' },
          }}
        >
          {sectionTitle}
        </Heading>
      )}
      <Flex align="center">
        <Box
          as="button"
          type="button"
          aria-label="Previous"
          onClick={() => handleArrow(-1)}
          data-testid="scene-strip-arrow-left"
          css={{ ...arrowCss, color: canPrev ? (arrowColor || 'var(--chakra-colors-glyphIdle)') : 'var(--chakra-colors-glyphDisabled)', cursor: canPrev ? 'pointer' : 'default' }}
        >
          ⊷
        </Box>
        <Box
          ref={scrollRef}
          flex={1}
          minWidth={0}
          css={{
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box display="flex" gap="1.5rem" padding="1rem" width="max-content">
            {scenes.map((s, i) => (
              <button
                key={`${s.name}-${i}`}
                type="button"
                onClick={() => handleSceneClick(i)}
                data-testid={`scene-card-${i}`}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <Box
                  css={{
                    width: '400px',
                    height: '225px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                    outline: '2px solid',
                    outlineColor: accentColor || 'var(--chakra-colors-outlineMid)',
                    outlineOffset: '3px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 'var(--chakra-shadows-sceneHover)',
                    },
                    '@media (max-width: 48em)': { width: '250px' },
                    // ~800px range: reduce height to fit inside DSMainCard strip
                    '@media (min-width: 48em) and (max-width: 62em)': { width: '220px', height: '125px' },
                    '@media (min-width: 118.75em)': { width: '550px' },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.name}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
                <Heading
                  as="h4"
                  textStyle="label"
                  textAlign="center"
                  m={0}
                  color={labelColor ?? 'white'}
                  textShadow="labelText"
                >
                  {s.name}
                </Heading>
              </button>
            ))}
          </Box>
        </Box>
        <Box
          as="button"
          type="button"
          aria-label="Next"
          onClick={() => handleArrow(1)}
          data-testid="scene-strip-arrow-right"
          css={{ ...arrowCss, color: canNext ? (arrowColor || 'var(--chakra-colors-glyphIdle)') : 'var(--chakra-colors-glyphDisabled)', cursor: canNext ? 'pointer' : 'default' }}
        >
          ⊶
        </Box>
      </Flex>
    </Box>
  );
}
