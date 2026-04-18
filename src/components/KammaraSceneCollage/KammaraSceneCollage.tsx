'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useModal } from '@/components/Modal';

export interface KammaraSceneCollageScene {
  name: string;
  image: string;
}

export interface KammaraSceneCollageProps {
  scenes: KammaraSceneCollageScene[];
  /**
   * Accent color of the world (usually palette.colors[0]). Drives the
   * hover ring and glow of each tile + the frame HUD corners.
   */
  color: string;
  /**
   * Dark base color of the world (palette.dark). Drives the translucent
   * background gradient of the frame. Falls back to `#0a0a0a` if omitted.
   */
  darkColor?: string;
  /** Gradient used as the modal background (usually palette.gradientBg). */
  modalBg?: string;
  modalTitle?: string;
  modalSubtitle?: string;
  /** Crest glyph shown as watermark in the Kammara modal. */
  crestGlyph?: string;
  /** Text color for the Kammara modal (palette.text). */
  modalTextColor?: string;
  galleryId?: string;
  'data-testid'?: string;
}

/**
 * 6-column asymmetric grid — Apple-style editorial rhythm cycling every 5
 * tiles so any number of scenes lays out predictably (and overflow just
 * keeps going, driving the internal scroll):
 *
 *   row 1: hero tile (full width)
 *   row 2: 4 / 2 split
 *   row 3: 2 / 4 split (mirrored)
 *   ... then repeat.
 *
 * Each tile declares its Ken Burns animation:
 *   - kb: which keyframe (one of `kb-1`..`kb-4`)
 *   - dur: duration in seconds (varying so they go out of phase)
 */
interface Tile {
  colSpan: number;
  rowSpan: number;
  kb: 'kb-1' | 'kb-2' | 'kb-3' | 'kb-4';
  dur: number;
}

const TILE_PATTERN: Tile[] = [
  { colSpan: 6, rowSpan: 2, kb: 'kb-1', dur: 22 },
  { colSpan: 4, rowSpan: 2, kb: 'kb-2', dur: 19 },
  { colSpan: 2, rowSpan: 2, kb: 'kb-3', dur: 16 },
  { colSpan: 2, rowSpan: 2, kb: 'kb-4', dur: 18 },
  { colSpan: 4, rowSpan: 2, kb: 'kb-1', dur: 24 },
];

function tileForIndex(i: number): Tile {
  return TILE_PATTERN[i % TILE_PATTERN.length];
}

// Ken Burns keyframes — zoom + pan in different directions so no two
// tiles move the same way at the same time. alternate direction makes
// it loop back without a cut.
//
// We inject this into <head> once (via useEffect) instead of rendering
// a <style> inside the component. That guarantees the keyframes exist
// by the time the first paint references them — a <style> in JSX
// sometimes loses to the browser's paint order, leaving `animation:
// ksc-kb-1 ...` pointing at a name that's not yet defined.
const KEYFRAMES = `
@keyframes ksc-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes ksc-kb-1 {
  0%   { transform: scale(1.08) translate(0%, 0%); }
  100% { transform: scale(1.18) translate(-3%, -2%); }
}
@keyframes ksc-kb-2 {
  0%   { transform: scale(1.10) translate(-2%, 0%); }
  100% { transform: scale(1.20) translate(2%,  -3%); }
}
@keyframes ksc-kb-3 {
  0%   { transform: scale(1.12) translate(1%, -1%); }
  100% { transform: scale(1.22) translate(-2%,  2%); }
}
@keyframes ksc-kb-4 {
  0%   { transform: scale(1.08) translate(0%,  1%); }
  100% { transform: scale(1.18) translate(3%, -2%); }
}
@keyframes ksc-skeleton {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
`;
const STYLE_ID = 'ksc-keyframes';

function useEnsureKeyframes() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = KEYFRAMES;
    document.head.appendChild(el);
  }, []);
}

// ---------------------------------------------------------------------------
// Desktop tile with its own load state so we can show a skeleton shimmer
// inside the cell while the image is still fetching. Replaces a static
// placeholder and keeps the layout stable (no pop-in / no jank).
// ---------------------------------------------------------------------------
interface DesktopTileProps {
  scene: KammaraSceneCollageScene;
  tile: Tile;
  color: string;
  index: number;
  onClick: () => void;
}

function DesktopTile({ scene, tile, color, index, onClick }: DesktopTileProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images don't fire onLoad if the <img> mounts after load.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <Box
      as="button"
      className="ksc-tile"
      aria-label={scene.name}
      onClick={onClick}
      css={{
        gridColumn: `span ${tile.colSpan}`,
        gridRow: `span ${tile.rowSpan}`,
        position: 'relative',
        padding: 0,
        border: 'none',
        borderRadius: 0,
        overflow: 'hidden',
        background: '#000',
        cursor: 'pointer',
        transition:
          'opacity 0.35s ease, filter 0.35s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease, z-index 0s linear 0.4s',
        boxShadow: `0 6px 16px rgba(0,0,0,0.4)`,
        animation: `ksc-fade-in 0.55s ease-out ${index * 80}ms both`,
        zIndex: 1,
        '&:hover, &:focus-visible': {
          transform: 'scale(1.04)',
          boxShadow: `0 14px 32px rgba(0,0,0,0.6), 0 0 0 1px ${color}, 0 0 32px ${color}80`,
          zIndex: 5,
          transition:
            'opacity 0.35s ease, filter 0.35s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease, z-index 0s linear 0s',
        },
        '&:focus-visible': { outline: 'none' },
        '&:hover .ksc-img, &:focus-visible .ksc-img': {
          animationPlayState: 'paused',
        },
      }}
    >
      {/* Skeleton shimmer — visible until the image decodes, then fades out */}
      <Box
        aria-hidden="true"
        css={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${color}10 0%, ${color}22 50%, ${color}10 100%)`,
          backgroundSize: '200% 100%',
          animation: 'ksc-skeleton 1.6s ease-in-out infinite',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.45s ease',
          pointerEvents: 'none',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={scene.image}
        alt={scene.name}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className="ksc-img"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.45s ease',
          animation: `ksc-${tile.kb} ${tile.dur}s ease-in-out ${index * 0.6}s infinite alternate`,
          willChange: 'transform',
        }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Mobile tile — same skeleton pattern but in a simple stack layout.
// ---------------------------------------------------------------------------
interface MobileTileProps {
  scene: KammaraSceneCollageScene;
  color: string;
  onClick: () => void;
}

function MobileTile({ scene, color, onClick }: MobileTileProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images don't fire `onLoad` if the <img> mounts after the load
  // completed (Safari and Firefox in particular). Check `complete` on
  // mount and flip to loaded immediately so the tile never stays black.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <Box
      as="button"
      aria-label={scene.name}
      onClick={onClick}
      css={{
        position: 'relative',
        padding: 0,
        width: '100%',
        aspectRatio: '16 / 9',
        border: 'none',
        borderRadius: 0,
        overflow: 'hidden',
        background: '#000',
        cursor: 'pointer',
        boxShadow: `0 4px 12px rgba(0,0,0,0.35)`,
      }}
    >
      <Box
        aria-hidden="true"
        css={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${color}10 0%, ${color}22 50%, ${color}10 100%)`,
          backgroundSize: '200% 100%',
          animation: 'ksc-skeleton 1.6s ease-in-out infinite',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.45s ease',
          pointerEvents: 'none',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={scene.image}
        alt={scene.name}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.45s ease',
        }}
      />
    </Box>
  );
}

/**
 * KammaraSceneCollage — living editorial mosaic.
 *
 * Designed to sit inside DSMainCard's `stripSide` slot (the column next
 * to the planet text panel). Visuals:
 *
 *  - 6-column asymmetric grid with Apple-style editorial rhythm
 *    (hero row + 4/2 + 2/4).
 *  - Each image runs a Ken Burns animation on loop — subtle zoom + pan,
 *    varying direction and duration so the mosaic always feels alive
 *    without any tile "stealing" attention.
 *  - Hover brings the focused tile forward (scale + glow of `color`)
 *    and slightly dims + blurs the rest — coverflow-style depth. Ken
 *    Burns pauses on the hovered tile so the image reads sharp.
 *  - Click opens the modal via `useModal` (same contract as SceneStrip).
 *  - Mobile: vertical stack, each tile 16:9 (no Ken Burns — phones
 *    don't benefit from the extra motion, and the stack already reads
 *    one-at-a-time).
 *
 * Up to 5 scenes are shown; extras are ignored.
 */
export function KammaraSceneCollage({
  scenes,
  color,
  darkColor = '#0a0a0a',
  modalBg,
  modalTitle,
  modalSubtitle,
  crestGlyph,
  modalTextColor,
  galleryId,
  'data-testid': testId,
}: KammaraSceneCollageProps) {
  useEnsureKeyframes();
  const fallbackId = useId();
  const id = galleryId ?? `kammara-scene-collage-${fallbackId}`;
  const { registerGallery, openKammaraGallery } = useModal();

  useEffect(() => {
    registerGallery(
      id,
      scenes.map((s) => s.image),
      scenes.map((s) => s.name),
    );
  }, [id, scenes, registerGallery]);

  const handleClick = (index: number) => {
    openKammaraGallery({
      galleryId: id,
      startIndex: index,
      color,
      darkColor,
      textColor: modalTextColor,
      crestGlyph,
      heroTitle: modalTitle,
      heroText: modalSubtitle,
    });
  };

  return (
    <Box
      data-testid={testId ?? 'kammara-scene-collage'}
      position="relative"
      width="100%"
      height="100%"
      minH={0}
    >
      {/* ── Desktop frame ─────────────────────────────────────────────
          Sits behind the KammaraCard (planet text panel) — `top/bottom`
          line up with the KammaraCard's 32px border-radius so the frame
          begins exactly where the card's curve becomes straight, and
          `left: -24px` slides the frame under the card so it looks like
          it's "coming out from behind it". Frame visuals match the
          KammaraCharacterGallery kit (translucent gradient + HUD corner
          decorations) minus the scanlines — the scenes are the hero. */}
      <Box
        display={{ base: 'none', md: 'block' }}
        css={{
          position: 'absolute',
          top: '32px',
          bottom: '32px',
          left: '-24px',
          right: 0,
          borderRadius: '20px',
          background: `linear-gradient(160deg, ${darkColor}33 0%, ${darkColor}26 50%, ${darkColor}33 100%)`,
          boxShadow: `0 20px 60px ${color}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
          zIndex: 0,
        }}
      >
        {/* HUD corner decorations (TL, TR, BL, BR) */}
        {[
          { top: '-4px', left: '-4px', borderTop: '2px', borderLeft: '2px' },
          { top: '-4px', right: '-4px', borderTop: '2px', borderRight: '2px' },
          { bottom: '-4px', left: '-4px', borderBottom: '2px', borderLeft: '2px' },
          { bottom: '-4px', right: '-4px', borderBottom: '2px', borderRight: '2px' },
        ].map((pos, i) => (
          <Box
            key={i}
            aria-hidden="true"
            css={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              top: pos.top,
              left: pos.left,
              right: pos.right,
              bottom: pos.bottom,
              borderTopWidth: pos.borderTop,
              borderLeftWidth: pos.borderLeft,
              borderRightWidth: pos.borderRight,
              borderBottomWidth: pos.borderBottom,
              borderStyle: 'solid',
              borderColor: color,
              boxShadow: `0 0 8px ${color}80`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Desktop mosaic — no internal scroll. If the user wants to see
            a specific scene they click it and the modal opens, so the
            inner scroll was redundant and fought with the page scroll. */}
        <Box
          position="absolute"
          top="16px"
          bottom="16px"
          left="16px"
          right="16px"
          overflow="hidden"
          display="grid"
          css={{
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridAutoRows: 'minmax(80px, 1fr)',
            gap: '10px',
            '&:has(.ksc-tile:hover) .ksc-tile:not(:hover)': {
              opacity: 0.45,
              filter: 'blur(1px)',
            },
            '&:has(.ksc-tile:focus-visible) .ksc-tile:not(:focus-visible)': {
              opacity: 0.45,
              filter: 'blur(1px)',
            },
          }}
        >
          {scenes.map((scene, i) => (
            <DesktopTile
              key={`${scene.image}-${i}`}
              scene={scene}
              tile={tileForIndex(i)}
              color={color}
              index={i}
              onClick={() => handleClick(i)}
            />
          ))}
        </Box>
      </Box>

      {/* Mobile: horizontal scroll-snap — one scene at a time, swipe to
          see the next. A vertical stack felt like an endless list of
          random photos; the swipe strip mirrors what the character
          gallery does on mobile and keeps the section compact. */}
      <Box
        display={{ base: 'block', md: 'none' }}
        width="100%"
        css={{
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          padding: '8px 24px',
          scrollPadding: '0 24px',
        }}
      >
        <Box
          display="flex"
          css={{
            gap: '16px',
            width: 'max-content',
          }}
        >
          {scenes.map((scene, i) => (
            <Box
              key={`${scene.image}-mobile-${i}`}
              css={{
                flex: '0 0 82vw',
                maxWidth: '82vw',
                scrollSnapAlign: 'center',
              }}
            >
              <MobileTile
                scene={scene}
                color={color}
                onClick={() => handleClick(i)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
