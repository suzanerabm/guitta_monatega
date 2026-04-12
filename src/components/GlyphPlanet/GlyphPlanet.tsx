import { Box } from '@chakra-ui/react';

interface GlyphPlanetProps {
  size?: 'h1' | 'h2' | 'h3';
  color?: string;
  rotate?: boolean;
  /** When true, the glyph stretches to fill the parent height (lines grow via flex:1) */
  stretch?: boolean;
  /** 'planet' = — ⊙ — (default), 'universe' = ⊹ ⊙ ⊹ */
  variant?: 'planet' | 'universe';
}

const sizeMap = {
  h1: 'glyphH1',
  h2: 'glyphH2',
  h3: 'glyphH3',
} as const;

export function GlyphPlanet({
  size = 'h3',
  color = 'glyphIdle',
  rotate = true,
  stretch = false,
  variant = 'planet',
}: GlyphPlanetProps) {
  const fontSize = sizeMap[size];
  const line = variant === 'universe' ? '⊹' : '—';
  const lineStyle = stretch
    ? { flex: '1 1 0', minHeight: 0, borderLeft: '1px solid currentColor' }
    : {};

  if (stretch) {
    const stretchLine = variant === 'universe'
      ? { flex: '1 1 0', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--chakra-fonts-glyph)', fontSize: 'var(--chakra-font-sizes-glyph-h3)' }
      : { flex: '1 1 0', minHeight: 0, borderLeft: '1px solid currentColor' };

    return (
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        flexDirection="column"
        gap="0"
        color={color}
        lineHeight={1}
        flexShrink={0}
        height="100%"
      >
        <Box as="span" css={stretchLine}>{variant === 'universe' ? '⊹' : ''}</Box>
        <Box as="span" fontFamily="glyph" fontSize={fontSize} lineHeight={1} flexShrink={0}>⊙</Box>
        <Box as="span" css={stretchLine}>{variant === 'universe' ? '⊹' : ''}</Box>
      </Box>
    );
  }

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="0"
      transform={rotate ? 'rotate(90deg)' : 'none'}
      color={color}
      lineHeight={1}
      flexShrink={0}
    >
      <Box as="span" fontFamily="glyph" fontSize={fontSize} lineHeight={1}>{line}</Box>
      <Box as="span" fontFamily="glyph" fontSize={fontSize} lineHeight={1}>⊙</Box>
      <Box as="span" fontFamily="glyph" fontSize={fontSize} lineHeight={1}>{line}</Box>
    </Box>
  );
}
