import { Box } from '@chakra-ui/react';

interface GradientLineProps { color: string; width?: string }

export function GradientLine({ color, width = '100%' }: GradientLineProps) {
  return <Box aria-hidden="true" width={width} height="1px" css={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />;
}
