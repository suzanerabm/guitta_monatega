'use client';
import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Programmatic star field for the Kammara main section. Generates 250 random
 * white dots via box-shadow then applies a slow parallax scroll effect.
 *
 * Mirrors the Astro original `#kammara-stars` element inside the Kammara
 * CreatureSection.
 */
export function KammaraStarField() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Find the parent creature section (the positioned ancestor)
    const section = canvas.closest(
      '[data-section-creature="kammara"]'
    ) as HTMLElement | null;
    if (!section) return;

    const w = section.offsetWidth;
    const h = section.offsetHeight;
    const count = 250;
    const shadows: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * w);
      const y = Math.floor(Math.random() * h);
      const opacity = (0.2 + Math.random() * 0.6).toFixed(2);
      const blur = Math.random() < 0.1 ? '1px' : '0';
      shadows.push(`${x}px ${y}px ${blur} rgba(255,255,255,${opacity})`);
    }
    canvas.style.boxShadow = shadows.join(',');

    let rafId: number;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > -200 && rect.top < vh + 200) {
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 80;
        canvas.style.transform = `translateY(${offset}px)`;
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Box
      ref={canvasRef}
      position="absolute"
      top="-20%"
      left={0}
      width="1px"
      height="1px"
      zIndex={1}
      pointerEvents="none"
      css={{
        animation: 'twinkleField 8s ease-in-out infinite',
        '@keyframes twinkleField': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
      }}
    />
  );
}
