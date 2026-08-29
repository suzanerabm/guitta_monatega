'use client';
import { Box, Text } from '@chakra-ui/react';

export interface KammaraStatBadgeProps {
  /** Small label / tag title (e.g. "Habitantes"). */
  label: string;
  /** Value (e.g. "Shal'ún"). */
  value: string;
  /** Accent color of the world (palette.colors[0]). */
  color: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  'data-testid'?: string;
}

/**
 * KammaraStatBadge — a single fact "tag" for a Kammara world card. Everything
 * sits inside one chip: a tiny bold uppercase title (accent) over the value
 * (white, uppercase, regular weight).
 */
export function KammaraStatBadge({
  label,
  value,
  color,
  darkColor,
  'data-testid': testId,
}: KammaraStatBadgeProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-stat-badge'}
      borderRadius="10px"
      paddingX="0.9rem"
      paddingY="0.4rem"
      css={{
        background: `${darkColor}cc`,
        boxShadow: `inset 0 0 0 1px ${color}55`,
      }}
    >
      {/* Tag title: tiny, bold, wide-tracked, accent */}
      <Text
        textStyle="heading"
        m={0}
        textTransform="uppercase"
        color={color}
        opacity={0.85}
        css={{ fontSize: '0.48rem', letterSpacing: '0.3em' }}
      >
        {label}
      </Text>
      {/* Tag value: white, uppercase, regular weight */}
      <Text
        textStyle="heading"
        m={0}
        textTransform="uppercase"
        color="textOverlayBright"
        lineHeight={1.25}
        css={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}
      >
        {value}
      </Text>
    </Box>
  );
}
