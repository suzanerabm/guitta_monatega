'use client';
import { useEffect } from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import { useModal } from './ModalProvider';
import { GlyphPlanet } from '@/components/GlyphPlanet';
import { useChromeTint } from '@/components/ChromeTint';

function formatFilename(path: string): string {
  const file = path.split('/').pop() || '';
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/[_]/g, ' ')
    .replace(/^\d+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function Modal() {
  const { state, close, next, prev } = useModal();
  const { isOpen, images, labels, currentIndex, title, technique, theme, heroTitle, heroText } = state;
  const { tintColor } = useChromeTint();

  // Theme resolution priority:
  // 1. Explicit `theme` prop on openGallery (e.g. 'dark', or a custom color)
  // 2. Active chrome tint color (current page filter)
  // 3. Light default
  const effectiveTheme = theme ?? tintColor ?? undefined;
  const isDark = effectiveTheme === 'dark' || (effectiveTheme && effectiveTheme !== 'light');

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, close, next, prev]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  // Caption priority:
  // 1. Explicit `technique` (Art page passes the technique name)
  // 2. Per-image `labels` from the gallery (Kammara passes pre-translated scene names)
  // 3. Fallback: derive from filename
  const techniqueText =
    technique || labels?.[currentIndex] || formatFilename(currentImage);

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={200}
      direction="column"
      bg={tintColor || (isDark ? 'modalBgDark' : 'modalBgLight')}
      onClick={close}
    >
      {/* Close button */}
      <Box
        as="button"
        position="absolute"
        top="lg"
        right="3xl"
        zIndex={201}
        bg="none"
        border="none"
        cursor="pointer"
        color={isDark ? 'glyphIdle' : 'inkMuted'}
        transition="color 0.3s, transform 0.4s ease-in-out"
        _hover={{ color: isDark ? 'glyphHover' : 'ink', transform: 'scale(0.6)' }}
        _active={{ transform: 'scale(0)', opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        fontFamily="glyph"
        fontSize="glyphH2"
        lineHeight={1}
        css={{
          '@keyframes breathe': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(0.6)' },
            '100%': { transform: 'scale(1)' },
          },
          '&:hover': {
            animation: 'breathe 0.8s ease-in-out',
          },
        }}
      >
        ⊙
      </Box>

      {/* Body */}
      <Flex
        direction="column"
        align="center"
        justify="flex-start"
        flex={1}
        px={{ base: 'base', md: '3xl' }}
        pt={{ base: '2rem', md: '1.5rem' }}
        pb="5rem"
        gap="md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TITULO [glifo] texto descricao breve */}
        {(heroTitle || heroText || title) && (
          <Flex align="center" gap="0.8rem" flexWrap="wrap" justify="center">
            <Heading
              as="h2"
              fontSize="h2"
              fontWeight="bold"
              letterSpacing="tight"
              color={isDark ? 'white' : 'ink'}
              m={0}
            >
              {heroTitle || title}
            </Heading>
            {heroText && (
              <>
                <GlyphPlanet
                  size="h3"
                  color={isDark ? 'textOverlayGhost' : 'inkMuted'}
                />
                <Text
                  fontSize="sm"
                  lineHeight={1.5}
                  fontWeight="light"
                  color={isDark ? 'textOverlay' : 'inkSoft'}
                  m={0}
                  maxW="280px"
                  textAlign="left"
                >
                  {heroText}
                </Text>
              </>
            )}
          </Flex>
        )}

        {/* Nome da foto */}
        {techniqueText && (
          <Text
            fontSize="sm"
            letterSpacing="wide"
            textTransform="uppercase"
            color={isDark ? 'textOverlayFaint' : 'inkMuted'}
            mt="1.5rem"
          >
            {techniqueText}
          </Text>
        )}

        {/* Image */}
        <Flex
          maxW={{ base: '92vw', md: '75vw' }}
          maxH={{ base: '50vh', md: '58vh' }}
          align="center"
          justify="center"
          bg={isDark ? 'modalImgBgDark' : 'surface'}
          borderRadius="4px"
          boxShadow={isDark ? 'none' : 'md'}
          p="base"
        >
          <img
            src={currentImage}
            alt={title}
            style={{
              maxWidth: '100%',
              maxHeight: '56vh',
              objectFit: 'contain',
              borderRadius: '2px',
            }}
          />
        </Flex>
      </Flex>

      {/* Bottom nav */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        align="center"
        justify="center"
        gap="3xl"
        py="1.6rem"
        bg={isDark ? 'modalNavBgDark' : 'modalNavBgLight'}
        backdropFilter="blur(8px)"
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          as="button"
          aria-label="Previous"
          bg="none"
          border="none"
          color={isDark ? 'glyphIdle' : 'inkMuted'}
          cursor="pointer"
          padding="0.5rem"
          transition="color 0.2s, transform 0.2s"
          _hover={{
            color: isDark ? 'glyphHover' : 'ink',
            transform: 'scale(1.15)',
          }}
          onClick={prev}
          fontFamily="glyph"
          fontSize="glyphH1"
          lineHeight={1}
        >
          ⊷
        </Box>

        <Text
          fontSize="md"
          color={isDark ? 'glyphIdle' : 'ink'}
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
          color={isDark ? 'glyphIdle' : 'inkMuted'}
          cursor="pointer"
          padding="0.5rem"
          transition="color 0.2s, transform 0.2s"
          _hover={{
            color: isDark ? 'glyphHover' : 'ink',
            transform: 'scale(1.15)',
          }}
          onClick={next}
          fontFamily="glyph"
          fontSize="glyphH1"
          lineHeight={1}
        >
          ⊶
        </Box>
      </Flex>
    </Flex>
  );
}
