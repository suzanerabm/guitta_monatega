'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import { useModal } from './ModalProvider';
import { ZoomableImage } from '@/components/ZoomableImage';
import { KammaraWatermark } from '@/components/KammaraWatermark';

function formatFilename(path: string): string {
  const file = path.split('/').pop() || '';
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/[_]/g, ' ')
    .replace(/^\d+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Reads two media queries to drive the mobile-clean modal layout:
//  - isCleanMobile: phone-sized OR a phone held sideways (landscape with a
//    short viewport). The width cut alone (<=48em) misses a landscape phone,
//    whose width is ~850px; the orientation+max-height clause catches it
//    without affecting wide desktops in landscape (their height is >>48em).
//  - isLandscape: true when the device is turned sideways, so the media can
//    take the full height.
// SSR-safe: starts false (desktop layout) and syncs on mount.
function useMobileModal() {
  const [isCleanMobile, setIsCleanMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const cleanQuery = window.matchMedia(
      '(max-width: 48em), (orientation: landscape) and (max-height: 48em)',
    );
    const landscapeQuery = window.matchMedia('(orientation: landscape)');

    const sync = () => {
      setIsCleanMobile(cleanQuery.matches);
      setIsLandscape(landscapeQuery.matches);
    };
    sync();
    cleanQuery.addEventListener('change', sync);
    landscapeQuery.addEventListener('change', sync);
    return () => {
      cleanQuery.removeEventListener('change', sync);
      landscapeQuery.removeEventListener('change', sync);
    };
  }, []);

  return { isCleanMobile, isLandscape };
}

/**
 * ModalKammara — Kammara-themed image gallery modal.
 *
 * Floating card (20px margin, rounded corners, accent border glow)
 * with crest watermarks. Uses planet colors for all visual elements.
 */
export function ModalKammara() {
  const { state, close, next, prev } = useModal();
  const {
    isOpen,
    images,
    labels,
    videos,
    currentIndex,
    heroTitle,
    heroText,
    color = '#b8a9e8',
    darkColor = '#0a0a2e',
    textColor,
    crestGlyph = '⊙',
    variant,
  } = state;

  const { isCleanMobile, isLandscape } = useMobileModal();

  // Swipe-to-navigate on mobile. Records the touch start, and on touch end
  // fires next()/prev() when the horizontal travel dominates (>=50px and
  // clearly more horizontal than vertical). On mobile the media is a plain
  // <img> (no ZoomableImage), so nothing competes for the gesture. Only armed
  // on the clean-mobile layout.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onMediaTouchStart = (e: React.TouchEvent) => {
    if (!isCleanMobile || e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onMediaTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !isCleanMobile) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  useEffect(() => {
    if (!isOpen || variant !== 'kammara') return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, variant, close, next, prev]);

  if (!isOpen || variant !== 'kammara') return null;

  const currentImage = images[currentIndex];
  const currentVideo = videos?.[currentIndex];
  const techniqueText =
    labels?.[currentIndex] || formatFilename(currentImage);
  const navColor = textColor ?? color;

  return (
    <>
      <style>{`
        @keyframes km-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%      { transform: translate(-50%, -50%) scale(1.03); }
        }
      `}</style>

      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={199}
        onClick={close}
        css={{ background: 'rgba(0,0,0,0.7)' }}
      />

      {/* Floating card */}
      <Flex
        position="fixed"
        top="20px"
        left="20px"
        right="20px"
        bottom="20px"
        zIndex={200}
        direction="column"
        borderRadius="28px"
        overflow="hidden"
        css={{
          background: `${darkColor}d5`,
          border: `1px solid ${color}35`,
          outline: `2px solid ${color}`,
          outlineOffset: '4px',
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${color}15, 0 0 120px ${color}08`,
        }}
      >
        {/* Crest watermark — accent color, 15% opacity via hex alpha */}
        <Box
          position="absolute"
          top="50%"
          left="70%"
          pointerEvents="none"
          aria-hidden="true"
          opacity={0.15}
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: 'clamp(10rem, 30vw, 20rem)',
            lineHeight: 1,
            color,
            userSelect: 'none',
            animation: 'km-pulse 6s ease-in-out infinite',
            willChange: 'transform',
          }}
        >
          {crestGlyph}
        </Box>

        {/* Secondary crest echo */}
        <Box
          position="absolute"
          top="25%"
          left="15%"
          pointerEvents="none"
          aria-hidden="true"
          opacity={0.15}
          css={{
            fontFamily: 'var(--chakra-fonts-glyph)',
            fontSize: '7rem',
            lineHeight: 1,
            color,
            userSelect: 'none',
            transform: 'translate(-50%, -50%) rotate(-12deg)',
          }}
        >
          {crestGlyph}
        </Box>

        {/* Close button — sized as a comfortable touch target (≥44px) with
            the glyph centered, so it's easy to tap on mobile. The hover
            scale animates the inner glyph only, keeping the hit area stable. */}
        <Box
          as="button"
          aria-label="Close"
          position="absolute"
          top={{ base: 'sm', md: 'md' }}
          right={{ base: 'sm', md: 'lg' }}
          zIndex={201}
          display="flex"
          alignItems="center"
          justifyContent="center"
          minW="48px"
          minH="48px"
          bg="none"
          border="none"
          color={color}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          fontFamily="glyph"
          fontSize="glyphH2"
          lineHeight={1}
          css={{
            cursor: 'pointer',
            '& *': { cursor: 'pointer' },
            '& .km-close-glyph': {
              display: 'block',
              transition: 'opacity 0.3s, transform 0.4s ease-in-out',
            },
            '&:hover .km-close-glyph': { opacity: 0.7, transform: 'scale(0.6)' },
            '&:active .km-close-glyph': { transform: 'scale(0)', opacity: 0 },
          }}
        >
          <span className="km-close-glyph">⊙</span>
        </Box>

        {/* Body — `minH={0}` lets the flex child actually shrink so the image
            box can be capped by available height instead of overflowing. The
            generous bottom padding reserves room for the absolute bottom nav
            (pagination) so it never sits on top of the image. */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          flex={1}
          minH={0}
          px={{ base: 'base', md: '3xl' }}
          pt={{ base: '3.5rem', md: '4rem' }}
          pb={{ base: '5rem', md: '6rem' }}
          gap={{ base: 'md', md: 'lg' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title + description */}
          {(heroTitle || heroText) && (
            <Flex
              display={{ base: 'none', md: 'flex' }}
              align="center"
              gap="0.8rem"
              flexWrap="wrap"
              justify="center"
            >
              <Heading
                as="h2"
                fontSize="h2"
                fontWeight="bold"
                letterSpacing="tight"
                color={color}
                m={0}
                css={{ textShadow: `0 0 24px ${color}40` }}
              >
                {heroTitle}
              </Heading>
              {heroText && (
                <Text
                  fontSize="sm"
                  lineHeight={1.5}
                  fontWeight="light"
                  color={navColor}
                  m={0}
                  maxW="280px"
                  textAlign="left"
                  opacity={0.7}
                >
                  {heroText}
                </Text>
              )}
            </Flex>
          )}

          {/* Image + label. Mobile: label sits horizontally below the photo
              (the side label is hard to read sideways on a phone, and the
              image is bigger here — 70vh). Desktop: label is rotated and
              anchored to the photo's bottom-left, as before. Zoom/pan is
              handled by ZoomableImage so the gesture stays inside the modal
              instead of zooming the page. */}
          <Flex
            direction="column"
            align="center"
            gap="sm"
            minH={0}
            flex={1}
            width="100%"
          >
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              minH={0}
              flex={1}
              width={{ base: '94vw', md: '100%' }}
              maxW={{ base: '94vw', md: '90vw' }}
              onTouchStart={onMediaTouchStart}
              onTouchEnd={onMediaTouchEnd}
            >
              {currentVideo ? (
                <video
                  key={currentVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  poster={currentImage}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    display: 'block',
                  }}
                >
                  {currentVideo.endsWith('.mp4') && (
                    <source src={currentVideo.replace(/\.mp4$/, '.webm')} type="video/webm" />
                  )}
                  <source src={currentVideo} type="video/mp4" />
                </video>
              ) : (
                <ZoomableImage
                  key={currentImage}
                  src={currentImage}
                  alt={heroTitle || ''}
                  maxHeight="100%"
                />
              )}

              {/* Origin stamp over the media — same crest + world mark as the
                  cards. Non-interactive, so video controls and zoom still work. */}
              {variant === 'kammara' && heroTitle && (
                <KammaraWatermark crestGlyph={crestGlyph} worldName={heroTitle} size="modal" placement="center" />
              )}

              {/* Side label (desktop only) — rotated, bottom-left of photo. */}
              {techniqueText && (
                <Text
                  display={{ base: 'none', md: 'block' }}
                  position="absolute"
                  left="0"
                  bottom="40px"
                  zIndex={1}
                  fontSize="sm"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  color={color}
                  m={0}
                  css={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'left bottom',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {techniqueText}
                </Text>
              )}
            </Box>

            {/* Bottom label removido: no mobile o modal é clean (sem label). */}
          </Flex>
        </Flex>

        {/* Bottom nav — transparent, planet text color */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          align="center"
          justify="center"
          gap="3xl"
          py="1.6rem"
          bg="transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            as="button"
            aria-label="Previous"
            bg="none"
            border="none"
            color={navColor}
            padding="0.5rem"
            transition="opacity 0.2s, transform 0.2s"
            _hover={{ opacity: 0.7, transform: 'scale(1.15)' }}
            css={{ cursor: 'pointer', '& *': { cursor: 'pointer' } }}
            onClick={prev}
            fontFamily="glyph"
            fontSize="glyphH1"
            lineHeight={1}
          >
            ⊷
          </Box>

          <Text
            fontSize="md"
            color={navColor}
            letterSpacing="wide"
            fontFamily="glyph"
          >
            {currentIndex + 1} / {images.length}
          </Text>

          <Box
            as="button"
            aria-label="Next"
            bg="none"
            border="none"
            color={navColor}
            padding="0.5rem"
            transition="opacity 0.2s, transform 0.2s"
            _hover={{ opacity: 0.7, transform: 'scale(1.15)' }}
            css={{ cursor: 'pointer', '& *': { cursor: 'pointer' } }}
            onClick={next}
            fontFamily="glyph"
            fontSize="glyphH1"
            lineHeight={1}
          >
            ⊶
          </Box>
        </Flex>
      </Flex>
    </>
  );
}
