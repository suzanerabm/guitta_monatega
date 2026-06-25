'use client';
import { useRef, useState } from 'react';
import { Box, Flex, Text, chakra } from '@chakra-ui/react';
import { LazyVideo } from '@/components/LazyVideo';
import type { BichittoVideo } from '@/data/bichittos';

export interface BichittoVideoCarouselProps {
  videos: BichittoVideo[];
  /** Cor da borda/setas (cor do bichitto). */
  color: string;
  /** Largura do card de vídeo. Default responsivo. */
  'data-testid'?: string;
}

/**
 * Carrossel de vídeo "um por vez": mostra UM clipe do bichitto, ocupando uma
 * só posição. Troca de clipe pela seta (desktop) ou swipe (mobile). Alinhado à
 * esquerda. O vídeo toca quando visível (LazyVideo, sem travar a página).
 */
export function BichittoVideoCarousel({
  videos,
  color,
  'data-testid': testId,
}: BichittoVideoCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (videos.length === 0) return null;

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + videos.length) % videos.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) < 50) return;
    go(dx < 0 ? 1 : -1);
  };

  const current = videos[index];
  const multiple = videos.length > 1;

  return (
    <Box data-testid={testId} width={{ base: '100%', md: '420px' }}>
      <Flex align="center" gap="sm">
        {/* Seta anterior (desktop, só se houver mais de um) */}
        {multiple && (
          <chakra.button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            display={{ base: 'none', md: 'flex' }}
            css={{
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color,
              fontSize: '1.8rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ‹
          </chakra.button>
        )}

        {/* Card de vídeo — uma posição só */}
        <Box
          flex={1}
          minWidth={0}
          position="relative"
          borderRadius="16px"
          overflow="hidden"
          aspectRatio="16 / 9"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          css={{
            outline: `2px solid ${color}`,
            outlineOffset: '4px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.3)',
          }}
        >
          <LazyVideo
            key={current.src}
            src={current.src}
            poster={current.poster}
            alt={current.label}
            fit="cover"
            playOn="visible"
          />
          {/* Rótulo dentro, embaixo */}
          <Text
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            m={0}
            px="0.8rem"
            py="0.6rem"
            fontSize="sm"
            fontWeight="bold"
            color="white"
            css={{
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))',
            }}
          >
            {current.label}
          </Text>
        </Box>

        {/* Seta próximo (desktop) */}
        {multiple && (
          <chakra.button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            display={{ base: 'none', md: 'flex' }}
            css={{
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color,
              fontSize: '1.8rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ›
          </chakra.button>
        )}
      </Flex>

      {/* Pontinhos indicadores (quando há mais de um) */}
      {multiple && (
        <Flex gap="0.4rem" mt="0.6rem" justify={{ base: 'center', md: 'flex-start' }} pl={{ md: '2.3rem' }}>
          {videos.map((v, i) => (
            <Box
              key={v.src}
              as="button"
              aria-label={`Vídeo ${i + 1}`}
              onClick={() => setIndex(i)}
              width="8px"
              height="8px"
              borderRadius="50%"
              css={{
                background: i === index ? color : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}
