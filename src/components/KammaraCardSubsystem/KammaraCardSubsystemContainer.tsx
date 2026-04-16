'use client';
import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface KammaraCardSubsystemContainerProps {
  children: ReactNode;
  /** Override the top margin (useful when stacking the container close to a previous section). */
  mt?: string | number;
  /** Override the bottom margin. */
  mb?: string | number;
  'data-testid'?: string;
}

/**
 * KammaraCardSubsystemContainer — Responsive size/spacing wrapper for the
 * KammaraCardSubsystem card. Controls maxWidth, height and lateral padding
 * across breakpoints so the card keeps TCG-card proportions at any viewport.
 *
 * Single source of truth: tweak sizes/spacing here and every place that
 * renders a KammaraCardSubsystem follows.
 */
export function KammaraCardSubsystemContainer({
  children,
  mt,
  mb,
  'data-testid': testId,
}: KammaraCardSubsystemContainerProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-card-subsystem-container'}
      width="100%"
      mx="auto"
      // Must stay visible — the roulette orbits outside the card's left edge.
      overflow="visible"
      // Responsive size — TCG-card proportions
      maxWidth={{ base: '100%', sm: '440px', md: '480px', '2xl': '520px' }}
      height={{ base: '560px', sm: '620px', md: '680px', '2xl': '720px' }}
      // Breathing room above and below the card
      mt={mt ?? { base: 'xl', md: '2xl' }}
      mb={mb ?? { base: 'xl', md: '2xl' }}
      // Lateral padding only on mobile so the card doesn't hug the screen edges.
      // On mobile we give extra left padding so the roulette doesn't fall off-screen.
      pl={{ base: '80px', sm: 0 }}
      pr={{ base: 'lg', sm: 0 }}
    >
      {children}
    </Box>
  );
}
