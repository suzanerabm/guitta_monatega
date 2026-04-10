'use client';
import { useEffect } from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModal } from './ModalProvider';
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
  const customBg = effectiveTheme && effectiveTheme !== 'dark' && effectiveTheme !== 'light' ? effectiveTheme : undefined;

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
      bg={customBg || (isDark ? 'modalBgDark' : 'modalBgLight')}
      onClick={close}
    >
      {/* Close button */}
      <Box
        as="button"
        type="button"
        position="absolute"
        top="lg"
        right="3xl"
        zIndex={201}
        bg="none"
        border="none"
        cursor="pointer"
        color={isDark ? 'textOverlayDim' : 'inkMuted'}
        transition="color 0.2s"
        _hover={{ color: isDark ? 'white' : 'ink' }}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <X size={20} strokeWidth={1.5} />
      </Box>

      {/* Body */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        flex={1}
        px={{ base: 'base', md: '3xl' }}
        pt={{ base: '4xl', md: '3xl' }}
        pb="5rem"
        gap="md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero block (optional) */}
        {(heroTitle || heroText) && (
          <Box px="3xl" py="lg" pb="base" maxW="600px" textAlign="center">
            {heroTitle && (
              <Heading
                as="h2"
                fontSize="h2"
                fontWeight="bold"
                letterSpacing="tight"
                mb="sm"
                color={isDark ? 'white' : 'ink'}
              >
                {heroTitle}
              </Heading>
            )}
            {heroText && (
              <Text
                fontSize="base"
                lineHeight={1.5}
                fontWeight="light"
                color={isDark ? 'textOverlay' : 'inkSoft'}
              >
                {heroText}
              </Text>
            )}
          </Box>
        )}

        {/* Header (title + technique) */}
        <Flex direction="column" align="center" gap="0.2rem">
          {title && (
            <Heading
              as="h3"
              fontSize="2xl"
              fontWeight="bold"
              color={isDark ? 'white' : 'ink'}
              m={0}
            >
              {title}
            </Heading>
          )}
          {techniqueText && (
            <Text
              fontSize="sm"
              letterSpacing="wide"
              textTransform="uppercase"
              color={isDark ? 'textOverlayFaint' : 'inkMuted'}
              m={0}
            >
              {techniqueText}
            </Text>
          )}
        </Flex>

        {/* Image */}
        <Flex
          maxW={{ base: '92vw', md: '75vw' }}
          maxH={{ base: '55vh', md: '65vh' }}
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
              maxHeight: '63vh',
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
        py="1.2rem"
        bg={isDark ? 'modalNavBgDark' : 'modalNavBgLight'}
        backdropFilter="blur(8px)"
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          as="button"
          type="button"
          aria-label="Previous"
          bg="none"
          border="1px solid"
          borderColor={isDark ? 'textOverlayGhost' : 'border'}
          color={isDark ? 'textOverlayDim' : 'inkMuted'}
          cursor="pointer"
          px="base"
          py="tight"
          borderRadius="4px"
          transition="all 0.2s"
          _hover={{
            borderColor: isDark ? 'white' : 'ink',
            color: isDark ? 'white' : 'ink',
          }}
          onClick={prev}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </Box>

        <Text
          fontSize="sm"
          color={isDark ? 'textOverlayFaint' : 'subtle'}
          letterSpacing="wide"
        >
          {currentIndex + 1} / {images.length}
        </Text>

        <Box
          as="button"
          type="button"
          aria-label="Next"
          bg="none"
          border="1px solid"
          borderColor={isDark ? 'textOverlayGhost' : 'border'}
          color={isDark ? 'textOverlayDim' : 'inkMuted'}
          cursor="pointer"
          px="base"
          py="tight"
          borderRadius="4px"
          transition="all 0.2s"
          _hover={{
            borderColor: isDark ? 'white' : 'ink',
            color: isDark ? 'white' : 'ink',
          }}
          onClick={next}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </Box>
      </Flex>
    </Flex>
  );
}
