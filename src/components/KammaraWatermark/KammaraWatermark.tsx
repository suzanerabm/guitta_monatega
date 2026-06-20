'use client';
import { Flex, Box } from '@chakra-ui/react';

export interface KammaraWatermarkProps {
  /** Kalún crest glyph of the world. */
  crestGlyph: string;
  /** World display name (e.g. "ORF-V"). */
  worldName: string;
  /**
   * Visual scale. `card` is the compact stamp used on strip cards; `modal`
   * is slightly larger for the full-screen viewer. Defaults to `card`.
   */
  size?: 'card' | 'modal';
  /**
   * Where the stamp sits over the media. `corner` (default) pins it to the
   * bottom-right — good for cards, where the media fills the box. `center`
   * floats it in the middle, used in the modal where the image is letterboxed
   * (a corner stamp would land on the empty bars, not on the photo).
   */
  placement?: 'corner' | 'center';
}

const SIZES = {
  card: { glyph: '13px', text: '10px', gap: '5px', bottom: '6px', right: '10px' },
  modal: { glyph: '16px', text: '12px', gap: '6px', bottom: '14px', right: '18px' },
} as const;

/**
 * KammaraWatermark — a crest + world-name stamp painted over Kammara media
 * (strip cards, modal videos, modal images). It does NOT prevent downloads
 * (impossible on a public site), but baked over every frame it marks a ripped
 * clip or image with its origin. Always non-interactive so it never blocks the
 * media's own controls or the card click.
 */
export function KammaraWatermark({
  crestGlyph,
  worldName,
  size = 'card',
  placement = 'corner',
}: KammaraWatermarkProps) {
  const s = SIZES[size];
  const isCenter = placement === 'center';
  // `center` keeps the same bottom height as the corner stamp, but centers
  // horizontally (bottom-center) — vertical-center would float over the photo.
  const pos = isCenter
    ? { bottom: s.bottom, left: '50%' }
    : { bottom: s.bottom, right: s.right };
  return (
    <Flex
      position="absolute"
      {...pos}
      align="center"
      gap={s.gap}
      zIndex={2}
      pointerEvents="none"
      css={{
        // Centered stamp overlays the whole photo, so it's fainter to avoid
        // obscuring it; the corner stamp can be a touch stronger.
        opacity: isCenter ? 0.4 : 0.55,
        // `screen` blends nicely over the dark corner of a card, but on a
        // centered stamp it can vanish over light areas (white in `screen`
        // reads as transparent). There we drop the blend and lean on a strong
        // outline shadow so the mark stays readable over any photo.
        mixBlendMode: isCenter ? 'normal' : 'screen',
        textShadow: isCenter
          ? '0 0 6px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)'
          : '0 1px 4px rgba(0,0,0,0.7)',
        userSelect: 'none',
        ...(isCenter ? { transform: 'translateX(-50%)' } : {}),
      }}
    >
      {/* Glyph + label match the KAMMARA card footer: glyph font for the
          crest, body font + `hero` tracking + bold uppercase for the name. */}
      <Box as="span" fontFamily="glyph" fontSize={s.glyph} lineHeight={1} color="textOverlayBright">
        {crestGlyph}
      </Box>
      <Box
        as="span"
        fontFamily="body"
        fontSize={s.text}
        letterSpacing="hero"
        textTransform="uppercase"
        fontWeight="bold"
        color="textOverlayBright"
      >
        {worldName}
      </Box>
    </Flex>
  );
}
