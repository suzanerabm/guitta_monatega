'use client';
import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useParallax } from '@/hooks/useParallax';

export interface CreatureSectionProps {
  gradient: string;
  accentColor?: string;
  id?: string;
  bgImage?: string;
  noParallax?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}

export function CreatureSection({
  gradient,
  accentColor,
  id,
  bgImage,
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
      <Box
        data-testid="creature-section-bg"
        position="absolute"
        inset={noParallax ? '0' : '-40% 0'}
        zIndex={0}
        style={{ background: gradient }}
      />
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
              objectFit: 'cover',
              opacity: 0.55,
              display: 'block',
            }}
          />
        </Box>
      )}
      {accentColor && (
        <Box
          aria-hidden
          position="absolute"
          inset="0"
          zIndex={0}
          pointerEvents="none"
          css={{
            background: `radial-gradient(ellipse at 30% 20%, ${accentColor}15 0%, transparent 70%)`,
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
