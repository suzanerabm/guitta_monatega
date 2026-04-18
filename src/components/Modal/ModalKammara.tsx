'use client';
import { useEffect } from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import { useModal } from './ModalProvider';

function formatFilename(path: string): string {
  const file = path.split('/').pop() || '';
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/[_]/g, ' ')
    .replace(/^\d+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    currentIndex,
    heroTitle,
    heroText,
    color = '#b8a9e8',
    darkColor = '#0a0a2e',
    textColor,
    crestGlyph = '⊙',
    variant,
  } = state;

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
          background: `linear-gradient(160deg, ${darkColor} 0%, ${darkColor}f5 40%, ${darkColor} 100%)`,
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
          color={color}
          transition="opacity 0.3s, transform 0.4s ease-in-out"
          _hover={{ opacity: 0.7, transform: 'scale(0.6)' }}
          _active={{ transform: 'scale(0)', opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          fontFamily="glyph"
          fontSize="glyphH2"
          lineHeight={1}
        >
          ⊙
        </Box>

        {/* Body */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          flex={1}
          px={{ base: 'base', md: '3xl' }}
          pb="4rem"
          gap="xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title + description */}
          {(heroTitle || heroText) && (
            <Flex align="center" gap="0.8rem" flexWrap="wrap" justify="center">
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

          {/* Image + label colada na borda esquerda da foto */}
          <Flex
            position="relative"
            align="flex-end"
            maxW={{ base: '94vw', md: '90vw' }}
            maxH={{ base: '50vh', md: '62vh' }}
          >
            {/* Label rotacionada, 2px da foto, alinhada ao bottom */}
            {techniqueText && (
              <Text
                position="absolute"
                left="-2px"
                bottom="0"
                zIndex={1}
                fontSize="xs"
                letterSpacing="wide"
                textTransform="uppercase"
                color={color}
                opacity={0.5}
                m={0}
                css={{
                  transform: 'translateX(-100%) rotate(-90deg)',
                  transformOrigin: 'right bottom',
                  whiteSpace: 'nowrap',
                }}
              >
                {techniqueText}
              </Text>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={currentImage}
              src={currentImage}
              alt={heroTitle || ''}
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '2px',
              }}
            />
          </Flex>
        </Flex>

        {/* Bottom nav — transparent, planet text color */}
        <Flex
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
            cursor="pointer"
            padding="0.5rem"
            transition="opacity 0.2s, transform 0.2s"
            _hover={{ opacity: 0.7, transform: 'scale(1.15)' }}
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
            cursor="pointer"
            padding="0.5rem"
            transition="opacity 0.2s, transform 0.2s"
            _hover={{ opacity: 0.7, transform: 'scale(1.15)' }}
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
