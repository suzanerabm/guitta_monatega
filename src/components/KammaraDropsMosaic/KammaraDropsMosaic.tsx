'use client';
import { Box, Grid } from '@chakra-ui/react';
import { LazyVideo } from '@/components/LazyVideo';

export interface MosaicClip {
  /** Video src (.mp4). The .webm sibling is offered automatically by LazyVideo. */
  video: string;
  /** Poster image — the still shown until the clip plays. */
  poster: string;
  /** Caption (used as alt text). */
  label: string;
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
 */
export function KammaraDropsMosaic({
  clips,
  color,
  'data-testid': testId,
}: KammaraDropsMosaicProps) {
  if (clips.length === 0) return null;
  return (
    <Grid
      data-testid={testId ?? 'kammara-drops-mosaic'}
      gridTemplateColumns="1fr 1fr"
      gap={{ base: 'sm', md: 'md' }}
      width="100%"
    >
      {clips.map((clip, i) => (
        <Box
          key={`${clip.video}-${i}`}
          position="relative"
          width="100%"
          aspectRatio="16 / 9"
          borderRadius="14px"
          overflow="hidden"
          css={{
            boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 24px rgba(0,0,0,0.35)`,
          }}
        >
          <LazyVideo
            src={clip.video}
            poster={clip.poster}
            alt={clip.label}
            fit="cover"
            playOn="visible"
          />
        </Box>
      ))}
    </Grid>
  );
}
