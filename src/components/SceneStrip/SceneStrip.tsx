'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useModal } from '@/components/Modal';

export interface SceneStripScene {
  name: string;
  image: string;
  /** When set, this scene is a looping video instead of an image. It plays
   *  in the card (muted, autoplay, loop) and is NOT opened in the modal —
   *  `image` is used as its poster while it loads. */
  video?: string;
}

export interface SceneStripProps {
  scenes: SceneStripScene[];
  sectionTitle?: string;
  labelColor?: string;
  arrowColor?: string;
  accentColor?: string;
  mobileColor?: string;
  modalBg?: string;
  modalBgOpacity?: number;
  modalTitle?: string;
  modalSubtitle?: string;
  /** Crest glyph for Kammara modal watermark. When set, opens ModalKammara. */
  crestGlyph?: string;
  /** Dark base color for the Kammara modal. Required when crestGlyph is set. */
  darkColor?: string;
  galleryId?: string;
  /**
   * Override the top margin above the section title ("CENAS"). Defaults
   * to `5em` (the kammara world default). Used by the triplec sub-regions
   * to sit closer to the DSTextPanel that precedes them.
   */
  titleMarginTop?: string;
  /**
   * When true, the per-scene caption below each thumbnail is not rendered.
   * Useful in contexts where the scene name is redundant (TripleC regions,
   * where the section already speaks for itself) and we want a leaner look.
   */
  hideLabel?: boolean;
  /**
   * Visual variant of the thumbnail outline.
   *  - `'default'` — solid, used by worlds/planets
   *  - `'region'` — dashed, used by TripleC sub-regions to match the
   *    other region-scoped cards (KammaraCardRegion family)
   */
  variant?: 'default' | 'region';
}

export function SceneStrip({
  scenes,
  sectionTitle,
  labelColor,
  arrowColor,
  accentColor,
  mobileColor,
  modalBg,
  modalTitle,
  modalSubtitle,
  crestGlyph,
  darkColor,
  galleryId,
  titleMarginTop = '5em',
  hideLabel = false,
  variant = 'default',
}: SceneStripProps) {
  const isRegion = variant === 'region';
  // Scene card size per breakpoint — planets use the default grid, regions
  // get slightly bigger cards from lg+ so they fill the sidebar next to the
  // region panel. Mobile (base/md) is identical in both variants.
  const cardWidth: Record<string, string> = isRegion
    ? { base: '250px', md: '220px', lg: '480px' }
    : { base: '250px', md: '220px', lg: '400px', '3xl': '550px' };
  const cardHeight: Record<string, string> = isRegion
    ? { base: '225px', md: '125px', lg: '270px' }
    : { base: '225px', md: '125px', lg: '225px' };
  const fallbackId = useId();
  const id = galleryId ?? `scene-strip-${fallbackId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { registerGallery, openGallery, openKammaraGallery } = useModal();
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
      scenes.map((s) => s.name),
      scenes.map((s) => s.video)
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
    if (crestGlyph && accentColor && darkColor) {
      openKammaraGallery({
        galleryId: id,
        startIndex: index,
        color: accentColor,
        darkColor,
        crestGlyph,
        heroTitle: modalTitle,
        heroText: modalSubtitle,
      });
    } else {
      openGallery(id, index, '', '', modalBg, modalTitle, modalSubtitle);
    }
  };

  return (
    <Box position="relative" width="100%" minWidth={0}>
      {sectionTitle && (
        <Heading
          as="h2"
          fontFamily="body"
          // `lg` is the closest canonical breakpoint to the old 64em cut — the
          // ~32px difference isn't visually perceptible for this font-size jump.
          fontSize={{ base: 'section', md: '0.85rem', lg: 'section' }}
          letterSpacing="wider"
          textTransform="uppercase"
          fontWeight="semibold"
          padding="0 2rem"
          marginTop={{ base: '2em', md: titleMarginTop }}
          marginBottom="0.5rem"
          color={
            mobileColor
              ? { base: mobileColor, md: arrowColor ?? mobileColor }
              : arrowColor
          }
        >
          {sectionTitle}
        </Heading>
      )}
      <Flex align="center">
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
                  width={cardWidth}
                  height={cardHeight}
                  borderRadius="16px"
                  overflow="hidden"
                  background="rgba(0,0,0,0.3)"
                  backdropFilter="blur(8px)"
                  outline="2px solid"
                  outlineColor={{
                    base: mobileColor || accentColor || 'outlineMid',
                    md: accentColor || 'outlineMid',
                  }}
                  outlineOffset="6px"
                  boxShadow={
                    accentColor
                      ? `0 20px 60px ${accentColor}50, 0 4px 16px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.15)`
                      : '0 8px 32px rgba(0,0,0,0.1)'
                  }
                  transition="transform 0.3s ease, box-shadow 0.3s ease"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: 'sceneHover',
                  }}
                >
                  {s.video ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={s.image}
                      preload="metadata"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    >
                      {s.video.endsWith('.mp4') && (
                        <source src={s.video.replace(/\.mp4$/, '.webm')} type="video/webm" />
                      )}
                      <source src={s.video} type="video/mp4" />
                    </video>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
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
                  )}
                </Box>
                {!hideLabel && (
                  <Heading
                    as="h4"
                    textStyle="label"
                    textAlign="center"
                    m={0}
                    color={
                      mobileColor
                        ? { base: mobileColor, md: labelColor || 'white' }
                        : labelColor || 'white'
                    }
                    textShadow="labelText"
                  >
                    {s.name}
                  </Heading>
                )}
              </button>
            ))}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
