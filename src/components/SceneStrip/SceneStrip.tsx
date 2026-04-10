'use client';
import { useEffect, useId, useRef } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  modalBg?: string;
  modalBgOpacity?: number;
  modalTitle?: string;
  modalSubtitle?: string;
  galleryId?: string;
}

export function SceneStrip({
  scenes,
  sectionTitle,
  labelColor,
  arrowColor,
  modalBg,
  modalTitle,
  modalSubtitle,
  galleryId,
}: SceneStripProps) {
  const fallbackId = useId();
  const id = galleryId ?? `scene-strip-${fallbackId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { registerGallery, openGallery } = useModal();

  useEffect(() => {
    registerGallery(
      id,
      scenes.map((s) => s.image),
      scenes.map((s) => s.name)
    );
  }, [id, scenes, registerGallery]);

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
    color: arrowColor ?? 'var(--chakra-colors-textOverlayDim)',
    transition: 'opacity 0.2s ease',
    '@media (max-width: 48em)': { display: 'none' },
  };

  return (
    <Box position="relative" padding="1rem 0">
      {sectionTitle && (
        <Heading
          as="h2"
          css={{
            fontSize: 'var(--font-sizes-section, 2rem)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
            padding: '0 2rem',
            marginTop: '5em',
            marginBottom: '0.5rem',
            color: arrowColor,
            // Mobile: tighter top margin
            '@media (max-width: 48em)': { marginTop: '2em' },
            // XL screens (>=1900px): larger title
            '@media (min-width: 118.75em)': { fontSize: 'var(--chakra-font-sizes-h3)' },
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
          css={arrowCss}
        >
          <ChevronLeft size={40} />
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
                    width: '300px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '16 / 9',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 'var(--chakra-shadows-sceneHover)',
                    },
                    // Mobile (<=768px): smaller cards
                    '@media (max-width: 48em)': { width: '250px' },
                    // XL screens (>=1900px): bigger cards
                    '@media (min-width: 118.75em)': { width: '500px' },
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
          css={arrowCss}
        >
          <ChevronRight size={40} />
        </Box>
      </Flex>
    </Box>
  );
}
