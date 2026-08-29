'use client';
import { Box, Grid, Text, chakra } from '@chakra-ui/react';

export interface WorldPortal {
  /** World id used by the filter (e.g. 'orfv'). */
  id: string;
  /** Display name (e.g. 'ORF-V'). */
  name: string;
  /** Accent color of the world (palette.colors[0]). */
  color: string;
  /** Dark base color (palette.dark). */
  darkColor: string;
  /** Background image for the portal. */
  image?: string;
}

export interface KammaraWorldPortalsProps {
  /** One entry per world, already resolved (name/color/image). */
  portals: WorldPortal[];
  /** Called with the world id when a portal is clicked. */
  onSelect: (id: string) => void;
  'data-testid'?: string;
}

/**
 * KammaraWorldPortals — the heart of the universe landing: a grid of clickable
 * cards, one per world. Each card carries the world's own color + image, so the
 * grid reads as a "select a world" menu. Clicking calls `onSelect(id)` — the
 * parent wires that to the existing filter that mounts that world's section.
 */
export function KammaraWorldPortals({
  portals,
  onSelect,
  'data-testid': testId,
}: KammaraWorldPortalsProps) {
  return (
    <Grid
      data-testid={testId ?? 'kammara-world-portals'}
      gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }}
      gap={{ base: 'md', md: 'lg' }}
      width="100%"
    >
      {portals.map((p) => (
        <chakra.button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          data-testid={`world-portal-${p.id}`}
          position="relative"
          width="100%"
          aspectRatio="4 / 3"
          borderRadius="20px"
          overflow="hidden"
          cursor="pointer"
          textAlign="left"
          css={{
            background: p.image
              ? `linear-gradient(160deg, ${p.darkColor}cc, ${p.color}55), url(${p.image}) center/cover`
              : `linear-gradient(160deg, ${p.darkColor}, ${p.color})`,
            border: `1px solid ${p.color}55`,
            boxShadow: `0 12px 32px ${p.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: `0 20px 48px ${p.color}50`,
          }}
        >
          <Box position="absolute" left="1rem" bottom="1rem">
            <Text
              m={0}
              textStyle="heading"
              fontSize="2xl"
              letterSpacing="heroTitle"
              color="textOverlayBright"
              css={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            >
              {p.name}
            </Text>
          </Box>
        </chakra.button>
      ))}
    </Grid>
  );
}
