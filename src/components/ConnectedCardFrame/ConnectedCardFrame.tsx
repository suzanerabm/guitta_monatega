import type { ReactNode, TouchEventHandler } from 'react';
import { Box } from '@chakra-ui/react';

interface ConnectedCardFrameProps {
  children: ReactNode;
  colors: readonly string[];
  negativeBackground: string;
  mobileAspectRatio?: string;
  onTouchStart?: TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: TouchEventHandler<HTMLDivElement>;
}

/**
 * Shared four-card frame used by the home universe banners. The outer edge
 * follows the canonical Kammara outline/negative/body construction, while
 * internal edges remain square so the four cards read as one connected unit.
 */
export function ConnectedCardFrame({
  children,
  colors,
  negativeBackground,
  mobileAspectRatio = '1 / 1',
  onTouchStart,
  onTouchEnd,
}: ConnectedCardFrameProps) {
  const desktopOutline = `linear-gradient(90deg, ${colors
    .map((color, index) => `${color} ${index * 25}% ${(index + 1) * 25}%`)
    .join(', ')})`;
  const mobileOutline = `conic-gradient(from -45deg, ${colors[1]} 0 25%, ${colors[3]} 25% 50%, ${colors[2]} 50% 75%, ${colors[0]} 75% 100%)`;

  return (
    <Box
      width="homeBannerCardsWidth"
      marginX="auto"
      padding="homePlanetOutlineWidth"
      borderRadius="homePlanetOutline"
      background={{ base: mobileOutline, md: desktopOutline }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Box
        borderRadius="homePlanetCompact"
        background={negativeBackground}
        padding="homePlanetFrameOffset"
      >
        <Box
          display="grid"
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          aspectRatio={{ base: mobileAspectRatio, md: '3 / 1' }}
          borderRadius="homePlanetCompact"
          overflow="hidden"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
