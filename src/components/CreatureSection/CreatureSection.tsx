'use client';
import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useParallax } from '@/hooks/useParallax';

export interface CreatureSectionProps {
  gradient: string;
  accentColor?: string;
  id?: string;
  bgImage?: string;
  /**
   * Opacity of the `bgImage` layer over the gradient. Defaults to 0.3.
   * Raise this when the gradient color clashes with the image's palette
   * (the default blend tints the image heavily on worlds whose gradient
   * is a saturated non-neutral color, like triplec's purple).
   */
  bgOpacity?: number;
  /**
   * When true, the gradient is rendered ON TOP of the image with
   * mix-blend-mode: multiply. Whites in the gradient become transparent
   * (letting the image show), colors tint the image, darks intensify.
   * Use this for regions with bright bg images that wash out normal
   * gradients (e.g. sharp).
   */
  blendGradient?: boolean;
  /**
   * objectFit da imagem de fundo. Default `'cover'` (preenche e corta as
   * bordas — Kammara depende disso). Os bichittos passam `'contain'` quando
   * querem mostrar a cena de fundo INTEIRA, sem cortar.
   */
  bgFit?: 'cover' | 'contain';
  noParallax?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}

export function CreatureSection({
  gradient,
  accentColor,
  id,
  bgImage,
  bgOpacity = 0.3,
  blendGradient = false,
  bgFit = 'cover',
  noParallax = false,
  hidden = false,
  children,
}: CreatureSectionProps) {
  const bgImgRef = useRef<HTMLDivElement>(null);
  // Always call the hook; pass a null-current ref when parallax is disabled.
  const parallaxRef = useRef<HTMLDivElement>(null);
  useParallax(noParallax ? parallaxRef : bgImgRef, 0.15);

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      data-testid="creature-section"
      data-section-creature={id}
      style={{
        transition: 'opacity 0.4s ease, max-height 0.5s ease',
        opacity: hidden ? 0 : 1,
        maxHeight: hidden ? 0 : undefined,
      }}
    >
      {!blendGradient && (
        <Box
          data-testid="creature-section-bg"
          position="absolute"
          inset={noParallax ? '0' : '-40% 0'}
          zIndex={0}
          style={{ background: gradient }}
        />
      )}
      {bgImage && (
        <Box
          ref={bgImgRef}
          data-testid="creature-section-bg-image"
          position="absolute"
          top={noParallax ? 0 : '-20%'}
          left={0}
          right={0}
          bottom={noParallax ? 0 : '-20%'}
          zIndex={0}
          willChange="transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: bgFit,
              opacity: blendGradient ? 1 : bgOpacity,
              display: 'block',
            }}
          />
        </Box>
      )}
      {blendGradient && (
        <Box
          data-testid="creature-section-bg-blend"
          position="absolute"
          inset={noParallax ? '0' : '-40% 0'}
          zIndex={0}
          style={{
            background: gradient,
            mixBlendMode: 'multiply',
          }}
        />
      )}
      <Box
        position="relative"
        zIndex={1}
        padding={{ base: '1rem 0', md: '2rem 0' }}
      >
        {children}
      </Box>
    </Box>
  );
}
