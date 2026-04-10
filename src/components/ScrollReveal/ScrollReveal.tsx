'use client';
import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({ children, threshold, once }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useScrollReveal(ref, { threshold, once });

  return (
    <Box
      ref={ref}
      opacity={isVisible ? 1 : 0}
      transform={isVisible ? 'translateY(0)' : 'translateY(10px)'}
      transition="opacity 0.7s ease, transform 0.7s ease"
    >
      {children}
    </Box>
  );
}
