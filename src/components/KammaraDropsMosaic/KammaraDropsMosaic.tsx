'use client';
import { Box, Grid, chakra } from '@chakra-ui/react';
import { LazyVideo } from '@/components/LazyVideo';
import { KammaraWatermark } from '@/components/KammaraWatermark';

export interface MosaicClip {
  /** Video src (.mp4). The .webm sibling is offered automatically by LazyVideo. */
  video: string;
  /** Poster image — the still shown until the clip plays. */
  poster: string;
  /** Caption (used as alt text). */
  label: string;
  /** World display name (e.g. 'ORF-V') — shown as the origin stamp. */
  worldName: string;
  /** Kalún crest glyph of the world — shown with the name. */
  crestGlyph: string;
  /** Optional link: when set, the tile becomes a clickable anchor. */
  href?: string;
}

export interface KammaraDropsMosaicProps {
  /** Curated clips (from kammara_mosaic.json). */
  clips: MosaicClip[];
  /** Accent color (palette.colors[0]) — drives borders/glow. */
  color: string;
  'data-testid'?: string;
}

/**
 * KammaraDropsMosaic — a compact grid of looping clips for the side slot of the
 * Kammara intro. Each tile is a LazyVideo in `visible` mode, so only the tiles
 * on screen ever play/download — keeping the page light (same contract as the
 * drops strip). Curated via src/data/kammara_mosaic.json.
 *
 * Each clip carries its world's origin stamp (KammaraWatermark, bottom-right)
 * and an optional `href` that turns the tile into a link.
 */
// More clips (columns) on bigger screens instead of bigger videos. md (768)
// stays single-column like 480 — two columns there looked bad. Kept as a typed
// Record so the 3xl breakpoint (not in Chakra's grid prop union) type-checks.
const MOSAIC_COLUMNS: Record<string, string> = {
  base: '1fr',
  lg: '1fr 1fr',
  '2xl': 'repeat(3, 1fr)',
  '3xl': 'repeat(4, 1fr)',
};

export function KammaraDropsMosaic({
  clips,
  color,
  'data-testid': testId,
}: KammaraDropsMosaicProps) {
  if (clips.length === 0) return null;
  return (
    <Grid
      data-testid={testId ?? 'kammara-drops-mosaic'}
      gridTemplateColumns={MOSAIC_COLUMNS}
      gap={{ base: 'sm', md: 'md' }}
      // Keep the mosaic inside its slot — width:100% + minW:0 stops it from
      // overflowing the column on wide screens.
      width="100%"
      minWidth={0}
      maxWidth="100%"
      // Breathing room around the whole mosaic so the clips don't touch the
      // edge of the side slot — just padding, no border.
      padding={{ base: 'md', md: 'lg' }}
    >
      {clips.map((clip, i) => {
        const tile = (
          <>
            <LazyVideo
              src={clip.video}
              poster={clip.poster}
              alt={clip.label}
              fit="cover"
              playOn="visible"
            />
            {/* Origin stamp: world glyph + name, bottom-right (same component
                as the drop cards). */}
            <KammaraWatermark
              crestGlyph={clip.crestGlyph}
              worldName={clip.worldName}
              size="card"
            />
          </>
        );
        const sharedCss = {
          boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 24px rgba(0,0,0,0.35)`,
        } as const;
        // Linkable tile becomes an anchor; otherwise a plain box.
        return clip.href ? (
          <chakra.a
            key={`${clip.video}-${i}`}
            href={clip.href}
            position="relative"
            display="block"
            width="100%"
            aspectRatio="16 / 9"
            borderRadius="14px"
            overflow="hidden"
            cursor="pointer"
            css={sharedCss}
          >
            {tile}
          </chakra.a>
        ) : (
          <Box
            key={`${clip.video}-${i}`}
            position="relative"
            width="100%"
            aspectRatio="16 / 9"
            borderRadius="14px"
            overflow="hidden"
            css={sharedCss}
          >
            {tile}
          </Box>
        );
      })}
    </Grid>
  );
}
