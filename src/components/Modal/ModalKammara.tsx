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

// Drives the mobile-clean modal layout from the live window dimensions:
//  - isCleanMobile: phone-sized (<=768px wide) OR a phone held sideways
//    (landscape with a short viewport — a landscape phone is ~850px wide but
//    short, so the width cut alone would miss it).
//  - isLandscape: device turned sideways (width > height), so the media can
//    take the full height.
// SSR-safe: starts false (desktop layout) and syncs on mount. Uses
// resize/orientationchange (not matchMedia 'change') because iOS Safari fires
// the matchMedia change unreliably on rotation.
function useMobileModal() {
  const [isCleanMobile, setIsCleanMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta orientação/tamanho direto pelas dimensões da janela. No iOS
    // Safari o evento `change` do matchMedia('(orientation: landscape)') é
    // pouco confiável na rotação (chega tarde ou não chega), o que deixava o
    // modal "preso" no layout de retrato com a tela já deitada. Medir
    // innerWidth/innerHeight em `resize` + `orientationchange` é o que o iOS
    // atualiza de forma confiável após girar.
    const sync = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const landscape = w > h;
      // Mobile-clean: largura de celular (<=768px) OU deitado num viewport
      // curto (celular virado tem ~850px de largura mas altura baixa).
      const cleanMobile = w <= 768 || (landscape && h <= 768);
      setIsLandscape(landscape);
      setIsCleanMobile(cleanMobile);
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
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
  // Swipe só em RETRATO. Em paisagem o arraste horizontal conflitava com o
  // gesto de "voltar" do Safari (saía/reiniciava o modal), então lá a
  // navegação é por setas laterais (abaixo) e o swipe fica desligado.
  const swipeEnabled = isCleanMobile && !isLandscape;
  // Celular DEITADO de verdade. `isLandscape` sozinho também é true num monitor
  // desktop widescreen — usar ele puro pra layout quebrava o desktop (sumia a
  // legenda lateral, colava o texto na margem). Layout só muda no mobile-deitado.
  const mobileLandscape = isCleanMobile && isLandscape;
  const onMediaTouchStart = (e: React.TouchEvent) => {
    if (!swipeEnabled || e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onMediaTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !swipeEnabled) return;
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

      {/* Floating card — IDÊNTICO em retrato e paisagem (20px de margem). O
          retrato já ocupa a tela bem e não trava; paisagem usa a MESMA fórmula
          em vez de um fullscreen próprio (que fazia o iPhone "se perder" ao
          girar). A foto cresce sozinha porque em paisagem ela é deitada.
          overscroll/touch contidos pro gesto não vazar pro Safari. */}
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
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
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
          px={mobileLandscape ? '0' : { base: '0.5rem', md: '3xl' }}
          pt={mobileLandscape ? '0.25rem' : { base: '3rem', md: '4rem' }}
          pb={mobileLandscape ? '0.25rem' : { base: '3.5rem', md: '6rem' }}
          gap={{ base: '0', md: 'lg' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title + description. Desktop: nome + descrição lado a lado. No
              mobile EM PÉ (retrato): nome em cima e descrição EMBAIXO (coluna),
              que tem espaço sobrando. Em paisagem (altura curta) o bloco some.
              `showMobileTitle` = clean mobile em retrato. */}
          {(() => {
            const showMobileTitle = isCleanMobile && !isLandscape;
            if (!heroTitle && !heroText) return null;
            return (
              <Flex
                display={{ base: showMobileTitle ? 'flex' : 'none', md: 'flex' }}
                direction={{ base: 'column', md: 'row' }}
                align="center"
                gap={{ base: '0.5rem', md: '0.8rem' }}
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
                {/* Descrição: aparece no retrato mobile (embaixo) e no desktop. */}
                {heroText && (
                  <Text
                    fontSize="sm"
                    lineHeight={1.5}
                    fontWeight="light"
                    color={navColor}
                    m={0}
                    maxW="280px"
                    textAlign={{ base: 'center', md: 'left' }}
                    opacity={0.7}
                  >
                    {heroText}
                  </Text>
                )}
              </Flex>
            );
          })()}

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
              width={mobileLandscape ? '100%' : { base: '94vw', md: '100%' }}
              maxW={mobileLandscape ? '100%' : { base: '94vw', md: '90vw' }}
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
              ) : isCleanMobile ? (
                // Mobile: plain image, no zoom/pan. The media already fills the
                // screen and pinch would fight the swipe. objectFit contain
                // keeps the whole frame visible.
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={heroTitle || techniqueText || ''}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    display: 'block',
                  }}
                />
              ) : (
                <ZoomableImage
                  key={currentImage}
                  src={currentImage}
                  alt={heroTitle || techniqueText || ''}
                  maxHeight="100%"
                />
              )}

              {/* Setas laterais — SÓ no MOBILE em paisagem. Substituem o swipe
                  (que conflitava com o "voltar" do Safari). Flutuam sobre as
                  bordas da mídia, fáceis pro polegar de quem segura o aparelho
                  deitado. No desktop widescreen (também paisagem) NÃO aparecem —
                  lá vale a nav-rodapé. */}
              {isCleanMobile && isLandscape && (
                <>
                  <Box
                    as="button"
                    aria-label="Previous"
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    position="absolute"
                    left="0"
                    top="50%"
                    zIndex={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="48px"
                    minH="48px"
                    bg="none"
                    border="none"
                    color={color}
                    fontFamily="glyph"
                    fontSize="glyphH1"
                    lineHeight={1}
                    css={{
                      cursor: 'pointer',
                      transform: 'translateY(-50%)',
                      textShadow: `0 2px 10px ${darkColor}`,
                      '& *': { cursor: 'pointer' },
                    }}
                  >
                    ⊷
                  </Box>
                  <Box
                    as="button"
                    aria-label="Next"
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    position="absolute"
                    right="0"
                    top="50%"
                    zIndex={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="48px"
                    minH="48px"
                    bg="none"
                    border="none"
                    color={color}
                    fontFamily="glyph"
                    fontSize="glyphH1"
                    lineHeight={1}
                    css={{
                      cursor: 'pointer',
                      transform: 'translateY(-50%)',
                      textShadow: `0 2px 10px ${darkColor}`,
                      '& *': { cursor: 'pointer' },
                    }}
                  >
                    ⊶
                  </Box>
                </>
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

        {/* Bottom nav — setas no rodapé. Aparece em RETRATO (mobile) e no
            DESKTOP (inclusive widescreen, que é paisagem mas não-mobile). Só
            some no MOBILE deitado, onde as setas vão pras laterais. */}
        <Flex
          display={isCleanMobile && isLandscape ? 'none' : 'flex'}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          align="center"
          justify="center"
          gap="3xl"
          py={{ base: '1rem', md: '1.6rem' }}
          bg="transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            as="button"
            aria-label="Previous"
            bg="none"
            border="none"
            color={color}
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
            color={color}
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
            color={color}
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
