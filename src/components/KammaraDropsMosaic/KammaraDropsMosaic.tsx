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
  /** World id (e.g. 'lunnp1') — clicking the tile opens this world. */
  worldId: string;
  /** World display name (e.g. 'ORF-V') — shown as the origin stamp. */
  worldName: string;
  /** Kalún crest glyph of the world — shown with the name. */
  crestGlyph: string;
}

export interface KammaraDropsMosaicProps {
  /** Curated clips (from kammara_mosaic.json). */
  clips: MosaicClip[];
  /** Accent color (palette.colors[0]) — drives borders/glow. */
  color: string;
  /**
   * Called with the clip's worldId when a tile is clicked — wire it to the
   * page's filter (setActiveFilter) so the tile opens its world, since there
   * are no per-world routes.
   */
  onSelectWorld?: (worldId: string) => void;
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
const MOSAIC_COLUMNS: Record<string, string> = {
  base: '1fr',
  sm: '1fr 1fr',
  md: '1fr',
  lg: '1fr 1fr',
  '2xl': 'repeat(3, 1fr)',
  '3xl': 'repeat(4, 1fr)',
};

export function KammaraDropsMosaic({
  clips,
  color,
  onSelectWorld,
  'data-testid': testId,
}: KammaraDropsMosaicProps) {
  if (clips.length === 0) return null;
  return (
    <Grid
      data-testid={testId ?? 'kammara-drops-mosaic'}
      // 2 cols by default; 1 col in the md band (768–991); 2 cols from lg; and
      // 3 cols on very wide screens (3xl = 1920+) so the videos don't stretch
      // huge — more columns keeps each clip a sane size. (Typed Record because
      // Chakra's grid prop union doesn't include the 3xl breakpoint.)
      gridTemplateColumns={MOSAIC_COLUMNS}
      gap={{ base: 'sm', md: 'md' }}
      width="100%"
      // Center the mosaic (matters on the wide 3xl grid where it's capped).
      marginX="auto"
      // Breathing room around the whole mosaic so the clips don't touch the
      // edge of the side slot — just padding, no border.
      padding={{ base: 'md', md: 'lg' }}
      css={{
        // Ultra-wide monitors (3440px etc.): cap the whole mosaic's width and
        // center it, so the 4-column grid fills a sane area instead of
        // stretching each clip until the 16:9 cover crops it. The grid stays
        // symmetric — no big empty gap.
        '@media (min-width: 2200px)': {
          maxWidth: '1800px',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      }}
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
        // How many clips show per breakpoint band (each entry overrides the
        // previous one as the screen widens):
        //  - base (0–479): first 6     - sm (480–767): all
        //  - md (768–991): first 5     - lg/xl: all
        //  - 2xl (1500–1919): first 9  - 3xl (≥1920): first 12 (4 cols × 3)
        const inBase = i < 4;
        const inMd = i < 5;
        const in2xl = i < 9;
        const in3xl = i < 12;
        const display = {
          base: inBase ? 'block' : 'none',
          sm: 'block',
          md: inMd ? 'block' : 'none',
          lg: 'block',
          '2xl': in2xl ? 'block' : 'none',
          '3xl': in3xl ? 'block' : 'none',
        };
        // Clicking opens the clip's world (no per-world routes, so we drive the
        // page filter). Falls back to a plain box if no handler is provided.
        return onSelectWorld ? (
          <chakra.button
            key={`${clip.video}-${i}`}
            type="button"
            onClick={() => onSelectWorld(clip.worldId)}
            aria-label={`Abrir ${clip.worldName}`}
            display={display}
            position="relative"
            width="100%"
            aspectRatio="16 / 9"
            borderRadius="14px"
            overflow="hidden"
            cursor="pointer"
            css={sharedCss}
          >
            {tile}
          </chakra.button>
        ) : (
          <Box
            key={`${clip.video}-${i}`}
            display={display}
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
